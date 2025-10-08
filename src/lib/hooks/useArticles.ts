import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { articlesApi } from '@/lib/api/articles';

// Query keys
export const articleKeys = {
  all: ['articles'] as const,
  lists: () => [...articleKeys.all, 'list'] as const,
  list: (projectId: string, page: number, limit: number) => 
    [...articleKeys.lists(), { projectId, page, limit }] as const,
  details: () => [...articleKeys.all, 'detail'] as const,
  detail: (id: string) => [...articleKeys.details(), id] as const,
};

// Get articles for a project
export const useArticles = (projectId: string, page: number = 1, limit: number = 20) => {
  return useQuery({
    queryKey: articleKeys.list(projectId, page, limit),
    queryFn: () => articlesApi.getArticlesByProject(projectId, page, limit),
    enabled: !!projectId,
    staleTime: 30 * 1000, // 30 seconds
  });
};

// Get a single article
export const useArticle = (id: string) => {
  return useQuery({
    queryKey: articleKeys.detail(id),
    queryFn: () => articlesApi.getArticle(id),
    enabled: !!id,
  });
};

// Update article mutation
export const useUpdateArticle = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<any> }) =>
      articlesApi.updateArticle(id, data),
    onSuccess: (updatedArticle) => {
      // Update the specific article in cache
      queryClient.setQueryData(articleKeys.detail(updatedArticle.id), updatedArticle);
      // Invalidate articles lists to ensure consistency
      queryClient.invalidateQueries({ queryKey: articleKeys.lists() });
    },
  });
};

// Delete article mutation
export const useDeleteArticle = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => articlesApi.deleteArticle(id),
    onSuccess: (_, deletedId) => {
      // Remove the article from cache
      queryClient.removeQueries({ queryKey: articleKeys.detail(deletedId) });
      // Invalidate articles lists
      queryClient.invalidateQueries({ queryKey: articleKeys.lists() });
    },
  });
};
