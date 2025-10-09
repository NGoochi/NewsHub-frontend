'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MultiSelect } from '@/components/ui/multi-select';
import { Search, Filter, X, ArrowUp, ArrowDown } from 'lucide-react';
import { Article, Quote } from '@/types';

export interface FilterState {
  categories: string[];
  sentiments: string[];
  analysisStatus: string;
  stakeholders: string[];
  newsOutlets: string[];
  authors: string[];
  searchQuery: string;
}

export interface SortState {
  field: 'date' | 'title' | 'newsOutlet' | 'quoteCount';
  direction: 'asc' | 'desc';
}

interface ArticleFiltersProps {
  articles: Article[];
  quotes: Quote[];
  onFilteredArticles?: (filteredArticles: Article[]) => void;
}

export function ArticleFilters({ articles, quotes, onFilteredArticles }: ArticleFiltersProps) {
  const [filters, setFilters] = useState<FilterState>({
    categories: [],
    sentiments: [],
    analysisStatus: 'all',
    stakeholders: [],
    newsOutlets: [],
    authors: [],
    searchQuery: '',
  });

  const [sort, setSort] = useState<SortState>({
    field: 'date',
    direction: 'desc',
  });

  const [showFilters, setShowFilters] = useState(false);
  const onFilteredArticlesRef = useRef(onFilteredArticles);
  const lastFilteredArticlesRef = useRef<Article[]>([]);

  // Extract unique values for filter options - dynamic based on other filters
  const filterOptions = useMemo(() => {
    // Helper function to apply filters except the specified one
    const getFilteredArticles = (excludeFilter: string) => {
      let filtered = articles;

      // Apply search query
      if (filters.searchQuery) {
        const query = filters.searchQuery.toLowerCase();
        filtered = filtered.filter(article => {
          const matchesTitle = article.title.toLowerCase().includes(query);
          const matchesOutlet = article.newsOutlet.toLowerCase().includes(query);
          const matchesAuthors = article.authors.some(author => 
            author.toLowerCase().includes(query)
          );
          return matchesTitle || matchesOutlet || matchesAuthors;
        });
      }

      // Apply news outlets filter (unless we're calculating news outlets options)
      if (excludeFilter !== 'newsOutlets' && filters.newsOutlets.length > 0) {
        filtered = filtered.filter(a => filters.newsOutlets.includes(a.newsOutlet));
      }

      // Apply authors filter (unless we're calculating authors options)
      if (excludeFilter !== 'authors' && filters.authors.length > 0) {
        filtered = filtered.filter(a => 
          a.authors.some(author => filters.authors.includes(author))
        );
      }

      // Apply analysis status filter (unless we're calculating analysis status options)
      if (excludeFilter !== 'analysisStatus' && filters.analysisStatus !== 'all') {
        const isAnalyzed = filters.analysisStatus === 'analyzed';
        filtered = filtered.filter(a => !!a.analysedAt === isAnalyzed);
      }

      // Apply categories filter (unless we're calculating categories options)
      if (excludeFilter !== 'categories' && filters.categories.length > 0) {
        filtered = filtered.filter(a => 
          a.categoryGemini && filters.categories.includes(a.categoryGemini)
        );
      }

      // Apply sentiments filter (unless we're calculating sentiments options)
      if (excludeFilter !== 'sentiments' && filters.sentiments.length > 0) {
        filtered = filtered.filter(a => 
          a.sentimentGemini && filters.sentiments.includes(a.sentimentGemini)
        );
      }

      // Apply stakeholders filter (unless we're calculating stakeholders options)
      if (excludeFilter !== 'stakeholders' && filters.stakeholders.length > 0) {
        const articleIdsWithStakeholders = quotes
          .filter(q => filters.stakeholders.includes(q.stakeholderNameGemini))
          .map(q => q.articleId);
        filtered = filtered.filter(a => articleIdsWithStakeholders.includes(a.id));
      }

      return filtered;
    };

    // Get options for each filter
    const newsOutletsArticles = getFilteredArticles('newsOutlets');
    const authorsArticles = getFilteredArticles('authors');
    const categoriesArticles = getFilteredArticles('categories').filter(a => a.analysedAt);
    const sentimentsArticles = getFilteredArticles('sentiments').filter(a => a.analysedAt);
    const stakeholdersArticles = getFilteredArticles('stakeholders').filter(a => a.analysedAt);

    // Extract unique values
    const newsOutlets = [...new Set(newsOutletsArticles.map(a => a.newsOutlet))];
    const authors = [...new Set(authorsArticles.flatMap(a => a.authors))];
    const categories = [...new Set(categoriesArticles.map(a => a.categoryGemini).filter(Boolean))];
    const sentiments = [...new Set(sentimentsArticles.map(a => a.sentimentGemini).filter(Boolean))];
    
    // For stakeholders, get quotes from relevant articles
    const stakeholderArticleIds = stakeholdersArticles.map(a => a.id);
    const stakeholders = [...new Set(
      quotes
        .filter(q => stakeholderArticleIds.includes(q.articleId))
        .map(q => q.stakeholderNameGemini)
    )];

    return {
      newsOutlets: newsOutlets.map(outlet => ({ value: outlet, label: outlet })),
      authors: authors.map(author => ({ value: author, label: author })),
      categories: categories.map(cat => ({ value: cat!, label: cat! })),
      sentiments: sentiments.map(sent => ({ value: sent!, label: sent! })),
      stakeholders: stakeholders.map(stakeholder => ({ value: stakeholder, label: stakeholder })),
    };
  }, [
    articles, 
    quotes,
    filters.newsOutlets,
    filters.authors,
    filters.analysisStatus,
    filters.categories,
    filters.sentiments,
    filters.stakeholders,
    filters.searchQuery
  ]);

  // Filter and sort articles
  const filteredArticles = useMemo(() => {
    let filtered = articles.filter(article => {
      // Search query
      if (filters.searchQuery) {
        const query = filters.searchQuery.toLowerCase();
        const matchesTitle = article.title.toLowerCase().includes(query);
        const matchesOutlet = article.newsOutlet.toLowerCase().includes(query);
        const matchesAuthors = article.authors.some(author => 
          author.toLowerCase().includes(query)
        );
        if (!matchesTitle && !matchesOutlet && !matchesAuthors) {
          return false;
        }
      }

      // Categories filter
      if (filters.categories.length > 0 && article.categoryGemini) {
        if (!filters.categories.includes(article.categoryGemini)) {
          return false;
        }
      }

      // Sentiments filter
      if (filters.sentiments.length > 0 && article.sentimentGemini) {
        if (!filters.sentiments.includes(article.sentimentGemini)) {
          return false;
        }
      }

      // Analysis status filter
      if (filters.analysisStatus !== 'all') {
        const isAnalyzed = !!article.analysedAt;
        if (filters.analysisStatus === 'analyzed' && !isAnalyzed) {
          return false;
        }
        if (filters.analysisStatus === 'not-analyzed' && isAnalyzed) {
          return false;
        }
      }

      // Stakeholders filter
      if (filters.stakeholders.length > 0) {
        const articleQuotes = quotes.filter(q => q.articleId === article.id);
        const hasMatchingStakeholder = articleQuotes.some(quote => 
          filters.stakeholders.includes(quote.stakeholderNameGemini)
        );
        if (!hasMatchingStakeholder) {
          return false;
        }
      }

      // News outlets filter
      if (filters.newsOutlets.length > 0) {
        if (!filters.newsOutlets.includes(article.newsOutlet)) {
          return false;
        }
      }

      // Authors filter
      if (filters.authors.length > 0) {
        const hasMatchingAuthor = article.authors.some(author => 
          filters.authors.includes(author)
        );
        if (!hasMatchingAuthor) {
          return false;
        }
      }

      return true;
    });

    // Sort articles
    filtered.sort((a, b) => {
      let comparison = 0;
      
      switch (sort.field) {
        case 'date':
          comparison = new Date(a.dateWritten).getTime() - new Date(b.dateWritten).getTime();
          break;
        case 'title':
          comparison = a.title.localeCompare(b.title);
          break;
        case 'newsOutlet':
          comparison = a.newsOutlet.localeCompare(b.newsOutlet);
          break;
        case 'quoteCount':
          const aQuotes = quotes.filter(q => q.articleId === a.id).length;
          const bQuotes = quotes.filter(q => q.articleId === b.id).length;
          comparison = aQuotes - bQuotes;
          break;
        default:
          comparison = 0;
      }

      return sort.direction === 'asc' ? comparison : -comparison;
    });

    return filtered;
  }, [
    articles, 
    quotes, 
    filters.categories,
    filters.sentiments,
    filters.analysisStatus,
    filters.stakeholders,
    filters.newsOutlets,
    filters.authors,
    filters.searchQuery,
    sort.field,
    sort.direction
  ]);

  // Update ref when callback changes
  useEffect(() => {
    onFilteredArticlesRef.current = onFilteredArticles;
  }, [onFilteredArticles]);

  // Update filtered articles when they change (only if actually different)
  useEffect(() => {
    // Check if the filtered articles have actually changed
    const hasChanged = 
      filteredArticles.length !== lastFilteredArticlesRef.current.length ||
      filteredArticles.some((article, index) => 
        article.id !== lastFilteredArticlesRef.current[index]?.id
      );

    if (hasChanged && onFilteredArticlesRef.current) {
      lastFilteredArticlesRef.current = filteredArticles;
      onFilteredArticlesRef.current(filteredArticles);
    }
  }, [filteredArticles]);

  const clearFilters = () => {
    setFilters({
      categories: [],
      sentiments: [],
      analysisStatus: 'all',
      stakeholders: [],
      newsOutlets: [],
      authors: [],
      searchQuery: '',
    });
  };

  const hasActiveFilters = 
    filters.categories.length > 0 ||
    filters.sentiments.length > 0 ||
    filters.analysisStatus !== 'all' ||
    filters.stakeholders.length > 0 ||
    filters.newsOutlets.length > 0 ||
    filters.authors.length > 0 ||
    filters.searchQuery;

  return (
    <Card className="bg-slate-900/40 border-slate-800/20 mb-4">
      <CardContent className="p-3">
        {/* Search, Sort, and Toggle */}
        <div className="flex items-center space-x-3 mb-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
            <Input
              placeholder="Search articles by title, outlet, or author..."
              value={filters.searchQuery}
              onChange={(e) => setFilters(prev => ({ ...prev, searchQuery: e.target.value }))}
              className="pl-10 bg-slate-800/50 border-slate-600 text-slate-100 h-9"
            />
          </div>

          {/* Sort Controls */}
          <div className="flex items-center space-x-2">
            <Label className="text-slate-400 text-xs whitespace-nowrap">Sort:</Label>
            <Select
              value={sort.field}
              onValueChange={(value: any) => setSort(prev => ({ ...prev, field: value }))}
            >
              <SelectTrigger className="w-32 h-9 bg-slate-800/50 border-slate-600 text-slate-100 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date">Date</SelectItem>
                <SelectItem value="title">Title</SelectItem>
                <SelectItem value="newsOutlet">Outlet</SelectItem>
                <SelectItem value="quoteCount">Quotes</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setSort(prev => ({ ...prev, direction: prev.direction === 'asc' ? 'desc' : 'asc' }))}
              className="h-9 w-9 bg-slate-800/50 border-slate-600 text-slate-100 hover:bg-slate-700"
              title={sort.direction === 'asc' ? 'Ascending' : 'Descending'}
            >
              {sort.direction === 'asc' ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />}
            </Button>
          </div>

          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center space-x-2 h-9 bg-slate-800/50 border-slate-600 text-slate-100 hover:bg-slate-700"
          >
            <Filter className="w-4 h-4" />
            <span>Filters</span>
            {hasActiveFilters && (
              <div className="w-2 h-2 bg-blue-500 rounded-full" />
            )}
          </Button>
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="icon"
              onClick={clearFilters}
              className="h-9 w-9 text-slate-400 hover:text-slate-100"
              title="Clear all filters"
            >
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="space-y-2">
            {/* Top Row: News Outlet, Author, Analysis Status */}
            <div className="grid grid-cols-3 gap-3">
              <div>
                <Label className="text-slate-300 text-xs mb-1.5 block">News Outlet</Label>
                <MultiSelect
                  options={filterOptions.newsOutlets}
                  selected={filters.newsOutlets}
                  onChange={(selected) => setFilters(prev => ({ ...prev, newsOutlets: selected }))}
                  placeholder="Select outlets..."
                />
              </div>

              <div>
                <Label className="text-slate-300 text-xs mb-1.5 block">Author</Label>
                <MultiSelect
                  options={filterOptions.authors}
                  selected={filters.authors}
                  onChange={(selected) => setFilters(prev => ({ ...prev, authors: selected }))}
                  placeholder="Select authors..."
                />
              </div>

              <div>
                <Label className="text-slate-300 text-xs mb-1.5 block">Analysis Status</Label>
                <Select
                  value={filters.analysisStatus}
                  onValueChange={(value) => setFilters(prev => ({ ...prev, analysisStatus: value }))}
                >
                  <SelectTrigger className="bg-slate-700/50 border-slate-600 text-slate-100 h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Articles</SelectItem>
                    <SelectItem value="analyzed">Analyzed Only</SelectItem>
                    <SelectItem value="not-analyzed">Not Analyzed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Bottom Row: Categories, Stakeholders, Sentiments */}
            <div className="grid grid-cols-3 gap-3">
              <div>
                <Label className="text-slate-300 text-xs mb-1.5 block">Categories</Label>
                <MultiSelect
                  options={filterOptions.categories}
                  selected={filters.categories}
                  onChange={(selected) => setFilters(prev => ({ ...prev, categories: selected }))}
                  placeholder="Select categories..."
                  disabled={filterOptions.categories.length === 0}
                />
              </div>

              <div>
                <Label className="text-slate-300 text-xs mb-1.5 block">Stakeholders</Label>
                <MultiSelect
                  options={filterOptions.stakeholders}
                  selected={filters.stakeholders}
                  onChange={(selected) => setFilters(prev => ({ ...prev, stakeholders: selected }))}
                  placeholder="Select stakeholders..."
                  disabled={filterOptions.stakeholders.length === 0}
                />
              </div>

              <div>
                <Label className="text-slate-300 text-xs mb-1.5 block">Sentiments</Label>
                <MultiSelect
                  options={filterOptions.sentiments}
                  selected={filters.sentiments}
                  onChange={(selected) => setFilters(prev => ({ ...prev, sentiments: selected }))}
                  placeholder="Select sentiments..."
                  disabled={filterOptions.sentiments.length === 0}
                />
              </div>
            </div>

            {/* Results Count */}
            <div className="text-xs text-slate-400 pt-1.5">
              Showing {filteredArticles.length} of {articles.length} articles
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
