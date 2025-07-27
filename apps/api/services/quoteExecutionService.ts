// utils/relayApi.ts
import { WalletClient, createPublicClient, http } from 'viem';
import axios from 'axios';

interface Step {
  kind: 'transaction' | 'signature';
  to?: string;
  data?: string;
  value?: string;
  chainId?: number;
  check?: { endpoint: string; method: string };
  signData?: string;
  postData?: any;
  postEndpoint?: string;
  postMethod?: string;
  requestId?: string;
}

interface Quote {
  steps: Step[];
  requestId?: string;
}

interface ExecuteOptions {
  pollStatus?: boolean;
  pollIntervalMs?: number;
  pollMaxAttempts?: number;
  relayApiBase?: string;
}

async function waitForTransactionReceipt(walletClient: WalletClient, txHash: string, maxAttempts = 200, intervalMs = 2000) {
  // Create a public client for reading data
  const publicClient = createPublicClient({
    chain: walletClient.chain,
    transport: http(),
  });

  for (let i = 0; i < maxAttempts; i++) {
    try {
      const receipt = await publicClient.getTransactionReceipt({ hash: txHash as `0x${string}` });
      if (receipt) {
        // Check if the transaction created a contract
        if (receipt.contractAddress) {
          throw new Error(`Transaction ${txHash} unexpectedly created a contract at ${receipt.contractAddress}`);
        }
        return receipt;
      }
    } catch (error: any) {
      if (error.name === 'TransactionReceiptNotFoundError' || error.message.includes('could not be found')) {
        // Continue polling
      } else if (error.name === 'TransactionNotFoundError') {
        // Continue polling - transaction not yet mined
      } else {
        throw error;
      }
    }
    await new Promise((resolve) => setTimeout(resolve, intervalMs));
  }
  throw new Error('Transaction receipt not found');
}

export async function executeQuoteSteps(
  quote: Quote,
  walletClient: WalletClient,
  options: ExecuteOptions = {}
): Promise<{ requestId: string | undefined; transactionHash?: string }> {
  const {
    pollStatus = true,
    pollIntervalMs = 3000,
    pollMaxAttempts = 20,
    relayApiBase = 'https://api.testnets.relay.link',
  } = options;

  let transactionHash: string | undefined;

  for (const step of quote.steps) { 
     if (!step.requestId) throw new Error('Missing requestId in quote');

    console.log(`Executing step: ${step.kind}`, JSON.stringify(step, null, 2));
    if (step.kind === 'transaction') {
      // Support nested structure: step.items[0].data
      let to = step.to;
      let data = step.data;
      let value = step.value;
      let chainId = step.chainId;
      if ((!to || !data || !chainId) && Array.isArray((step as any).items) && (step as any).items.length > 0) {
        const itemData = (step as any).items[0].data || {};
        to = to || itemData.to;
        data = data || itemData.data;
        value = value || itemData.value;
        chainId = chainId || itemData.chainId;
      }
      if (!to || !data || !chainId) {
        throw new Error('Invalid transaction step: missing to, data, or chainId');
      }
      // Verify the chainId matches the wallet client
      if (chainId !== walletClient.chain?.id) {
        throw new Error(`Chain mismatch: step chainId ${chainId}, wallet chainId ${walletClient.chain?.id}`);
      }
      try {
        const txHash = await walletClient.sendTransaction({
          to: to as `0x${string}`,
          data: data as `0x${string}`,
          value: BigInt(value || 0),
          account: walletClient.account!,
          chain: walletClient.chain,
          kzg: undefined, // Add kzg property to satisfy TypeScript
        });
        console.log(`Transaction sent: ${txHash}`);
        transactionHash = txHash; // Store the transaction hash
        const receipt = await waitForTransactionReceipt(walletClient, txHash);
        if (receipt.status === 'reverted') {
          throw new Error(`Transaction ${txHash} reverted`);
        }
        console.log(`Transaction ${txHash} confirmed`);
      } catch (error: any) {
        throw new Error(`Transaction step failed: ${error.message}`);
      }
    } else if (step.kind === 'signature') {
      if (!step.signData || !step.postEndpoint) {
        throw new Error('Missing signData or postEndpoint for signature step');
      }
      let signature: string;
      try {
        signature = await walletClient.signMessage({
          account: walletClient.account!,
          message: step.signData,
        });
        console.log(`Signature created: ${signature}`);
      } catch (error: any) {
        throw new Error(`Signature step failed: ${error.message}`);
      }
      try {
        const postUrl = step.postEndpoint.startsWith('http')
          ? step.postEndpoint
          : `${relayApiBase}${step.postEndpoint}`;
        const method = (step.postMethod || 'POST').toUpperCase();
        const postData = { ...step.postData, signature };
        if (method === 'POST') {
          await axios.post(postUrl, postData);
        } else if (method === 'PUT') {
          await axios.put(postUrl, postData);
        } else {
          throw new Error(`Unsupported post method: ${method}`);
        }
        console.log(`Signature posted to ${postUrl}`);
      } catch (error: any) {
        throw new Error(`Signature step POST failed: ${error.message}`);
      }
    }
    if (pollStatus && step.check && step.check.endpoint) {
      await pollExecutionStatus(step.check.endpoint, relayApiBase, pollIntervalMs, pollMaxAttempts);
    }
  }
  return { requestId: quote.requestId, transactionHash };
}

export async function pollExecutionStatus(
  endpoint: string,
  relayApiBase = 'https://api.testnets.relay.link',
  intervalMs = 3000,
  maxAttempts = 20
): Promise<any> {
  let attempts = 0;
  const url = endpoint.startsWith('http') ? endpoint : `${relayApiBase}${endpoint}`;
  while (attempts < maxAttempts) {
    attempts++;
    try {
      const res = await axios.get(url);
      if (res.data && res.data.status) {
        console.log(`Status: ${res.data.status}`, JSON.stringify(res.data, null, 2));
        if (res.data.status === 'completed') {
          return res.data;
        } else if (['failed', 'refund'].includes(res.data.status)) {
          throw new Error(`Step status: ${res.data.status}`);
        }
      }
    } catch (error: any) {
      console.log(`Polling error (attempt ${attempts}/${maxAttempts}): ${error.message}`);
    }
    await new Promise((resolve) => setTimeout(resolve, intervalMs));
  }
  throw new Error('Polling for execution status timed out');
}