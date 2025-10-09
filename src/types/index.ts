export interface Project {
  id: string;
  name: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
  _count?: {
    articles: number;
  };
  articles?: Article[];
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface CreateProjectData {
  name: string;
  description?: string;
}

export interface UpdateProjectData {
  name?: string;
  description?: string;
}

export interface Article {
  id: string;
  projectId: string;
  newsOutlet: string;
  title: string;
  authors: string[];
  url: string;
  fullBodyText: string;
  dateWritten: string;
  inputMethod: 'newsapi' | 'manual' | 'csv' | 'pdf';
  
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

export interface Source {
  id: string;
  title: string;
  country: string;
  language: string;
  sourceUri: string;
  region?: string;
}

// Boolean query types for NewsAPI
export interface BooleanQueryTerm {
  id: string;
  type: 'term' | 'group';
  operator: 'AND' | 'OR' | 'NOT';
  value?: string;
  children?: BooleanQueryTerm[];
}

// Manual article entry
export interface ManualArticle {
  source: string;
  title: string;
  author?: string;
  url?: string;
  body: string;
  publishDate: string;
}

export interface AnalysisBatch {
  id: string;
  projectId: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
  totalArticles: number;
  processedArticles: number;
  failedArticles: number;
  createdAt: string;
  startedAt?: string;
  completedAt?: string;
  error?: string;
}

export interface CreateBatchRequest {
  projectId: string;
  articleIds: string[];
}

export interface CreateBatchResponse {
  batchId: string;
  status: string;
  totalArticles: number;
}

export interface AnalysisQueueItem {
  batchId: string | null;
  articleIds: string[];
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
  progress: number;
  error?: string;
}

export interface Quote {
  id: string;
  articleId: string;
  stakeholderNameGemini: string;
  stakeholderAffiliationGemini: string;
  quoteGemini: string;
  
  // Optional relation
  article?: {
    id: string;
    title: string;
    newsOutlet: string;
    dateWritten: string;
    url: string;
  };
}