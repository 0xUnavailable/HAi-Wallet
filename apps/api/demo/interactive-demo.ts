#!/usr/bin/env node

import * as readline from 'readline';
import { recognizeIntent, extractParameters, assessRisks, optimizeRoutes, executeTransaction } from '../modules/AIAgentPipelinePlugin';
import { SwapDEXAPIPlugin } from '../modules/SwapDEXAPIPlugin';
import { GaslessDEXAPIPlugin } from '../modules/GaslessDEXAPIPlugin';
import { TransferAPIPlugin } from '../modules/TransferAPIPlugin';
import { walletManager } from '../utils/walletManager';
import { getTokenInfo } from '../modules/tokenRegistry';
import { ethers } from 'ethers';
import chalk from 'chalk';

// Initialize readline interface
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Our plugins are stateless objects
const swapDEXAPI = SwapDEXAPIPlugin;
const gaslessDEXAPI = GaslessDEXAPIPlugin;
const transferAPI = TransferAPIPlugin;

// Demo context with real wallet data
const demoContext = {
  userId: 'live-demo-user',
  wallets: [
    {
      address: walletManager.getWalletAddress(),
      label: 'Live Demo Wallet',
      network: 'Ethereum',
      tokens: ['ETH', 'USDC', 'WETH', 'USDT', 'DAI', 'LINK', 'UNI']
    }
  ],
  contacts: [
    { name: 'Bob', address: '0x70997970C51812dc3A010C7d01b50e0d17dc79C8', network: 'Ethereum' },
    { name: 'Alice', address: '0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC', network: 'Ethereum' },
    { name: 'Charlie', address: '0x90F79bf6EB2c4f870365E785982E1f101E93b906', network: 'Optimism' },
    { name: 'Diana', address: '0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65', network: 'Arbitrum' }
  ]
};

// Available demo commands with enhanced features
const demoCommands = [
  'transfer <amount> <token> to <recipient> on <network>',
  'swap <amount> <fromToken> to <toToken> on <network>',
  'gasless swap <amount> <fromToken> to <toToken> on <network>',
  'get balance on <network>',
  'get quote for <amount> <fromToken> to <toToken> on <network>',
  'simulate swap <amount> <fromToken> to <toToken> on <network>',
  'show wallet info',
  'show contacts',
  'demo scenarios',
  'help',
  'exit'
];

// Demo scenarios for showcasing capabilities
const demoScenarios = [
  {
    name: 'Basic Transfer',
    command: 'transfer 0.001 ETH to Bob on Ethereum',
    description: 'Simple token transfer to a contact'
  },
  {
    name: 'Token Swap (Gas)',
    command: 'swap 1 USDC to ETH on Ethereum',
    description: 'Traditional swap with gas fees'
  },
  {
    name: 'Gasless Swap',
    command: 'gasless swap 2 USDC to ETH on Ethereum',
    description: 'Meta-transaction swap (no gas fees)'
  },
  {
    name: 'Cross-Network Transfer',
    command: 'transfer 0.002 ETH to Charlie on Optimism',
    description: 'Cross-chain transaction'
  },
  {
    name: 'Large Amount Swap',
    command: 'swap 10 USDC to WETH on Ethereum',
    description: 'High-value swap with route optimization'
  },
  {
    name: 'Quote Only',
    command: 'get quote for 5 USDC to ETH on Ethereum',
    description: 'Price quote without execution'
  }
];

// Color-coded logging functions
const log = {
  info: (msg: string) => console.log(chalk.blue('ℹ️  ' + msg)),
  success: (msg: string) => console.log(chalk.green('✅ ' + msg)),
  warning: (msg: string) => console.log(chalk.yellow('⚠️  ' + msg)),
  error: (msg: string) => console.log(chalk.red('❌ ' + msg)),
  prompt: (msg: string) => console.log(chalk.cyan('🎯 ' + msg)),
  step: (msg: string) => console.log(chalk.magenta('🔧 ' + msg)),
  result: (msg: string) => console.log(chalk.white('📊 ' + msg)),
  highlight: (msg: string) => console.log(chalk.bold.cyan('🌟 ' + msg)),
  api: (msg: string) => console.log(chalk.bold.green('🔌 ' + msg))
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

// Helper function to convert amount to smallest unit
function toSmallestUnit(amount: string, tokenSymbol: string, network: string): string {
  const tokenInfo = getTokenInfo(tokenSymbol, network);
  const decimals = tokenInfo?.decimals || 18;
  return ethers.parseUnits(amount, decimals).toString();
}

// Display comprehensive wallet information
async function displayWalletInfo() {
  log.highlight('=== HAi Wallet Live Demo ===');
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
  
  log.info('\n🔌 Available APIs:');
  log.api('SWAP DEX API (5-step process with Permit2)');
  log.api('Gasless DEX API (4-step meta-transaction process)');
  log.api('Transfer API (Native ETH and ERC20 tokens)');
  
  log.info('\n💡 Available Commands:');
  demoCommands.forEach(cmd => log.result(cmd));
  log.info('');
}

// Show demo scenarios
function showDemoScenarios() {
  log.highlight('🎬 Demo Scenarios');
  log.info('Try these commands to see different features:');
  log.info('');
  
  demoScenarios.forEach((scenario, index) => {
    log.result(`${index + 1}. ${scenario.name}`);
    log.info(`   Command: ${scenario.command}`);
    log.info(`   Description: ${scenario.description}`);
    log.info('');
  });
}

// Process user input through the complete pipeline with new APIs
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
    
    // Step 4: Route Optimization and Execution based on intent type
    if (intent.type === 'swap') {
      // Check if it's a gasless swap
      if (input.toLowerCase().includes('gasless')) {
        log.step('Step 4: Gasless DEX API (4-Step Process)');
        log.api('Using 0x Gasless DEX API');
        
        // For gasless swaps, we'll use the gasless API
        log.warning('Gasless swap functionality requires additional implementation');
        log.info('Please use regular swap command for now');
      } else {
        log.step('Step 4: SWAP DEX API (5-Step Process)');
        log.api('Using 0x SWAP DEX API with Permit2');
        
        // Convert input to swap quote request
        const network = params.network || 'Ethereum';
        const chainId = network === 'Ethereum' ? 1 : network === 'Optimism' ? 10 : 42161;
        const fromTokenInfo = getTokenInfo(params.fromToken, network);
        const toTokenInfo = getTokenInfo(params.toToken, network);
        const sellToken = fromTokenInfo?.address || params.fromToken;
        const buyToken = toTokenInfo?.address || params.toToken;
        const sellAmount = toSmallestUnit(params.amount, params.fromToken, network);
        const taker = demoContext.wallets[0].address;
        
        const swapRequest = {
          chainId,
          sellToken,
          buyToken,
          sellAmount,
          taker,
        };
        
        const quotes = await swapDEXAPI.getSwapQuote(swapRequest);
        const quote = quotes[0];
        
        if (quote && quote.recommended) {
          log.success('SWAP quote retrieved successfully!');
          log.result(`Output: ${quote.output} ${params.toToken}`);
          log.result(`Gas: ${quote.gas}`);
          log.result(`Price Impact: ${quote.priceImpact}`);
          log.result('Transaction Details:');
          log.result(JSON.stringify(quote.rawQuote, null, 2));
        } else if (quote && !quote.recommended) {
          log.warning('SWAP quote available but not recommended');
          log.result(`Reason: ${quote.reason}`);
          log.result('Quote Details:');
          log.result(JSON.stringify(quote.rawQuote, null, 2));
        } else {
          log.error('Failed to get SWAP quote');
        }
      }
    } else if (intent.type === 'transfer') {
      log.step('Step 4: Transfer API Execution');
      log.api('Using Transfer API for token transfer');
      
      // Ask for confirmation
      const answer = await askQuestion(chalk.yellow('⚠️  Execute this transfer? (y/N): '));
      if (answer.toLowerCase() !== 'y' && answer.toLowerCase() !== 'yes') {
        log.info('Transfer cancelled by user');
        return;
      }
      
      const result = await transferAPI.execute(params, demoContext);
      
      if (result.status === 'success') {
        log.success('Transfer executed successfully!');
        log.result(`Transaction Hash: ${result.transactionHash}`);
        log.result(`Network: ${result.preview.network}`);
        log.result(`From: ${result.preview.from}`);
        log.result(`To: ${result.preview.to}`);
        log.result(`Amount: ${result.preview.amount} ${result.preview.token}`);
        
        // Get block explorer URL
        const networkConfig = walletManager.getNetworkConfig(result.preview.network);
        if (networkConfig) {
          log.result(`Block Explorer: ${networkConfig.blockExplorer}/tx/${result.transactionHash}`);
        }
        
        log.result('Transaction Details:');
        log.result(JSON.stringify(result.preview, null, 2));
      } else if (result.status === 'insufficient_balance') {
        log.warning('Insufficient balance for transfer');
        log.result(`Required: ${result.requiredAmount}`);
        log.result(`Available: ${result.currentBalance}`);
      } else if (result.status === 'error') {
        log.error(`Transfer failed: ${result.error}`);
      }
    } else if (intent.type === 'query') {
      // Handle balance and quote queries
      if (input.toLowerCase().includes('balance')) {
        log.step('Step 4: Balance Query');
        const network = params.network || 'Ethereum';
        await walletManager.switchNetwork(network);
        const balance = await walletManager.getBalance();
        const ethBalance = ethers.formatEther(balance);
        log.success(`Balance on ${network}: ${ethBalance} ETH`);
      } else if (input.toLowerCase().includes('quote')) {
        log.step('Step 4: Quote Query');
        log.api('Getting price quote from 0x API');
        
        // Use SWAP API for quote
        const network = params.network || 'Ethereum';
        const chainId = network === 'Ethereum' ? 1 : network === 'Optimism' ? 10 : 42161;
        const fromTokenInfo = getTokenInfo(params.fromToken, network);
        const toTokenInfo = getTokenInfo(params.toToken, network);
        const sellToken = fromTokenInfo?.address || params.fromToken;
        const buyToken = toTokenInfo?.address || params.toToken;
        const sellAmount = toSmallestUnit(params.amount, params.fromToken, network);
        const taker = demoContext.wallets[0].address;
        
        const swapRequest = {
          chainId,
          sellToken,
          buyToken,
          sellAmount,
          taker,
        };
        
        const quotes = await swapDEXAPI.getSwapQuote(swapRequest);
        const quote = quotes[0];
        
        if (quote) {
          log.success('Quote retrieved successfully');
          log.result(`Output: ${quote.output} ${params.toToken}`);
          log.result(`Gas: ${quote.gas}`);
          log.result(`Price Impact: ${quote.priceImpact}`);
          log.result('Quote Details:');
          log.result(JSON.stringify(quote.rawQuote, null, 2));
        } else {
          log.error('Failed to get quote');
        }
      }
    }
    
  } catch (error: any) {
    log.error(`Pipeline error: ${error.message}`);
    if (error.stack) {
      console.log(chalk.gray(error.stack));
    }
  }
}

// Helper function to ask user questions
function askQuestion(question: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer);
    });
  });
}

// Main demo loop
async function runInteractiveDemo() {
  try {
    // Display welcome information
    await displayWalletInfo();
    
    log.highlight('🎮 Live Demo Ready!');
    log.info('Type commands to test the AI-powered wallet features');
    log.info('Type "demo scenarios" to see example commands');
    log.info('Type "help" for available commands or "exit" to quit');
    log.info('');
    
    // Main command loop
    while (true) {
      const input = await askQuestion(chalk.cyan('HAi Wallet > '));
      
      if (input.toLowerCase() === 'exit' || input.toLowerCase() === 'quit') {
        log.info('Goodbye! 👋');
        break;
      } else if (input.toLowerCase() === 'help') {
        log.info('Available Commands:');
        demoCommands.forEach(cmd => log.result(cmd));
        log.info('');
      } else if (input.toLowerCase() === 'demo scenarios') {
        showDemoScenarios();
      } else if (input.toLowerCase() === 'show wallet info') {
        await displayWalletInfo();
      } else if (input.toLowerCase() === 'show contacts') {
        log.info('Available Contacts:');
        demoContext.contacts.forEach(contact => {
          log.result(`${contact.name}: ${contact.address} (${contact.network})`);
        });
        log.info('');
      } else if (input.trim() === '') {
        continue;
      } else {
        await processUserInput(input);
      }
    }
    
  } catch (error: any) {
    log.error(`Demo error: ${error.message}`);
    if (error.stack) {
      console.log(chalk.gray(error.stack));
    }
  } finally {
    // Cleanup
    rl.close();
  }
}

// Handle process termination
process.on('SIGINT', () => {
  log.info('\nDemo interrupted. Cleaning up...');
  rl.close();
  process.exit(0);
});

// Start the demo
runInteractiveDemo().catch(console.error); 