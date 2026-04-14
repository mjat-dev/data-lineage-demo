import { cn } from '@/lib/utils';
import type { HTMLAttributes } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  hover?: boolean;
}

export function Card({ hover = false, className, children, ...props }: CardProps) {
  return (
    <div
      className={cn(
        'bg-white rounded-xl p-6',
        'border border-[#F1F3F5]',
        'shadow-[0px_2px_4px_0px_rgba(0,0,0,0.04)]',
        hover && 'transition-shadow hover:shadow-[0px_4px_12px_rgba(0,0,0,0.08)] cursor-pointer',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
