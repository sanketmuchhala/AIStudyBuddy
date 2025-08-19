import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { createAIProvider } from '../services/aiService';
import { logger } from '../index';
import { createError } from '../middleware/errorHandler';

const router = Router();

const chatRequestSchema = z.object({
  message: z.string().min(1).max(10000),
  conversationId: z.string().optional(),
  stream: z.boolean().default(false)
});

// Regular chat endpoint
router.post('/', async (req: Request, res: Response, next) => {
  try {
    const { message, conversationId } = chatRequestSchema.parse(req.body);
    
    logger.info({ requestId: req.id, conversationId }, 'Chat request received');
    
    const aiProvider = createAIProvider();
    const response = await aiProvider.generateText(message);
    
    res.json({
      success: true,
      data: {
        message: response,
        conversationId: conversationId || `conv_${Date.now()}`,
        timestamp: new Date().toISOString()
      }
    });
    
  } catch (error) {
    if (error instanceof z.ZodError) {
      return next(createError('Invalid request data', 400));
    }
    next(error);
  }
});

// Streaming chat endpoint
router.post('/stream', async (req: Request, res: Response, next) => {
  try {
    const { message, conversationId } = chatRequestSchema.parse(req.body);
    
    logger.info({ requestId: req.id, conversationId }, 'Streaming chat request received');
    
    // Set SSE headers
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no' // Disable Nginx buffering
    });

    // Send initial connection event
    res.write(`data: ${JSON.stringify({ type: 'start', conversationId: conversationId || `conv_${Date.now()}` })}\n\n`);

    const aiProvider = createAIProvider();
    
    try {
      for await (const chunk of aiProvider.generateStream(message)) {
        res.write(`data: ${JSON.stringify({ type: 'chunk', content: chunk })}\n\n`);
      }
      
      res.write(`data: ${JSON.stringify({ type: 'end' })}\n\n`);
    } catch (streamError) {
      logger.error({ error: streamError, requestId: req.id }, 'Streaming error');
      res.write(`data: ${JSON.stringify({ type: 'error', message: 'Stream error occurred' })}\n\n`);
    }
    
    res.end();
    
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Invalid request data' }));
      return;
    }
    
    if (!res.headersSent) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Internal server error' }));
    }
  }
});

export { router as chatRoutes };