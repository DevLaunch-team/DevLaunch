import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import swaggerUi from 'swagger-ui-express';

// Import routes
import userRoutes from './routes/users';
import projectRoutes from './routes/projects';
import githubRoutes from './routes/github';
import adminRoutes from './routes/admin';
import walletRoutes from './routes/wallet';

// Import utilities
import logger from './utils/logger';
import swaggerSpec from './config/swagger';

// Load environment variables
dotenv.config();

// Create Express application
const app = express();

// Middleware
app.use(helmet()); // Security headers
app.use(cors());
app.use(express.json()); // Parse JSON request body
app.use(morgan('dev')); // HTTP request logging

// API Routes
app.use('/api/users', userRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/github', githubRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/wallet', walletRoutes);

// Swagger Documentation
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.get('/api/docs.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});

// Database connection
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/devlaunch');
    logger.info('MongoDB connection successful');
  } catch (error) {
    logger.error(`MongoDB connection error: ${error}`);
    process.exit(1);
  }
};

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'DevLaunch API service is running normally',
    timestamp: new Date()
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Requested resource not found' });
});

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  logger.error(`API Error: ${err.stack}`);
  res.status(err.status || 500).json({
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'production' ? {} : err.message
  });
});

// Start server
const PORT = process.env.PORT || 3000;
const startServer = async () => {
  await connectDB();
  app.listen(PORT, () => {
    logger.info(`Server running on port ${PORT}`);
  });
};

startServer().catch(err => {
  logger.error(`Failed to start server: ${err}`);
  process.exit(1);
});

export default app; 