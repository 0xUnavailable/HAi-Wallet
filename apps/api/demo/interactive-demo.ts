#!/usr/bin/env node

import * as readline from 'readline';
import { recognizeIntent, extractParameters, assessRisks, optimizeRoutes, executeTransaction } from '../modules/AIAgentPipelinePlugin';
import { walletManager } from '../utils/walletManager';
import { getTokenInfo } from '../modules/tokenRegistry';
import { ethers } from 'ethers';
import chalk from 'chalk';

// Initialize readline interface
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Demo context with real wallet data
const demoContext = {
  userId: 'interactive-demo-user',
  wallets: [
    {
      address: walletManager.getWalletAddress(),
      label: 'Demo Wallet',
      network: 'Sepolia',
      tokens: ['ETH', 'USDC', 'WETH', 'DAI', 'LINK']
    }
  ],
  contacts: [
    { name: 'Bob', address: '0x70997970C51812dc3A010C7d01b50e0d17dc79C8', network: 'Sepolia' },
    { name: 'Alice', address: '0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC', network: 'Sepolia' },
    { name: 'Charlie', address: '0x90F79bf6EB2c4f870365E785982E1f101E93b906', network: 'Optimism Sepolia' },
    { name: 'Diana', address: '0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65', network: 'Arbitrum Sepolia' }
  ]
};

// Available demo commands
const demoCommands = [
  'transfer <amount> <token> to <recipient> on <network>',
  'swap <amount> <fromToken> to <toToken> on <network>',
  'get balance on <network>',
  'get quote for <amount> <fromToken> to <toToken> on <network>',
  'simulate swap <amount> <fromToken> to <toToken> on <network>',
  'gasless swap <amount> <fromToken> to <toToken> on <network>',
  'help',
  'exit'
];

// Color-coded logging functions
const log = {
  info: (msg: string) => console.log(chalk.blue('ℹ️  ' + msg)),
  success: (msg: string) => console.log(chalk.green('✅ ' + msg)),
  warning: (msg: string) => console.log(chalk.yellow('⚠️  ' + msg)),
  error: (msg: string) => console.log(chalk.red('❌ ' + msg)),
  prompt: (msg: string) => console.log(chalk.cyan('🎯 ' + msg)),
  step: (msg: string) => console.log(chalk.magenta('🔧 ' + msg)),
  result: (msg: string) => console.log(chalk.white('📊 ' + msg))
};

// Helper function to normalize parameters
function normalizeParams(params: any): any {
  return {
    ...params,
    fromToken: params.fromToken || params.from_token || params.sourceToken,
    toToken: params.toToken || params.to_token || params.targetToken,
    walletAddress: params.walletAddress || params.wallet_address || params.sender_wallet,
  };
}

// Display wallet information
async function displayWalletInfo() {
  log.info('=== HAi Wallet Interactive Demo ===');
  log.info(`Wallet Address: ${walletManager.getWalletAddress()}`);
  log.info(`Supported Networks: ${walletManager.getSupportedNetworks().join(', ')}`);
  
  // Check balances across networks
  log.info('\n📊 Current Balances:');
  for (const network of walletManager.getSupportedNetworks()) {
    try {
      await walletManager.switchNetwork(network);
      const balance = await walletManager.getBalance();
      const ethBalance = ethers.formatEther(balance);
      log.result(`${network}: ${ethBalance} ETH`);
      
      // Check USDC balance
      const usdcInfo = getTokenInfo('USDC', network);
      if (usdcInfo && usdcInfo.address) {
        const usdcBalance = await walletManager.getTokenBalance(usdcInfo.address);
        const usdcFormatted = ethers.formatUnits(usdcBalance, usdcInfo.decimals);
        log.result(`  USDC: ${usdcFormatted} USDC`);
      }
    } catch (error) {
      log.error(`${network}: Error checking balance - ${error}`);
    }
  }
  
  log.info('\n👥 Available Contacts:');
  demoContext.contacts.forEach(contact => {
    log.result(`${contact.name}: ${contact.address} (${contact.network})`);
  });
  
  log.info('\n💡 Available Commands:');
  demoCommands.forEach(cmd => log.result(cmd));
  log.info('');
}

// Process user input through the complete pipeline
async function processUserInput(input: string) {
  try {
    log.prompt(`Processing: "${input}"`);
    
    // Step 1: Intent Recognition
    log.step('Step 1: Intent Recognition');
    const intent = await recognizeIntent(input, demoContext);
    log.success(`Intent: ${intent.type} (confidence: ${intent.confidence})`);
    log.result(`Description: ${intent.description}`);
    
    // Step 2: Parameter Extraction
    log.step('Step 2: Parameter Extraction');
    let params = await extractParameters(input, intent, demoContext);
    params = normalizeParams(params);
    log.success('Parameters extracted successfully');
    log.result(JSON.stringify(params, null, 2));
    
    // Step 3: Risk Assessment
    log.step('Step 3: Risk Assessment');
    const risks = await assessRisks(params, [], input, intent, demoContext);
    
    if (risks.length > 0) {
      log.warning('Risks detected:');
      risks.forEach((risk: any) => {
        const severityColor = risk.severity === 'high' ? chalk.red : risk.severity === 'medium' ? chalk.yellow : chalk.blue;
        log.result(`${severityColor(risk.severity.toUpperCase())}: ${risk.message}`);
      });
      
      // Check for blocking risks
      const blockingRisks = risks.filter((risk: any) => risk.severity === 'high');
      if (blockingRisks.length > 0) {
        log.error('Transaction blocked due to high-severity risks');
        return;
      }
    } else {
      log.success('No risks detected');
    }
    
    // Step 4: Route Optimization (for swaps)
    if (intent.type === 'swap') {
      log.step('Step 4: Route Optimization');
      const routes = await optimizeRoutes(params, input, intent, demoContext);
      
      if (routes && routes.length > 0) {
        log.success('Route recommendations:');
        routes.forEach((route: any, index: number) => {
          log.result(`Route ${index + 1}: ${route.protocol} - ${route.estimatedOutput} ${params.toToken}`);
          log.result(`  Gas: ${route.estimatedGas} | Cost: ${route.estimatedCost} ETH`);
        });
      } else {
        log.warning('No routes found');
        return;
      }
    }
    
    // Step 5: Transaction Execution (for transfers and swaps)
    if (intent.type === 'transfer' || intent.type === 'swap') {
      log.step('Step 5: Transaction Execution');
      
      // Ask for confirmation
      const answer = await askQuestion(chalk.yellow('⚠️  Execute this transaction? (y/N): '));
      if (answer.toLowerCase() !== 'y' && answer.toLowerCase() !== 'yes') {
        log.info('Transaction cancelled by user');
        return;
      }
      
      const routes = intent.type === 'swap' ? await optimizeRoutes(params, input, intent, demoContext) : [];
      const result = await executeTransaction(params, routes, risks, input, intent, demoContext);
      
      if (result.status === 'success') {
        log.success('Transaction executed successfully!');
        log.result(`Transaction Hash: ${result.transactionHash}`);
        log.result(`Network: ${result.preview.network}`);
        
        const networkConfig = walletManager.getNetworkConfig(result.preview.network);
        if (networkConfig) {
          log.result(`Block Explorer: ${networkConfig.blockExplorer}/tx/${result.transactionHash}`);
        }
        
        log.result('Transaction Details:');
        log.result(JSON.stringify(result.preview, null, 2));
      } else if (result.status === 'blocked') {
        log.error(`Transaction blocked: ${result.reason}`);
      } else if (result.status === 'error') {
        log.error(`Transaction failed: ${result.error}`);
      }
    }
    
  } catch (error: any) {
    log.error(`Pipeline error: ${error.message}`);
    if (error.stack) {
      console.log(chalk.gray(error.stack));
    }
  }
}

// Helper function to ask questions
function askQuestion(question: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer);
    });
  });
}

// Main interactive loop
async function runInteractiveDemo() {
  // Check if wallet is properly configured
  if (!process.env.DEMO_PRIVATE_KEY) {
    log.error('DEMO_PRIVATE_KEY environment variable is required');
    log.info('Set it with: export DEMO_PRIVATE_KEY="your_testnet_wallet_private_key"');
    process.exit(1);
  }
  
  if (!process.env.INFURA_API_KEY) {
    log.error('INFURA_API_KEY environment variable is required');
    log.info('Set it with: export INFURA_API_KEY="your_infura_key"');
    process.exit(1);
  }
  
  // Display initial information
  await displayWalletInfo();
  
  log.warning('⚠️  This demo will execute real transactions on testnets!');
  log.warning('⚠️  Make sure you have testnet ETH in your wallet!');
  log.info('Type "help" for available commands or "exit" to quit\n');
  
  // Main interaction loop
  while (true) {
    try {
      const input = await askQuestion(chalk.cyan('HAi Wallet > '));
      
      if (input.toLowerCase() === 'exit' || input.toLowerCase() === 'quit') {
        log.info('Goodbye! 👋');
        break;
      }
      
      if (input.toLowerCase() === 'help') {
        log.info('Available Commands:');
        demoCommands.forEach(cmd => log.result(cmd));
        log.info('\nExamples:');
        log.result('transfer 0.001 ETH to Bob on Sepolia');
        log.result('swap 1 USDC to ETH on Sepolia');
        log.result('get balance on Optimism Sepolia');
        log.result('get quote for 10 USDC to ETH on Sepolia');
        log.info('');
        continue;
      }
      
      if (input.trim() === '') {
        continue;
      }
      
      await processUserInput(input);
      console.log(''); // Add spacing
      
    } catch (error: any) {
      log.error(`Error: ${error.message}`);
    }
  }
  
  rl.close();
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  log.info('\nShutting down gracefully...');
  rl.close();
  process.exit(0);
});

// Start the interactive demo
if (require.main === module) {
  runInteractiveDemo().catch((error) => {
    log.error(`Fatal error: ${error.message}`);
    process.exit(1);
  });
} 