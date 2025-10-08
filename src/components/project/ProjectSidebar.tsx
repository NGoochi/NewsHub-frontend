'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { MultiSelect } from '@/components/ui/multi-select';
import { 
  Search, 
  Calendar, 
  Filter, 
  Play, 
  Download, 
  Trash2, 
  Settings,
  BarChart3,
  Globe,
  Building
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Project } from '@/types';
import { useSources, useCountries, useLanguages } from '@/lib/hooks/useImport';

interface ProjectSidebarProps {
  project: Project;
  onImportArticles: (params: {
    searchTerms: string[];
    startDate: string;
    endDate: string;
    sourceIds?: string[];
    countryIds?: string[];
    languageIds?: string[];
  }) => void;
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
  onImportArticles,
  onRunAnalysis,
  onExportProject,
  onDeleteProject,
  isImporting = false,
  isAnalyzing = false,
  selectedArticles = [],
  analysisProgress
}: ProjectSidebarProps) {
  const [searchTerms, setSearchTerms] = useState<string[]>(['']);
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [selectedSources, setSelectedSources] = useState<string[]>([]);
  const [selectedCountries, setSelectedCountries] = useState<string[]>([]);
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([]);
  const [articleLimit, setArticleLimit] = useState<number>(100);

  // Fetch available options
  const { data: sources = [], isLoading: sourcesLoading } = useSources();
  const { data: countries = [], isLoading: countriesLoading } = useCountries();
  const { data: languages = [], isLoading: languagesLoading } = useLanguages();

  // Dynamic filtering logic
  const filteredSources = React.useMemo(() => {
    return sources.filter(source => {
      const countryMatch = selectedCountries.length === 0 || selectedCountries.includes(source.country);
      const languageMatch = selectedLanguages.length === 0 || selectedLanguages.includes(source.language);
      return countryMatch && languageMatch;
    });
  }, [sources, selectedCountries, selectedLanguages]);

  // Prepare options for multi-select components
  const countryOptions = countries.map(country => ({
    value: country,
    label: country
  }));

  const languageOptions = languages.map(language => ({
    value: language,
    label: language.charAt(0).toUpperCase() + language.slice(1).toLowerCase()
  }));

  const sourceOptions = filteredSources.map(source => ({
    value: source.sourceUri,
    label: `${source.title} (${source.country})`
  }));

  const handleAddSearchTerm = () => {
    setSearchTerms([...searchTerms, '']);
  };

  const handleRemoveSearchTerm = (index: number) => {
    if (searchTerms.length > 1) {
      setSearchTerms(searchTerms.filter((_, i) => i !== index));
    }
  };

  const handleSearchTermChange = (index: number, value: string) => {
    const newTerms = [...searchTerms];
    newTerms[index] = value;
    setSearchTerms(newTerms);
  };

  const handleImport = () => {
    const validTerms = searchTerms.filter(term => term.trim());
    if (validTerms.length === 0) {
      return;
    }

    onImportArticles({
      searchTerms: validTerms,
      startDate,
      endDate,
      sourceIds: selectedSources.length > 0 ? selectedSources : undefined,
      countryIds: selectedCountries.length > 0 ? selectedCountries : undefined,
      languageIds: selectedLanguages.length > 0 ? selectedLanguages : undefined
    });
  };

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

      {/* Search Parameters */}
      <Card className="bg-slate-800/50 border-slate-700/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-slate-100 text-base flex items-center">
            <Search className="w-4 h-4 mr-2" />
            Search Parameters
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search Terms */}
          <div className="space-y-2">
            <Label className="text-slate-300 text-sm">Keywords</Label>
            {searchTerms.map((term, index) => (
              <div key={index} className="flex items-center space-x-2">
                <Input
                  value={term}
                  onChange={(e) => handleSearchTermChange(index, e.target.value)}
                  placeholder="Enter search term..."
                  className="bg-slate-700/50 border-slate-600 text-slate-100"
                />
                {searchTerms.length > 1 && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemoveSearchTerm(index)}
                    className="text-red-400 hover:text-red-300"
                  >
                    ×
                  </Button>
                )}
              </div>
            ))}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleAddSearchTerm}
              className="text-blue-400 hover:text-blue-300"
            >
              + Add keyword
            </Button>
          </div>

          {/* Date Range */}
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <Label className="text-slate-300 text-sm">Start Date</Label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="bg-slate-700/50 border-slate-600 text-slate-100"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-slate-300 text-sm">End Date</Label>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="bg-slate-700/50 border-slate-600 text-slate-100"
              />
            </div>
          </div>

          {/* Article Limit */}
          <div className="space-y-1">
            <Label className="text-slate-300 text-sm">Article Limit</Label>
            <Input
              type="number"
              value={articleLimit}
              onChange={(e) => setArticleLimit(Number(e.target.value))}
              min="1"
              max="1000"
              className="bg-slate-700/50 border-slate-600 text-slate-100"
            />
          </div>

          {/* Language Filter */}
          <div className="space-y-1">
            <Label className="text-slate-300 text-sm flex items-center">
              <Globe className="w-3 h-3 mr-1" />
              Languages
            </Label>
            <MultiSelect
              options={languageOptions}
              selected={selectedLanguages}
              onChange={setSelectedLanguages}
              placeholder="Select languages..."
              disabled={languagesLoading}
            />
          </div>

          {/* Country Filter */}
          <div className="space-y-1">
            <Label className="text-slate-300 text-sm flex items-center">
              <Building className="w-3 h-3 mr-1" />
              Countries
            </Label>
            <MultiSelect
              options={countryOptions}
              selected={selectedCountries}
              onChange={setSelectedCountries}
              placeholder="Select countries..."
              disabled={countriesLoading}
            />
          </div>

          {/* News Outlets Filter */}
          <div className="space-y-1">
            <Label className="text-slate-300 text-sm flex items-center">
              <Filter className="w-3 h-3 mr-1" />
              News Outlets
            </Label>
            <MultiSelect
              options={sourceOptions}
              selected={selectedSources}
              onChange={setSelectedSources}
              placeholder="Select outlets..."
              disabled={sourcesLoading}
            />
            {selectedCountries.length > 0 || selectedLanguages.length > 0 ? (
              <p className="text-xs text-slate-400 mt-1">
                Showing {filteredSources.length} outlets matching your filters
              </p>
            ) : null}
          </div>

          {/* Import Button */}
          <Button
            onClick={handleImport}
            disabled={isImporting || searchTerms.every(term => !term.trim())}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
          >
            {isImporting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                Importing...
              </>
            ) : (
              <>
                <Search className="w-4 h-4 mr-2" />
                Fetch New Articles
              </>
            )}
          </Button>
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
    </div>
  );
}
