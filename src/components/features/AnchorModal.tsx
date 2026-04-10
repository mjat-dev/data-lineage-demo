import { useState } from 'react';
import { Link2, CheckCircle2, ExternalLink } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';

interface AnchorModalProps {
  onClose: () => void;
  onSuccess?: () => void;
}

export default function AnchorModal({ onClose, onSuccess }: AnchorModalProps) {
  const [step, setStep] = useState<0 | 1 | 2>(0);

  const handleConfirm = () => {
    setStep(1);
    setTimeout(() => setStep(2), 2200);
  };

  return (
    <Modal onClose={onClose} className="max-w-md">
      {step === 0 && (
        <>
          <div className="w-12 h-12 rounded-2xl bg-[rgba(255,168,0,0.10)] flex items-center justify-center mb-5">
            <Link2 className="w-6 h-6 text-[#FFA800]" />
          </div>
          <h2 className="text-2xl font-bold mb-2 text-[#070707]">Mint Verification Proof</h2>
          <p className="text-sm text-[#6B7280] mb-6">
            Anchor your submission to the blockchain. This creates a permanent, tamper-proof record of your contribution.
          </p>
          <div className="bg-gray-50 rounded-xl p-4 mb-6 space-y-3">
            {[
              { label: 'Asset', value: 'Food-Science-Asset-42', mono: false },
              { label: 'Service Fee', value: '450 XNY', accent: true },
              { label: 'Network Fee', value: '~0.0002 ETH', mono: true },
              { label: 'Wallet', value: '@chef_kenshiro', mono: true },
            ].map(({ label, value, mono, accent }) => (
              <div key={label} className={`flex justify-between text-sm ${label === 'Wallet' ? 'border-t border-gray-200 pt-3' : ''}`}>
                <span className="text-[#9CA3AF]">{label}</span>
                <span className={`font-bold ${accent ? 'text-[#FFA800]' : mono ? 'font-mono text-[#6B7280]' : 'text-[#070707]'}`}>{value}</span>
              </div>
            ))}
          </div>
          <div className="flex gap-3">
            <Button variant="secondary" className="flex-1 py-3" onClick={onClose}>Cancel</Button>
            <Button variant="primary" className="flex-1 py-3" onClick={handleConfirm}>Confirm &amp; Anchor</Button>
          </div>
        </>
      )}

      {step === 1 && (
        <div className="text-center py-8">
          <div className="w-16 h-16 rounded-full border-2 border-[#FFA800] border-t-transparent animate-spin mx-auto mb-6" />
          <h2 className="text-xl font-bold mb-2 text-[#070707]">Anchoring to Blockchain…</h2>
          <p className="text-sm text-[#9CA3AF]">Broadcasting transaction to Ethereum network</p>
        </div>
      )}

      {step === 2 && (
        <div className="text-center py-8">
          <div className="w-16 h-16 rounded-full bg-[rgba(34,197,94,0.10)] flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-8 h-8 text-[#22C55E]" />
          </div>
          <h2 className="text-xl font-bold mb-2 text-[#070707]">Successfully Anchored!</h2>
          <p className="text-sm text-[#9CA3AF] mb-6">Your contribution is now permanently recorded on-chain.</p>
          <div className="bg-gray-50 border border-[rgba(34,197,94,0.15)] rounded-xl p-4 mb-6 text-left space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-[#9CA3AF]">Tx Hash</span>
              <a href="https://etherscan.io/tx/0xa13f" target="_blank" rel="noopener noreferrer" className="font-mono text-[#FFA800] hover:underline flex items-center gap-1">
                0xa13f...92bd <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-[#9CA3AF]">Block</span>
              <span className="font-mono text-[#070707]">21,483,291</span>
            </div>
          </div>
          <Button variant="primary" className="w-full py-3" onClick={() => { onSuccess?.(); onClose(); }}>Done</Button>
        </div>
      )}
    </Modal>
  );
}
