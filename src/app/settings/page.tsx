'use client';

import { AppHeader } from '@/components/layout/AppHeader';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArchiveTab } from '@/components/settings/ArchiveTab';

export default function SettingsPage() {
  return (
    <div className="min-h-screen bg-slate-950">
      <AppHeader />
      
      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-semibold text-slate-100 mb-2">
            Settings
          </h2>
          <p className="text-slate-400">
            Manage your projects and system configuration.
          </p>
        </div>

        <Tabs defaultValue="archive" className="w-full">
          <TabsList className="grid w-full grid-cols-1 bg-slate-900/40 border border-slate-800/20">
            <TabsTrigger 
              value="archive" 
              className="data-[state=active]:bg-blue-600 data-[state=active]:text-white text-slate-400"
            >
              Archive
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="archive" className="mt-6">
            <ArchiveTab />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
