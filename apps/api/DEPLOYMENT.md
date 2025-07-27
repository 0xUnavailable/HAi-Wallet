# HAi Wallet API Deployment Guide

This guide covers deploying the HAi Wallet API to Render and troubleshooting common issues.

## Prerequisites

- Node.js 18+ 
- npm or yarn
- Render account

## Local Development Setup

1. **Install dependencies:**
   ```bash
   cd apps/api
   npm install
   ```

2. **Start development server:**
   ```bash
   npm run dev
   ```

3. **Start production server:**
   ```bash
   npm start
   ```

## Render Deployment

### Option 1: Automatic Deployment (Recommended)

1. **Connect your GitHub repository to Render**
2. **Create a new Web Service**
3. **Configure the service:**
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Environment:** Node

### Option 2: Manual Configuration

If you need to manually configure Render:

1. **Environment Variables:**
   ```
   NODE_ENV=production
   PORT=3001
   ```

2. **Build Command:**
   ```bash
   npm install
   ```

3. **Start Command:**
   ```bash
   npm start
   ```

## Troubleshooting

### Issue: "ts-node: not found"

**Solution:** This means TypeScript dependencies are missing. The updated `package.json` includes:
- `ts-node`
- `typescript`
- Required type definitions

**Fix:** Redeploy with the updated `package.json`

### Issue: "Module not found"

**Solution:** Check that all dependencies are in `package.json`:
```json
{
  "dependencies": {
    "axios": "^1.6.0",
    "chalk": "^5.4.1",
    "cors": "^2.8.5",
    "dotenv": "^16.3.1",
    "ethers": "^6.8.1",
    "express": "^4.18.2",
    "firebase-admin": "^13.4.0",
    "nodemon": "^3.1.10",
    "ts-node": "^10.9.1",
    "typescript": "^5.2.2",
    "viem": "^1.19.0"
  }
}
```

### Issue: "Cannot find module './config'"

**Solution:** Ensure all TypeScript files are properly compiled. The `tsconfig.json` should handle this.

### Issue: NLP Service Connection Fails

**Solution:** Check the NLP service configuration in `config.ts`:
```typescript
export const config = {
  nlp: {
    localUrl: 'http://localhost:8000',
    deployedUrl: 'https://hai-wallet-nlp.onrender.com',
    useDeployed: true, // Set to true for production
    getUrl(): string {
      return this.useDeployed ? this.deployedUrl : this.localUrl;
    }
  }
};
```

## Environment-Specific Configuration

### Development
- Set `useDeployed: false` in `config.ts`
- NLP service runs locally at `http://localhost:8000`

### Production
- Set `useDeployed: true` in `config.ts`
- NLP service runs on Render at `https://hai-wallet-nlp.onrender.com`

## Testing Deployment

### 1. Test API Health
```bash
curl https://your-render-app.onrender.com/api/health
```

### 2. Test NLP Integration
```bash
curl -X POST "https://your-render-app.onrender.com/api/prompt" \
  -H "Content-Type: application/json" \
  -d '{"prompt": "Send 100 ETH to Bob"}'
```

### 3. Test Full Transaction Flow
```bash
curl -X POST "https://your-render-app.onrender.com/api/relay/quote-and-execute" \
  -H "Content-Type: application/json" \
  -d '{"prompt": "Send 100 ETH to Bob", "uid": "test-user"}'
```

## Logs and Debugging

### Render Logs
Check Render dashboard for:
- Build logs
- Runtime logs
- Environment variables

### Application Logs
The API includes comprehensive logging:
```
🚀 Starting transaction with UID: test-user
📝 Original prompt: Send 100 ETH to Bob
🤖 Using NLP service at: https://hai-wallet-nlp.onrender.com
```

## Performance Optimization

### For Production
1. **Use compiled JavaScript:**
   ```bash
   npm run build:start
   ```

2. **Enable caching:**
   - Add Redis for session storage
   - Implement response caching

3. **Monitor performance:**
   - Use Render's built-in monitoring
   - Add application metrics

## Security Considerations

1. **Environment Variables:**
   - Never commit secrets to git
   - Use Render's environment variable system

2. **CORS Configuration:**
   - Update CORS origins for production domains
   - Restrict allowed methods and headers

3. **Rate Limiting:**
   - Implement rate limiting for API endpoints
   - Monitor for abuse

## Support

If you encounter issues:
1. Check Render logs
2. Verify all dependencies are installed
3. Test locally first
4. Check NLP service status 