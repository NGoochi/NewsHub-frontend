'use client';

import { useState } from 'react';
import { AppHeader } from '@/components/layout/AppHeader';
import { ProjectGrid } from '@/components/dashboard/ProjectGrid';
import { NewProjectModal } from '@/components/dashboard/NewProjectModal';
import { Button } from '@/components/ui/button';
import { useProjects, useBulkArchiveProjects } from '@/lib/hooks/useProjects';
import { Project } from '@/types';
import { Plus, Archive } from 'lucide-react';
import { toast } from 'sonner';

export default function Dashboard() {
  const [isNewProjectModalOpen, setIsNewProjectModalOpen] = useState(false);
  const [selectedProjects, setSelectedProjects] = useState<string[]>([]);

  const { data: allProjects = [], isLoading, error, refetch } = useProjects();
  const bulkArchiveProjects = useBulkArchiveProjects();
  
  // Filter to show only non-archived projects
  const projects = allProjects.filter(project => !project.archived);

  const handleNewProject = () => {
    setIsNewProjectModalOpen(true);
  };

  const handleSelectProject = (projectId: string, checked: boolean) => {
    if (checked) {
      setSelectedProjects([...selectedProjects, projectId]);
    } else {
      setSelectedProjects(selectedProjects.filter(id => id !== projectId));
    }
  };

  const handleSelectAll = () => {
    if (selectedProjects.length === projects.length) {
      setSelectedProjects([]);
    } else {
      setSelectedProjects(projects.map(p => p.id));
    }
  };

  const handleBulkArchive = async () => {
    try {
      await bulkArchiveProjects.mutateAsync(selectedProjects);
      toast.success(`Archived ${selectedProjects.length} project${selectedProjects.length > 1 ? 's' : ''}`);
      setSelectedProjects([]);
    } catch {
      toast.error('Failed to archive projects');
    }
  };

  const handleEditProject = () => {
    // Placeholder for Phase 2 - inline editing
    toast.info('Project editing will be available in Phase 2');
  };


  const handleViewProject = (project: Project) => {
    // Navigate to project page
    window.location.href = `/project/${project.id}`;
  };

  const handleRetry = () => {
    refetch();
  };

  return (
        <div className="min-h-screen bg-slate-950">
          <AppHeader />
          
          <main className="max-w-7xl mx-auto px-6 py-8">
            <div className="mb-8 flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-semibold text-slate-100 mb-2">
                  Your Projects
                </h2>
                <p className="text-slate-400">
                  Manage your news analysis projects and track their progress.
                </p>
              </div>
              <div className="flex items-center space-x-3">
                {projects.length > 0 && (
                  <Button
                    variant="outline"
                    onClick={handleSelectAll}
                    className="text-slate-300 border-slate-600 hover:bg-slate-700"
                  >
                    {selectedProjects.length === projects.length ? 'Deselect All' : 'Select All'}
                  </Button>
                )}
                <Button 
                  onClick={handleNewProject}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  New Project
                </Button>
              </div>
            </div>

        <ProjectGrid
          projects={projects}
          isLoading={isLoading}
          error={error}
          onEdit={handleEditProject}
          onView={handleViewProject}
          onNewProject={handleNewProject}
          onRetry={handleRetry}
          selectedProjects={selectedProjects}
          onSelectProject={handleSelectProject}
        />
      </main>

      {/* Floating Action Bar */}
      {selectedProjects.length > 0 && (
        <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50">
          <div className="bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 shadow-lg flex items-center space-x-4">
            <span className="text-slate-300 text-sm">
              {selectedProjects.length} selected
            </span>
            <Button
              onClick={handleBulkArchive}
              className="bg-orange-600 hover:bg-orange-700 text-white"
              disabled={bulkArchiveProjects.isPending}
            >
              <Archive className="w-4 h-4 mr-2" />
              Archive
            </Button>
            <Button
              variant="outline"
              onClick={() => setSelectedProjects([])}
              className="text-slate-300 border-slate-600 hover:bg-slate-700"
            >
              Cancel
            </Button>
          </div>
        </div>
      )}

      {/* Modals */}
      <NewProjectModal
        open={isNewProjectModalOpen}
        onOpenChange={setIsNewProjectModalOpen}
      />

    </div>
  );
}
