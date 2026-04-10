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

interface AppContextType {
  // Auth
  walletAddress: string | null;
  walletType: string | null;
  userInfo: UserInfo | null;
  isLoggedIn: boolean;
  setAuth: (token: string, walletType: string, walletAddress: string) => Promise<void>;
  disconnectWallet: () => void;

  // Legacy helpers (keep for component compat)
  connectWallet: (type: string) => void;

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

  // Re-hydrate if token exists in session (page refresh)
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

  const setAuth = async (token: string, type: string, address: string) => {
    saveToken(token);
    setWalletType(type);
    setWalletAddress(address);
    const info = await getUserInfo();
    setUserInfo(info);
  };

  const disconnectWallet = () => {
    clearToken();
    setWalletAddress(null);
    setWalletType(null);
    setUserInfo(null);
    setSubmission(null);
    setAnchored(false);
  };

  // Demo mode: select wallet → immediately "logged in" with placeholder address.
  // TODO: Replace with real setAuth flow during API 联调.
  const connectWallet = (type: string) => {
    setWalletType(type);
    setWalletAddress('0x71C7...a3F8');
  };

  const isLoggedIn = !!walletAddress;

  return (
    <AppContext.Provider value={{
      walletAddress,
      walletType,
      userInfo,
      isLoggedIn,
      setAuth,
      disconnectWallet,
      connectWallet,
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
