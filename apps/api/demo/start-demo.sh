#!/bin/bash

# HAi Wallet Interactive Demo Startup Script

echo "🚀 HAi Wallet Interactive Demo"
echo "================================"

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js v16 or higher."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 16 ]; then
    echo "❌ Node.js version 16 or higher is required. Current version: $(node -v)"
    exit 1
fi

echo "✅ Node.js version: $(node -v)"

# Check environment variables
MISSING_VARS=()

if [ -z "$DEMO_PRIVATE_KEY" ]; then
    MISSING_VARS+=("DEMO_PRIVATE_KEY")
fi

if [ -z "$INFURA_API_KEY" ]; then
    MISSING_VARS+=("INFURA_API_KEY")
fi

if [ ${#MISSING_VARS[@]} -ne 0 ]; then
    echo "❌ Missing required environment variables:"
    for var in "${MISSING_VARS[@]}"; do
        echo "   - $var"
    done
    echo ""
    echo "📋 Setup Instructions:"
    echo "1. Create a testnet wallet (never use mainnet!)"
    echo "2. Get your private key from the wallet"
    echo "3. Get an Infura API key from https://infura.io"
    echo "4. Set the environment variables:"
    echo ""
    echo "   export DEMO_PRIVATE_KEY=\"your_testnet_wallet_private_key\""
    echo "   export INFURA_API_KEY=\"your_infura_key\""
    echo ""
    echo "5. Get testnet tokens from faucets:"
    echo "   - Sepolia: https://sepoliafaucet.com/"
    echo "   - Optimism Sepolia: https://app.optimism.io/faucet"
    echo "   - Arbitrum Sepolia: https://faucet.quicknode.com/arbitrum/sepolia"
    echo ""
    echo "6. Run this script again"
    exit 1
fi

echo "✅ Environment variables configured"

# Check if dependencies are installed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
    if [ $? -ne 0 ]; then
        echo "❌ Failed to install dependencies"
        exit 1
    fi
fi

echo "✅ Dependencies installed"

# Display wallet address
WALLET_ADDRESS=$(node -e "
const { ethers } = require('ethers');
const privateKey = process.env.DEMO_PRIVATE_KEY;
const wallet = new ethers.Wallet(privateKey);
console.log(wallet.address);
" 2>/dev/null)

if [ $? -eq 0 ]; then
    echo "✅ Wallet Address: $WALLET_ADDRESS"
else
    echo "❌ Invalid private key format"
    exit 1
fi

echo ""
echo "⚠️  IMPORTANT SAFETY WARNINGS:"
echo "   - This demo executes REAL transactions on testnets"
echo "   - Use only testnet wallets with limited funds"
echo "   - Never use mainnet private keys"
echo "   - Test with small amounts first"
echo ""

# Ask for confirmation
read -p "Do you want to proceed? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Demo cancelled"
    exit 0
fi

echo ""
echo "🎯 Starting HAi Wallet Interactive Demo..."
echo "Type 'help' for available commands or 'exit' to quit"
echo ""

# Run the interactive demo
npm run demo 