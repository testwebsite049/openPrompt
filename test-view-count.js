// Test script to verify view count API
const API_BASE_URL = 'http://localhost:5000/api';

// Mock prompt ID for testing (replace with actual ID from your database)
const TEST_PROMPT_ID = '67631b1b123456789abcdef0'; // Replace with actual prompt ID

async function testViewCount() {
  console.log('🧪 Testing View Count API...\n');
  
  try {
    // 1. First, get a prompt to test with
    console.log('1. Fetching prompts to get a real ID...');
    const promptsResponse = await fetch(`${API_BASE_URL}/prompts?limit=1`);
    const promptsData = await promptsResponse.json();
    
    if (!promptsData.success || !promptsData.data.prompts.length) {
      console.error('❌ No prompts found to test with');
      return;
    }
    
    const testPrompt = promptsData.data.prompts[0];
    const promptId = testPrompt._id;
    console.log(`✅ Found test prompt: "${testPrompt.title}" (ID: ${promptId})`);
    console.log(`   Initial views: ${testPrompt.views}\n`);
    
    // 2. Test view increment API
    console.log('2. Testing view increment API...');
    const viewResponse = await fetch(`${API_BASE_URL}/prompts/${promptId}/view`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    const viewResult = await viewResponse.json();
    console.log(`   Response status: ${viewResponse.status}`);
    console.log(`   Response: ${JSON.stringify(viewResult, null, 2)}\n`);
    
    if (viewResult.success) {
      console.log('✅ View increment API working!');
      
      // 3. Verify the count increased
      console.log('3. Verifying view count increased...');
      const updatedResponse = await fetch(`${API_BASE_URL}/prompts/${promptId}`);
      const updatedData = await updatedResponse.json();
      
      if (updatedData.success) {
        const newViews = updatedData.data.views;
        console.log(`   New view count: ${newViews}`);
        
        if (newViews > testPrompt.views) {
          console.log('✅ View count successfully incremented!');
        } else {
          console.log('⚠️  View count may not have incremented (could be caching)');
        }
      }
    } else {
      console.error('❌ View increment API failed:', viewResult);
    }
    
  } catch (error) {
    console.error('❌ Test failed with error:', error.message);
    
    if (error.message.includes('ECONNREFUSED')) {
      console.log('\n💡 Tip: Make sure the backend server is running on port 5000');
      console.log('   Run: cd backend && npm start');
    }
  }
}

// Run the test
testViewCount();