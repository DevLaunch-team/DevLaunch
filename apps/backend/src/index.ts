import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { createLogger, format, transports } from 'winston';

// Import routes
import tokenRoutes from './routes/tokens';
import userRoutes from './routes/users';
import githubRoutes from './routes/github';
import pumpfunRoutes from './routes/pumpfun';
import analyticsRoutes from './routes/analytics';

// Load environment variables
dotenv.config();

// Create Winston logger
const logger = createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: format.combine(
    format.timestamp(),
    format.json()
  ),
  transports: [
    new transports.Console(),
    new transports.File({ filename: 'logs/error.log', level: 'error' }),
    new transports.File({ filename: 'logs/combined.log' }),
  ],
});

// Initialize Express app
const app = express();
const port = process.env.PORT || 8000;

// Apply middlewares
app.use(cors());
app.use(helmet());
app.use(express.json());
app.use(morgan('combined'));

// API routes
app.use('/api/tokens', tokenRoutes);
app.use('/api/users', userRoutes);
app.use('/api/github', githubRoutes);
app.use('/api/pumpfun', pumpfunRoutes);
app.use('/api/analytics', analyticsRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Global error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  logger.error(`Error: ${err.message}`, { stack: err.stack });
  res.status(err.status || 500).json({
    error: {
      message: err.message || 'Internal Server Error',
      ...(process.env.NODE_ENV !== 'production' && { stack: err.stack }),
    },
  });
});

// Start server
app.listen(port, () => {
  logger.info(`DevLaunch API server running on port ${port} in ${process.env.NODE_ENV || 'development'} mode`);
}); 