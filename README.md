# 🚀 HAi Wallet

**Just prompt your transaction** - A modern digital wallet that executes complex transactions using natural language.

## ✨ Features

- 🤖 **Natural Language Processing**: Describe transactions in plain English
- 🔄 **Multi-Chain Support**: Ethereum Sepolia, Base Sepolia, Optimism Sepolia
- 💰 **Smart Transactions**: Swaps, Transfers, and Bridging
- 👥 **Contact Management**: Save and use contact names in transactions
- 📱 **Progressive Web App**: Installable on mobile devices
- 🎨 **Modern UI**: Dark theme with mobile-first design

## 🚀 Quick Start

### Option 1: Automated Startup (Recommended)

**Linux/macOS:**
```bash
./start-all.sh
```

**Windows:**
```cmd
start-all.bat
```

### Option 2: Manual Startup

1. **Start NLP Server:**
   ```bash
   cd NLP
   source venv/bin/activate  # Windows: venv\Scripts\activate
   python nlp_service.py
   ```

2. **Start Backend API:**
   ```bash
   cd apps/api
   npm run dev
   ```

3. **Start Frontend:**
   ```bash
   cd apps/web
   npm run dev
   ```

## 🌐 Access Points

- **Frontend**: http://localhost:8080
- **Backend API**: http://localhost:3001
- **NLP Service**: http://localhost:8000

## 💡 Example Transactions

- "Send 0.1 ETH to Bob"
- "Swap 50 USDC to ETH on Base"
- "Bridge 0.05 ETH from Ethereum to Optimism"
- "Transfer 100 USDC to 0x1234... on Ethereum"

## 📋 Prerequisites

- Python 3.8+
- Node.js 18+
- Relay API Key (for transaction execution)

## 📖 Documentation

For detailed setup and troubleshooting, see [DEPLOYMENT-GUIDE.md](./DEPLOYMENT-GUIDE.md)

## 🎯 What's New

- ✅ Fixed wallet address consistency across all operations
- ✅ Updated UI with "Execute" button and natural language focus
- ✅ Enhanced contact management system
- ✅ Improved balance formatting and display
- ✅ Added PWA features for mobile installation

---

**Happy Transacting! 🚀**
