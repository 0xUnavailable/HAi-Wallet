import { recognizeIntent, extractParameters } from './AIAgentPipelinePlugin';

const testContext = {
  userId: 'test-user',
  wallets: [],
  contacts: [],
};

const demoPrompts = [
  "Send 0.5 BTC to John's wallet address 1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa",
  "Transfer 1000 XRP to my friend Sarah’s Ripple wallet",
  "Deposit 250 DAI into my DeFi lending protocol on Ethereum",
  "Buy 500 USDT using my ETH balance on Uniswap",
  "Withdraw 0.1 ETH from my Binance account to my MetaMask wallet",
  "Swap 2 ETH for USDC on SushiSwap, then send 50% to Alice and 25% to Bob",
  "Bridge 500 USDC from Ethereum to Avalanche, swap half to AVAX, and send the AVAX to Charlie",
  "Convert 0.3 BTC to ETH on Coinbase, transfer 0.1 ETH to my hardware wallet, and stake the rest on Lido",
  "Send 100 USDT to Bob, bridge 200 USDC to Polygon, and stake 50 MATIC in a Polygon staking pool",
  "Swap 1000 DAI to LINK on Curve, send 20 LINK to Alice, and bridge the remaining LINK to Optimism",
  "If the price of ETH is above $3000, swap 1 ETH for USDC on lave Uniswap, bridge 50% to Arbitrum, and send the rest to Bob’s Arbitrum wallet",
  "Split 1000 USDC equally among Bob, Alice, Charles and if the gas fee is below 10 MATIC, only then send to their Polygon wallets",
  "Swap 0.5 ETH to DAI on 1inch, use 50% to buy LINK, bridge the LINK to Arbitrum, and stake it in a yield farming pool",
];

async function testIntentAndParameterExtraction() {
  for (const prompt of demoPrompts) {
    try {
      const intent = await recognizeIntent(prompt, testContext);
      const params = await extractParameters(prompt, intent, testContext);
      console.log(`Prompt: "${prompt}"`);
      console.log('Intent Recognition Result:', intent);
      console.log('Parameter Extraction Result:', params);
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

testIntentAndParameterExtraction();