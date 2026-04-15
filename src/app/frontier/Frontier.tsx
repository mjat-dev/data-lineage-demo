import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Star, Users, Sparkles } from 'lucide-react';
import { getFrontierList, type FrontierItem } from '@/lib/api';
import { useApp } from '@/context/AppContext';

// Demo fallback — always shown even before login
const DEMO_FRONTIER: FrontierItem = {
  frontier_id: '10318791269400100037',
  title: 'Food Science',
  description: { frontier_desc: 'Studying Food Science and labeling and annotating food data.' },
  logo_url: 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=400&q=80',
  status: 'ONLINE',
  difficulty_level: 1,
  participants: 99000,
  avatars: [],
  task: {
    task_id: '10318807159400100038',
    task_type: 'submission',
    name: 'Food Image Annotation',
    template_id: 'MVP_DEMO_TPL',
    reward_info: [],
    status: 'COLLECTING',
  },
};

const FOOD_BG = 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=400&q=80';

function StarRating({ count }: { count: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(i => (
        <Star key={i} className="w-3.5 h-3.5"
          style={{ color: i <= count ? '#FFA800' : '#D1D5DB' }}
          fill={i <= count ? '#FFA800' : 'none'} />
      ))}
    </div>
  );
}

function AvatarStack({ avatars }: { avatars: string[] }) {
  const fallbackColors = ['#FFA800', '#3474FE', '#9CA3AF'];
  return (
    <div className="flex items-center -space-x-1.5">
      {(avatars.length ? avatars.slice(0, 3) : fallbackColors).map((src, i) => (
        typeof src === 'string' && src.startsWith('http')
          ? <img key={i} src={src} alt="" className="w-5 h-5 rounded-full border-2 border-white object-cover" onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
          : <div key={i} className="w-5 h-5 rounded-full border-2 border-white" style={{ background: src }} />
      ))}
    </div>
  );
}

export default function Frontier() {
  const navigate = useNavigate();
  const { isLoggedIn } = useApp();
  const [frontiers, setFrontiers] = useState<FrontierItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Demo mode: use local mock data, no API call
    setFrontiers(isLoggedIn ? [DEMO_FRONTIER] : []);
    setLoading(false);
  }, [isLoggedIn]);

  const handleClick = (f: FrontierItem) => {
    sessionStorage.setItem('codatta_frontier_id', f.frontier_id);
    sessionStorage.setItem('codatta_task_id', f.task.task_id);
    sessionStorage.setItem('codatta_template_id', f.task.template_id);
    navigate('/task');
  };

  return (
    <main className="pt-16 pb-20 min-h-screen bg-[#F5F5F5]">

      {/* Hero banner */}
      <div className="bg-[#070707] relative overflow-hidden mb-8" style={{ minHeight: 200 }}>
        <div className="absolute right-24 top-1/2 -translate-y-1/2 w-48 h-48 rounded-full blur-3xl pointer-events-none"
          style={{ background: 'rgba(255,168,0,0.15)' }} />
        <div className="absolute right-40 top-1/2 -translate-y-1/2 w-32 h-32 rounded-full blur-2xl pointer-events-none"
          style={{ background: 'rgba(52,116,254,0.10)' }} />
        <div className="absolute right-16 top-1/2 -translate-y-1/2 flex items-center gap-4 opacity-50">
          <div className="w-20 h-20 rounded-2xl border border-white/10 flex items-center justify-center"
            style={{ background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(10px)' }}>
            <Sparkles className="w-8 h-8 text-[#FFA800]" />
          </div>
          <div className="w-14 h-14 rounded-xl border border-white/10 flex items-center justify-center"
            style={{ background: 'rgba(255,255,255,0.03)', backdropFilter: 'blur(10px)' }}>
            <Sparkles className="w-5 h-5 text-white/30" />
          </div>
        </div>
        <div className="max-w-6xl mx-auto px-8 py-12">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-white/40 text-xs">Codatta</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-white mb-2">
            Knowledge Layer for <span className="text-[#FFA800]">AI</span>
          </h1>
          <p className="text-white/50 text-sm">Your Knowledge, Your Data Asset, Endless AI Royalties</p>
        </div>
      </div>

      {/* Task grid */}
      <div className="max-w-6xl mx-auto px-8">
        <h2 className="text-[#070707] font-bold text-base mb-4">Recent Frontiers</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {loading ? (
              Array.from({ length: 2 }).map((_, i) => (
                <div key={i} className="relative rounded-2xl overflow-hidden bg-gray-200 animate-pulse" style={{ aspectRatio: '4/3' }}>
                  <div className="absolute bottom-0 left-0 right-0 p-3">
                    <div className="h-4 w-32 bg-gray-300 rounded mb-2" />
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <div className="w-5 h-5 rounded-full bg-gray-300" />
                        <div className="w-5 h-5 rounded-full bg-gray-300 -ml-1.5" />
                        <div className="h-3 w-8 bg-gray-300 rounded" />
                      </div>
                      <div className="flex gap-0.5">
                        {[1,2,3,4,5].map(j => <div key={j} className="w-3.5 h-3.5 rounded-sm bg-gray-300" />)}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : frontiers.length === 0 ? (
              <div className="col-span-full flex flex-col items-center justify-center py-16 text-gray-400">
                <Sparkles className="w-10 h-10 mb-3 text-gray-300" />
                <p className="text-sm font-medium text-gray-500">No frontiers available</p>
                <p className="text-xs mt-1">Check back later for new tasks</p>
              </div>
            ) : frontiers.map(f => (
              <div
                key={f.frontier_id}
                onClick={() => handleClick(f)}
                className="relative rounded-2xl overflow-hidden cursor-pointer transition-all hover:scale-[1.02] shadow-sm hover:shadow-[0_8px_24px_rgba(0,0,0,0.12)]"
                style={{ aspectRatio: '4/3' }}
              >
                <img
                  src={f.logo_url || FOOD_BG}
                  alt={f.title}
                  className="absolute inset-0 w-full h-full object-cover"
                  onError={e => { (e.target as HTMLImageElement).src = FOOD_BG; }}
                />
                <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.80) 0%, rgba(0,0,0,0.05) 60%)' }} />

                <div className="absolute bottom-0 left-0 right-0 p-3">
                  <p className="text-white font-bold text-sm mb-1.5 leading-tight">{f.title}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <AvatarStack avatars={f.avatars} />
                      <span className="text-white/70 text-[11px]">
                        {f.participants > 0 ? `${f.participants.toLocaleString()}` : '—'}
                      </span>
                      <Users className="w-3 h-3 text-white/40" />
                    </div>
                    <StarRating count={f.difficulty_level} />
                  </div>
                </div>

                {!isLoggedIn && (
                  <div className="absolute top-2.5 right-2.5 bg-[#070707] text-white text-[9px] font-bold uppercase px-2 py-0.5 rounded-full">
                    My Task
                  </div>
                )}
              </div>
            ))}
        </div>
      </div>
    </main>
  );
}
