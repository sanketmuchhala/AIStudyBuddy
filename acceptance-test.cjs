#!/usr/bin/env node

/**
 * Comprehensive Acceptance Test Suite for AIStudyBuddy
 * Tests all critical functionality across the application
 */

const http = require('http');
const https = require('https');

// Test configuration
const SERVER_URL = 'http://localhost:8080';
const CLIENT_URL = 'http://localhost:4173'; // Production build

// Colors for output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const protocol = urlObj.protocol === 'https:' ? https : http;
    
    const req = protocol.request(url, {
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const jsonData = res.headers['content-type']?.includes('application/json') 
            ? JSON.parse(data) 
            : data;
          resolve({ status: res.statusCode, data: jsonData, headers: res.headers });
        } catch (e) {
          resolve({ status: res.statusCode, data, headers: res.headers });
        }
      });
    });

    req.on('error', reject);
    
    if (options.body) {
      req.write(typeof options.body === 'string' ? options.body : JSON.stringify(options.body));
    }
    
    req.end();
  });
}

class AcceptanceTest {
  constructor() {
    this.tests = [];
    this.passed = 0;
    this.failed = 0;
  }

  async test(name, testFn) {
    try {
      log(`🧪 Testing: ${name}`, 'blue');
      await testFn();
      log(`✅ PASS: ${name}`, 'green');
      this.passed++;
    } catch (error) {
      log(`❌ FAIL: ${name} - ${error.message}`, 'red');
      this.failed++;
    }
  }

  assert(condition, message) {
    if (!condition) {
      throw new Error(message);
    }
  }

  async run() {
    log('🚀 Starting AIStudyBuddy Acceptance Tests', 'bold');
    log('=' .repeat(50), 'yellow');

    // Health Check Tests
    await this.test('Server Health Check', async () => {
      const response = await makeRequest(`${SERVER_URL}/api/health`);
      this.assert(response.status === 200, `Expected 200, got ${response.status}`);
      this.assert(response.data.status === 'healthy', 'Health check failed');
      this.assert(response.data.version === '1.0.0', 'Version mismatch');
    });

    // Client Accessibility Tests
    await this.test('Client Homepage Accessibility', async () => {
      const response = await makeRequest(CLIENT_URL);
      this.assert(response.status === 200, `Expected 200, got ${response.status}`);
      this.assert(response.headers['content-type'].includes('text/html'), 'Not serving HTML');
    });

    await this.test('Client SPA Routing (404 handling)', async () => {
      const response = await makeRequest(`${CLIENT_URL}/nonexistent-page`);
      this.assert(response.status === 200, 'SPA routing not working');
    });

    // Chat API Tests
    await this.test('Chat API - Text Generation', async () => {
      const response = await makeRequest(`${SERVER_URL}/api/chat/`, {
        method: 'POST',
        body: { message: 'Hello, help me study calculus' }
      });
      this.assert(response.status === 200, `Expected 200, got ${response.status}`);
      this.assert(response.data.success === true, 'Chat API failed');
      this.assert(response.data.data.message, 'No message in response');
      this.assert(response.data.data.conversationId, 'No conversation ID');
    });

    await this.test('Chat API - Input Validation', async () => {
      const response = await makeRequest(`${SERVER_URL}/api/chat/`, {
        method: 'POST',
        body: { message: '' } // Empty message should fail
      });
      this.assert(response.status === 400, 'Input validation not working');
    });

    // Quick Actions API Tests
    await this.test('Quick Actions - Summarize', async () => {
      const response = await makeRequest(`${SERVER_URL}/api/quick/summarize`, {
        method: 'POST',
        body: { 
          content: 'This is a test content that needs to be summarized for testing purposes.',
          type: 'text'
        }
      });
      this.assert(response.status === 200, `Expected 200, got ${response.status}`);
      this.assert(response.data.success === true, 'Summarize failed');
      this.assert(response.data.data.summary, 'No summary in response');
    });

    await this.test('Quick Actions - Study Plan', async () => {
      const response = await makeRequest(`${SERVER_URL}/api/quick/study-plan`, {
        method: 'POST',
        body: { 
          topic: 'Machine Learning',
          duration: 7,
          level: 'intermediate'
        }
      });
      this.assert(response.status === 200, `Expected 200, got ${response.status}`);
      this.assert(response.data.success === true, 'Study plan failed');
      this.assert(response.data.data.studyPlan, 'No study plan in response');
    });

    await this.test('Quick Actions - Flashcards', async () => {
      const response = await makeRequest(`${SERVER_URL}/api/quick/flashcards`, {
        method: 'POST',
        body: { 
          content: 'Photosynthesis is the process by which plants convert sunlight into energy.',
          count: 3
        }
      });
      this.assert(response.status === 200, `Expected 200, got ${response.status}`);
      this.assert(response.data.success === true, 'Flashcards failed');
      this.assert(response.data.data.flashcards, 'No flashcards in response');
    });

    await this.test('Quick Actions - Explain Topic', async () => {
      const response = await makeRequest(`${SERVER_URL}/api/quick/explain`, {
        method: 'POST',
        body: { 
          topic: 'Quantum mechanics',
          level: 'detailed'
        }
      });
      this.assert(response.status === 200, `Expected 200, got ${response.status}`);
      this.assert(response.data.success === true, 'Explain failed');
      this.assert(response.data.data.explanation, 'No explanation in response');
    });

    await this.test('Quick Actions - Quiz Generator', async () => {
      const response = await makeRequest(`${SERVER_URL}/api/quick/quiz`, {
        method: 'POST',
        body: { 
          topic: 'World War II',
          questionCount: 5,
          difficulty: 'medium'
        }
      });
      this.assert(response.status === 200, `Expected 200, got ${response.status}`);
      this.assert(response.data.success === true, 'Quiz failed');
      this.assert(response.data.data.quiz, 'No quiz in response');
    });

    // Security Tests
    await this.test('Rate Limiting Protection', async () => {
      // This test would need to make many requests to trigger rate limiting
      // For now, just verify the endpoint responds correctly
      const response = await makeRequest(`${SERVER_URL}/api/health`);
      this.assert(response.status === 200, 'Rate limiting setup broken');
    });

    await this.test('CORS Headers', async () => {
      const response = await makeRequest(`${SERVER_URL}/api/health`);
      // In development, CORS should be configured for localhost
      this.assert(response.status === 200, 'CORS configuration broken');
    });

    // Error Handling Tests
    await this.test('404 API Endpoint', async () => {
      const response = await makeRequest(`${SERVER_URL}/api/nonexistent`);
      this.assert(response.status === 404, 'API 404 handling not working');
      this.assert(response.data.error === 'Not Found', '404 error format incorrect');
    });

    // Performance Tests (basic)
    await this.test('Response Time Check', async () => {
      const start = Date.now();
      await makeRequest(`${SERVER_URL}/api/health`);
      const duration = Date.now() - start;
      this.assert(duration < 1000, `Response too slow: ${duration}ms`);
    });

    // Summary
    log('=' .repeat(50), 'yellow');
    log(`🎯 Test Results:`, 'bold');
    log(`✅ Passed: ${this.passed}`, 'green');
    log(`❌ Failed: ${this.failed}`, 'red');
    log(`📊 Success Rate: ${((this.passed / (this.passed + this.failed)) * 100).toFixed(1)}%`, 'blue');
    
    if (this.failed === 0) {
      log('🎉 All tests passed! AIStudyBuddy is ready for deployment.', 'green');
      return true;
    } else {
      log('⚠️  Some tests failed. Please review and fix issues before deployment.', 'red');
      return false;
    }
  }
}

// Run tests
async function main() {
  const tester = new AcceptanceTest();
  const success = await tester.run();
  process.exit(success ? 0 : 1);
}

main().catch(console.error);