import { useState, useEffect, useCallback } from 'react';
import { Link2, CheckCircle2, ExternalLink, AlertCircle } from 'lucide-react';
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
          setAnchorFee('450');
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
        chainSig.validatorDidId,
        chainSig.result, // grade from backend (maps to verdict in contract)
        chainSig.result, // quality grade
        chainSig.signature,
      );

      setTip('Waiting for transaction confirmation...');
      const receipt = await tx.wait();

      const txHash = receipt.hash;
      const blockNumber = receipt.blockNumber;
      const cfId = chainSig.cf_id;

      // Step 6: Report to backend — submit chain data
      setTip('Syncing on-chain status...');
      try {
        await submitChainData({
          submissionId,
          status: 2, // completed
          address: signerAddress,
          txHash,
          cfId,
          userDid,
          chainId: '56',
          blockNumber: blockNumber.toString(),
          fingerprint: contentHash,
        });
      } catch {
        // Non-critical — the on-chain tx already succeeded
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

  return (
    <Modal onClose={step === 'approving' || step === 'anchoring' ? () => {} : onClose} className="max-w-md">
      {/* ── Confirm Step ── */}
      {step === 'confirm' && (
        <>
          <div className="w-12 h-12 rounded-2xl bg-[rgba(255,168,0,0.10)] flex items-center justify-center mb-5">
            <Link2 className="w-6 h-6 text-[#FFA800]" />
          </div>
          <h2 className="text-2xl font-bold mb-2 text-[#070707]">Anchor Your Contribution</h2>
          <p className="text-sm text-[#6B7280] mb-6">
            Anchor your submission to the blockchain. This creates a permanent, tamper-proof record of your contribution.
          </p>
          <div className="bg-gray-50 rounded-xl p-4 mb-6 space-y-3">
            {[
              { label: 'Submission', value: shortenHash(submissionId), mono: true },
              { label: 'Service Fee', value: loadingFee ? 'Loading...' : `${anchorFee} ${feeSymbol}`, accent: !loadingFee },
              { label: 'Network', value: 'BNB Smart Chain', mono: false },
              { label: 'Wallet', value: shortenHash(walletAddress), mono: true },
            ].map(({ label, value, mono, accent }) => (
              <div key={label} className={`flex justify-between text-sm ${label === 'Wallet' ? 'border-t border-gray-200 pt-3' : ''}`}>
                <span className="text-[#9CA3AF]">{label}</span>
                <span className={`font-bold ${accent ? 'text-[#FFA800]' : mono ? 'font-mono text-[#6B7280]' : 'text-[#070707]'}`}>{value}</span>
              </div>
            ))}
          </div>
          <div className="flex gap-3">
            <Button variant="secondary" className="flex-1 py-3" onClick={onClose}>Cancel</Button>
            <Button variant="primary" className="flex-1 py-3" onClick={handleAnchor}>Confirm &amp; Anchor</Button>
          </div>
        </>
      )}

      {/* ── Approving / Anchoring Step ── */}
      {(step === 'approving' || step === 'anchoring') && (
        <div className="text-center py-8">
          <div className="w-16 h-16 rounded-full border-2 border-[#FFA800] border-t-transparent animate-spin mx-auto mb-6" />
          <h2 className="text-xl font-bold mb-2 text-[#070707]">
            {step === 'approving' ? 'Preparing Transaction…' : 'Anchoring to Blockchain…'}
          </h2>
          <p className="text-sm text-[#9CA3AF]">{tip}</p>
        </div>
      )}

      {/* ── Success Step ── */}
      {step === 'success' && result && (
        <div className="text-center py-8">
          <div className="w-16 h-16 rounded-full bg-[rgba(34,197,94,0.10)] flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-8 h-8 text-[#22C55E]" />
          </div>
          <h2 className="text-xl font-bold mb-2 text-[#070707]">Successfully Anchored!</h2>
          <p className="text-sm text-[#9CA3AF] mb-6">Your contribution is now permanently recorded on-chain.</p>
          <div className="bg-gray-50 border border-[rgba(34,197,94,0.15)] rounded-xl p-4 mb-6 text-left space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-[#9CA3AF]">Tx Hash</span>
              <a href={`${BSC_EXPLORER_URL}/tx/${result.txHash}`} target="_blank" rel="noopener noreferrer" className="font-mono text-[#FFA800] hover:underline flex items-center gap-1">
                {shortenHash(result.txHash)} <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-[#9CA3AF]">Block</span>
              <span className="font-mono text-[#070707]">{result.blockNumber.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-[#9CA3AF]">CF ID</span>
              <span className="font-mono text-[#070707]">{shortenHash(result.cfId)}</span>
            </div>
          </div>
          <Button variant="primary" className="w-full py-3" onClick={onClose}>Done</Button>
        </div>
      )}

      {/* ── Error Step ── */}
      {step === 'error' && (
        <div className="text-center py-8">
          <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="w-8 h-8 text-red-400" />
          </div>
          <h2 className="text-xl font-bold mb-2 text-[#070707]">Anchoring Failed</h2>
          <p className="text-sm text-red-500 mb-6 px-4 break-words">{error}</p>
          <div className="flex gap-3">
            <Button variant="secondary" className="flex-1 py-3" onClick={onClose}>Cancel</Button>
            <Button variant="primary" className="flex-1 py-3" onClick={() => { setStep('confirm'); setError(''); }}>Try Again</Button>
          </div>
        </div>
      )}
    </Modal>
  );
}
