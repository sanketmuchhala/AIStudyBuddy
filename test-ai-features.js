// Test script to verify AI features are working on GitHub Pages
// Run this in the browser console on the deployed site

async function testAIFeatures() {
  console.log('🧪 Testing AI Features on GitHub Pages...');
  
  try {
    // Test 1: Check if the AI service is accessible
    const response = await fetch('https://ai-study-buddy-backend-production.up.railway.app/health', {
      method: 'GET',
      mode: 'cors',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Health check response:', response.ok);
    
    if (response.ok) {
      // Test 2: Try a simple chat request
      const chatResponse = await fetch('https://ai-study-buddy-backend-production.up.railway.app/chat', {
        method: 'POST',
        mode: 'cors',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          prompt: 'Hello, this is a test message from GitHub Pages',
          model: 'gemini-1.5-flash',
          temperature: 0.7,
          userId: 'test-user-github-pages'
        })
      });
      
      if (chatResponse.ok) {
        const result = await chatResponse.json();
        console.log('✅ Chat test successful:', result.text ? 'Response received' : 'No response text');
        return true;
      } else {
        console.error('❌ Chat test failed:', chatResponse.status, chatResponse.statusText);
        return false;
      }
    } else {
      console.error('❌ Health check failed:', response.status, response.statusText);
      return false;
    }
  } catch (error) {
    console.error('❌ Test failed with error:', error);
    return false;
  }
}

// Test CORS specifically
async function testCORS() {
  console.log('🌐 Testing CORS configuration...');
  
  try {
    const response = await fetch('https://ai-study-buddy-backend-production.up.railway.app/health', {
      method: 'GET',
      mode: 'cors',
      headers: {
        'Content-Type': 'application/json',
        'Origin': window.location.origin
      }
    });
    
    console.log('✅ CORS test passed:', response.ok);
    return response.ok;
  } catch (error) {
    console.error('❌ CORS test failed:', error);
    return false;
  }
}

// Run tests
console.log('🚀 Starting AI Features Test Suite...');
console.log('📍 Current location:', window.location.href);
console.log('🏠 Hostname:', window.location.hostname);

Promise.all([
  testAIFeatures(),
  testCORS()
]).then(([aiTest, corsTest]) => {
  console.log('📊 Test Results:');
  console.log('  AI Features:', aiTest ? '✅ PASS' : '❌ FAIL');
  console.log('  CORS:', corsTest ? '✅ PASS' : '❌ FAIL');
  
  if (aiTest && corsTest) {
    console.log('🎉 All tests passed! AI features should work on GitHub Pages.');
  } else {
    console.log('⚠️ Some tests failed. Check the console for details.');
  }
});

// Export for manual testing
window.testAIFeatures = testAIFeatures;
window.testCORS = testCORS;
