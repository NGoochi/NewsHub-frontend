import apiClient from './client';
import { Project, CreateProjectData, UpdateProjectData } from '@/types';

export const projectsApi = {
  // Get all projects
  getProjects: async (): Promise<Project[]> => {
    return await apiClient.get('/projects');
  },

  // Get a single project by ID
  getProject: async (id: string): Promise<Project> => {
    return await apiClient.get(`/projects/${id}`);
  },

  // Create a new project
  createProject: async (data: CreateProjectData): Promise<Project> => {
    return await apiClient.post('/projects', data);
  },

  // Update an existing project
  updateProject: async (id: string, data: UpdateProjectData): Promise<Project> => {
    return await apiClient.put(`/projects/${id}`, data);
  },

  // Delete a project
  deleteProject: async (id: string): Promise<void> => {
    return await apiClient.delete(`/projects/${id}`);
  },
};
