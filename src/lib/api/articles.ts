import apiClient from './client';

export interface Article {
  id: string;
  projectId: string;
  newsOutlet: string;
  title: string;
  authors: string[];
  url: string;
  fullBodyText: string;
  dateWritten: string;
  inputMethod: 'newsapi' | 'manual' | 'csv';
  
  // Gemini analysis fields
  summaryGemini?: string;
  categoryGemini?: string;
  sentimentGemini?: 'positive' | 'neutral' | 'negative';
  translatedGemini?: boolean;
  analysedAt?: string;
  
  // NewsAPI.ai extended fields
  sourceUri?: string;
  concepts?: any[];
  categories?: any[];
  sentiment?: number;
  imageUrl?: string;
  location?: any;
  importSessionId?: string;
  
  // Relations
  _count?: {
    quotes: number;
  };
}

export const articlesApi = {
  // Get articles for a project
  getArticlesByProject: async (projectId: string, page: number = 1, limit: number = 20): Promise<Article[]> => {
    return await apiClient.get(`/articles/project/${projectId}`, {
      params: { page, limit }
    });
  },

  // Get a single article
  getArticle: async (id: string): Promise<Article> => {
    return await apiClient.get(`/articles/${id}`);
  },

  // Update article
  updateArticle: async (id: string, data: Partial<Article>): Promise<Article> => {
    return await apiClient.put(`/articles/${id}`, data);
  },

  // Delete article
  deleteArticle: async (id: string): Promise<void> => {
    return await apiClient.delete(`/articles/${id}`);
  },

  // Bulk delete articles (helper function)
  bulkDeleteArticles: async (ids: string[]): Promise<{ success: number; failed: number }> => {
    let success = 0;
    let failed = 0;
    
    for (const id of ids) {
      try {
        await apiClient.delete(`/articles/${id}`);
        success++;
      } catch (error) {
        console.error(`Failed to delete article ${id}:`, error);
        failed++;
      }
    }
    
    return { success, failed };
  },
};
