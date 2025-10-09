'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Quote } from '@/types';
import { Search, Copy, ExternalLink, Check } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';

interface QuotesTableProps {
  quotes: Quote[];
  isLoading: boolean;
}

export function QuotesTable({ quotes, isLoading }: QuotesTableProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [expandedQuotes, setExpandedQuotes] = useState<Set<string>>(new Set());

  // Filter quotes based on search
  const filteredQuotes = useMemo(() => {
    if (!searchQuery.trim()) return quotes;
    
    const query = searchQuery.toLowerCase();
    return quotes.filter(quote => 
      quote.stakeholderNameGemini.toLowerCase().includes(query) ||
      quote.stakeholderAffiliationGemini.toLowerCase().includes(query) ||
      quote.quoteGemini.toLowerCase().includes(query) ||
      quote.article?.newsOutlet.toLowerCase().includes(query)
    );
  }, [quotes, searchQuery]);

  const handleCopyQuote = async (quote: Quote) => {
    const formattedQuote = `"${quote.quoteGemini}"\n\n— ${quote.stakeholderNameGemini}, ${quote.stakeholderAffiliationGemini}`;
    
    try {
      await navigator.clipboard.writeText(formattedQuote);
      setCopiedId(quote.id);
      toast.success('Quote copied to clipboard');
      
      setTimeout(() => setCopiedId(null), 2000);
    } catch (error) {
      toast.error('Failed to copy quote');
    }
  };

  const toggleExpanded = (quoteId: string) => {
    setExpandedQuotes(prev => {
      const newSet = new Set(prev);
      if (newSet.has(quoteId)) {
        newSet.delete(quoteId);
      } else {
        newSet.add(quoteId);
      }
      return newSet;
    });
  };

  const truncateQuote = (text: string, maxLength: number = 200): { truncated: string; isTruncated: boolean } => {
    if (text.length <= maxLength) {
      return { truncated: text, isTruncated: false };
    }
    return { truncated: text.slice(0, maxLength) + '...', isTruncated: true };
  };

  // Loading state
  if (isLoading) {
    return (
      <Card className="bg-slate-900/40 border-slate-800/20">
        <CardHeader>
          <CardTitle className="text-slate-100">Quotes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-slate-800 rounded w-1/4 mb-2"></div>
                <div className="h-16 bg-slate-800 rounded mb-2"></div>
                <div className="h-4 bg-slate-800 rounded w-1/3"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Empty state
  if (quotes.length === 0) {
    return (
      <Card className="bg-slate-900/40 border-slate-800/20">
        <CardHeader>
          <CardTitle className="text-slate-100">Quotes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <div className="text-slate-400 mb-2">No quotes found</div>
            <div className="text-slate-500 text-sm">
              Quotes are extracted during article analysis.
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-slate-900/40 border-slate-800/20">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-slate-100">
            Quotes ({quotes.length})
          </CardTitle>
          
          {/* Search */}
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              type="text"
              placeholder="Search quotes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 bg-slate-800 border-slate-700 text-slate-100"
            />
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {filteredQuotes.length === 0 ? (
          <div className="text-center py-8 text-slate-400">
            No quotes match your search.
          </div>
        ) : (
          <div className="space-y-4">
            {filteredQuotes.map((quote) => {
              const isExpanded = expandedQuotes.has(quote.id);
              const { truncated, isTruncated } = truncateQuote(quote.quoteGemini);
              const displayText = isExpanded ? quote.quoteGemini : truncated;

              return (
                <div
                  key={quote.id}
                  className="bg-slate-800/50 rounded-lg border border-slate-700/50 p-4 hover:border-slate-600/50 transition-colors"
                >
                  {/* Stakeholder Info */}
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="text-slate-100 font-medium">
                        {quote.stakeholderNameGemini}
                      </div>
                      <div className="text-slate-400 text-sm">
                        {quote.stakeholderAffiliationGemini}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleCopyQuote(quote)}
                        className="h-8 w-8 text-slate-400 hover:text-blue-400 hover:bg-blue-500/10"
                        title="Copy quote"
                      >
                        {copiedId === quote.id ? (
                          <Check className="w-4 h-4 text-green-500" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </Button>
                      
                      {quote.article && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => window.open(quote.article!.url, '_blank')}
                          className="h-8 w-8 text-slate-400 hover:text-blue-400 hover:bg-blue-500/10"
                          title="Open source article"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Quote Text */}
                  <div className="mb-3">
                    <p className="text-slate-200 italic leading-relaxed">
                      "{displayText}"
                    </p>
                    {isTruncated && (
                      <button
                        onClick={() => toggleExpanded(quote.id)}
                        className="text-blue-400 hover:text-blue-300 text-sm mt-1"
                      >
                        {isExpanded ? 'Show less' : 'Show more'}
                      </button>
                    )}
                  </div>

                  {/* Article Info */}
                  {quote.article && (
                    <div className="pt-3 border-t border-slate-700/50">
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center space-x-3 text-slate-400">
                          <span className="flex items-center space-x-1">
                            <span className="text-slate-500">📰</span>
                            <span className="line-clamp-1">{quote.article.title}</span>
                          </span>
                        </div>
                        <div className="flex items-center space-x-3 text-slate-500 flex-shrink-0 ml-4">
                          <Badge variant="secondary" className="bg-slate-700 text-slate-300">
                            {quote.article.newsOutlet}
                          </Badge>
                          <span className="text-xs">
                            {formatDistanceToNow(new Date(quote.article.dateWritten), { addSuffix: true })}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

