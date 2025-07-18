import { recognizeIntent, extractParameters, validateAndEnrich, optimizeRoutes } from './AIAgentPipelinePlugin';

const testContext = {
  userId: 'test-user',
  wallets: [],
  contacts: [],
};

const demoPrompts = [
  // Simple and detailed
  'Send 100 USDC to Bob on Ethereum',
  // Compound and less detailed
  'Swap 2 ETH for USDC, then send half to Alice and the rest to Bob',
  // Complex and no details
  'Bridge tokens',
];

async function testFullPipeline() {
  for (const prompt of demoPrompts) {
    try {
      const intent = await recognizeIntent(prompt, testContext);
      const params = await extractParameters(prompt, intent, testContext);
      const enriched = await validateAndEnrich(params, prompt, intent, testContext);
      const routes = await optimizeRoutes(enriched, prompt, intent, testContext);
      console.log(`Prompt: "${prompt}"`);
      console.log('Intent Recognition Result:', JSON.stringify(intent, null, 2));
      console.log('Parameter Extraction Result:', JSON.stringify(params, null, 2));
      console.log('Validation & Enrichment Result:', JSON.stringify(enriched, null, 2));
      console.log('Route Optimization Result:', JSON.stringify(routes, null, 2));
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