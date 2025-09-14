#!/usr/bin/env node

import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(__dirname, '.env') });

console.log(`
🚀 OpenPrompt Backend Startup Script

Environment: ${process.env.NODE_ENV || 'development'}
Port: ${process.env.PORT || 5000}
MongoDB: ${process.env.MONGODB_URI || 'mongodb://localhost:27017/openprompt'}

Starting up...
`);

// Check if .env file exists
const envPath = join(__dirname, '.env');
if (!fs.existsSync(envPath)) {
  console.warn(`
⚠️  WARNING: .env file not found!

Please create a .env file based on .env.example:
1. Copy .env.example to .env
2. Update the configuration values
3. Run the script again

Creating .env from .env.example...
`);
  
  const examplePath = join(__dirname, '.env.example');
  if (fs.existsSync(examplePath)) {
    fs.copyFileSync(examplePath, envPath);
    console.log('✅ .env file created from .env.example');
    console.log('Please update the values in .env and restart the server.');
    process.exit(1);
  }
}

// Check if uploads directory exists
const uploadsDir = join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  fs.mkdirSync(join(uploadsDir, 'images'), { recursive: true });
  console.log('✅ Created uploads directories');
}

// Function to start the server
function startServer() {
  const serverPath = join(__dirname, 'src', 'server.js');
  
  if (!fs.existsSync(serverPath)) {
    console.error('❌ Server file not found:', serverPath);
    process.exit(1);
  }
  
  const nodeArgs = process.env.NODE_ENV === 'development' 
    ? ['--inspect'] 
    : [];
  
  const server = spawn('node', [...nodeArgs, serverPath], {
    stdio: 'inherit',
    env: { ...process.env }
  });
  
  server.on('error', (err) => {
    console.error('❌ Failed to start server:', err);
    process.exit(1);
  });
  
  server.on('exit', (code) => {
    if (code !== 0) {
      console.error(`❌ Server exited with code ${code}`);
      process.exit(code);
    }
  });
  
  // Handle graceful shutdown
  process.on('SIGINT', () => {
    console.log('\n🛑 Received SIGINT, shutting down gracefully...');
    server.kill('SIGINT');
  });
  
  process.on('SIGTERM', () => {
    console.log('\n🛑 Received SIGTERM, shutting down gracefully...');
    server.kill('SIGTERM');
  });
}

// Check if this is the first run (optional seeding)
const args = process.argv.slice(2);
if (args.includes('--seed')) {
  console.log('🌱 Seeding database first...');
  
  const seedPath = join(__dirname, 'utils', 'seedDatabase.js');
  const seedProcess = spawn('node', [seedPath], {
    stdio: 'inherit',
    env: { ...process.env }
  });
  
  seedProcess.on('exit', (code) => {
    if (code === 0) {
      console.log('✅ Database seeding completed');
      startServer();
    } else {
      console.error(`❌ Database seeding failed with code ${code}`);
      process.exit(1);
    }
  });
} else {
  startServer();
}