'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Article, Quote } from '@/types';
import { useDeleteArticle } from '@/lib/hooks/useArticles';
import { ExternalLink, Trash2, Calendar, User, Building, ChevronDown, ChevronRight, MessageSquareQuote, Copy, Check } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';

interface ArticlesTableProps {
  projectId: string;
  articles: Article[];
  isLoading: boolean;
  selectedArticles: string[];
  onSelectionChange: (selectedIds: string[]) => void;
  quotesData: Quote[];
  analyzingArticles?: string[];
}

export function ArticlesTable({ projectId, articles, isLoading, selectedArticles, onSelectionChange, quotesData, analyzingArticles = [] }: ArticlesTableProps) {
  const [expandedArticles, setExpandedArticles] = useState<Set<string>>(new Set());
  const [copiedQuoteId, setCopiedQuoteId] = useState<string | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const deleteArticle = useDeleteArticle();

  // Create a map of article ID to its quotes
  const articleQuotesMap = useMemo(() => {
    const map = new Map<string, Quote[]>();
    quotesData.forEach(quote => {
      const existing = map.get(quote.articleId) || [];
      map.set(quote.articleId, [...existing, quote]);
    });
    return map;
  }, [quotesData]);

  const handleSelectArticle = (articleId: string, checked: boolean) => {
    if (checked) {
      onSelectionChange([...selectedArticles, articleId]);
    } else {
      onSelectionChange(selectedArticles.filter(id => id !== articleId));
    }
  };

  const handleSelectAll = () => {
    if (selectedArticles.length === articles.length) {
      // Deselect all
      onSelectionChange([]);
    } else {
      // Select all articles (including analyzed ones)
      const allIds = articles.map(article => article.id);
      onSelectionChange(allIds);
    }
  };

  const handleBulkDelete = () => {
    setIsDeleteDialogOpen(true);
  };

  const confirmBulkDelete = () => {
    // TODO: Implement bulk delete API call
    toast.info(`Bulk delete functionality will be implemented soon (${selectedArticles.length} articles selected)`);
    setIsDeleteDialogOpen(false);
    onSelectionChange([]);
  };

  const allSelected = articles.length > 0 && selectedArticles.length === articles.length;

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

  const handleCopyQuote = async (quote: Quote) => {
    const formattedQuote = `"${quote.quoteGemini}"\n\n— ${quote.stakeholderNameGemini}, ${quote.stakeholderAffiliationGemini}`;
    
    try {
      await navigator.clipboard.writeText(formattedQuote);
      setCopiedQuoteId(quote.id);
      toast.success('Quote copied to clipboard');
      
      setTimeout(() => setCopiedQuoteId(null), 2000);
    } catch (error) {
      toast.error('Failed to copy quote');
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
          <div className="flex flex-col space-y-2">
            <div className="flex items-center space-x-3">
              <CardTitle className="text-slate-100">
                {articles.length} {articles.length === 1 ? 'Article' : 'Articles'}
              </CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={handleSelectAll}
                className="text-slate-300 border-slate-600 hover:bg-slate-700"
              >
                {allSelected ? 'Deselect All' : 'Select All'}
              </Button>
            </div>
            {selectedArticles.length > 0 && (
              <span className="text-sm text-blue-400">
                {selectedArticles.length} selected
              </span>
            )}
          </div>
          
          {selectedArticles.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleBulkDelete}
              className="text-red-400 border-red-600 hover:bg-red-900/20"
            >
              <Trash2 className="w-3 h-3 mr-2" />
              Delete Selected
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {articles.map((article) => {
            const isExpanded = expandedArticles.has(article.id);
            const isAnalyzing = analyzingArticles.includes(article.id);
            
                return (
                  <div 
                    key={article.id} 
                    className={`rounded-lg transition-all ${
                      isAnalyzing 
                        ? 'analyzing-article' 
                        : 'bg-slate-800/50 border border-slate-700/50'
                    }`}
                  >
                    {/* Article Header */}
                    <div className="p-4">
                      <div className="flex items-start space-x-3">
                        {/* Checkbox - show for all articles */}
                        <div className="pt-1" onClick={(e) => e.stopPropagation()}>
                          <Checkbox
                            checked={selectedArticles.includes(article.id)}
                            onCheckedChange={(checked) => handleSelectArticle(article.id, checked as boolean)}
                            aria-label={`Select ${article.title}`}
                          />
                        </div>
                        
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

                        {/* Quote Count */}
                        {article.analysedAt && articleQuotesMap.has(article.id) && (
                          <div className="flex items-center space-x-1">
                            <MessageSquareQuote className="w-3 h-3" />
                            <span>{articleQuotesMap.get(article.id)!.length} {articleQuotesMap.get(article.id)!.length === 1 ? 'quote' : 'quotes'}</span>
                          </div>
                        )}
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
                    
                    {/* Quotes Section */}
                    {article.analysedAt && articleQuotesMap.has(article.id) && articleQuotesMap.get(article.id)!.length > 0 && (
                      <div>
                        <h4 className="text-sm font-medium text-slate-200 mb-3 flex items-center space-x-2">
                          <MessageSquareQuote className="w-4 h-4" />
                          <span>Quotes ({articleQuotesMap.get(article.id)!.length})</span>
                        </h4>
                        <div className="space-y-3">
                          {articleQuotesMap.get(article.id)!.map((quote) => (
                            <div key={quote.id} className="bg-slate-800/30 rounded-lg p-3 border border-slate-700/30">
                              {/* Stakeholder Info */}
                              <div className="flex items-start justify-between mb-2">
                                <div>
                                  <div className="text-sm font-medium text-slate-200">
                                    {quote.stakeholderNameGemini}
                                  </div>
                                  <div className="text-xs text-slate-400">
                                    {quote.stakeholderAffiliationGemini}
                                  </div>
                                </div>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleCopyQuote(quote)}
                                  className="h-7 w-7 text-slate-400 hover:text-blue-400 hover:bg-blue-500/10 flex-shrink-0"
                                  title="Copy quote"
                                >
                                  {copiedQuoteId === quote.id ? (
                                    <Check className="w-3 h-3 text-green-500" />
                                  ) : (
                                    <Copy className="w-3 h-3" />
                                  )}
                                </Button>
                              </div>
                              {/* Quote Text */}
                              <p className="text-sm text-slate-300 italic leading-relaxed">
                                "{quote.quoteGemini}"
                              </p>
                            </div>
                          ))}
                        </div>
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

      {/* Bulk Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent className="bg-slate-900 border-slate-700">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-slate-100">Delete Selected Articles</AlertDialogTitle>
            <AlertDialogDescription className="text-slate-400">
              Are you sure you want to delete {selectedArticles.length} selected article{selectedArticles.length !== 1 ? 's' : ''}? 
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-slate-800 text-slate-100 border-slate-700 hover:bg-slate-700">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmBulkDelete}
              className="bg-red-600 text-white hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}
