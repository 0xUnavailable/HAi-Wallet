import { recognizeIntent } from './AIAgentPipelinePlugin';

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
  'Swap 100 ETH to USDC, bridge to Polygon, then send 50 USDC to Bob and 50 USDC to Alice',
];

async function testIntentRecognition() {
  for (const prompt of demoPrompts) {
    try {
      const intent = await recognizeIntent(prompt, testContext);
      console.log(`Prompt: "${prompt}"`);
      console.log('Intent Recognition Result:', intent);
      console.log('---');
    } catch (e) {
      console.log(`Prompt: "${prompt}"`);
      if (typeof e === 'object' && e && 'message' in e) {
        // @ts-ignore
        console.log('Error:', e.message);
      } else {
        console.log('Error:', e);
      }
      console.log('---');
    }
  }
}

testIntentRecognition();