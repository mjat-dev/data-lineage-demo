import { useState } from 'react';
import { Link2, ExternalLink, Sparkles } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { useApp } from '@/context/AppContext';
import { truncateAddress } from '@/lib/utils';

interface AnchorModalProps {
  onClose: () => void;
  onSuccess?: () => void;
}

const MOCK_TX   = '0xa13f8d92b4c1e05f3d7a2b19c04e8f61d3a7c29e';
const MOCK_BLOCK = 43_281_774;

export default function AnchorModal({ onClose, onSuccess }: AnchorModalProps) {
  const { walletAddress } = useApp();
  const [step, setStep] = useState<'confirm' | 'signing' | 'pending'>('confirm');

  const wallet = walletAddress ? truncateAddress(walletAddress) : '0xfdbF...D089';

  const handleAnchor = () => {
    setStep('signing');
    // Simulate wallet signing + on-chain submission (~2s)
    setTimeout(() => {
      setStep('pending');
      onSuccess?.();
    }, 2000);
  };

  return (
    <Modal onClose={step === 'signing' ? () => {} : onClose} className="max-w-md">

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
            <div className="flex justify-between items-center text-sm border-t border-[#F1F3F5] pt-3">
              <span className="text-[#9CA3AF]">Gas Fee</span>
              <div className="flex items-center gap-2">
                <span className="text-[#9CA3AF] line-through text-xs font-mono">~0.0002 ETH</span>
                <span className="text-[#5DDD22] font-bold">450 XNY</span>
              </div>
            </div>
          </div>

          <div className="flex items-start gap-2 px-1 mb-5">
            <Sparkles className="w-3.5 h-3.5 text-[#FDA829] shrink-0 mt-0.5" />
            <p className="text-[11px] text-[#9CA3AF] leading-relaxed">
              Powered by <span className="font-semibold text-[#FDA829]">x402</span> — gas fees are covered by Codatta's paymaster and settled in XNY, enabling gasless on-chain anchoring for contributors.
            </p>
          </div>

          <div className="flex gap-3">
            <Button variant="secondary" className="flex-1" onClick={onClose}>Cancel</Button>
            <Button variant="primary" className="flex-1" onClick={handleAnchor}>Confirm &amp; Sign</Button>
          </div>
        </>
      )}

      {/* ── Signing / waiting ── */}
      {step === 'signing' && (
        <div className="text-center py-8">
          <div className="w-16 h-16 rounded-full border-2 border-[#FDA829] border-t-transparent animate-spin mx-auto mb-6" />
          <h2 className="text-xl font-bold mb-2 text-[#111827]">Waiting for signature…</h2>
          <p className="text-sm text-[#9CA3AF]">Please confirm the transaction in your wallet plugin.</p>
        </div>
      )}

      {/* ── Pending / success ── */}
      {step === 'pending' && (
        <div className="text-center py-6">
          <div className="w-16 h-16 rounded-full bg-[rgba(34,197,94,0.10)] flex items-center justify-center mx-auto mb-5">
            <svg className="w-8 h-8 text-[#22C55E]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-xl font-bold mb-2 text-[#111827]">Anchored Successfully!</h2>
          <p className="text-sm text-[#6B7280] mb-5 max-w-xs mx-auto leading-relaxed">
            Your contribution is now permanently recorded on-chain.
          </p>

          <div className="bg-[#F9FAFB] border border-[#F1F3F5] rounded-xl p-4 mb-6 text-left space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-[#9CA3AF]">Tx Hash</span>
              <a href={`https://bscscan.com/tx/${MOCK_TX}`} target="_blank" rel="noopener noreferrer"
                className="font-mono text-[#FDA829] hover:underline flex items-center gap-1">
                {MOCK_TX.slice(0, 6)}...{MOCK_TX.slice(-4)} <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-[#9CA3AF]">Block</span>
              <span className="font-mono text-[#111827]">{MOCK_BLOCK.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-[#9CA3AF]">Status</span>
              <span className="text-[#FDA829] font-medium">Pending</span>
            </div>
          </div>

          <Button variant="primary" className="w-full" onClick={onClose}>Done</Button>
        </div>
      )}

    </Modal>
  );
}
