import { useQuery } from '@tanstack/react-query';
import { quotesApi } from '@/lib/api/quotes';

// Query keys
export const quotesKeys = {
  all: ['quotes'] as const,
  byProject: (projectId: string) => [...quotesKeys.all, 'project', projectId] as const,
  byArticle: (articleId: string) => [...quotesKeys.all, 'article', articleId] as const,
};

// Get quotes by project
export const useQuotesByProject = (projectId: string) => {
  return useQuery({
    queryKey: quotesKeys.byProject(projectId),
    queryFn: () => quotesApi.getQuotesByProject(projectId),
    enabled: !!projectId,
  });
};

// Get quotes by article
export const useQuotesByArticle = (articleId: string) => {
  return useQuery({
    queryKey: quotesKeys.byArticle(articleId),
    queryFn: () => quotesApi.getQuotesByArticle(articleId),
    enabled: !!articleId,
  });
};

