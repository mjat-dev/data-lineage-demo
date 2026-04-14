import { CodattaSignin } from 'codatta-connect';
import { useApp } from '@/context/AppContext';
import { Modal } from '@/components/ui/Modal';

interface LoginResponse {
  token: string;
  old_token?: string;
  user_id: string;
  new_user: boolean;
}

export default function WalletModal({ onClose }: { onClose: () => void }) {
  const { loginWithResponse } = useApp();

  const config = {
    channel: 'codatta-platform-website',
    device: 'WEB' as const,
    app: 'codatta-platform-website',
    inviterCode: '',
  };

  async function handleLogin(res: LoginResponse) {
    await loginWithResponse(res);
    onClose();
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-[463px] rounded-2xl overflow-hidden"
        style={{ animation: 'scaleIn 0.2s ease forwards' }}
        onClick={e => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-10 p-1.5 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-colors"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
        <CodattaSignin onLogin={handleLogin} config={config} />
      </div>
    </div>
  );
}
