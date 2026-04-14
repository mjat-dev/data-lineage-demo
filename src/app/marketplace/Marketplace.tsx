import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Star } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';

const listings = [
  { id: 'listing_882_42', title: 'Food-Science-Asset-42', dataset: 'Asian-Cuisine-Instruct-V4', category: 'Nutritional Analysis', contributor: '@chef_kenshiro', quality: 'S', price: '1,200 XNY', fractions: 85, buyers: 3, status: 'Listed', featured: true },
  { id: 'listing_791_33', title: 'RobotArm-Pose-Asset-33', dataset: 'Robotics-Instruct-V2', category: 'Robotics / Pose Estimation', contributor: '@dev_akira', quality: 'A', price: '860 XNY', fractions: 60, buyers: 1, status: 'Listed', featured: false },
  { id: 'listing_605_18', title: 'StreetSign-OCR-Asset-18', dataset: 'AutonomousDrive-V5', category: 'Autonomous Driving / OCR', contributor: '@road_data_lab', quality: 'B', price: '430 XNY', fractions: 40, buyers: 0, status: 'Listed', featured: false },
];

type Listing = typeof listings[number];

export default function Marketplace() {
  const [selected, setSelected] = useState<Listing | null>(null);

  return (
    <main className="pt-24 pb-20 bg-[#F5F5F5]">
      <div className="max-w-6xl mx-auto px-8">

        {/* Header */}
        <header className="mb-12">
          <p className="text-[#9CA3AF] text-[10px] font-bold uppercase tracking-[0.2em] mb-2">Data Economy</p>
          <h1 className="text-4xl font-bold tracking-tight mb-2 text-[#070707]">Marketplace</h1>
          <p className="text-[#6B7280] text-sm">Browse and acquire fractional data assets.</p>
        </header>

        {/* Stats row */}
        <div className="flex gap-4 mb-10 overflow-x-auto no-scrollbar">
          {[
            { label: 'Active Listings', value: '3' },
            { label: 'Total Volume', value: '2,490 XNY' },
            { label: 'Unique Assets', value: '3' },
            { label: 'Categories', value: '3' },
          ].map(s => (
            <Card key={s.label} className="px-5 py-3 flex items-center gap-4 shrink-0">
              <p className="text-xl font-extrabold text-[#FFA800]">{s.value}</p>
              <p className="text-xs text-[#6B7280] font-medium">{s.label}</p>
            </Card>
          ))}
        </div>

        {/* Listings */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {listings.map(item => (
            <Card
              key={item.id}
              hover
              onClick={() => setSelected(item)}
              className={`cursor-pointer group transition-all ${item.featured ? 'ring-1 ring-[#FFA800]/30' : ''}`}
            >
              {item.featured && (
                <div className="flex items-center gap-1.5 mb-3">
                  <Star className="w-3 h-3 text-[#FFA800]" fill="#FFA800" />
                  <span className="text-[9px] font-bold uppercase tracking-wider text-[#FFA800]">Featured</span>
                </div>
              )}
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-bold text-sm mb-1 text-[#070707]">{item.title}</h3>
                  <p className="text-[10px] text-[#9CA3AF]">{item.category}</p>
                </div>
                <Badge variant="orange">{item.quality}</Badge>
              </div>

              <div className="space-y-2 mb-4">
                {[
                  { label: 'Dataset', value: item.dataset },
                  { label: 'Contributor', value: item.contributor },
                  { label: 'Fractions left', value: `${item.fractions}%` },
                ].map(({ label, value }) => (
                  <div key={label} className="flex justify-between text-xs">
                    <span className="text-[#9CA3AF]">{label}</span>
                    <span className={`font-medium truncate ml-2 ${label === 'Contributor' ? 'text-[#FFA800]' : 'text-[#070707]'}`}>{value}</span>
                  </div>
                ))}
              </div>

              {/* Fraction bar */}
              <div className="w-full h-1 bg-gray-100 rounded-full overflow-hidden mb-4">
                <div className="h-full bg-[#FFA800] rounded-full" style={{ width: `${100 - item.fractions}%` }} />
              </div>

              <div className="flex items-center justify-between">
                <span className="text-lg font-bold text-[#070707]">{item.price}</span>
                <button className="text-xs font-bold bg-gray-100 text-[#070707] px-3 py-1.5 rounded-xl group-hover:bg-[#070707] group-hover:text-white transition-all">
                  Buy Fraction
                </button>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Detail modal */}
      {selected && (
        <Modal onClose={() => setSelected(null)} className="max-w-lg">
          <p className="text-[10px] text-[#FFA800] font-bold uppercase tracking-widest mb-1">{selected.category}</p>
          <h2 className="text-2xl font-bold mb-1 text-[#070707]">{selected.title}</h2>
          <p className="text-xs font-mono text-[#9CA3AF] mb-6">{selected.id}</p>

          <div className="bg-gray-50 rounded-xl p-4 mb-6 space-y-3">
            {[
              ['Dataset', selected.dataset],
              ['Contributor', selected.contributor],
              ['Quality Grade', selected.quality],
              ['Available Fractions', `${selected.fractions}%`],
              ['Price per 1%', selected.price],
              ['Buyers so far', String(selected.buyers)],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between text-sm">
                <span className="text-[#9CA3AF]">{k}</span>
                <span className="font-bold text-[#070707]">{v}</span>
              </div>
            ))}
          </div>

          <div className="flex gap-3">
            <Link to="/lineage" className="flex-1 py-3 border border-gray-200 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors text-center text-[#070707]">
              View Data Lineage
            </Link>
            <Button variant="primary" className="flex-1 py-3" onClick={() => setSelected(null)}>
              Buy Fraction
            </Button>
          </div>
        </Modal>
      )}
    </main>
  );
}
