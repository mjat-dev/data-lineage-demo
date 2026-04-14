import { CodattaSignin } from 'codatta-connect';
import { useApp } from '@/context/AppContext';

export default function WalletModal({ onClose }: { onClose: () => void }) {
  const { loginWithResponse } = useApp();

  const config = {
    channel: 'codatta-platform-website',
    device: 'WEB' as const,
    app: 'codatta-platform-website',
    inviterCode: '',
  };

  // Don't await async ops — CodattaSignin waits for this callback to return before
  // dismissing its loading state. Fire-and-forget loginWithResponse so UI unblocks immediately.
  function handleLogin(res: { token: string; old_token?: string; user_id: string; new_user: boolean }) {
    localStorage.setItem('token', res.old_token || '');
    localStorage.setItem('uid', res.user_id);
    localStorage.setItem('auth', res.token);
    loginWithResponse(res); // fire and forget
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
        <CodattaSignin onLogin={handleLogin} config={config} />
      </div>
    </div>
  );
}
