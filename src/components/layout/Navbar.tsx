import Link from 'next/link';
import { ThemeToggle } from '@/components/ui/ThemeToggle';

interface NavbarProps { activePage?: 'home' | 'finance' | 'admin' }

function Logo() {
  return (
    <svg width="30" height="30" viewBox="0 0 30 30" fill="none">
      <rect x="0"  y="0"  width="9"  height="9"  rx="2.5" fill="rgba(130,70,255,0.75)"  stroke="rgba(200,160,255,0.6)"  strokeWidth=".6"/>
      <rect x="10" y="0"  width="9"  height="9"  rx="2.5" fill="rgba(255,50,110,0.75)"  stroke="rgba(255,140,180,0.6)"  strokeWidth=".6"/>
      <rect x="20" y="0"  width="10" height="9"  rx="2.5" fill="rgba(255,130,20,0.75)"  stroke="rgba(255,200,100,0.6)"  strokeWidth=".6"/>
      <rect x="0"  y="10" width="9"  height="9"  rx="2.5" fill="rgba(20,195,110,0.75)"  stroke="rgba(90,240,165,0.6)"   strokeWidth=".6"/>
      <rect x="10" y="10" width="9"  height="9"  rx="2.5" fill="rgba(20,150,255,0.75)"  stroke="rgba(100,205,255,0.6)"  strokeWidth=".6"/>
      <rect x="20" y="10" width="10" height="9"  rx="2.5" fill="rgba(255,210,20,0.75)"  stroke="rgba(255,238,110,0.6)"  strokeWidth=".6"/>
      <rect x="0"  y="20" width="9"  height="10" rx="2.5" fill="rgba(255,50,195,0.75)"  stroke="rgba(255,140,230,0.6)"  strokeWidth=".6"/>
      <text x="3"  y="8"  fontSize="6.5" fontWeight="800" fill="rgba(255,255,255,.95)" fontFamily="-apple-system,sans-serif">L</text>
      <text x="13" y="8"  fontSize="6"   fontWeight="800" fill="rgba(255,255,255,.95)" fontFamily="-apple-system,sans-serif">A</text>
      <text x="23" y="8"  fontSize="6"   fontWeight="800" fill="rgba(255,255,255,.95)" fontFamily="-apple-system,sans-serif">P</text>
      <text x="3"  y="18" fontSize="6"   fontWeight="800" fill="rgba(255,255,255,.95)" fontFamily="-apple-system,sans-serif">U</text>
      <text x="13" y="18" fontSize="6"   fontWeight="800" fill="rgba(255,255,255,.95)" fontFamily="-apple-system,sans-serif">T</text>
      <text x="23" y="18" fontSize="6"   fontWeight="800" fill="rgba(255,255,255,.95)" fontFamily="-apple-system,sans-serif">A</text>
      <text x="3"  y="29" fontSize="6"   fontWeight="800" fill="rgba(255,255,255,.95)" fontFamily="-apple-system,sans-serif">N</text>
    </svg>
  );
}

export function Navbar({ activePage = 'home' }: NavbarProps) {
  const linkCls = (page: string) =>
    `text-[13px] px-3.5 py-1.5 rounded-full transition-colors ${
      activePage === page
        ? 'bg-[#1d1d1f] dark:bg-[#f5f5f7] text-white dark:text-[#1d1d1f]'
        : 'text-[#555] dark:text-[#aaa] hover:bg-black/[0.06] dark:hover:bg-white/[0.08]'
    }`;

  return (
    <nav className="sticky top-0 z-50 bg-white/72 dark:bg-[#1c1c1e]/72 backdrop-blur-glass border-b border-hairline border-black/[0.08] dark:border-white/[0.08] px-8 h-[52px] flex items-center justify-between">
      <Link href="/" className="flex items-center gap-2.5 no-underline">
        <Logo />
        <span className="text-[16px] font-semibold text-[#1d1d1f] dark:text-[#f5f5f7] tracking-[-0.3px]">
          Laputan Info Hub
        </span>
      </Link>
      <div className="flex items-center gap-1">
        <Link href="/"        className={linkCls('home')}>AI Tech</Link>
        <Link href="/finance" className={linkCls('finance')}>Finance</Link>
      </div>
      <ThemeToggle />
    </nav>
  );
}
