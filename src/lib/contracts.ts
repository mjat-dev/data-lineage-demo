import { createPublicClient, http, keccak256, toHex, pad, toBytes, encodeAbiParameters } from 'viem';
import CFRegistryContract from '@/contracts/cf-registry';
import OwnershipRegisterContract from '@/contracts/ownership-register';

// ── Re-export contract configs ──────────────────────────────────────────────
export { default as CFRegistryContract } from '@/contracts/cf-registry';
export { default as OwnershipRegisterContract } from '@/contracts/ownership-register';

// ── Chain info (derived from contract config) ───────────────────────────────
export const CHAIN = CFRegistryContract.chain;
export const CHAIN_ID = CHAIN.id;
export const CHAIN_NAME = CHAIN.name;
export const CHAIN_RPC_URL = CHAIN.rpcUrls.default.http[0];
export const CHAIN_EXPLORER_URL = CHAIN.blockExplorers?.default?.url ?? 'https://sepolia.basescan.org';

// ── Contract addresses (shorthand) ──────────────────────────────────────────
export const CF_REGISTRY_ADDRESS = CFRegistryContract.address as `0x${string}`;
export const CLAIM_CONTRACT_ADDRESS = OwnershipRegisterContract.address as `0x${string}`;

// ── Public client for read-only calls ───────────────────────────────────────
export const publicClient = createPublicClient({
  chain: CHAIN,
  transport: http(CHAIN_RPC_URL),
});

// ── Encode CF data parameter ────────────────────────────────────────────────
// SAMPLE: abi.encode(bytes32 contentHash, string dataUri)
export function encodeSampleData(contentHash: `0x${string}`, dataUri: string): `0x${string}` {
  return encodeAbiParameters(
    [{ type: 'bytes32' }, { type: 'string' }],
    [contentHash, dataUri],
  );
}

// ── Compute content hash (keccak256 of UTF-8 string) ────────────────────────
export function computeContentHash(content: string): `0x${string}` {
  return keccak256(toBytes(content));
}

// ── Convert a numeric string or hex string to bytes32 ───────────────────────
export function toBytes32(value: string): `0x${string}` {
  if (value.startsWith('0x') && value.length === 66) return value as `0x${string}`;
  try {
    const bn = BigInt(value);
    return pad(toHex(bn), { size: 32 });
  } catch {
    return keccak256(toBytes(value));
  }
}
