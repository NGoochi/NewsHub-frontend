import apiClient from './client';

export interface Source {
  id: string;
  title: string;
  country: string;
  language: string;
  sourceUri: string;
}

export interface ImportPreviewRequest {
  projectId: string;
  searchTerms: string[];
  sourceIds?: string[];
  startDate: string;
  endDate: string;
}

export interface ImportPreviewResponse {
  estimatedArticles: number;
  sources: Array<{
    id: string;
    title: string;
    country: string;
    language: string;
  }>;
  dateRange: {
    start: string;
    end: string;
  };
}

export interface ImportSession {
  sessionId: string;
  status: 'running' | 'completed' | 'failed';
  articlesFound: number;
  articlesImported: number;
  error?: string;
}

export const importApi = {
  // Get available sources
  getSources: async (): Promise<Source[]> => {
    return await apiClient.get('/import/sources');
  },

  // Get available countries
  getCountries: async (): Promise<string[]> => {
    return await apiClient.get('/import/countries');
  },

  // Get available languages
  getLanguages: async (): Promise<string[]> => {
    return await apiClient.get('/import/languages');
  },

  // Preview import
  previewImport: async (data: ImportPreviewRequest): Promise<ImportPreviewResponse> => {
    return await apiClient.post('/import/preview', data);
  },

  // Start import
  startImport: async (data: ImportPreviewRequest): Promise<{ sessionId: string }> => {
    return await apiClient.post('/import/start', data);
  },

  // Get session status
  getSessionStatus: async (sessionId: string): Promise<ImportSession> => {
    return await apiClient.get(`/import/session/${sessionId}`);
  },

  // Cancel session
  cancelSession: async (sessionId: string): Promise<void> => {
    return await apiClient.post(`/import/session/${sessionId}/cancel`);
  },
};