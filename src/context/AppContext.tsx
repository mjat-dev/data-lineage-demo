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

  // All submissions (seed + user-added)
  submissions: Submission[];
  // Currently active submission being viewed in lineage
  submission: Submission | null;
  // Add a new submission (from TaskPage) and make it active
  setSubmission: (s: Submission) => void;
  // Set which submission is active for lineage view
  setActiveSubmission: (id: string) => void;
  // Update status of a specific submission (e.g. after anchoring)
  updateSubmissionStatus: (id: string, status: string) => void;

  // Derived from active submission's status — backward-compat
  anchored: boolean;
  setAnchored: (v: boolean) => void;
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [submissionsState, setSubmissionsState] = useState<Submission[]>([]);
  const [activeSubmissionId, setActiveSubmissionId] = useState<string | null>(null);
  const [showLoginModal, setShowLoginModal] = useState(true);

  // Active submission: the one being viewed in lineage
  const submission =
    submissionsState.find(s => s.id === activeSubmissionId) ?? submissionsState[0] ?? null;

  const setSubmission = (s: Submission) => {
    setSubmissionsState(prev => [s, ...prev]);
    setActiveSubmissionId(s.id);
  };

  const setActiveSubmission = (id: string) => setActiveSubmissionId(id);

  const updateSubmissionStatus = (id: string, status: string) => {
    setSubmissionsState(prev => prev.map(s => s.id === id ? { ...s, status } : s));
  };

  // anchored = derived from the active submission's status (no separate boolean needed)
  const anchored = ['anchored', 'assetified', 'published'].includes(submission?.status ?? '');
  const setAnchored = (v: boolean) => {
    if (v && submission) updateSubmissionStatus(submission.id, 'anchored');
  };

  const connectDemoWallet = () => {
    setWalletAddress(DEMO_WALLET);
    setShowLoginModal(false);
  };

  const disconnectWallet = () => {
    setWalletAddress(null);
    setSubmissionsState([]);
    setActiveSubmissionId(null);
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
      submissions: submissionsState,
      submission,
      setSubmission,
      setActiveSubmission,
      updateSubmissionStatus,
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
