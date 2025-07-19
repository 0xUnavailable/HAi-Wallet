import { ethers } from 'ethers';

export async function getERC20Balance({
  walletAddress,
  tokenAddress,
  network = 'Ethereum',
  infuraKey
}: {
  walletAddress: string;
  tokenAddress: string;
  network?: string;
  infuraKey: string;
}): Promise<string> {
  let rpcUrl = '';
  if (network === 'Ethereum') {
    rpcUrl = `https://mainnet.infura.io/v3/${infuraKey}`;
  }
  // TODO: Add support for Optimism, Arbitrum, etc.
  if (!rpcUrl) throw new Error(`Unsupported network: ${network}`);
  const provider = new ethers.JsonRpcProvider(rpcUrl);
  const erc20Abi = ["function balanceOf(address) view returns (uint256)", "function decimals() view returns (uint8)"];
  const contract = new ethers.Contract(tokenAddress, erc20Abi, provider);
  const balance = await contract.balanceOf(walletAddress);
  return balance.toString();
} 