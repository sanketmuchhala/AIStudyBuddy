#!/usr/bin/env node

const http = require('http');

const options = {
  hostname: 'localhost',
  port: 8080,
  path: '/healthz',
  method: 'GET',
  timeout: 5000
};

const req = http.request(options, (res) => {
  console.log(`Health check status: ${res.statusCode}`);
  
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    try {
      const response = JSON.parse(data);
      console.log('Health check response:', response);
      
      if (res.statusCode === 200 && response.status === 'ok') {
        console.log('✅ Health check passed!');
        process.exit(0);
      } else {
        console.log('❌ Health check failed - invalid response');
        process.exit(1);
      }
    } catch (error) {
      console.log('❌ Health check failed - invalid JSON response');
      console.log('Raw response:', data);
      process.exit(1);
    }
  });
});

req.on('error', (error) => {
  console.log('❌ Health check failed - connection error:', error.message);
  process.exit(1);
});

req.on('timeout', () => {
  console.log('❌ Health check failed - timeout');
  req.destroy();
  process.exit(1);
});

req.end();
