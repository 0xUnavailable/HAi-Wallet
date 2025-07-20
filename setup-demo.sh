#!/bin/bash

# HAi Wallet Demo Setup Script

echo "🚀 HAi Wallet Demo Setup"
echo "========================"
echo ""

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Please run this script from the project root directory"
    exit 1
fi

# Check Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js v16 or higher."
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 16 ]; then
    echo "❌ Node.js version 16 or higher is required. Current version: $(node -v)"
    exit 1
fi

echo "✅ Node.js version: $(node -v)"

# Navigate to API directory
cd apps/api

# Install dependencies
echo ""
echo "📦 Installing dependencies..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ Failed to install dependencies"
    exit 1
fi

echo "✅ Dependencies installed"

# Check if .env file exists
if [ -f ".env" ]; then
    echo ""
    echo "📄 .env file already exists"
    read -p "Do you want to overwrite it? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Keeping existing .env file"
    else
        rm .env
    fi
fi

# Create .env file if it doesn't exist
if [ ! -f ".env" ]; then
    echo ""
    echo "🔧 Setting up environment variables..."
    echo "Please provide the following information:"
    echo ""

    # Get private key
    echo "1. Testnet Wallet Private Key"
    echo "   - Create a testnet wallet if you don't have one"
    echo "   - Export the private key (without 0x prefix)"
    echo "   - Example: abc123def456..."
    echo ""
    read -p "Enter your testnet wallet private key: " PRIVATE_KEY

    # Get Infura API key
    echo ""
    echo "2. Infura API Key"
    echo "   - Go to https://infura.io"
    echo "   - Create a free account and project"
    echo "   - Copy your project ID (not the full URL)"
    echo "   - Example: abc123def456..."
    echo ""
    read -p "Enter your Infura project ID: " INFURA_KEY

    # Get OpenAI API key
    echo ""
    echo "3. OpenAI API Key"
    echo "   - Go to https://platform.openai.com"
    echo "   - Create an account and get an API key"
    echo "   - Copy the key (starts with sk-)"
    echo "   - Example: sk-abc123def456..."
    echo ""
    read -p "Enter your OpenAI API key: " OPENAI_KEY

    # Create .env file
    cat > .env << EOF
# HAi Wallet Demo Environment Variables
# Generated on $(date)

# Required for demo
DEMO_PRIVATE_KEY=$PRIVATE_KEY
INFURA_API_KEY=$INFURA_KEY
OPENAI_API_KEY=$OPENAI_KEY

# Optional settings (defaults)
DAILY_SPENDING_LIMIT=10000000000000000000
EOF

    echo ""
    echo "✅ .env file created successfully"
else
    echo "✅ Using existing .env file"
fi

# Validate environment variables
echo ""
echo "🔍 Validating environment variables..."

# Source the .env file
set -a
source .env
set +a

# Check required variables
MISSING_VARS=()

if [ -z "$DEMO_PRIVATE_KEY" ]; then
    MISSING_VARS+=("DEMO_PRIVATE_KEY")
fi

if [ -z "$INFURA_API_KEY" ]; then
    MISSING_VARS+=("INFURA_API_KEY")
fi

if [ -z "$OPENAI_API_KEY" ]; then
    MISSING_VARS+=("OPENAI_API_KEY")
fi

if [ ${#MISSING_VARS[@]} -ne 0 ]; then
    echo "❌ Missing required environment variables:"
    for var in "${MISSING_VARS[@]}"; do
        echo "   - $var"
    done
    echo ""
    echo "Please edit the .env file and add the missing variables"
    exit 1
fi

echo "✅ All required environment variables are set"

# Validate private key format
echo ""
echo "🔍 Validating private key format..."

WALLET_ADDRESS=$(node -e "
const { ethers } = require('ethers');
try {
    const privateKey = process.env.DEMO_PRIVATE_KEY;
    const wallet = new ethers.Wallet(privateKey);
    console.log(wallet.address);
} catch (error) {
    console.error('Invalid private key format');
    process.exit(1);
}
" 2>/dev/null)

if [ $? -eq 0 ]; then
    echo "✅ Private key is valid"
    echo "✅ Wallet Address: $WALLET_ADDRESS"
else
    echo "❌ Invalid private key format"
    echo "   - Should be 64 hexadecimal characters"
    echo "   - Should not include 0x prefix"
    echo "   - Should not include quotes or spaces"
    exit 1
fi

# Test API connections
echo ""
echo "🔍 Testing API connections..."

# Test Infura connection
echo "Testing Infura connection..."
INFURA_TEST=$(node -e "
const { ethers } = require('ethers');
const provider = new ethers.JsonRpcProvider('https://sepolia.infura.io/v3/' + process.env.INFURA_API_KEY);
provider.getBlockNumber().then(block => {
    console.log('Connected to Sepolia, block:', block);
}).catch(error => {
    console.error('Infura connection failed:', error.message);
    process.exit(1);
});
" 2>/dev/null)

if [ $? -eq 0 ]; then
    echo "✅ Infura connection successful"
else
    echo "❌ Infura connection failed"
    echo "   - Check your Infura API key"
    echo "   - Ensure you have sufficient credits"
    exit 1
fi

# Test OpenAI connection
echo "Testing OpenAI connection..."
OPENAI_TEST=$(node -e "
const OpenAI = require('openai');
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
openai.models.list().then(models => {
    console.log('OpenAI connection successful');
}).catch(error => {
    console.error('OpenAI connection failed:', error.message);
    process.exit(1);
});
" 2>/dev/null)

if [ $? -eq 0 ]; then
    echo "✅ OpenAI connection successful"
else
    echo "❌ OpenAI connection failed"
    echo "   - Check your OpenAI API key"
    echo "   - Ensure you have sufficient credits"
    exit 1
fi

# Get testnet tokens information
echo ""
echo "💰 Testnet Tokens Required"
echo "=========================="
echo "You'll need testnet tokens to execute transactions:"
echo ""
echo "Sepolia ETH:"
echo "  - https://sepoliafaucet.com/"
echo "  - https://www.infura.io/faucet/sepolia"
echo "  - https://faucets.chain.link/sepolia"
echo ""
echo "Optimism Sepolia ETH:"
echo "  - https://app.optimism.io/faucet"
echo ""
echo "Arbitrum Sepolia ETH:"
echo "  - https://faucet.quicknode.com/arbitrum/sepolia"
echo ""
echo "Recommended amounts: 0.1-0.5 ETH per network"

# Final setup complete
echo ""
echo "🎉 Setup Complete!"
echo "=================="
echo "✅ Node.js environment ready"
echo "✅ Dependencies installed"
echo "✅ Environment variables configured"
echo "✅ API connections tested"
echo "✅ Wallet address validated: $WALLET_ADDRESS"
echo ""
echo "🚀 Ready to run the demo!"
echo ""
echo "Next steps:"
echo "1. Get testnet tokens from the faucets above"
echo "2. Run the demo: npm run demo"
echo "3. Or use the startup script: ./demo/start-demo.sh"
echo ""
echo "For help, see: DEMO-SETUP-GUIDE.md"
echo ""
echo "Happy demoing! 🚀" 