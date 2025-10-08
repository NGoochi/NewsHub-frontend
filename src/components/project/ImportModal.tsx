'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { usePreviewImport, useStartImport } from '@/lib/hooks/useImport';
import { useSources, useCountries, useLanguages } from '@/lib/hooks/useImport';
import { toast } from 'sonner';
import { Loader2, Search, Calendar, Globe, Languages, CheckCircle } from 'lucide-react';

const importSchema = z.object({
  searchTerms: z.string().min(1, 'At least one search term is required'),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().min(1, 'End date is required'),
  sourceIds: z.array(z.string()).optional(),
});

type ImportForm = z.infer<typeof importSchema>;

interface ImportModalProps {
  projectId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImportStart: (sessionId: string) => void;
}

export function ImportModal({ projectId, open, onOpenChange, onImportStart }: ImportModalProps) {
  const [previewData, setPreviewData] = useState<any>(null);
  const [selectedSources, setSelectedSources] = useState<string[]>([]);
  const [isPreviewing, setIsPreviewing] = useState(false);
  const [isStarting, setIsStarting] = useState(false);

  const previewImport = usePreviewImport();
  const startImport = useStartImport();
  const { data: sources = [] } = useSources();
  const { data: countries = [] } = useCountries();
  const { data: languages = [] } = useLanguages();

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    reset,
  } = useForm<ImportForm>({
    resolver: zodResolver(importSchema),
    defaultValues: {
      searchTerms: '',
      startDate: '',
      endDate: '',
      sourceIds: [],
    },
  });

  const searchTerms = watch('searchTerms');
  const startDate = watch('startDate');
  const endDate = watch('endDate');

  const handlePreview = async (data: ImportForm) => {
    setIsPreviewing(true);
    
    try {
      const result = await previewImport.mutateAsync({
        projectId,
        searchTerms: data.searchTerms.split(',').map(term => term.trim()),
        sourceIds: selectedSources.length > 0 ? selectedSources : undefined,
        startDate: data.startDate,
        endDate: data.endDate,
      });
      
      setPreviewData(result);
      toast.success(`Found ${result.estimatedArticles} articles`);
    } catch (error) {
      toast.error(
        error instanceof Error 
          ? error.message 
          : 'Failed to preview import'
      );
    } finally {
      setIsPreviewing(false);
    }
  };

  const handleStartImport = async (data: ImportForm) => {
    if (!previewData) return;
    
    setIsStarting(true);
    
    try {
      const result = await startImport.mutateAsync({
        projectId,
        searchTerms: data.searchTerms.split(',').map(term => term.trim()),
        sourceIds: selectedSources.length > 0 ? selectedSources : undefined,
        startDate: data.startDate,
        endDate: data.endDate,
      });
      
      onImportStart(result.sessionId);
      reset();
      setPreviewData(null);
      setSelectedSources([]);
    } catch (error) {
      toast.error(
        error instanceof Error 
          ? error.message 
          : 'Failed to start import'
      );
    } finally {
      setIsStarting(false);
    }
  };

  const handleClose = () => {
    if (!isPreviewing && !isStarting) {
      reset();
      setPreviewData(null);
      setSelectedSources([]);
      onOpenChange(false);
    }
  };

  const toggleSource = (sourceId: string) => {
    setSelectedSources(prev => 
      prev.includes(sourceId) 
        ? prev.filter(id => id !== sourceId)
        : [...prev, sourceId]
    );
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-2xl bg-slate-900 border-slate-800 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-slate-100">Import Articles</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit(handlePreview)} className="space-y-6">
          {/* Search Terms */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-200 flex items-center space-x-2">
              <Search className="w-4 h-4" />
              <span>Search Terms *</span>
            </label>
            <Textarea
              {...register('searchTerms')}
              placeholder="Enter search terms separated by commas (e.g., climate change, COP30, global warming)"
              className="bg-slate-800 border-slate-700 text-slate-100 placeholder:text-slate-400 focus:border-blue-500 min-h-[80px]"
              disabled={isPreviewing || isStarting}
            />
            {errors.searchTerms && (
              <p className="text-sm text-red-400">{errors.searchTerms.message}</p>
            )}
          </div>

          {/* Date Range */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-200 flex items-center space-x-2">
                <Calendar className="w-4 h-4" />
                <span>Start Date *</span>
              </label>
              <Input
                type="date"
                {...register('startDate')}
                className="bg-slate-800 border-slate-700 text-slate-100 focus:border-blue-500"
                disabled={isPreviewing || isStarting}
              />
              {errors.startDate && (
                <p className="text-sm text-red-400">{errors.startDate.message}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-200 flex items-center space-x-2">
                <Calendar className="w-4 h-4" />
                <span>End Date *</span>
              </label>
              <Input
                type="date"
                {...register('endDate')}
                className="bg-slate-800 border-slate-700 text-slate-100 focus:border-blue-500"
                disabled={isPreviewing || isStarting}
              />
              {errors.endDate && (
                <p className="text-sm text-red-400">{errors.endDate.message}</p>
              )}
            </div>
          </div>

          {/* Source Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-200 flex items-center space-x-2">
              <Globe className="w-4 h-4" />
              <span>News Sources (Optional)</span>
            </label>
            <div className="max-h-32 overflow-y-auto border border-slate-700 rounded-lg p-2 bg-slate-800/50">
              {sources.slice(0, 20).map((source) => (
                <button
                  key={source.id}
                  type="button"
                  onClick={() => toggleSource(source.id)}
                  className={`w-full text-left px-2 py-1 rounded text-sm transition-colors ${
                    selectedSources.includes(source.id)
                      ? 'bg-blue-600 text-white'
                      : 'text-slate-300 hover:bg-slate-700'
                  }`}
                  disabled={isPreviewing || isStarting}
                >
                  {source.title} ({source.country})
                </button>
              ))}
              {sources.length > 20 && (
                <p className="text-xs text-slate-400 px-2 py-1">
                  ... and {sources.length - 20} more sources
                </p>
              )}
            </div>
            {selectedSources.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {selectedSources.map(sourceId => {
                  const source = sources.find(s => s.id === sourceId);
                  return source ? (
                    <Badge key={sourceId} variant="secondary" className="bg-blue-600 text-white">
                      {source.title}
                    </Badge>
                  ) : null;
                })}
              </div>
            )}
          </div>

          {/* Preview Results */}
          {previewData && (
            <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <CheckCircle className="w-4 h-4 text-green-400" />
                <span className="text-sm font-medium text-slate-200">Preview Results</span>
              </div>
              <p className="text-slate-300 text-sm">
                <strong>{previewData.estimatedArticles}</strong> articles found from{' '}
                <strong>{previewData.sources.length}</strong> sources
              </p>
              <p className="text-slate-400 text-xs mt-1">
                Date range: {previewData.dateRange.start} to {previewData.dateRange.end}
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isPreviewing || isStarting}
              className="border-slate-700 text-slate-300 hover:bg-slate-800"
            >
              Cancel
            </Button>
            
            {!previewData ? (
              <Button
                type="submit"
                disabled={isPreviewing || !searchTerms?.trim() || !startDate || !endDate}
                className="bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50"
              >
                {isPreviewing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Previewing...
                  </>
                ) : (
                  'Preview Import'
                )}
              </Button>
            ) : (
              <Button
                type="button"
                onClick={handleSubmit(handleStartImport)}
                disabled={isStarting}
                className="bg-green-600 hover:bg-green-700 text-white disabled:opacity-50"
              >
                {isStarting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Starting...
                  </>
                ) : (
                  'Start Import'
                )}
              </Button>
            )}
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
