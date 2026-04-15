import { cn } from '@/lib/utils';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'orange' | 'blue' | 'gray' | 'green' | 'red';
  className?: string;
}

export function Badge({ children, variant = 'gray', className }: BadgeProps) {
  const variants = {
    orange: 'bg-[rgba(253,168,41,0.12)] text-[#FDA829]',
    blue:   'bg-[rgba(52,116,254,0.08)] text-[#3474FE]',
    gray:   'bg-[#F3F4F6] text-[#6B7280]',
    green:  'bg-[rgba(93,221,34,0.12)] text-[#5DDD22]',
    red:    'bg-[rgba(217,43,43,0.12)] text-[#D92B2B]',
  };

  return (
    <span className={cn('inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-medium uppercase tracking-wider', variants[variant], className)}>
      {children}
    </span>
  );
}
