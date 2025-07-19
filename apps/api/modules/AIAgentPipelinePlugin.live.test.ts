import { recognizeIntent, extractParameters, getTokenInfo, toSmallestUnit, assessRisks, optimizeRoutes, executeTransaction } from './AIAgentPipelinePlugin';
import { walletManager } from '../utils/walletManager';
import { ethers } from 'ethers';

const SUPPORTED_NETWORKS: Record<string, number> = {
  'Sepolia': 11155111,
  'Optimism Sepolia': 11155420,
  'Arbitrum Sepolia': 421614,
};

const testContext = {
  userId: 'live-demo-user',
  wallets: [
    {
      address: walletManager.getWalletAddress(),
      label: 'Demo Wallet',
      network: 'Sepolia',
      tokens: ['ETH', 'USDC', 'WETH']
    }
  ],
  contacts: [
    { name: 'Bob', address: '0x70997970C51812dc3A010C7d01b50e0d17dc79C8', network: 'Sepolia' },
    { name: 'Alice', address: '0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC', network: 'Sepolia' },
    { name: 'Charlie', address: '0x90F79bf6EB2c4f870365E785982E1f101E93b906', network: 'Optimism Sepolia' },
    { name: 'Diana', address: '0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65', network: 'Arbitrum Sepolia' }
  ]
};

// Testnet demo prompts - these will execute real transactions on testnets
const testnetPrompts = [
  'Send 0.001 ETH to Bob on Sepolia', // Small Sepolia ETH transfer
  'Transfer 1 USDC to Alice on Sepolia', // Small USDC transfer on Sepolia
  'Send 0.002 ETH to Charlie on Optimism Sepolia', // Cross-network transfer
  'Transfer 2 USDC to Diana on Arbitrum Sepolia', // Cross-network USDC transfer
];

function normalizeSwapParams(params: any): any {
  return {
    ...params,
    fromToken: params.fromToken || params.from_token || params.sourceToken,
    toToken: params.toToken || params.to_token || params.targetToken,
    walletAddress: params.walletAddress || params.wallet_address || params.sender_wallet,
  };
}

async function checkTestnetBalances() {
  console.log('\n=== Testnet Balance Check ===');
  
  for (const network of walletManager.getSupportedNetworks()) {
    try {
      await walletManager.switchNetwork(network);
      const balance = await walletManager.getBalance();
      const ethBalance = ethers.formatEther(balance);
      
      console.log(`${network}: ${ethBalance} ETH`);
      
      // Check USDC balance if available
      const usdcInfo = getTokenInfo('USDC', network);
      if (usdcInfo && usdcInfo.address) {
        const usdcBalance = await walletManager.getTokenBalance(usdcInfo.address);
        const usdcFormatted = ethers.formatUnits(usdcBalance, usdcInfo.decimals);
        console.log(`  USDC: ${usdcFormatted} USDC`);
      }
    } catch (error) {
      console.log(`${network}: Error checking balance - ${error}`);
    }
  }
}

async function runTestnetDemo() {
  console.log('=== HAi Wallet Testnet Demo ===');
  console.log(`Demo Wallet Address: ${walletManager.getWalletAddress()}`);
  console.log('Supported Networks:', walletManager.getSupportedNetworks().join(', '));
  
  // Check balances across all testnets
  await checkTestnetBalances();
  
  console.log('\n⚠️  Testnet Faucet Information:');
  console.log('Sepolia: https://sepoliafaucet.com/');
  console.log('Optimism Sepolia: https://app.optimism.io/faucet');
  console.log('Arbitrum Sepolia: https://faucet.quicknode.com/arbitrum/sepolia');
  
  for (const prompt of testnetPrompts) {
    console.log(`\n---\n🎯 Processing: ${prompt}`);
    
    try {
      // Step 1: Intent Recognition
      const intent = await recognizeIntent(prompt, testContext);
      console.log('✅ Intent Recognition:', JSON.stringify(intent, null, 2));
      
      // Step 2: Parameter Extraction
      let params = await extractParameters(prompt, intent, testContext);
      params = normalizeSwapParams(params);
      console.log('✅ Parameter Extraction:', JSON.stringify(params, null, 2));
      
      // Step 3: Risk Assessment
      const risks = await assessRisks(params, [], prompt, intent, testContext);
      console.log('✅ Risk Assessment:', JSON.stringify(risks, null, 2));
      
      // Check for blocking risks
      const blockingRisks = risks.filter((risk: any) => risk.severity === 'high');
      if (blockingRisks.length > 0) {
        console.log('❌ Transaction Blocked:', blockingRisks);
        continue;
      }
      
      // Step 4: Route Optimization
      const routes = await optimizeRoutes(params, prompt, intent, testContext);
      console.log('✅ Route Recommendations:', JSON.stringify(routes, null, 2));
      
      // Step 5: Transaction Execution
      console.log('🚀 Executing Transaction...');
      const result = await executeTransaction(params, routes, risks, prompt, intent, testContext);
      
      if (result.status === 'success') {
        console.log('✅ Transaction Successful!');
        console.log(`Transaction Hash: ${result.transactionHash}`);
        console.log(`Network: ${result.preview.network}`);
        console.log(`Block Explorer: ${walletManager.getNetworkConfig(result.preview.network)?.blockExplorer}/tx/${result.transactionHash}`);
        console.log('Transaction Preview:', JSON.stringify(result.preview, null, 2));
      } else if (result.status === 'blocked') {
        console.log('❌ Transaction Blocked:', result.reason);
      } else if (result.status === 'error') {
        console.log('❌ Transaction Failed:', result.error);
      }
      
    } catch (error: any) {
      console.log('❌ Pipeline Error:', error.message);
    }
  }
  
  // Final balance check
  console.log('\n=== Final Balance Check ===');
  await checkTestnetBalances();
  console.log('=== Testnet Demo Complete ===');
}

// Safety check - only run if DEMO_PRIVATE_KEY is set
if (process.env.DEMO_PRIVATE_KEY) {
  console.log('⚠️  WARNING: This will execute real transactions on testnets!');
  console.log('⚠️  Make sure you have testnet ETH in your demo wallet!');
  console.log('⚠️  Use testnet faucets to get free testnet tokens.');
  
  // Add a 5-second delay for safety
  setTimeout(() => {
    runTestnetDemo().catch(console.error);
  }, 5000);
} else {
  console.log('❌ DEMO_PRIVATE_KEY not set. Cannot run testnet demo.');
  console.log('Set DEMO_PRIVATE_KEY environment variable to run testnet demo.');
  console.log('Example: export DEMO_PRIVATE_KEY="your_testnet_wallet_private_key"');
} 