// Test script to check backend server status
async function testBackendConnection() {
  console.log('🔍 Testing backend server connection...\n');
  
  const tests = [
    {
      name: 'Backend Health Check',
      url: 'http://localhost:5000/health',
      requiresAuth: false
    },
    {
      name: 'API Root',
      url: 'http://localhost:5000/api',
      requiresAuth: false
    },
    {
      name: 'Dashboard Overview (requires auth)',
      url: 'http://localhost:5000/api/dashboard/overview',
      requiresAuth: true
    }
  ];

  for (const test of tests) {
    try {
      console.log(`Testing: ${test.name}`);
      console.log(`URL: ${test.url}`);
      
      const response = await fetch(test.url);
      const contentType = response.headers.get('content-type');
      
      console.log(`Status: ${response.status} ${response.statusText}`);
      console.log(`Content-Type: ${contentType}`);
      
      if (contentType && contentType.includes('application/json')) {
        const data = await response.json();
        console.log(`Response: ${JSON.stringify(data, null, 2)}`);
      } else {
        const text = await response.text();
        console.log(`Response (first 200 chars): ${text.substring(0, 200)}`);
      }
      
      if (response.ok) {
        console.log('✅ Success\n');
      } else {
        console.log(`❌ Failed with status ${response.status}\n`);
      }
      
    } catch (error) {
      console.log(`❌ Error: ${error.message}\n`);
    }
  }
  
  console.log('🏁 Backend connection test completed!');
}

// Run the test
testBackendConnection();