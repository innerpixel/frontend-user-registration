import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import mongoose from 'mongoose';
import winston from 'winston';
import dotenv from 'dotenv';
import userRoutes from './routes/users.js';

// Load environment variables
dotenv.config();

// Configure logger
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'logs/error/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/app/app.log' })
  ]
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple()
  }));
}

const app = express();

// Middleware
app.use(helmet());
app.use(cors({
  origin: ['https://www.local-dev.test', 'https://admin.local-dev.test'],
  credentials: true
}));
app.use(express.json());

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// Basic routes
app.get('/api', (req, res) => {
  res.json({
    name: 'CSMCL API',
    version: '1.0.0',
    environment: process.env.NODE_ENV
  });
});

// API Routes
app.use('/api/users', userRoutes);

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    logger.info('Connected to MongoDB');
  })
  .catch((err) => {
    logger.error('MongoDB connection error:', err);
  });

// Error handling middleware
app.use((err, req, res, next) => {
  logger.error(err.stack);
  res.status(500).json({
    error: process.env.NODE_ENV === 'development' ? err.message : 'Internal Server Error'
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  logger.info(`API Server running on port ${PORT}`);
});
