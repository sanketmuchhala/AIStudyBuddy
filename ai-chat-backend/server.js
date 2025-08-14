const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const multer = require('multer');
const pdfParse = require('pdf-parse');
const { Pool } = require('pg');
const { v4: uuidv4 } = require('uuid');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const app = express();
const PORT = process.env.PORT || 3001;

// Configuration
const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY;
const ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN || 'https://sanketmuchhala.github.io,http://localhost:3000,http://localhost:5173,http://localhost:8080,http://localhost:5174,http://localhost:5175,http://localhost:5176';
const API_AUTH_TOKEN = process.env.API_AUTH_TOKEN;
const DATABASE_URL = process.env.DATABASE_URL;

// Parse allowed origins (support multiple origins separated by comma)
const ALLOWED_ORIGINS = ALLOWED_ORIGIN.split(',').map(origin => origin.trim());

if (!GOOGLE_API_KEY) {
  console.error('❌ GOOGLE_API_KEY is required');
  process.exit(1);
}

// Initialize Google AI
const genAI = new GoogleGenerativeAI(GOOGLE_API_KEY);

// Database setup
let db;
if (DATABASE_URL) {
  db = new Pool({
    connectionString: DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
  });
  
  // Create tables if they don't exist
  const initDB = async () => {
    try {
      await db.query(`
        CREATE TABLE IF NOT EXISTS users (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          name VARCHAR(255),
          email VARCHAR(255) UNIQUE,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);
      
      await db.query(`
        CREATE TABLE IF NOT EXISTS study_sessions (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id UUID REFERENCES users(id),
          subject VARCHAR(255),
          duration INTEGER,
          topics TEXT[],
          performance_score INTEGER,
          ai_feedback TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);
      
      await db.query(`
        CREATE TABLE IF NOT EXISTS interview_sessions (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id UUID REFERENCES users(id),
          resume_text TEXT,
          questions_asked TEXT[],
          user_answers TEXT[],
          ai_scores INTEGER[],
          ai_feedback TEXT[],
          overall_score INTEGER,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);
      
      await db.query(`
        CREATE TABLE IF NOT EXISTS chat_history (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id UUID REFERENCES users(id),
          session_id UUID,
          role VARCHAR(20),
          message TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);
      
      console.log('✅ Database tables initialized');
    } catch (error) {
      console.error('❌ Database initialization error:', error.message);
    }
  };
  
  initDB();
} else {
  console.warn('⚠️  No DATABASE_URL provided, running without database');
}

// Middleware
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    // Check if origin is in allowed list or localhost for development
    if (ALLOWED_ORIGINS.some(allowed => origin === allowed || origin.startsWith(allowed)) ||
        origin?.includes('localhost') || origin?.includes('127.0.0.1')) {
      return callback(null, true);
    }
    
    console.warn(`CORS blocked origin: ${origin}`);
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

app.use(express.json({ limit: '10mb' }));

// File upload setup for resume processing
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf' || file.mimetype === 'text/plain') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF and TXT files are allowed'));
    }
  }
});

// Rate limiting: 50 requests per minute per IP
const limiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 50,
  message: { error: 'rate_limit_exceeded', message: 'Too many requests. Please try again later.' },
  standardHeaders: true,
  legacyHeaders: false
});

app.use('/chat', limiter);
app.use('/stream', limiter);
app.use('/interview', limiter);

// Enhanced error handling middleware
const handleError = (error, req, res, operation) => {
  console.error(`❌ ${operation} error:`, error.message);
  console.error('Stack:', error.stack);
  
  if (error.message?.includes('API_KEY') || error.message?.includes('GOOGLE_API_KEY')) {
    return res.status(502).json({ 
      error: 'api_error', 
      message: 'Invalid API configuration' 
    });
  }
  
  if (error.message?.includes('SAFETY')) {
    return res.status(400).json({ 
      error: 'content_filtered', 
      message: 'Content was filtered for safety reasons' 
    });
  }

  if (error.message?.includes('CORS')) {
    return res.status(403).json({ 
      error: 'forbidden', 
      message: 'Access denied from this origin' 
    });
  }
  
  return res.status(500).json({ 
    error: 'internal_error', 
    message: 'An unexpected error occurred',
    details: process.env.NODE_ENV === 'development' ? error.message : undefined
  });
};

// Enhanced AI prompts
const AI_PROMPTS = {
  studyRecommendations: (subject, progress) => `
    You are an expert learning coach. A student is studying ${subject} and is currently at ${progress}% completion.
    
    Provide specific, actionable study recommendations in the following format:
    
    📚 NEXT FOCUS AREAS:
    • [Specific topic 1] - Why this is important now
    • [Specific topic 2] - How it builds on previous knowledge
    • [Specific topic 3] - Connection to upcoming concepts
    
    🎯 STUDY TECHNIQUES FOR ${subject.toUpperCase()}:
    • [Technique 1] - Specific implementation for this subject
    • [Technique 2] - Why it works well for this material
    • [Technique 3] - How to measure progress
    
    📝 RECOMMENDED PRACTICE:
    • [Resource 1] - Specific exercises or problems
    • [Resource 2] - Practice materials
    • [Resource 3] - Assessment methods
    
    ⚠️ COMMON PITFALLS TO AVOID:
    • [Pitfall 1] - How to recognize and overcome
    • [Pitfall 2] - Prevention strategies
    
    Keep recommendations specific, actionable, and tailored to ${progress}% completion level.
  `,
  
  interviewQuestion: (resumeText, questionNumber, previousQA = []) => `
    You are an expert technical interviewer. Based on this resume:
    
    ${resumeText}
    
    Previous Q&A in this session:
    ${previousQA.map((qa, i) => `Q${i+1}: ${qa.question}\nA${i+1}: ${qa.answer}\nScore: ${qa.score}/10`).join('\n\n')}
    
    Generate question #${questionNumber} that:
    1. Tests technical knowledge relevant to their experience
    2. Builds progressively on previous questions
    3. Assesses problem-solving abilities
    4. Is appropriate for their experience level
    
    Format your response as:
    QUESTION: [Your interview question]
    CONTEXT: [Why this question is relevant to their background]
    EVALUATION_CRITERIA: [Key points to look for in a good answer]
  `,
  
  scoreAnswer: (question, answer, criteria) => `
    You are scoring an interview answer. 
    
    QUESTION: ${question}
    CANDIDATE ANSWER: ${answer}
    EVALUATION CRITERIA: ${criteria}
    
    Provide:
    SCORE: [0-10]
    STRENGTHS: [What they did well]
    AREAS_FOR_IMPROVEMENT: [Specific suggestions]
    FOLLOW_UP: [Potential follow-up question if this were a real interview]
    
    Be constructive and specific in your feedback.
  `
};

// Utility functions
const validateRequest = (req, res, next) => {
  const { prompt, model = 'gemini-1.5-flash', temperature = 0.7 } = req.body;
  
  if (!prompt || typeof prompt !== 'string' || prompt.trim().length === 0) {
    return res.status(400).json({ 
      error: 'invalid_request', 
      message: 'Prompt is required and must be a non-empty string' 
    });
  }
  
  if (!['gemini-1.5-flash', 'gemini-1.5-flash'].includes(model)) {
    return res.status(400).json({ 
      error: 'invalid_model', 
      message: 'Model must be gemini-1.5-flash or gemini-1.5-flash' 
    });
  }
  
  if (typeof temperature !== 'number' || temperature < 0 || temperature > 1) {
    return res.status(400).json({ 
      error: 'invalid_temperature', 
      message: 'Temperature must be a number between 0 and 1' 
    });
  }
  
  req.validatedBody = { prompt: prompt.trim(), model, temperature };
  next();
};

const generateAIResponse = async (prompt, model = 'gemini-1.5-flash', temperature = 0.7) => {
  try {
    const genModel = genAI.getGenerativeModel({ 
      model,
      generationConfig: { temperature }
    });
    
    const result = await genModel.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('AI Generation Error:', error);
    throw error;
  }
};

// Routes
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    database: db ? 'connected' : 'not_configured',
    ai: GOOGLE_API_KEY ? 'configured' : 'missing'
  });
});

// Enhanced chat endpoint with better error handling
app.post('/chat', validateRequest, async (req, res) => {
  try {
    const { prompt, model, temperature } = req.validatedBody;
    const { userId, sessionId } = req.body;
    
    console.log(`💬 Chat request: ${model}, prompt length: ${prompt.length}`);
    
    const text = await generateAIResponse(prompt, model, temperature);
    
    // Store in database if available
    if (db && userId) {
      try {
        await db.query(
          'INSERT INTO chat_history (user_id, session_id, role, message) VALUES ($1, $2, $3, $4)',
          [userId, sessionId || uuidv4(), 'user', prompt]
        );
        await db.query(
          'INSERT INTO chat_history (user_id, session_id, role, message) VALUES ($1, $2, $3, $4)',
          [userId, sessionId || uuidv4(), 'assistant', text]
        );
      } catch (dbError) {
        console.warn('Database storage failed:', dbError.message);
      }
    }
    
    console.log(`✅ Chat response: ${text.length} characters`);
    res.json({ text });
    
  } catch (error) {
    handleError(error, req, res, 'Chat');
  }
});

// Streaming chat endpoint
app.post('/stream', validateRequest, async (req, res) => {
  try {
    const { prompt, model, temperature } = req.validatedBody;
    const { userId, sessionId } = req.body;
    
    console.log(`🔄 Stream request: ${model}, prompt length: ${prompt.length}`);
    
    // Set SSE headers
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': req.headers.origin || '*',
      'Access-Control-Allow-Credentials': 'true'
    });

    // Send initial connection
    res.write('data: {"status": "connected"}\n\n');

    try {
      const genModel = genAI.getGenerativeModel({ 
        model: model || 'gemini-1.5-flash',
        generationConfig: { temperature: temperature || 0.7 }
      });
      
      const result = await genModel.generateContentStream(prompt);
      let fullText = '';
      
      for await (const chunk of result.stream) {
        const chunkText = chunk.text();
        if (chunkText) {
          fullText += chunkText;
          res.write(`data: ${JSON.stringify({ delta: chunkText })}\n\n`);
        }
      }
      
      // Send completion signal
      res.write(`data: ${JSON.stringify({ done: true, fullText })}\n\n`);
      
      // Store in database if available
      if (db && userId) {
        try {
          await db.query(
            'INSERT INTO chat_history (user_id, session_id, role, message) VALUES ($1, $2, $3, $4)',
            [userId, sessionId || uuidv4(), 'user', prompt]
          );
          await db.query(
            'INSERT INTO chat_history (user_id, session_id, role, message) VALUES ($1, $2, $3, $4)',
            [userId, sessionId || uuidv4(), 'assistant', fullText]
          );
        } catch (dbError) {
          console.warn('Database storage failed:', dbError.message);
        }
      }
      
      console.log(`✅ Stream completed: ${fullText.length} characters`);
      
    } catch (streamError) {
      console.error('Stream error:', streamError);
      res.write(`data: ${JSON.stringify({ error: true, message: streamError.message })}\n\n`);
    }
    
    res.end();
    
  } catch (error) {
    console.error('Stream setup error:', error);
    if (!res.headersSent) {
      res.status(500).json({ error: 'stream_error', message: error.message });
    }
  }
});

// Study recommendations endpoint
app.post('/study/recommendations', async (req, res) => {
  try {
    const { subject, progress, userId } = req.body;
    
    if (!subject || typeof progress !== 'number') {
      return res.status(400).json({
        error: 'invalid_request',
        message: 'Subject and progress are required'
      });
    }
    
    const prompt = AI_PROMPTS.studyRecommendations(subject, progress);
    const recommendations = await generateAIResponse(prompt, 'gemini-1.5-flash', 0.7);
    
    console.log(`📚 Study recommendations generated for ${subject} at ${progress}%`);
    res.json({ recommendations });
    
  } catch (error) {
    handleError(error, req, res, 'Study Recommendations');
  }
});

// Resume upload and processing endpoint
app.post('/interview/upload-resume', upload.single('resume'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        error: 'no_file',
        message: 'Resume file is required'
      });
    }
    
    let resumeText = '';
    
    if (req.file.mimetype === 'application/pdf') {
      const pdfData = await pdfParse(req.file.buffer);
      resumeText = pdfData.text;
    } else {
      resumeText = req.file.buffer.toString('utf-8');
    }
    
    if (!resumeText.trim()) {
      return res.status(400).json({
        error: 'empty_resume',
        message: 'Could not extract text from resume'
      });
    }
    
    // Generate session ID and first question
    const sessionId = uuidv4();
    const firstQuestionPrompt = AI_PROMPTS.interviewQuestion(resumeText, 1);
    const firstQuestion = await generateAIResponse(firstQuestionPrompt, 'gemini-1.5-flash', 0.8);
    
    // Store in database if available
    if (db && req.body.userId) {
      try {
        await db.query(
          'INSERT INTO interview_sessions (id, user_id, resume_text, questions_asked) VALUES ($1, $2, $3, $4)',
          [sessionId, req.body.userId, resumeText, [firstQuestion]]
        );
      } catch (dbError) {
        console.warn('Database storage failed:', dbError.message);
      }
    }
    
    console.log(`📄 Resume processed, session ${sessionId} started`);
    res.json({
      sessionId,
      resumeText: resumeText.substring(0, 500) + '...', // Preview
      firstQuestion,
      message: 'Resume processed successfully. Ready to begin interview!'
    });
    
  } catch (error) {
    handleError(error, req, res, 'Resume Upload');
  }
});

// Interview answer submission and next question generation
app.post('/interview/answer', async (req, res) => {
  try {
    const { sessionId, answer, questionNumber, userId } = req.body;
    
    if (!sessionId || !answer || !questionNumber) {
      return res.status(400).json({
        error: 'invalid_request',
        message: 'Session ID, answer, and question number are required'
      });
    }
    
    // Get session data from database
    let sessionData = null;
    if (db) {
      try {
        const result = await db.query(
          'SELECT * FROM interview_sessions WHERE id = $1',
          [sessionId]
        );
        sessionData = result.rows[0];
      } catch (dbError) {
        console.warn('Database query failed:', dbError.message);
      }
    }
    
    if (!sessionData) {
      return res.status(404).json({
        error: 'session_not_found',
        message: 'Interview session not found'
      });
    }
    
    // Score the current answer
    const currentQuestion = sessionData.questions_asked[questionNumber - 1];
    const scorePrompt = AI_PROMPTS.scoreAnswer(
      currentQuestion,
      answer,
      "Technical accuracy, communication clarity, problem-solving approach, and depth of knowledge"
    );
    
    const scoreResponse = await generateAIResponse(scorePrompt, 'gemini-1.5-flash', 0.3);
    
    // Extract score (looking for SCORE: X pattern)
    const scoreMatch = scoreResponse.match(/SCORE:\s*(\d+)/i);
    const score = scoreMatch ? parseInt(scoreMatch[1]) : 5;
    
    // Update database with answer and score
    const updatedAnswers = [...(sessionData.user_answers || []), answer];
    const updatedScores = [...(sessionData.ai_scores || []), score];
    const updatedFeedback = [...(sessionData.ai_feedback || []), scoreResponse];
    
    // Generate next question if we haven't reached the limit (e.g., 5 questions)
    let nextQuestion = null;
    let isComplete = false;
    
    if (questionNumber < 5) {
      const previousQA = updatedAnswers.map((ans, i) => ({
        question: sessionData.questions_asked[i],
        answer: ans,
        score: updatedScores[i]
      }));
      
      const nextQuestionPrompt = AI_PROMPTS.interviewQuestion(
        sessionData.resume_text,
        questionNumber + 1,
        previousQA
      );
      
      nextQuestion = await generateAIResponse(nextQuestionPrompt, 'gemini-1.5-flash', 0.8);
      
      // Update questions array
      const updatedQuestions = [...sessionData.questions_asked, nextQuestion];
      
      if (db) {
        try {
          await db.query(
            'UPDATE interview_sessions SET questions_asked = $1, user_answers = $2, ai_scores = $3, ai_feedback = $4 WHERE id = $5',
            [updatedQuestions, updatedAnswers, updatedScores, updatedFeedback, sessionId]
          );
        } catch (dbError) {
          console.warn('Database update failed:', dbError.message);
        }
      }
    } else {
      // Interview complete
      isComplete = true;
      const overallScore = Math.round(updatedScores.reduce((a, b) => a + b, 0) / updatedScores.length);
      
      if (db) {
        try {
          await db.query(
            'UPDATE interview_sessions SET user_answers = $1, ai_scores = $2, ai_feedback = $3, overall_score = $4 WHERE id = $5',
            [updatedAnswers, updatedScores, updatedFeedback, overallScore, sessionId]
          );
        } catch (dbError) {
          console.warn('Database update failed:', dbError.message);
        }
      }
    }
    
    console.log(`🎯 Answer scored: ${score}/10 for question ${questionNumber}`);
    
    res.json({
      score,
      feedback: scoreResponse,
      nextQuestion,
      questionNumber: questionNumber + 1,
      isComplete,
      overallScore: isComplete ? Math.round(updatedScores.reduce((a, b) => a + b, 0) / updatedScores.length) : null
    });
    
  } catch (error) {
    handleError(error, req, res, 'Interview Answer');
  }
});

// Get interview history
app.get('/interview/history/:userId', async (req, res) => {
  try {
    if (!db) {
      return res.status(503).json({
        error: 'database_unavailable',
        message: 'Database not configured'
      });
    }
    
    const { userId } = req.params;
    
    const result = await db.query(
      'SELECT id, overall_score, created_at FROM interview_sessions WHERE user_id = $1 ORDER BY created_at DESC LIMIT 10',
      [userId]
    );
    
    res.json({ sessions: result.rows });
    
  } catch (error) {
    handleError(error, req, res, 'Interview History');
  }
});

// Study session tracking
app.post('/study/session', async (req, res) => {
  try {
    const { userId, subject, duration, topics, performanceScore } = req.body;
    
    if (!userId || !subject || !duration) {
      return res.status(400).json({
        error: 'invalid_request',
        message: 'User ID, subject, and duration are required'
      });
    }
    
    // Generate AI feedback
    const feedbackPrompt = `
      Analyze this study session:
      - Subject: ${subject}
      - Duration: ${duration} minutes
      - Topics covered: ${topics ? topics.join(', ') : 'Not specified'}
      - Self-assessed performance: ${performanceScore || 'Not provided'}/10
      
      Provide constructive feedback in 2-3 sentences focusing on:
      1. Session effectiveness
      2. Suggestions for improvement
      3. Next steps
    `;
    
    const aiFeedback = await generateAIResponse(feedbackPrompt, 'gemini-1.5-flash', 0.7);
    
    if (db) {
      try {
        const result = await db.query(
          'INSERT INTO study_sessions (user_id, subject, duration, topics, performance_score, ai_feedback) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id',
          [userId, subject, duration, topics, performanceScore, aiFeedback]
        );
        
        res.json({
          sessionId: result.rows[0].id,
          feedback: aiFeedback,
          message: 'Study session recorded successfully'
        });
      } catch (dbError) {
        console.warn('Database storage failed:', dbError.message);
        res.json({
          feedback: aiFeedback,
          message: 'Feedback generated but session not saved'
        });
      }
    } else {
      res.json({
        feedback: aiFeedback,
        message: 'Feedback generated (database not configured)'
      });
    }
    
  } catch (error) {
    handleError(error, req, res, 'Study Session');
  }
});

// Global error handler
app.use((error, req, res, next) => {
  handleError(error, req, res, 'Global');
});

// Backend Dashboard - Simple HTML interface
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>AI Study Buddy Backend Dashboard</title>
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
          color: #fff; min-height: 100vh; padding: 20px;
        }
        .container { max-width: 1200px; margin: 0 auto; }
        .header { text-align: center; margin-bottom: 40px; }
        .header h1 { font-size: 2.5rem; margin-bottom: 10px; color: #64ffda; }
        .status { display: flex; justify-content: center; gap: 20px; margin-bottom: 40px; flex-wrap: wrap; }
        .status-card { 
          background: rgba(255,255,255,0.1); border-radius: 12px; padding: 20px; 
          backdrop-filter: blur(10px); border: 1px solid rgba(255,255,255,0.2);
          min-width: 200px;
        }
        .status-card h3 { color: #64ffda; margin-bottom: 10px; }
        .endpoints { margin-bottom: 40px; }
        .endpoint { 
          background: rgba(255,255,255,0.05); margin: 10px 0; padding: 15px; 
          border-radius: 8px; border-left: 4px solid #64ffda;
        }
        .method { 
          display: inline-block; padding: 4px 8px; border-radius: 4px; 
          font-size: 0.8rem; font-weight: bold; margin-right: 10px;
        }
        .get { background: #4caf50; }
        .post { background: #2196f3; }
        .test-area { 
          background: rgba(255,255,255,0.05); padding: 20px; 
          border-radius: 12px; margin-top: 30px;
        }
        textarea, input { 
          width: 100%; padding: 12px; border-radius: 6px; border: 1px solid rgba(255,255,255,0.3);
          background: rgba(255,255,255,0.1); color: #fff; margin: 10px 0;
        }
        button { 
          background: #64ffda; color: #000; border: none; padding: 12px 24px; 
          border-radius: 6px; cursor: pointer; font-weight: bold;
        }
        button:hover { background: #4db6ac; }
        .response { 
          background: rgba(0,0,0,0.3); padding: 15px; border-radius: 6px; 
          margin: 10px 0; white-space: pre-wrap; font-family: monospace;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🤖 AI Study Buddy Backend</h1>
          <p>Enhanced AI-Powered Learning Assistant Dashboard</p>
        </div>
        
        <div class="status">
          <div class="status-card">
            <h3>🟢 System Status</h3>
            <p>Backend: <strong>Online</strong></p>
            <p>Database: <strong>${db ? 'Connected' : 'Not Configured'}</strong></p>
            <p>AI: <strong>${GOOGLE_API_KEY ? 'Configured' : 'Missing'}</strong></p>
          </div>
          <div class="status-card">
            <h3>📊 Statistics</h3>
            <p>Uptime: <strong id="uptime">0s</strong></p>
            <p>Requests: <strong>Active</strong></p>
            <p>Model: <strong>Gemini 1.5 Flash</strong></p>
          </div>
        </div>
        
        <div class="endpoints">
          <h2>📡 Available Endpoints</h2>
          <div class="endpoint">
            <span class="method get">GET</span>
            <strong>/health</strong> - System health check
          </div>
          <div class="endpoint">
            <span class="method post">POST</span>
            <strong>/chat</strong> - AI chat conversation
          </div>
          <div class="endpoint">
            <span class="method post">POST</span>
            <strong>/study/recommendations</strong> - Get personalized study advice
          </div>
          <div class="endpoint">
            <span class="method post">POST</span>
            <strong>/interview/upload-resume</strong> - Upload resume for interview prep
          </div>
          <div class="endpoint">
            <span class="method post">POST</span>
            <strong>/interview/answer</strong> - Submit interview answer for scoring
          </div>
          <div class="endpoint">
            <span class="method get">GET</span>
            <strong>/interview/history/:userId</strong> - Get interview history
          </div>
          <div class="endpoint">
            <span class="method post">POST</span>
            <strong>/study/session</strong> - Record study session
          </div>
        </div>
        
        <div class="test-area">
          <h2>🧪 Test AI Chat</h2>
          <input type="text" id="testPrompt" placeholder="Enter your question..." value="Hello, can you help me study mathematics?">
          <button onclick="testChat()">Send Message</button>
          <div id="chatResponse" class="response" style="display:none;"></div>
        </div>
        
        <div class="test-area">
          <h2>📚 Test Study Recommendations</h2>
          <input type="text" id="subject" placeholder="Subject (e.g., Mathematics)" value="Mathematics">
          <input type="number" id="progress" placeholder="Progress %" value="75" min="0" max="100">
          <button onclick="testStudy()">Get Recommendations</button>
          <div id="studyResponse" class="response" style="display:none;"></div>
        </div>
      </div>
      
      <script>
        // Update uptime
        let startTime = Date.now();
        setInterval(() => {
          const uptime = Math.floor((Date.now() - startTime) / 1000);
          document.getElementById('uptime').textContent = uptime + 's';
        }, 1000);
        
        async function testChat() {
          const prompt = document.getElementById('testPrompt').value;
          const responseDiv = document.getElementById('chatResponse');
          
          responseDiv.style.display = 'block';
          responseDiv.textContent = 'Testing...';
          
          try {
            const response = await fetch('/chat', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ prompt, model: 'gemini-1.5-flash' })
            });
            
            const data = await response.json();
            responseDiv.textContent = response.ok ? data.text : 'Error: ' + (data.message || 'Unknown error');
          } catch (error) {
            responseDiv.textContent = 'Network Error: ' + error.message;
          }
        }
        
        async function testStudy() {
          const subject = document.getElementById('subject').value;
          const progress = parseInt(document.getElementById('progress').value);
          const responseDiv = document.getElementById('studyResponse');
          
          responseDiv.style.display = 'block';
          responseDiv.textContent = 'Generating recommendations...';
          
          try {
            const response = await fetch('/study/recommendations', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ subject, progress, userId: 'dashboard-test' })
            });
            
            const data = await response.json();
            responseDiv.textContent = response.ok ? data.recommendations : 'Error: ' + (data.message || 'Unknown error');
          } catch (error) {
            responseDiv.textContent = 'Network Error: ' + error.message;
          }
        }
      </script>
    </body>
    </html>
  `);
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ 
    error: 'not_found', 
    message: 'Endpoint not found',
    availableEndpoints: [
      'GET / (Dashboard)',
      'GET /health',
      'POST /chat',
      'POST /study/recommendations',
      'POST /interview/upload-resume',
      'POST /interview/answer',
      'GET /interview/history/:userId',
      'POST /study/session'
    ]
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Enhanced AI Study Backend running on port ${PORT}`);
  console.log(`📍 Allowed origins: ${ALLOWED_ORIGINS.join(', ')}`);
  console.log(`🔐 Auth token: ${API_AUTH_TOKEN ? 'enabled' : 'disabled'}`);
  console.log(`🗄️  Database: ${db ? 'connected' : 'not configured'}`);
  console.log(`🤖 Google AI: ${GOOGLE_API_KEY ? 'configured' : 'missing'}`);
});