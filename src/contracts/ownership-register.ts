import { type Abi, type Chain } from 'viem';
import { baseSepolia } from 'viem/chains';
import abi from '@/contract-assets/OwnershipRegister.json';

const CONTRACT_ADDRESS = '0xb93CaEed6C0403B58D32C02F7515d54fa8dD30A5';

const contract: { abi: Abi; chain: Chain; address: string } = {
  chain: baseSepolia,
  address: CONTRACT_ADDRESS,
  abi: abi as Abi,
};

export default contract;
