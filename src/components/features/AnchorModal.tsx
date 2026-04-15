import { useState, useEffect, useCallback } from 'react';
import { Link2, CheckCircle2, Clock, ExternalLink, AlertCircle, Sparkles } from 'lucide-react';
import { ethers } from 'ethers';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { getChainSignature, submitChainData } from '@/lib/api';
import {
  getWalletSigner,
  getCFRegistryContract,
  getERC20Contract,
  encodeSampleData,
  computeContentHash,
  BSC_EXPLORER_URL,
} from '@/lib/contracts';
import { truncateAddress } from '@/lib/utils';

type Step = 'confirm' | 'approving' | 'anchoring' | 'success' | 'error';

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
  const [step, setStep] = useState<Step>('confirm');
  const [tip, setTip] = useState('');
  const [error, setError] = useState('');
  const [result, setResult] = useState<AnchorResult | null>(null);

  // Fee info loaded from contract
  const [anchorFee, setAnchorFee] = useState<string>('--');
  const [feeSymbol, setFeeSymbol] = useState('');
  const [loadingFee, setLoadingFee] = useState(true);

  // Load anchor fee from contract on mount
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { signer } = await getWalletSigner();
        const cfRegistry = getCFRegistryContract(signer);
        const fee: bigint = await cfRegistry.anchorFee();
        const feeTokenAddr: string = await cfRegistry.anchorFeeToken();
        const feeToken = getERC20Contract(feeTokenAddr, signer);
        const [symbol, decimals] = await Promise.all([
          feeToken.symbol() as Promise<string>,
          feeToken.decimals() as Promise<bigint>,
        ]);
        if (!cancelled) {
          setAnchorFee(ethers.formatUnits(fee, decimals));
          setFeeSymbol(symbol);
        }
      } catch {
        if (!cancelled) {
          setAnchorFee('0');
          setFeeSymbol('XNY');
        }
      } finally {
        if (!cancelled) setLoadingFee(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const handleAnchor = useCallback(async () => {
    try {
      // Step 1: Get signer
      setStep('approving');
      setTip('Connecting wallet...');
      const { signer } = await getWalletSigner();
      const signerAddress = await signer.getAddress();

      // Step 2: Get chain signature from backend
      setTip('Getting chain signature...');
      const chainSig = await getChainSignature({
        submissionId,
        userDid,
      });

      // Step 3: Read fee info from contract
      setTip('Reading anchor fee...');
      const cfRegistry = getCFRegistryContract(signer);
      const fee: bigint = await cfRegistry.anchorFee();
      const feeTokenAddr: string = await cfRegistry.anchorFeeToken();
      const feeToken = getERC20Contract(feeTokenAddr, signer);

      // Step 4: Check allowance and approve if needed
      const currentAllowance: bigint = await feeToken.allowance(signerAddress, await cfRegistry.getAddress());
      if (currentAllowance < fee) {
        setTip('Approve token spending in your wallet...');
        const approveTx = await feeToken.approve(await cfRegistry.getAddress(), fee);
        setTip('Waiting for approval confirmation...');
        await approveTx.wait();
      }

      // Step 5: Call submitCFWithValidation
      setStep('anchoring');
      setTip('Confirm the anchor transaction in your wallet...');
      const contentHash = computeContentHash(foodImageUrl);
      const dataUri = foodImageUrl;
      const encodedData = encodeSampleData(contentHash, dataUri);

      const tx = await cfRegistry.submitCFWithValidation(
        contributorDidId,
        frontierId,
        0, // SAMPLE
        encodedData,
        BigInt(chainSig.validatorDidId),
        chainSig.result,
        chainSig.result,
        chainSig.signature,
      );

      setTip('Waiting for transaction confirmation...');
      const receipt = await tx.wait();

      const txHash = receipt.hash;
      const blockNumber = receipt.blockNumber;
      const cfId = chainSig.cf_id;

      // Step 6: Report to backend
      setTip('Syncing on-chain status...');
      try {
        await submitChainData({
          submissionId,
          status: 2,
          address: signerAddress,
          txHash,
          cfId,
          userDid,
          chainId: '56',
          blockNumber: blockNumber.toString(),
          fingerprint: contentHash,
        });
      } catch {
        console.warn('Failed to sync chain status to backend');
      }

      const anchorResult: AnchorResult = { txHash, cfId, blockNumber };
      setResult(anchorResult);
      setStep('success');
      onSuccess?.(anchorResult);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Transaction failed';
      if (msg.includes('user rejected') || msg.includes('User denied') || msg.includes('ACTION_REJECTED')) {
        setError('Transaction was rejected in your wallet.');
      } else {
        setError(msg);
      }
      setStep('error');
    }
  }, [submissionId, walletAddress, userDid, foodImageUrl, frontierId, contributorDidId, onSuccess]);

  const shortenHash = (hash: string) => {
    if (!hash || hash.length < 12) return hash;
    return `${hash.slice(0, 6)}...${hash.slice(-4)}`;
  };

  const wallet = walletAddress ? truncateAddress(walletAddress) : '0x...';

  return (
    <Modal onClose={step === 'approving' || step === 'anchoring' ? () => {} : onClose} className="max-w-md">
      {/* ── Confirm Step ── */}
      {step === 'confirm' && (
        <>
          <div className="w-12 h-12 rounded-2xl bg-[rgba(253,168,41,0.12)] flex items-center justify-center mb-5">
            <Link2 className="w-6 h-6 text-[#FDA829]" />
          </div>
          <h2 className="text-2xl font-bold mb-2 text-[#111827]">Anchor on-chain</h2>
          <p className="text-sm text-[#6B7280] mb-6">
            Your contribution will be permanently recorded on-chain.
          </p>

          {/* Submission info */}
          <div className="bg-[#F9FAFB] rounded-xl p-4 mb-3 space-y-3 border border-[#F1F3F5]">
            <div className="flex justify-between text-sm">
              <span className="text-[#9CA3AF]">Contributor</span>
              <span className="text-[#111827] font-mono text-xs">{wallet}</span>
            </div>

            {/* Gas Fee */}
            <div className="flex justify-between items-center text-sm border-t border-[#F1F3F5] pt-3">
              <span className="text-[#9CA3AF]">Gas Fee</span>
              <div className="flex items-center gap-2">
                {loadingFee ? (
                  <span className="text-[#9CA3AF] text-xs">Loading...</span>
                ) : (
                  <>
                    <span className="text-[#9CA3AF] line-through text-xs font-mono">~0.0002 ETH</span>
                    <span className="text-[#5DDD22] font-bold">{anchorFee} {feeSymbol}</span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Gas sponsored tag */}
          <div className="flex items-center gap-2 px-1 mb-5">
            <Sparkles className="w-3.5 h-3.5 text-[#FDA829]" />
            <p className="text-[11px] text-[#9CA3AF]">
              Gas fee sponsored by platform · paid in XNY
            </p>
          </div>

          <div className="flex gap-3">
            <Button variant="secondary" className="flex-1" onClick={onClose}>Cancel</Button>
            <Button variant="primary" className="flex-1" onClick={handleAnchor}>Confirm &amp; Sign</Button>
          </div>
        </>
      )}

      {/* ── Approving / Anchoring Step ── */}
      {(step === 'approving' || step === 'anchoring') && (
        <div className="text-center py-8">
          <div className="w-16 h-16 rounded-full border-2 border-[#FDA829] border-t-transparent animate-spin mx-auto mb-6" />
          <h2 className="text-xl font-bold mb-2 text-[#111827]">
            {step === 'approving' ? 'Preparing Transaction…' : 'Waiting for signature…'}
          </h2>
          <p className="text-sm text-[#9CA3AF]">{tip || 'Please confirm the transaction in your wallet plugin.'}</p>
        </div>
      )}

      {/* ── Success Step ── */}
      {step === 'success' && result && (
        <div className="text-center py-6">
          <div className="w-16 h-16 rounded-full bg-[rgba(253,168,41,0.10)] flex items-center justify-center mx-auto mb-5">
            <Clock className="w-8 h-8 text-[#FDA829]" />
          </div>
          <h2 className="text-xl font-bold mb-2 text-[#111827]">Submitted</h2>
          <p className="text-sm text-[#6B7280] mb-5 max-w-xs mx-auto leading-relaxed">
            Your anchor has been submitted and is being processed on-chain. This may take a few minutes.
          </p>

          <div className="bg-[#F9FAFB] border border-[#F1F3F5] rounded-xl p-4 mb-6 text-left space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-[#9CA3AF]">Tx Hash</span>
              <a href={`${BSC_EXPLORER_URL}/tx/${result.txHash}`} target="_blank" rel="noopener noreferrer"
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

      {/* ── Error Step ── */}
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
