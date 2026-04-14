import { createContext, useContext, useState, useEffect } from 'react';
import { getUserInfo, clearToken, hasToken, saveToken, type UserInfo } from '@/lib/api';

export interface Submission {
  id: string;
  foodName: string;
  foodWeight: string;
  cookingMethod: string;
  calories: string;
  foodImageName: string;
  foodImageUrl: string;
  submittedAt: string;
  taskId: string;
  templateId: string;
  status: string;
}

interface LoginResponse {
  token: string;
  old_token?: string;
  user_id: string;
  new_user: boolean;
}

interface AppContextType {
  // Auth
  walletAddress: string | null;
  walletType: string | null;
  userInfo: UserInfo | null;
  isLoggedIn: boolean;
  loginWithResponse: (res: LoginResponse) => Promise<void>;
  disconnectWallet: () => void;

  // Submission
  submission: Submission | null;
  setSubmission: (s: Submission) => void;

  // Anchor (chain backend pending)
  anchored: boolean;
  setAnchored: (v: boolean) => void;
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [walletType, setWalletType] = useState<string | null>(null);
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [submission, setSubmission] = useState<Submission | null>(null);
  const [anchored, setAnchored] = useState(false);

  // Re-hydrate if token exists (page refresh)
  useEffect(() => {
    if (hasToken()) {
      getUserInfo().then(info => {
        setUserInfo(info);
        const account = info.accounts_data.find(a => a.current_account);
        if (account) {
          setWalletAddress(account.account);
          setWalletType(account.wallet_name);
        }
      }).catch(() => {
        clearToken();
      });
    }
  }, []);

  // Called by WalletModal after CodattaSignin returns login response
  const loginWithResponse = async (_res: LoginResponse) => {
    // Step 1: get wallet address from MetaMask directly (fastest, most reliable)
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const eth = (window as any).ethereum;
      const accounts: string[] = await eth?.request({ method: 'eth_accounts' });
      if (accounts?.[0]) setWalletAddress(accounts[0]);
    } catch {
      // ignore
    }

    // Step 2: try getUserInfo for full profile (wallet type, assets, etc.)
    try {
      const info = await getUserInfo();
      setUserInfo(info);
      const account = info.accounts_data.find(a => a.current_account);
      if (account) {
        setWalletAddress(account.account);
        setWalletType(account.wallet_name);
      }
    } catch (e) {
      console.error('[AppContext] getUserInfo failed:', e);
      // Step 1 already set wallet address from MetaMask, so just fallback to user_id if needed
      if (!walletAddress) setWalletAddress(_res.user_id);
    }
  };

  const disconnectWallet = () => {
    clearToken();
    setWalletAddress(null);
    setWalletType(null);
    setUserInfo(null);
    setSubmission(null);
    setAnchored(false);
  };

  const isLoggedIn = !!walletAddress;

  return (
    <AppContext.Provider value={{
      walletAddress,
      walletType,
      userInfo,
      isLoggedIn,
      loginWithResponse,
      disconnectWallet,
      submission,
      setSubmission,
      anchored,
      setAnchored,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
