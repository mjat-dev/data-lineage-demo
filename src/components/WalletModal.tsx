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
    channel: '',
    device: 'WEB' as const,
    app: 'codatta-platform-website',
    inviterCode: '',
  };

  async function handleLogin(res: LoginResponse) {
    await loginWithResponse(res);
    onClose();
  }

  return (
    <Modal onClose={onClose} className="max-w-[463px]">
      <CodattaSignin onLogin={handleLogin} config={config} />
    </Modal>
  );
}
