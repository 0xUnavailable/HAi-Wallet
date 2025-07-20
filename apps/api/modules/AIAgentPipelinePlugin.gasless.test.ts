import { recognizeIntent, extractParameters, getTokenInfo, toSmallestUnit, assessRisks, optimizeRoutes } from './AIAgentPipelinePlugin';
import { GaslessDEXAPIPlugin } from './GaslessDEXAPIPlugin';
import { ZeroXGaslessDEXAggregatorPlugin } from './ZeroXGaslessDEXAggregatorPlugin';
import { isValidAddress, resolveENS, getAddressType } from '../utils/addressValidation';

const SUPPORTED_NETWORKS: Record<string, number> = {
  'Ethereum': 1,
  'Optimism': 10,
  'Arbitrum': 42161,
};

const testContext = {
  userId: 'test-user',
  wallets: [
    {
      address: '0xa11B86d8cb6D0E9C8cD84d50260E910789194915',
      label: 'My Main Wallet',
      network: 'Ethereum',
      tokens: ['ETH', 'USDC', 'WETH']
    }
  ],
  contacts: [
    { name: 'Bob' },
    { name: 'Alice', address: '0x70997970C51812dc3A010C7d01b50e0d17dc79C8', network: 'Ethereum' }
  ]
};

const testPrompts = [
  'Swap 100 USDC to ETH from my wallet (0xa11B86d8cb6D0E9C8cD84d50260E910789194915) on Ethereum',

];

function normalizeSwapParams(params: any): any {
  return {
    ...params,
    fromToken: params.fromToken || params.from_token || params.sourceToken,
    toToken: params.toToken || params.to_token || params.targetToken,
    walletAddress: params.walletAddress || params.wallet_address || params.sender_wallet,
  };
}

async function runAddressValidationTests() {
  const infuraKey = process.env.INFURA_API_KEY || '';
  for (const prompt of testPrompts) {
    console.log(`\n---\nPrompt: ${prompt}`);
    const intent = await recognizeIntent(prompt, testContext);
    console.log('Intent Recognition Result:', JSON.stringify(intent, null, 2));
    let params = await extractParameters(prompt, intent, testContext);
    params = normalizeSwapParams(params);
    console.log('Parameter Extraction Result:', JSON.stringify(params, null, 2));

    // Risk assessment and ENS/address resolution first
    const risks = await assessRisks(params, [], prompt, intent, testContext);
    console.log('Risk Assessment:', JSON.stringify(risks, null, 2));
    const hasInvalidRecipient = risks.some((risk: any) =>
      risk.severity === 'high' &&
      (risk.issue === 'Invalid ENS name' || risk.issue === 'Invalid recipient address')
    );
    if (hasInvalidRecipient) {
      continue;
    }

    if (intent.type === 'swap' && params.fromToken && params.toToken && params.amount) {
      const network = params.network || 'Ethereum';
      const chainId = SUPPORTED_NETWORKS[network];
      const fromTokenInfo = getTokenInfo(params.fromToken, network);
      const toTokenInfo = getTokenInfo(params.toToken, network);
      const sellToken = fromTokenInfo?.address || params.fromToken;
      const buyToken = toTokenInfo?.address || params.toToken;
      const decimals = fromTokenInfo?.decimals || 18;
      const sellAmount = toSmallestUnit(params.amount, params.fromToken, network);
      const swapRequest: any = {
        chainId,
        sellToken,
        buyToken,
        sellAmount,
        taker: params.walletAddress || testContext.wallets[0].address
      };
      console.log('Gasless DEX API Parameters:', JSON.stringify(swapRequest, null, 2));
      const quote = await GaslessDEXAPIPlugin.getSwapQuote(swapRequest);
      console.log('Gasless DEX API Result:', JSON.stringify(quote, null, 2));
      
      // Show Gasless DEX API specific details if available
      if (quote.length > 0 && quote[0].rawQuote) {
        const rawQuote = quote[0].rawQuote;
        console.log('Gasless DEX API Details:');
        console.log(`- Price Data Available: ${!!rawQuote.priceData}`);
        console.log(`- Quote Data Available: ${!!rawQuote.quoteData}`);
        console.log(`- Submit Result: ${rawQuote.submitResult ? 'Success' : 'Not submitted'}`);
        console.log(`- Status Result: ${rawQuote.statusResult ? 'Available' : 'Not checked'}`);
        console.log(`- Has Sufficient Balance: ${rawQuote.hasSufficientBalance}`);
      }
      
      // Note: Route recommendations removed since 0x API already aggregates routes
      console.log('Note: Route recommendations skipped - 0x Gasless API already aggregates routes for optimal pricing');
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

runAddressValidationTests(); 