import { Request, Response, NextFunction } from 'express';
import { logger } from '../index';

export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  const startTime = Date.now();
  
  // Generate request ID
  req.id = Math.random().toString(36).substring(2, 15);
  
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    
    logger.info({
      requestId: req.id,
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      userAgent: req.get('User-Agent'),
      ip: req.ip
    }, 'Request completed');
  });

  next();
};

// Extend Express Request type
declare global {
  namespace Express {
    interface Request {
      id?: string;
    }
  }
}