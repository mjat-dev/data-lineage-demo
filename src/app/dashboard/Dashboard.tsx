import { useNavigate } from 'react-router-dom';
import { FileUp, BadgeCheck, Link2, Coins, Wallet, ArrowRight, Zap, Inbox } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

// ── Status pipeline ───────────────────────────────────────────────────────────
const PIPELINE = ['submitted', 'validated', 'anchored', 'assetified', 'published'] as const;

const STEP_INDEX: Record<string, number> = {
  submitted:  0,
  validated:  1,
  packaged:   1,
  anchored:   2,
  assetified: 3,
  published:  4,
};

interface NextStepConfig {
  label: string;
  sublabel: string;
  variant: 'orange' | 'blue' | 'gray' | 'green';
  isUserAction: boolean;
}

const NEXT_STEP_CONFIG: Record<string, NextStepConfig> = {
  submitted:  { label: 'Pending Review',  sublabel: 'Pending Validate',  variant: 'gray',   isUserAction: false },
  validated:  { label: 'Pending Anchor',  sublabel: 'Anchor On-Chain',   variant: 'orange', isUserAction: true  },
  packaged:   { label: 'Pending Anchor',  sublabel: 'Anchor On-Chain',   variant: 'orange', isUserAction: true  },
  anchored:   { label: 'Pending Publish', sublabel: 'Pending Publish',   variant: 'blue',   isUserAction: false },
  assetified: { label: 'Pending Publish', sublabel: 'Pending Publish',   variant: 'blue',   isUserAction: false },
  published:  { label: 'Completed',       sublabel: 'Published',         variant: 'green',  isUserAction: false },
};

const FRONTIER_NAME = 'Food Science';
const TASK_NAME = 'Food Image Annotation';

export default function Dashboard() {
  const { isLoggedIn, submission, setSubmission, setShowLoginModal } = useApp();
  const navigate = useNavigate();

  // ── Login gate ────────────────────────────────────────────────────────────
  if (!isLoggedIn) {
    return (
      <main className="pt-24 pb-20 bg-[#F5F5F5] min-h-screen flex items-center justify-center">
        <div className="text-center max-w-sm mx-auto px-8">
          <div className="w-16 h-16 rounded-2xl bg-[rgba(255,168,0,0.08)] flex items-center justify-center mx-auto mb-5">
            <Wallet className="w-7 h-7 text-[#FFA800]" />
          </div>
          <h2 className="text-xl font-bold text-[#070707] mb-2">Connect Wallet</h2>
          <p className="text-sm text-[#9CA3AF] leading-relaxed mb-6">
            Connect your wallet to view your contributions, rewards, and submission history.
          </p>
          <button
            onClick={() => setShowLoginModal(true)}
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#2E2E2E] hover:bg-[#070707] text-white text-sm font-semibold rounded-xl transition-colors"
          >
            <span className="w-2 h-2 rounded-full bg-[#FDA829] inline-block" />
            Connect Wallet
          </button>
        </div>
      </main>
    );
  }

  // ── Derive stats from real submission ─────────────────────────────────────
  const count = submission ? 1 : 0;
  const statCards = [
    { label: 'Total Submissions', value: String(count), icon: FileUp,    delta: count ? '1 qualified' : 'No submissions yet' },
    { label: 'Validated',         value: '0',           icon: BadgeCheck, delta: count ? '1 pending' : '—' },
    { label: 'Anchored On-chain', value: '0',           icon: Link2,      delta: 'Pending anchor' },
    { label: 'Reward',            value: '—',           icon: Coins,      delta: 'No claimable rewards' },
  ];

  const getStatusConfig = (rawStatus: string): NextStepConfig => {
    const key = (rawStatus || 'submitted').toLowerCase();
    return NEXT_STEP_CONFIG[key] ?? NEXT_STEP_CONFIG.submitted;
  };

  return (
    <main className="pt-24 pb-20">
      <div className="max-w-6xl mx-auto px-8">

        {/* Header */}
        <header className="mb-12">
          <p className="text-[#9CA3AF] text-[10px] font-bold uppercase tracking-[0.2em] mb-2">Overview</p>
          <h1 className="text-4xl font-bold tracking-tight mb-2 text-[#070707]">My Contributions</h1>
          <p className="text-[#6B7280] text-sm">Track your data submissions, validation status, and on-chain anchoring.</p>
        </header>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          {statCards.map(({ label, value, icon: Icon, delta }) => (
            <Card key={label} className="p-5">
              <div className="flex items-center justify-between mb-4">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#9CA3AF]">{label}</span>
                <Icon className="w-4 h-4 text-[#FFA800]" />
              </div>
              <p className="text-2xl font-bold mb-1 text-[#070707]">{value}</p>
              <p className="text-[10px] text-[#9CA3AF] font-mono truncate">{delta}</p>
            </Card>
          ))}
        </div>

        {/* Submissions */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-[#070707]">Recent Submissions</h2>
          </div>

          {!submission ? (
            <Card className="p-12 flex flex-col items-center gap-4 text-center">
              <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center">
                <Inbox className="w-8 h-8 text-gray-300" />
              </div>
              <p className="text-[#9CA3AF] text-sm">No submissions yet.</p>
              <Button variant="primary" size="md" onClick={() => navigate('/')}>
                Go to Frontier →
              </Button>
            </Card>
          ) : (() => {
            const cfg = getStatusConfig(submission.status || 'submitted');
            const stepIdx = STEP_INDEX[(submission.status || 'submitted').toLowerCase()] ?? 0;
            return (
              <div
                className="cursor-pointer"
                onClick={() => {
                  setSubmission({ ...submission });
                  navigate('/lineage');
                }}
              >
                <Card hover className="p-6 group">
                  <div className="flex items-center justify-between gap-4">
                    {/* Left */}
                    <div className="flex items-center gap-4 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-[rgba(255,168,0,0.10)] flex items-center justify-center shrink-0">
                        <FileUp className="w-5 h-5 text-[#FFA800]" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="font-bold text-sm text-[#070707] truncate">{FRONTIER_NAME}</span>
                          <span className="text-[9px] font-mono text-[#9CA3AF] shrink-0">{submission.id.slice(-8)}</span>
                        </div>
                        {submission.foodName && (
                          <p className="text-sm font-medium text-[#374151] truncate mb-0.5">{submission.foodName}</p>
                        )}
                        <p className="text-xs text-[#9CA3AF]">
                          {TASK_NAME} · Contributor · {new Date(submission.submittedAt).toLocaleString()}
                        </p>
                      </div>
                    </div>

                    {/* Right */}
                    <div className="flex items-center gap-4 shrink-0">
                      <div className="hidden md:flex items-center gap-1.5">
                        {PIPELINE.map((_, i) => (
                          <div
                            key={i}
                            className={`rounded-full transition-all ${
                              i < stepIdx
                                ? 'w-1.5 h-1.5 bg-[#FFA800]'
                                : i === stepIdx
                                ? 'w-2 h-2 bg-[#FFA800] ring-2 ring-[rgba(255,168,0,0.25)]'
                                : 'w-1.5 h-1.5 bg-gray-200'
                            }`}
                          />
                        ))}
                      </div>
                      <div className="flex items-center gap-1.5">
                        {cfg.isUserAction && (
                          <Zap className="w-3 h-3 text-[#FFA800] animate-pulse shrink-0" />
                        )}
                        <div className="flex flex-col items-end gap-0.5">
                          <Badge variant={cfg.variant}>{cfg.label}</Badge>
                          <span className="text-[9px] text-[#9CA3AF] font-mono">{cfg.sublabel}</span>
                        </div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-[#FFA800] transition-colors" />
                    </div>
                  </div>
                </Card>
              </div>
            );
          })()}
        </section>
      </div>
    </main>
  );
}
