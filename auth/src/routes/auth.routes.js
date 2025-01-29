import express from 'express';
import { body } from 'express-validator';
import { register } from '../controllers/authController.js';
import { validateRequest } from '../middleware/validate.js';

const router = express.Router();

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({ status: 'healthy', service: 'auth', timestamp: new Date().toISOString() });
});

router.post('/register', [
    body('name')
        .exists()
        .trim()
        .isLength({ min: 3 })
        .withMessage('Name must be at least 3 characters long')
        .matches(/^[a-zA-Z0-9_-]+$/)
        .withMessage('Name can only contain letters, numbers, underscores and hyphens'),
    body('displayName')
        .exists()
        .trim()
        .isLength({ min: 3 })
        .withMessage('Display name must be at least 3 characters long'),
    body('email')
        .exists()
        .trim()
        .isEmail()
        .withMessage('Must be a valid email address'),
    body('password')
        .exists()
        .isLength({ min: 8 })
        .withMessage('Password must be at least 8 characters long'),
    body('simNumber')
        .exists()
        .trim()
        .isLength({ min: 1 })
        .withMessage('SIM number is required'),
    validateRequest,
    register
]);

export default router;
