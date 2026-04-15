import { ethers } from 'ethers';
import CFRegistryABI from '@/contract-assets/ContributionFingerprintRegistry.json';

// ── Contract Addresses ──────────────────────────────────────────────────────
// These should come from environment/backend in production.
// Using BSC testnet addresses for demo.
export const CF_REGISTRY_ADDRESS = import.meta.env.VITE_CF_REGISTRY_ADDRESS || '0x0000000000000000000000000000000000000000';

// ── Minimal ERC-20 ABI for approve + allowance ──────────────────────────────
export const ERC20_ABI = [
  'function approve(address spender, uint256 amount) returns (bool)',
  'function allowance(address owner, address spender) view returns (uint256)',
  'function balanceOf(address account) view returns (uint256)',
  'function symbol() view returns (string)',
  'function decimals() view returns (uint8)',
];

// ── Chain config ─────────────────────────────────────────────────────────────
export const BSC_CHAIN_ID = 56;
export const BSC_RPC_URL = 'https://bsc-dataseed1.bnbchain.org';
export const BSC_EXPLORER_URL = 'https://bscscan.com';

// ── Helper: get ethers provider + signer from MetaMask ───────────────────────
export async function getWalletSigner(): Promise<ethers.BrowserProvider & { signer: ethers.Signer }> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const eth = (window as any).ethereum;
  if (!eth) throw new Error('No wallet detected. Please install MetaMask.');

  const provider = new ethers.BrowserProvider(eth);
  const signer = await provider.getSigner();

  // Ensure we're on BSC
  const network = await provider.getNetwork();
  if (Number(network.chainId) !== BSC_CHAIN_ID) {
    try {
      await eth.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: '0x' + BSC_CHAIN_ID.toString(16) }],
      });
    } catch {
      throw new Error('Please switch to BNB Smart Chain in your wallet.');
    }
    // Re-create after chain switch
    return getWalletSigner();
  }

  return Object.assign(provider, { signer });
}

// ── Contract instances ───────────────────────────────────────────────────────
export function getCFRegistryContract(signer: ethers.Signer) {
  return new ethers.Contract(CF_REGISTRY_ADDRESS, CFRegistryABI, signer);
}

export function getERC20Contract(tokenAddress: string, signer: ethers.Signer) {
  return new ethers.Contract(tokenAddress, ERC20_ABI, signer);
}

// ── Encode CF data parameter ─────────────────────────────────────────────────
// SAMPLE: abi.encode(bytes32 contentHash, string dataUri)
export function encodeSampleData(contentHash: string, dataUri: string): string {
  return ethers.AbiCoder.defaultAbiCoder().encode(
    ['bytes32', 'string'],
    [contentHash, dataUri]
  );
}

// LABEL/AMENDS: abi.encode(bytes32 contentHash, string dataUri, bytes32 parentCfId)
export function encodeLabelData(contentHash: string, dataUri: string, parentCfId: string): string {
  return ethers.AbiCoder.defaultAbiCoder().encode(
    ['bytes32', 'string', 'bytes32'],
    [contentHash, dataUri, parentCfId]
  );
}

// ── Compute content hash ────────────────────────────────────────────────────
export function computeContentHash(content: string): string {
  return ethers.keccak256(ethers.toUtf8Bytes(content));
}
