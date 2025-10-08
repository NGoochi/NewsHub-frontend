'use client';

import { Project } from '@/types';
import { ProjectCard } from './ProjectCard';
import { Button } from '@/components/ui/button';
import { Plus, RefreshCw, AlertCircle } from 'lucide-react';

interface ProjectGridProps {
  projects: Project[];
  isLoading: boolean;
  error: Error | null;
  onEdit: (project: Project) => void;
  onDelete: (project: Project) => void;
  onView: (project: Project) => void;
  onNewProject: () => void;
  onRetry: () => void;
}

export function ProjectGrid({ 
  projects, 
  isLoading, 
  error, 
  onEdit, 
  onDelete, 
  onView, 
  onNewProject,
  onRetry 
}: ProjectGridProps) {
  // Loading state
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="bg-slate-900/40 rounded-2xl shadow-md border border-slate-800/20 animate-pulse">
            <div className="p-6">
              <div className="space-y-3">
                <div className="h-6 bg-slate-800 rounded w-3/4" />
                <div className="h-4 bg-slate-800 rounded w-full" />
                <div className="h-4 bg-slate-800 rounded w-2/3" />
                <div className="space-y-2">
                  <div className="h-3 bg-slate-800 rounded w-1/2" />
                  <div className="h-2 bg-slate-800 rounded w-full" />
                </div>
                <div className="h-3 bg-slate-800 rounded w-1/3" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-8 max-w-md">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-100 mb-2">
            Failed to load projects
          </h3>
          <p className="text-slate-400 mb-4">
            {error.message || 'An unexpected error occurred'}
          </p>
          <Button 
            onClick={onRetry}
            variant="outline"
            className="border-red-500/20 text-red-400 hover:bg-red-500/10"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  // Empty state
  if (projects.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="bg-slate-900/40 border border-slate-800/20 rounded-2xl p-8 max-w-md">
          <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
            <Plus className="w-8 h-8 text-slate-400" />
          </div>
          <h3 className="text-lg font-semibold text-slate-100 mb-2">
            No projects yet
          </h3>
          <p className="text-slate-400 mb-6">
            Create your first project to start analyzing news articles and extracting insights.
          </p>
          <Button 
            onClick={onNewProject}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Your First Project
          </Button>
        </div>
      </div>
    );
  }

  // Projects grid
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {projects.map((project) => (
        <ProjectCard
          key={project.id}
          project={project}
          onEdit={onEdit}
          onDelete={onDelete}
          onView={onView}
        />
      ))}
    </div>
  );
}
