'use client';

import { Button } from '@/components/ui/button';
import { Settings } from 'lucide-react';
import Link from 'next/link';

interface AppHeaderProps {
  // No props needed - header is now static
}

export function AppHeader({}: AppHeaderProps) {
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

          {/* Actions */}
          <div className="flex items-center space-x-3">
            {/* Queue counter badge - placeholder for Phase 3 */}
            <div className="hidden sm:flex items-center space-x-2 text-sm text-slate-400">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span>System Ready</span>
            </div>


            {/* Settings - placeholder for Phase 6 */}
            <Button 
              variant="ghost" 
              size="icon"
              className="text-slate-400 hover:text-slate-100 hover:bg-slate-800/50"
              title="Settings (Coming in Phase 6)"
            >
              <Settings className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
