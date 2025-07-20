import { recognizeIntent, extractParameters, getTokenInfo, toSmallestUnit, assessRisks, optimizeRoutes } from './AIAgentPipelinePlugin';
import { GaslessDEXAPIPlugin } from './GaslessDEXAPIPlugin';
import { isValidAddress, resolveENS, getAddressType } from '../utils/addressValidation';
import { Wallet } from 'ethers';
import { getNetworkChainConfig } from './tokenRegistry';

const DEMO_PRIVATE_KEY = process.env.DEMO_PRIVATE_KEY;
if (!DEMO_PRIVATE_KEY) {
  throw new Error('DEMO_PRIVATE_KEY environment variable not set');
}
const liveWallet = new Wallet(DEMO_PRIVATE_KEY);
const liveAddress = liveWallet.address;

const testContext = {
  userId: 'test-user',
  wallets: [
    {
      address: liveAddress,
      label: 'Live Wallet',
      network: 'Ethereum',
      tokens: ['ETH', 'USDC', 'WETH']
    }
  ],
  contacts: []
};

const testPrompts = [
  'Swap 100 USDC to ETH from my wallet on Ethereum',
];

function normalizeSwapParams(params: any): any {
  return {
    ...params,
    fromToken: params.fromToken || params.from_token || params.sourceToken,
    toToken: params.toToken || params.to_token || params.targetToken,
    walletAddress: liveAddress,
  };
}

async function runSwapTests() {
  for (const prompt of testPrompts) {
    console.log(`\n---\nPrompt: ${prompt}`);
    const intent = await recognizeIntent(prompt, testContext);
    console.log('Intent Recognition Result:', JSON.stringify(intent, null, 2));
    let params = await extractParameters(prompt, intent, testContext);
    params = normalizeSwapParams(params);
    console.log('Parameter Extraction Result:', JSON.stringify(params, null, 2));
    const risks = await assessRisks(params, [], prompt, intent, testContext);
    console.log('Risk Assessment:', JSON.stringify(risks, null, 2));
    if (intent.type === 'swap' && params.fromToken && params.toToken && params.amount) {
      const network = params.network || 'Ethereum';
      const networkConfig = getNetworkChainConfig(network);
      const fromTokenInfo = getTokenInfo(params.fromToken, network);
      const toTokenInfo = getTokenInfo(params.toToken, network);
      const sellToken = fromTokenInfo?.address || params.fromToken;
      const buyToken = toTokenInfo?.address || params.toToken;
      const sellAmount = toSmallestUnit(params.amount, params.fromToken, network);
      const swapRequest: any = {
        chainId: networkConfig?.id,
        sellToken,
        buyToken,
        sellAmount,
        taker: liveAddress
      };
      console.log('Gasless DEX API Parameters:', JSON.stringify(swapRequest, null, 2));
      const quote = await GaslessDEXAPIPlugin.getSwapQuote(swapRequest);
      console.log('Gasless DEX API Result:', JSON.stringify(quote, null, 2));
    } else if (intent.type === 'swap') {
      console.log('Gasless DEX API Skipped: Missing required swap parameters:', {
        fromToken: params.fromToken,
        toToken: params.toToken,
        amount: params.amount,
        walletAddress: params.walletAddress,
      });
    }
  }
}

runSwapTests(); 