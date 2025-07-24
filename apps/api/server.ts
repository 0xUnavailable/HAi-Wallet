import * as dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import { RelayApiClient } from './modules/relayApiClient';
import { executeQuoteSteps } from './services/quoteExecutionService';
import { createWalletClientUtil } from './utils/wallet';
import { baseSepolia, sepolia, optimismSepolia } from 'viem/chains';
import axios from 'axios';
import { buildQuoteParams } from './utils/quoteParamsBuilder';
import { privateKeyToAccount } from 'viem/accounts';

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

// POST /api/relay/quote-and-execute
app.post('/api/relay/quote-and-execute', async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt) return res.status(400).json({ error: 'Missing prompt' });

    // Step 1: Call NLP service
    const nlpResp = await fetch('http://localhost:8000/process_prompt', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt })
    });
    if (!nlpResp.ok) {
      const err = await nlpResp.text();
      return res.status(500).json({ error: `NLP service error: ${err}` });
    }
    const nlpData = await nlpResp.json();
    if (!nlpData || nlpData.status !== 'success' || !nlpData.result) {
      return res.status(400).json({ error: 'Invalid NLP response' });
    }
    const { intent, parameters } = nlpData.result;
    if (!intent || !parameters) {
      return res.status(400).json({ error: 'Missing intent or parameters from NLP' });
    }
    // Debug: Log the parameters received from NLP
    console.log('NLP parameters:', JSON.stringify(parameters, null, 2));
    // Step 2: Build quoteParams
    const quoteParams = buildQuoteParams(intent, parameters);

    // Always set the 'user' parameter to the live wallet address
    const privateKey = process.env.PRIVATE_KEY;
    if (!privateKey) {
      return res.status(400).json({ error: 'Missing PRIVATE_KEY env variable' });
    }
    const account = privateKeyToAccount(privateKey as `0x${string}`);
    quoteParams.user = account.address;

    // Step 3: Get the quote
    const quoteRes = await axios.post('http://localhost:3001/api/relay/quote', quoteParams);
    const quote = quoteRes.data;
    console.log('Quote response:', quote);

    // Step 4: Execute the quote using a live wallet
    // Map supported testnet chain IDs to viem chain objects
    const chainMap: Record<number, any> = {
      11155111: sepolia,         // Ethereum Sepolia
      84532: baseSepolia,       // Base Sepolia
      11155420: optimismSepolia // Optimism Sepolia
    };
    const chain = chainMap[quoteParams.originChainId];
    if (!chain) {
      return res.status(400).json({ error: 'Unsupported chainId: ' + quoteParams.originChainId });
    }
    const walletClient = createWalletClientUtil(privateKey, chain);
    const requestId = await executeQuoteSteps(quote, walletClient, {
      pollStatus: true,
      pollIntervalMs: 5000,
      pollMaxAttempts: 30,
    });
    res.json({ status: 'success', quote, requestId });
  } catch (error) {
    const err = error as any;
    if (err.response) {
      console.error('Execution error:', err.response.status, err.response.data);
      res.status(err.response.status).json({ error: err.response.data });
    } else {
      console.error('Execution error:', err.message);
      res.status(500).json({ error: err.message });
    }
  }
});

// NLP-integrated prompt endpoint (test NLP connection only)
app.post('/api/prompt', async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt) return res.status(400).json({ error: 'Missing prompt' });

    // Call NLP service
    const nlpResp = await fetch('http://localhost:8000/process_prompt', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt })
    });
    if (!nlpResp.ok) {
      const err = await nlpResp.text();
      return res.status(500).json({ error: `NLP service error: ${err}` });
    }
    const nlpData = await nlpResp.json();
    // Return only the NLP response for now
    return res.json({ status: 'success', nlp: nlpData });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || error.toString() });
  }
});
// Start server if run directly
if (require.main === module) {
  app.listen(port, () => {
    console.log(`Relay API server listening on port ${port}`);
  });
}

export default app; 