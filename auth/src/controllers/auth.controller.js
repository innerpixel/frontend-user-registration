import jwt from 'jsonwebtoken';
import User from '../models/user.model.js';
import { createLogger } from '../utils/logger.js';
import { sendVerificationEmail, sendWelcomeEmail } from '../utils/email.js';

const logger = createLogger('auth.controller');

export const register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(400).json({
        status: 'error',
        message: 'User with this email or username already exists'
      });
    }

    // Create new user
    const user = new User({ username, email, password });
    
    // Generate verification token
    const verificationToken = user.generateEmailVerificationToken();
    
    // Save user
    await user.save();

    // Send verification email
    await sendVerificationEmail(email, verificationToken);

    // Generate auth token
    const token = user.generateAuthToken();

    res.status(201).json({
      status: 'success',
      message: 'Registration successful. Please check your email to verify your account.',
      token
    });
  } catch (error) {
    logger.error('Registration error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error creating user account'
    });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid email or password'
      });
    }

    // Check password
    const isValidPassword = await user.comparePassword(password);
    if (!isValidPassword) {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid email or password'
      });
    }

    // Check if email is verified
    if (!user.isEmailVerified) {
      return res.status(403).json({
        status: 'error',
        message: 'Please verify your email address before logging in'
      });
    }

    // Generate token
    const token = user.generateAuthToken();

    res.json({
      status: 'success',
      token,
      user: {
        username: user.username,
        email: user.email,
        isEmailVerified: user.isEmailVerified
      }
    });
  } catch (error) {
    logger.error('Login error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error during login'
    });
  }
};

export const verifyEmail = async (req, res) => {
  try {
    const { token } = req.params;

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Find user
    const user = await User.findOne({
      _id: decoded.id,
      emailVerificationToken: token,
      emailVerificationExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid or expired verification token'
      });
    }

    // Update user
    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    await user.save();

    // Send welcome email
    await sendWelcomeEmail(user.email, user.username);

    res.json({
      status: 'success',
      message: 'Email verified successfully'
    });
  } catch (error) {
    logger.error('Email verification error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error verifying email'
    });
  }
};
