import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { createAIProvider } from '../services/aiService';
import { logger } from '../index';
import { createError } from '../middleware/errorHandler';

const router = Router();

const chatRequestSchema = z.object({
  prompt: z.string().min(1).max(10000),
  message: z.string().min(1).max(10000).optional(),
  conversationId: z.string().optional(),
  stream: z.boolean().default(false),
  model: z.string().optional(),
  temperature: z.number().optional(),
  system: z.string().optional(),
  userId: z.string().optional()
});

// Regular chat endpoint
router.post('/', async (req: Request, res: Response, next) => {
  try {
    const { prompt, message, conversationId } = chatRequestSchema.parse(req.body);
    const userMessage = prompt || message;
    
    if (!userMessage) {
      return next(createError('Either prompt or message is required', 400));
    }
    
    logger.info({ conversationId }, 'Chat request received');
    
    const aiProvider = createAIProvider();
    const response = await aiProvider.generateText(userMessage);
    
    res.json({
      success: true,
      text: response,
      conversationId: conversationId || `conv_${Date.now()}`,
      timestamp: new Date().toISOString()
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
    const { prompt, message, conversationId } = chatRequestSchema.parse(req.body);
    const userMessage = prompt || message;
    
    if (!userMessage) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Either prompt or message is required' }));
      return;
    }
    
    logger.info({ conversationId }, 'Streaming chat request received');
    
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
      for await (const chunk of aiProvider.generateStream(userMessage)) {
        res.write(`data: ${JSON.stringify({ delta: chunk })}\n\n`);
      }
      
      res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
    } catch (streamError) {
      logger.error({ error: streamError }, 'Streaming error');
      res.write(`data: ${JSON.stringify({ error: true, message: 'Stream error occurred' })}\n\n`);
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