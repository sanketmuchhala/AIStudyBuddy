#!/usr/bin/env node

/**
 * Production Mode Integration Test
 * Tests the complete production setup with static file serving
 */

const http = require('http');

const SERVER_URL = 'http://localhost:8080';

function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const req = http.request(url, {
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

async function testProductionSetup() {
  console.log('🚀 Testing Production Setup...');
  
  try {
    // Test static file serving
    console.log('📂 Testing static file serving...');
    const homeResponse = await makeRequest(SERVER_URL);
    if (homeResponse.status === 200 && homeResponse.data.includes('html')) {
      console.log('✅ Static files served correctly');
    } else {
      throw new Error('Static file serving failed');
    }

    // Test SPA routing
    console.log('🔄 Testing SPA routing...');
    const spaResponse = await makeRequest(`${SERVER_URL}/chat`);
    if (spaResponse.status === 200 && spaResponse.data.includes('html')) {
      console.log('✅ SPA routing works');
    } else {
      throw new Error('SPA routing failed');
    }

    // Test API functionality
    console.log('🔌 Testing API endpoints...');
    const apiResponse = await makeRequest(`${SERVER_URL}/api/health`);
    if (apiResponse.status === 200 && apiResponse.data.environment === 'production') {
      console.log('✅ API endpoints working in production');
    } else {
      throw new Error('API not working in production');
    }

    // Test security headers
    console.log('🔒 Testing security headers...');
    const securityResponse = await makeRequest(SERVER_URL);
    const headers = securityResponse.headers;
    if (headers['x-frame-options'] && headers['strict-transport-security']) {
      console.log('✅ Security headers present');
    } else {
      throw new Error('Security headers missing');
    }

    console.log('🎉 Production setup test PASSED!');
    return true;
  } catch (error) {
    console.error(`❌ Production test FAILED: ${error.message}`);
    return false;
  }
}

testProductionSetup().then(success => {
  process.exit(success ? 0 : 1);
}).catch(console.error);