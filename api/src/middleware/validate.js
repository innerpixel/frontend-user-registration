import { body, param, validationResult } from 'express-validator';

// Validation middleware
export const validateSystemUser = [
    body('username')
        .trim()
        .isLength({ min: 3, max: 16 })
        .matches(/^[a-z][a-z0-9_-]*$/)
        .withMessage('Username must be 3-16 characters, start with a letter, and contain only lowercase letters, numbers, underscore, or hyphen'),
    
    body('email')
        .trim()
        .isEmail()
        .normalizeEmail()
        .withMessage('Must be a valid email address'),

    // Validation result handler
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                errors: errors.array()
            });
        }
        next();
    }
];
