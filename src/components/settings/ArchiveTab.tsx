'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useArchivedProjects, useBulkUnarchiveProjects, useDeleteProject } from '@/lib/hooks/useProjects';
import { Archive, Trash2, RotateCcw, Calendar, FileText } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';

export function ArchiveTab() {
  const [selectedProjects, setSelectedProjects] = useState<string[]>([]);
  const [isRestoreDialogOpen, setIsRestoreDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const { data: archivedProjects = [], isLoading } = useArchivedProjects();
  const bulkUnarchiveProjects = useBulkUnarchiveProjects();
  const deleteProject = useDeleteProject();

  const handleSelectProject = (projectId: string, checked: boolean) => {
    if (checked) {
      setSelectedProjects([...selectedProjects, projectId]);
    } else {
      setSelectedProjects(selectedProjects.filter(id => id !== projectId));
    }
  };

  const handleSelectAll = () => {
    if (selectedProjects.length === archivedProjects.length) {
      setSelectedProjects([]);
    } else {
      setSelectedProjects(archivedProjects.map(p => p.id));
    }
  };

  const handleRestore = async () => {
    try {
      await bulkUnarchiveProjects.mutateAsync(selectedProjects);
      toast.success(`Restored ${selectedProjects.length} project${selectedProjects.length > 1 ? 's' : ''}`);
      setSelectedProjects([]);
      setIsRestoreDialogOpen(false);
    } catch {
      toast.error('Failed to restore projects');
    }
  };

  const handleDeletePermanently = async () => {
    // Verify all selected projects are actually archived
    const nonArchivedProjects = selectedProjects.filter(id => {
      const project = archivedProjects.find(p => p.id === id);
      return !project?.archived;
    });

    if (nonArchivedProjects.length > 0) {
      toast.error(`${nonArchivedProjects.length} selected project${nonArchivedProjects.length > 1 ? 's are' : ' is'} not archived and cannot be deleted`);
      return;
    }

    let successCount = 0;
    let failureCount = 0;
    const errors: string[] = [];

    for (const projectId of selectedProjects) {
      try {
        await deleteProject.mutateAsync(projectId);
        successCount++;
      } catch (error) {
        failureCount++;
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        errors.push(`Project ${projectId}: ${errorMessage}`);
        console.error(`Failed to delete project ${projectId}:`, error);
      }
    }

    // Show detailed results
    if (successCount > 0 && failureCount === 0) {
      toast.success(`Successfully deleted ${successCount} project${successCount > 1 ? 's' : ''}`);
      setSelectedProjects([]);
      setIsDeleteDialogOpen(false);
    } else if (successCount > 0 && failureCount > 0) {
      toast.warning(`Deleted ${successCount} project${successCount > 1 ? 's' : ''}, failed to delete ${failureCount}`);
      setSelectedProjects([]);
      setIsDeleteDialogOpen(false);
    } else {
      toast.error(`Failed to delete all ${failureCount} project${failureCount > 1 ? 's' : ''}`);
      // Don't clear selection or close dialog if all failed
    }

    // Log detailed errors for debugging
    if (errors.length > 0) {
      console.error('Delete project errors:', errors);
    }
  };

  const allSelected = archivedProjects.length > 0 && selectedProjects.length === archivedProjects.length;

  if (isLoading) {
    return (
      <Card className="bg-slate-900/40 border-slate-800/20">
        <CardHeader>
          <CardTitle className="text-slate-100">Archived Projects</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="bg-slate-800/50 rounded-lg p-4 animate-pulse">
                <div className="space-y-2">
                  <div className="h-4 bg-slate-700 rounded w-3/4" />
                  <div className="h-3 bg-slate-700 rounded w-1/2" />
                  <div className="h-3 bg-slate-700 rounded w-1/4" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }


  if (archivedProjects.length === 0) {
    return (
      <Card className="bg-slate-900/40 border-slate-800/20">
        <CardHeader>
          <CardTitle className="text-slate-100">Archived Projects</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <Archive className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-100 mb-2">
              No archived projects
            </h3>
            <p className="text-slate-400">
              Projects you archive will appear here. You can restore them or delete them permanently.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-slate-900/40 border-slate-800/20">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex flex-col space-y-2">
            <CardTitle className="text-slate-100">
              {archivedProjects.length} Archived Project{archivedProjects.length !== 1 ? 's' : ''}
            </CardTitle>
            <div className="flex items-center space-x-3">
              <Button
                variant="outline"
                size="sm"
                onClick={handleSelectAll}
                className="text-slate-300 border-slate-600 hover:bg-slate-700"
              >
                {allSelected ? 'Deselect All' : 'Select All'}
              </Button>
              {selectedProjects.length > 0 && (
                <span className="text-sm text-blue-400">
                  {selectedProjects.length} selected
                </span>
              )}
            </div>
          </div>
          
          {selectedProjects.length > 0 && (
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsRestoreDialogOpen(true)}
                className="text-green-400 border-green-600 hover:bg-green-900/20"
                disabled={bulkUnarchiveProjects.isPending}
              >
                <RotateCcw className="w-3 h-3 mr-2" />
                Restore
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsDeleteDialogOpen(true)}
                className="text-red-400 border-red-600 hover:bg-red-900/20"
                disabled={deleteProject.isPending}
              >
                <Trash2 className="w-3 h-3 mr-2" />
                Delete Permanently
              </Button>
            </div>
          )}
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-4">
          {archivedProjects.map((project) => (
            <div 
              key={project.id} 
              className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-4"
            >
              <div className="flex items-start space-x-3">
                <div className="pt-1">
                  <Checkbox
                    checked={selectedProjects.includes(project.id)}
                    onCheckedChange={(checked) => handleSelectProject(project.id, checked as boolean)}
                    aria-label={`Select ${project.name}`}
                  />
                </div>
                
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-semibold text-slate-100 mb-2">
                    {project.name}
                  </h3>
                  {project.description && (
                    <p className="text-sm text-slate-400 mb-3 line-clamp-2">
                      {project.description}
                    </p>
                  )}
                  
                  <div className="flex items-center space-x-4 text-sm text-slate-400">
                    <div className="flex items-center space-x-1">
                      <FileText className="w-3 h-3" />
                      <span>{project._count?.articles || 0} articles</span>
                    </div>
                    
                    <div className="flex items-center space-x-1">
                      <Calendar className="w-3 h-3" />
                      <span>
                        Archived {formatDistanceToNow(new Date(project.updatedAt), { addSuffix: true })}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>

      {/* Restore Confirmation Dialog */}
      <AlertDialog open={isRestoreDialogOpen} onOpenChange={setIsRestoreDialogOpen}>
        <AlertDialogContent className="bg-slate-900 border-slate-700">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-slate-100">Restore Projects</AlertDialogTitle>
            <AlertDialogDescription className="text-slate-400">
              Are you sure you want to restore {selectedProjects.length} project{selectedProjects.length !== 1 ? 's' : ''}? 
              They will be moved back to your main dashboard.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-slate-800 text-slate-100 border-slate-700 hover:bg-slate-700">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRestore}
              className="bg-green-600 text-white hover:bg-green-700"
              disabled={bulkUnarchiveProjects.isPending}
            >
              Restore
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Permanently Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent className="bg-slate-900 border-slate-700">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-slate-100">Delete Permanently</AlertDialogTitle>
            <AlertDialogDescription className="text-slate-400">
              Are you sure you want to permanently delete {selectedProjects.length} project{selectedProjects.length !== 1 ? 's' : ''}? 
              This action cannot be undone. All articles and quotes will be deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-slate-800 text-slate-100 border-slate-700 hover:bg-slate-700">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeletePermanently}
              className="bg-red-600 text-white hover:bg-red-700"
              disabled={deleteProject.isPending}
            >
              Delete Permanently
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}
