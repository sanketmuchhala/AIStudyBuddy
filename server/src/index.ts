import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import path from 'path';
import dotenv from 'dotenv';
import pino from 'pino';
import { chatRoutes } from './routes/chat';
import { quickActionsRoutes } from './routes/quickActions';
import { healthRoutes } from './routes/health';
import { errorHandler } from './middleware/errorHandler';
import { requestLogger } from './middleware/requestLogger';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8080;
const NODE_ENV = process.env.NODE_ENV || 'development';

// Logger setup
export const logger = pino({
  level: NODE_ENV === 'development' ? 'debug' : 'info',
  transport: NODE_ENV === 'development' ? {
    target: 'pino-pretty',
    options: {
      colorize: true
    }
  } : undefined
});

// Trust proxy for Railway
app.set('trust proxy', 1);

// Security middleware
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false
}));

// CORS configuration for GitHub Pages + Railway deployment
const getAllowedOrigins = () => {
  if (NODE_ENV === 'development') {
    return ['http://localhost:5173', 'http://localhost:3000', 'http://localhost:8080'];
  }
  
  // Production: allow GitHub Pages and same origin
  const allowedOrigins = [
    // GitHub Pages patterns
    /^https:\/\/[\w-]+\.github\.io$/,
    // Same origin (for Railway full-stack deploy)
    false
  ];
  
  // If ALLOWED_ORIGINS env var is set, add those domains  
  const envOrigins = process.env.ALLOWED_ORIGINS?.split(',').map(o => o.trim()).filter(Boolean);
  if (envOrigins?.length) {
    allowedOrigins.push(...envOrigins.map(origin => new RegExp(`^${origin.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`)));
  }
  
  return allowedOrigins;
};

app.use(cors({
  origin: getAllowedOrigins(),
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-requested-with']
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: { error: 'Too many requests, please try again later.' }
});

app.use('/api', limiter);

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging
app.use(requestLogger);

// Health check endpoint (for Railway)
app.get('/healthz', (req, res) => {
  res.status(200).json({ 
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// API Routes
app.use('/api/chat', chatRoutes);
app.use('/api/quick', quickActionsRoutes);

// Serve static files in production
if (NODE_ENV === 'production' || process.env.SERVE_STATIC) {
  const clientPath = path.join(__dirname, '../client/dist');
  app.use(express.static(clientPath));

  // SPA fallback
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api') || req.path.startsWith('/healthz')) {
      return next();
    }
    res.sendFile(path.join(clientPath, 'index.html'));
  });
}

// Error handling
app.use(errorHandler);

// 404 handler for API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `API endpoint ${req.originalUrl} not found`
  });
});

const server = app.listen(PORT, () => {
  logger.info(`🚀 AIStudyBuddy server started on port ${PORT}`);
  logger.info(`📦 Environment: ${NODE_ENV}`);
  logger.info(`🔒 Security: ${NODE_ENV === 'production' ? 'Production' : 'Development'} mode`);
  logger.info(`🏥 Health check available at: http://localhost:${PORT}/healthz`);
  
  // Signal that the server is ready
  if (process.send) {
    process.send('ready');
  }
});

// Handle server errors
server.on('error', (error) => {
  logger.error('Server error:', error);
  process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  server.close(() => {
    logger.info('Server closed');
    process.exit(0);
  });
});