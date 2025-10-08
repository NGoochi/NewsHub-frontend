'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Project } from '@/types';
import { FileText, Calendar, TrendingUp } from 'lucide-react';

interface ProjectHeaderProps {
  project: Project;
}

export function ProjectHeader({ project }: ProjectHeaderProps) {
  const articleCount = project._count?.articles || 0;
  const analyzedCount = 0; // Placeholder for Phase 3
  const progressPercentage = articleCount > 0 ? (analyzedCount / articleCount) * 100 : 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Total Articles */}
      <Card className="bg-slate-900/40 border-slate-800/20">
        <CardContent className="p-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-500/10 rounded-lg">
              <FileText className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-slate-400">Total Articles</p>
              <p className="text-2xl font-semibold text-slate-100">{articleCount}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Analysis Progress */}
      <Card className="bg-slate-900/40 border-slate-800/20">
        <CardContent className="p-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-500/10 rounded-lg">
              <TrendingUp className="w-5 h-5 text-green-400" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-slate-400">Analysis Progress</p>
              <div className="flex items-center space-x-2 mt-1">
                <p className="text-2xl font-semibold text-slate-100">{analyzedCount}</p>
                <span className="text-slate-400">/ {articleCount}</span>
              </div>
              {articleCount > 0 && (
                <div className="w-full bg-slate-800 rounded-full h-2 mt-2">
                  <div 
                    className="bg-green-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${progressPercentage}%` }}
                  />
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Project Info */}
      <Card className="bg-slate-900/40 border-slate-800/20">
        <CardContent className="p-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-slate-500/10 rounded-lg">
              <Calendar className="w-5 h-5 text-slate-400" />
            </div>
            <div>
              <p className="text-sm text-slate-400">Created</p>
              <p className="text-sm font-medium text-slate-100">
                {new Date(project.createdAt).toLocaleDateString()}
              </p>
              <div className="mt-2">
                <Badge variant="secondary" className="bg-slate-800 text-slate-200">
                  {articleCount > 0 ? 'Active' : 'Empty'}
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
