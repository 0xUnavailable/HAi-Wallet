# 🚀 HAi Wallet - Complete Deployment Guide

## 📋 System Overview

The HAi Wallet consists of three main components that need to be running simultaneously:

1. **NLP Server** (Python) - Natural Language Processing for transaction interpretation
2. **Backend API Server** (Node.js) - Core wallet functionality and relay integration
3. **Frontend Web App** (Vite) - User interface and PWA

## 🛠️ Prerequisites

### Required Software:
- **Python 3.8+** with pip
- **Node.js 18+** with npm
- **Git** (for cloning the repository)

### Required Accounts/Keys:
- **Relay API Key** (for transaction execution)
- **Firebase Admin SDK** (optional, for production)

## 📦 Installation Steps

### 1. Clone and Setup Repository
```bash
git clone <your-repo-url>
cd HAi-Wallet
npm install
```

### 2. Install Python Dependencies (NLP Server)
```bash
cd NLP
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### 3. Install Backend Dependencies
```bash
cd apps/api
npm install
```

### 4. Install Frontend Dependencies
```bash
cd apps/web
npm install
```

## 🔧 Environment Configuration

### Backend Environment Variables
Create `.env` file in `apps/api/`:
```env
# Relay API Configuration
RELAY_API_KEY=your_relay_api_key_here

# Optional: Firebase Admin SDK
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_PRIVATE_KEY=your_private_key
FIREBASE_CLIENT_EMAIL=your_client_email

# Server Configuration
PORT=3001
NODE_ENV=development
```

### Frontend Environment Variables
Create `.env` file in `apps/web/`:
```env
VITE_API_BASE_URL=http://localhost:3001/api
VITE_NLP_SERVICE_URL=http://localhost:8000
```

## 🚀 Startup Sequence

### Step 1: Start NLP Server
```bash
cd NLP
source venv/bin/activate  # On Windows: venv\Scripts\activate
python nlp_service.py
```
**Expected Output:**
```
🤖 NLP Service starting on port 8000...
✅ Model loaded successfully
🚀 NLP Service ready to process prompts
```

### Step 2: Start Backend API Server
```bash
cd apps/api
npm run dev
```
**Expected Output:**
```
Relay API server listening on port 3001
🔧 CORS enabled for localhost:8080
✅ Backend API server ready
```

### Step 3: Start Frontend Web App
```bash
cd apps/web
npm run dev
```
**Expected Output:**
```
  VITE v5.x.x  ready in xxx ms

  ➜  Local:   http://localhost:8080/
  ➜  Network: use --host to expose
  ➜  press h to show help
```

## 🌐 Access Points

Once all services are running:

- **Frontend Web App**: http://localhost:8080
- **Backend API**: http://localhost:3001/api
- **NLP Service**: http://localhost:8000

## 🔍 Verification Steps

### 1. Check NLP Service
```bash
curl -X POST http://localhost:8000/process_prompt \
  -H "Content-Type: application/json" \
  -d '{"prompt": "Send 0.1 ETH to Bob"}'
```

### 2. Check Backend API
```bash
curl http://localhost:3001/api/relay/chains
```

### 3. Check Frontend
Open http://localhost:8080 in your browser and verify:
- ✅ Login with email works
- ✅ Wallet address is displayed
- ✅ Balances are loading
- ✅ Contact management works
- ✅ Transaction execution works

## 🐛 Troubleshooting

### Common Issues:

#### 1. NLP Server Won't Start
```bash
# Check Python version
python --version  # Should be 3.8+

# Reinstall dependencies
cd NLP
pip install -r requirements.txt --force-reinstall
```

#### 2. Backend API Errors
```bash
# Check Node.js version
node --version  # Should be 18+

# Clear node_modules and reinstall
cd apps/api
rm -rf node_modules package-lock.json
npm install
```

#### 3. Frontend Build Issues
```bash
# Clear Vite cache
cd apps/web
rm -rf node_modules/.vite
npm run dev
```

#### 4. CORS Issues
- Ensure backend is running on port 3001
- Check CORS configuration in `apps/api/server.ts`
- Verify frontend is accessing correct API URL

#### 5. Wallet Address Mismatch
- Check email reconstruction logic in backend
- Verify UID format consistency
- Check wallet generation from email

## 📱 PWA Features

The frontend includes Progressive Web App features:
- **Installable**: Can be installed on mobile devices
- **Offline Support**: Basic offline functionality
- **Service Worker**: Caching for better performance

## 🔒 Security Notes

### Development Mode:
- Uses demo private keys
- No real transaction execution
- CORS enabled for localhost

### Production Considerations:
- Use real Relay API keys
- Implement proper authentication
- Configure Firebase Admin SDK
- Set up proper CORS policies
- Use HTTPS in production

## 📊 Monitoring

### Logs to Monitor:
- **NLP Service**: Prompt processing and model responses
- **Backend API**: Transaction execution and relay interactions
- **Frontend**: User interactions and API calls

### Key Metrics:
- Transaction success rate
- NLP processing accuracy
- API response times
- User session duration

## 🎯 Quick Start Script

Create a `start-all.sh` script for easy deployment:

```bash
#!/bin/bash
echo "🚀 Starting HAi Wallet System..."

# Start NLP Server
echo "🤖 Starting NLP Server..."
cd NLP
source venv/bin/activate
python nlp_service.py &
NLP_PID=$!

# Start Backend API
echo "🔧 Starting Backend API..."
cd ../apps/api
npm run dev &
API_PID=$!

# Start Frontend
echo "🌐 Starting Frontend..."
cd ../web
npm run dev &
FRONTEND_PID=$!

echo "✅ All services started!"
echo "📱 Frontend: http://localhost:8080"
echo "🔧 Backend: http://localhost:3001"
echo "🤖 NLP: http://localhost:8000"

# Wait for user to stop
echo "Press Ctrl+C to stop all services"
wait
```

Make it executable:
```bash
chmod +x start-all.sh
./start-all.sh
```

## 🎉 Success Indicators

Your deployment is successful when:

1. ✅ All three services start without errors
2. ✅ Frontend loads at http://localhost:8080
3. ✅ Email login creates a wallet
4. ✅ Balances display correctly
5. ✅ Contacts can be added and used
6. ✅ Natural language transactions execute successfully
7. ✅ PWA features work (installable, offline)

## 📞 Support

If you encounter issues:
1. Check the troubleshooting section above
2. Review service logs for error messages
3. Verify all environment variables are set correctly
4. Ensure all dependencies are installed

---

**Happy Deploying! 🚀** 