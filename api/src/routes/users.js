import express from 'express';
import { createSystemUser, getSystemStatus } from '../controllers/userController.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

// Create system user with mail setup
router.post('/system-setup', authMiddleware, createSystemUser);

// Get system user status
router.get('/:username/system-status', authMiddleware, getSystemStatus);

export default router;
