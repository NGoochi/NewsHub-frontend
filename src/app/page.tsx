'use client';

import { useState } from 'react';
import { AppHeader } from '@/components/layout/AppHeader';
import { ProjectGrid } from '@/components/dashboard/ProjectGrid';
import { NewProjectModal } from '@/components/dashboard/NewProjectModal';
import { DeleteConfirmDialog } from '@/components/dashboard/DeleteConfirmDialog';
import { Button } from '@/components/ui/button';
import { useProjects } from '@/lib/hooks/useProjects';
import { Project } from '@/types';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';

export default function Dashboard() {
  const [isNewProjectModalOpen, setIsNewProjectModalOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const { data: projects = [], isLoading, error, refetch } = useProjects();

  const handleNewProject = () => {
    setIsNewProjectModalOpen(true);
  };

  const handleEditProject = (project: Project) => {
    // Placeholder for Phase 2 - inline editing
    toast.info('Project editing will be available in Phase 2');
  };

  const handleDeleteProject = (project: Project) => {
    setProjectToDelete(project);
    setIsDeleteDialogOpen(true);
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
              <Button 
                onClick={handleNewProject}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Plus className="w-4 h-4 mr-2" />
                New Project
              </Button>
            </div>

        <ProjectGrid
          projects={projects}
          isLoading={isLoading}
          error={error}
          onEdit={handleEditProject}
          onDelete={handleDeleteProject}
          onView={handleViewProject}
          onNewProject={handleNewProject}
          onRetry={handleRetry}
        />
      </main>

      {/* Modals */}
      <NewProjectModal
        open={isNewProjectModalOpen}
        onOpenChange={setIsNewProjectModalOpen}
      />

      <DeleteConfirmDialog
        project={projectToDelete}
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      />
    </div>
  );
}
