import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { importApi, ImportPreviewRequest } from '@/lib/api/import';

// Query keys
export const importKeys = {
  all: ['import'] as const,
  sources: () => [...importKeys.all, 'sources'] as const,
  countries: () => [...importKeys.all, 'countries'] as const,
  languages: () => [...importKeys.all, 'languages'] as const,
  session: (sessionId: string) => [...importKeys.all, 'session', sessionId] as const,
};

// Get available sources
export const useSources = () => {
  return useQuery({
    queryKey: importKeys.sources(),
    queryFn: importApi.getSources,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

// Get available countries
export const useCountries = () => {
  return useQuery({
    queryKey: importKeys.countries(),
    queryFn: importApi.getCountries,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

// Get available languages
export const useLanguages = () => {
  return useQuery({
    queryKey: importKeys.languages(),
    queryFn: importApi.getLanguages,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

// Preview import mutation
export const usePreviewImport = () => {
  return useMutation({
    mutationFn: (data: ImportPreviewRequest) => importApi.previewImport(data),
  });
};

// Start import mutation
export const useStartImport = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ImportPreviewRequest) => importApi.startImport(data),
    onSuccess: (data, variables) => {
      // Invalidate project data to refresh article counts
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['articles'] });
    },
  });
};

// Get session status (for polling)
export const useSessionStatus = (sessionId: string, enabled: boolean = true) => {
  return useQuery({
    queryKey: importKeys.session(sessionId),
    queryFn: () => importApi.getSessionStatus(sessionId),
    enabled: enabled && !!sessionId,
    refetchInterval: (query) => {
      // Stop polling when session is completed or failed
      const data = query.state.data;
      if (data?.status === 'completed' || data?.status === 'failed') {
        return false;
      }
      // Poll every 2 seconds while running
      return 2000;
    },
    refetchIntervalInBackground: true,
  });
};

// Cancel session mutation
export const useCancelSession = () => {
  return useMutation({
    mutationFn: (sessionId: string) => importApi.cancelSession(sessionId),
  });
};
