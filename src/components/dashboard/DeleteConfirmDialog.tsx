'use client';

import { useState } from 'react';
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
import { useDeleteProject } from '@/lib/hooks/useProjects';
import { Project } from '@/types';
import { toast } from 'sonner';
import { Loader2, AlertTriangle } from 'lucide-react';

interface DeleteConfirmDialogProps {
  project: Project | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DeleteConfirmDialog({ 
  project, 
  open, 
  onOpenChange 
}: DeleteConfirmDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const deleteProject = useDeleteProject();

  const handleDelete = async () => {
    if (!project) return;

    setIsDeleting(true);
    
    try {
      await deleteProject.mutateAsync(project.id);
      toast.success(`Project "${project.name}" deleted successfully`);
      onOpenChange(false);
    } catch (error) {
      toast.error(
        error instanceof Error 
          ? error.message 
          : 'Failed to delete project. Please try again.'
      );
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCancel = () => {
    if (!isDeleting) {
      onOpenChange(false);
    }
  };

  if (!project) return null;

  return (
    <AlertDialog open={open} onOpenChange={handleCancel}>
      <AlertDialogContent className="bg-slate-900 border-slate-800">
        <AlertDialogHeader>
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              <AlertTriangle className="w-6 h-6 text-red-400" />
            </div>
            <div>
              <AlertDialogTitle className="text-slate-100">
                Delete Project
              </AlertDialogTitle>
            </div>
          </div>
          <AlertDialogDescription className="text-slate-400 pt-2">
            Are you sure you want to delete <strong className="text-slate-200">"{project.name}"</strong>?
            <br />
            <br />
            <span className="text-red-400 font-medium">
              This action cannot be undone. All articles and quotes in this project will be permanently deleted.
            </span>
          </AlertDialogDescription>
        </AlertDialogHeader>
        
        <AlertDialogFooter>
          <AlertDialogCancel 
            onClick={handleCancel}
            disabled={isDeleting}
            className="border-slate-700 text-slate-300 hover:bg-slate-800"
          >
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={isDeleting}
            className="bg-red-600 hover:bg-red-700 text-white disabled:opacity-50"
          >
            {isDeleting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Deleting...
              </>
            ) : (
              'Delete Project'
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
