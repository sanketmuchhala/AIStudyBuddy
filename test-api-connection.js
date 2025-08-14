// Test script for AI Study Buddy API connection
const BASE_URL = 'https://ai-study-buddy-backend-production.up.railway.app';
const ORIGIN = 'http://localhost:5176';

async function testEndpoint(name, url, options = {}) {
  try {
    console.log(`\n🧪 Testing ${name}...`);
    console.log(`📍 URL: ${url}`);
    
    const startTime = Date.now();
    const response = await fetch(url, {
      headers: { 
        'Content-Type': 'application/json',
        'Origin': ORIGIN 
      },
      ...options
    });
    
    const duration = Date.now() - startTime;
    const data = await response.json();
    
    if (response.ok) {
      console.log(`✅ ${name}: ${response.status} (${duration}ms)`);
      console.log(`📄 Response:`, JSON.stringify(data, null, 2));
    } else {
      console.log(`❌ ${name}: ${response.status} (${duration}ms)`);
      console.log(`📄 Error:`, JSON.stringify(data, null, 2));
    }
    
    return { success: response.ok, data, duration };
  } catch (error) {
    console.error(`💥 ${name} failed:`, error.message);
    return { success: false, error: error.message, duration: 0 };
  }
}

async function runTests() {
  console.log('🚀 AI Study Buddy API Connection Test');
  console.log(`🔗 Backend: ${BASE_URL}`);
  console.log(`🌍 Origin: ${ORIGIN}`);
  console.log(`⏰ Started: ${new Date().toISOString()}\n`);

  const results = [];

  // Test 1: Health Check
  const health = await testEndpoint('Health Check', `${BASE_URL}/health`);
  results.push({ name: 'Health Check', ...health });

  // Test 2: Basic Chat
  const chat = await testEndpoint('AI Chat', `${BASE_URL}/chat`, {
    method: 'POST',
    body: JSON.stringify({
      prompt: 'Hello! I need help studying mathematics. Can you give me a brief study tip?',
      model: 'gemini-1.5-flash',
      temperature: 0.7,
      userId: 'test-user-12345'
    })
  });
  results.push({ name: 'AI Chat', ...chat });

  // Test 3: Study Recommendations
  const study = await testEndpoint('Study Recommendations', `${BASE_URL}/study/recommendations`, {
    method: 'POST',
    body: JSON.stringify({
      subject: 'JavaScript',
      progress: 60,
      userId: 'test-user-12345'
    })
  });
  results.push({ name: 'Study Recommendations', ...study });

  // Test 4: Backend Dashboard
  const dashboard = await testEndpoint('Backend Dashboard', `${BASE_URL}/`, {
    method: 'GET',
    headers: {
      'Accept': 'text/html'
    }
  });
  results.push({ name: 'Backend Dashboard', success: dashboard.success });

  // Summary
  console.log('\n📊 TEST SUMMARY');
  console.log('='.repeat(50));
  
  const passed = results.filter(r => r.success).length;
  const total = results.length;
  
  results.forEach(result => {
    const status = result.success ? '✅ PASS' : '❌ FAIL';
    const duration = result.duration ? ` (${result.duration}ms)` : '';
    console.log(`${status} ${result.name}${duration}`);
  });
  
  console.log('='.repeat(50));
  console.log(`📈 Results: ${passed}/${total} tests passed`);
  
  if (passed === total) {
    console.log('🎉 All tests passed! Frontend should connect successfully.');
    console.log('💡 Next steps:');
    console.log('   1. Open http://localhost:5176/AIStudyBuddy/');
    console.log('   2. Click "AI Chat" or "AI Assistant" buttons');
    console.log('   3. Test the functionality in your browser');
  } else {
    console.log('⚠️  Some tests failed. Check the error details above.');
  }
  
  console.log(`⏰ Completed: ${new Date().toISOString()}`);
}

runTests().catch(console.error);