import { exec } from 'child_process';
import util from 'util';
import { createLogger } from '../utils/logger.js';

const execAsync = util.promisify(exec);
const logger = createLogger('systemUserController');

const USER_GROUP = 'cosmicusers';
const USER_GROUP_ID = 2000; // Starting GID for cosmic users

class SystemUserController {
    async ensureUserGroup() {
        try {
            // Check if group exists
            try {
                await execAsync(`getent group ${USER_GROUP}`);
                logger.info(`Group ${USER_GROUP} already exists`);
            } catch (error) {
                // Group doesn't exist, create it
                logger.info(`Creating group ${USER_GROUP}`);
                await execAsync(`sudo groupadd -g ${USER_GROUP_ID} ${USER_GROUP}`);
            }
        } catch (error) {
            logger.error(`Failed to ensure user group: ${error.message}`);
            throw new Error('Failed to setup user group');
        }
    }

    async createSystemUser(req, res) {
        const { username, email } = req.body;

        try {
            logger.info(`Creating system user: ${username}`);

            // 1. Ensure cosmic users group exists
            await this.ensureUserGroup();

            // 2. Create Linux user with specific group
            await execAsync(`sudo useradd -m -g ${USER_GROUP} -s /bin/bash ${username}`);
            logger.info(`Created Linux user: ${username}`);

            // 3. Create mail directory structure
            const mailDir = `/home/${username}/Maildir`;
            await execAsync(`sudo mkdir -p ${mailDir}/{new,cur,tmp}`);
            await execAsync(`sudo chown -R ${username}:${USER_GROUP} ${mailDir}`);
            await execAsync(`sudo chmod -R 700 ${mailDir}`);
            logger.info(`Created mail directories for: ${username}`);

            // 4. Configure email
            const neomuttConfig = [
                `set realname = "${username}"`,
                `set from = "${email}"`,
                'set use_from = yes',
                'set envelope_from = yes',
                'set edit_headers = yes',
                `set folder = "${mailDir}"`,
                'set mbox_type = Maildir',
                'set spoolfile = +/new',
                'set record = +/sent',
                'set postponed = +/drafts',
                'set sort = threads',
                'set sort_aux = reverse-last-date-received'
            ].join('\n');

            await execAsync(`sudo -u ${username} bash -c 'echo "${neomuttConfig}" > /home/${username}/.neomuttrc'`);
            await execAsync(`sudo chmod 600 /home/${username}/.neomuttrc`);
            logger.info(`Configured neomutt for: ${username}`);

            // 5. Set up public directory
            await execAsync(`sudo mkdir -p /home/${username}/public`);
            await execAsync(`sudo chown ${username}:${USER_GROUP} /home/${username}/public`);
            await execAsync(`sudo chmod 755 /home/${username}/public`);
            logger.info(`Created public directory for: ${username}`);

            // 6. Set up restricted shell access
            await execAsync(`sudo chsh -s /bin/rbash ${username}`);
            logger.info(`Set restricted shell for: ${username}`);

            // 7. Configure user restrictions
            const bashrc = [
                'PATH=/usr/local/bin:/usr/bin',
                'export PATH',
                'set -r', // Make PATH read-only
                'umask 027', // Restrictive file permissions
                'alias sudo="echo Sorry, sudo access is not allowed"'
            ].join('\n');

            await execAsync(`sudo -u ${username} bash -c 'echo "${bashrc}" > /home/${username}/.bashrc'`);
            logger.info(`Configured user restrictions for: ${username}`);

            res.status(201).json({
                success: true,
                message: 'System user created successfully',
                data: {
                    username,
                    email,
                    group: USER_GROUP,
                    homeDir: `/home/${username}`,
                    mailDir: mailDir,
                    publicDir: `/home/${username}/public`
                }
            });

        } catch (error) {
            logger.error(`Error creating system user: ${error.message}`);
            
            // Attempt cleanup if user was partially created
            try {
                await execAsync(`sudo userdel -r ${username}`);
                logger.info(`Cleaned up failed user creation: ${username}`);
            } catch (cleanupError) {
                logger.error(`Cleanup failed for user ${username}: ${cleanupError.message}`);
            }

            res.status(500).json({
                success: false,
                message: 'Failed to create system user',
                error: error.message
            });
        }
    }

    async checkSystemUser(req, res) {
        const { username } = req.params;

        try {
            logger.info(`Checking system user: ${username}`);

            // Check if user exists and is in correct group
            const { stdout: userInfo } = await execAsync(`id ${username}`);
            const mailDir = `/home/${username}/Maildir`;
            
            // Check if user is in cosmic users group
            const isInGroup = userInfo.includes(`(${USER_GROUP})`);
            
            // Check mail directory
            const { stdout: mailDirInfo } = await execAsync(`sudo test -d ${mailDir} && echo "exists"`);
            
            res.json({
                success: true,
                exists: true,
                inCorrectGroup: isInGroup,
                maildir: mailDirInfo.trim() === 'exists',
                homeDir: `/home/${username}`,
                userInfo: userInfo
            });

        } catch (error) {
            // If user doesn't exist, id command will return non-zero
            if (error.code === 1) {
                return res.json({
                    success: true,
                    exists: false,
                    inCorrectGroup: false,
                    maildir: false
                });
            }

            logger.error(`Error checking system user: ${error.message}`);
            res.status(500).json({
                success: false,
                message: 'Error checking system user',
                error: error.message
            });
        }
    }

    async listSystemUsers(req, res) {
        try {
            logger.info('Listing cosmic system users');

            // Get all users in the cosmic users group
            const { stdout } = await execAsync(`getent group ${USER_GROUP} | cut -d: -f4`);
            const users = stdout.trim().split(',').filter(Boolean);

            // Get detailed information for each user
            const userDetails = await Promise.all(users.map(async (username) => {
                try {
                    const { stdout: userInfo } = await execAsync(`id ${username}`);
                    const { stdout: lastLogin } = await execAsync(`lastlog -u ${username} | tail -n 1`);
                    
                    return {
                        username,
                        userInfo,
                        lastLogin: lastLogin.trim(),
                        homeDir: `/home/${username}`,
                        mailDir: `/home/${username}/Maildir`
                    };
                } catch (error) {
                    logger.error(`Error getting details for user ${username}: ${error.message}`);
                    return null;
                }
            }));

            res.json({
                success: true,
                users: userDetails.filter(Boolean),
                totalUsers: userDetails.filter(Boolean).length
            });

        } catch (error) {
            logger.error(`Error listing system users: ${error.message}`);
            res.status(500).json({
                success: false,
                message: 'Error listing system users',
                error: error.message
            });
        }
    }

    async removeSystemUser(req, res) {
        const { username } = req.params;

        try {
            logger.info(`Removing system user: ${username}`);

            // Verify user is in cosmic users group
            const { stdout: userInfo } = await execAsync(`id ${username}`);
            if (!userInfo.includes(`(${USER_GROUP})`)) {
                return res.status(403).json({
                    success: false,
                    message: 'Cannot remove user: not a cosmic user'
                });
            }

            // Remove user and their home directory
            await execAsync(`sudo userdel -r ${username}`);

            res.json({
                success: true,
                message: 'System user removed successfully'
            });

        } catch (error) {
            logger.error(`Error removing system user: ${error.message}`);
            res.status(500).json({
                success: false,
                message: 'Failed to remove system user',
                error: error.message
            });
        }
    }
}

export default new SystemUserController();
