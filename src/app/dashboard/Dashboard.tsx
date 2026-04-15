import { useNavigate } from 'react-router-dom';
import { FileUp, BadgeCheck, Link2, Coins, Wallet, ArrowRight, Zap, Inbox } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

// ── Status pipeline ───────────────────────────────────────────────────────────
const PIPELINE = ['submitted', 'validated', 'anchored', 'assetified', 'published'] as const;

const STEP_INDEX: Record<string, number> = {
  submitted: 0,
  validated: 1,
  packaged:  1, // legacy alias
  anchored:  2,
  assetified: 3,
  published: 4,
};

interface NextStepConfig {
  label: string;
  sublabel: string;
  variant: 'orange' | 'blue' | 'gray' | 'green';
  isUserAction: boolean; // true = user must do something (highlighted)
}

const NEXT_STEP_CONFIG: Record<string, NextStepConfig> = {
  submitted:  { label: '待审核',   sublabel: 'Pending Validate',      variant: 'gray',   isUserAction: false },
  validated:  { label: '待上链',   sublabel: 'Anchor On-Chain',       variant: 'orange', isUserAction: true  },
  packaged:   { label: '待上链',   sublabel: 'Anchor On-Chain',       variant: 'orange', isUserAction: true  },
  anchored:   { label: '待发布',   sublabel: 'Pending Publish',        variant: 'blue',   isUserAction: false },
  assetified: { label: '待发布',   sublabel: 'Pending Publish',        variant: 'blue',   isUserAction: false },
  published:  { label: '已完成',   sublabel: 'Published',             variant: 'green',  isUserAction: false },
};

// ── Mock demo data ────────────────────────────────────────────────────────────
const MOCK_STATS = {
  all_count: 3,
  total_submissions: 2,
  on_chained: 1,
  total_rewards: [{ reward_amount: '450', reward_type: 'XNY' }],
  claimable_rewards: [],
};

const MOCK_RECORDS = [
  { submission_id: 'SUB-88242-K', frontier_name: 'Mushroom Image Set', current_status: 'validated',  create_time: 1732110720, task_id: 'TASK-001', template_id: 'MVP_DEMO_TPL', task_type_name: 'Image Annotation', reward_show_name: '150 XNY', foodName: 'Mushroom Image Set' },
  { submission_id: 'SUB-71834-M', frontier_name: 'Cherry Tomato Set',  current_status: 'submitted',  create_time: 1731924900, task_id: 'TASK-001', template_id: 'MVP_DEMO_TPL', task_type_name: 'Image Annotation', reward_show_name: '150 XNY', foodName: 'Cherry Tomato Set'  },
  { submission_id: 'SUB-65210-R', frontier_name: 'Avocado Collection', current_status: 'published',  create_time: 1731660300, task_id: 'TASK-001', template_id: 'MVP_DEMO_TPL', task_type_name: 'Image Annotation', reward_show_name: '150 XNY', foodName: 'Avocado Collection' },
];

export default function Dashboard() {
  const { isLoggedIn, setSubmission } = useApp();
  const navigate = useNavigate();

  const stats = isLoggedIn ? MOCK_STATS : null;
  const records = isLoggedIn ? MOCK_RECORDS : [];

  const totalRewardStr = stats?.total_rewards?.map(r => `${r.reward_amount} ${r.reward_type}`).join(', ') || '—';

  const statCards = [
    {
      label: 'Total Submissions',
      value: stats ? String(stats.all_count) : '—',
      icon: FileUp,
      delta: stats ? `${stats.total_submissions} qualified` : 'Connect wallet to view',
    },
    {
      label: 'Validated',
      value: stats ? String(stats.total_submissions) : '—',
      icon: BadgeCheck,
      delta: stats ? `${stats.all_count - stats.total_submissions} pending` : '—',
    },
    {
      label: 'Anchored On-chain',
      value: stats ? String(stats.on_chained) : '—',
      icon: Link2,
      delta: stats?.on_chained ? 'Token minted' : 'Pending anchor',
    },
    {
      label: 'Reward',
      value: stats ? totalRewardStr : '—',
      icon: Coins,
      delta: stats?.claimable_rewards?.length ? 'Claimable' : 'No claimable rewards',
    },
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

          {!isLoggedIn ? (
            <Card className="p-12 flex flex-col items-center gap-4 text-center">
              <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center">
                <Wallet className="w-8 h-8 text-gray-300" />
              </div>
              <p className="text-[#9CA3AF] text-sm">Connect your wallet to see submissions.</p>
            </Card>
          ) : records.length === 0 ? (
            <Card className="p-12 flex flex-col items-center gap-4 text-center">
              <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center">
                <Inbox className="w-8 h-8 text-gray-300" />
              </div>
              <p className="text-[#9CA3AF] text-sm">No submissions yet.</p>
              <Button variant="primary" size="md" onClick={() => window.location.href = '/'}>
                Go to Frontier →
              </Button>
            </Card>
          ) : (
            <div className="space-y-3">
              {records.map((record) => {
                const cfg = getStatusConfig(record.current_status);
                const stepIdx = STEP_INDEX[(record.current_status || 'submitted').toLowerCase()] ?? 0;
                return (
                  <div key={record.submission_id} className="cursor-pointer" onClick={() => {
                    setSubmission({
                      id: record.submission_id,
                      foodName: record.frontier_name || 'Food Science',
                      foodWeight: '',
                      cookingMethod: '',
                      calories: '',
                      foodImageName: '',
                      foodImageUrl: '',
                      submittedAt: record.create_time ? new Date(record.create_time * 1000).toISOString() : new Date().toISOString(),
                      taskId: record.task_id,
                      templateId: record.template_id,
                      status: record.current_status,
                    });
                    navigate('/lineage');
                  }}>
                    <Card hover className="p-6 group">
                      <div className="flex items-center justify-between gap-4">
                        {/* Left: icon + info */}
                        <div className="flex items-center gap-4 min-w-0">
                          <div className="w-10 h-10 rounded-xl bg-[rgba(255,168,0,0.10)] flex items-center justify-center shrink-0">
                            <FileUp className="w-5 h-5 text-[#FFA800]" />
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-bold text-sm text-[#070707] truncate">{record.frontier_name || 'Food Science'}</span>
                              <span className="text-[9px] font-mono text-[#9CA3AF] shrink-0">{record.submission_id.slice(-8)}</span>
                            </div>
                            <p className="text-xs text-[#6B7280]">
                              {record.task_type_name || 'Contribute'} · {record.reward_show_name || '—'}
                            </p>
                            <p className="text-[10px] text-[#9CA3AF] mt-0.5 font-mono">
                              {record.create_time ? new Date(record.create_time * 1000).toLocaleString() : '—'}
                            </p>
                          </div>
                        </div>

                        {/* Right: progress + next-step badge */}
                        <div className="flex items-center gap-4 shrink-0">
                          {/* Mini progress track (5 dots) */}
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

                          {/* Next step badge */}
                          <div className="flex items-center gap-1.5">
                            {cfg.isUserAction && (
                              <Zap className="w-3 h-3 text-[#FFA800] animate-pulse shrink-0" />
                            )}
                            <div className="flex flex-col items-end gap-0.5">
                              <Badge variant={cfg.variant}>
                                {cfg.label}
                              </Badge>
                              <span className="text-[9px] text-[#9CA3AF] font-mono">{cfg.sublabel}</span>
                            </div>
                          </div>

                          <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-[#FFA800] transition-colors" />
                        </div>
                      </div>
                    </Card>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
