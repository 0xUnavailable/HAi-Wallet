# HAi Wallet Demo - Quick Reference

## 🚀 Quick Start

```bash
# 1. Run setup script
chmod +x setup-demo.sh
./setup-demo.sh

# 2. Get testnet tokens from faucets
# Sepolia: https://sepoliafaucet.com/
# Optimism: https://app.optimism.io/faucet
# Arbitrum: https://faucet.quicknode.com/arbitrum/sepolia

# 3. Run the demo
npm run demo
```

## 🔑 Required Environment Variables

```bash
# Create .env file in apps/api/
DEMO_PRIVATE_KEY=your_testnet_wallet_private_key
INFURA_API_KEY=your_infura_project_id
OPENAI_API_KEY=your_openai_api_key
DAILY_SPENDING_LIMIT=10000000000000000000
```

## 🎯 Demo Commands

### Transfers
```bash
transfer 0.001 ETH to Bob on Sepolia
transfer 1 USDC to Alice on Optimism Sepolia
transfer 0.002 ETH to 0x1234...5678 on Arbitrum Sepolia
```

### Swaps
```bash
swap 1 USDC to ETH on Sepolia
swap 10 USDC to WETH on Optimism Sepolia
swap 5 DAI to LINK on Sepolia
```

### Quotes & Simulation
```bash
get quote for 10 USDC to ETH on Sepolia
simulate swap 5 USDC to ETH on Sepolia
gasless swap 2 USDC to ETH on Sepolia
```

### Utilities
```bash
get balance on Sepolia
help
exit
```

## 🔧 Troubleshooting

### Common Issues
```bash
# Missing environment variables
export DEMO_PRIVATE_KEY="your_key"
export INFURA_API_KEY="your_key"
export OPENAI_API_KEY="your_key"

# Check wallet balance
node -e "
const { ethers } = require('ethers');
const wallet = new ethers.Wallet(process.env.DEMO_PRIVATE_KEY);
const provider = new ethers.JsonRpcProvider('https://sepolia.infura.io/v3/' + process.env.INFURA_API_KEY);
provider.getBalance(wallet.address).then(balance => {
    console.log('Balance:', ethers.formatEther(balance), 'ETH');
});
"

# Test API connections
node -e "
const { ethers } = require('ethers');
const provider = new ethers.JsonRpcProvider('https://sepolia.infura.io/v3/' + process.env.INFURA_API_KEY);
provider.getBlockNumber().then(block => console.log('Infura OK, block:', block));
"
```

### Error Messages
- **"DEMO_PRIVATE_KEY required"** → Set environment variable
- **"Invalid private key"** → Check format (64 hex chars, no 0x)
- **"Insufficient balance"** → Get tokens from faucets
- **"Network error"** → Check Infura API key
- **"OpenAI error"** → Check OpenAI API key

## 📊 Expected Output

```
🎯 Processing: "transfer 0.001 ETH to Bob on Sepolia"
🔧 Step 1: Intent Recognition
✅ Intent: transfer (confidence: 0.98)
🔧 Step 2: Parameter Extraction
✅ Parameters extracted successfully
🔧 Step 3: Risk Assessment
✅ No risks detected
🔧 Step 5: Transaction Execution
⚠️  Execute this transaction? (y/N): y
✅ Transaction executed successfully!
📊 Transaction Hash: 0x1234...5678
📊 Block Explorer: https://sepolia.etherscan.io/tx/0x1234...5678
```

## 🚨 Safety Rules

1. **NEVER use mainnet private keys**
2. **NEVER share your private key**
3. **Start with small amounts (0.001 ETH)**
4. **Use dedicated testnet wallet**
5. **Monitor spending limits**

## 📞 Support

- **Setup Guide**: `DEMO-SETUP-GUIDE.md`
- **Demo README**: `apps/api/demo/README.md`
- **Troubleshooting**: See setup guide troubleshooting section

---

**HAi Wallet Demo** - AI-powered blockchain transactions! 🚀 