// Test script to verify AI features are working
// Run this in the browser console on the deployed site

async function testAIFeatures() {
  console.log('🧪 Testing AI Features...');
  
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
          prompt: 'Hello, can you help me with study tips?',
          model: 'gemini-1.5-flash',
          temperature: 0.7,
          userId: 'test-user'
        })
      });
      
      console.log('✅ Chat response status:', chatResponse.ok);
      
      if (chatResponse.ok) {
        const result = await chatResponse.json();
        console.log('✅ Chat response received:', result.text ? 'Success' : 'No text');
      } else {
        console.log('❌ Chat request failed:', chatResponse.status);
      }
    } else {
      console.log('❌ Health check failed:', response.status);
    }
    
  } catch (error) {
    console.log('❌ Test failed with error:', error.message);
    console.log('💡 This might be a CORS issue. Check the backend CORS configuration.');
  }
}

// Run the test
testAIFeatures();
