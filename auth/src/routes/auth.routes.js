import express from 'express';
import { body } from 'express-validator';
import authController from '../controllers/authController.js';
import { validateRequest } from '../middleware/validate.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({ status: 'healthy', service: 'auth', timestamp: new Date().toISOString() });
});

// Register endpoint
router.post('/register', [
    body('username')
        .exists()
        .trim()
        .matches(/^[a-z][a-z0-9_-]{2,15}$/)
        .withMessage('Username must start with a letter and can only contain lowercase letters, numbers, underscores and hyphens'),
    body('displayName')
        .exists()
        .trim()
        .isLength({ min: 3 })
        .withMessage('Display name must be at least 3 characters long'),
    body('personalEmail')
        .exists()
        .trim()
        .isEmail()
        .withMessage('Must be a valid email address'),
    body('password')
        .exists()
        .isLength({ min: 8 })
        .withMessage('Password must be at least 8 characters long'),
    body('phoneNumber')
        .exists()
        .trim()
        .matches(/^\+[1-9]\d{1,14}$/)
        .withMessage('Phone number must be in E.164 format (e.g., +12345678901)'),
    validateRequest,
    authController.register.bind(authController)
]);

// Login endpoint
router.post('/login', [
    body('username')
        .exists()
        .trim()
        .notEmpty()
        .withMessage('Username is required'),
    body('password')
        .exists()
        .notEmpty()
        .withMessage('Password is required'),
    validateRequest,
    authController.login.bind(authController)
]);

// Email verification endpoint
router.post('/verify-email', [
    body('token')
        .exists()
        .trim()
        .notEmpty()
        .withMessage('Verification token is required'),
    validateRequest,
    authController.verifyEmail.bind(authController)
]);

// Logout endpoint (requires auth)
router.post('/logout', requireAuth, (req, res) => {
    res.json({ 
        success: true,
        message: 'Logged out successfully'
    });
});

export default router;
