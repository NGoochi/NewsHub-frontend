'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Article } from '@/types';
import { useDeleteArticle } from '@/lib/hooks/useArticles';
import { ExternalLink, Trash2, Calendar, User, Building, ChevronDown, ChevronRight } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';

interface ArticlesTableProps {
  projectId: string;
  articles: Article[];
  isLoading: boolean;
  selectedArticles: string[];
  onSelectionChange: (selectedIds: string[]) => void;
}

export function ArticlesTable({ projectId, articles, isLoading, selectedArticles, onSelectionChange }: ArticlesTableProps) {
  const [expandedArticles, setExpandedArticles] = useState<Set<string>>(new Set());
  const deleteArticle = useDeleteArticle();

  const handleSelectArticle = (articleId: string, checked: boolean) => {
    if (checked) {
      onSelectionChange([...selectedArticles, articleId]);
    } else {
      onSelectionChange(selectedArticles.filter(id => id !== articleId));
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      // Select all unanalyzed articles
      const unanalyzedIds = articles
        .filter(article => !article.analysedAt)
        .map(article => article.id);
      onSelectionChange(unanalyzedIds);
    } else {
      onSelectionChange([]);
    }
  };

  const allSelected = articles.length > 0 && 
    articles.filter(a => !a.analysedAt).every(article => selectedArticles.includes(article.id));
  const someSelected = selectedArticles.length > 0 && !allSelected;

  const toggleExpanded = (articleId: string) => {
    setExpandedArticles(prev => {
      const newSet = new Set(prev);
      if (newSet.has(articleId)) {
        newSet.delete(articleId);
      } else {
        newSet.add(articleId);
      }
      return newSet;
    });
  };

  const handleDeleteArticle = async (articleId: string, title: string) => {
    if (window.confirm(`Are you sure you want to delete "${title}"?`)) {
      try {
        await deleteArticle.mutateAsync(articleId);
        toast.success('Article deleted successfully');
      } catch (error) {
        toast.error('Failed to delete article');
      }
    }
  };

  const getSentimentColor = (sentiment?: string) => {
    switch (sentiment) {
      case 'positive': return 'bg-green-600';
      case 'negative': return 'bg-red-600';
      case 'neutral': return 'bg-slate-600';
      default: return 'bg-slate-600';
    }
  };

  const getSentimentText = (sentiment?: string) => {
    switch (sentiment) {
      case 'positive': return 'Positive';
      case 'negative': return 'Negative';
      case 'neutral': return 'Neutral';
      default: return 'Not Analyzed';
    }
  };

  if (isLoading) {
    return (
      <Card className="bg-slate-900/40 border-slate-800/20">
        <CardHeader>
          <CardTitle className="text-slate-100">Articles</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="bg-slate-800/50 rounded-lg p-4 animate-pulse">
                <div className="space-y-2">
                  <div className="h-4 bg-slate-700 rounded w-3/4" />
                  <div className="h-3 bg-slate-700 rounded w-1/2" />
                  <div className="h-3 bg-slate-700 rounded w-1/4" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (articles.length === 0) {
    return (
      <Card className="bg-slate-900/40 border-slate-800/20">
        <CardHeader>
          <CardTitle className="text-slate-100">Articles</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <Building className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-100 mb-2">No articles yet</h3>
            <p className="text-slate-400">
              Import articles to start analyzing news content.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

      return (
        <Card className="bg-slate-900/40 border-slate-800/20">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Checkbox
                  checked={allSelected}
                  onCheckedChange={handleSelectAll}
                  aria-label="Select all articles"
                  className="data-[state=indeterminate]:bg-blue-600"
                  {...(someSelected && { 'data-state': 'indeterminate' })}
                />
                <CardTitle className="text-slate-100">
                  Articles ({articles.length})
                  {selectedArticles.length > 0 && (
                    <span className="ml-2 text-sm font-normal text-blue-400">
                      {selectedArticles.length} selected
                    </span>
                  )}
                </CardTitle>
              </div>
            </div>
          </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {articles.map((article) => {
            const isExpanded = expandedArticles.has(article.id);
            
                return (
                  <div key={article.id} className="bg-slate-800/50 rounded-lg border border-slate-700/50">
                    {/* Article Header */}
                    <div className="p-4">
                      <div className="flex items-start space-x-3">
                        {/* Checkbox - only show for unanalyzed articles */}
                        {!article.analysedAt && (
                          <div className="pt-1" onClick={(e) => e.stopPropagation()}>
                            <Checkbox
                              checked={selectedArticles.includes(article.id)}
                              onCheckedChange={(checked) => handleSelectArticle(article.id, checked as boolean)}
                              aria-label={`Select ${article.title}`}
                            />
                          </div>
                        )}
                        
                        <div 
                          className="flex-1 min-w-0 cursor-pointer hover:bg-slate-700/30 transition-colors rounded p-2 -m-2"
                          onClick={() => toggleExpanded(article.id)}
                        >
                      <h3 className="text-slate-100 font-medium line-clamp-2 mb-2">
                        {article.title}
                      </h3>
                      
                      <div className="flex items-center space-x-4 text-sm text-slate-400">
                        <div className="flex items-center space-x-1">
                          <Building className="w-3 h-3" />
                          <span>{article.newsOutlet}</span>
                        </div>
                        
                        {article.authors.length > 0 && (
                          <div className="flex items-center space-x-1">
                            <User className="w-3 h-3" />
                            <span>{article.authors[0]}</span>
                            {article.authors.length > 1 && (
                              <span>+{article.authors.length - 1} more</span>
                            )}
                          </div>
                        )}
                        
                        <div className="flex items-center space-x-1">
                          <Calendar className="w-3 h-3" />
                          <span>{formatDistanceToNow(new Date(article.dateWritten), { addSuffix: true })}</span>
                        </div>
                      </div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                      {/* Analysis Status */}
                      {article.analysedAt ? (
                        <div className="flex items-center space-x-2">
                          {article.categoryGemini && (
                            <Badge variant="secondary" className="bg-blue-600 text-white text-xs">
                              {article.categoryGemini}
                            </Badge>
                          )}
                          {article.sentimentGemini && (
                            <Badge 
                              variant="secondary" 
                              className={`${getSentimentColor(article.sentimentGemini)} text-white text-xs`}
                            >
                              {getSentimentText(article.sentimentGemini)}
                            </Badge>
                          )}
                        </div>
                      ) : (
                        <Badge variant="secondary" className="bg-slate-600 text-slate-200 text-xs">
                          Not Analyzed
                        </Badge>
                      )}
                      
                      {/* Expand/Collapse Icon */}
                      {isExpanded ? (
                        <ChevronDown className="w-4 h-4 text-slate-400" />
                      ) : (
                          <ChevronRight className="w-4 h-4 text-slate-400" />
                        )}
                        </div>
                      </div>
                    </div>

                {/* Expanded Content */}
                {isExpanded && (
                  <div className="border-t border-slate-700/50 p-4 space-y-4">
                    {/* Summary */}
                    {article.summaryGemini && (
                      <div>
                        <h4 className="text-sm font-medium text-slate-200 mb-2">Summary</h4>
                        <p className="text-sm text-slate-300">{article.summaryGemini}</p>
                      </div>
                    )}
                    
                    {/* Article Body Preview */}
                    <div>
                      <h4 className="text-sm font-medium text-slate-200 mb-2">Content</h4>
                      <p className="text-sm text-slate-300 line-clamp-4">
                        {article.fullBodyText}
                      </p>
                    </div>
                    
                    {/* Actions */}
                    <div className="flex items-center justify-between pt-2">
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => window.open(article.url, '_blank')}
                          className="text-slate-400 hover:text-slate-100"
                        >
                          <ExternalLink className="w-3 h-3 mr-1" />
                          View Original
                        </Button>
                      </div>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteArticle(article.id, article.title)}
                        className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                      >
                        <Trash2 className="w-3 h-3 mr-1" />
                        Delete
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
