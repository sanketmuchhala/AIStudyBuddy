const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function resetDatabase() {
  try {
    console.log('🗄️ Resetting database...');
    
    const client = await pool.connect();
    
    // Drop existing tables
    console.log('🗑️ Dropping existing tables...');
    await client.query('DROP TABLE IF EXISTS interview_qa CASCADE');
    await client.query('DROP TABLE IF EXISTS interview_sessions CASCADE');
    await client.query('DROP TABLE IF EXISTS chat_messages CASCADE');
    await client.query('DROP TABLE IF EXISTS chat_sessions CASCADE');
    await client.query('DROP TABLE IF EXISTS study_sessions CASCADE');
    await client.query('DROP TABLE IF EXISTS users CASCADE');
    
    console.log('✅ Tables dropped');
    
    // Create users table
    await client.query(`
      CREATE TABLE users (
        id SERIAL PRIMARY KEY,
        user_id VARCHAR(255) UNIQUE NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        last_active TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('📋 Users table created');

    // Create chat sessions table
    await client.query(`
      CREATE TABLE chat_sessions (
        id SERIAL PRIMARY KEY,
        user_id VARCHAR(255) NOT NULL,
        session_id VARCHAR(255) UNIQUE NOT NULL,
        model VARCHAR(50) DEFAULT 'gemini-1.5-flash',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('💬 Chat sessions table created');

    // Create chat messages table
    await client.query(`
      CREATE TABLE chat_messages (
        id SERIAL PRIMARY KEY,
        session_id VARCHAR(255) NOT NULL,
        role VARCHAR(20) NOT NULL CHECK (role IN ('user', 'assistant')),
        content TEXT NOT NULL,
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('💭 Chat messages table created');

    // Create study sessions table
    await client.query(`
      CREATE TABLE study_sessions (
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
    console.log('📚 Study sessions table created');

    // Create interview sessions table
    await client.query(`
      CREATE TABLE interview_sessions (
        id SERIAL PRIMARY KEY,
        user_id VARCHAR(255) NOT NULL,
        session_id VARCHAR(255) UNIQUE NOT NULL,
        resume_text TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('🎯 Interview sessions table created');

    // Create interview Q&A table
    await client.query(`
      CREATE TABLE interview_qa (
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
    console.log('❓ Interview Q&A table created');

    // Verify tables
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
    console.log('✅ Database reset completed successfully');
    
  } catch (error) {
    console.error('❌ Database reset error:', error.message);
    throw error;
  } finally {
    await pool.end();
  }
}

resetDatabase().catch(console.error);
