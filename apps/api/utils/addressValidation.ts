import { ethers } from 'ethers';

const NETWORK_RPC: Record<string, (infuraKey: string) => string> = {
  Ethereum: (infuraKey: string) => `https://mainnet.infura.io/v3/${infuraKey}`,
  Optimism: (infuraKey: string) => `https://optimism-mainnet.infura.io/v3/${infuraKey}`,
  Arbitrum: (infuraKey: string) => `https://arbitrum-mainnet.infura.io/v3/${infuraKey}`,
};

export function isValidAddress(address: string): boolean {
  try {
    return ethers.isAddress(address);
  } catch {
    return false;
  }
}

export async function resolveENS({
  ensName,
  network = 'Ethereum',
  infuraKey
}: {
  ensName: string;
  network?: string;
  infuraKey: string;
}): Promise<string | null> {
  const rpcUrl = NETWORK_RPC[network]?.(infuraKey);
  if (!rpcUrl) throw new Error(`Unsupported network: ${network}`);
  const provider = new ethers.JsonRpcProvider(rpcUrl);
  try {
    const address = await provider.resolveName(ensName);
    return address || null;
  } catch {
    return null;
  }
}

export async function getAddressType({
  address,
  network = 'Ethereum',
  infuraKey
}: {
  address: string;
  network?: string;
  infuraKey: string;
}): Promise<'EOA' | 'CONTRACT' | 'INVALID'> {
  if (!isValidAddress(address)) return 'INVALID';
  const rpcUrl = NETWORK_RPC[network]?.(infuraKey);
  if (!rpcUrl) throw new Error(`Unsupported network: ${network}`);
  const provider = new ethers.JsonRpcProvider(rpcUrl);
  try {
    const code = await provider.getCode(address);
    if (code && code !== '0x') return 'CONTRACT';
    return 'EOA';
  } catch {
    return 'INVALID';
  }
} 