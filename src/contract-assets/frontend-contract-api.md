# Frontend Contract API Reference

This document describes the contract interfaces the frontend needs to call directly, and the backend APIs it depends on for data.

## Prerequisites

Frontend needs:
- A wallet provider (MetaMask / WalletConnect)
- ethers.js or viem for contract interaction
- User's wallet connected (for signing transactions)

## Contract Addresses

Read from the deployment config or backend API:

| Contract | Purpose |
|----------|---------|
| ContributionFingerprintRegistry | Submit CFs |
| OwnershipRegister | Claim shares |

## Flow Overview

```
Frontend                          Backend                         Chain
   |                                |                               |
   |-- POST /api/cf/signature ----->|                               |
   |<-- {signature, cfId, ...} -----|                               |
   |                                |                               |
   |-- submitCFWithValidation() ----|------------------------------>|
   |                                |                               |
   |   ... (backend assembles dataset after enough CFs) ...         |
   |                                |                               |
   |-- GET /api/claim/proof ------->|                               |
   |<-- {proof, shareAmount, ...} --|                               |
   |                                |                               |
   |-- claimDatasetShares() --------|------------------------------>|
   |                                |                               |
```

---

## 1. submitCFWithValidation

### Backend API (call first)

```
POST /api/cf/signature
```

Request:
```json
{
  "contentHash": "0x...",
  "contributorDidId": 1001,
  "frontierId": "0x...",
  "kind": 0,
  "parentCfId": null,
  "dataUri": "ipfs://..."
}
```

Response:
```json
{
  "cfId": "0x...",
  "validatorDidId": 2001,
  "verdict": 1,
  "grade": 3,
  "signature": "0x..."
}
```

### Contract Call

```typescript
// Solidity:
// function submitCFWithValidation(
//     uint128 contributorDidId,
//     bytes32 frontierId,
//     AtomicKind kind,        // 0=SAMPLE, 1=LABEL, 2=AMENDS
//     bytes calldata data,    // see encoding below
//     uint128 validatorDidId,
//     Verdict verdict,        // 0=PENDING, 1=APPROVED, 2=REJECTED
//     QualityGrade grade,     // 0=NONE, 1=D, 2=C, 3=B, 4=A, 5=S
//     bytes calldata signature
// ) external returns (bytes32 cfId)

import { ethers } from 'ethers'

const cfRegistry = new ethers.Contract(CF_REGISTRY_ADDRESS, CF_REGISTRY_ABI, signer)

// Encode the `data` parameter
// SAMPLE: abi.encode(bytes32 contentHash, string dataUri)
const data = ethers.AbiCoder.defaultAbiCoder().encode(
  ['bytes32', 'string'],
  [contentHash, dataUri]
)

// LABEL/AMENDS: abi.encode(bytes32 contentHash, string dataUri, bytes32 parentCfId)
const dataWithParent = ethers.AbiCoder.defaultAbiCoder().encode(
  ['bytes32', 'string', 'bytes32'],
  [contentHash, dataUri, parentCfId]
)

// Get signature from backend
const sigResponse = await fetch('/api/cf/signature', {
  method: 'POST',
  body: JSON.stringify({ contentHash, contributorDidId, frontierId, kind, parentCfId, dataUri }),
})
const { validatorDidId, verdict, grade, signature } = await sigResponse.json()

// Anchor fee is charged in the ERC-20 `anchorFeeToken` and is adjustable by
// the protocol owner via setAnchorFee(...). Always read the current value
// from chain — do NOT hardcode.
const anchorFee = await cfRegistry.anchorFee()
const feeTokenAddress = await cfRegistry.anchorFeeToken()
const feeToken = new ethers.Contract(feeTokenAddress, ERC20_ABI, signer)

// One-time (or top-up) approval so the registry can pull the fee.
// `MaxUint256` is a common UX; use `anchorFee` for a strict per-call allowance.
await (await feeToken.approve(CF_REGISTRY_ADDRESS, anchorFee)).wait()

// Submit transaction (user signs with wallet)
const tx = await cfRegistry.submitCFWithValidation(
  contributorDidId,   // uint128
  frontierId,         // bytes32
  kind,               // uint8 (0=SAMPLE, 1=LABEL, 2=AMENDS)
  data,               // bytes (encoded above)
  validatorDidId,     // uint128
  verdict,            // uint8
  grade,              // uint8
  signature,          // bytes (65-byte ECDSA)
)
await tx.wait()
```

### `data` Encoding Reference

| Kind | Encoding | Fields |
|------|----------|--------|
| SAMPLE (0) | `abi.encode(bytes32, string)` | `contentHash`, `dataUri` |
| LABEL (1) | `abi.encode(bytes32, string, bytes32)` | `contentHash`, `dataUri`, `parentCfId` |
| AMENDS (2) | `abi.encode(bytes32, string, bytes32)` | `contentHash`, `dataUri`, `parentCfId` |

`contentHash` = `keccak256(content)` — compute off-chain before calling.

---

## 2. claimDatasetShares

### Backend API (call first)

```
GET /api/claim/proof?datasetId=0x...&address=0x...
```

Response:
```json
{
  "datasetId": "0x...",
  "shareAmount": 300,
  "cfMerkleRoot": "0x...",
  "proof": ["0x...", "0x..."],
  "cfIds": ["0xcf1...", "0xcf2...", "0xcf3..."]
}
```

### Contract Call

```typescript
// Solidity:
// function claimDatasetShares(
//     bytes32 datasetId,
//     uint256 shareAmount,
//     bytes32 cfMerkleRoot,
//     bytes32[] calldata proof
// ) external

const ownershipRegister = new ethers.Contract(
  OWNERSHIP_REGISTER_ADDRESS,
  OWNERSHIP_REGISTER_ABI,
  signer
)

// Get proof from backend
const proofResponse = await fetch(
  `/api/claim/proof?datasetId=${datasetId}&address=${userAddress}`
)
const { shareAmount, cfMerkleRoot, proof } = await proofResponse.json()

// Claim (user signs with wallet)
const tx = await ownershipRegister.claimDatasetShares(
  datasetId,       // bytes32
  shareAmount,     // uint256
  cfMerkleRoot,    // bytes32
  proof,           // bytes32[]
)
await tx.wait()
```

---

## 3. Read-only: Check Balance

```typescript
// ERC-1155 balance check
// tokenId = uint256(datasetId)
const tokenId = BigInt(datasetId)
const balance = await ownershipRegister.balanceOf(userAddress, tokenId)
```

---

## 4. Read-only: Check if Already Claimed

```typescript
const hasClaimed = await ownershipRegister.hasClaimedShares(datasetId, userAddress)
```

---

## Enums Reference

### AtomicKind
| Value | Name |
|-------|------|
| 0 | SAMPLE |
| 1 | LABEL |
| 2 | AMENDS |
| 3 | VALIDATION |

### Verdict
| Value | Name |
|-------|------|
| 0 | PENDING |
| 1 | APPROVED |
| 2 | REJECTED |

### QualityGrade
| Value | Name |
|-------|------|
| 0 | NONE |
| 1 | D |
| 2 | C |
| 3 | B |
| 4 | A |
| 5 | S |

---

## ABI Files

Pre-extracted ABIs are bundled in `docs/examples/abi/`:

- `docs/examples/abi/ContributionFingerprintRegistry.json`
- `docs/examples/abi/OwnershipRegister.json`
- `docs/examples/abi/FrontierRegistry.json`
- `docs/examples/abi/DatasetVersionRegistry.json`

These are plain ABI arrays, ready to use with ethers.js:

```typescript
import OwnershipRegisterABI from './abi/OwnershipRegister.json'

const contract = new ethers.Contract(address, OwnershipRegisterABI, signer)
```

(Alternatively, the full Foundry build output is in `contracts/out/*.sol/*.json` with the ABI under the `abi` key.)
