import { type Abi, type Chain } from 'viem';
import { baseSepolia } from 'viem/chains';
import abi from '@/contract-assets/ContributionFingerprintRegistry.json';

const CONTRACT_ADDRESS = '0x2f509C93D98CF4f9C2ca90d431349660D363F414';

const contract: { abi: Abi; chain: Chain; address: string } = {
  chain: baseSepolia,
  address: CONTRACT_ADDRESS,
  abi: abi as Abi,
};

export default contract;
