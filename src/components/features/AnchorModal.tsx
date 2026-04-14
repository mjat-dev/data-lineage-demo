import { useState } from 'react';
import { Link2, Clock, ExternalLink, Sparkles } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { useApp } from '@/context/AppContext';
import { truncateAddress } from '@/lib/utils';

interface AnchorModalProps {
  onClose: () => void;
  onSuccess?: () => void;
}

export default function AnchorModal({ onClose, onSuccess }: AnchorModalProps) {
  const { submission, walletAddress } = useApp();
  const [step, setStep] = useState<'confirm' | 'signing' | 'pending'>('confirm');

  const subId     = submission?.id       ? submission.id.slice(-8).toUpperCase() : 'A882EF9B';
  const foodName  = submission?.foodName || 'Mushroom Image Set';
  const wallet    = walletAddress ? truncateAddress(walletAddress) : '0xfdbF...D089';

  const handleConfirm = () => {
    setStep('signing');
    setTimeout(() => setStep('pending'), 2200);
  };

  const handleDone = () => {
    onSuccess?.();
    onClose();
  };

  return (
    <Modal onClose={step === 'signing' ? () => {} : onClose} className="max-w-md">

      {/* ── Step 0: Confirm ─────────────────────────────────────── */}
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
              <span className="text-[#9CA3AF]">Submission</span>
              <div className="text-right">
                <p className="text-[#111827] font-semibold">{foodName}</p>
                <p className="text-[10px] font-mono text-[#9CA3AF]">#{subId}</p>
              </div>
            </div>

            <div className="flex justify-between text-sm border-t border-[#F1F3F5] pt-3">
              <span className="text-[#9CA3AF]">Contributor</span>
              <span className="text-[#111827] font-mono text-xs">{wallet}</span>
            </div>

            {/* Gas Fee — ETH crossed out → 0 XNY */}
            <div className="flex justify-between items-center text-sm border-t border-[#F1F3F5] pt-3">
              <span className="text-[#9CA3AF]">Gas Fee</span>
              <div className="flex items-center gap-2">
                <span className="text-[#9CA3AF] line-through text-xs font-mono">~0.0002 ETH</span>
                <span className="text-[#5DDD22] font-bold">0 XNY</span>
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
            <Button variant="primary" className="flex-1" onClick={handleConfirm}>Confirm &amp; Sign</Button>
          </div>
        </>
      )}

      {/* ── Step 1: Wallet Signing ──────────────────────────────── */}
      {step === 'signing' && (
        <div className="text-center py-8">
          <div className="w-16 h-16 rounded-full border-2 border-[#FDA829] border-t-transparent animate-spin mx-auto mb-6" />
          <h2 className="text-xl font-bold mb-2 text-[#111827]">Waiting for signature…</h2>
          <p className="text-sm text-[#9CA3AF]">Please confirm the transaction in your wallet plugin.</p>
        </div>
      )}

      {/* ── Step 2: Pending ─────────────────────────────────────── */}
      {step === 'pending' && (
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
              <a href="https://etherscan.io/tx/0xa13f" target="_blank" rel="noopener noreferrer"
                className="font-mono text-[#FDA829] hover:underline flex items-center gap-1">
                0xa13f...92bd <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-[#9CA3AF]">Status</span>
              <span className="text-[#FDA829] font-medium">Pending</span>
            </div>
          </div>

          <Button variant="primary" className="w-full" onClick={handleDone}>Done</Button>
        </div>
      )}

    </Modal>
  );
}
