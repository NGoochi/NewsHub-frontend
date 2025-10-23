'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuthContext } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';

export function AppHeader() {
  const pathname = usePathname();
  const { logout } = useAuthContext();

  const navItems = [
    { href: '/', label: 'Dashboard' },
    { href: '/categories', label: 'Categories' },
    { href: '/settings', label: 'Settings' },
    { href: '/docs', label: 'Docs' },
  ];

  const handleLogout = async () => {
    await logout();
  };

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
            <div className="h-6 w-px bg-slate-700 mx-2" />
            <Button
              onClick={handleLogout}
              variant="outline"
              size="sm"
              className="text-slate-400 border-slate-700 hover:text-slate-100 hover:bg-slate-800"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </nav>
        </div>
      </div>
    </header>
  );
}
