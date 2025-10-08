import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { analysisApi } from '@/lib/api/analysis';
import { CreateBatchRequest } from '@/types';

// Query keys
export const analysisKeys = {
  all: ['analysis'] as const,
  batches: () => [...analysisKeys.all, 'batches'] as const,
  batch: (batchId: string) => [...analysisKeys.all, 'batch', batchId] as const,
  projectBatches: (projectId: string) => [...analysisKeys.batches(), projectId] as const,
};

// Create analysis batch
export const useCreateBatch = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateBatchRequest) => analysisApi.createBatch(data),
    onSuccess: (data, variables) => {
      // Invalidate project batches
      queryClient.invalidateQueries({ 
        queryKey: analysisKeys.projectBatches(variables.projectId) 
      });
    },
  });
};

// Start batch processing
export const useStartBatch = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (batchId: string) => analysisApi.startBatch(batchId),
    onSuccess: (data) => {
      // Invalidate the specific batch query
      queryClient.invalidateQueries({ 
        queryKey: analysisKeys.batch(data.id) 
      });
    },
  });
};

// Get batch status (for polling)
export const useBatchStatus = (batchId: string, enabled: boolean = true) => {
  return useQuery({
    queryKey: analysisKeys.batch(batchId),
    queryFn: () => analysisApi.getBatchStatus(batchId),
    enabled: enabled && !!batchId,
    refetchInterval: (query) => {
      // Stop polling when batch is completed, failed, or cancelled
      const data = query.state.data;
      if (data?.status === 'completed' || data?.status === 'failed' || data?.status === 'cancelled') {
        return false;
      }
      // Poll every 2 seconds while running
      return 2000;
    },
    refetchIntervalInBackground: true,
  });
};

// Cancel batch
export const useCancelBatch = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (batchId: string) => analysisApi.cancelBatch(batchId),
    onSuccess: (_, batchId) => {
      // Invalidate the specific batch query
      queryClient.invalidateQueries({ 
        queryKey: analysisKeys.batch(batchId) 
      });
    },
  });
};

// Get all batches for a project
export const useProjectBatches = (projectId: string) => {
  return useQuery({
    queryKey: analysisKeys.projectBatches(projectId),
    queryFn: () => analysisApi.getProjectBatches(projectId),
    enabled: !!projectId,
  });
};
