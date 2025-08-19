import { Router } from 'express';

const router = Router();

router.get('/', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    uptime: process.uptime(),
    services: {
      ai: process.env.OPENAI_API_KEY || process.env.PROVIDER === 'mock' ? 'available' : 'not_configured'
    }
  });
});

export { router as healthRoutes };