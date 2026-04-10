import { useState } from 'react';
import { Wallet } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { Modal } from '@/components/ui/Modal';

const WALLETS = [
  { id: 'metamask', name: 'MetaMask', icon: '🦊', desc: 'Connect with MetaMask' },
  { id: 'okx', name: 'OKX Wallet', icon: '⭕', desc: 'Connect with OKX Wallet' },
];

// Demo mode: click wallet → immediately logged in with a placeholder address.
// TODO: Replace with real wallet signing flow during API 联调.
const DEMO_ADDRESS = '0x71C7...a3F8';

export default function WalletModal({ onClose }: { onClose: () => void }) {
  const { connectWallet } = useApp();
  const [connecting, setConnecting] = useState<string | null>(null);

  const handleConnect = (wallet: typeof WALLETS[number]) => {
    setConnecting(wallet.id);
    setTimeout(() => {
      connectWallet(wallet.name);
      onClose();
    }, 600);
  };

  return (
    <Modal onClose={onClose} className="max-w-sm">
      <div className="w-12 h-12 rounded-2xl bg-[rgba(255,168,0,0.10)] flex items-center justify-center mb-5">
        <Wallet className="w-6 h-6 text-[#FFA800]" />
      </div>
      <h2 className="text-xl font-bold mb-1 text-[#070707]">Connect Wallet</h2>
      <p className="text-sm text-[#6B7280] mb-6">Connect your wallet to submit data and anchor on-chain.</p>
      <div className="space-y-2">
        {WALLETS.map(w => (
          <button
            key={w.id}
            onClick={() => handleConnect(w)}
            disabled={!!connecting}
            className="w-full flex items-center gap-3 p-3.5 rounded-xl border border-gray-200 hover:border-[#FFA800]/40 hover:bg-[rgba(255,168,0,0.04)] transition-all disabled:opacity-50 text-left"
          >
            <span className="text-2xl">{w.icon}</span>
            <div className="flex-1">
              <p className="text-sm font-semibold text-[#070707]">{w.name}</p>
              <p className="text-[10px] text-[#9CA3AF]">{w.desc}</p>
            </div>
            {connecting === w.id && (
              <div className="w-5 h-5 border-2 border-[#FFA800] border-t-transparent rounded-full animate-spin" />
            )}
          </button>
        ))}
      </div>
      {connecting && (
        <div className="mt-4 flex items-center gap-2 p-3 rounded-xl bg-[rgba(255,168,0,0.06)] border border-[rgba(255,168,0,0.15)]">
          <div className="w-4 h-4 border-2 border-[#FFA800] border-t-transparent rounded-full animate-spin shrink-0" />
          <p className="text-xs text-[#070707] font-medium">Connecting…</p>
        </div>
      )}
    </Modal>
  );
}
