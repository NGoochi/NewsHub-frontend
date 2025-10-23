'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Loader2, Search, FileUp, PenSquare, X } from 'lucide-react';
import apiClient from '@/lib/api/client';

// Import our new components
import { BooleanQueryBuilder, BooleanTerm } from './BooleanQueryBuilder';
import { SourceSelector } from './SourceSelector';
import { PDFUploader } from './PDFUploader';
import { ManualArticleEntry } from './ManualArticleEntry';

// Import hooks and types
import { useSources } from '@/lib/hooks/useImport';

interface ImportModalNewProps {
  projectId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImportStart?: (sessionId: string) => void;
}

type ImportMode = 'newsapi' | 'pdf' | 'manual';

interface ManualArticle {
  source: string;
  title: string;
  author?: string;
  url?: string;
  body: string;
  publishDate: string;
}

export function ImportModalNew({ projectId, open, onOpenChange, onImportStart }: ImportModalNewProps) {
  const [mode, setMode] = useState<ImportMode>('newsapi');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // NewsAPI mode state
  const [booleanQuery, setBooleanQuery] = useState<BooleanTerm[]>([]);
  const [selectedSources, setSelectedSources] = useState<string[]>([]);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [articleCount, setArticleCount] = useState(1000);

  // PDF mode state
  const [selectedPDF, setSelectedPDF] = useState<File | null>(null);
  const [pdfStatus, setPdfStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const [pdfProgress, setPdfProgress] = useState(0);
  const [pdfMessage, setPdfMessage] = useState('');
  const [pdfArticleCount, setPdfArticleCount] = useState(0);

  // Manual mode state
  const [manualArticles, setManualArticles] = useState<ManualArticle[]>([]);

  // Fetch sources for NewsAPI mode
  const { data: sources = [] } = useSources();

  const buildNewsAPIQuery = (): any => {
    const buildBooleanStructure = (terms: BooleanTerm[]): any => {
      if (!terms || terms.length === 0) return null;

      if (terms.length === 1) {
        const term = terms[0];
        if (term.type === 'term' && term.value) {
          return {
            keyword: term.value,
            keywordLoc: 'body'
          };
        } else if (term.type === 'group' && term.children) {
          return buildGroupStructure(term.children);
        }
      }

      return buildGroupStructure(terms);
    };

    const buildGroupStructure = (terms: BooleanTerm[]): any => {
      const andTerms: any[] = [];
      const orTerms: any[] = [];
      const notTerms: any[] = [];

      terms.forEach((term, index) => {
        const operator = index === 0 ? 'AND' : term.operator;
        
        if (term.type === 'term' && term.value) {
          const keywordCondition = {
            keyword: term.value,
            keywordLoc: 'body'
          };

          if (operator === 'NOT') {
            notTerms.push(keywordCondition);
          } else if (operator === 'OR') {
            orTerms.push(keywordCondition);
          } else {
            andTerms.push(keywordCondition);
          }
        } else if (term.type === 'group' && term.children) {
          const groupQuery = buildGroupStructure(term.children);
          if (groupQuery) {
            if (operator === 'NOT') {
              notTerms.push(groupQuery);
            } else if (operator === 'OR') {
              orTerms.push(groupQuery);
            } else {
              andTerms.push(groupQuery);
            }
          }
        }
      });

      const conditions: any[] = [];

      if (andTerms.length === 1) {
        conditions.push(andTerms[0]);
      } else if (andTerms.length > 1) {
        conditions.push({ $and: andTerms });
      }

      if (orTerms.length === 1) {
        conditions.push(orTerms[0]);
      } else if (orTerms.length > 1) {
        conditions.push({ $or: orTerms });
      }

      if (notTerms.length > 0) {
        notTerms.forEach(notTerm => {
          conditions.push({ $not: notTerm });
        });
      }

      if (conditions.length === 1) {
        return conditions[0];
      } else if (conditions.length > 1) {
        return { $and: conditions };
      }

      return null;
    };

    const queryStructure = buildBooleanStructure(booleanQuery);
    if (!queryStructure) {
      throw new Error('Please build a search query');
    }

    const query: any = {
      $query: {
        $and: [queryStructure]
      }
    };

    // Add sources filter
    if (selectedSources.length > 0) {
      const sourceUris = selectedSources.map(id => {
        const source = sources.find(s => s.id === id);
        return source ? { sourceUri: source.sourceUri } : null;
      }).filter(Boolean);

      if (sourceUris.length > 0) {
        query.$query.$and.push({ $or: sourceUris });
      }
    }

    // Add date range
    if (startDate && endDate) {
      query.$query.$and.push({
        dateStart: startDate,
        dateEnd: endDate
      });
    }

    return query;
  };

  const handleNewsAPIImport = async () => {
    try {
      setIsSubmitting(true);

      if (booleanQuery.length === 0) {
        toast.error('Please build a search query');
        return;
      }

      if (selectedSources.length === 0) {
        toast.error('Please select at least one source');
        return;
      }

      if (!startDate || !endDate) {
        toast.error('Please select date range');
        return;
      }

      const query = buildNewsAPIQuery();

      // Send to backend endpoint: POST /import/newsapi
      const response = await apiClient.post('/import/newsapi', {
        projectId,
        query,
        articleCount
      });

      // apiClient returns data directly (response interceptor unwraps it)
      toast.success('NewsAPI import started!');
      if (onImportStart && response?.sessionId) {
        onImportStart(response.sessionId);
      }
      onOpenChange(false);
      resetForm();
      
    } catch (error) {
      console.error('NewsAPI import error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to start import');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePDFImport = async () => {
    try {
      if (!selectedPDF) {
        toast.error('Please select a PDF file');
        return;
      }

      setIsSubmitting(true);
      setPdfStatus('uploading');
      setPdfProgress(0);
      setPdfMessage('Uploading PDF to server...');

      // Create FormData for file upload
      const formData = new FormData();
      formData.append('pdf', selectedPDF);
      formData.append('projectId', projectId);

      // Send to backend endpoint: POST /import/pdf
      const response = await apiClient.post('/import/pdf', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setPdfProgress(percentCompleted);
            setPdfMessage(`Uploading... ${percentCompleted}%`);
          }
        },
      });

      // apiClient returns data directly (response interceptor unwraps it)
      const { imported, failed } = response;
      setPdfStatus('success');
      setPdfArticleCount(imported);
      setPdfMessage(`Successfully imported ${imported} articles${failed > 0 ? ` (${failed} failed)` : ''}`);
      toast.success(`PDF processed: ${imported} articles imported`);
      
      setTimeout(() => {
        onOpenChange(false);
        resetForm();
      }, 2000);
      
    } catch (error) {
      console.error('PDF import error:', error);
      setPdfStatus('error');
      setPdfMessage(error instanceof Error ? error.message : 'Failed to process PDF');
      toast.error('Failed to process PDF');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleManualImport = async () => {
    try {
      setIsSubmitting(true);

      if (manualArticles.length === 0) {
        toast.error('Please add at least one article');
        return;
      }

      // Send to backend endpoint: POST /import/manual
      const response = await apiClient.post('/import/manual', {
        projectId,
        articles: manualArticles
      });

      // apiClient returns data directly (response interceptor unwraps it)
      const { imported } = response;
      toast.success(`Successfully imported ${imported} article${imported !== 1 ? 's' : ''}`);
      onOpenChange(false);
      resetForm();
      
    } catch (error) {
      console.error('Manual import error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to import articles');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleImport = () => {
    switch (mode) {
      case 'newsapi':
        return handleNewsAPIImport();
      case 'pdf':
        return handlePDFImport();
      case 'manual':
        return handleManualImport();
    }
  };

  const resetForm = () => {
    setBooleanQuery([]);
    setSelectedSources([]);
    setStartDate('');
    setEndDate('');
    setArticleCount(1000);
    setSelectedPDF(null);
    setPdfStatus('idle');
    setPdfProgress(0);
    setPdfMessage('');
    setPdfArticleCount(0);
    setManualArticles([]);
  };

  const handleClose = () => {
    if (!isSubmitting) {
      onOpenChange(false);
      // Don't reset on close, keep user's work
    }
  };

  const canSubmit = () => {
    switch (mode) {
      case 'newsapi':
        return booleanQuery.length > 0 && selectedSources.length > 0 && startDate && endDate;
      case 'pdf':
        return selectedPDF !== null && pdfStatus !== 'uploading';
      case 'manual':
        return manualArticles.length > 0;
      default:
        return false;
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-4xl bg-slate-900 border-slate-800 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-slate-100 text-xl">Import Articles</DialogTitle>
        </DialogHeader>

        <Tabs value={mode} onValueChange={(value) => setMode(value as ImportMode)} className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-slate-800">
            <TabsTrigger value="newsapi" className="data-[state=active]:bg-slate-950">
              <Search className="w-4 h-4 mr-2" />
              NewsAPI Search
            </TabsTrigger>
            <TabsTrigger value="pdf" className="data-[state=active]:bg-slate-950">
              <FileUp className="w-4 h-4 mr-2" />
              Factiva PDF
            </TabsTrigger>
            <TabsTrigger value="manual" className="data-[state=active]:bg-slate-950">
              <PenSquare className="w-4 h-4 mr-2" />
              Manual Entry
            </TabsTrigger>
          </TabsList>

          {/* NewsAPI Mode */}
          <TabsContent value="newsapi" className="space-y-4 mt-4">
            <BooleanQueryBuilder 
              value={booleanQuery} 
              onChange={setBooleanQuery}
              disabled={isSubmitting}
            />

            <SourceSelector
              sources={sources}
              selectedSources={selectedSources}
              onChange={setSelectedSources}
              disabled={isSubmitting}
            />

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startDate" className="text-slate-200">Start Date</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  disabled={isSubmitting}
                  className="bg-slate-800 border-slate-700 text-slate-100"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="endDate" className="text-slate-200">End Date</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  disabled={isSubmitting}
                  className="bg-slate-800 border-slate-700 text-slate-100"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="articleCount" className="text-slate-200">
                Article Count Limit (10-3000)
              </Label>
              <Input
                id="articleCount"
                type="number"
                min={10}
                max={3000}
                value={articleCount}
                onChange={(e) => setArticleCount(parseInt(e.target.value) || 1000)}
                disabled={isSubmitting}
                className="bg-slate-800 border-slate-700 text-slate-100"
              />
              <p className="text-xs text-slate-400">Default: 1000 articles</p>
            </div>
          </TabsContent>

          {/* PDF Mode */}
          <TabsContent value="pdf" className="space-y-4 mt-4">
            <PDFUploader
              onFileSelected={setSelectedPDF}
              disabled={isSubmitting}
              isUploading={pdfStatus === 'uploading'}
              uploadStatus={pdfStatus}
              uploadProgress={pdfProgress}
              uploadMessage={pdfMessage}
              extractedCount={pdfArticleCount}
            />
            
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
              <p className="text-blue-400 text-sm">
                <strong>Note:</strong> PDF will be processed on the server. The Factiva extraction logic 
                has been carefully tuned for metadata and content extraction.
              </p>
            </div>
          </TabsContent>

          {/* Manual Entry Mode */}
          <TabsContent value="manual" className="space-y-4 mt-4">
            <ManualArticleEntry
              onArticleAdded={(article) => setManualArticles([...manualArticles, article])}
              disabled={isSubmitting}
            />

            {manualArticles.length > 0 && (
              <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
                <div className="text-sm font-medium text-slate-200 mb-2 flex items-center justify-between">
                  <span>Articles to Import ({manualArticles.length}):</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setManualArticles([])}
                    className="text-slate-400 hover:text-red-400 h-7 text-xs"
                  >
                    Clear All
                  </Button>
                </div>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {manualArticles.map((article, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-slate-900/50 rounded">
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-slate-200 truncate">{article.title}</div>
                        <div className="text-xs text-slate-400">{article.source} • {article.publishDate}</div>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => setManualArticles(manualArticles.filter((_, i) => i !== index))}
                        className="text-slate-400 hover:text-red-400 h-7 w-7"
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Actions */}
        <div className="flex justify-end space-x-3 pt-4 border-t border-slate-800">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={isSubmitting || pdfStatus === 'uploading'}
            className="border-slate-700 text-slate-300 hover:bg-slate-800"
          >
            Cancel
          </Button>
          
          <Button
            type="button"
            onClick={handleImport}
            disabled={!canSubmit() || isSubmitting}
            className="bg-green-600 hover:bg-green-700 text-white disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                {mode === 'pdf' ? 'Processing...' : 'Importing...'}
              </>
            ) : (
              'Start Import'
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

