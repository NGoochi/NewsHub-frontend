'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Play, 
  Download, 
  Trash2, 
  BarChart3,
  FileUp,
  Loader2,
  Clock,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Project } from '@/types';
import { ImportModalNew } from './ImportModalNew';
import { AnalysisProgress } from './AnalysisQueue';
import { Progress } from '@/components/ui/progress';

interface ProjectSidebarProps {
  project: Project;
  onImportStart: (sessionId: string) => void;
  onRunAnalysis: (articleIds: string[]) => void;
  onExportProject: () => void;
  onDeleteProject: () => void;
  isImporting?: boolean;
  isAnalyzing?: boolean;
  selectedArticles?: string[];
  analysisProgress?: AnalysisProgress | null;
  totalArticles?: number;
  analyzedArticles?: number;
  analysisStatus?: {
    type: 'idle' | 'starting' | 'running' | 'completed' | 'error';
    message?: string;
  };
  batchNotifications?: Array<{
    id: string;
    message: string;
    type: 'success' | 'error' | 'info';
    timestamp: number;
  }>;
  articles?: Array<{ id: string; analysedAt?: string | null }>;
}

export function ProjectSidebar({
  project,
  onImportStart,
  onRunAnalysis,
  onExportProject,
  onDeleteProject,
  isImporting = false,
  isAnalyzing = false,
  selectedArticles = [],
  analysisProgress = null,
  totalArticles = 0,
  analyzedArticles = 0,
  analysisStatus = { type: 'idle' },
  batchNotifications = [],
  articles = []
}: ProjectSidebarProps) {
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  // Calculate unanalyzed articles in selection
  const unanalyzedSelectedCount = selectedArticles.filter(id => {
    const article = articles.find(a => a.id === id);
    return article && !article.analysedAt;
  }).length;

  const handleRunAnalysis = () => {
    if (selectedArticles.length === 0) {
      return;
    }
    onRunAnalysis(selectedArticles);
  };

  return (
    <div className="w-160 bg-slate-900/40 border-r border-slate-800/20 p-6 space-y-6">
      {/* Project Info */}
      <Card className="bg-slate-800/50 border-slate-700/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-slate-100 text-lg">{project.name}</CardTitle>
          {project.description && (
            <p className="text-slate-400 text-sm">{project.description}</p>
          )}
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-400">Created</span>
            <span className="text-slate-200">
              {formatDistanceToNow(new Date(project.createdAt), { addSuffix: true })}
            </span>
          </div>
          
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-400">Articles</span>
            <span className="text-slate-200">
              {project._count?.articles || 0} total
            </span>
          </div>

          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-400">Analyzed</span>
            <span className="text-slate-200">
              {analyzedArticles} / {totalArticles}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Import Articles */}
      <Card className="bg-slate-800/50 border-slate-700/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-slate-100 text-base flex items-center">
            <FileUp className="w-4 h-4 mr-2" />
            Import Articles
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Button
            onClick={() => setIsImportModalOpen(true)}
            disabled={isImporting}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
          >
            <FileUp className="w-4 h-4 mr-2" />
            Import Articles
          </Button>
          <p className="text-xs text-slate-400 mt-2">
            Import from NewsAPI, upload PDFs, or enter manually
          </p>
        </CardContent>
      </Card>

      {/* Analysis Controls */}
      <Card className="bg-slate-800/50 border-slate-700/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-slate-100 text-base flex items-center">
            <BarChart3 className="w-4 h-4 mr-2" />
            Analysis Controls
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Checkbox id="article-analysis" defaultChecked />
              <Label htmlFor="article-analysis" className="text-slate-300 text-sm">
                Article Analysis
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox id="quotes-extraction" defaultChecked />
              <Label htmlFor="quotes-extraction" className="text-slate-300 text-sm">
                Quotes Extraction
              </Label>
            </div>
          </div>

          <Button
            onClick={handleRunAnalysis}
            disabled={isAnalyzing || unanalyzedSelectedCount === 0}
            className="w-full bg-green-600 hover:bg-green-700 text-white"
          >
            {isAnalyzing ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                Analyzing...
              </>
            ) : (
              <>
                <Play className="w-4 h-4 mr-2" />
                Run Analysis {unanalyzedSelectedCount > 0 && `(${unanalyzedSelectedCount})`}
              </>
            )}
          </Button>

          {/* Status Messages */}
          {analysisStatus.type !== 'idle' && (
            <div className={`text-xs p-2.5 rounded-lg border ${
              analysisStatus.type === 'error' 
                ? 'bg-red-500/10 border-red-500/30 text-red-400'
                : analysisStatus.type === 'completed'
                ? 'bg-green-500/10 border-green-500/30 text-green-400'
                : 'bg-blue-500/10 border-blue-500/30 text-blue-400'
            }`}>
              <div className="flex items-start space-x-2">
                {analysisStatus.type === 'error' && <XCircle className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />}
                {analysisStatus.type === 'completed' && <CheckCircle className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />}
                {analysisStatus.type === 'starting' && <Loader2 className="w-3.5 h-3.5 mt-0.5 flex-shrink-0 animate-spin" />}
                {analysisStatus.type === 'running' && <Loader2 className="w-3.5 h-3.5 mt-0.5 flex-shrink-0 animate-spin" />}
                <span className="flex-1">{analysisStatus.message}</span>
              </div>
            </div>
          )}

          {/* Batch Notifications */}
          {batchNotifications.length > 0 && (
            <div className="space-y-2">
              {batchNotifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`text-xs p-2 rounded-lg border ${
                    notification.type === 'error'
                      ? 'bg-red-500/10 border-red-500/30 text-red-400'
                      : notification.type === 'success'
                      ? 'bg-green-500/10 border-green-500/30 text-green-400'
                      : 'bg-blue-500/10 border-blue-500/30 text-blue-400'
                  }`}
                >
                  <div className="flex items-start space-x-2">
                    {notification.type === 'error' && <XCircle className="w-3 h-3 mt-0.5 flex-shrink-0" />}
                    {notification.type === 'success' && <CheckCircle className="w-3 h-3 mt-0.5 flex-shrink-0" />}
                    {notification.type === 'info' && <Loader2 className="w-3 h-3 mt-0.5 flex-shrink-0 animate-spin" />}
                    <span className="flex-1">{notification.message}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Analysis Progress */}
          {isAnalyzing && analysisProgress && (
            <div className="space-y-3 pt-2 border-t border-slate-700">
              {/* Batch Info */}
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400 flex items-center">
                  <Loader2 className="w-3 h-3 mr-1.5 animate-spin" />
                  Batch {analysisProgress.currentBatch} of {analysisProgress.totalBatches}
                </span>
                <span className="text-blue-400 font-mono">
                  {Math.floor(analysisProgress.batchElapsedTime / 60)}:{(analysisProgress.batchElapsedTime % 60).toString().padStart(2, '0')}
                </span>
              </div>

              {/* Three-Layer Progress Bar */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Overall Progress</span>
                  <span className="text-slate-300">
                    {analyzedArticles} / {totalArticles} analyzed
                  </span>
                </div>
                <div className="relative w-full h-3 bg-slate-800 rounded-full overflow-hidden">
                  {/* Base layer - Total articles (gray) */}
                  <div className="absolute inset-0 bg-slate-700 rounded-full" />
                  
                  {/* Target layer - Articles queued for analysis (light green) */}
                  <div 
                    className="absolute inset-0 bg-green-400/30 rounded-full transition-all duration-300"
                    style={{ width: `${(analyzedArticles + analysisProgress.currentBatchArticles.length) / totalArticles * 100}%` }}
                  />
                  
                  {/* Completed layer - Analyzed articles (dark green) */}
                  <div 
                    className="absolute inset-0 bg-green-600 rounded-full transition-all duration-300"
                    style={{ width: `${analyzedArticles / totalArticles * 100}%` }}
                  />
                </div>
              </div>

              {/* Overall Timer */}
              {analysisProgress.overallElapsedTime > 30 && (
                <div className="text-xs text-amber-400 bg-amber-400/10 border border-amber-400/20 rounded p-2">
                  ⏱️ Token-heavy articles may take 3-5 minutes per batch
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Utility Actions */}
      <Card className="bg-slate-800/50 border-slate-700/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-slate-100 text-base">Actions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Export to Google Sheets button hidden */}
          {/* <Button
            onClick={onExportProject}
            variant="outline"
            className="w-full border-slate-600 text-slate-300 hover:bg-slate-700"
          >
            <Download className="w-4 h-4 mr-2" />
            Export to Google Sheets
          </Button> */}

          <Button
            onClick={onDeleteProject}
            variant="outline"
            className="w-full border-red-600 text-red-400 hover:bg-red-500/10"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Delete Project
          </Button>
        </CardContent>
      </Card>

      {/* Import Modal */}
      <ImportModalNew
        projectId={project.id}
        open={isImportModalOpen}
        onOpenChange={setIsImportModalOpen}
        onImportStart={onImportStart}
      />
    </div>
  );
}
