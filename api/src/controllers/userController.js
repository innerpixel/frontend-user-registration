import { promisify } from 'util';
import { exec } from 'child_process';
import fs from 'fs/promises';
import path from 'path';

const execAsync = promisify(exec);

export const createSystemUser = async (req, res) => {
    try {
        const { username, email } = req.body;
        
        // Validate input
        if (!username || !email) {
            return res.status(400).json({ error: 'Username and email are required' });
        }

        // Create system user
        await execAsync(`sudo useradd -m -s /bin/bash ${username}`);

        // Create mail directory structure
        const homeDir = `/home/${username}`;
        const mailDir = path.join(homeDir, 'Maildir');
        const publicDir = path.join(homeDir, 'public');

        // Create Maildir structure
        await execAsync(`sudo mkdir -p ${mailDir}/new ${mailDir}/cur ${mailDir}/tmp ${publicDir}`);

        // Set proper permissions
        await execAsync(`sudo chown -R ${username}:${username} ${homeDir}`);
        await execAsync(`sudo chmod 700 ${mailDir}`);
        await execAsync(`sudo chmod 755 ${publicDir}`);

        // Configure neomutt
        const neomuttConfig = `set folder = "~/Maildir"
set spoolfile = "+/new"
set record = "+/cur"
set postponed = "+/drafts"
set trash = "+/trash"
set mail_check = 0
set envelope_from
set sendmail = "/usr/sbin/sendmail -oem -oi"
set use_from = yes
set realname = "${username}"
set from = "${email}"`;

        // Write neomutt config using sudo tee
        await execAsync(`echo '${neomuttConfig}' | sudo tee ${path.join(homeDir, '.neomuttrc')} > /dev/null`);
        await execAsync(`sudo chown ${username}:${username} ${path.join(homeDir, '.neomuttrc')}`);

        res.status(201).json({
            message: 'System user created successfully',
            username,
            email,
            homeDir,
            mailDir
        });
    } catch (error) {
        console.error('Error creating system user:', error);
        res.status(500).json({ error: 'Failed to create system user' });
    }
};

export const getSystemStatus = async (req, res) => {
    try {
        const { username } = req.params;

        // Check if user exists
        try {
            await execAsync(`id ${username}`);
        } catch {
            return res.status(404).json({ error: 'User not found' });
        }

        // Check Maildir structure
        const homeDir = `/home/${username}`;
        const mailDir = path.join(homeDir, 'Maildir');
        
        try {
            await fs.access(mailDir);
            await fs.access(path.join(mailDir, 'new'));
            await fs.access(path.join(mailDir, 'cur'));
            await fs.access(path.join(mailDir, 'tmp'));
            
            res.json({
                status: 'active',
                username,
                homeDir,
                mailDir,
                message: 'System user and mail directories are properly configured'
            });
        } catch {
            res.json({
                status: 'incomplete',
                username,
                homeDir,
                message: 'Mail directories are not properly configured'
            });
        }
    } catch (error) {
        console.error('Error checking system status:', error);
        res.status(500).json({ error: 'Failed to check system status' });
    }
};
