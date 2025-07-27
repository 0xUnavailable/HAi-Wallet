import * as dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import { RelayApiClient } from './modules/relayApiClient';
import { executeQuoteSteps } from './services/quoteExecutionService';
import { createWalletClientUtil } from './utils/wallet';
import { baseSepolia, sepolia, optimismSepolia } from 'viem/chains';
import { createPublicClient, http } from 'viem';
import axios from 'axios';
import { buildQuoteParams } from './utils/quoteParamsBuilder';
import { privateKeyToAccount } from 'viem/accounts';
import firebaseWrapper from './firebaseConfig';
import admin from 'firebase-admin';
import { Wallet, keccak256, toUtf8Bytes } from 'ethers';
import { config } from './config';
import { NLPResponse, NLPResult, NLPParameters, PromptRequest, QuoteExecuteRequest, ContactRequest, ContactResponse, ErrorResponse, SuccessResponse, Intent } from './types';

const app = express();
const port = process.env.PORT || 3001;

// CORS configuration
app.use(cors({
  origin: [
    'http://localhost:8080', 
    'http://127.0.0.1:8080',
    'https://hai-wallet-ui.onrender.com',
    'https://hai-wallet-ui.onrender.com/',
    'https://*.onrender.com'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Origin', 'X-Requested-With', 'Accept']
}));

// Simple in-memory contact storage
const userContacts: Record<string, Record<string, string>> = {};

// Simple in-memory wallet storage to ensure consistency
const userWallets: Record<string, string> = {};

// Contact management functions
function addContact(uid: string, name: string, address: string) {
  if (!userContacts[uid]) {
    userContacts[uid] = {};
  }
  userContacts[uid][name] = address;
}

function getContacts(uid: string): Record<string, string> {
  const contacts = userContacts[uid] || {};
  return contacts;
}

function deleteContact(uid: string, name: string) {
  if (userContacts[uid] && userContacts[uid][name]) {
    delete userContacts[uid][name];
  }
}

function resolveContact(uid: string, name: string): string | null {
  const contacts = userContacts[uid] || {};
  const address = contacts[name];
  return address || null;
}

// Demo private key for testing (replace with real key for production)
const DEMO_PRIVATE_KEY = "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef";
const WALLET_SERVER_SECRET = "hai-wallet-secret-key-2024";


// Generate deterministic wallet from email
function generateDeterministicWallet(email: string): { address: string; privateKey: string } {
    try {
        // Create deterministic seed from email + server secret
        const seed = email + WALLET_SERVER_SECRET;
        
        // Generate deterministic hash
        const hash = keccak256(toUtf8Bytes(seed));
        
        // Create wallet from private key derived from hash
        const privateKey = hash.substring(2); // Remove '0x' prefix
        const wallet = new Wallet(privateKey);
        
        return {
            address: wallet.address,
            privateKey: wallet.privateKey
        };
    } catch (error) {
        console.error('Wallet generation error:', error);
        throw new Error('Failed to generate wallet');
    }
}

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
    const { quote, uid } = req.body;
    
    if (!quote) {
      return res.status(400).json({ error: 'Missing quote' });
    }

    // Use the user's actual private key, not the demo key
    let privateKey = process.env.PRIVATE_KEY || DEMO_PRIVATE_KEY;
    
    if (uid) {
      try {
        // Extract email from UID: user_email_timestamp -> email
        // The email has dots replaced with underscores, so we need to reconstruct it
        const uidParts = uid.split('_');
        // Remove 'user' prefix and timestamp suffix, then reconstruct email
        const emailParts = uidParts.slice(1, -1); // Remove first ('user') and last (timestamp)
        const userEmail = emailParts.join('@'); // Join with @ to reconstruct email
        
        const wallet = generateDeterministicWallet(userEmail);
        privateKey = wallet.privateKey;
      } catch (error) {
        // Fallback to demo private key
      }
    }

    const walletClient = createWalletClientUtil(privateKey, baseSepolia);
    const result = await executeQuoteSteps(quote, walletClient, {
      pollStatus: true,
      pollIntervalMs: 5000,
      pollMaxAttempts: 30,
    });

    const { requestId, transactionHash } = result;
    res.json({ 
      status: 'success', 
      requestId,
      transactionHash: transactionHash || null,
      message: 'Transaction executed successfully!'
    });
  } catch (error: any) {
    console.error('Execute Quote Error:', error.message);
    res.status(500).json({ error: error.message || error.toString() });
  }
});

// POST /api/relay/quote-and-execute
app.post('/api/relay/quote-and-execute', async (req, res) => {
  try {
    const { prompt, uid } = req.body;
    if (!prompt) return res.status(400).json({ error: 'Missing prompt' });

    // Step 1: Call NLP service
    
    const nlpResp = await fetch(`${config.nlp.getUrl()}/process_prompt`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt })
    });
    if (!nlpResp.ok) {
      const err = await nlpResp.text();
      return res.status(500).json({ error: `NLP service error: ${err}` });
    }
    const nlpData = await nlpResp.json();
    
    if (!nlpData || typeof nlpData !== 'object') {
      return res.status(400).json({ error: 'Invalid NLP response format' });
    }
    
    // Type guard to ensure we have a valid NLPResponse
    if (!('status' in nlpData) || !('result' in nlpData)) {
      return res.status(400).json({ error: 'NLP response missing required fields' });
    }
    
    const typedNlpData = nlpData as NLPResponse;
    if (typedNlpData.status !== 'success' || !typedNlpData.result) {
      return res.status(400).json({ error: 'Invalid NLP response' });
    }
    const { intent, parameters } = typedNlpData.result;
    if (!intent || !parameters) {
      return res.status(400).json({ error: 'Missing intent or parameters from NLP' });
    }
    
    // Fix parameter mapping - the NLP returns "to" but we need "recipient"
    if (parameters.to && !parameters.recipient) {
      parameters.recipient = parameters.to;
    }
    
    // Step 1.5: Resolve contact names to addresses if user is provided
    
          if (uid && parameters.recipient) {
        // First, let's check what contacts exist for this user
        const allContacts = getContacts(uid);
        
        const resolvedAddress = resolveContact(uid, parameters.recipient);
        
        if (resolvedAddress) {
          parameters.recipient = resolvedAddress;
        } else {
          // Check if it's already a valid address
          if (!/^0x[a-fA-F0-9]{40}$/.test(parameters.recipient)) {
            return res.status(400).json({ 
              error: `Contact "${parameters.recipient}" not found. Please add this contact first or use a valid wallet address.` 
            });
          }
        }
      }
    
    // Step 2: Build quoteParams - Map parameters to expected format
    
    // Get the user's actual wallet address from the stored wallet
    let userWalletAddress = '0x1234567890abcdef1234567890abcdef1234567890'; // Fallback
    
    if (uid) {
      try {
        // Extract email from UID: user_email_timestamp -> email
        // The email has dots replaced with underscores, so we need to reconstruct it
        const uidParts = uid.split('_');
        // Remove 'user' prefix and timestamp suffix, then reconstruct email
        const emailParts = uidParts.slice(1, -1); // Remove first ('user') and last (timestamp)
        
        // Reconstruct email properly: first part is username, rest is domain
        const username = emailParts[0];
        const domain = emailParts.slice(1).join('.'); // Join domain parts with dots
        const userEmail = `${username}@${domain}`;
        
        const wallet = generateDeterministicWallet(userEmail);
        userWalletAddress = wallet.address; // Always use generated wallet address
      } catch (error) {
        // Fallback to demo private key
      }
    }

    // Extract amount from the correct location in the NLP response
    const tokenAmount = parameters.tokens?.[0]?.amount || parameters.amount || parameters.amountIn || parameters.value || parameters.quantity || '100';
    const tokenType = parameters.tokens?.[0]?.token || parameters.originCurrency || parameters.token || 'ETH';
    
    // Extract networks from the correct location in the NLP response
    const sourceNetwork = parameters.source_network || parameters.originNetwork || 'Base';
    const destNetwork = parameters.dest_network || parameters.destinationNetwork || 'Base';
    
    const mappedParams = {
      from: userWalletAddress,
      to: parameters.recipient || parameters.to || '', // Ensure to is always a string
      source_network: sourceNetwork,
      dest_network: destNetwork,
      tokens: [{
        amount: tokenAmount,
        token: tokenType
      }],
      token2: null, // Required by NLPParams interface
      query_type: null // Required by NLPParams interface
    };
    
    // Only proceed with supported intents
    if (intent === 'Swap' || intent === 'Bridge' || intent === 'Transfer') {
      const quoteParams = buildQuoteParams(intent as 'Swap' | 'Bridge' | 'Transfer', mappedParams);

      // Use the user's actual private key for both quote and execution
      let privateKey = process.env.PRIVATE_KEY || DEMO_PRIVATE_KEY;
      
      if (uid) {
        try {
          // Extract email from UID: user_email_timestamp -> email
          // The email has dots replaced with underscores, so we need to reconstruct it
          const uidParts = uid.split('_');
          // Remove 'user' prefix and timestamp suffix, then reconstruct email
          const emailParts = uidParts.slice(1, -1); // Remove first ('user') and last (timestamp)
          
          // Reconstruct email properly: first part is username, rest is domain
          const username = emailParts[0];
          const domain = emailParts.slice(1).join('.'); // Join domain parts with dots
          const userEmail = `${username}@${domain}`;
          
          const wallet = generateDeterministicWallet(userEmail);
          privateKey = wallet.privateKey;
        } catch (error) {
          // Fallback to demo private key
        }
      }

      // Step 3: Get the quote
      let quote: any;
      try {
        const quoteRes = await axios.post(`${config.relay.getUrl()}/api/relay/quote`, quoteParams, {
          timeout: 10000 // 10 second timeout
        });
        quote = quoteRes.data;
        
        if (!quote) {
          return res.status(500).json({ error: 'Quote response is null or undefined' });
        }
        
        // Check for required fields in the new quote response structure
        const requiredFields = ['steps', 'fees', 'details'];
        const missingFields = requiredFields.filter(field => !quote[field]);
        
        if (missingFields.length > 0) {
          return res.status(500).json({ error: `Quote response missing required fields: ${missingFields.join(', ')}` });
        }
      } catch (quoteError: any) {
        // Check if it's a network error (relay API not available)
        if (quoteError.code === 'ECONNREFUSED' || quoteError.code === 'ENOTFOUND' || quoteError.message.includes('fetch')) {
          return res.status(503).json({ 
            error: 'Relay API is not available. Please ensure the relay service is running.',
            details: 'The quote service is currently unavailable. This could be because the relay API is not deployed or not running.',
            code: 'RELAY_API_UNAVAILABLE'
          });
        }
        
        if (quoteError.response?.data?.error) {
          return res.status(quoteError.response.status).json({ 
            error: `Quote API error: ${quoteError.response.data.error}`,
            details: quoteError.response.data 
          });
        } else {
          // Handle AggregateError specifically
          if (quoteError.name === 'AggregateError') {
            return res.status(503).json({ 
              error: 'Relay API is not available. Multiple connection attempts failed.',
              details: 'The quote service is currently unavailable. This could be because the relay API is not deployed or not running.',
              code: 'RELAY_API_UNAVAILABLE',
              originalError: quoteError.message
            });
          }
          
          return res.status(500).json({ 
            error: `Quote request failed: ${quoteError.message}`,
            details: quoteError.toString()
          });
        }
      }

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
      
      try {
        const result = await executeQuoteSteps(quote, walletClient, {
          pollStatus: true,
          pollIntervalMs: 5000,
          pollMaxAttempts: 30,
        });
        
        const { requestId, transactionHash } = result;
        
        res.json({ 
          status: 'success', 
          transactionHash: transactionHash || null,
          requestId: requestId,
          message: 'Transaction executed successfully!'
        });
      } catch (executionError: any) {
        throw executionError; // Re-throw to be caught by the outer catch block
      }
    } else {
      return res.status(400).json({ error: `Unsupported intent: ${intent}` });
    }
  } catch (error) {
    const err = error as any;
    if (err.response) {
      // Extract the error message from the Relay API response
      let errorMessage = 'Transaction failed';
      if (err.response.data && err.response.data.error) {
        if (typeof err.response.data.error === 'string') {
          errorMessage = err.response.data.error;
        } else if (err.response.data.error.message) {
          errorMessage = err.response.data.error.message;
        } else {
          errorMessage = JSON.stringify(err.response.data.error);
        }
      }
      
      res.status(err.response.status).json({ 
        error: errorMessage,
        details: err.response.data 
      });
    } else {
      res.status(500).json({ error: err.message || 'Transaction failed' });
    }
  }
});

// POST /api/auth/google
app.post('/api/auth/google', async (req, res) => {
  try {
    const { idToken } = req.body;
    if (!idToken) return res.status(400).json({ error: 'Missing Google ID token' });

    // Verify the Google ID token
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const uid = decodedToken.uid;
    if (!uid) return res.status(400).json({ error: 'Invalid Google ID token' });

    // Deterministically generate Ethereum wallet from UID + server secret
    const serverSecret = "hai-wallet-secret-key-2024"; // Hardcoded for demo
    // Use ethers.js to create a deterministic wallet
    const hashInput = uid + serverSecret;
    const hash = keccak256(toUtf8Bytes(hashInput));
    const wallet = new Wallet(hash);
    const walletAddress = wallet.address;

    // Store wallet address in Firestore if not already present
    if (firebaseWrapper.isInitialized()) {
      const userRef = admin.firestore().collection('users').doc(uid);
      const userDoc = await userRef.get();
      if (!userDoc.exists) {
        await userRef.set({ walletAddress });
      } else if (!userDoc.data()?.walletAddress) {
        await userRef.update({ walletAddress });
      }
    }

    res.json({ status: 'success', walletAddress });
  } catch (error) {
    const err = error as any;
    console.error('Google Auth Error:', err);
    res.status(500).json({ error: err.message || err.toString() });
  }
});

// GET /api/auth/wallet-address/:uid - Get wallet address for a user
app.get('/api/auth/wallet-address/:uid', async (req, res) => {
  try {
    const { uid } = req.params;
    if (!uid) return res.status(400).json({ error: 'Missing user ID' });

    // Get the stored wallet address
    const walletAddress = userWallets[uid];
    
    if (!walletAddress) {
      return res.status(404).json({ error: 'Wallet address not found for this user' });
    }


    
    res.json({ 
      status: 'success', 
      walletAddress: walletAddress,
      uid: uid
    });
  } catch (error) {
    const err = error as any;
    console.error('Get Wallet Address Error:', err);
    res.status(500).json({ error: err.message || err.toString() });
  }
});

// POST /api/balance - Get balance for a specific network
app.post('/api/balance', async (req, res) => {
  try {
    const { address, chainId } = req.body;
    if (!address || !chainId) {
      return res.status(400).json({ error: 'Missing address or chainId' });
    }

    // Map chainId to viem chain object with fallback RPC URLs
    const chainMap: Record<number, any> = {
      11155111: {
        ...sepolia,
        rpcUrls: {
          default: {
            http: [
              'https://eth-sepolia.g.alchemy.com/public',
              'https://eth-sepolia.g.alchemy.com/v2/demo',
              'https://rpc.sepolia.org'
            ]
          },
          public: {
            http: [
              'https://eth-sepolia.g.alchemy.com/public',
              'https://eth-sepolia.g.alchemy.com/v2/demo',
              'https://rpc.sepolia.org'
            ]
          }
        }
      },
      84532: baseSepolia,
      11155420: optimismSepolia
    };

    const chain = chainMap[chainId];
    if (!chain) {
      return res.status(400).json({ error: 'Unsupported chainId' });
    }

    // Create public client with timeout
    const publicClient = createPublicClient({
      chain: chain,
      transport: http(),
    });

    // Get balance with timeout handling
    let balance;
    try {
      balance = await publicClient.getBalance({ address: address as `0x${string}` });
    } catch (balanceError: any) {
             // If the first RPC fails, try alternative endpoints for Sepolia
       if (chainId === 11155111) {
         const alternativeRPCs = [
           'https://eth-sepolia.g.alchemy.com/public',
           'https://eth-sepolia.g.alchemy.com/v2/demo',
           'https://rpc.sepolia.org'
         ];
        
        for (const rpcUrl of alternativeRPCs) {
          try {
                         const fallbackClient = createPublicClient({
               chain: {
                 ...sepolia,
                 rpcUrls: {
                   default: { http: [rpcUrl] },
                   public: { http: [rpcUrl] }
                 }
               },
               transport: http()
             });
            
            balance = await fallbackClient.getBalance({ address: address as `0x${string}` });
            break; // Success, exit the loop
          } catch (fallbackError) {
            continue; // Try next RPC
          }
        }
      }
      
      // If all RPCs fail, return 0 balance
      if (!balance) {
        return res.json({ 
          status: 'success',
          balance: '0.00',
          chainId: chainId,
          address: address,
          chainName: chain.name,
          note: 'RPC timeout, returning 0 balance'
        });
      }
    }

    const balanceInEth = Number(balance) / Math.pow(10, 18);

    res.json({ 
      status: 'success',
      balance: balanceInEth.toString(),
      chainId: chainId,
      address: address,
      chainName: chain.name
    });
  } catch (error: any) {
    res.status(500).json({ 
      error: error.message || 'Failed to fetch balance',
      balance: '0.00'
    });
  }
});

// GET / - Home endpoint
app.get('/', (req, res) => {
  res.json({ message: 'Hello' });
});

// GET /api/health - Health check endpoint that calls NLP service
app.get('/api/health', async (req, res) => {
  try {
    const nlpUrl = `${config.nlp.getUrl()}/health`;
    const response = await fetch(nlpUrl);
    
    if (response.ok) {
      res.json({ 
        status: 'healthy',
        timestamp: new Date().toISOString(),
        nlpService: 'connected'
      });
    } else {
      res.status(503).json({ 
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        nlpService: 'disconnected',
        error: `NLP service returned ${response.status}`
      });
    }
  } catch (error: any) {
    res.status(503).json({ 
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      nlpService: 'error',
      error: error.message
    });
  }
});

// Start health check interval (1 minute)
setInterval(async () => {
  try {
    const nlpUrl = `${config.nlp.getUrl()}/`;
    const response = await fetch(nlpUrl);
    
    if (response.ok) {
      const data = await response.json();
      console.log(`[${new Date().toISOString()}] Health check: NLP service home endpoint returned: ${JSON.stringify(data)}`);
    } else {
      console.log(`[${new Date().toISOString()}] Health check: NLP service home endpoint returned ${response.status}`);
    }
  } catch (error: any) {
    console.log(`[${new Date().toISOString()}] Health check: NLP service home endpoint error - ${error.message}`);
  }
}, 60000); // 1 minute interval

// POST /api/auth/email - Email-based authentication and wallet creation
app.post('/api/auth/email', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Missing email address' });

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    // Generate deterministic wallet from email
    const wallet = generateDeterministicWallet(email);
    
    // Create user ID from email
    const uid = 'user_' + email.replace(/[^a-zA-Z0-9]/g, '_') + '_' + Date.now();

    // Store wallet address in memory for consistency (but we'll always regenerate)
    userWallets[uid] = wallet.address;

    // Store wallet address in Firestore if available
    if (firebaseWrapper.isInitialized()) {
      const userRef = admin.firestore().collection('users').doc(uid);
      await userRef.set({ 
        email: email,
        walletAddress: wallet.address,
        createdAt: new Date()
      });
    }

    res.json({ 
      status: 'success', 
      walletAddress: wallet.address,
      uid: uid,
      email: email
    });
  } catch (error) {
    const err = error as any;
    res.status(500).json({ error: err.message || err.toString() });
  }
});

// Contact Management Endpoints

// POST /api/contacts - Add a contact
app.post('/api/contacts', async (req, res) => {
  try {
    const { uid, name, address } = req.body;
    if (!uid || !name || !address) {
      return res.status(400).json({ error: 'Missing uid, name, or address' });
    }

    // Validate wallet address format
    if (!/^0x[a-fA-F0-9]{40}$/.test(address)) {
      return res.status(400).json({ error: 'Invalid wallet address format' });
    }

    addContact(uid, name, address);
    res.json({ status: 'success', message: 'Contact added successfully' });
  } catch (error: any) {
    console.error('Add Contact Error:', error);
    res.status(500).json({ error: error.message || error.toString() });
  }
});

// GET /api/contacts/:uid - Get all contacts for a user
app.get('/api/contacts/:uid', async (req, res) => {
  try {
    const { uid } = req.params;
    if (!uid) {
      return res.status(400).json({ error: 'Missing user ID' });
    }

    const contacts = getContacts(uid);
    res.json({ contacts });
  } catch (error: any) {
    console.error('Get Contacts Error:', error);
    res.status(500).json({ error: error.message || error.toString() });
  }
});

// DELETE /api/contacts/:uid/:name - Delete a contact
app.delete('/api/contacts/:uid/:name', async (req, res) => {
  try {
    const { uid, name } = req.params;
    if (!uid || !name) {
      return res.status(400).json({ error: 'Missing user ID or contact name' });
    }

    deleteContact(uid, name);
    res.json({ status: 'success', message: 'Contact deleted successfully' });
  } catch (error: any) {
    console.error('Delete Contact Error:', error);
    res.status(500).json({ error: error.message || error.toString() });
  }
});

// GET /api/contacts/:uid/resolve/:name - Resolve contact name to address
app.get('/api/contacts/:uid/resolve/:name', async (req, res) => {
  try {
    const { uid, name } = req.params;
    if (!uid || !name) {
      return res.status(400).json({ error: 'Missing user ID or contact name' });
    }

    const address = resolveContact(uid, name);
    if (!address) {
      return res.status(404).json({ error: 'Contact not found' });
    }

    res.json({ address });
  } catch (error: any) {
    console.error('Resolve Contact Error:', error);
    res.status(500).json({ error: error.message || error.toString() });
  }
});

// Debug endpoint to check all contacts for a user
app.get('/api/debug/contacts/:uid', async (req, res) => {
  try {
    const { uid } = req.params;
    if (!uid) {
      return res.status(400).json({ error: 'Missing user ID' });
    }

    const contacts = getContacts(uid);
    res.json({ 
      uid, 
      contacts,
      contactCount: Object.keys(contacts).length,
      demoMode: true,
      allUserContacts: userContacts
    });
  } catch (error: any) {
    console.error('Debug Contacts Error:', error);
    res.status(500).json({ error: error.message || error.toString() });
  }
});

// Test endpoint to manually add a contact
app.post('/api/debug/add-contact', async (req, res) => {
  try {
    const { uid, name, address } = req.body;
    if (!uid || !name || !address) {
      return res.status(400).json({ error: 'Missing uid, name, or address' });
    }

    addContact(uid, name, address);
    const contacts = getContacts(uid);
    
    res.json({ 
      status: 'success', 
      message: 'Contact added successfully',
      contacts,
      allUserContacts: userContacts
    });
  } catch (error: any) {
    console.error('Debug Add Contact Error:', error);
    res.status(500).json({ error: error.message || error.toString() });
  }
});

// Test endpoint to test contact resolution
app.post('/api/debug/test-resolution', async (req, res) => {
  try {
    const { uid, name } = req.body;
    if (!uid || !name) {
      return res.status(400).json({ error: 'Missing uid or name' });
    }

    const allContacts = getContacts(uid);
    const resolvedAddress = resolveContact(uid, name);
    
    res.json({ 
      uid,
      name,
      allContacts,
      resolvedAddress,
      success: !!resolvedAddress
    });
  } catch (error: any) {
    console.error('Debug Resolution Error:', error);
    res.status(500).json({ error: error.message || error.toString() });
  }
});

// NLP-integrated prompt endpoint (test NLP connection only)
app.post('/api/prompt', async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt) return res.status(400).json({ error: 'Missing prompt' });

    // Call NLP service
    const nlpResp = await fetch(`${config.nlp.getUrl()}/process_prompt`, {
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
    // Server started
  });
}

export default app; 