import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FileText, CheckCircle2, Link2, Package, Globe,
  User, ChevronDown, Plus, Sparkles, Coins,
  Store, History, PieChart, ArrowRight, ExternalLink,
  X, AlertTriangle, Info, Copy, GitBranch,
} from 'lucide-react';
import AnchorModal from '@/components/features/AnchorModal';
import { useApp } from '@/context/AppContext';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { formatDate } from '@/lib/utils';


// ── Hover Popover ─────────────────────────────────────────────────────────────
function HoverPopover({ children, content, align = 'left', direction = 'down' }: { children: React.ReactNode; content: React.ReactNode; align?: 'left' | 'right'; direction?: 'up' | 'down' }) {
  const [show, setShow] = useState(false);
  return (
    <span className="relative inline-block" onMouseEnter={() => setShow(true)} onMouseLeave={() => setShow(false)}>
      {children}
      {show && (
        <div className={`absolute ${direction === 'up' ? 'bottom-full mb-2' : 'top-full mt-2'} z-50 ${align === 'right' ? 'right-0' : 'left-0'}`}
          style={{ filter: 'drop-shadow(0 8px 24px rgba(0,0,0,0.10))' }}>
          {content}
        </div>
      )}
    </span>
  );
}

// ── Identity Chip ─────────────────────────────────────────────────────────────
function IdentityChip({ handle, role, did, wallet }: { handle: string; role?: string; did?: string; wallet?: string }) {
  const card = (
    <div className="bg-white rounded-xl p-4 w-56 text-left border border-gray-100 shadow-[0_4px_12px_rgba(0,0,0,0.08)]">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-8 h-8 rounded-full bg-[rgba(255,168,0,0.10)] flex items-center justify-center shrink-0">
          <User className="w-4 h-4 text-[#FFA800]" />
        </div>
        <div>
          <p className="text-xs font-bold text-[#070707]">{handle}</p>
          {role && <p className="text-[10px] text-[#9CA3AF]">{role}</p>}
        </div>
      </div>
      {did && <div className="mb-2"><p className="text-[9px] uppercase text-[#9CA3AF] font-bold tracking-wider mb-0.5">DID</p><p className="text-[10px] font-mono text-[#FFA800] break-all">{did}</p></div>}
      {wallet && <div><p className="text-[9px] uppercase text-[#9CA3AF] font-bold tracking-wider mb-0.5">Wallet</p><p className="text-[10px] font-mono text-[#6B7280]">{wallet}</p></div>}
    </div>
  );
  return (
    <HoverPopover content={card}>
      <span className="font-bold text-[#FFA800] cursor-default border-b border-dashed border-[#FFA800]/40 hover:border-[#FFA800] transition-colors pb-0.5">{handle}</span>
    </HoverPopover>
  );
}

// ── Asset Chip ────────────────────────────────────────────────────────────────
function AssetChip({ name, assetId }: { name: string; assetId: string }) {
  const popover = (
    <div className="bg-white rounded-xl p-5 w-80 text-left border border-gray-100 shadow-[0_4px_12px_rgba(0,0,0,0.08)]">
      <p className="text-[9px] uppercase font-bold text-[#FFA800] tracking-widest mb-3">Composition Logic</p>
      <div className="bg-gray-50 rounded-xl p-3 relative border border-gray-100 mb-1.5">
        <span className="absolute top-2 left-3 text-[9px] text-[#FFA800] font-bold opacity-50">X</span>
        <div className="flex items-start justify-between pt-3">
          <div><p className="text-xs font-bold text-[#070707]">Mushroom Image Set</p><p className="text-[10px] text-[#FFA800] font-mono">@chef_kenshiro</p></div>
          <span className="text-[8px] font-bold bg-gray-100 px-2 py-0.5 rounded text-[#9CA3AF] shrink-0 ml-2">RAW DATA</span>
        </div>
      </div>
      <div className="flex justify-center text-gray-300 my-1"><Plus className="w-4 h-4" /></div>
      <div className="bg-gray-50 rounded-xl p-3 relative border border-gray-100 mb-1.5">
        <span className="absolute top-2 left-3 text-[9px] text-[#3474FE] font-bold opacity-50">Y</span>
        <div className="flex items-start justify-between pt-3">
          <div><p className="text-xs font-bold text-[#070707]">Grade S Validation</p><p className="text-[10px] text-[#9CA3AF]">By Codatta QA Admin</p></div>
          <span className="text-[8px] font-bold bg-gray-100 px-2 py-0.5 rounded text-[#9CA3AF] shrink-0 ml-2">VALIDATED</span>
        </div>
      </div>
      <div className="flex justify-center text-gray-300 my-1"><span className="text-sm font-bold">=</span></div>
      <div className="bg-[rgba(255,168,0,0.06)] rounded-xl p-3 border border-[rgba(255,168,0,0.15)] mb-4">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-lg bg-[rgba(255,168,0,0.10)] flex items-center justify-center shrink-0">
            <Sparkles className="w-4 h-4 text-[#FFA800]" />
          </div>
          <div>
            <p className="text-[8px] uppercase text-[#FFA800]/50 font-bold">Final Asset</p>
            <p className="text-xs font-bold text-[#070707]">{name}</p>
            <p className="text-[9px] font-mono text-[#9CA3AF]">{assetId}</p>
          </div>
        </div>
      </div>
      <div className="border-t border-gray-100 pt-3">
        <p className="text-[9px] uppercase font-bold text-[#9CA3AF] tracking-widest mb-2">Initial Ownership Summary</p>
        {[
          { role: 'Contributor', handle: '@chef_kenshiro', pct: 40, color: '#FFA800' },
          { role: 'Validator', handle: 'Codatta QA Admin', pct: 25, color: '#3474FE' },
          { role: 'Initial Staker', handle: '@alpha_backer', pct: 25, color: '#9CA3AF' },
          { role: 'Protocol Treasury', handle: null, pct: 10, color: '#6B7280' },
        ].map(({ role, handle, pct, color }) => (
          <div key={role} className="flex items-center justify-between py-1">
            <div className="flex items-center gap-1.5 min-w-0">
              <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: color }} />
              <span className="text-[10px] text-[#6B7280] shrink-0">{role}</span>
              {handle && <span className="text-[10px] font-mono text-[#FFA800] ml-1">· {handle}</span>}
            </div>
            <span className="text-[10px] font-bold ml-2 shrink-0 text-[#070707]">{pct}%</span>
          </div>
        ))}
      </div>
    </div>
  );
  return (
    <HoverPopover content={popover} direction="up">
      <span className="px-3 py-1 rounded-xl border border-[rgba(255,168,0,0.30)] bg-[rgba(255,168,0,0.08)] text-[#FFA800] text-xs font-bold cursor-default hover:bg-[rgba(255,168,0,0.12)] transition-all inline-flex items-center gap-1.5">
        <Package className="w-3 h-3" />{name}
      </span>
    </HoverPopover>
  );
}

// ── Node Wrapper ──────────────────────────────────────────────────────────────
function NodeWrapper({ icon: Icon, iconActive = false, children, connector = true }: { icon: React.ElementType; iconActive?: boolean; children: React.ReactNode; connector?: boolean }) {
  return (
    <div className="mb-14 relative pl-16">
      {connector && <div className="timeline-connector absolute left-[23px] top-10 bottom-0 w-[2px]" />}
      <div className={`absolute left-0 top-0 w-10 h-10 rounded-full bg-white flex items-center justify-center z-10 transition-shadow ${iconActive ? 'shadow-[0_0_0_2px_rgba(7,7,7,0.12)] shadow-[0_2px_8px_rgba(0,0,0,0.08)]' : 'shadow-[0_1px_3px_rgba(0,0,0,0.06)]'}`}>
        <Icon className={`w-5 h-5 ${iconActive ? 'text-[#070707]' : 'text-gray-300'}`} />
      </div>
      {children}
    </div>
  );
}

// ── Collapsible Card ──────────────────────────────────────────────────────────
function CollapsibleCard({ title, badge, badgeVariant, timestamp, defaultOpen = true, children }: {
  title: string; badge?: string; badgeVariant?: 'orange' | 'blue' | 'gray'; timestamp?: string; defaultOpen?: boolean; children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <Card className="p-0 transition-shadow hover:shadow-[0_4px_12px_rgba(0,0,0,0.06)]">
      <button onClick={() => setOpen(o => !o)} className="w-full flex items-center justify-between p-6 hover:bg-gray-50 transition-colors rounded-2xl text-left">
        <div className="flex flex-col items-start gap-2">
          <h3 className="text-xl font-bold text-[#070707]">{title}</h3>
          {badge && <Badge variant={badgeVariant ?? 'gray'}>{badge}</Badge>}
        </div>
        <div className="flex items-center gap-4 shrink-0 ml-4">
          {timestamp && <span className="text-[10px] font-mono text-[#9CA3AF]">{timestamp}</span>}
          <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`} />
        </div>
      </button>
      {open && <div className="px-6 pb-6">{children}</div>}
    </Card>
  );
}

// ── Metadata Drawer ───────────────────────────────────────────────────────────
function MetadataDrawer({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="w-80 bg-white border-r border-gray-100 h-full overflow-y-auto p-6 shadow-[4px_0_24px_rgba(0,0,0,0.08)]">
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-[10px] uppercase text-[#FFA800] font-bold tracking-widest mb-1">Node 1 · Off-chain</p>
            <p className="text-base font-bold text-[#070707]">Storage &amp; Metadata</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="space-y-3">
          {[
            { label: 'Storage Type', value: 'IPFS + Codatta Off-chain' },
            { label: 'Object Hash', value: 'Qm3k7...f9a2' },
            { label: 'DID Snapshot', value: 'did:codatta:sub_882...' },
          ].map(({ label, value }) => (
            <div key={label} className="bg-gray-50 rounded-xl p-3">
              <p className="text-[9px] uppercase text-[#9CA3AF] font-bold tracking-wider mb-1">{label}</p>
              <p className="text-xs font-mono text-[#6B7280]">{value}</p>
            </div>
          ))}
          <div className="bg-[rgba(255,168,0,0.06)] border border-[rgba(255,168,0,0.15)] rounded-xl p-3 mt-4">
            <p className="text-[9px] uppercase text-[#FFA800]/60 font-bold tracking-wider mb-1">Note</p>
            <p className="text-xs text-[#6B7280] leading-relaxed">
              Off-chain storage completes identity binding and DID snapshot registration. On-chain record begins from Node 3 (Anchor on-chain).
            </p>
          </div>
        </div>
      </div>
      <div className="flex-1 bg-black/20 backdrop-blur-sm" onClick={onClose} />
    </div>
  );
}

// ── Circulation Log (unused export kept for reference) ────────────────────────
function _CirculationLog() {
  const [expanded, setExpanded] = useState<number | null>(null);
  const events = [
    { id: 0, time: '2025-11-22 10:00', type: 'Listing', title: 'Listed on Marketplace', fromLabel: null, fromDid: null, toLabel: 'Data Marketplace #42', toDid: null, share: '100%', tx: null },
    { id: 1, time: '2025-11-23 14:15', type: 'Purchase', title: '15% share purchased by Backer A', fromLabel: 'Initial Staker · @alpha_backer', fromDid: 'did:codatta:initial_staker_01', toLabel: 'Backer A', toDid: 'did:codatta:backer_a', share: '15%', tx: '0xa13f...92bd' },
    { id: 2, time: '2025-11-24 09:42', type: 'Transfer', title: '5% Contributor → Backer B', fromLabel: 'Contributor · @chef_kenshiro', fromDid: 'did:codatta:chef_kenshiro', toLabel: 'Backer B', toDid: 'did:codatta:backer_b', share: '5%', tx: '0x7cc4...1ab9' },
    { id: 3, time: '2025-11-24 18:00', type: 'Payout', title: 'Reward distributed to Contributor', fromLabel: null, fromDid: null, toLabel: 'Contributor · @chef_kenshiro', toDid: 'did:codatta:chef_kenshiro', share: '40 XNY', tx: '0xf113...90de' },
  ];
  const typeBadge: Record<string, 'orange' | 'blue' | 'gray' | 'green'> = { Listing: 'orange', Purchase: 'blue', Transfer: 'gray', Payout: 'green' };
  return (
    <div className="space-y-2">
      {events.map(evt => (
        <div key={evt.id} className="rounded-xl border border-gray-100 overflow-hidden bg-white">
          <button onClick={() => setExpanded(expanded === evt.id ? null : evt.id)}
            className="w-full flex items-start gap-3 p-3 hover:bg-gray-50 transition-colors text-left">
            <div className="shrink-0 mt-1.5">
              <div className={`w-2 h-2 rounded-full ${evt.type === 'Payout' || evt.type === 'Purchase' ? 'bg-[#FFA800]' : 'border border-[#FFA800]/40 bg-white'}`} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-mono text-[#9CA3AF]">{evt.time}</span>
                <Badge variant={typeBadge[evt.type]}>{evt.type}</Badge>
              </div>
              <p className="text-xs font-bold text-[#070707] mb-1">{evt.title}</p>
              <div className="flex items-center gap-1.5 flex-wrap">
                {evt.fromLabel && <><span className="text-[10px] font-mono text-[#9CA3AF]">{evt.fromLabel}</span><ArrowRight className="w-3 h-3 text-gray-300" /></>}
                <span className="text-[10px] font-mono text-[#FFA800]">{evt.toLabel}</span>
                <span className="text-[10px] font-bold text-[#6B7280]">· {evt.share}</span>
              </div>
            </div>
            <ChevronDown className={`w-4 h-4 text-gray-400 shrink-0 transition-transform mt-1 ${expanded === evt.id ? 'rotate-180' : ''}`} />
          </button>
          {expanded === evt.id && (
            <div className="px-4 pb-4 pt-2 border-t border-gray-100 bg-gray-50 space-y-3">
              {evt.fromLabel && <div><p className="text-[9px] uppercase text-[#9CA3AF] font-bold tracking-wider mb-1">From</p><p className="text-xs font-medium text-[#070707]">{evt.fromLabel}</p><p className="text-[10px] font-mono text-[#FFA800]">{evt.fromDid}</p></div>}
              <div><p className="text-[9px] uppercase text-[#9CA3AF] font-bold tracking-wider mb-1">{evt.type === 'Payout' ? 'Receiver' : 'To'}</p><p className="text-xs font-medium text-[#070707]">{evt.toLabel}</p>{evt.toDid && <p className="text-[10px] font-mono text-[#FFA800]">{evt.toDid}</p>}</div>
              <div className="flex items-center justify-between">
                <div><p className="text-[9px] uppercase text-[#9CA3AF] font-bold tracking-wider mb-1">{evt.type === 'Payout' ? 'Amount' : 'Share'}</p><p className="text-xs font-bold text-[#070707]">{evt.share}</p></div>
                {evt.tx && (
                  <a href={`https://etherscan.io/tx/${evt.tx}`} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-[rgba(255,168,0,0.08)] border border-[rgba(255,168,0,0.20)] rounded-xl text-[#FFA800] text-[11px] font-mono hover:bg-[rgba(255,168,0,0.12)] transition-colors">
                    {evt.tx} <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function DataLineage() {
  const { submission, anchored, setAnchored, walletAddress } = useApp();
  const [showAnchorModal, setShowAnchorModal] = useState(false);
  const [showAnchorDetails, setShowAnchorDetails] = useState(false);
  const [showMetadata, setShowMetadata] = useState(false);
  const [circulationOpen, setCirculationOpen] = useState(true);
  const [ownershipOpen, setOwnershipOpen] = useState(true);
  const [copied, setCopied] = useState<string | null>(null);

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 1500);
  };

  const subId = submission?.id || 'SUB-88242-K';
  const foodTitle = submission?.foodName || 'Mushroom Image Set';
  const subDate = submission?.submittedAt
    ? formatDate(submission.submittedAt) + ' ' + new Date(submission.submittedAt).toTimeString().slice(0, 5)
    : '2025-11-20 14:32';
  const walletAddr = walletAddress || '0x3a4f...9c21';

  return (
    <main className="pt-24 pb-20 bg-[#F5F5F5]">
      <div className="max-w-5xl mx-auto px-8">

        {/* Breadcrumb */}
        {submission && (
          <div className="flex items-center gap-2 text-xs text-[#9CA3AF] mb-8">
            <span className="text-[#6B7280]">Data Lineage</span>
            <span>/</span>
            <span className="text-[#FFA800] font-mono">{subId}</span>
          </div>
        )}

        {/* Header */}
        <header className="mb-12">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-2">
              <p className="text-[#9CA3AF] text-[10px] font-bold uppercase tracking-[0.2em]">Architecture / Flow</p>
              <h1 className="text-4xl font-bold tracking-tight text-[#070707]">Data Lineage</h1>
              <p className="text-[#6B7280] text-sm">Contribution details and ownership flow tracking.</p>
            </div>
            {submission && (
              <div className="flex flex-wrap gap-3">
                <Card className="px-4 py-2 flex items-center gap-3">
                  <span className="text-[10px] text-[#FFA800] font-bold uppercase">Status</span>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#22C55E] animate-pulse" />
                    <span className="text-sm font-medium text-[#070707]">Active / Published</span>
                  </div>
                </Card>
                <Card className="px-4 py-2 flex items-center gap-3">
                  <span className="text-[10px] text-[#FFA800] font-bold uppercase">ID</span>
                  <span className="text-sm font-mono text-[#070707]">{subId}</span>
                </Card>
              </div>
            )}
          </div>
        </header>



        {/* Empty state */}
        {!submission && (
          <div className="flex flex-col items-center justify-center py-28 text-center">
            <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mb-5">
              <GitBranch className="w-7 h-7 text-gray-300" />
            </div>
            <h2 className="text-xl font-bold text-[#070707] mb-2">No submission on record</h2>
            <p className="text-sm text-[#9CA3AF] max-w-xs leading-relaxed">Submit a data contribution on the Frontier page to start tracking its provenance here.</p>
            <Link to="/" className="mt-6 inline-block px-5 py-2.5 bg-[#070707] hover:bg-[#1A1A1A] rounded-xl text-white text-sm font-bold transition-colors">
              Go to Frontier
            </Link>
          </div>
        )}

        {/* Timeline */}
        {submission && <div className="relative">
          <div className="timeline-connector absolute left-[23px] top-0 bottom-0 w-[2px]" />

          {/* ── Node 1: Submission ──────────────────────────────────────── */}
          <NodeWrapper icon={FileText}>
            <CollapsibleCard title={foodTitle} badge="Submission Assembled" badgeVariant="orange" timestamp={subDate}>
              <div className="flex items-center gap-3 mb-5">
                <div className="w-8 h-8 rounded-full bg-[rgba(255,168,0,0.10)] flex items-center justify-center shrink-0">
                  <User className="w-4 h-4 text-[#FFA800]" />
                </div>
                <p className="text-sm text-[#070707]">
                  Contributor{' '}
                  <IdentityChip handle={walletAddr} role="Contributor" did="did:codatta:contributor" wallet={walletAddr} />{' '}
                  submitted to <span className="text-[#6B7280]">Nutritional Analysis · Image 2 Text</span>
                </p>
              </div>
              <p className="text-sm text-[#6B7280] mb-6 leading-relaxed">
                Data received and registered. Platform has written to off-chain object storage with DID binding snapshot.
              </p>
              <div className="flex items-center gap-4">
                <button onClick={() => setShowMetadata(true)}
                  className="bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-xl flex items-center gap-2 text-sm font-medium text-[#070707] transition-colors">
                  <Package className="w-4 h-4 text-[#FFA800]" /> Storage &amp; Metadata
                </button>
              </div>
            </CollapsibleCard>
          </NodeWrapper>

          {/* ── Node 2: Validation ──────────────────────────────────────── */}
          <NodeWrapper icon={CheckCircle2} iconActive>
            <CollapsibleCard title="Validation" badge="Validation Passed" badgeVariant="blue" timestamp="2025-11-21 09:15">
              <p className="text-sm text-[#6B7280] mb-5">Data quality meets protocol standards. Validation level and validator identity recorded on-chain.</p>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-[9px] uppercase text-[#FFA800] font-bold tracking-widest mb-1">Validation Level</p>
                  <p className="text-lg font-bold text-[#070707]">Grade S</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-4 md:col-span-2">
                  <p className="text-[9px] uppercase text-[#9CA3AF] font-bold tracking-widest mb-2">Review Agent</p>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg bg-[rgba(255,168,0,0.10)] flex items-center justify-center shrink-0">
                      <Sparkles className="w-3.5 h-3.5 text-[#FFA800]" />
                    </div>
                    <span className="text-sm font-semibold text-[#070707]">Claude Sonnet 4.6</span>
                    <span className="text-[10px] text-[#9CA3AF] font-mono">· Anthropic</span>
                  </div>
                  <p className="text-[10px] text-[#9CA3AF] mt-2 leading-relaxed">AI model used to assess image quality, label accuracy, and nutritional data consistency.</p>
                </div>
              </div>
            </CollapsibleCard>
          </NodeWrapper>

          {/* ── Node 3: Anchor on-chain ─────────────────────────────────── */}
          <NodeWrapper icon={Link2} iconActive={anchored}>
            <CollapsibleCard
              title="Anchor on-chain"
              badge={anchored ? 'Anchored · 0xa13f...92bd' : 'Ready to Anchor'}
              badgeVariant={anchored ? 'orange' : 'gray'}
              timestamp="2025-11-21 16:40"
            >
              {!anchored ? (
                <div className="bg-gray-50 rounded-2xl p-6 relative overflow-hidden">
                  <div className="absolute right-0 top-0 w-32 h-32 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" style={{ background: 'rgba(255,168,0,0.08)' }} />
                  <div className="relative z-10">
                    <h4 className="text-lg font-bold text-[#070707] mb-2">Anchor Your Contribution Data</h4>
                    <p className="text-sm text-[#9CA3AF] mb-1">User data on-chain · Permanent record</p>
                    <p className="text-sm text-[#6B7280] mb-5 max-w-md">Anchor your contribution to the blockchain to create a tamper-proof on-chain record of your data. This is required before your data can be included in the frontier dataset asset.</p>

                    <div className="bg-white border border-gray-200 rounded-xl p-4 mb-6">
                      <p className="text-[10px] font-bold uppercase text-[#9CA3AF] tracking-wider mb-3">Without anchoring, your data cannot enter the asset pipeline</p>
                      <div className="space-y-2 text-xs text-[#6B7280]">
                        {['No on-chain proof of contribution', 'Cannot be included in dataset bundle', 'No share in frontier dataset ownership'].map(t => (
                          <div key={t} className="flex items-center gap-2"><X className="w-3.5 h-3.5 text-[#EF4444]" />{t}</div>
                        ))}
                        <div className="border-t border-gray-100 pt-2 mt-2 space-y-1.5">
                          {['Permanent on-chain data provenance record', 'Eligible for dataset assetification (Step 04)', 'Eligible for ownership share distribution'].map(t => (
                            <div key={t} className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-[#22C55E]" /><span className="text-[#070707]">{t}</span></div>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 mb-8 text-sm">
                      {['Verifiable History', 'Immutable Record', 'Data Provenance', 'Traceability'].map(f => (
                        <div key={f} className="flex items-center gap-2 text-[#6B7280]">
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#FFA800]" />{f}
                        </div>
                      ))}
                    </div>

                    <div className="flex items-center justify-between border-t border-gray-200 pt-5">
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-3.5 h-3.5 text-[#FDA829]" />
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs text-[#9CA3AF] line-through font-mono">~0.0002 ETH</span>
                          <span className="text-sm font-bold text-[#5DDD22]">0 XNY</span>
                        </div>
                        <span className="text-[10px] text-[#9CA3AF]">Gas sponsored by platform</span>
                      </div>
                      <Button variant="primary" size="lg" onClick={() => setShowAnchorModal(true)}>
                        Start Anchoring →
                      </Button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center gap-1.5 text-[11px] text-[#9CA3AF]">
                    <Info className="w-3.5 h-3.5" />
                    <span>Generates a tamper-proof fingerprint (CF)</span>
                  </div>
                  <p className="text-sm text-[#070707]">
                    <span className="font-semibold">Codatta Platform</span> anchored your submission on{' '}
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-100 rounded-lg text-xs font-bold text-[#070707]">
                      <Globe className="w-3 h-3" /> Base
                    </span>
                  </p>
                  <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                    <p className="text-[10px] font-bold uppercase text-[#9CA3AF] tracking-wider mb-2">Contribution Fingerprint (CF)</p>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs text-[#070707] truncate flex-1">0x12ab34cd56ef7890aa11bb22cc33dd44ee55ff02</span>
                      <button onClick={() => copyToClipboard('0x12ab34cd56ef7890aa11bb22cc33dd44ee55ff02', 'cf-node')}
                        className="shrink-0 p-1.5 rounded-lg hover:bg-gray-200 transition-colors">
                        {copied === 'cf-node' ? <CheckCircle2 className="w-3.5 h-3.5 text-[#22C55E]" /> : <Copy className="w-3.5 h-3.5 text-[#6B7280]" />}
                      </button>
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <button onClick={() => setShowAnchorDetails(true)}
                      className="px-4 py-2 bg-[#070707] hover:bg-[#1A1A1A] rounded-xl text-white text-xs font-bold transition-colors">
                      Details
                    </button>
                  </div>
                </div>
              )}
            </CollapsibleCard>
          </NodeWrapper>

          {/* ── Node 4: Assetification ──────────────────────────────────── */}
          <NodeWrapper icon={Package} iconActive={anchored}>
            <CollapsibleCard
              title="Assetification"
              badge={anchored ? 'Dataset Asset On-chain · v1.0.2' : 'Pending Anchor'}
              badgeVariant={anchored ? 'orange' : 'gray'}
            >
              {!anchored ? (
                <div className="space-y-5">
                  <p className="text-sm text-[#6B7280] leading-relaxed">
                    After your data is anchored on-chain, it will be bundled into the frontier dataset asset. The dataset is uploaded to HuggingFace and a version number is recorded back on-chain.
                  </p>

                  <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                    <p className="text-[10px] font-bold uppercase text-[#9CA3AF] tracking-wider mb-3">Assetification Pipeline (unlocks after Step 03)</p>
                    <div className="space-y-3 text-xs text-[#6B7280]">
                      {[
                        { step: '①', label: 'Bundle frontier dataset on-chain', done: false },
                        { step: '②', label: 'Upload dataset to HuggingFace', done: false },
                        { step: '③', label: 'Record HuggingFace version hash on-chain', done: false },
                      ].map(({ step, label, done }) => (
                        <div key={step} className="flex items-center gap-2.5">
                          <span className="text-[11px] font-bold text-[#9CA3AF] shrink-0 w-4">{step}</span>
                          <span className={done ? 'text-[#22C55E] line-through' : 'text-[#9CA3AF]'}>{label}</span>
                        </div>
                      ))}
                    </div>
                    <p className="text-[10px] text-[#9CA3AF] mt-3 italic">Complete Step 03 to trigger assetification.</p>
                  </div>

                </div>
              ) : (
                <div className="space-y-4">
                  {/* Asset chip + HuggingFace link */}
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm text-[#070707]">Dataset Asset:</p>
                    <AssetChip name="Food-Science-Asset-42" assetId="asset_882_v1" />
                    <p className="text-sm text-[#9CA3AF]">published to</p>
                    <a href="https://huggingface.co/datasets/Codatta/MM-Food-100K" target="_blank" rel="noopener noreferrer"
                      className="px-3 py-1 rounded-xl border border-gray-200 bg-white text-[#070707] text-xs font-bold hover:border-[#FFA800]/40 hover:text-[#FFA800] transition-colors inline-flex items-center gap-1">
                      Codatta/MM-Food-100K <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>

                  {/* Pipeline steps — all completed */}
                  <div className="bg-gray-50 border border-[rgba(34,197,94,0.15)] rounded-xl p-4">
                    <p className="text-[10px] font-bold uppercase text-[#9CA3AF] tracking-wider mb-3">Assetification Pipeline · Completed</p>
                    <div className="space-y-2 text-xs mb-4">
                      {[
                        'Frontier dataset bundled on-chain',
                        'Dataset uploaded to HuggingFace',
                        'Version hash recorded on-chain',
                      ].map((label) => (
                        <div key={label} className="flex items-center gap-2.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#22C55E] shrink-0" />
                          <span className="text-[#070707]">{label}</span>
                        </div>
                      ))}
                    </div>
                    <div className="border-t border-gray-100 pt-3 space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-[#9CA3AF]">On-chain Tx</span>
                        <a href="https://etherscan.io/tx/0xd94e" target="_blank" rel="noopener noreferrer"
                          className="font-mono text-[#FDA829] hover:underline flex items-center gap-1 text-[10px]">
                          0xd94e...7f3a <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-[#9CA3AF]">HuggingFace Version</span>
                        <span className="font-bold text-[#070707] font-mono">v1.0.2</span>
                      </div>
                    </div>
                  </div>
                  <p className="text-[11px] text-[#9CA3AF] italic">Hover the asset chip to view dataset composition and ownership summary.</p>
                </div>
              )}
            </CollapsibleCard>
          </NodeWrapper>

          {/* ── Node 5: Publication & Circulation ──────────────────────── */}
          <NodeWrapper icon={Globe} iconActive={anchored} connector={false}>
            <div className="space-y-4">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#9CA3AF]">Step 05</span>
                <h3 className="text-xl font-bold text-[#070707]">Publish</h3>
              </div>
              <p className="text-sm text-[#6B7280] mb-4">
                {anchored ? 'Dataset asset published on-chain. Ownership shares can be transferred via ERC-1155 protocol.' : 'Dataset will be published after assetification is complete. Anchor your data to participate.'}
              </p>

              {/* Marketplace Entry */}
              <Card className="overflow-hidden opacity-60 p-0">
                <div className="w-full flex items-center justify-between p-4 bg-gray-50 border-b border-gray-100">
                  <div className="flex items-center gap-3">
                    <Store className="w-4 h-4 text-gray-400" />
                    <span className="text-sm font-bold uppercase tracking-wider text-gray-400">Marketplace Entry</span>
                  </div>
                  <Badge variant="gray">Coming Soon</Badge>
                </div>
                <div className="p-5">
                  <p className="text-xs text-[#9CA3AF]">Data marketplace contract is under development. Asset fractions can currently be transferred directly via ERC-1155 protocol through private agreement.</p>
                </div>
              </Card>

              {/* Circulation Log */}
              <Card className="overflow-hidden p-0">
                <button onClick={() => setCirculationOpen(o => !o)}
                  className="w-full flex items-center justify-between p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <History className="w-4 h-4 text-[#FFA800]" />
                    <span className="text-sm font-bold uppercase tracking-wider text-[#070707]">Circulation Log</span>
                  </div>
                  <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${circulationOpen ? 'rotate-180' : ''}`} />
                </button>
                {circulationOpen && (
                  <div className="p-5">
                    {!anchored && (
                      <div className="mb-5 p-3 rounded-xl bg-gray-50 border border-gray-200 text-xs text-[#6B7280] flex items-start gap-2">
                        <Info className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
                        <span>Other contributors who have anchored their data can earn royalties when their ownership tokens are transferred or traded. Anchor your data in Step 03 to participate.</span>
                      </div>
                    )}
                    <div className="space-y-8 relative pl-6 border-l border-gray-200">
                      {[
                        ...(anchored ? [
                          { id: 'you-mint', time: '2025-11-25 11:30', type: 'Mint', title: 'ERC-1155 tokens minted to You', desc: 'Your 65 ownership tokens minted to your wallet.', from: null, to: '@chef_kenshiro (You)', share: '65 tokens', tx: '0xd94e...7f3a', highlight: true },
                          { id: 'backer-a', time: '2025-11-27 14:15', type: 'Transfer', title: 'Backer A purchased 10 tokens', desc: 'ERC-1155 direct transfer via wallet.', from: '@alpha_backer', to: 'Backer A', share: '10 tokens', tx: '0xa13f...92bd', highlight: false },
                          { id: 'backer-b', time: '2025-11-28 09:42', type: 'Transfer', title: 'Backer B purchased 5 tokens', desc: 'ERC-1155 direct transfer via wallet.', from: '@alpha_backer', to: 'Backer B', share: '5 tokens', tx: '0x7cc4...1ab9', highlight: false },
                        ] : [
                          { id: 'backer-a-pre', time: '2025-11-23 14:15', type: 'Transfer', title: 'Backer A purchased 10 tokens', desc: 'ERC-1155 direct transfer via wallet. You cannot trade your share until you anchor on-chain.', from: '@other_contributor', to: 'Backer A', share: '10 tokens', tx: '0xa13f...92bd', highlight: false },
                          { id: 'backer-b-pre', time: '2025-11-24 09:42', type: 'Transfer', title: 'Backer B purchased 5 tokens', desc: 'ERC-1155 direct transfer via wallet.', from: '@other_contributor', to: 'Backer B', share: '5 tokens', tx: '0x7cc4...1ab9', highlight: false },
                        ]),
                      ].map((evt) => (
                        <div key={evt.id} className="relative">
                          <div className={`absolute -left-[30px] top-1 w-4 h-4 rounded-full border-2 ${evt.highlight ? 'bg-[#FDA829] border-[#FDA829]' : 'bg-white border-gray-300'}`} />
                          <div className="space-y-2">
                            <div className="flex items-center gap-2 text-[11px]">
                              <span className="font-mono text-[#9CA3AF]">{evt.time}</span>
                              <Badge variant={evt.type === 'Transfer' ? 'blue' : 'orange'}>{evt.type}</Badge>
                            </div>
                            <p className="text-sm font-bold text-[#111827]">{evt.title}</p>
                            <p className="text-xs text-[#9CA3AF]">{evt.desc}</p>
                            <div className={`p-3 rounded-xl border text-[11px] grid grid-cols-2 md:grid-cols-4 gap-3 ${evt.highlight ? 'bg-[rgba(253,168,41,0.06)] border-[rgba(253,168,41,0.15)]' : 'bg-gray-50 border-gray-100'}`}>
                              {evt.from && <div><span className="text-[#9CA3AF] uppercase block mb-0.5 text-[9px]">From</span><span className="font-bold text-[#6B7280] truncate block">{evt.from}</span></div>}
                              <div><span className="text-[#9CA3AF] uppercase block mb-0.5 text-[9px]">To</span><span className="font-bold text-[#6B7280] truncate block">{evt.to}</span></div>
                              <div><span className="text-[#9CA3AF] uppercase block mb-0.5 text-[9px]">Share</span><span className="font-bold text-[#111827]">{evt.share}</span></div>
                              {evt.tx && <div><span className="text-[#9CA3AF] uppercase block mb-0.5 text-[9px]">Tx Hash</span><a href={`https://etherscan.io/tx/${evt.tx}`} target="_blank" rel="noopener noreferrer" className="text-[#3474FE] hover:underline flex items-center gap-1">{evt.tx} <ExternalLink className="w-3 h-3" /></a></div>}
                            </div>
                            {/* Prominent claim button for user's own mint */}
                            {evt.id === 'you-mint' && (
                              <a href="https://basescan.org/address/0xfdbf" target="_blank" rel="noopener noreferrer"
                                className="mt-1 w-full py-2.5 bg-[#FDA829] hover:bg-[#E89B20] active:bg-[#D08A10] text-white font-bold text-sm rounded-xl flex items-center justify-center gap-2 transition-colors">
                                <Coins className="w-4 h-4" />
                                Claim My 65 Tokens →
                              </a>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>

                    {!anchored && (
                      <div className="mt-6 flex items-center gap-3 p-4 rounded-xl bg-[rgba(255,168,0,0.06)] border border-[rgba(255,168,0,0.15)]">
                        <AlertTriangle className="w-5 h-5 text-[#FFA800] shrink-0" />
                        <p className="flex-1 text-xs text-[#6B7280]">Others are minting and trading tokens. You cannot trade your share until you anchor on-chain.</p>
                        <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                          className="shrink-0 px-4 py-2 border border-[rgba(255,168,0,0.30)] rounded-xl text-[#FFA800] text-xs font-bold hover:bg-[rgba(255,168,0,0.08)] transition-colors">
                          ← Step 03
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </Card>

              {/* Current Ownership */}
              <Card className="overflow-hidden p-0">
                <button onClick={() => setOwnershipOpen(o => !o)}
                  className="w-full flex items-center justify-between p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <PieChart className="w-4 h-4 text-[#FFA800]" />
                    <span className="text-sm font-bold uppercase tracking-wider text-[#070707]">Current Ownership Snapshot</span>
                  </div>
                  <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${ownershipOpen ? 'rotate-180' : ''}`} />
                </button>
                {ownershipOpen && (
                  <div className="p-5">
                    {[
                      ...(anchored ? [{ label: 'You · @chef_kenshiro', did: 'Contributor', percent: 65, color: '#FFA800' }] : []),
                      { label: 'Protocol Validator', did: 'Validator', percent: 25, color: '#3474FE' },
                      { label: 'Protocol Treasury', did: 'Treasury', percent: 10, color: '#9CA3AF' },
                      ...(!anchored ? [{ label: 'You (unanchored)', did: 'Contributor', percent: 0, color: '#E5E7EB' }] : []),
                    ].map(({ label, did, percent, color }) => (
                      <div key={did} className="flex items-center justify-between py-3 px-2 rounded-xl even:bg-gray-50">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0"
                            style={{ background: `${color}22`, color }}>
                            {label.slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <p className="text-xs font-bold text-[#070707]">{label}</p>
                            <p className="text-[9px] font-mono text-[#9CA3AF]">{did}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4 shrink-0">
                          <div className="w-36 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                            <div className="h-full rounded-full transition-all duration-700" style={{ width: `${percent}%`, background: color }} />
                          </div>
                          <span className="text-xs font-bold font-mono w-8 text-right text-[#070707]">{percent}%</span>
                        </div>
                      </div>
                    ))}
                    {!anchored && <p className="text-[10px] text-[#9CA3AF] italic mt-3">Anchor on-chain to claim the contributor share (65 tokens).</p>}
                  </div>
                )}
              </Card>
            </div>
          </NodeWrapper>
        </div>}
      </div>

      {showAnchorModal && <AnchorModal onClose={() => setShowAnchorModal(false)} onSuccess={() => setAnchored(true)} />}
      {showMetadata && <MetadataDrawer onClose={() => setShowMetadata(false)} />}


      {/* Anchor Details Modal */}
      {showAnchorDetails && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/30 backdrop-blur-sm p-4"
          onClick={() => setShowAnchorDetails(false)}>
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-[0_8px_32px_rgba(0,0,0,0.12)]" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-gray-100">
              <h3 className="text-base font-bold text-[#070707]">Anchor details</h3>
              <button onClick={() => setShowAnchorDetails(false)} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
                <X className="w-4 h-4 text-[#6B7280]" />
              </button>
            </div>
            <div className="p-6 space-y-5">
              <div>
                <p className="text-[10px] uppercase text-[#9CA3AF] font-bold tracking-wider mb-2">Contribution Fingerprint (CF)</p>
                <div className="flex items-start gap-2">
                  <span className="font-mono text-xs text-[#070707] break-all leading-relaxed flex-1">0x12ab34cd56ef7890aa11bb22cc33dd44ee55ff02</span>
                  <button onClick={() => copyToClipboard('0x12ab34cd56ef7890aa11bb22cc33dd44ee55ff02', 'cf')}
                    className="shrink-0 p-1.5 rounded-lg hover:bg-gray-100 transition-colors mt-0.5">
                    {copied === 'cf' ? <CheckCircle2 className="w-3.5 h-3.5 text-[#22C55E]" /> : <Copy className="w-3.5 h-3.5 text-[#6B7280]" />}
                  </button>
                </div>
              </div>
              <div>
                <p className="text-[10px] uppercase text-[#9CA3AF] font-bold tracking-wider mb-1">Chain</p>
                <p className="text-sm font-bold text-[#070707]">Base</p>
              </div>
              <div>
                <p className="text-[10px] uppercase text-[#9CA3AF] font-bold tracking-wider mb-1">Anchor time</p>
                <p className="text-sm font-bold text-[#070707]">2025-11-21 16:40</p>
              </div>
              <div>
                <p className="text-[10px] uppercase text-[#9CA3AF] font-bold tracking-wider mb-2">Tx hash</p>
                <div className="flex items-center gap-2">
                  <a href="https://basescan.org/tx/0xa13f" target="_blank" rel="noopener noreferrer"
                    className="font-mono text-sm text-[#FFA800] hover:underline flex items-center gap-1">
                    0xa13f...92bd <ExternalLink className="w-3 h-3" />
                  </a>
                  <button onClick={() => copyToClipboard('0xa13f92bd', 'tx')}
                    className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
                    {copied === 'tx' ? <CheckCircle2 className="w-3.5 h-3.5 text-[#22C55E]" /> : <Copy className="w-3.5 h-3.5 text-[#6B7280]" />}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
