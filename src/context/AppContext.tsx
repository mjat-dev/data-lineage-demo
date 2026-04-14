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

export function shortenAddress(address: string, len = 12): string {
  if (!address) return '';
  if (address.length <= len) return address;
  const half = Math.floor(len / 2);
  return `${address.slice(0, half + 2)}...${address.slice(-half)}`;
}

interface AppContextType {
  // Auth
  walletAddress: string | null;
  walletType: string | null;
  userInfo: UserInfo | null;
  isLoggedIn: boolean;
  authLoading: boolean;
  showLoginModal: boolean;
  setShowLoginModal: (v: boolean) => void;
  loginWithResponse: (res: LoginResponse) => Promise<void>;
  disconnectWallet: () => void;
  displayName: string;

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
  const [authLoading, setAuthLoading] = useState(true);
  const [showLoginModal, setShowLoginModal] = useState(false);

  // Check login status on mount; show login modal if not logged in
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
        setShowLoginModal(true);
      }).finally(() => {
        setAuthLoading(false);
      });
    } else {
      setAuthLoading(false);
      setShowLoginModal(true);
    }
  }, []);

  // Called by WalletModal after CodattaSignin returns login response
  const loginWithResponse = async (res: LoginResponse) => {
    saveToken(res);
    try {
      const info = await getUserInfo();
      setUserInfo(info);
      const account = info.accounts_data.find(a => a.current_account);
      if (account) {
        setWalletAddress(account.account);
        setWalletType(account.wallet_name);
      }
      setShowLoginModal(false);
    } catch {
      setWalletAddress(res.user_id);
      setShowLoginModal(false);
    }
  };

  const disconnectWallet = () => {
    clearToken();
    setWalletAddress(null);
    setWalletType(null);
    setUserInfo(null);
    setSubmission(null);
    setAnchored(false);
    setShowLoginModal(true);
  };

  const isLoggedIn = !!walletAddress;

  // Display masked wallet address, fallback to user_name or truncated user_id
  const displayName = (() => {
    if (!userInfo) return walletAddress ? shortenAddress(walletAddress) : '';
    const account = userInfo.accounts_data.find(a => a.current_account);
    if (account?.account) return shortenAddress(account.account);
    if (userInfo.user_data.user_name) return userInfo.user_data.user_name;
    return shortenAddress(userInfo.user_data.user_id);
  })();

  return (
    <AppContext.Provider value={{
      walletAddress,
      walletType,
      userInfo,
      isLoggedIn,
      authLoading,
      showLoginModal,
      setShowLoginModal,
      loginWithResponse,
      disconnectWallet,
      displayName,
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
