#!/usr/bin/env node

// Test script to verify NLP service configuration
const config = require('./config.ts');

console.log('🧪 Testing NLP Service Configuration');
console.log('=====================================');

console.log('📋 Configuration:');
console.log(`   - Local URL: ${config.nlp.localUrl}`);
console.log(`   - Deployed URL: ${config.nlp.deployedUrl}`);
console.log(`   - Use Deployed: ${config.nlp.useDeployed}`);
console.log(`   - Current URL: ${config.nlp.getUrl()}`);

console.log('\n🔗 Testing connection...');

// Test the NLP service
async function testNLPConnection() {
  try {
    const response = await fetch(`${config.nlp.getUrl()}/process_prompt`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt: 'Send 100 ETH to Bob' })
    });

    if (response.ok) {
      const data = await response.json();
      console.log('✅ NLP Service is working!');
      console.log('📝 Response:', JSON.stringify(data, null, 2));
    } else {
      console.log('❌ NLP Service returned error:', response.status, response.statusText);
    }
  } catch (error) {
    console.log('❌ Failed to connect to NLP Service:', error.message);
  }
}

testNLPConnection(); 