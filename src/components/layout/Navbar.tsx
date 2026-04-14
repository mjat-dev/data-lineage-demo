import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Compass, UserCog, GitBranch, Wallet, User, LogOut, Network } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { Button } from '@/components/ui/Button';
import WalletModal from '@/components/WalletModal';

export default function Navbar() {
  const location = useLocation();
  const { isLoggedIn, displayName, disconnectWallet, showLoginModal, setShowLoginModal } = useApp();
  const [showDisconnect, setShowDisconnect] = useState(false);

  const navItems = [
    { label: 'Frontier', path: '/', icon: Compass },
    { label: 'Data Profile', path: '/profile', icon: UserCog },
    { label: 'Data Lineage', path: '/lineage', icon: GitBranch },
  ];

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-8 h-16 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-[rgba(255,168,0,0.10)] flex items-center justify-center">
              <Network className="w-4 h-4 text-[#FFA800]" />
            </div>
            <span className="font-bold text-[#070707] tracking-tight">Codatta</span>
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#FFA800] bg-[rgba(255,168,0,0.10)] px-2 py-0.5 rounded-full">
              Architect
            </span>
          </div>

          {/* Nav links */}
          <div className="flex items-center gap-1">
            {navItems.map(({ label, path, icon: Icon }) => {
              const active = location.pathname === path;
              return (
                <Link
                  key={path}
                  to={path}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                    active
                      ? 'bg-[#070707] text-white'
                      : 'text-[#6B7280] hover:text-[#070707] hover:bg-gray-100'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {label}
                </Link>
              );
            })}
          </div>

          {/* Wallet */}
          {isLoggedIn ? (
            <div className="relative">
              <button
                onClick={() => setShowDisconnect(v => !v)}
                className="flex items-center gap-2 bg-gray-100 px-3 py-1.5 rounded-full hover:bg-gray-200 transition-all cursor-pointer"
              >
                <div className="w-6 h-6 rounded-full bg-[rgba(255,168,0,0.15)] flex items-center justify-center">
                  <User className="w-3 h-3 text-[#FFA800]" />
                </div>
                <span className="text-xs font-mono text-[#6B7280]">{displayName}</span>
                <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E] animate-pulse" />
              </button>
              {showDisconnect && (
                <div className="absolute right-0 top-full mt-2 bg-white rounded-xl p-2 min-w-[140px] z-50 shadow-[0_4px_12px_rgba(0,0,0,0.08)] border border-gray-100">
                  <button
                    onClick={() => { disconnectWallet(); setShowDisconnect(false); }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-[#6B7280] hover:text-[#070707] hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    Disconnect
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setShowLoginModal(true)}
              className="gap-2"
            >
              <Wallet className="w-4 h-4" />
              Connect Wallet
            </Button>
          )}
        </div>
      </nav>

      {showLoginModal && <WalletModal onClose={() => setShowLoginModal(false)} />}
    </>
  );
}
