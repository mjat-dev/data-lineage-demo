import { useApp } from '@/context/AppContext';

const WALLETS = [
  {
    name: 'MetaMask',
    icon: (
      <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-8 h-8">
        <path d="M35.6 4L22.1 13.9l2.5-5.9L35.6 4z" fill="#E17726" stroke="#E17726" strokeWidth=".25" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M4.4 4l13.4 10-2.4-6L4.4 4z" fill="#E27625" stroke="#E27625" strokeWidth=".25" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M30.7 27.7l-3.6 5.5 7.7 2.1 2.2-7.4-6.3-.2zM2.9 27.9l2.2 7.4 7.7-2.1-3.6-5.5-6.3.2z" fill="#E27625" stroke="#E27625" strokeWidth=".25" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M12.4 18.2l-2.1 3.2 7.5.3-.3-8-5.1 4.5zM27.6 18.2l-5.2-4.6-.2 8.1 7.5-.3-2.1-3.2zM12.8 33.2l4.5-2.2-3.9-3-.6 5.2zM22.7 31l4.5 2.2-.6-5.2-3.9 3z" fill="#E27625" stroke="#E27625" strokeWidth=".25" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M27.2 33.2l-4.5-2.2.4 3-.1 1.2 4.2-2zM12.8 33.2l4.2 2-.1-1.2.4-3-4.5 2.2z" fill="#D5BFA2" stroke="#D5BFA2" strokeWidth=".25" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M17.1 26.5l-3.7-1.1 2.6-1.2 1.1 2.3zM22.9 26.5l1.1-2.3 2.6 1.2-3.7 1.1z" fill="#233447" stroke="#233447" strokeWidth=".25" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M12.8 33.2l.6-5.5-4.4.1 3.8 5.4zM26.6 27.7l.6 5.5 3.8-5.4-4.4-.1zM29.7 21.4l-7.5.3.7 3.8 1.1-2.3 2.6 1.2 3.1-2.8v-.2zM13.4 24.4l2.6-1.2 1.1 2.3.7-3.8-7.5-.3 3.1 3z" fill="#CC6228" stroke="#CC6228" strokeWidth=".25" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M10.3 21.4l3.1 6.1-.1-3-3-3.1zM26.7 27.5l-.1 3 3.1-6.1-3 3.1zM17.8 21.7l-.7 3.8.8 4.3.2-5.7-.3-2.4zM22.2 21.7l-.3 2.4.2 5.7.8-4.3-.7-3.8z" fill="#E27625" stroke="#E27625" strokeWidth=".25" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M22.9 26.5l-.8 4.3.6.4 3.9-3 .1-3-3.8 1.3zM13.4 24.4l.1 3 3.9 3 .6-.4-.8-4.3-3.8-1.3z" fill="#F5841F" stroke="#F5841F" strokeWidth=".25" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M22.8 35.2l.1-1.2-.3-.3h-5.2l-.3.3.1 1.2-4.4-2 1.5 1.3 3.1 2.1h5.3l3.1-2.1 1.5-1.3-4.5 2z" fill="#C0AC9D" stroke="#C0AC9D" strokeWidth=".25" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M22.7 31l-.6-.4h-4.2l-.6.4-.4 3 .3-.3h5.2l.3.3-.5-3z" fill="#161616" stroke="#161616" strokeWidth=".25" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M36.2 14.3l1.1-5.5-1.7-4.8-12.9 9.6 5 4.2 7 2.1 1.5-1.8-.7-.5 1.1-1-.8-.6 1.1-.8-.7-.5zM2.7 8.8l1.1 5.5-.7.5 1.1.8-.8.6 1.1 1-.7.5 1.5 1.8 7-2.1 5-4.2L15.4 4 2.7 8.8z" fill="#763E1A" stroke="#763E1A" strokeWidth=".25" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M34.6 19.9l-7-2.1 2.1 3.2-3.1 6.1 4.1-.1h6.1l-2.2-7.1zM12.4 17.8l-7 2.1-2.3 7.1h6.1l4.1.1-3.1-6.1 2.2-3.2zM22.2 18.5l.5-8.5 2.2-5.9h-9.8l2.2 5.9.5 8.5.2 2.4v5.6h4l.2-5.6v-2.4z" fill="#F5841F" stroke="#F5841F" strokeWidth=".25" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
  {
    name: 'OKX Wallet',
    icon: (
      <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-8 h-8">
        <rect width="32" height="32" rx="8" fill="#000"/>
        <rect x="6" y="6" width="8" height="8" rx="1" fill="white"/>
        <rect x="18" y="6" width="8" height="8" rx="1" fill="white"/>
        <rect x="6" y="18" width="8" height="8" rx="1" fill="white"/>
        <rect x="18" y="18" width="8" height="8" rx="1" fill="white"/>
        <rect x="12" y="12" width="8" height="8" rx="1" fill="white"/>
      </svg>
    ),
  },
  {
    name: 'WalletConnect',
    icon: (
      <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-8 h-8">
        <rect width="32" height="32" rx="16" fill="#3B99FC"/>
        <path d="M9.6 12.8c3.5-3.5 9.3-3.5 12.8 0l.4.4c.2.2.2.5 0 .7l-1.4 1.4c-.1.1-.3.1-.4 0l-.6-.6c-2.4-2.4-6.4-2.4-8.8 0l-.6.6c-.1.1-.3.1-.4 0L9.2 13.9c-.2-.2-.2-.5 0-.7l.4-.4zm15.8 3l1.3 1.3c.2.2.2.5 0 .7l-5.7 5.7c-.2.2-.5.2-.7 0l-4-4c-.1-.1-.2-.1-.4 0l-4 4c-.2.2-.5.2-.7 0l-5.7-5.7c-.2-.2-.2-.5 0-.7l1.3-1.3c.2-.2.5-.2.7 0l4 4c.1.1.2.1.4 0l4-4c.2-.2.5-.2.7 0l4 4c.1.1.2.1.4 0l4-4c.2-.2.5-.2.7 0z" fill="white"/>
      </svg>
    ),
  },
  {
    name: 'Coinbase Wallet',
    icon: (
      <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-8 h-8">
        <rect width="32" height="32" rx="16" fill="#1652F0"/>
        <path d="M16 6C10.5 6 6 10.5 6 16s4.5 10 10 10 10-4.5 10-10S21.5 6 16 6zm0 14.5c-2.5 0-4.5-2-4.5-4.5s2-4.5 4.5-4.5 4.5 2 4.5 4.5-2 4.5-4.5 4.5z" fill="white"/>
        <rect x="13.5" y="14" width="5" height="4" rx="1" fill="white"/>
      </svg>
    ),
  },
];

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
      style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(6px)' }}
      onClick={canClose ? onClose : undefined}
    >
      <div
        className="relative w-full max-w-sm bg-white rounded-2xl shadow-2xl overflow-hidden"
        style={{ animation: 'scaleIn 0.2s ease forwards' }}
        onClick={e => e.stopPropagation()}
      >
        {canClose && (
          <button
            onClick={onClose}
            className="absolute top-3 right-3 p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors z-10"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        )}

        {/* Header */}
        <div className="px-6 pt-7 pb-5 border-b border-gray-100">
          <h2 className="text-lg font-bold text-[#070707]">Connect Wallet</h2>
          <p className="text-xs text-[#9CA3AF] mt-1">Choose your preferred wallet to continue</p>
        </div>

        {/* Wallet list */}
        <div className="p-3">
          {WALLETS.map((w) => (
            <button
              key={w.name}
              onClick={handleConnect}
              className="w-full flex items-center gap-4 px-4 py-3.5 rounded-xl hover:bg-[#F9FAFB] transition-colors text-left group"
            >
              <div className="shrink-0">{w.icon}</div>
              <span className="text-sm font-semibold text-[#111827] group-hover:text-[#070707]">{w.name}</span>
              <svg className="w-4 h-4 text-gray-300 group-hover:text-[#FDA829] ml-auto transition-colors" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 18l6-6-6-6"/>
              </svg>
            </button>
          ))}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 text-center">
          <p className="text-[10px] text-[#C4C9D4]">Demo mode · No real transaction required</p>
        </div>
      </div>
    </div>
  );
}
