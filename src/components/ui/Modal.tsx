import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ModalProps {
  onClose: () => void;
  children: React.ReactNode;
  className?: string;
}

export function Modal({ onClose, children, className }: ModalProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)' }}
      onClick={onClose}
    >
      <div
        className={cn('bg-white rounded-2xl p-8 w-full relative', 'shadow-[0_16px_48px_rgba(0,0,0,0.12),0_4px_16px_rgba(0,0,0,0.06)]', className)}
        style={{ animation: 'scaleIn 0.2s ease forwards' }}
        onClick={e => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
        {children}
      </div>
    </div>
  );
}
