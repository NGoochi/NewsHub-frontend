'use client';

import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { useProject } from '@/lib/hooks/useProjects';
import { useArticles } from '@/lib/hooks/useArticles';
import { useQuotesByProject } from '@/lib/hooks/useQuotes';
import { usePreviewImport, useStartImport, useSessionStatus } from '@/lib/hooks/useImport';
import { AppHeader } from '@/components/layout/AppHeader';
import { ProjectSidebar } from '@/components/project/ProjectSidebar';
import { ArticlesTable } from '@/components/project/ArticlesTable';
import { ImportProgress } from '@/components/project/ImportProgress';
import { AnalysisQueue } from '@/components/project/AnalysisQueue';
import { DeleteConfirmDialog } from '@/components/dashboard/DeleteConfirmDialog';
import { toast } from 'sonner';

export default function ProjectPage() {
  const params = useParams();
  const projectId = params.id as string;
  const queryClient = useQueryClient();
  
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selectedArticles, setSelectedArticles] = useState<string[]>([]);
  const [analysisArticles, setAnalysisArticles] = useState<string[]>([]);

  const { data: project, isLoading: projectLoading, error: projectError } = useProject(projectId);
  const { data: articlesData, isLoading: articlesLoading, error: articlesError } = useArticles(projectId);
  const { data: quotesData, isLoading: quotesLoading } = useQuotesByProject(projectId);
  
  // Import hooks
  const previewImport = usePreviewImport();
  const startImport = useStartImport();
  const { data: sessionData } = useSessionStatus(activeSessionId || '', !!activeSessionId);

  const handleImportArticles = async (params: {
    searchTerms: string[];
    startDate: string;
    endDate: string;
    sourceIds?: string[];
    countryIds?: string[];
    languageIds?: string[];
  }) => {
    setIsImporting(true);
    try {
      // First, get a preview of the import
      const previewData = await previewImport.mutateAsync({
        projectId,
        searchTerms: params.searchTerms,
        startDate: params.startDate,
        endDate: params.endDate,
        sourceIds: params.sourceIds,
      });

      // Show preview information
      toast.info(`Found ${previewData.estimatedArticles} articles from ${previewData.sources.length} sources`);

      // Start the actual import
      const importResult = await startImport.mutateAsync({
        projectId,
        searchTerms: params.searchTerms,
        startDate: params.startDate,
        endDate: params.endDate,
        sourceIds: params.sourceIds,
      });

      // Set the active session for progress tracking
      setActiveSessionId(importResult.sessionId);
      toast.success('Import started! Progress will be tracked below.');
      
    } catch (error) {
      console.error('Import error:', error);
      toast.error(`Failed to import articles: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsImporting(false);
    }
  };

  const handleRunAnalysis = async (articleIds: string[]) => {
    if (articleIds.length === 0) {
      toast.error('Please select articles to analyze');
      return;
    }

    setIsAnalyzing(true);
    setAnalysisArticles(articleIds);
    toast.info(`Starting analysis for ${articleIds.length} articles...`);
  };

  const handleAnalysisComplete = () => {
    setIsAnalyzing(false);
    setAnalysisArticles([]);
    setSelectedArticles([]);
    
    // Invalidate queries to refresh data
    queryClient.invalidateQueries({ queryKey: ['articles', 'project', projectId] });
    queryClient.invalidateQueries({ queryKey: ['quotes', 'project', projectId] });
    queryClient.invalidateQueries({ queryKey: ['projects', projectId] });
    
    toast.success('Analysis completed successfully!');
  };

  const handleAnalysisCancel = () => {
    setIsAnalyzing(false);
    setAnalysisArticles([]);
    toast.info('Analysis cancelled');
  };

  const handleExportProject = () => {
    // TODO: Implement export logic in Phase 5
    toast.success('Export functionality will be implemented in Phase 5');
  };

  const handleDeleteProject = () => {
    setIsDeleteDialogOpen(true);
  };

  const handleImportStart = (sessionId: string) => {
    setActiveSessionId(sessionId);
    toast.success('Import started! Progress will be tracked below.');
  };

  const handleImportComplete = () => {
    setActiveSessionId(null);
    
    // Invalidate queries to refresh data
    queryClient.invalidateQueries({ queryKey: ['articles', 'project', projectId] });
    queryClient.invalidateQueries({ queryKey: ['projects', projectId] });
    
    toast.success('Import completed successfully!');
  };

  const handleImportError = (error: string) => {
    setActiveSessionId(null);
    toast.error(`Import failed: ${error}`);
  };


  // Handle session completion
  React.useEffect(() => {
    if (sessionData?.status === 'completed') {
      handleImportComplete();
    } else if (sessionData?.status === 'failed') {
      handleImportError(sessionData.error || 'Unknown error');
    }
  }, [sessionData]);

  if (projectLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-400">Loading project...</p>
        </div>
      </div>
    );
  }

  if (projectError || !project) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-slate-100 mb-2">Project not found</h2>
          <p className="text-slate-400 mb-4">
            {projectError?.message || 'The requested project could not be found.'}
          </p>
          <a href="/" className="text-blue-400 hover:text-blue-300">
            ← Back to Dashboard
          </a>
        </div>
      </div>
    );
  }

      return (
        <div className="min-h-screen bg-slate-950">
          {/* Header */}
          <AppHeader />
          
          <div className="flex">
            {/* Sidebar */}
            <ProjectSidebar
              project={project}
              onImportStart={handleImportStart}
              onRunAnalysis={handleRunAnalysis}
              onExportProject={handleExportProject}
              onDeleteProject={handleDeleteProject}
              isImporting={!!activeSessionId}
              isAnalyzing={isAnalyzing}
              selectedArticles={selectedArticles}
              analysisProgress={{
                total: articlesData?.length || 0,
                completed: articlesData?.filter(article => article.analysedAt).length || 0,
                failed: 0
              }}
            />

            {/* Main Content */}
            <div className="flex-1 flex flex-col">
              {/* Import Progress */}
              {activeSessionId && (
                <ImportProgress 
                  sessionId={activeSessionId}
                  onComplete={handleImportComplete}
                  onError={handleImportError}
                />
              )}

              {/* Analysis Queue */}
              {isAnalyzing && analysisArticles.length > 0 && (
                <div className="p-6 pb-0">
                <AnalysisQueue
                  projectId={projectId}
                  articleIds={analysisArticles}
                  onComplete={handleAnalysisComplete}
                  onCancel={handleAnalysisCancel}
                  queryClient={queryClient}
                />
                </div>
              )}

              {/* Articles Table */}
              <div className="flex-1 p-6">
                <ArticlesTable 
                  projectId={projectId}
                  articles={articlesData || []}
                  isLoading={articlesLoading}
                  selectedArticles={selectedArticles}
                  onSelectionChange={setSelectedArticles}
                  quotesData={quotesData || []}
                />
              </div>
            </div>
          </div>

          {/* Modals */}
          <DeleteConfirmDialog
            project={project}
            open={isDeleteDialogOpen}
            onOpenChange={setIsDeleteDialogOpen}
          />
        </div>
      );
}
