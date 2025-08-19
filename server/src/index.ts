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

// CORS - allow localhost for development, same origin for production
app.use(cors({
  origin: NODE_ENV === 'development' 
    ? ['http://localhost:5173', 'http://localhost:3000'] 
    : false, // Same origin only in production
  credentials: true
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

// API Routes
app.use('/healthz', healthRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/quick', quickActionsRoutes);

// Serve static files in production
if (NODE_ENV === 'production' || process.env.SERVE_STATIC) {
  const clientPath = path.join(__dirname, '../../client/dist');
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

app.listen(PORT, () => {
  logger.info(`🚀 AIStudyBuddy server started on port ${PORT}`);
  logger.info(`📦 Environment: ${NODE_ENV}`);
  logger.info(`🔒 Security: ${NODE_ENV === 'production' ? 'Production' : 'Development'} mode`);
});