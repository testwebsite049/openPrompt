// CORS Test Utility
// This utility helps debug CORS issues

const API_BASE_URL = 'http://localhost:5000/api';

export const testCORS = async () => {
  console.log('🧪 Testing CORS configuration...');
  
  try {
    // Test 1: Simple GET request
    console.log('📝 Test 1: Simple GET request to /cors-test');
    const response1 = await fetch(`${API_BASE_URL}/cors-test`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    if (response1.ok) {
      const data1 = await response1.json();
      console.log('✅ Simple GET request successful:', data1);
    } else {
      console.log('❌ Simple GET request failed:', response1.status, response1.statusText);
    }
    
    // Test 2: Request with session header
    console.log('📝 Test 2: GET request with X-Session-ID header');
    const response2 = await fetch(`${API_BASE_URL}/cors-test`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-Session-ID': 'test-session-123'
      }
    });
    
    if (response2.ok) {
      const data2 = await response2.json();
      console.log('✅ Request with session header successful:', data2);
    } else {
      console.log('❌ Request with session header failed:', response2.status, response2.statusText);
    }
    
    // Test 3: POST request (which triggers preflight)
    console.log('📝 Test 3: POST request (triggers CORS preflight)');
    const response3 = await fetch(`${API_BASE_URL}/cors-test`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Session-ID': 'test-session-123'
      },
      body: JSON.stringify({ test: true })
    });
    
    if (response3.ok) {
      const data3 = await response3.json();
      console.log('✅ POST request successful:', data3);
    } else {
      console.log('❌ POST request failed:', response3.status, response3.statusText);
    }
    
    // Test 4: Actual prompts endpoint
    console.log('📝 Test 4: Real prompts API endpoint');
    const response4 = await fetch(`${API_BASE_URL}/prompts?limit=1`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-Session-ID': 'test-session-123'
      }
    });
    
    if (response4.ok) {
      const data4 = await response4.json();
      console.log('✅ Prompts API request successful:', {
        success: data4.success,
        promptCount: data4.data?.prompts?.length || 0,
        total: data4.data?.pagination?.total || 0
      });
    } else {
      console.log('❌ Prompts API request failed:', response4.status, response4.statusText);
    }
    
    console.log('🎉 CORS testing completed!');
    
  } catch (error) {
    console.error('❌ CORS test failed with error:', error);
    
    if (error instanceof TypeError && error.message.includes('fetch')) {
      console.log('💡 This looks like a network error. Check if:');
      console.log('   1. Backend server is running on http://localhost:5000');
      console.log('   2. No firewall is blocking the connection');
      console.log('   3. No proxy is interfering with requests');
    } else if (error instanceof Error && error.message.includes('CORS')) {
      console.log('💡 This is a CORS error. Check if:');
      console.log('   1. Backend CORS configuration allows your origin');
      console.log('   2. Required headers are allowed in CORS config');
      console.log('   3. Credentials are properly configured');
    }
  }
};

// Auto-test CORS on load in development
if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
  // Add a small delay to let everything load
  setTimeout(() => {
    testCORS();
  }, 2000);
}

export default testCORS;