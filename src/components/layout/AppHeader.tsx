'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface AppHeaderProps {
  // No props needed - header is now static
}

export function AppHeader({}: AppHeaderProps) {
  const pathname = usePathname();

  const navItems = [
    { href: '/', label: 'Dashboard' },
    { href: '/categories', label: 'Categories' },
    { href: '/settings', label: 'Settings' },
    { href: '/docs', label: 'Docs' },
  ];

  return (
    <header className="border-b border-slate-800/20 bg-slate-900/40 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo/Title */}
          <div className="flex items-center space-x-3">
            <Link href="/" className="text-2xl font-semibold text-slate-100 tracking-tight hover:text-blue-400 transition-colors">
              NewsHub
            </Link>
            <div className="h-6 w-px bg-slate-700" />
            <span className="text-sm text-slate-400">
              Media Analysis Platform
            </span>
          </div>

          {/* Navigation */}
          <nav className="flex items-center space-x-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  pathname === item.href
                    ? 'text-blue-400 bg-blue-500/10'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/50'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </header>
  );
}
