import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { createAIProvider } from '../services/aiService';
import { logger } from '../index';
import { createError } from '../middleware/errorHandler';

const router = Router();

const summarizeSchema = z.object({
  content: z.string().min(1).max(50000),
  type: z.enum(['url', 'text', 'pdf']).default('text')
});

const studyPlanSchema = z.object({
  topic: z.string().min(1).max(200),
  duration: z.number().min(1).max(30),
  level: z.enum(['beginner', 'intermediate', 'advanced']).default('intermediate')
});

const flashcardsSchema = z.object({
  content: z.string().min(1).max(10000),
  count: z.number().min(1).max(50).default(10)
});

const explainSchema = z.object({
  topic: z.string().min(1).max(200),
  level: z.enum(['simple', 'detailed', 'expert']).default('detailed')
});

const quizSchema = z.object({
  topic: z.string().min(1).max(200),
  questionCount: z.number().min(1).max(20).default(5),
  difficulty: z.enum(['easy', 'medium', 'hard']).default('medium')
});

// Summarize content
router.post('/summarize', async (req: Request, res: Response, next) => {
  try {
    const { content, type } = summarizeSchema.parse(req.body);
    
    logger.info({ requestId: req.id, type, contentLength: content.length }, 'Summarize request');
    
    const prompt = `Please provide a concise summary of the following ${type} content. Focus on the key points and main ideas:\n\n${content}`;
    
    const aiProvider = createAIProvider();
    const summary = await aiProvider.generateText(prompt);
    
    res.json({
      success: true,
      data: {
        summary,
        originalLength: content.length,
        type,
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

// Generate study plan
router.post('/study-plan', async (req: Request, res: Response, next) => {
  try {
    const { topic, duration, level } = studyPlanSchema.parse(req.body);
    
    logger.info({ requestId: req.id, topic, duration, level }, 'Study plan request');
    
    const prompt = `Create a comprehensive ${duration}-day study plan for "${topic}" at ${level} level. Include:
    - Daily learning objectives
    - Recommended study time per day
    - Key concepts to cover
    - Practice exercises
    - Milestones and assessments
    
    Format as a structured plan with clear daily breakdown.`;
    
    const aiProvider = createAIProvider();
    const studyPlan = await aiProvider.generateText(prompt);
    
    res.json({
      success: true,
      data: {
        studyPlan,
        topic,
        duration,
        level,
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

// Generate flashcards
router.post('/flashcards', async (req: Request, res: Response, next) => {
  try {
    const { content, count } = flashcardsSchema.parse(req.body);
    
    logger.info({ requestId: req.id, count, contentLength: content.length }, 'Flashcards request');
    
    const prompt = `Create ${count} flashcards from the following content. Format each as:
    Q: [Question]
    A: [Answer]
    
    Focus on key concepts, definitions, and important facts:
    
    ${content}`;
    
    const aiProvider = createAIProvider();
    const flashcards = await aiProvider.generateText(prompt);
    
    res.json({
      success: true,
      data: {
        flashcards,
        count,
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

// Explain topic
router.post('/explain', async (req: Request, res: Response, next) => {
  try {
    const { topic, level } = explainSchema.parse(req.body);
    
    logger.info({ requestId: req.id, topic, level }, 'Explain request');
    
    const levelDescriptions = {
      simple: 'in simple terms that a beginner can understand, avoiding technical jargon',
      detailed: 'with comprehensive details, examples, and context',
      expert: 'at an advanced level with technical depth and nuanced analysis'
    };
    
    const prompt = `Explain "${topic}" ${levelDescriptions[level]}. Include:
    - Clear definition
    - Key concepts
    - Real-world examples
    - Why it's important
    - Common misconceptions (if any)`;
    
    const aiProvider = createAIProvider();
    const explanation = await aiProvider.generateText(prompt);
    
    res.json({
      success: true,
      data: {
        explanation,
        topic,
        level,
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

// Generate quiz
router.post('/quiz', async (req: Request, res: Response, next) => {
  try {
    const { topic, questionCount, difficulty } = quizSchema.parse(req.body);
    
    logger.info({ requestId: req.id, topic, questionCount, difficulty }, 'Quiz request');
    
    const prompt = `Create a ${difficulty} ${questionCount}-question quiz about "${topic}". 
    
    Format each question as:
    Q[number]: [Question]
    A) [Option A]
    B) [Option B]  
    C) [Option C]
    D) [Option D]
    Correct Answer: [Letter]
    Explanation: [Brief explanation]
    
    Make sure questions test understanding, not just memorization.`;
    
    const aiProvider = createAIProvider();
    const quiz = await aiProvider.generateText(prompt);
    
    res.json({
      success: true,
      data: {
        quiz,
        topic,
        questionCount,
        difficulty,
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

export { router as quickActionsRoutes };