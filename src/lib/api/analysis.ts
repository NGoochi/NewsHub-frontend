import apiClient, { analysisApiClient } from './client';
import { AnalysisBatch, CreateBatchRequest, CreateBatchResponse } from '@/types';

export const analysisApi = {
  // Create a new analysis batch
  createBatch: async (data: CreateBatchRequest): Promise<CreateBatchResponse> => {
    return await apiClient.post('/analysis/batch', data);
  },

  // Start processing a batch (uses long timeout client)
  startBatch: async (batchId: string): Promise<AnalysisBatch> => {
    return await analysisApiClient.post(`/analysis/batch/${batchId}/start`);
  },

  // Get batch status
  getBatchStatus: async (batchId: string): Promise<AnalysisBatch> => {
    return await apiClient.get(`/analysis/batch/${batchId}`);
  },

  // Cancel a batch
  cancelBatch: async (batchId: string): Promise<void> => {
    return await apiClient.post(`/analysis/batch/${batchId}/cancel`);
  },

  // Get all batches for a project
  getProjectBatches: async (projectId: string): Promise<AnalysisBatch[]> => {
    return await apiClient.get(`/analysis/project/${projectId}/batches`);
  },
};
