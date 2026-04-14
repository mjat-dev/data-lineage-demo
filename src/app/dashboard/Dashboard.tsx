import { Link } from 'react-router-dom';
import { FileUp, BadgeCheck, Link2, Coins, Wallet, ArrowRight, Inbox } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

export default function Dashboard() {
  const { isLoggedIn, submission, anchored } = useApp();

  const statCards = [
    {
      label: 'Total Submissions',
      value: submission ? '1' : '—',
      icon: FileUp,
      delta: submission ? '1 qualified' : 'Connect wallet to view',
    },
    {
      label: 'Validated',
      value: submission ? '1' : '—',
      icon: BadgeCheck,
      delta: submission ? '+12.00 Points' : '—',
    },
    {
      label: 'Anchored On-chain',
      value: anchored ? '1' : '—',
      icon: Link2,
      delta: anchored ? 'Token minted · ERC-1155' : 'Pending anchor',
    },
    {
      label: 'Reward',
      value: submission ? '+12.00' : '—',
      icon: Coins,
      delta: submission ? 'Points earned' : 'No rewards yet',
    },
  ];

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
          ) : !submission ? (
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
              <Link to="/lineage">
                <Card hover className="p-6 group">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-[rgba(255,168,0,0.10)] flex items-center justify-center shrink-0">
                        <FileUp className="w-5 h-5 text-[#FFA800]" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-bold text-sm text-[#070707]">{submission.foodName}</span>
                          <span className="text-[9px] font-mono text-[#9CA3AF]">{submission.id.slice(-8)}</span>
                        </div>
                        <p className="text-xs text-[#6B7280]">Food Science · {submission.cookingMethod}</p>
                        <p className="text-[10px] text-[#9CA3AF] mt-0.5 font-mono">
                          {new Date(submission.submittedAt).toLocaleString()}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <Badge variant={anchored ? 'orange' : 'gray'}>
                        {anchored ? 'Anchored' : 'Submitted'}
                      </Badge>
                      <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-[#FFA800] transition-colors" />
                    </div>
                  </div>
                </Card>
              </Link>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
