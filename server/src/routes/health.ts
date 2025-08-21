import { Router } from 'express';

export const healthRoutes = Router();

// Handle both /healthz and /healthz/ paths
healthRoutes.get(['/', ''], (req, res) => {
  res.status(200).json({ 
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  });
});
