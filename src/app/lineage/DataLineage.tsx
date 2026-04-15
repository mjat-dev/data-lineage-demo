import { useState, useRef, useEffect } from 'react';
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
import { formatDate, truncateAddress } from '@/lib/utils';


// ── Hover Popover ─────────────────────────────────────────────────────────────
function HoverPopover({ children, content, align = 'left', direction = 'down', sticky = false }: {
  children: React.ReactNode; content: React.ReactNode;
  align?: 'left' | 'right'; direction?: 'up' | 'down';
  sticky?: boolean; // hover opens, click-outside closes
}) {
  const [show, setShow] = useState(false);
  const wrapRef = useRef<HTMLSpanElement>(null);

  // sticky mode: close on outside click
  useEffect(() => {
    if (!sticky || !show) return;
    const handler = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setShow(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [sticky, show]);

  return (
    <span
      ref={wrapRef}
      className="relative inline-block"
      onMouseEnter={() => setShow(true)}
      onMouseLeave={sticky ? undefined : () => setShow(false)}
    >
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
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const copyField = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 1500);
  };
  const truncateDid = (d: string) => d.length <= 28 ? d : d.slice(0, 22) + '…' + d.slice(-4);

  const card = (
    <div className="bg-white rounded-xl p-4 w-60 text-left border border-gray-100 shadow-[0_4px_12px_rgba(0,0,0,0.08)]">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-8 h-8 rounded-full bg-[rgba(255,168,0,0.10)] flex items-center justify-center shrink-0">
          <User className="w-4 h-4 text-[#FFA800]" />
        </div>
        <div>
          <p className="text-xs font-bold text-[#070707]">{handle}</p>
          {role && <p className="text-[10px] text-[#9CA3AF]">{role}</p>}
        </div>
      </div>
      {did && (
        <div className="mb-2">
          <p className="text-[9px] uppercase text-[#9CA3AF] font-bold tracking-wider mb-0.5">DID</p>
          <div className="flex items-center gap-1">
            <p className="text-[10px] font-mono text-[#FFA800] flex-1 min-w-0 truncate">{truncateDid(did)}</p>
            <button onClick={() => copyField(did, 'did')} className="shrink-0 p-1 rounded hover:bg-gray-100 transition-colors">
              {copiedField === 'did' ? <CheckCircle2 className="w-3 h-3 text-[#22C55E]" /> : <Copy className="w-3 h-3 text-[#9CA3AF]" />}
            </button>
          </div>
        </div>
      )}
      {wallet && (
        <div>
          <p className="text-[9px] uppercase text-[#9CA3AF] font-bold tracking-wider mb-0.5">Wallet</p>
          <div className="flex items-center gap-1">
            <p className="text-[10px] font-mono text-[#6B7280] flex-1 min-w-0 truncate">{truncateAddress(wallet)}</p>
            <button onClick={() => copyField(wallet, 'wallet')} className="shrink-0 p-1 rounded hover:bg-gray-100 transition-colors">
              {copiedField === 'wallet' ? <CheckCircle2 className="w-3 h-3 text-[#22C55E]" /> : <Copy className="w-3 h-3 text-[#9CA3AF]" />}
            </button>
          </div>
        </div>
      )}
    </div>
  );
  return (
    <HoverPopover content={card}>
      <span className="font-bold text-[#FFA800] cursor-default border-b border-dashed border-[#FFA800]/40 hover:border-[#FFA800] transition-colors pb-0.5">{handle}</span>
    </HoverPopover>
  );
}

// ── Dataset contributors (shared between AssetChip popover + Ownership Snapshot) ──
const ASSET_CONTRIBUTORS = [
  { id: 'you', label: 'did:codatta:sub_882aef9b4c', role: 'Contributor', percent: 28, color: '#FDA829', isYou: true  },
  { id: 'c2',  label: '0x8fa2...bc31',              role: 'Contributor', percent: 22, color: '#3474FE', isYou: false },
  { id: 'c3',  label: '0x3dc9...f772',              role: 'Contributor', percent: 18, color: '#9CA3AF', isYou: false },
  { id: 'c4',  label: '0xb19c...44a1',              role: 'Contributor', percent: 15, color: '#6B7280', isYou: false },
  { id: 'c5',  label: '0xe02f...8c53',              role: 'Contributor', percent: 10, color: '#9CA3AF', isYou: false },
  { id: 'c6',      label: '@recipe_master',        role: 'Contributor', percent:  7, color: '#6B7280', isYou: false },
];

// ── Asset Chip ────────────────────────────────────────────────────────────────
function AssetChip({ name, assetId, onViewMore }: { name: string; assetId: string; onViewMore?: () => void }) {
  const preview = ASSET_CONTRIBUTORS.slice(0, 3);
  const popover = (
    <div className="bg-white rounded-2xl w-80 text-left border border-gray-100 shadow-[0_8px_24px_rgba(0,0,0,0.12)] overflow-hidden">
      {/* Scrollable body */}
      <div className="max-h-[420px] overflow-y-auto p-5 space-y-3">
        {/* X+Y=Asset formula */}
        <p className="text-[9px] uppercase font-bold text-[#FFA800] tracking-widest">Composition Logic</p>
        <div className="bg-gray-50 rounded-xl p-3 relative border border-gray-100">
          <span className="absolute top-2 left-3 text-[9px] text-[#FFA800] font-bold opacity-50">X</span>
          <div className="flex items-start justify-between pt-3">
            <div><p className="text-xs font-bold text-[#070707]">Mushroom Image Set</p><p className="text-[10px] text-[#FFA800] font-mono">@chef_kenshiro</p></div>
            <span className="text-[8px] font-bold bg-gray-100 px-2 py-0.5 rounded text-[#9CA3AF] shrink-0 ml-2">RAW DATA</span>
          </div>
        </div>
        <div className="flex justify-center text-gray-300"><Plus className="w-4 h-4" /></div>
        <div className="bg-gray-50 rounded-xl p-3 relative border border-gray-100">
          <span className="absolute top-2 left-3 text-[9px] text-[#3474FE] font-bold opacity-50">Y</span>
          <div className="flex items-start justify-between pt-3">
            <div><p className="text-xs font-bold text-[#070707]">Grade S Validation</p><p className="text-[10px] text-[#9CA3AF]">By Codatta QA Admin</p></div>
            <span className="text-[8px] font-bold bg-gray-100 px-2 py-0.5 rounded text-[#9CA3AF] shrink-0 ml-2">VALIDATED</span>
          </div>
        </div>
        <div className="flex justify-center text-gray-400 font-bold text-sm">=</div>
        <div className="bg-[rgba(255,168,0,0.06)] rounded-xl p-3 border border-[rgba(255,168,0,0.15)]">
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

        {/* Contributors */}
        <div className="border-t border-gray-100 pt-3">
          <div className="flex items-center justify-between mb-2">
            <p className="text-[9px] uppercase font-bold text-[#9CA3AF] tracking-widest">
              Contributors · {ASSET_CONTRIBUTORS.length} total
            </p>
            {onViewMore && (
              <button
                onClick={onViewMore}
                className="text-[9px] text-[#9CA3AF] hover:text-[#FDA829] flex items-center gap-0.5 transition-colors">
                view more <ArrowRight className="w-2 h-2" />
              </button>
            )}
          </div>
          <div className="space-y-0.5">
            {preview.map(({ id, label, percent, color, isYou }) => (
              <div key={id} className={`flex items-center justify-between px-1.5 py-1 rounded-lg ${isYou ? 'bg-[rgba(253,168,41,0.06)]' : ''}`}>
                <div className="flex items-center gap-1.5 min-w-0">
                  <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: color }} />
                  <span className={`text-[10px] font-mono truncate ${isYou ? 'text-[#FDA829]' : 'text-[#6B7280]'}`}>{label}</span>
                  {isYou && <span className="text-[9px] font-bold text-[#FDA829] shrink-0 opacity-80">· You</span>}
                </div>
                <span className={`text-[10px] font-bold ml-2 shrink-0 ${isYou ? 'text-[#FDA829]' : 'text-[#070707]'}`}>{percent}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
  return (
    <HoverPopover content={popover} direction="down" sticky>
      <span className="px-3 py-1 rounded-xl border border-[rgba(255,168,0,0.30)] bg-[rgba(255,168,0,0.08)] text-[#FDA829] text-xs font-bold cursor-pointer hover:bg-[rgba(255,168,0,0.12)] transition-all inline-flex items-center gap-1.5">
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
  const { submission, anchored, setAnchored, walletAddress, isLoggedIn, setShowLoginModal } = useApp();
  // Has records only if user has actually submitted something this session
  const hasRecords = !!submission;
  const [showAnchorModal, setShowAnchorModal] = useState(false);
  // Mock anchor result — used for display after demo anchoring
  const anchorResult = anchored
    ? { txHash: '0xa13f8d92b4c1e05f3d7a2b19c04e8f61d3a7c29e', cfId: '0x12ab34cd56ef7890aa11bb22cc33dd44ee55ff02', blockNumber: 43_281_774 }
    : null;

  const [showAnchorDetails, setShowAnchorDetails] = useState(false);
  const [showMetadata, setShowMetadata] = useState(false);
  const [circulationOpen, setCirculationOpen] = useState(true);
  const [ownershipOpen, setOwnershipOpen] = useState(true);
  const [ownershipShowAll, setOwnershipShowAll] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const ownershipRef = useRef<HTMLDivElement>(null);
  const anchorNodeRef = useRef<HTMLDivElement>(null);

  const handleViewMoreOwnership = () => {
    setOwnershipOpen(true);
    setOwnershipShowAll(true);
    setTimeout(() => ownershipRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 80);
  };

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
  const walletFull = walletAddress || '0xfdbF0b002bea11E54250993E1298127Ad2CDD089';
  const walletAddr = truncateAddress(walletFull);

  // ── Login gate ────────────────────────────────────────────────────────────
  if (!isLoggedIn) {
    return (
      <main className="pt-24 pb-20 bg-[#F5F5F5] min-h-screen flex items-center justify-center">
        <div className="text-center max-w-sm mx-auto px-8">
          <div className="w-16 h-16 rounded-2xl bg-[rgba(255,168,0,0.08)] flex items-center justify-center mx-auto mb-5">
            <svg className="w-7 h-7 text-[#FFA800]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
            </svg>
          </div>
          <h2 className="text-xl font-bold text-[#070707] mb-2">Connect Wallet</h2>
          <p className="text-sm text-[#9CA3AF] leading-relaxed mb-6">
            Connect your wallet to view your data lineage and on-chain records.
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
            <h2 className="text-xl font-bold text-[#070707] mb-2">No submission selected</h2>
            {hasRecords ? (
              <>
                <p className="text-sm text-[#9CA3AF] max-w-xs leading-relaxed">
                  Select a submission from Data Profile to view its lineage here.
                </p>
                <Link to="/profile" className="mt-6 inline-block px-5 py-2.5 bg-[#070707] hover:bg-[#1A1A1A] rounded-xl text-white text-sm font-bold transition-colors">
                  View My Submissions →
                </Link>
              </>
            ) : (
              <>
                <p className="text-sm text-[#9CA3AF] max-w-xs leading-relaxed">
                  Upload image data on the Frontier task page to start tracking its lineage here.
                </p>
                <Link to="/task" className="mt-6 inline-block px-5 py-2.5 bg-[#070707] hover:bg-[#1A1A1A] rounded-xl text-white text-sm font-bold transition-colors">
                  Go to Task →
                </Link>
              </>
            )}
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
                  <IdentityChip handle={walletAddr} role="Contributor" did="did:codatta:contributor_sub_882aef9b4c" wallet={walletFull} />{' '}
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
          <div ref={anchorNodeRef}>
          <NodeWrapper icon={Link2} iconActive={anchored}>
            <CollapsibleCard
              title="Anchor on-chain"
              badge={anchored ? `Anchored${anchorResult?.txHash ? ' · ' + anchorResult.txHash.slice(0, 6) + '...' + anchorResult.txHash.slice(-4) : ''}` : 'Ready to Anchor'}
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

                    <div className="border-t border-gray-200 pt-5 space-y-3">
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-3.5 h-3.5 text-[#FDA829]" />
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs text-[#9CA3AF] line-through font-mono">~0.0002 ETH</span>
                          <span className="text-sm font-bold text-[#5DDD22]">450 XNY</span>
                        </div>
                        <span className="text-[10px] text-[#9CA3AF]">Gas sponsored by platform</span>
                      </div>
                      <button
                        onClick={() => setShowAnchorModal(true)}
                        className="w-full py-3.5 bg-[#FDA829] hover:bg-[#E89B20] active:bg-[#D08A10] text-white font-bold text-base rounded-2xl flex items-center justify-center gap-2 transition-colors shadow-[0_6px_20px_rgba(253,168,41,0.35)]"
                      >
                        <Link2 className="w-5 h-5" />
                        Anchor On-Chain Now →
                      </button>
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
                      <Globe className="w-3 h-3" /> BNB Smart Chain
                    </span>
                  </p>
                  <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                    <p className="text-[10px] font-bold uppercase text-[#9CA3AF] tracking-wider mb-2">Contribution Fingerprint (CF)</p>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs text-[#070707] truncate flex-1">{anchorResult?.cfId || '0x...'}</span>
                      <button onClick={() => copyToClipboard(anchorResult?.cfId || '', 'cf-node')}
                        className="shrink-0 p-1.5 rounded-lg hover:bg-gray-200 transition-colors">
                        {copied === 'cf-node' ? <CheckCircle2 className="w-3.5 h-3.5 text-[#22C55E]" /> : <Copy className="w-3.5 h-3.5 text-[#6B7280]" />}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </CollapsibleCard>
          </NodeWrapper>
          </div>

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

                  <button
                    onClick={() => anchorNodeRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
                    className="mt-2 w-full py-2.5 rounded-xl border border-[rgba(255,168,0,0.35)] text-[#FDA829] text-sm font-bold hover:bg-[rgba(255,168,0,0.06)] transition-colors flex items-center justify-center gap-2"
                  >
                    <Link2 className="w-4 h-4" /> Go to Step 03 · Anchor On-Chain →
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Asset chip + HuggingFace link */}
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm text-[#070707]">Dataset Asset:</p>
                    <AssetChip name="Food-Science-Asset-42" assetId="asset_882_v1" onViewMore={handleViewMoreOwnership} />
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
                  className="w-full flex items-center justify-between p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors group">
                  <div className="flex items-center gap-3">
                    <History className="w-4 h-4 text-[#FFA800]" />
                    <span className="text-sm font-bold uppercase tracking-wider text-[#070707]">Circulation Log</span>
                    {anchored && <span className="text-[10px] font-mono text-[#9CA3AF] bg-gray-100 px-2 py-0.5 rounded-full">6 events</span>}
                  </div>
                  <div className="flex items-center gap-2 text-[#9CA3AF] group-hover:text-[#FDA829] transition-colors">
                    <span className="text-[10px]">{circulationOpen ? 'Collapse' : 'Expand'}</span>
                    <ChevronDown className={`w-4 h-4 transition-transform ${circulationOpen ? 'rotate-180' : ''}`} />
                  </div>
                </button>
                {circulationOpen && (
                  <div className="p-5">
                    {!anchored ? (
                      /* ── Empty state: no on-chain activity until user anchors ── */
                      <div className="flex flex-col items-center gap-3 py-8 text-center">
                        <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                          <History className="w-5 h-5 text-gray-300" />
                        </div>
                        <p className="text-sm font-medium text-[#070707]">No activity yet</p>
                        <p className="text-xs text-[#9CA3AF] max-w-xs leading-relaxed">
                          Circulation records appear after your data is anchored on-chain, the dataset is assetified, and ownership tokens are minted.
                        </p>
                        <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                          className="mt-1 px-4 py-2 border border-[rgba(255,168,0,0.30)] rounded-xl text-[#FDA829] text-xs font-bold hover:bg-[rgba(255,168,0,0.08)] transition-colors">
                          Anchor on-chain → Step 03
                        </button>
                      </div>
                    ) : (
                      /* ── Anchored: real mint + transfer records ── */
                      <div className="space-y-8 relative pl-6 border-l border-gray-200">
                        {((): Array<{
                            id: string; time: string; type: string; title: string; desc: string;
                            fields: Array<{ label: string; value: string; bold?: boolean; link?: string; isYou?: boolean }>;
                            highlight: boolean;
                          }> => [
                          {
                            id: 'you-mint', time: '2025-11-25 11:30', type: 'Mint',
                            title: 'ERC-1155 tokens minted to You',
                            desc: '65 ownership tokens minted to your wallet · contributor share for Food Science dataset.',
                            fields: [
                              { label: 'To', value: 'did:codatta:sub_882aef9b4c', isYou: true },
                              { label: 'Wallet', value: '0xfdbF...D089', isYou: true },
                              { label: 'Share', value: '65 tokens · 28%', bold: true },
                              { label: 'Tx Hash', value: '0xd94e...7f3a', link: 'https://bscscan.com/tx/0xd94e' },
                            ],
                            highlight: true,
                          },
                          {
                            id: 'backer-a', time: '2025-11-27 14:15', type: 'Transfer',
                            title: 'Backer A purchased 10 tokens',
                            desc: 'ERC-1155 token transfer · contributor → backer',
                            fields: [
                              { label: 'From', value: 'did:codatta:sub_882aef9b4c', isYou: true },
                              { label: 'To', value: '0x8fa2...bc31' },
                              { label: 'Share', value: '10 tokens', bold: true },
                              { label: 'Tx Hash', value: '0xa13f...92bd', link: 'https://bscscan.com/tx/0xa13f' },
                            ],
                            highlight: false,
                          },
                          {
                            id: 'reward-1', time: '2025-12-03 08:11', type: 'Reward',
                            title: 'Contribution Reward Paid Out',
                            desc: 'Dataset accessed by AI model · MM-Food-100K v1.0.2 used for fine-tuning by NutriVision Labs.',
                            fields: [
                              { label: 'To', value: 'did:codatta:sub_882aef9b4c', isYou: true },
                              { label: 'Reason', value: 'Dataset accessed · API' },
                              { label: 'Your payout', value: '8.4 XNY (28%)', bold: true },
                              { label: 'Tx Hash', value: '0xb82c...44ef', link: 'https://bscscan.com/tx/0xb82c' },
                            ],
                            highlight: false,
                          },
                          {
                            id: 'backer-b', time: '2025-12-05 09:42', type: 'Transfer',
                            title: 'Backer B purchased 5 tokens',
                            desc: 'ERC-1155 token transfer · contributor → backer',
                            fields: [
                              { label: 'From', value: 'did:codatta:sub_882aef9b4c', isYou: true },
                              { label: 'To', value: '0x3dc9...f772' },
                              { label: 'Share', value: '5 tokens', bold: true },
                              { label: 'Tx Hash', value: '0x7cc4...1ab9', link: 'https://bscscan.com/tx/0x7cc4' },
                            ],
                            highlight: false,
                          },
                          {
                            id: 'reward-2', time: '2025-12-09 14:55', type: 'Reward',
                            title: 'Contribution Reward Paid Out',
                            desc: 'Dataset licensed to academic institution · MM-Food-100K v1.0.2 used by OpenDiet Research.',
                            fields: [
                              { label: 'To', value: 'did:codatta:sub_882aef9b4c', isYou: true },
                              { label: 'Reason', value: 'Dataset licensed · Academic' },
                              { label: 'Your payout', value: '14 XNY (28%)', bold: true },
                              { label: 'Tx Hash', value: '0xf391...c2a7', link: 'https://bscscan.com/tx/0xf391' },
                            ],
                            highlight: false,
                          },
                        ])().map((evt) => {
                          const dotColor = evt.highlight ? 'bg-[#FDA829] border-[#FDA829]'
                            : evt.type === 'Royalty' || evt.type === 'Reward' ? 'bg-[#22C55E] border-[#22C55E]'
                            : 'bg-white border-gray-300';
                          const cardBg = evt.highlight ? 'bg-[rgba(253,168,41,0.06)] border-[rgba(253,168,41,0.15)]'
                            : evt.type === 'Royalty' || evt.type === 'Reward' ? 'bg-[rgba(34,197,94,0.04)] border-[rgba(34,197,94,0.12)]'
                            : 'bg-gray-50 border-gray-100';
                          const badgeVariant: 'orange'|'blue'|'green'|'gray' =
                            evt.type === 'Transfer' ? 'blue'
                            : evt.type === 'Royalty' || evt.type === 'Reward' ? 'green'
                            : 'orange';
                          return (
                          <div key={evt.id} className="relative group">
                            <div className={`absolute -left-[30px] top-1 w-4 h-4 rounded-full border-2 transition-transform group-hover:scale-110 ${dotColor}`} />
                            <div className={`space-y-2 p-3 -mx-3 rounded-2xl transition-colors ${evt.highlight ? 'hover:bg-[rgba(253,168,41,0.04)]' : 'hover:bg-gray-50'}`}>
                              <div className="flex items-center gap-2 text-[11px]">
                                <span className="font-mono text-[#9CA3AF]">{evt.time}</span>
                                <Badge variant={badgeVariant}>{evt.type}</Badge>
                              </div>
                              <p className="text-sm font-bold text-[#111827]">{evt.title}</p>
                              <p className="text-xs text-[#9CA3AF]">{evt.desc}</p>
                              <div className={`p-3 rounded-xl border text-[11px] grid grid-cols-2 md:grid-cols-4 gap-3 ${cardBg}`}>
                                {evt.fields.map(f => (
                                  <div key={f.label}>
                                    <span className="text-[#9CA3AF] uppercase block mb-0.5 text-[9px]">{f.label}</span>
                                    {f.link ? (
                                      <a href={f.link} target="_blank" rel="noopener noreferrer"
                                        className="text-[#FDA829] hover:underline flex items-center gap-1 font-mono font-bold">
                                        {f.value} <ExternalLink className="w-3 h-3" />
                                      </a>
                                    ) : (
                                      <span className="flex items-center gap-1 min-w-0">
                                        <span className={`font-mono truncate ${f.bold ? 'font-bold text-[#111827]' : 'font-medium text-[#6B7280]'}`}>{f.value}</span>
                                        {f.isYou && <span className="text-[9px] font-bold text-[#FDA829] shrink-0">· you</span>}
                                      </span>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </Card>

              {/* Current Ownership */}
              <div ref={ownershipRef}>
              <Card className="overflow-hidden p-0">
                <button onClick={() => setOwnershipOpen(o => !o)}
                  className="w-full flex items-center justify-between p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <PieChart className="w-4 h-4 text-[#FDA829]" />
                    <span className="text-sm font-bold uppercase tracking-wider text-[#070707]">Current Ownership Snapshot</span>
                  </div>
                  <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${ownershipOpen ? 'rotate-180' : ''}`} />
                </button>
                {ownershipOpen && (
                  <div className="p-5">
                    {!anchored && (
                      <div className="mb-4 p-3 rounded-xl bg-[rgba(255,168,0,0.06)] border border-[rgba(255,168,0,0.15)] text-xs text-[#6B7280] flex items-start gap-2">
                        <Info className="w-3.5 h-3.5 text-[#FDA829] shrink-0 mt-0.5" />
                        <span>Anchor on-chain to activate your contributor share.</span>
                      </div>
                    )}
                    {(() => {
                      const list = anchored
                        ? ASSET_CONTRIBUTORS
                        : ASSET_CONTRIBUTORS.map(c => c.isYou ? { ...c, percent: 0, color: '#E5E7EB', pending: true } : c);
                      const visible = ownershipShowAll ? list : list.slice(0, 3);
                      return (
                        <>
                          {visible.map((c) => {
                            const isPending = !anchored && c.isYou;
                            return (
                              <div key={c.id} className={`flex items-center justify-between py-3 px-2 rounded-xl even:bg-gray-50 ${c.isYou && anchored ? 'bg-[rgba(253,168,41,0.04)]' : ''}`}>
                                <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0"
                                    style={{ background: `${c.color}22`, color: c.color }}>
                                    {c.label.replace('You · ', '').slice(0, 2).toUpperCase()}
                                  </div>
                                  <div>
                                    <p className={`text-xs font-bold ${c.isYou ? 'text-[#FDA829]' : 'text-[#070707]'}`}>{c.label}</p>
                                    <p className="text-[9px] font-mono text-[#9CA3AF]">{c.role}{isPending ? ' · Pending anchor' : ''}</p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-4 shrink-0">
                                  <div className="w-28 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                    <div className="h-full rounded-full transition-all duration-700" style={{ width: `${c.percent}%`, background: c.color }} />
                                  </div>
                                  <span className={`text-xs font-bold font-mono w-8 text-right ${isPending ? 'text-[#9CA3AF]' : 'text-[#070707]'}`}>
                                    {isPending ? '—' : `${c.percent}%`}
                                  </span>
                                </div>
                              </div>
                            );
                          })}
                          {!ownershipShowAll && list.length > 3 && (
                            <button
                              onClick={() => setOwnershipShowAll(true)}
                              className="mt-3 w-full text-center text-[10px] font-bold text-[#FDA829] hover:text-[#E89B20] py-2 border border-dashed border-[rgba(253,168,41,0.30)] rounded-xl flex items-center justify-center gap-1 transition-colors">
                              + {list.length - 3} more contributors <ChevronDown className="w-3 h-3" />
                            </button>
                          )}
                          {ownershipShowAll && list.length > 3 && (
                            <button
                              onClick={() => setOwnershipShowAll(false)}
                              className="mt-3 w-full text-center text-[10px] text-[#9CA3AF] hover:text-[#6B7280] py-1.5 flex items-center justify-center gap-1 transition-colors">
                              Show less <ChevronDown className="w-3 h-3 rotate-180" />
                            </button>
                          )}
                        </>
                      );
                    })()}
                  </div>
                )}
              </Card>
              </div>
            </div>
          </NodeWrapper>
        </div>}
      </div>

      {showAnchorModal && submission && (
        <AnchorModal
          onClose={() => setShowAnchorModal(false)}
          onSuccess={() => setAnchored(true)}
        />
      )}
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
                  <span className="font-mono text-xs text-[#070707] break-all leading-relaxed flex-1">{anchorResult?.cfId || '—'}</span>
                  <button onClick={() => copyToClipboard(anchorResult?.cfId || '', 'cf')}
                    className="shrink-0 p-1.5 rounded-lg hover:bg-gray-100 transition-colors mt-0.5">
                    {copied === 'cf' ? <CheckCircle2 className="w-3.5 h-3.5 text-[#22C55E]" /> : <Copy className="w-3.5 h-3.5 text-[#6B7280]" />}
                  </button>
                </div>
              </div>
              <div>
                <p className="text-[10px] uppercase text-[#9CA3AF] font-bold tracking-wider mb-1">Chain</p>
                <p className="text-sm font-bold text-[#070707]">Base Sepolia</p>
              </div>
              <div>
                <p className="text-[10px] uppercase text-[#9CA3AF] font-bold tracking-wider mb-1">Block</p>
                <p className="text-sm font-bold text-[#070707]">{anchorResult?.blockNumber?.toLocaleString() || '—'}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase text-[#9CA3AF] font-bold tracking-wider mb-2">Tx Hash</p>
                <div className="flex items-center gap-2">
                  {anchorResult?.txHash ? (
                    <a href={`https://sepolia.basescan.org/tx/${anchorResult.txHash}`} target="_blank" rel="noopener noreferrer"
                      className="font-mono text-sm text-[#FFA800] hover:underline flex items-center gap-1">
                      {anchorResult.txHash.slice(0, 6)}...{anchorResult.txHash.slice(-4)} <ExternalLink className="w-3 h-3" />
                    </a>
                  ) : <span className="text-sm text-[#9CA3AF]">—</span>}
                  {anchorResult?.txHash && (
                    <button onClick={() => copyToClipboard(anchorResult.txHash, 'tx')}
                      className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
                      {copied === 'tx' ? <CheckCircle2 className="w-3.5 h-3.5 text-[#22C55E]" /> : <Copy className="w-3.5 h-3.5 text-[#6B7280]" />}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
