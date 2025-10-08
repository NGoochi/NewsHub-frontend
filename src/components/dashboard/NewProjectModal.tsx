'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useCreateProject } from '@/lib/hooks/useProjects';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

const createProjectSchema = z.object({
  name: z.string()
    .min(1, 'Project name is required')
    .max(100, 'Project name must be less than 100 characters'),
  description: z.string()
    .max(500, 'Description must be less than 500 characters')
    .optional(),
});

type CreateProjectForm = z.infer<typeof createProjectSchema>;

interface NewProjectModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function NewProjectModal({ open, onOpenChange }: NewProjectModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const createProject = useCreateProject();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm<CreateProjectForm>({
    resolver: zodResolver(createProjectSchema),
    defaultValues: {
      name: '',
      description: '',
    },
  });

  const nameValue = watch('name');
  const descriptionValue = watch('description');

  const onSubmit = async (data: CreateProjectForm) => {
    setIsSubmitting(true);
    
    try {
      await createProject.mutateAsync({
        name: data.name,
        description: data.description || undefined,
      });
      
      toast.success('Project created successfully!');
      reset();
      onOpenChange(false);
    } catch (error) {
      toast.error(
        error instanceof Error 
          ? error.message 
          : 'Failed to create project. Please try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      reset();
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md bg-slate-900 border-slate-800">
        <DialogHeader>
          <DialogTitle className="text-slate-100">Create New Project</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Project Name */}
          <div className="space-y-2">
            <label 
              htmlFor="name" 
              className="text-sm font-medium text-slate-200"
            >
              Project Name *
            </label>
            <Input
              id="name"
              {...register('name')}
              placeholder="e.g., COP30 Coverage Analysis"
              className="bg-slate-800 border-slate-700 text-slate-100 placeholder:text-slate-400 focus:border-blue-500"
              disabled={isSubmitting}
            />
            {errors.name && (
              <p className="text-sm text-red-400">{errors.name.message}</p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label 
              htmlFor="description" 
              className="text-sm font-medium text-slate-200"
            >
              Description (Optional)
            </label>
            <Textarea
              id="description"
              {...register('description')}
              placeholder="Brief description of what this project will analyze..."
              className="bg-slate-800 border-slate-700 text-slate-100 placeholder:text-slate-400 focus:border-blue-500 min-h-[80px]"
              disabled={isSubmitting}
            />
            {errors.description && (
              <p className="text-sm text-red-400">{errors.description.message}</p>
            )}
            <p className="text-xs text-slate-500">
              {descriptionValue?.length || 0}/500 characters
            </p>
          </div>

          {/* Character count for name */}
          <p className="text-xs text-slate-500">
            {nameValue?.length || 0}/100 characters
          </p>

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
              className="border-slate-700 text-slate-300 hover:bg-slate-800"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || !nameValue?.trim()}
              className="bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Project'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
