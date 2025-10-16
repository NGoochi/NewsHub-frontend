import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { projectsApi } from '@/lib/api/projects';
import { CreateProjectData, UpdateProjectData } from '@/types';

// Query keys
export const projectKeys = {
  all: ['projects'] as const,
  lists: () => [...projectKeys.all, 'list'] as const,
  list: (filters: string) => [...projectKeys.lists(), { filters }] as const,
  details: () => [...projectKeys.all, 'detail'] as const,
  detail: (id: string) => [...projectKeys.details(), id] as const,
};

// Get all projects
export const useProjects = () => {
  return useQuery({
    queryKey: projectKeys.lists(),
    queryFn: projectsApi.getProjects,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Get a single project
export const useProject = (id: string) => {
  return useQuery({
    queryKey: projectKeys.detail(id),
    queryFn: () => projectsApi.getProject(id),
    enabled: !!id,
  });
};

// Create project mutation
export const useCreateProject = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateProjectData) => projectsApi.createProject(data),
    onSuccess: () => {
      // Invalidate and refetch projects list
      queryClient.invalidateQueries({ queryKey: projectKeys.lists() });
    },
  });
};

// Update project mutation
export const useUpdateProject = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateProjectData }) =>
      projectsApi.updateProject(id, data),
    onSuccess: (updatedProject) => {
      // Update the specific project in cache
      queryClient.setQueryData(projectKeys.detail(updatedProject.id), updatedProject);
      // Invalidate projects list to ensure consistency
      queryClient.invalidateQueries({ queryKey: projectKeys.lists() });
    },
  });
};

// Archive project mutation
export const useArchiveProject = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => projectsApi.archiveProject(id),
    onSuccess: (_, archivedId) => {
      // Update the project in cache
      queryClient.setQueryData(projectKeys.detail(archivedId), (old: any) => 
        old ? { ...old, archived: true } : old
      );
      // Invalidate projects list
      queryClient.invalidateQueries({ queryKey: projectKeys.lists() });
    },
  });
};

// Unarchive project mutation
export const useUnarchiveProject = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => projectsApi.unarchiveProject(id),
    onSuccess: (_, unarchivedId) => {
      // Update the project in cache
      queryClient.setQueryData(projectKeys.detail(unarchivedId), (old: any) => 
        old ? { ...old, archived: false } : old
      );
      // Invalidate projects list
      queryClient.invalidateQueries({ queryKey: projectKeys.lists() });
    },
  });
};

// Bulk archive projects mutation
export const useBulkArchiveProjects = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (projectIds: string[]) => projectsApi.bulkArchiveProjects(projectIds),
    onSuccess: () => {
      // Invalidate ALL project-related queries
      queryClient.invalidateQueries({ queryKey: projectKeys.lists() });
      queryClient.invalidateQueries({ queryKey: [...projectKeys.lists(), 'archived'] });
    },
  });
};

// Bulk unarchive projects mutation
export const useBulkUnarchiveProjects = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (projectIds: string[]) => projectsApi.bulkUnarchiveProjects(projectIds),
    onSuccess: () => {
      // Invalidate ALL project-related queries
      queryClient.invalidateQueries({ queryKey: projectKeys.lists() });
      queryClient.invalidateQueries({ queryKey: [...projectKeys.lists(), 'archived'] });
    },
  });
};

// Get archived projects
export const useArchivedProjects = () => {
  return useQuery({
    queryKey: [...projectKeys.lists(), 'archived'],
    queryFn: async () => {
      const projects = await projectsApi.getProjects();
      return projects.filter(project => project.archived);
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Delete project mutation
export const useDeleteProject = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => projectsApi.deleteProject(id),
    onSuccess: (_, deletedId) => {
      // Remove the project from cache
      queryClient.removeQueries({ queryKey: projectKeys.detail(deletedId) });
      // Invalidate projects list
      queryClient.invalidateQueries({ queryKey: projectKeys.lists() });
    },
  });
};
