import { cn } from '@/lib/utils';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'orange' | 'blue' | 'gray' | 'green' | 'red';
  className?: string;
}

export function Badge({ children, variant = 'gray', className }: BadgeProps) {
  const variants = {
    orange: 'bg-[rgba(255,168,0,0.10)] text-[#FFA800]',
    blue:   'bg-[rgba(52,116,254,0.08)] text-[#3474FE]',
    gray:   'bg-gray-100 text-[#6B7280]',
    green:  'bg-[rgba(34,197,94,0.10)] text-[#22C55E]',
    red:    'bg-[rgba(239,68,68,0.10)] text-[#EF4444]',
  };

  return (
    <span className={cn('inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider', variants[variant], className)}>
      {children}
    </span>
  );
}
