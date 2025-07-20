# HAi Wallet Interactive Demo - Complete Setup Guide

## 🎯 Overview

This guide will walk you through setting up and running the HAi Wallet interactive demo, which showcases the complete AI-powered blockchain transaction pipeline with real testnet integration.

## 📋 Prerequisites

### Required Software
- **Node.js** (v16 or higher)
- **npm** (comes with Node.js)
- **Git** (for cloning the repository)

### Required Accounts & Keys
- **Infura Account** - For Ethereum RPC access
- **Testnet Wallet** - For demo transactions
- **OpenAI API Key** - For natural language processing

## 🚀 Step-by-Step Setup

### Step 1: Clone and Navigate to Project
```bash
# Clone the repository (if not already done)
git clone <repository-url>
cd "HAi Wallet"

# Navigate to the API directory
cd apps/api
```

### Step 2: Install Dependencies
```bash
# Install all required packages
npm install

# Verify installation
npm list --depth=0
```

### Step 3: Create Testnet Wallet

**⚠️ IMPORTANT: Use only testnet wallets for this demo!**

#### Option A: Create with MetaMask
1. Install MetaMask browser extension
2. Create a new account or use existing one
3. Add testnet networks:
   - **Sepolia**: Chain ID 11155111
   - **Optimism Sepolia**: Chain ID 11155420
   - **Arbitrum Sepolia**: Chain ID 421614
4. Export private key (Settings → Security → Export Private Key)

#### Option B: Create with Ethers.js
```bash
# Run this in Node.js to generate a testnet wallet
node -e "
const { ethers } = require('ethers');
const wallet = ethers.Wallet.createRandom();
console.log('Address:', wallet.address);
console.log('Private Key:', wallet.privateKey);
console.log('Mnemonic:', wallet.mnemonic.phrase);
"
```

### Step 4: Get Infura API Key
1. Go to [Infura.io](https://infura.io)
2. Create a free account
3. Create a new project
4. Copy your project ID (not the full URL)
5. The API key format is: `your-project-id`

### Step 5: Get OpenAI API Key
1. Go to [OpenAI Platform](https://platform.openai.com)
2. Create an account or sign in
3. Navigate to API Keys section
4. Create a new API key
5. Copy the key (starts with `sk-`)

### Step 6: Set Environment Variables

Create a `.env` file in the `apps/api` directory:

```bash
# Navigate to the API directory
cd apps/api

# Create .env file
cat > .env << EOF
# Required for demo
DEMO_PRIVATE_KEY=your_testnet_wallet_private_key_here
INFURA_API_KEY=your_infura_project_id_here
OPENAI_API_KEY=your_openai_api_key_here

# Optional settings
DAILY_SPENDING_LIMIT=10000000000000000000
EOF
```

**Replace the placeholder values:**
- `your_testnet_wallet_private_key_here` - Your wallet's private key (without 0x prefix)
- `your_infura_project_id_here` - Your Infura project ID
- `your_openai_api_key_here` - Your OpenAI API key

### Step 7: Get Testnet Tokens

You'll need testnet tokens to execute transactions. Get them from these faucets:

#### Sepolia Faucets
- **Alchemy**: https://sepoliafaucet.com/
- **Infura**: https://www.infura.io/faucet/sepolia
- **Chainlink**: https://faucets.chain.link/sepolia

#### Optimism Sepolia Faucet
- **Official**: https://app.optimism.io/faucet

#### Arbitrum Sepolia Faucet
- **QuickNode**: https://faucet.quicknode.com/arbitrum/sepolia

**Recommended amounts:**
- **Sepolia**: 0.1-0.5 ETH
- **Optimism Sepolia**: 0.1-0.5 ETH
- **Arbitrum Sepolia**: 0.1-0.5 ETH

### Step 8: Verify Setup

Run the verification script:

```bash
# Make the script executable
chmod +x demo/start-demo.sh

# Run verification
./demo/start-demo.sh
```

This script will:
- Check Node.js version
- Verify environment variables
- Validate private key format
- Display wallet address
- Check dependencies

## 🎮 Running the Demo

### Method 1: Using the Startup Script
```bash
# Run the interactive demo
./demo/start-demo.sh
```

### Method 2: Direct npm Command
```bash
# Run the demo directly
npm run demo
```

### Method 3: From Project Root
```bash
# From the main project directory
npm run demo
```

## 🎯 Demo Commands

Once the demo is running, you can use these commands:

### Basic Transfers
```bash
# Transfer ETH to a contact
transfer 0.001 ETH to Bob on Sepolia

# Transfer to specific address
transfer 0.002 ETH to 0x1234...5678 on Optimism Sepolia

# Transfer USDC
transfer 1 USDC to Alice on Sepolia
```

### Token Swaps
```bash
# Basic swap
swap 1 USDC to ETH on Sepolia

# Large amount swap
swap 10 USDC to WETH on Optimism Sepolia

# Cross-token swap
swap 5 DAI to LINK on Sepolia
```

### Quotes and Simulation
```bash
# Get swap quote
get quote for 10 USDC to ETH on Sepolia

# Simulate swap (no execution)
simulate swap 5 USDC to ETH on Sepolia

# Gasless swap
gasless swap 2 USDC to ETH on Sepolia
```

### Utility Commands
```bash
# Check balance
get balance on Sepolia

# Show help
help

# Exit demo
exit
```

## 🔧 Troubleshooting

### Common Issues and Solutions

#### 1. "DEMO_PRIVATE_KEY environment variable is required"
**Solution**: Make sure you've set the environment variable:
```bash
export DEMO_PRIVATE_KEY="your_private_key_here"
```

#### 2. "INFURA_API_KEY environment variable is required"
**Solution**: Set your Infura project ID:
```bash
export INFURA_API_KEY="your_infura_project_id"
```

#### 3. "Invalid private key format"
**Solution**: Ensure your private key:
- Is 64 characters long (without 0x prefix)
- Contains only hexadecimal characters (0-9, a-f)
- Doesn't include quotes or extra spaces

#### 4. "Insufficient balance for transaction"
**Solution**: Get more testnet tokens from faucets:
- Sepolia: https://sepoliafaucet.com/
- Optimism Sepolia: https://app.optimism.io/faucet
- Arbitrum Sepolia: https://faucet.quicknode.com/arbitrum/sepolia

#### 5. "Network error" or "RPC error"
**Solution**: 
- Check your Infura API key is correct
- Verify you have sufficient Infura credits
- Try switching to a different RPC provider

#### 6. "OpenAI API error"
**Solution**:
- Verify your OpenAI API key is correct
- Check your OpenAI account has sufficient credits
- Ensure the API key has the correct permissions

#### 7. "Daily spending limit exceeded"
**Solution**: Wait until the next day or increase the limit:
```bash
export DAILY_SPENDING_LIMIT="20000000000000000000"  # 20 ETH
```

### Debug Mode

To run with additional debugging information:

```bash
# Enable debug logging
DEBUG=* npm run demo

# Or set specific debug flags
DEBUG=hai-wallet:* npm run demo
```

### Check Wallet Balance

Before running transactions, verify your wallet has sufficient funds:

```bash
# Check balance across all networks
node -e "
const { ethers } = require('ethers');
const privateKey = process.env.DEMO_PRIVATE_KEY;
const wallet = new ethers.Wallet(privateKey);

const networks = [
  { name: 'Sepolia', rpc: 'https://sepolia.infura.io/v3/' + process.env.INFURA_API_KEY },
  { name: 'Optimism Sepolia', rpc: 'https://sepolia.optimism.io' },
  { name: 'Arbitrum Sepolia', rpc: 'https://sepolia-rollup.arbitrum.io/rpc' }
];

async function checkBalances() {
  for (const network of networks) {
    try {
      const provider = new ethers.JsonRpcProvider(network.rpc);
      const balance = await provider.getBalance(wallet.address);
      console.log(\`\${network.name}: \${ethers.formatEther(balance)} ETH\`);
    } catch (error) {
      console.log(\`\${network.name}: Error - \${error.message}\`);
    }
  }
}

checkBalances();
"
```

## 🚨 Safety Guidelines

### ⚠️ CRITICAL SAFETY RULES
1. **NEVER use mainnet private keys** - Only use testnet wallets
2. **NEVER share your private key** - Keep it secure and private
3. **Start with small amounts** - Test with 0.001 ETH first
4. **Use dedicated demo wallet** - Don't use your main wallet
5. **Monitor spending limits** - Set appropriate daily limits

### Testnet vs Mainnet
- **Testnet tokens have no real value**
- **Testnet transactions are free to execute**
- **Testnet networks may be unstable**
- **Testnet data may be reset periodically**

## 📊 Expected Demo Output

When running successfully, you should see:

```
🚀 HAi Wallet Interactive Demo
================================
✅ Node.js version: v18.17.0
✅ Environment variables configured
✅ Dependencies installed
✅ Wallet Address: 0x1234...5678

⚠️  IMPORTANT SAFETY WARNINGS:
   - This demo executes REAL transactions on testnets
   - Use only testnet wallets with limited funds
   - Never use mainnet private keys
   - Test with small amounts first

Do you want to proceed? (y/N): y

🎯 Starting HAi Wallet Interactive Demo...
Type 'help' for available commands or 'exit' to quit

=== HAi Wallet Interactive Demo ===
ℹ️  Wallet Address: 0x1234...5678
ℹ️  Supported Networks: Sepolia, Optimism Sepolia, Arbitrum Sepolia

📊 Current Balances:
Sepolia: 0.1234 ETH
  USDC: 100.0000 USDC
Optimism Sepolia: 0.0567 ETH
  USDC: 50.0000 USDC
Arbitrum Sepolia: 0.0890 ETH
  USDC: 25.0000 USDC

👥 Available Contacts:
Bob: 0x7099...79C8 (Sepolia)
Alice: 0x3C44...93BC (Sepolia)
Charlie: 0x90F7...906 (Optimism Sepolia)
Diana: 0x15d3...65 (Arbitrum Sepolia)

💡 Available Commands:
transfer <amount> <token> to <recipient> on <network>
swap <amount> <fromToken> to <toToken> on <network>
get balance on <network>
get quote for <amount> <fromToken> to <toToken> on <network>
simulate swap <amount> <fromToken> to <toToken> on <network>
gasless swap <amount> <fromToken> to <toToken> on <network>
help
exit

HAi Wallet >
```

## 🎉 Success Indicators

You'll know the demo is working correctly when:

1. ✅ **Environment variables are validated**
2. ✅ **Wallet address is displayed**
3. ✅ **Balances are shown across networks**
4. ✅ **Commands are processed successfully**
5. ✅ **Transactions execute and show block explorer links**
6. ✅ **Error handling works for invalid inputs**

## 🔮 Next Steps

After successfully running the demo:

1. **Explore different transaction types** - Try transfers, swaps, quotes
2. **Test error scenarios** - Try invalid addresses, insufficient balances
3. **Experiment with different networks** - Test cross-network transactions
4. **Review the code** - Understand how the pipeline works
5. **Extend functionality** - Add new features or integrations

## 📞 Support

If you encounter issues:

1. **Check this guide** - Review the troubleshooting section
2. **Verify environment variables** - Ensure all keys are set correctly
3. **Check network connectivity** - Ensure you can access Infura and OpenAI
4. **Review error messages** - Look for specific error details
5. **Check wallet balance** - Ensure you have testnet tokens

---

**Happy demoing! 🚀**

The HAi Wallet interactive demo showcases the future of AI-powered blockchain transactions. Enjoy exploring the complete pipeline from natural language to real blockchain execution! 