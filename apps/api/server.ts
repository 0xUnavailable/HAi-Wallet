import * as dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import { RelayApiClient } from './modules/relayApiClient';
import { executeQuoteSteps } from './services/quoteExecutionService';
import { createWalletClientUtil } from './utils/wallet';
import { baseSepolia } from 'viem/chains';

const app = express();
const port = process.env.PORT || 3001;

console.log('Loaded PRIVATE_KEY:', process.env.PRIVATE_KEY);

app.use(express.json());

const relayClient = new RelayApiClient('testnet'); // Use testnet by default

async function handleRelayError(error: any, res: any) {
  if (error.response) {
    const status = error.response.status || 500;
    let body;
    try {
      body = await error.response.json();
    } catch {
      try {
        body = await error.response.text();
      } catch {
        body = error.message || error.toString();
      }
    }
    res.status(status).json({ error: body });
  } else {
    res.status(500).json({ error: error.message || error.toString() });
  }
}

// GET /api/relay/chains
app.get('/api/relay/chains', async (req, res) => {
  try {
    const data = await relayClient.getChains();
    res.json(data);
  } catch (error: any) {
    await handleRelayError(error, res);
  }
});

// GET /api/relay/execution-status?requestId=...
app.get('/api/relay/execution-status', async (req, res) => {
  try {
    const { requestId } = req.query;
    if (!requestId) return res.status(400).json({ error: 'Missing requestId' });
    const data = await relayClient.getExecutionStatus(requestId as string);
    res.json(data);
  } catch (error: any) {
    await handleRelayError(error, res);
  }
});

// GET /api/relay/requests
app.get('/api/relay/requests', async (req, res) => {
  try {
    const data = await relayClient.getRequests(req.query);
    res.json(data);
  } catch (error: any) {
    await handleRelayError(error, res);
  }
});

// GET /api/relay/token-price?address=...&chainId=...
app.get('/api/relay/token-price', async (req, res) => {
  try {
    const { address, chainId } = req.query;
    if (!address || !chainId) return res.status(400).json({ error: 'Missing address or chainId' });
    const data = await relayClient.getTokenPrice(address as string, Number(chainId));
    res.json(data);
  } catch (error: any) {
    await handleRelayError(error, res);
  }
});

// POST /api/relay/currencies
app.post('/api/relay/currencies', async (req, res) => {
  try {
    const body = req.body;
    if (!body) return res.status(400).json({ error: 'Missing request body' });
    const data = await relayClient.getCurrencies(body);
    res.json(data);
  } catch (error: any) {
    await handleRelayError(error, res);
  }
});

// POST /api/relay/quote
app.post('/api/relay/quote', async (req, res) => {
  try {
    const body = req.body;
    if (!body) return res.status(400).json({ error: 'Missing request body' });
    const data = await relayClient.getQuote(body);
    res.json(data);
  } catch (error: any) {
    await handleRelayError(error, res);
  }
});

// POST /api/relay/multi-input-quote
app.post('/api/relay/multi-input-quote', async (req, res) => {
  try {
    const body = req.body;
    if (!body) return res.status(400).json({ error: 'Missing request body' });
    const data = await relayClient.getMultiInputQuote(body);
    res.json(data);
  } catch (error: any) {
    await handleRelayError(error, res);
  }
});

// POST /api/relay/index-transaction
app.post('/api/relay/index-transaction', async (req, res) => {
  try {
    const body = req.body;
    if (!body) return res.status(400).json({ error: 'Missing request body' });
    const data = await relayClient.indexTransaction(body);
    res.json(data);
  } catch (error: any) {
    await handleRelayError(error, res);
  }
});

// POST /api/relay/index-single-transaction
app.post('/api/relay/index-single-transaction', async (req, res) => {
  try {
    const body = req.body;
    if (!body) return res.status(400).json({ error: 'Missing request body' });
    const data = await relayClient.indexSingleTransaction(body);
    res.json(data);
  } catch (error: any) {
    await handleRelayError(error, res);
  }
});

// POST /api/relay/execute-quote
app.post('/api/relay/execute-quote', async (req, res) => {
  try {
    const { quote } = req.body;
    const privateKey = process.env.PRIVATE_KEY;
    console.log('Received quote:', quote ? 'YES' : 'NO');
    console.log('PRIVATE_KEY present:', !!privateKey);
    if (quote) {
      console.log('Quote:', JSON.stringify(quote, null, 2));
    }
    if (!quote || !privateKey) {
      return res.status(400).json({ error: 'Missing quote or PRIVATE_KEY env variable' });
    }

    const walletClient = createWalletClientUtil(privateKey, baseSepolia);
    const requestId = await executeQuoteSteps(quote, walletClient, {
      pollStatus: true,
      pollIntervalMs: 5000,
      pollMaxAttempts: 30,
    });

    res.json({ status: 'success', requestId });
  } catch (error: any) {
    console.error('Execute Quote Error:', error.message);
    res.status(500).json({ error: error.message || error.toString() });
  }
});
// Start server if run directly
if (require.main === module) {
  app.listen(port, () => {
    console.log(`Relay API server listening on port ${port}`);
  });
}

export default app; 