// Simple test to verify API response structure
const https = require('https');
const http = require('http');

async function testDuplicateEmailResponse() {
  console.log('🧪 Testing duplicate email API response...\n');

  const testUser = {
    email: 'admin@propai.com', // This should already exist from seeding
    password: 'Test123!@#',
    name: 'Test User',
    role: 'sales_rep'
  };

  const postData = JSON.stringify(testUser);

  const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/auth/add-user',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData)
    }
  };

  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        console.log('Status Code:', res.statusCode);
        console.log('Status Message:', res.statusMessage);
        console.log('Response Headers:', res.headers);
        console.log('Response Body:', data);
        
        try {
          const jsonResponse = JSON.parse(data);
          console.log('\n📋 Parsed Response:');
          console.log('- StatusCode:', jsonResponse.statusCode);
          console.log('- Error:', jsonResponse.error);
          console.log('- Message:', jsonResponse.message);
          console.log('- Details:', jsonResponse.details);
          console.log('- Suggestion:', jsonResponse.suggestion);
          
          if (res.statusCode === 409 && jsonResponse.message) {
            console.log('\n✅ API is returning structured error response!');
            console.log('Frontend should extract: jsonResponse.details or jsonResponse.message');
          } else {
            console.log('\n❌ Unexpected response structure');
          }
        } catch (e) {
          console.log('\n❌ Failed to parse JSON response:', e.message);
        }
        
        resolve();
      });
    });

    req.on('error', (err) => {
      console.error('❌ Request failed:', err.message);
      reject(err);
    });

    req.write(postData);
    req.end();
  });
}

// Test invalid email format too
async function testInvalidEmailResponse() {
  console.log('\n🧪 Testing invalid email format response...\n');

  const testUser = {
    email: 'invalid-email-format',
    password: 'Test123!@#',
    name: 'Test User',
    role: 'sales_rep'
  };

  const postData = JSON.stringify(testUser);

  const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/auth/add-user',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData)
    }
  };

  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        console.log('Status Code:', res.statusCode);
        console.log('Response Body:', data);
        
        try {
          const jsonResponse = JSON.parse(data);
          console.log('\n📋 Parsed Response:');
          console.log('- StatusCode:', jsonResponse.statusCode);
          console.log('- Error:', jsonResponse.error);
          console.log('- Message:', jsonResponse.message);
          console.log('- Details:', jsonResponse.details);
          
          if (res.statusCode === 400 && jsonResponse.message) {
            console.log('\n✅ Invalid email format handled correctly!');
          }
        } catch (e) {
          console.log('\n❌ Failed to parse JSON response:', e.message);
        }
        
        resolve();
      });
    });

    req.on('error', (err) => {
      console.error('❌ Request failed:', err.message);
      reject(err);
    });

    req.write(postData);
    req.end();
  });
}

async function runTests() {
  console.log('🚀 Starting API response structure tests...');
  console.log('Make sure your server is running on http://localhost:3000\n');
  
  try {
    await testDuplicateEmailResponse();
    await testInvalidEmailResponse();
    
    console.log('\n✅ Tests completed!');
    console.log('\n💡 Frontend Integration:');
    console.log('   In your error handler, use: error.response.data.details');
    console.log('   Or fallback to: error.response.data.message');
  } catch (error) {
    console.error('\n❌ Tests failed:', error.message);
    console.log('\n🔧 Make sure:');
    console.log('   1. Your server is running (npm run start:dev)');
    console.log('   2. The server is on port 3000');
    console.log('   3. The /auth/add-user endpoint exists');
  }
}

runTests();