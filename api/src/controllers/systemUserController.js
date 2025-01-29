import { exec } from 'child_process';
import util from 'util';
import { createLogger } from '../utils/logger.js';

const execAsync = util.promisify(exec);
const logger = createLogger('systemUserController');

class SystemUserController {
    async createSystemUser(req, res) {
        const { username, email } = req.body;

        try {
            logger.info(`Creating system user: ${username}`);

            // 1. Create Linux user
            await execAsync(`sudo useradd -m -s /bin/bash ${username}`);
            logger.info(`Created Linux user: ${username}`);

            // 2. Create mail directory structure
            const mailDir = `/home/${username}/Maildir`;
            await execAsync(`sudo mkdir -p ${mailDir}/{new,cur,tmp}`);
            await execAsync(`sudo chown -R ${username}:${username} ${mailDir}`);
            await execAsync(`sudo chmod -R 700 ${mailDir}`);
            logger.info(`Created mail directories for: ${username}`);

            // 3. Configure email
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

            // 4. Set up public directory
            await execAsync(`sudo mkdir -p /home/${username}/public`);
            await execAsync(`sudo chown ${username}:${username} /home/${username}/public`);
            await execAsync(`sudo chmod 755 /home/${username}/public`);
            logger.info(`Created public directory for: ${username}`);

            res.status(201).json({
                success: true,
                message: 'System user created successfully',
                data: {
                    username,
                    email,
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

            // Check if user exists
            const { stdout: userInfo } = await execAsync(`getent passwd ${username}`);
            const mailDir = `/home/${username}/Maildir`;
            
            // Check mail directory
            const { stdout: mailDirInfo } = await execAsync(`sudo test -d ${mailDir} && echo "exists"`);
            
            res.json({
                success: true,
                exists: true,
                maildir: mailDirInfo.trim() === 'exists',
                homeDir: userInfo.split(':')[5]
            });

        } catch (error) {
            // If user doesn't exist, getent will return non-zero
            if (error.code === 2) {
                return res.json({
                    success: true,
                    exists: false,
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

    async removeSystemUser(req, res) {
        const { username } = req.params;

        try {
            logger.info(`Removing system user: ${username}`);

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
