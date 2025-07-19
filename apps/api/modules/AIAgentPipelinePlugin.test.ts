import { recognizeIntent, extractParameters, getTokenInfo, toSmallestUnit, assessRisks } from './AIAgentPipelinePlugin';
import { ZeroXDEXAggregatorPlugin } from './ZeroXDEXAggregatorPlugin';
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

const prompt = 'Swap 100 USDC to WETH from my wallet (0xa11B86d8cb6D0E9C8cD84d50260E910789194915) on Ethereum';

function resolveWalletAddress(raw: string | undefined, context: any): string {
  if (!raw) return context.wallets?.[0]?.address || '';
  const match = raw.match(/0x[a-fA-F0-9]{40}/);
  if (match) return match[0];
  if (raw.toLowerCase().includes('my wallet') || raw.toLowerCase().includes('my main wallet')) {
    return context.wallets?.[0]?.address || '';
  }
  return raw; // fallback to whatever was extracted
}

async function testSwapQuotePipeline() {
  try {
    // Step 1: Intent recognition
    const intent = await recognizeIntent(prompt, testContext);
    console.log('Intent Recognition Result:', JSON.stringify(intent, null, 2));

    // Step 2: Parameter extraction
    const params = await extractParameters(prompt, intent, testContext);
    console.log('Parameter Extraction Result:', JSON.stringify(params, null, 2));

    // Check for required fields
    if (!params.fromToken || !params.toToken || !params.amount) {
      console.log('Missing required swap parameters:', {
        fromToken: params.fromToken,
        toToken: params.toToken,
        amount: params.amount,
      });
      return;
    }

    // Step 3: Map token symbols and network to addresses and build 0x Gasless API query
    const network = params.network || 'Ethereum';
    const chainId = SUPPORTED_NETWORKS[network];
    const fromTokenInfo = getTokenInfo(params.fromToken, network);
    const toTokenInfo = getTokenInfo(params.toToken, network);
    const sellToken = fromTokenInfo?.address || params.fromToken;
    const buyToken = toTokenInfo?.address || params.toToken;
    const decimals = fromTokenInfo?.decimals || 18;
    const sellAmount = toSmallestUnit(params.amount, params.fromToken, network);
    // taker is the recipient of the bought tokens, fallback to sender if not specified
    const taker = resolveWalletAddress(params.toAddress, testContext) || resolveWalletAddress(params.fromAddress, testContext);
    const swapRequest = {
      chainId,
      sellToken,
      buyToken,
      sellAmount,
      taker,
    };
    console.log('Swap Quote Query Parameters:', JSON.stringify(swapRequest, null, 2));
    const quote = await ZeroXDEXAggregatorPlugin.getSwapQuote(swapRequest as any);
    console.log('0x Gasless API Swap Quote:', JSON.stringify(quote, null, 2));
    console.log('---');
  } catch (e) {
    if (typeof e === 'object' && e && 'message' in e) {
      // @ts-ignore
      console.log('Error:', e.message);
    } else {
      console.log('Error:', e);
    }
    console.log('---');
  }
}

const testPrompts = [
  // 1. Valid ENS name (should resolve to a valid address)
  'Send 10 USDC to vitalik.eth on Ethereum',
  // 2. Invalid ENS name (should trigger invalid ENS warning)
  'Send 10 USDC to notarealensnamethatdoesnotexist.eth on Ethereum',
  // 3. Valid EOA address (should pass validation)
  'Send 10 USDC to 0xa11B86d8cb6D0E9C8cD84d50260E910789194915 on Ethereum',
  // 4. Contract address (should warn for contract)
  'Send 10 USDC to 0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2 on Ethereum', // WETH contract
  // 5. Invalid address (should trigger invalid address warning)
  'Send 10 USDC to 0x1234INVALIDADDRESS on Ethereum',
];

async function runAddressValidationTests() {
  const infuraKey = process.env.INFURA_API_KEY || '';
  for (const prompt of testPrompts) {
    console.log(`\n---\nPrompt: ${prompt}`);
    const intent = await recognizeIntent(prompt, testContext);
    console.log('Intent Recognition Result:', JSON.stringify(intent, null, 2));
    const params = await extractParameters(prompt, intent, testContext);
    console.log('Parameter Extraction Result:', JSON.stringify(params, null, 2));
    // Run risk assessment to test address validation
    const risks = await assessRisks(params, [], prompt, intent, testContext);
    console.log('Risk Assessment:', JSON.stringify(risks, null, 2));

    // Direct ENS/address lookup for comparison
    const recipient = params.toAddress || params.recipient;
    const network = params.network || 'Ethereum';
    if (recipient) {
      if (typeof recipient === 'string' && recipient.endsWith('.eth')) {
        try {
          const ensResolved = await resolveENS({ ensName: recipient, network, infuraKey });
          console.log('Direct ENS Resolution:', ensResolved);
        } catch (e) {
          console.log('Direct ENS Resolution Error:', e);
        }
      } else if (typeof recipient === 'string') {
        const valid = isValidAddress(recipient);
        console.log('Direct Address Validity:', valid);
        if (valid) {
          try {
            const type = await getAddressType({ address: recipient, network, infuraKey });
            console.log('Direct Address Type:', type);
          } catch (e) {
            console.log('Direct Address Type Error:', e);
          }
        }
      }
    }
  }
}

runAddressValidationTests();