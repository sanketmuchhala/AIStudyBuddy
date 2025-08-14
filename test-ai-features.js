// Test script to verify AI features are working
// Using built-in fetch (Node.js 18+)

const API_BASE = 'https://ai-study-buddy-backend-production.up.railway.app';

async function testAIFeatures() {
  console.log('🧪 Testing AI Study Buddy Features...\n');

  // Test 1: Health Check
  console.log('1. Testing Health Check...');
  try {
    const healthResponse = await fetch(`${API_BASE}/health`);
    const healthData = await healthResponse.json();
    console.log('✅ Health Check:', healthData);
  } catch (error) {
    console.log('❌ Health Check Failed:', error.message);
  }

  // Test 2: AI Chat
  console.log('\n2. Testing AI Chat...');
  try {
    const chatResponse = await fetch(`${API_BASE}/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Origin': 'http://localhost:5174'
      },
      body: JSON.stringify({
        prompt: 'Hello! Can you help me study mathematics?',
        model: 'gemini-1.5-flash',
        userId: 'test-user-123',
        sessionId: 'test-session-123'
      })
    });
    const chatData = await chatResponse.json();
    console.log('✅ AI Chat Response:', chatData.text ? chatData.text.substring(0, 100) + '...' : chatData);
  } catch (error) {
    console.log('❌ AI Chat Failed:', error.message);
  }

  // Test 3: Study Recommendations
  console.log('\n3. Testing Study Recommendations...');
  try {
    const studyResponse = await fetch(`${API_BASE}/study/recommendations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Origin': 'http://localhost:5174'
      },
      body: JSON.stringify({
        subject: 'Mathematics',
        progress: 75,
        userId: 'test-user-123'
      })
    });
    const studyData = await studyResponse.json();
    console.log('✅ Study Recommendations:', studyData.recommendations ? studyData.recommendations.substring(0, 100) + '...' : studyData);
  } catch (error) {
    console.log('❌ Study Recommendations Failed:', error.message);
  }

  // Test 4: Database Endpoints (if available)
  console.log('\n4. Testing Database Endpoints...');
  try {
    const userResponse = await fetch(`${API_BASE}/api/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        userId: 'test-user-789'
      })
    });
    const userData = await userResponse.json();
    console.log('✅ Create User:', userData);
  } catch (error) {
    console.log('❌ Database Test Failed:', error.message);
  }

  console.log('\n🎉 Testing Complete!');
}

testAIFeatures().catch(console.error);
