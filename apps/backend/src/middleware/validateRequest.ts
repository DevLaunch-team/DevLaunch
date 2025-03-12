import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';

/**
 * Middleware to validate request parameters
 * Uses express-validator to validate the request and checks for errors
 * If errors are found, returns a 400 status code with error information
 */
export const validateRequest = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array().map(error => ({
        param: error.param,
        message: error.msg,
        value: error.value
      }))
    });
  }
  
  next();
}; 