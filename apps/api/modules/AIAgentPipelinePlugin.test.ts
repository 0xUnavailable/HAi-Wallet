import { recognizeIntent, extractParameters, validateAndEnrich } from './AIAgentPipelinePlugin';

const testContext = {
  userId: 'test-user',
  wallets: [],
  contacts: [],
};

const demoPrompts = [
  // Prompts with likely missing/ambiguous fields for enrichment
  'Send 100 USDT to Bob', // No network specified
  'Bridge 200 USDC', // No recipient or destination network
  'Stake 50 MATIC', // No staking pool or network specified
  'Transfer 0.5 BTC', // No recipient specified
  'Swap 1 ETH to USDC', // No DEX or network specified
  'Send 100 to Alice', // No token or network specified
  'Bridge 100 USDC to Polygon', // No recipient specified
  // More complex/ambiguous
  'Send 100 USDT to Bob, bridge 200 USDC to Polygon, and stake 50 MATIC in a Polygon staking pool',
  'Swap 2 ETH for USDC, then send 50% to Alice and 25% to Bob',
];

async function testFullPipeline() {
  for (const prompt of demoPrompts) {
    try {
      const intent = await recognizeIntent(prompt, testContext);
      const params = await extractParameters(prompt, intent, testContext);
      const enriched = await validateAndEnrich(params, prompt, intent, testContext);
      console.log(`Prompt: "${prompt}"`);
      console.log('Intent Recognition Result:', intent);
      console.log('Parameter Extraction Result:', params);
      console.log('Validation & Enrichment Result:', enriched);
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

testFullPipeline();