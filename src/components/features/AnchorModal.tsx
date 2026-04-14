import { useState } from 'react';
import { Link2, Clock, ExternalLink, AlertCircle } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';

interface AnchorModalProps {
  onClose: () => void;
  onSuccess?: () => void;
}

// Mock values — will be replaced by real API data during 联调
const REWARD_XNY  = 450;   // pending reward
const FEE_XNY     = 50;    // gas fee deducted from reward (platform pays gas on-chain, deducts from reward)
const RECEIVE_XNY = REWARD_XNY - FEE_XNY;

export default function AnchorModal({ onClose, onSuccess }: AnchorModalProps) {
  const [step, setStep] = useState<'confirm' | 'signing' | 'pending'>('confirm');

  // Simulate wallet signing → pending
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
            Your contribution will be permanently recorded on-chain. Gas fee is sponsored by the platform and deducted from your reward.
          </p>

          {/* Fee breakdown */}
          <div className="bg-[#F9FAFB] rounded-xl p-4 mb-3 space-y-3 border border-[#F1F3F5]">
            {[
              { label: 'Asset',            value: 'Food-Science-Asset-42', style: 'text-[#111827] font-semibold' },
              { label: 'Reward',           value: `${REWARD_XNY} XNY`,    style: 'text-[#FDA829] font-bold' },
              { label: 'Fee',              value: `${FEE_XNY} XNY`,       style: 'text-[#6B7280] font-mono' },
              { label: 'You will Receive', value: `${RECEIVE_XNY} XNY`,   style: 'text-[#111827] font-bold' },
            ].map(({ label, value, style }, i) => (
              <div
                key={label}
                className={`flex justify-between text-sm ${i === 3 ? 'border-t border-[#E5E7EB] pt-3' : ''}`}
              >
                <span className="text-[#9CA3AF]">{label}</span>
                <span className={style}>{value}</span>
              </div>
            ))}
          </div>

          {/* Spec copy: fee note */}
          <p className="text-[11px] text-[#9CA3AF] mb-5 px-1">
            Fee will be deducted before payout.
          </p>

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

      {/* ── Step 2: Pending (async, not instant success) ────────── */}
      {step === 'pending' && (
        <div className="text-center py-6">
          <div className="w-16 h-16 rounded-full bg-[rgba(253,168,41,0.10)] flex items-center justify-center mx-auto mb-5">
            <Clock className="w-8 h-8 text-[#FDA829]" />
          </div>
          <h2 className="text-xl font-bold mb-2 text-[#111827]">Submitted</h2>
          <p className="text-sm text-[#6B7280] mb-5 max-w-xs mx-auto leading-relaxed">
            Your anchor has been submitted and is being processed on-chain. This may take a few minutes.
          </p>

          {/* Tx reference */}
          <div className="bg-[#F9FAFB] border border-[#F1F3F5] rounded-xl p-4 mb-5 text-left space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-[#9CA3AF]">Tx Hash</span>
              <a
                href="https://etherscan.io/tx/0xa13f"
                target="_blank"
                rel="noopener noreferrer"
                className="font-mono text-[#FDA829] hover:underline flex items-center gap-1"
              >
                0xa13f...92bd <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-[#9CA3AF]">Status</span>
              <span className="text-[#FDA829] font-medium">Pending</span>
            </div>
          </div>

          {/* Spec copy: async guidance */}
          <div className="flex items-start gap-2 p-3 rounded-xl bg-[#F9FAFB] border border-[#F1F3F5] text-left mb-6">
            <AlertCircle className="w-4 h-4 text-[#9CA3AF] shrink-0 mt-0.5" />
            <p className="text-xs text-[#6B7280] leading-relaxed">
              You can view the progress in <span className="font-semibold text-[#111827]">Claim History</span>.
            </p>
          </div>

          <Button variant="primary" className="w-full" onClick={handleDone}>Done</Button>
        </div>
      )}

    </Modal>
  );
}
