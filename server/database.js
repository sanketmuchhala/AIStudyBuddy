const { Pool } = require('pg');

// Database connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
});

// Initialize database tables
async function initializeDatabase() {
  try {
    console.log('🗄️ Initializing database...');
    
    // Test connection first
    const client = await pool.connect();
    console.log('✅ Database connection established');
    
    // Create users table
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        user_id VARCHAR(255) UNIQUE NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        last_active TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('📋 Users table ready');

    // Create chat sessions table
    await client.query(`
      CREATE TABLE IF NOT EXISTS chat_sessions (
        id SERIAL PRIMARY KEY,
        user_id VARCHAR(255) NOT NULL,
        session_id VARCHAR(255) UNIQUE NOT NULL,
        model VARCHAR(50) DEFAULT 'gemini-1.5-flash',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('💬 Chat sessions table ready');

    // Create chat messages table
    await client.query(`
      CREATE TABLE IF NOT EXISTS chat_messages (
        id SERIAL PRIMARY KEY,
        session_id VARCHAR(255) NOT NULL,
        role VARCHAR(20) NOT NULL CHECK (role IN ('user', 'assistant')),
        content TEXT NOT NULL,
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('💭 Chat messages table ready');

    // Create study sessions table
    await client.query(`
      CREATE TABLE IF NOT EXISTS study_sessions (
        id SERIAL PRIMARY KEY,
        user_id VARCHAR(255) NOT NULL,
        subject VARCHAR(255) NOT NULL,
        duration_minutes INTEGER NOT NULL,
        topics TEXT[],
        performance_rating INTEGER CHECK (performance_rating >= 1 AND performance_rating <= 10),
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('📚 Study sessions table ready');

    // Create interview sessions table
    await client.query(`
      CREATE TABLE IF NOT EXISTS interview_sessions (
        id SERIAL PRIMARY KEY,
        user_id VARCHAR(255) NOT NULL,
        session_id VARCHAR(255) UNIQUE NOT NULL,
        resume_text TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('🎯 Interview sessions table ready');

    // Create interview Q&A table
    await client.query(`
      CREATE TABLE IF NOT EXISTS interview_qa (
        id SERIAL PRIMARY KEY,
        session_id VARCHAR(255) NOT NULL,
        question_number INTEGER NOT NULL,
        question TEXT NOT NULL,
        answer TEXT,
        score INTEGER CHECK (score >= 1 AND score <= 10),
        feedback TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('❓ Interview Q&A table ready');

    // Verify tables exist
    const tablesResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);
    
    console.log('📊 Database tables created:');
    tablesResult.rows.forEach(row => {
      console.log(`   ✓ ${row.table_name}`);
    });

    client.release();
    console.log('✅ Database initialization completed successfully');
  } catch (error) {
    console.error('❌ Database initialization error:', error.message);
    
    if (error.message.includes('ENOTFOUND')) {
      console.error('🔧 DNS resolution failed. Check DATABASE_URL hostname.');
    } else if (error.message.includes('ECONNREFUSED')) {
      console.error('🔧 Connection refused. Check if database server is running.');
    } else if (error.message.includes('authentication')) {
      console.error('🔧 Authentication failed. Check database credentials.');
    } else if (error.message.includes('database') && error.message.includes('does not exist')) {
      console.error('🔧 Database does not exist. Create it first on Railway.');
    }
    
    throw error;
  }
}

// Database helper functions
const db = {
  // Pool query method for direct database access
  query: (text, params) => pool.query(text, params),
  
  // User management
  async createUser(userId) {
    const result = await pool.query(
      'INSERT INTO users (user_id) VALUES ($1) ON CONFLICT (user_id) DO UPDATE SET last_active = CURRENT_TIMESTAMP RETURNING *',
      [userId]
    );
    return result.rows[0];
  },

  async getUser(userId) {
    const result = await pool.query('SELECT * FROM users WHERE user_id = $1', [userId]);
    return result.rows[0];
  },

  // Chat session management
  async createChatSession(userId, sessionId, model = 'gemini-1.5-flash') {
    await this.createUser(userId); // Ensure user exists
    const result = await pool.query(
      'INSERT INTO chat_sessions (user_id, session_id, model) VALUES ($1, $2, $3) RETURNING *',
      [userId, sessionId, model]
    );
    return result.rows[0];
  },

  async getChatSession(sessionId) {
    const result = await pool.query('SELECT * FROM chat_sessions WHERE session_id = $1', [sessionId]);
    return result.rows[0];
  },

  async saveChatMessage(sessionId, role, content) {
    const result = await pool.query(
      'INSERT INTO chat_messages (session_id, role, content) VALUES ($1, $2, $3) RETURNING *',
      [sessionId, role, content]
    );
    return result.rows[0];
  },

  async getChatMessages(sessionId, limit = 50) {
    const result = await pool.query(
      'SELECT * FROM chat_messages WHERE session_id = $1 ORDER BY timestamp ASC LIMIT $2',
      [sessionId, limit]
    );
    return result.rows;
  },

  // Study session management
  async saveStudySession(userId, subject, durationMinutes, topics = [], performanceRating = null, notes = null) {
    await this.createUser(userId); // Ensure user exists
    const result = await pool.query(
      'INSERT INTO study_sessions (user_id, subject, duration_minutes, topics, performance_rating, notes) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [userId, subject, durationMinutes, topics, performanceRating, notes]
    );
    return result.rows[0];
  },

  async getStudySessions(userId, limit = 20) {
    const result = await pool.query(
      'SELECT * FROM study_sessions WHERE user_id = $1 ORDER BY created_at DESC LIMIT $2',
      [userId, limit]
    );
    return result.rows;
  },

  // Interview session management
  async createInterviewSession(userId, sessionId, resumeText = null) {
    await this.createUser(userId); // Ensure user exists
    const result = await pool.query(
      'INSERT INTO interview_sessions (user_id, session_id, resume_text) VALUES ($1, $2, $3) RETURNING *',
      [userId, sessionId, resumeText]
    );
    return result.rows[0];
  },

  async saveInterviewQA(sessionId, questionNumber, question, answer = null, score = null, feedback = null) {
    const result = await pool.query(
      'INSERT INTO interview_qa (session_id, question_number, question, answer, score, feedback) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [sessionId, questionNumber, question, answer, score, feedback]
    );
    return result.rows[0];
  },

  async getInterviewHistory(userId, limit = 10) {
    const result = await pool.query(
      `SELECT 
        is.session_id,
        is.created_at,
        COUNT(iqa.id) as question_count,
        AVG(iqa.score) as average_score
      FROM interview_sessions is
      LEFT JOIN interview_qa iqa ON is.session_id = iqa.session_id
      WHERE is.user_id = $1
      GROUP BY is.session_id, is.created_at
      ORDER BY is.created_at DESC
      LIMIT $2`,
      [userId, limit]
    );
    return result.rows;
  },

  // Analytics
  async getUserStats(userId) {
    const result = await pool.query(
      `SELECT 
        COUNT(DISTINCT cs.session_id) as total_chat_sessions,
        COUNT(DISTINCT ss.id) as total_study_sessions,
        COUNT(DISTINCT is.session_id) as total_interview_sessions,
        SUM(ss.duration_minutes) as total_study_minutes,
        AVG(ss.performance_rating) as avg_study_performance,
        AVG(iqa.score) as avg_interview_score
      FROM users u
      LEFT JOIN chat_sessions cs ON u.user_id = cs.user_id
      LEFT JOIN study_sessions ss ON u.user_id = ss.user_id
      LEFT JOIN interview_sessions is ON u.user_id = is.user_id
      LEFT JOIN interview_qa iqa ON is.session_id = iqa.session_id
      WHERE u.user_id = $1`,
      [userId]
    );
    return result.rows[0];
  }
};

module.exports = { pool, initializeDatabase, db };
