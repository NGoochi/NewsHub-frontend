'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit, Trash2, ExternalLink, Calendar, FileText } from 'lucide-react';
import { Project } from '@/types';
import { formatDistanceToNow } from 'date-fns';

interface ProjectCardProps {
  project: Project;
  onEdit: (project: Project) => void;
  onDelete: (project: Project) => void;
  onView: (project: Project) => void;
}

export function ProjectCard({ project, onEdit, onDelete, onView }: ProjectCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  const articleCount = project._count?.articles || project.articles?.length || 0;
  const analyzedCount = 0; // Placeholder for Phase 3
  const progressPercentage = articleCount > 0 ? (analyzedCount / articleCount) * 100 : 0;

  return (
    <Card 
      className="bg-slate-900/40 rounded-2xl shadow-md border border-slate-800/20 hover:border-slate-700/40 transition-all duration-200 cursor-pointer group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => onView(project)}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-slate-100 truncate group-hover:text-blue-400 transition-colors">
              {project.name}
            </h3>
            {project.description && (
              <p className="text-sm text-slate-400 mt-1 line-clamp-2">
                {project.description}
              </p>
            )}
          </div>
          
          {/* Action buttons - show on hover */}
          <div className={`flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity ${isHovered ? 'opacity-100' : ''}`}>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-slate-400 hover:text-blue-400 hover:bg-blue-500/10"
              onClick={(e) => {
                e.stopPropagation();
                onEdit(project);
              }}
            >
              <Edit className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-slate-400 hover:text-red-400 hover:bg-red-500/10"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(project);
              }}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        {/* Stats */}
        <div className="space-y-3">
          {/* Article count */}
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-2 text-slate-400">
              <FileText className="w-4 h-4" />
              <span>Articles</span>
            </div>
            <Badge variant="secondary" className="bg-slate-800 text-slate-200">
              {articleCount}
            </Badge>
          </div>

          {/* Progress bar - placeholder for Phase 3 */}
          {articleCount > 0 && (
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>Analysis Progress</span>
                <span>{analyzedCount}/{articleCount}</span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
            </div>
          )}

          {/* Created date */}
          <div className="flex items-center space-x-2 text-xs text-slate-500">
            <Calendar className="w-3 h-3" />
            <span>
              Created {formatDistanceToNow(new Date(project.createdAt), { addSuffix: true })}
            </span>
          </div>

          {/* View project link */}
          <div className="flex items-center space-x-2 text-xs text-blue-400 group-hover:text-blue-300 transition-colors">
            <ExternalLink className="w-3 h-3" />
            <span>View Project</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
