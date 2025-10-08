'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, XCircle, Loader2, AlertCircle, X } from 'lucide-react';
import { AnalysisQueueItem } from '@/types';
import { useCreateBatch, useStartBatch, useBatchStatus, useCancelBatch } from '@/lib/hooks/useAnalysis';
import { toast } from 'sonner';

interface AnalysisQueueProps {
  projectId: string;
  articleIds: string[];
  onComplete: () => void;
  onCancel: () => void;
}

export function AnalysisQueue({ projectId, articleIds, onComplete, onCancel }: AnalysisQueueProps) {
  const [queue, setQueue] = useState<AnalysisQueueItem[]>([]);
  const [currentBatchIndex, setCurrentBatchIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const createBatch = useCreateBatch();
  const startBatch = useStartBatch();
  const cancelBatch = useCancelBatch();

  const currentBatch = queue[currentBatchIndex];
  const { data: batchStatus } = useBatchStatus(
    currentBatch?.batchId || '',
    !!currentBatch?.batchId && currentBatch.status === 'running'
  );

  // Initialize queue by splitting articles into chunks of 10
  useEffect(() => {
    const chunks: string[][] = [];
    for (let i = 0; i < articleIds.length; i += 10) {
      chunks.push(articleIds.slice(i, i + 10));
    }

    const initialQueue: AnalysisQueueItem[] = chunks.map((chunk) => ({
      batchId: null,
      articleIds: chunk,
      status: 'pending',
      progress: 0,
    }));

    setQueue(initialQueue);
  }, [articleIds]);

  // Start the first batch when queue is ready
  useEffect(() => {
    if (queue.length > 0 && currentBatchIndex === 0 && !queue[0].batchId) {
      processNextBatch();
    }
  }, [queue]);

  // Update current batch progress from polling
  useEffect(() => {
    if (batchStatus && currentBatch) {
      const progress = batchStatus.totalArticles > 0
        ? (batchStatus.processedArticles / batchStatus.totalArticles) * 100
        : 0;

      setQueue(prev => prev.map((item, idx) =>
        idx === currentBatchIndex
          ? { ...item, status: batchStatus.status, progress, error: batchStatus.error }
          : item
      ));

      // Handle batch completion
      if (batchStatus.status === 'completed') {
        handleBatchComplete();
      } else if (batchStatus.status === 'failed') {
        handleBatchFailed(batchStatus.error || 'Unknown error');
      }
    }
  }, [batchStatus]);

  const processNextBatch = async () => {
    if (isPaused || currentBatchIndex >= queue.length) return;

    const batch = queue[currentBatchIndex];
    if (!batch || batch.batchId) return;

    try {
      // Create batch
      const createResponse = await createBatch.mutateAsync({
        projectId,
        articleIds: batch.articleIds,
      });

      // Update queue with batch ID
      setQueue(prev => prev.map((item, idx) =>
        idx === currentBatchIndex
          ? { ...item, batchId: createResponse.batchId, status: 'running' }
          : item
      ));

      // Start batch processing
      await startBatch.mutateAsync(createResponse.batchId);
      
      toast.success(`Batch ${currentBatchIndex + 1} of ${queue.length} started`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to start batch';
      handleBatchFailed(errorMessage);
    }
  };

  const handleBatchComplete = () => {
    toast.success(`Batch ${currentBatchIndex + 1} of ${queue.length} completed`);

    // Move to next batch
    if (currentBatchIndex + 1 < queue.length) {
      setCurrentBatchIndex(prev => prev + 1);
      // Process next batch after a short delay
      setTimeout(() => processNextBatch(), 1000);
    } else {
      // All batches complete
      toast.success('All batches completed successfully!');
      onComplete();
    }
  };

  const handleBatchFailed = (error: string) => {
    setIsPaused(true);
    toast.error(`Batch ${currentBatchIndex + 1} failed: ${error}`);
    
    setQueue(prev => prev.map((item, idx) =>
      idx === currentBatchIndex
        ? { ...item, status: 'failed', error }
        : item
    ));
  };

  const handleRetry = () => {
    // Reset current batch
    setQueue(prev => prev.map((item, idx) =>
      idx === currentBatchIndex
        ? { ...item, batchId: null, status: 'pending', progress: 0, error: undefined }
        : item
    ));
    setIsPaused(false);
    processNextBatch();
  };

  const handleCancelQueue = async () => {
    if (currentBatch?.batchId && currentBatch.status === 'running') {
      try {
        await cancelBatch.mutateAsync(currentBatch.batchId);
      } catch (error) {
        console.error('Failed to cancel batch:', error);
      }
    }
    onCancel();
  };

  const totalArticles = articleIds.length;
  const processedArticles = queue
    .slice(0, currentBatchIndex)
    .reduce((sum, batch) => sum + batch.articleIds.length, 0) +
    (currentBatch?.progress ? Math.floor((currentBatch.progress / 100) * currentBatch.articleIds.length) : 0);
  const overallProgress = (processedArticles / totalArticles) * 100;

  return (
    <Card className="bg-slate-900/40 border-slate-800/20">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-slate-100">Analysis Queue</CardTitle>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleCancelQueue}
            className="text-slate-400 hover:text-slate-100"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Overall Progress */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-300">Overall Progress</span>
            <span className="text-slate-400">
              {processedArticles} / {totalArticles} articles
            </span>
          </div>
          <Progress value={overallProgress} className="h-2" />
        </div>

        {/* Batch List */}
        <div className="space-y-2">
          {queue.map((batch, index) => (
            <div
              key={index}
              className={`p-3 rounded-lg border ${
                index === currentBatchIndex
                  ? 'border-blue-600 bg-blue-600/10'
                  : 'border-slate-700/50 bg-slate-800/50'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {/* Status Icon */}
                  {batch.status === 'completed' && (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  )}
                  {batch.status === 'failed' && (
                    <XCircle className="w-5 h-5 text-red-500" />
                  )}
                  {batch.status === 'running' && (
                    <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />
                  )}
                  {batch.status === 'pending' && (
                    <AlertCircle className="w-5 h-5 text-slate-500" />
                  )}

                  <div>
                    <div className="text-sm font-medium text-slate-100">
                      Batch {index + 1} of {queue.length}
                    </div>
                    <div className="text-xs text-slate-400">
                      {batch.articleIds.length} articles
                    </div>
                  </div>
                </div>

                {/* Status Badge */}
                <Badge
                  variant="secondary"
                  className={
                    batch.status === 'completed'
                      ? 'bg-green-600 text-white'
                      : batch.status === 'failed'
                      ? 'bg-red-600 text-white'
                      : batch.status === 'running'
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-600 text-slate-200'
                  }
                >
                  {batch.status}
                </Badge>
              </div>

              {/* Batch Progress Bar */}
              {batch.status === 'running' && (
                <div className="mt-2">
                  <Progress value={batch.progress} className="h-1" />
                </div>
              )}

              {/* Error Message */}
              {batch.status === 'failed' && batch.error && (
                <div className="mt-2 text-xs text-red-400">
                  {batch.error}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Actions */}
        {isPaused && currentBatch?.status === 'failed' && (
          <div className="flex items-center space-x-2">
            <Button
              onClick={handleRetry}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
            >
              Retry Batch {currentBatchIndex + 1}
            </Button>
            <Button
              onClick={handleCancelQueue}
              variant="outline"
              className="flex-1 border-red-600 text-red-400 hover:bg-red-500/10"
            >
              Cancel Queue
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
