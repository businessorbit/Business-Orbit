#!/usr/bin/env node

/**
 * Simple script to start the chat server
 * Run with: node scripts/start-chat-server.js
 * Or: npm run chat:dev
 */

const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 Starting Chat Server...');
console.log('📡 This provides real-time chat features for chapters');
console.log('💡 The app will work without this, but with HTTP-only messaging');
console.log('');

const chatServerPath = path.join(__dirname, '..', 'server', 'chat-server.ts');

const child = spawn('npx', ['tsx', chatServerPath], {
  stdio: 'inherit',
  cwd: path.join(__dirname, '..')
});

child.on('error', (error) => {
  console.error('❌ Failed to start chat server:', error.message);
  console.log('');
  console.log('💡 Make sure you have tsx installed: npm install -g tsx');
  console.log('💡 Or run: npm install tsx --save-dev');
  process.exit(1);
});

child.on('exit', (code) => {
  if (code !== 0) {
    console.error(`❌ Chat server exited with code ${code}`);
    process.exit(code);
  }
});

// Handle Ctrl+C
process.on('SIGINT', () => {
  console.log('\n🛑 Stopping chat server...');
  child.kill('SIGINT');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Stopping chat server...');
  child.kill('SIGTERM');
  process.exit(0);
});
