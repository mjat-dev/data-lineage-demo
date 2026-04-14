import { cn } from '@/lib/utils';
import type { ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'accent' | 'danger';
  size?: 'sm' | 'md' | 'lg';
}

export function Button({ variant = 'primary', size = 'md', className, children, ...props }: ButtonProps) {
  const base = 'inline-flex items-center justify-center font-medium rounded-lg transition-all disabled:opacity-40 disabled:cursor-not-allowed';

  const variants = {
    primary:   'bg-[#2E2E2E] hover:bg-[#111827] active:bg-[#070707] text-white',
    secondary: 'bg-[#F2F2F2] hover:bg-[#E5E5E5] text-[#070707] border-0',
    ghost:     'hover:bg-[#F3F4F6] text-[#6B7280]',
    accent:    'bg-[#FDA829] hover:bg-[#E69700] text-white',
    danger:    'bg-[#EF4444] hover:bg-[#DC2626] text-white',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-xs gap-1.5',
    md: 'px-4 py-2 text-sm gap-2',
    lg: 'px-6 py-3 text-sm gap-2',
  };

  return (
    <button className={cn(base, variants[variant], sizes[size], className)} {...props}>
      {children}
    </button>
  );
}
