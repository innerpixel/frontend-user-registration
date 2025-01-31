import jwt from 'jsonwebtoken';
import User from '../models/user.js';
import { createLogger } from '../utils/logger.js';
import statusService from '../services/statusService.js';
import systemIntegrationService from '../services/systemIntegrationService.js';
import { sendVerificationEmail } from '../utils/email.js';

const logger = createLogger('authController');

class AuthController {
    async register(req, res) {
        const { username, displayName, personalEmail, password, phoneNumber } = req.body;

        try {
            // Start registration process
            logger.info(`Starting registration for user: ${username}`);
            
            // Generate email account from username
            const emailAccount = `${username}@ld-csmlmail.test`;
            
            // 1. Check if username is available
            const existingUser = await User.findOne({ 
                $or: [
                    { username },
                    { displayName },
                    { personalEmail },
                    { emailAccount }
                ]
            });

            if (existingUser) {
                return res.status(400).json({
                    success: false,
                    message: 'Username, display name, or email already in use'
                });
            }

            // 2. Create user in MongoDB
            const user = new User({
                username,
                displayName,
                emailAccount,
                personalEmail,
                password,
                phoneNumber
            });

            // Save user with initial status
            await user.save();

            // 3. Update status to USERNAME_VALIDATED
            await statusService.updateStatus(user, 'USERNAME_VALIDATED');

            // 4. Update status to USER_CREATED
            await statusService.updateStatus(user, 'USER_CREATED');

            // 5. Generate JWT for system user creation
            const token = jwt.sign(
                { userId: user._id },
                process.env.JWT_SECRET,
                { expiresIn: '1h' }
            );

            // 6. Create system user
            try {
                await systemIntegrationService.createSystemUser(
                    { username, emailAccount },
                    token
                );
                await statusService.updateStatus(user, 'SYSTEM_USER_CREATED');
            } catch (error) {
                logger.error(`Failed to create system user: ${error.message}`);
                throw new Error('System user creation failed');
            }

            // 7. Generate verification token
            const verificationToken = jwt.sign(
                { userId: user._id },
                process.env.JWT_SECRET,
                { expiresIn: '24h' }
            );
            user.verificationToken = verificationToken;
            user.verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);
            await user.save();

            // 8. Send verification email
            try {
                await sendVerificationEmail({
                    to: personalEmail,
                    token: verificationToken,
                    username,
                    displayName
                });
                await statusService.updateStatus(user, 'VERIFICATION_SENT');
            } catch (error) {
                logger.error(`Failed to send verification email: ${error.message}`);
                throw new Error('Verification email sending failed');
            }

            res.status(201).json({
                success: true,
                message: 'Registration successful. Please check your email for verification.',
                data: {
                    username: user.username,
                    displayName: user.displayName,
                    emailAccount: user.emailAccount,
                    registrationStatus: user.registrationStatus
                }
            });

        } catch (error) {
            logger.error(`Registration failed: ${error.message}`);
            res.status(500).json({
                success: false,
                message: 'Registration failed. Please try again later.',
                error: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    }

    async verifyEmail(req, res) {
        const { token } = req.body;

        try {
            // Verify token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            
            // Find user
            const user = await User.findById(decoded.userId);
            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: 'User not found'
                });
            }

            // Check if token matches and hasn't expired
            if (user.verificationToken !== token || 
                user.verificationExpires < new Date()) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid or expired verification token'
                });
            }

            // Update user verification status
            user.isVerified = true;
            user.verificationToken = undefined;
            user.verificationExpires = undefined;
            user.verifiedAt = new Date();
            await statusService.updateStatus(user, 'VERIFIED');
            await user.save();

            res.json({
                success: true,
                message: 'Email verified successfully'
            });

        } catch (error) {
            logger.error(`Email verification failed: ${error.message}`);
            res.status(400).json({
                success: false,
                message: 'Email verification failed',
                error: error.message
            });
        }
    }

    async login(req, res) {
        const { username, password } = req.body;

        try {
            // Find user
            const user = await User.findOne({ username });
            if (!user) {
                return res.status(401).json({
                    success: false,
                    message: 'Invalid credentials'
                });
            }

            // Check password
            const isValid = await user.validatePassword(password);
            if (!isValid) {
                return res.status(401).json({
                    success: false,
                    message: 'Invalid credentials'
                });
            }

            // Check if email is verified
            if (!user.isVerified) {
                return res.status(403).json({
                    success: false,
                    message: 'Please verify your email before logging in'
                });
            }

            // Generate token
            const token = jwt.sign(
                { userId: user._id },
                process.env.JWT_SECRET,
                { expiresIn: '24h' }
            );

            // Update last login
            user.lastLoginAt = new Date();
            await user.save();

            res.json({
                success: true,
                token,
                user: {
                    username: user.username,
                    displayName: user.displayName,
                    systemEmail: user.systemEmail
                }
            });

        } catch (error) {
            logger.error(`Login failed: ${error.message}`);
            res.status(500).json({
                success: false,
                message: 'Login failed',
                error: error.message
            });
        }
    }
}

export default new AuthController();
