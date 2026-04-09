import { HTMLAttributes } from 'react';

interface GlassCardProps extends HTMLAttributes<HTMLDivElement> {
  hover?: boolean;
}

export function GlassCard({ hover = false, className = '', children, ...props }: GlassCardProps) {
  const base = [
    'relative overflow-hidden rounded-[14px]',
    'bg-white/70 dark:bg-white/[0.07]',
    'backdrop-blur-card',
    'border border-hairline border-white/85 dark:border-white/[0.08]',
    'before:absolute before:inset-x-0 before:top-0 before:h-px',
    'before:bg-gradient-to-r before:from-transparent before:via-white/90 before:to-transparent',
  ].join(' ');

  const hoverCls = hover
    ? 'cursor-pointer transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_8px_32px_rgba(0,0,0,0.08)] hover:bg-white/90 dark:hover:bg-white/[0.12]'
    : '';

  return (
    <div className={`${base} ${hoverCls} ${className}`} {...props}>
      {children}
    </div>
  );
}
