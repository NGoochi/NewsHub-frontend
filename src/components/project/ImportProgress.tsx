'use client';

import { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useSessionStatus, useCancelSession } from '@/lib/hooks/useImport';
import { Loader2, CheckCircle, XCircle, X } from 'lucide-react';

interface ImportProgressProps {
  sessionId: string;
  onComplete: () => void;
  onError: (error: string) => void;
}

export function ImportProgress({ sessionId, onComplete, onError }: ImportProgressProps) {
  const { data: session, isLoading } = useSessionStatus(sessionId);
  const cancelSession = useCancelSession();

  useEffect(() => {
    if (session?.status === 'completed') {
      onComplete();
    } else if (session?.status === 'failed') {
      onError(session.error || 'Import failed');
    }
  }, [session, onComplete, onError]);

  const handleCancel = async () => {
    try {
      await cancelSession.mutateAsync(sessionId);
    } catch (error) {
      console.error('Failed to cancel session:', error);
    }
  };

  if (isLoading || !session) {
    return (
      <Card className="bg-slate-900/40 border-slate-800/20">
        <CardContent className="p-4">
          <div className="flex items-center space-x-3">
            <Loader2 className="w-5 h-5 text-blue-400 animate-spin" />
            <span className="text-slate-300">Loading session status...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  const progressPercentage = session.articlesFound > 0 
    ? (session.articlesImported / session.articlesFound) * 100 
    : 0;

  return (
    <Card className="bg-slate-900/40 border-slate-800/20">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-slate-100 flex items-center space-x-2">
            {session.status === 'running' && <Loader2 className="w-4 h-4 text-blue-400 animate-spin" />}
            {session.status === 'completed' && <CheckCircle className="w-4 h-4 text-green-400" />}
            {session.status === 'failed' && <XCircle className="w-4 h-4 text-red-400" />}
            <span>
              {session.status === 'running' && 'Importing Articles'}
              {session.status === 'completed' && 'Import Completed'}
              {session.status === 'failed' && 'Import Failed'}
            </span>
          </CardTitle>
          
          {session.status === 'running' && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCancel}
              className="text-slate-400 hover:text-red-400 hover:bg-red-500/10"
            >
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="space-y-4">
          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Progress</span>
              <span className="text-slate-300">
                {session.articlesImported} / {session.articlesFound} articles
              </span>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-2">
              <div 
                className={`h-2 rounded-full transition-all duration-300 ${
                  session.status === 'completed' ? 'bg-green-600' :
                  session.status === 'failed' ? 'bg-red-600' : 'bg-blue-600'
                }`}
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>

          {/* Status Message */}
          <div className="text-sm">
            {session.status === 'running' && (
              <p className="text-slate-300">
                Importing articles from news sources... This may take a few minutes.
              </p>
            )}
            {session.status === 'completed' && (
              <p className="text-green-400">
                Successfully imported {session.articlesImported} articles!
              </p>
            )}
            {session.status === 'failed' && (
              <div className="text-red-400">
                <p>Import failed: {session.error}</p>
                <p className="text-xs text-slate-400 mt-1">
                  {session.articlesImported} articles were imported before the failure.
                </p>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
