import winston from 'winston';
import path from 'path';

// Define log levels
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

// Choose log level based on environment
const level = () => {
  const env = process.env.NODE_ENV || 'development';
  const isDevelopment = env === 'development';
  return isDevelopment ? 'debug' : 'info';
};

// Define log colors
const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'blue',
};

// Add colors to winston
winston.addColors(colors);

// Define log format
const format = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.colorize({ all: true }),
  winston.format.printf(
    (info) => `${info.timestamp} ${info.level}: ${info.message}`,
  ),
);

// Define log output targets
const transports = [
  // Console output
  new winston.transports.Console(),
  
  // Error log file
  new winston.transports.File({
    filename: path.join('logs', 'error.log'),
    level: 'error',
  }),
  
  // All logs file
  new winston.transports.File({ filename: path.join('logs', 'all.log') }),
];

// Create logger instance
const logger = winston.createLogger({
  level: level(),
  levels,
  format,
  transports,
  exitOnError: false, // do not exit on handled exceptions
});

// Create logger for specific module
export const createLogger = (module: string) => {
  return {
    error: (message: string, ...meta: any[]) => logger.error(`[${module}] ${message}`, ...meta),
    warn: (message: string, ...meta: any[]) => logger.warn(`[${module}] ${message}`, ...meta),
    info: (message: string, ...meta: any[]) => logger.info(`[${module}] ${message}`, ...meta),
    http: (message: string, ...meta: any[]) => logger.http(`[${module}] ${message}`, ...meta),
    debug: (message: string, ...meta: any[]) => logger.debug(`[${module}] ${message}`, ...meta),
  };
};

export default logger;

// If we're not in production, log to the console with colored output
if (process.env.NODE_ENV !== 'production') {
  logger.add(
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      ),
    })
  );
}

// Create a stream object with a 'write' function that will be used by morgan
export const stream = {
  write: (message: string) => {
    logger.info(message.trim());
  },
}; 