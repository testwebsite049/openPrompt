// Test script for like and share functionality
// This script validates the backend API endpoints

import fetch from 'node-fetch';

const API_BASE = 'http://localhost:5000/api';
const TEST_PROMPT_ID = '507f1f77bcf86cd799439011'; // Example ObjectId

// Test like functionality
async function testLikeFunctionality() {
  console.log('\n=== Testing Like Functionality ===');
  
  try {
    // Test toggle like
    console.log('Testing toggle like...');
    const likeResponse = await fetch(`${API_BASE}/prompts/${TEST_PROMPT_ID}/like`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Session-ID': 'test-session-123'
      }
    });
    
    if (likeResponse.ok) {
      const likeData = await likeResponse.json();
      console.log('✅ Like toggle response:', likeData);
    } else {
      console.log('❌ Like toggle failed:', likeResponse.status);
    }
    
    // Test like status
    console.log('Testing like status...');
    const statusResponse = await fetch(`${API_BASE}/prompts/${TEST_PROMPT_ID}/like-status`, {
      headers: {
        'X-Session-ID': 'test-session-123'
      }
    });
    
    if (statusResponse.ok) {
      const statusData = await statusResponse.json();
      console.log('✅ Like status response:', statusData);
    } else {
      console.log('❌ Like status failed:', statusResponse.status);
    }
    
  } catch (error) {
    console.log('❌ Like functionality error:', error.message);
  }
}

// Test share functionality
async function testShareFunctionality() {
  console.log('\n=== Testing Share Functionality ===');
  
  try {
    const shareTypes = ['copy', 'twitter', 'facebook', 'linkedin', 'email'];
    
    for (const shareType of shareTypes) {
      console.log(`Testing share type: ${shareType}...`);
      
      const shareResponse = await fetch(`${API_BASE}/prompts/${TEST_PROMPT_ID}/share`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Session-ID': 'test-session-123'
        },
        body: JSON.stringify({ shareType })
      });
      
      if (shareResponse.ok) {
        const shareData = await shareResponse.json();
        console.log(`✅ Share ${shareType} response:`, {
          shareType: shareData.data?.shareType,
          sharesCount: shareData.data?.sharesCount,
          hasShareUrls: !!shareData.data?.shareUrls
        });
      } else {
        console.log(`❌ Share ${shareType} failed:`, shareResponse.status);
      }
    }
    
  } catch (error) {
    console.log('❌ Share functionality error:', error.message);
  }
}

// Test prompts endpoint with new fields
async function testPromptsEndpoint() {
  console.log('\n=== Testing Prompts Endpoint ===');
  
  try {
    const response = await fetch(`${API_BASE}/prompts?limit=5`);
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Prompts endpoint response:');
      
      if (data.data?.prompts?.length > 0) {
        const prompt = data.data.prompts[0];
        console.log('Sample prompt fields:', {
          _id: prompt._id,
          title: prompt.title,
          likes: prompt.likes,
          shares: prompt.shares,
          views: prompt.views,
          downloads: prompt.downloads
        });
      }
    } else {
      console.log('❌ Prompts endpoint failed:', response.status);
    }
    
  } catch (error) {
    console.log('❌ Prompts endpoint error:', error.message);
  }
}

// Main test function
async function runTests() {
  console.log('🚀 Starting Like & Share Functionality Tests...');
  console.log('Note: Make sure backend server is running on port 5000');
  
  await testPromptsEndpoint();
  await testLikeFunctionality();
  await testShareFunctionality();
  
  console.log('\n✨ Tests completed!');
}

// Export for use
export { runTests, testLikeFunctionality, testShareFunctionality, testPromptsEndpoint };

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runTests();
}