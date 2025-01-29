import jwt from 'jsonwebtoken';
import User from '../models/user.model.js';
import { createLogger } from '../utils/logger.js';

const logger = createLogger('auth.middleware');

export const requireAuth = async (req, res, next) => {
  try {
    // Check for token
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        status: 'error',
        message: 'Authentication required'
      });
    }

    const token = authHeader.split(' ')[1];

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Check if user still exists
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({
        status: 'error',
        message: 'User no longer exists'
      });
    }

    // Add user to request
    req.user = user;
    next();
  } catch (error) {
    logger.error('Authentication error:', error);
    res.status(401).json({
      status: 'error',
      message: 'Invalid or expired token'
    });
  }
};
