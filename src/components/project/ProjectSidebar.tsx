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
  FileUp
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Project } from '@/types';
import { ImportModalNew } from './ImportModalNew';

interface ProjectSidebarProps {
  project: Project;
  onImportStart: (sessionId: string) => void;
  onRunAnalysis: (articleIds: string[]) => void;
  onExportProject: () => void;
  onDeleteProject: () => void;
  isImporting?: boolean;
  isAnalyzing?: boolean;
  selectedArticles?: string[];
  analysisProgress?: {
    total: number;
    completed: number;
    failed: number;
  };
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
  analysisProgress
}: ProjectSidebarProps) {
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

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
              {analysisProgress?.completed || 0} / {analysisProgress?.total || 0}
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
            disabled={isAnalyzing || selectedArticles.length === 0}
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
                Run Analysis {selectedArticles.length > 0 && `(${selectedArticles.length})`}
              </>
            )}
          </Button>

          {/* Analysis Status */}
          {analysisProgress && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-400">Progress</span>
                <span className="text-slate-200">
                  {analysisProgress.completed} / {analysisProgress.total}
                </span>
              </div>
              <div className="w-full bg-slate-700 rounded-full h-2">
                <div
                  className="bg-green-600 h-2 rounded-full transition-all duration-300"
                  style={{
                    width: `${(analysisProgress.completed / analysisProgress.total) * 100}%`
                  }}
                />
              </div>
              {analysisProgress.failed > 0 && (
                <div className="flex items-center text-sm text-red-400">
                  <span>{analysisProgress.failed} failed</span>
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
          <Button
            onClick={onExportProject}
            variant="outline"
            className="w-full border-slate-600 text-slate-300 hover:bg-slate-700"
          >
            <Download className="w-4 h-4 mr-2" />
            Export to Google Sheets
          </Button>

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
