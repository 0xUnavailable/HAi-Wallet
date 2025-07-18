import { recognizeIntent, extractParameters, validateAndEnrich, optimizeRoutes, assessRisks } from './AIAgentPipelinePlugin';

const testContext = {
  userId: 'test-user',
  wallets: [
    {
      address: '0xa11B86d8cb6D0E9C8cD84d50260E910789194915',
      label: 'My Main Wallet',
      network: 'Ethereum',
      tokens: ['ETH', 'USDC']
    }
  ],
  contacts: [
    // Bob intentionally has no address assigned
    { name: 'Bob' },
    { name: 'Alice', address: '0x70997970C51812dc3A010C7d01b50e0d17dc79C8', network: 'Ethereum' }
  ]
};

const demoPrompts = [
  // Detailed and simple, with direct address
  'Send 100 USDC from my wallet (0xa11B86d8cb6D0E9C8cD84d50260E910789194915) to 0x70997970C51812dc3A010C7d01b50e0d17dc79C8 on Ethereum',
  // Detailed and simple, but using Bob (who has no address assigned)
  'Send 50 USDC from my wallet (0xa11B86d8cb6D0E9C8cD84d50260E910789194915) to Bob on Ethereum',
];

async function testFullPipeline() {
  for (const prompt of demoPrompts) {
    try {
      const intent = await recognizeIntent(prompt, testContext);
      const params = await extractParameters(prompt, intent, testContext);
      const enriched = await validateAndEnrich(params, prompt, intent, testContext);
      const routes = await optimizeRoutes(enriched, prompt, intent, testContext);
      const risks = await assessRisks(enriched, routes, prompt, intent, testContext);
      console.log(`Prompt: "${prompt}"`);
      console.log('Intent Recognition Result:', JSON.stringify(intent, null, 2));
      console.log('Parameter Extraction Result:', JSON.stringify(params, null, 2));
      console.log('Validation & Enrichment Result:', JSON.stringify(enriched, null, 2));
      console.log('Route Optimization Result:', JSON.stringify(routes, null, 2));
      console.log('Risk Assessment Result:', JSON.stringify(risks, null, 2));
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