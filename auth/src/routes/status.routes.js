import express from 'express';
import User from '../models/user.js';
import statusService from '../services/statusService.js';
import { createLogger } from '../utils/logger.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();
const logger = createLogger('statusRoutes');

// Check username availability
router.get('/check-username/:username', async (req, res) => {
    try {
        const { username } = req.params;
        
        // Validate username format
        if (!/^[a-z][a-z0-9_-]{2,15}$/.test(username)) {
            return res.status(400).json({
                available: false,
                message: 'Invalid username format'
            });
        }
        
        const exists = await User.findOne({ username: username.toLowerCase() });
        
        res.json({
            available: !exists,
            message: exists ? 'Username is taken' : 'Username is available'
        });
    } catch (error) {
        logger.error('Error checking username:', error);
        res.status(500).json({ error: 'Error checking username availability' });
    }
});

// Get registration status
router.get('/registration/:username', async (req, res) => {
    try {
        const user = await User.findOne({ username: req.params.username });
        
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        
        res.json({
            status: user.registrationStatus,
            progress: statusService.getStatusProgress(user.registrationStatus),
            message: statusService.getStatusMessage(user.registrationStatus),
            details: user.statusDetails,
            canProceed: statusService.canProceed(user.registrationStatus)
        });
    } catch (error) {
        logger.error('Error getting registration status:', error);
        res.status(500).json({ error: 'Error retrieving registration status' });
    }
});

// Get detailed user status (protected route)
router.get('/user-status', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        
        res.json({
            username: user.username,
            displayName: user.displayName,
            systemEmail: user.systemEmail,
            registrationStatus: user.registrationStatus,
            isVerified: user.isVerified,
            createdAt: user.createdAt,
            verifiedAt: user.verifiedAt,
            lastLoginAt: user.lastLoginAt
        });
    } catch (error) {
        logger.error('Error getting user status:', error);
        res.status(500).json({ error: 'Error retrieving user status' });
    }
});

export default router;
