import express from 'express';
import systemUserController from '../controllers/systemUserController.js';
import { validateSystemUser } from '../middleware/validate.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

// Create system user
router.post('/users/system',
    auth,
    validateSystemUser,
    systemUserController.createSystemUser
);

// Check system user status
router.get('/users/system/:username',
    auth,
    systemUserController.checkSystemUser
);

// Remove system user (protected, admin only)
router.delete('/users/system/:username',
    auth,
    systemUserController.removeSystemUser
);

export default router;
