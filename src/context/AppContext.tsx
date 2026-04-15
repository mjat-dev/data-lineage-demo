import { createContext, useContext, useState } from 'react';

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

export function shortenAddress(address: string, len = 12): string {
  if (!address) return '';
  if (address.length <= len) return address;
  const half = Math.floor(len / 2);
  return `${address.slice(0, half)}...${address.slice(-half)}`;
}

// ── Mock demo wallet ──────────────────────────────────────────────────────────
const DEMO_WALLET = '0xfdbF0b002bea11E54250993E1298127Ad2CDD089';

interface AppContextType {
  walletAddress: string | null;
  walletType: string | null;
  isLoggedIn: boolean;
  authLoading: boolean;
  showLoginModal: boolean;
  setShowLoginModal: (v: boolean) => void;
  connectDemoWallet: () => void;
  disconnectWallet: () => void;
  displayName: string;

  submission: Submission | null;
  setSubmission: (s: Submission) => void;

  anchored: boolean;
  setAnchored: (v: boolean) => void;
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [submission, setSubmission] = useState<Submission | null>(null);
  const [anchored, setAnchored] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(true);

  const connectDemoWallet = () => {
    setWalletAddress(DEMO_WALLET);
    setShowLoginModal(false);
  };

  const disconnectWallet = () => {
    setWalletAddress(null);
    setSubmission(null);
    setAnchored(false);
    setShowLoginModal(true);
  };

  const isLoggedIn = !!walletAddress;
  const displayName = walletAddress ? shortenAddress(walletAddress) : '';

  return (
    <AppContext.Provider value={{
      walletAddress,
      walletType: 'demo',
      isLoggedIn,
      authLoading: false,
      showLoginModal,
      setShowLoginModal,
      connectDemoWallet,
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
