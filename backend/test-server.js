#!/usr/bin/env node

/**
 * Simple test script to verify backend server functionality
 */

import fetch from 'node-fetch';
import { exec } from 'child_process';
import { setTimeout } from 'timers/promises';

const BASE_URL = 'http://localhost:5000';
const API_URL = `${BASE_URL}/api`;

// Colors for console output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// Test endpoints
const testEndpoints = [
  {
    name: 'Health Check',
    url: `${BASE_URL}/health`,
    method: 'GET'
  },
  {
    name: 'API Root',
    url: API_URL,
    method: 'GET'
  },
  {
    name: 'API Documentation',
    url: `${API_URL}/docs`,
    method: 'GET'
  }
];

async function testEndpoint(endpoint) {
  try {
    const response = await fetch(endpoint.url, {
      method: endpoint.method,
      headers: {
        'Content-Type': 'application/json'
      }
    });

    const data = await response.json();
    
    if (response.ok && data.success) {
      log(`✅ ${endpoint.name}: PASSED`, 'green');
      return true;
    } else {
      log(`❌ ${endpoint.name}: FAILED - ${data.message || 'Unknown error'}`, 'red');
      return false;
    }
  } catch (error) {
    log(`❌ ${endpoint.name}: ERROR - ${error.message}`, 'red');
    return false;
  }
}

async function waitForServer(maxAttempts = 30) {
  for (let i = 0; i < maxAttempts; i++) {
    try {
      const response = await fetch(`${BASE_URL}/health`);
      if (response.ok) {
        return true;
      }
    } catch (error) {
      // Server not ready yet
    }
    
    await setTimeout(1000); // Wait 1 second
    process.stdout.write('.');
  }
  
  return false;
}

async function runTests() {
  log('\n🧪 OpenPrompt Backend Test Suite\n', 'blue');
  
  // Check if server is running
  log('Checking if server is running...', 'yellow');
  process.stdout.write('Waiting for server');
  
  const serverReady = await waitForServer();
  
  if (!serverReady) {
    log('\n❌ Server is not responding. Please start the server first:', 'red');
    log('   npm run dev', 'yellow');
    process.exit(1);
  }
  
  log('\n✅ Server is responding!', 'green');
  
  // Run endpoint tests
  log('\nRunning endpoint tests...\n', 'yellow');
  
  let passed = 0;
  let failed = 0;
  
  for (const endpoint of testEndpoints) {
    const result = await testEndpoint(endpoint);
    if (result) {
      passed++;
    } else {
      failed++;
    }
  }
  
  // Summary
  log('\n📊 Test Results:', 'blue');
  log(`   Passed: ${passed}`, 'green');
  log(`   Failed: ${failed}`, failed > 0 ? 'red' : 'green');
  log(`   Total: ${passed + failed}`, 'blue');
  
  if (failed === 0) {
    log('\n🎉 All tests passed!', 'green');
    process.exit(0);
  } else {
    log('\n❌ Some tests failed!', 'red');
    process.exit(1);
  }
}

// Handle command line arguments
const args = process.argv.slice(2);

if (args.includes('--help') || args.includes('-h')) {
  console.log(`
🧪 OpenPrompt Backend Test Suite

Usage: node test-server.js [options]

Options:
  --help, -h     Show this help message
  --start        Start the server before running tests
  
Examples:
  node test-server.js          # Run tests (server must be running)
  node test-server.js --start  # Start server and run tests
`);
  process.exit(0);
}

if (args.includes('--start')) {
  log('Starting server...', 'yellow');
  
  const serverProcess = exec('npm run dev', (error, stdout, stderr) => {
    if (error) {
      log(`❌ Failed to start server: ${error.message}`, 'red');
      process.exit(1);
    }
  });
  
  // Wait a bit for server to start
  await setTimeout(5000);
}

// Run the tests
runTests().catch(error => {
  log(`❌ Test suite failed: ${error.message}`, 'red');
  process.exit(1);
});