import { recognizeIntent, extractParameters, validateAndEnrich, optimizeRoutes, assessRisks, executeTransaction } from './AIAgentPipelinePlugin';
import { TransferAPIPlugin } from './TransferAPIPlugin';
import { isValidAddress, resolveENS, getAddressType } from '../utils/addressValidation';
import { createPublicClient, http, formatEther } from 'viem';
import { Wallet } from 'ethers';

const SUPPORTED_NETWORKS: Record<string, number> = {
  'Ethereum': 1,
  'Optimism': 10,
  'Arbitrum': 42161,
  'Sepolia': 11155111,
};

// Get live wallet address from private key
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
      network: 'Sepolia',
      tokens: ['ETH']
    }
  ],
  contacts: []
};

const testPrompts = [
  `Transfer 0.00001 ETH to 0x90889C14149Bf930B6824789431B8479aaB8e5ee on Sepolia`
];

function normalizeNetwork(network: any): string {
  if (typeof network === 'string') return network;
  if (network && typeof network.value === 'string') return network.value;
  return String(network);
}

function normalizeTransferParams(params: any): any {
  return {
    ...params,
    amount: params.amount || params.quantity || params.value,
    token: params.token || params.fromToken || params.currency,
    recipient: params.recipient || params.toAddress || params.destination,
    network: normalizeNetwork(params.network),
    walletAddress: liveAddress,
  };
}

async function getBaseSepoliaBalance(address: string) {
  const client = createPublicClient({
    chain: {
      id: 84532,
      name: 'Base Sepolia',
      network: 'base-sepolia',
      nativeCurrency: { name: 'Base Sepolia Ether', symbol: 'ETH', decimals: 18 },
      rpcUrls: { default: { http: [process.env.BASE_SEPOLIA_RPC_URL || 'https://base-sepolia.public.blastapi.io'] } },
      blockExplorers: { default: { name: 'Blockscout', url: 'https://base-sepolia.blockscout.com' } },
      contracts: {}
    },
    transport: http(process.env.BASE_SEPOLIA_RPC_URL || 'https://base-sepolia.public.blastapi.io'),
  });
  const checksummed = address.toLowerCase() as `0x${string}`;
  const balance = await client.getBalance({ address: checksummed });
  return formatEther(balance);
}

async function runTransferTests() {
  for (const prompt of testPrompts) {
    console.log(`\n---\nPrompt: ${prompt}`);
    
    // Step 1: Intent Recognition
    const intent = await recognizeIntent(prompt, testContext);
    console.log('Intent Recognition Result:', JSON.stringify(intent, null, 2));
    
    if (intent.type !== 'transfer') {
      console.log('Skipping: Not a transfer intent');
      continue;
    }
    
    // Step 2: Parameter Extraction
    let params = await extractParameters(prompt, intent, testContext);
    params = normalizeTransferParams(params);
    console.log('Parameter Extraction Result:', JSON.stringify(params, null, 2));
    
    // Step 3: Parameter Validation and Enrichment
    const enrichedParams = await validateAndEnrich(params, prompt, intent, testContext);
    console.log('Enriched Parameters:', JSON.stringify(enrichedParams, null, 2));
    
    // Check for missing required parameters
    const requiredParams = ['amount', 'token', 'recipient', 'network'];
    const missingParams = requiredParams.filter(param => !enrichedParams[param]);
    if (missingParams.length > 0) {
      console.log('Transfer Skipped: Missing required parameters:', missingParams);
      continue;
    }
    
    // Step 4: Risk Assessment
    const risks = await assessRisks(enrichedParams, [], prompt, intent, testContext);
    console.log('Risk Assessment:', JSON.stringify(risks, null, 2));
    
    const hasInvalidRecipient = risks.some((risk: any) =>
      risk.severity === 'high' &&
      (risk.issue === 'Invalid ENS name' || risk.issue === 'Invalid recipient address')
    );
    if (hasInvalidRecipient) {
      console.log('Transfer Skipped: Invalid recipient address');
      continue;
    }
    
    // Step 5: Route Optimization
    const routes = await optimizeRoutes(enrichedParams, prompt, intent, testContext);
    console.log('Route Optimization:', JSON.stringify(routes, null, 2));
    
    // Step 6: Transfer Execution
    if (enrichedParams.amount && enrichedParams.token && enrichedParams.recipient) {
      const network = normalizeNetwork(enrichedParams.network || 'Base Sepolia');
      const chainId = SUPPORTED_NETWORKS[network];
      const sender = liveAddress;
      const receiver = enrichedParams.recipient;
      
      // Log balances before
      const senderBalanceBefore = await getBaseSepoliaBalance(sender);
      const receiverBalanceBefore = await getBaseSepoliaBalance(receiver);
      console.log(`Sender balance before: ${senderBalanceBefore} ETH`);
      console.log(`Receiver balance before: ${receiverBalanceBefore} ETH`);
      
      console.log('Transfer API Parameters:', JSON.stringify({
        amount: enrichedParams.amount,
        token: enrichedParams.token,
        recipient: enrichedParams.recipient,
        network: network,
        chainId: chainId,
        walletAddress: sender
      }, null, 2));
      
      // Execute transfer through Transfer API Plugin
      const transferResult = await TransferAPIPlugin.execute(enrichedParams, testContext);
      console.log('Transfer API Result:', JSON.stringify(transferResult, null, 2));
      if (transferResult.status === 'success') {
        console.log('TX HASH:', transferResult.transactionHash);
        console.log('RECEIPT:', JSON.stringify(transferResult.receipt, null, 2));
        // Log balances after
        const senderBalanceAfter = await getBaseSepoliaBalance(sender);
        const receiverBalanceAfter = await getBaseSepoliaBalance(receiver);
        console.log(`Sender balance after: ${senderBalanceAfter} ETH`);
        console.log(`Receiver balance after: ${receiverBalanceAfter} ETH`);
      }
    } else {
      console.log('Transfer API Skipped: Missing required transfer parameters:', {
        amount: enrichedParams.amount,
        token: enrichedParams.token,
        recipient: enrichedParams.recipient,
        walletAddress: enrichedParams.walletAddress,
      });
    }
  }
}

runTransferTests(); 