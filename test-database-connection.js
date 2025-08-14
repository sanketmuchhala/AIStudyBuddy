import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv';
dotenv.config();

// Test database connection with Railway
async function testDatabaseConnection() {
  console.log('🔧 Testing database connection...');
  
  const DATABASE_URL = process.env.DATABASE_URL;
  
  if (!DATABASE_URL) {
    console.error('❌ DATABASE_URL environment variable is not set');
    console.log('💡 Make sure to set DATABASE_URL in your Railway service or .env file');
    return;
  }

  console.log('🔗 Using DATABASE_URL:', DATABASE_URL.substring(0, 20) + '...');

  const pool = new Pool({
    connectionString: DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
  });

  try {
    // Test basic connection
    console.log('📡 Attempting to connect...');
    const client = await pool.connect();
    console.log('✅ Database connection successful!');

    // Test database version
    const versionResult = await client.query('SELECT version()');
    console.log('🗃️ PostgreSQL version:', versionResult.rows[0].version.split(' ')[0]);

    // Test if tables exist
    const tablesResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);
    
    console.log('📋 Existing tables:');
    if (tablesResult.rows.length === 0) {
      console.log('   No tables found - database needs initialization');
    } else {
      tablesResult.rows.forEach(row => {
        console.log(`   - ${row.table_name}`);
      });
    }

    // Test table creation (initialize if needed)
    console.log('🔧 Testing table creation...');
    
    // Create users table
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        user_id VARCHAR(255) UNIQUE NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        last_active TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create chat_sessions table
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

    // Create chat_messages table
    await client.query(`
      CREATE TABLE IF NOT EXISTS chat_messages (
        id SERIAL PRIMARY KEY,
        session_id VARCHAR(255) NOT NULL,
        role VARCHAR(20) NOT NULL CHECK (role IN ('user', 'assistant')),
        content TEXT NOT NULL,
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create study_sessions table
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

    // Create interview_sessions table
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

    // Create interview_qa table
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

    console.log('✅ All tables created/verified successfully');

    // Test insert/query
    console.log('🧪 Testing data operations...');
    
    // Insert test user
    const testUserId = 'test-user-' + Date.now();
    await client.query(
      'INSERT INTO users (user_id) VALUES ($1) ON CONFLICT (user_id) DO NOTHING',
      [testUserId]
    );

    // Query test user
    const userResult = await client.query(
      'SELECT * FROM users WHERE user_id = $1',
      [testUserId]
    );

    if (userResult.rows.length > 0) {
      console.log('✅ Data operations working correctly');
      
      // Cleanup test data
      await client.query('DELETE FROM users WHERE user_id = $1', [testUserId]);
      console.log('🧹 Test data cleaned up');
    }

    // Final tables check
    const finalTablesResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);
    
    console.log('📋 Final table list:');
    finalTablesResult.rows.forEach(row => {
      console.log(`   ✓ ${row.table_name}`);
    });

    client.release();
    console.log('🎉 Database test completed successfully!');

  } catch (error) {
    console.error('❌ Database test failed:', error.message);
    console.error('🔍 Error details:', error);
    
    if (error.message.includes('ENOTFOUND') || error.message.includes('ECONNREFUSED')) {
      console.log('💡 Connection tips:');
      console.log('   - Check if DATABASE_URL is correct');
      console.log('   - Verify Railway PostgreSQL service is running');
      console.log('   - Check network connectivity');
    } else if (error.message.includes('authentication')) {
      console.log('💡 Authentication tips:');
      console.log('   - Verify database username and password');
      console.log('   - Check if DATABASE_URL includes correct credentials');
    } else if (error.message.includes('SSL')) {
      console.log('💡 SSL tips:');
      console.log('   - Make sure SSL configuration is correct for production');
      console.log('   - Try adding ?sslmode=require to DATABASE_URL');
    }
  } finally {
    await pool.end();
  }
}

// Run the test
testDatabaseConnection().then(() => {
  console.log('🏁 Test script completed');
  process.exit(0);
}).catch((error) => {
  console.error('💥 Test script failed:', error);
  process.exit(1);
});