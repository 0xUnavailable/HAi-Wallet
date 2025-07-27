// Test script to verify HAi Wallet setup
const API_BASE_URL = 'https://hai-wallet-server.onrender.com/api';

async function testSetup() {
    console.log('🧪 Testing HAi Wallet Setup...\n');
    
    const tests = [
        {
            name: 'API Server Connection',
            test: async () => {
                const response = await fetch(`${API_BASE_URL}/relay/chains`);
                return response.ok;
            }
        },
        {
            name: 'NLP Service Connection',
            test: async () => {
                const response = await fetch('http://localhost:8000/process_prompt', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ prompt: 'Send 100 ETH to Bob' })
                });
                return response.ok;
            }
        },
        {
            name: 'Contact Management API',
            test: async () => {
                const response = await fetch(`${API_BASE_URL}/contacts/test_user`);
                return response.status === 200 || response.status === 404;
            }
        },
        {
            name: 'Google Auth Endpoint',
            test: async () => {
                const response = await fetch(`${API_BASE_URL}/auth/google`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ idToken: 'test' })
                });
                return response.status === 400; // Should fail with invalid token
            }
        }
    ];
    
    let passed = 0;
    let total = tests.length;
    
    for (const test of tests) {
        try {
            console.log(`Testing: ${test.name}...`);
            const result = await test.test();
            if (result) {
                console.log(`✅ ${test.name}: PASSED`);
                passed++;
            } else {
                console.log(`❌ ${test.name}: FAILED`);
            }
        } catch (error) {
            console.log(`❌ ${test.name}: FAILED - ${error.message}`);
        }
        console.log('');
    }
    
    console.log(`📊 Test Results: ${passed}/${total} tests passed`);
    
    if (passed === total) {
        console.log('🎉 All tests passed! Your HAi Wallet is ready to use.');
        console.log('\n📝 Next steps:');
        console.log('1. Open http://localhost:8080/demo.html for testing');
        console.log('2. Open http://localhost:8080/index.html for production mode');
        console.log('3. Follow the README.md for detailed usage instructions');
    } else {
        console.log('⚠️  Some tests failed. Please check the setup instructions in README.md');
    }
}

// Run tests if this script is executed directly
if (typeof window === 'undefined') {
    // Node.js environment
    const fetch = require('node-fetch');
    testSetup();
} else {
    // Browser environment
    window.testSetup = testSetup;
    console.log('Run testSetup() in the browser console to test the setup');
} 