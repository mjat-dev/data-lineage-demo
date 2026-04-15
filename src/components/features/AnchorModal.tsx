import { useState, useCallback } from 'react';
import { Link2, CheckCircle2, AlertCircle, Sparkles, ExternalLink } from 'lucide-react';
import { useCodattaConnectContext } from 'codatta-connect';
import { checksumAddress } from 'viem';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { getChainSignature, submitChainData, statusToVerdict } from '@/lib/api';
import CFRegistryContract from '@/contracts/cf-registry';
import {
  publicClient,
  CHAIN_ID,
  CHAIN_EXPLORER_URL,
  CHAIN_NAME,
  encodeSampleData,
  computeContentHash,
  toBytes32,
} from '@/lib/contracts';
import { truncateAddress } from '@/lib/utils';

type Step = 'confirm' | 'signing' | 'pending' | 'success' | 'error';

interface AnchorResult {
  txHash: string;
  cfId: string;
  blockNumber: number;
}

interface AnchorModalProps {
  onClose: () => void;
  onSuccess?: (result: AnchorResult) => void;
  submissionId: string;
  walletAddress: string;
  userDid: string;
  foodImageUrl: string;
  frontierId: string;
  contributorDidId: number;
}

export default function AnchorModal({
  onClose,
  onSuccess,
  submissionId,
  walletAddress,
  userDid,
  foodImageUrl,
  frontierId,
  contributorDidId,
}: AnchorModalProps) {
  const { lastUsedWallet } = useCodattaConnectContext();
  const [step, setStep] = useState<Step>('confirm');
  const [tip, setTip] = useState('');
  const [error, setError] = useState('');
  const [result, setResult] = useState<AnchorResult | null>(null);

  const handleAnchor = useCallback(async () => {
    try {
      if (!lastUsedWallet?.client) throw new Error('Wallet not connected');
      const address = checksumAddress(lastUsedWallet.address as `0x${string}`);

      // Step 1: Get chain signature from backend
      setStep('signing');
      setTip('Getting validation signature...');
      const chainSig = await getChainSignature({ submissionId, userDid });

      // Step 2: Switch chain if needed
      const chainId = await lastUsedWallet.getChain();
      if (chainId !== CHAIN_ID) {
        await lastUsedWallet.switchChain(CHAIN);
      }

      // Step 3: Report status=1 (进行中)
      setTip('Preparing on-chain transaction...');
      try {
        await submitChainData({ submissionId, status: 1, address, txHash: '', cfId: chainSig.cf_id, userDid });
      } catch { /* non-critical */ }

      // Step 4: Build contract call args
      const contentHash = computeContentHash(foodImageUrl);
      const encodedData = encodeSampleData(contentHash, foodImageUrl);
      const verdict = statusToVerdict(chainSig.status);
      const grade = chainSig.result;
      const frontierIdBytes32 = toBytes32(frontierId);

      const args = [
        BigInt(contributorDidId),
        frontierIdBytes32,
        0,  // SAMPLE
        encodedData,
        BigInt(chainSig.validatorDidId),
        verdict,
        grade,
        chainSig.signature as `0x${string}`,
      ] as const;

      // Step 5: Simulate contract call
      setTip('Simulating transaction...');
      const { request } = await publicClient.simulateContract({
        account: address,
        address: CFRegistryContract.address as `0x${string}`,
        abi: CFRegistryContract.abi,
        functionName: 'submitCFWithValidation',
        args,
        chain: CFRegistryContract.chain,
      });

      // Step 6: User signs the transaction
      setTip('Please confirm the transaction in your wallet...');
      const txHash = await lastUsedWallet.client.writeContract(request);

      // Step 7: Wait for confirmation
      setStep('pending');
      setTip('Waiting for transaction confirmation...');
      const receipt = await publicClient.waitForTransactionReceipt({ hash: txHash });

      const blockNumber = Number(receipt.blockNumber);
      const txStatus = receipt.status === 'success' ? 2 : 3;

      // Step 8: Report to backend
      setTip('Syncing on-chain status...');
      try {
        await submitChainData({
          submissionId,
          status: txStatus,
          address,
          txHash,
          cfId: chainSig.cf_id,
          userDid,
          chainId: String(CHAIN_ID),
          blockNumber: blockNumber.toString(),
          fingerprint: contentHash,
        });
      } catch {
        console.warn('Failed to sync chain status to backend');
      }

      if (txStatus !== 2) throw new Error('Transaction reverted on-chain');

      const anchorResult: AnchorResult = { txHash, cfId: chainSig.cf_id, blockNumber };
      setResult(anchorResult);
      setStep('success');
      onSuccess?.(anchorResult);
    } catch (err: unknown) {
      const e = err as { details?: string; message?: string };
      const msg = e.details || e.message || 'Transaction failed';
      if (msg.includes('user rejected') || msg.includes('User denied') || msg.includes('ACTION_REJECTED')) {
        setError('Transaction was rejected in your wallet.');
      } else {
        setError(msg);
      }
      setStep('error');
    }
  }, [submissionId, walletAddress, userDid, foodImageUrl, frontierId, contributorDidId, lastUsedWallet, onSuccess]);

  const shortenHash = (hash: string) => {
    if (!hash || hash.length < 12) return hash;
    return `${hash.slice(0, 6)}...${hash.slice(-4)}`;
  };

  const wallet = walletAddress ? truncateAddress(walletAddress) : '0x...';

  return (
    <Modal onClose={step === 'signing' || step === 'pending' ? () => {} : onClose} className="max-w-md">

      {/* ── Confirm ── */}
      {step === 'confirm' && (
        <>
          <div className="w-12 h-12 rounded-2xl bg-[rgba(253,168,41,0.12)] flex items-center justify-center mb-5">
            <Link2 className="w-6 h-6 text-[#FDA829]" />
          </div>
          <h2 className="text-2xl font-bold mb-2 text-[#111827]">Anchor on-chain</h2>
          <p className="text-sm text-[#6B7280] mb-6">Your contribution will be permanently recorded on-chain.</p>

          <div className="bg-[#F9FAFB] rounded-xl p-4 mb-3 space-y-3 border border-[#F1F3F5]">
            <div className="flex justify-between text-sm">
              <span className="text-[#9CA3AF]">Contributor</span>
              <span className="text-[#111827] font-mono text-xs">{wallet}</span>
            </div>
            <div className="flex justify-between text-sm border-t border-[#F1F3F5] pt-3">
              <span className="text-[#9CA3AF]">Network</span>
              <span className="text-[#111827] font-medium">{CHAIN_NAME}</span>
            </div>
            <div className="flex justify-between items-center text-sm border-t border-[#F1F3F5] pt-3">
              <span className="text-[#9CA3AF]">Gas Fee</span>
              <span className="text-[#5DDD22] font-bold">Free</span>
            </div>
          </div>

          <div className="flex items-center gap-2 px-1 mb-5">
            <Sparkles className="w-3.5 h-3.5 text-[#FDA829]" />
            <p className="text-[11px] text-[#9CA3AF]">Gas fee sponsored by platform</p>
          </div>

          <div className="flex gap-3">
            <Button variant="secondary" className="flex-1" onClick={onClose}>Cancel</Button>
            <Button variant="primary" className="flex-1" onClick={handleAnchor}>Confirm &amp; Sign</Button>
          </div>
        </>
      )}

      {/* ── Signing / Pending ── */}
      {(step === 'signing' || step === 'pending') && (
        <div className="text-center py-8">
          <div className="w-16 h-16 rounded-full border-2 border-[#FDA829] border-t-transparent animate-spin mx-auto mb-6" />
          <h2 className="text-xl font-bold mb-2 text-[#111827]">
            {step === 'signing' ? 'Waiting for signature…' : 'Processing on-chain…'}
          </h2>
          <p className="text-sm text-[#9CA3AF]">{tip || 'Please confirm in your wallet.'}</p>
        </div>
      )}

      {/* ── Success ── */}
      {step === 'success' && result && (
        <div className="text-center py-6">
          <div className="w-16 h-16 rounded-full bg-[rgba(34,197,94,0.10)] flex items-center justify-center mx-auto mb-5">
            <CheckCircle2 className="w-8 h-8 text-[#22C55E]" />
          </div>
          <h2 className="text-xl font-bold mb-2 text-[#111827]">Anchored Successfully!</h2>
          <p className="text-sm text-[#6B7280] mb-5 max-w-xs mx-auto leading-relaxed">
            Your contribution is now permanently recorded on-chain.
          </p>

          <div className="bg-[#F9FAFB] border border-[#F1F3F5] rounded-xl p-4 mb-6 text-left space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-[#9CA3AF]">Tx Hash</span>
              <a href={`${CHAIN_EXPLORER_URL}/tx/${result.txHash}`} target="_blank" rel="noopener noreferrer"
                className="font-mono text-[#FDA829] hover:underline flex items-center gap-1">
                {shortenHash(result.txHash)} <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-[#9CA3AF]">Block</span>
              <span className="font-mono text-[#111827]">{result.blockNumber.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-[#9CA3AF]">CF ID</span>
              <span className="font-mono text-[#111827]">{shortenHash(result.cfId)}</span>
            </div>
          </div>

          <Button variant="primary" className="w-full" onClick={onClose}>Done</Button>
        </div>
      )}

      {/* ── Error ── */}
      {step === 'error' && (
        <div className="text-center py-8">
          <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="w-8 h-8 text-red-400" />
          </div>
          <h2 className="text-xl font-bold mb-2 text-[#111827]">Anchoring Failed</h2>
          <p className="text-sm text-red-500 mb-6 px-4 break-words">{error}</p>
          <div className="flex gap-3">
            <Button variant="secondary" className="flex-1" onClick={onClose}>Cancel</Button>
            <Button variant="primary" className="flex-1" onClick={() => { setStep('confirm'); setError(''); }}>Try Again</Button>
          </div>
        </div>
      )}
    </Modal>
  );
}
