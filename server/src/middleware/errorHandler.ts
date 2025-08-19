import { Request, Response, NextFunction } from 'express';
import { logger } from '../index';

export interface AppError extends Error {
  statusCode?: number;
  isOperational?: boolean;
}

export const errorHandler = (
  error: AppError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const statusCode = error.statusCode || 500;
  const message = error.message || 'Internal Server Error';

  logger.error({
    error: error.message,
    stack: error.stack,
    path: req.path,
    method: req.method,
    statusCode
  }, 'Request error');

  // Don't leak error details in production
  const isDevelopment = process.env.NODE_ENV === 'development';

  res.status(statusCode).json({
    success: false,
    error: {
      message: isDevelopment ? message : 'Something went wrong',
      ...(isDevelopment && { stack: error.stack }),
      timestamp: new Date().toISOString(),
      path: req.path
    }
  });
};

export const createError = (message: string, statusCode: number = 500): AppError => {
  const error: AppError = new Error(message);
  error.statusCode = statusCode;
  error.isOperational = true;
  return error;
};