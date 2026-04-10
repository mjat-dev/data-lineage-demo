import { cn } from '@/lib/utils';
import type { ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'accent' | 'danger';
  size?: 'sm' | 'md' | 'lg';
}

export function Button({ variant = 'primary', size = 'md', className, children, ...props }: ButtonProps) {
  const base = 'inline-flex items-center justify-center font-semibold rounded-xl transition-all disabled:opacity-40 disabled:cursor-not-allowed';

  const variants = {
    primary:   'bg-[#070707] hover:bg-[#1A1A1A] text-white',
    secondary: 'bg-white border border-gray-200 hover:bg-gray-50 text-[#070707]',
    ghost:     'hover:bg-gray-100 text-[#6B7280]',
    accent:    'bg-[#FFA800] hover:bg-[#E69700] text-white',
    danger:    'bg-[#EF4444] hover:bg-[#DC2626] text-white',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-xs gap-1.5',
    md: 'px-5 py-2.5 text-sm gap-2',
    lg: 'px-7 py-3.5 text-base gap-2',
  };

  return (
    <button className={cn(base, variants[variant], sizes[size], className)} {...props}>
      {children}
    </button>
  );
}
