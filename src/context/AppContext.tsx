import { createContext, useContext, useState, useEffect } from 'react';

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

// ── sessionStorage helpers (clears automatically when tab is closed) ──────────
const SS_WALLET       = 'demo_wallet';
const SS_SUBMISSIONS  = 'demo_submissions';
const SS_ACTIVE_ID    = 'demo_active_id';

function ssGet<T>(key: string, fallback: T): T {
  try {
    const raw = sessionStorage.getItem(key);
    return raw !== null ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}
function ssSet(key: string, value: unknown) {
  try { sessionStorage.setItem(key, JSON.stringify(value)); } catch { /* ignore */ }
}
function ssDel(key: string) {
  try { sessionStorage.removeItem(key); } catch { /* ignore */ }
}

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

  submissions: Submission[];
  submission: Submission | null;
  setSubmission: (s: Submission) => void;
  setActiveSubmission: (id: string) => void;
  updateSubmissionStatus: (id: string, status: string) => void;

  anchored: boolean;
  setAnchored: (v: boolean) => void;
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  // Initialise from sessionStorage so refreshes don't lose data
  const [walletAddress, setWalletAddress] = useState<string | null>(
    () => ssGet<string | null>(SS_WALLET, null)
  );
  const [submissionsState, setSubmissionsState] = useState<Submission[]>(
    () => ssGet<Submission[]>(SS_SUBMISSIONS, [])
  );
  const [activeSubmissionId, setActiveSubmissionId] = useState<string | null>(
    () => ssGet<string | null>(SS_ACTIVE_ID, null)
  );
  const [showLoginModal, setShowLoginModal] = useState(() => !ssGet<string | null>(SS_WALLET, null));

  // Persist to sessionStorage whenever state changes
  useEffect(() => {
    walletAddress ? ssSet(SS_WALLET, walletAddress) : ssDel(SS_WALLET);
  }, [walletAddress]);

  useEffect(() => {
    ssSet(SS_SUBMISSIONS, submissionsState);
  }, [submissionsState]);

  useEffect(() => {
    activeSubmissionId ? ssSet(SS_ACTIVE_ID, activeSubmissionId) : ssDel(SS_ACTIVE_ID);
  }, [activeSubmissionId]);

  // Active submission for lineage view
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
    ssDel(SS_WALLET);
    ssDel(SS_SUBMISSIONS);
    ssDel(SS_ACTIVE_ID);
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
