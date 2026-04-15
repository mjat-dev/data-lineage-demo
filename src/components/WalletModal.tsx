import { useApp } from '@/context/AppContext';
import { Link2 } from 'lucide-react';

export default function WalletModal({ onClose }: { onClose: () => void }) {
  const { connectDemoWallet, isLoggedIn } = useApp();

  const canClose = isLoggedIn;

  const handleConnect = () => {
    connectDemoWallet();
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}
      onClick={canClose ? onClose : undefined}
    >
      <div
        className="relative w-full max-w-sm bg-white rounded-2xl p-8 shadow-2xl text-center"
        style={{ animation: 'scaleIn 0.2s ease forwards' }}
        onClick={e => e.stopPropagation()}
      >
        {canClose && (
          <button
            onClick={onClose}
            className="absolute top-3 right-3 p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        )}

        <div className="w-14 h-14 rounded-2xl bg-[rgba(253,168,41,0.12)] flex items-center justify-center mx-auto mb-5">
          <Link2 className="w-7 h-7 text-[#FDA829]" />
        </div>
        <h2 className="text-xl font-bold text-[#070707] mb-1">Connect Wallet</h2>
        <p className="text-sm text-[#9CA3AF] mb-8">Connect your wallet to start contributing data.</p>

        <button
          onClick={handleConnect}
          className="w-full py-3 bg-[#2E2E2E] hover:bg-[#111827] text-white font-bold rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          <span className="w-4 h-4 rounded-full bg-[#FDA829] inline-block" />
          Connect Demo Wallet
        </button>

        <p className="text-[10px] text-[#9CA3AF] mt-4">Demo mode · No real transaction required</p>
      </div>
    </div>
  );
}
