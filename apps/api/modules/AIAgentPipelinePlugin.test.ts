import { AIAgentPipelinePlugin } from './AIAgentPipelinePlugin';

const testContext = {
  userId: 'test-user',
  wallets: [],
  contacts: [],
};

const demoPrompts = [
  'Send 100 USDC to Bob',
  'Transfer 50 ETH to my savings wallet',
  'Send 100 USDC to Bob and 50 USDC to Alice',
  'Split 200 USDC between Bob, Alice, and Charlie',
  'Swap 100 ETH to USDC and send half to Bob',
  'Bridge 100 USDC to Polygon and send to Alice',
  'Swap ETH to USDC, bridge to Arbitrum, send to Bob',
  // Combined/complex prompt for diversity
  'Swap 100 ETH to USDC, bridge to Polygon, then send 50 USDC to Bob and 50 USDC to Alice',
];

async function testIntentRecognition() {
  await AIAgentPipelinePlugin.init(testContext);
  for (const prompt of demoPrompts) {
    try {
      await AIAgentPipelinePlugin.processPrompt(prompt, testContext);
    } catch (e) {
      console.log(`Prompt: "${prompt}"`);
      console.log('Intent Recognition Output:', e.message);
      console.log('---');
    }
  }
  await AIAgentPipelinePlugin.dispose();
}

testIntentRecognition(); 