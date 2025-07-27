# NLP Service Configuration

This document explains how to configure the NLP service integration in the HAi Wallet API.

## Configuration File

The NLP service configuration is managed in `config.ts`:

```typescript
export const config = {
  nlp: {
    localUrl: 'http://localhost:8000',
    deployedUrl: 'https://hai-wallet-nlp.onrender.com',
    useDeployed: true,
    getUrl(): string {
      return this.useDeployed ? this.deployedUrl : this.localUrl;
    }
  }
};
```

## Switching Between Environments

### For Local Development
Set `useDeployed: false` in `config.ts`:
```typescript
useDeployed: false
```

### For Production/Deployment
Set `useDeployed: true` in `config.ts`:
```typescript
useDeployed: true
```

## API Endpoints

The server now calls the NLP service at these endpoints:

1. **Quote and Execute**: `/api/relay/quote-and-execute`
   - Calls: `${nlpUrl}/process_prompt`
   - Purpose: Process prompts for transaction execution

2. **Prompt Testing**: `/api/prompt`
   - Calls: `${nlpUrl}/process_prompt`
   - Purpose: Test NLP processing without execution

## Testing the Configuration

### 1. Test the deployed NLP service directly:
```bash
curl -X POST "https://hai-wallet-nlp.onrender.com/process_prompt" \
  -H "Content-Type: application/json" \
  -d '{"prompt": "Send 100 ETH to Bob"}'
```

### 2. Test through the API server:
```bash
curl -X POST "http://localhost:3001/api/prompt" \
  -H "Content-Type: application/json" \
  -d '{"prompt": "Send 100 ETH to Bob"}'
```

### 3. Test the full transaction flow:
```bash
curl -X POST "http://localhost:3001/api/relay/quote-and-execute" \
  -H "Content-Type: application/json" \
  -d '{"prompt": "Send 100 ETH to Bob", "uid": "test-user"}'
```

## Environment Variables

You can also control the configuration using environment variables:

```bash
# Force use of deployed NLP service
export USE_DEPLOYED_NLP=true

# Use local NLP service
export USE_DEPLOYED_NLP=false
```

## Troubleshooting

### Issue: NLP service not responding
1. Check if the NLP service is running:
   - Local: `http://localhost:8000/docs`
   - Deployed: `https://hai-wallet-nlp.onrender.com/docs`

2. Check the configuration in `config.ts`

3. Look for logs in the API server console:
   ```
   🤖 Using NLP service at: https://hai-wallet-nlp.onrender.com
   ```

### Issue: Wrong NLP service being called
1. Verify the `useDeployed` setting in `config.ts`
2. Restart the API server after changing configuration
3. Check the console logs for the URL being used

## Deployment Notes

- The deployed NLP service is hosted on Render at `https://hai-wallet-nlp.onrender.com`
- The service automatically downloads the spaCy English model on startup
- If the custom trained model is not available, it falls back to the standard spaCy model
- The service includes comprehensive error handling and logging 