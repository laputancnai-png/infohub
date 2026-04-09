interface BadgeProps {
  variant: string;
  children: React.ReactNode;
}

const VARIANTS: Record<string, string> = {
  hn:     'bg-[#ff6600] text-white',
  '36kr': 'bg-[#e60026] text-white',
  sspai:  'bg-[#d53a31] text-white',
  Python:     'bg-[#e8f0ff] text-[#1a3880] dark:bg-[#1a3880]/30 dark:text-[#7eb0ff]',
  TypeScript: 'bg-[#e1f5ee] text-[#085041] dark:bg-[#085041]/30 dark:text-[#4dd4a0]',
  Rust:       'bg-[#fff0e8] text-[#7a2e10] dark:bg-[#7a2e10]/30 dark:text-[#ffb07a]',
  Go:         'bg-[#e8f8ff] text-[#004d70] dark:bg-[#004d70]/30 dark:text-[#7ad4ff]',
  JavaScript: 'bg-[#fffbe8] text-[#7a5e00] dark:bg-[#7a5e00]/30 dark:text-[#ffd966]',
  default:    'bg-black/5 text-black/50 dark:bg-white/10 dark:text-white/60',
};

export function Badge({ variant, children }: BadgeProps) {
  const cls = VARIANTS[variant] ?? VARIANTS.default;
  return (
    <span className={`inline-block text-[10px] font-medium px-2 py-0.5 rounded-full ${cls}`}>
      {children}
    </span>
  );
}
