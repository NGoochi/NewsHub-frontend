import apiClient from './client';
import { Category, CreateCategoryData, UpdateCategoryData, ReorderCategoriesData } from '@/types';

export const categoriesApi = {
  // Get all categories
  getCategories: async (includeInactive = false): Promise<Category[]> => {
    const params = includeInactive ? '?includeInactive=true' : '';
    return await apiClient.get(`/categories${params}`);
  },

  // Get single category
  getCategory: async (id: string): Promise<Category> => {
    return await apiClient.get(`/categories/${id}`);
  },

  // Create category
  createCategory: async (data: CreateCategoryData): Promise<Category> => {
    return await apiClient.post('/categories', data);
  },

  // Update category
  updateCategory: async (id: string, data: UpdateCategoryData): Promise<Category> => {
    return await apiClient.put(`/categories/${id}`, data);
  },

  // Delete category (soft delete)
  deleteCategory: async (id: string): Promise<void> => {
    return await apiClient.delete(`/categories/${id}`);
  },

  // Reorder categories
  reorderCategories: async (data: ReorderCategoriesData): Promise<void> => {
    return await apiClient.put('/categories/reorder', data);
  },
};
