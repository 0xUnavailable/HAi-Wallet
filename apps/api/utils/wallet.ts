// utils/walletClient.ts
import { createWalletClient, http } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { baseSepolia } from 'viem/chains';

export function createWalletClientUtil(privateKey: string, chain = baseSepolia) {
  if (!privateKey) throw new Error('PRIVATE_KEY environment variable is required');
  
  const account = privateKeyToAccount(privateKey as `0x${string}`);
  
  return createWalletClient({
    chain,
    transport: http(),
    account,
  });
}