import apiClient from './client';
import { Quote } from '@/types';

export const quotesApi = {
  // Get all quotes for a project
  getQuotesByProject: async (projectId: string): Promise<Quote[]> => {
    return await apiClient.get(`/quotes?projectId=${projectId}`);
  },

  // Get quotes for a specific article
  getQuotesByArticle: async (articleId: string): Promise<Quote[]> => {
    return await apiClient.get(`/quotes?articleId=${articleId}`);
  },
};

