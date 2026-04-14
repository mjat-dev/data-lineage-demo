import { CodattaSignin } from 'codatta-connect';
import { useApp } from '@/context/AppContext';

export default function WalletModal({ onClose }: { onClose: () => void }) {
  const { loginWithResponse, isLoggedIn } = useApp();

  // If user is not logged in, this is a mandatory login modal — don't allow closing
  const canClose = isLoggedIn;

  const config = {
    channel: 'codatta-platform-website',
    device: 'WEB' as const,
    app: 'codatta-platform-website',
    inviterCode: '',
  };

  // Matches Frontier's auth-modal.tsx exactly
  async function handleLogin(res: { token: string; old_token?: string; user_id: string; new_user: boolean }) {
    localStorage.setItem('token', res.old_token || '');
    localStorage.setItem('uid', res.user_id);
    localStorage.setItem('auth', res.token);
    await loginWithResponse(res);
    onClose();
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}
      onClick={canClose ? onClose : undefined}
    >
      <div
        className="relative w-full max-w-[463px] rounded-2xl overflow-hidden"
        style={{ animation: 'scaleIn 0.2s ease forwards' }}
        onClick={e => e.stopPropagation()}
      >
        {canClose && (
          <button
            onClick={onClose}
            className="absolute top-3 right-3 z-10 p-1.5 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        )}
        <CodattaSignin onLogin={handleLogin} config={config} />
      </div>
    </div>
  );
}
