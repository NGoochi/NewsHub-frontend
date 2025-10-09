'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { X, Plus } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export type BooleanOperator = 'AND' | 'OR' | 'NOT';

export interface BooleanTerm {
  id: string;
  type: 'term' | 'group';
  operator: BooleanOperator;
  value?: string;
  children?: BooleanTerm[];
}

interface BooleanQueryBuilderProps {
  onChange: (terms: BooleanTerm[]) => void;
  value?: BooleanTerm[];
  disabled?: boolean;
}

export function BooleanQueryBuilder({ onChange, value = [], disabled }: BooleanQueryBuilderProps) {
  const [terms, setTerms] = useState<BooleanTerm[]>(value);

  const updateTerms = (newTerms: BooleanTerm[]) => {
    setTerms(newTerms);
    onChange(newTerms);
  };

  const addTerm = (parentId?: string) => {
    const newTerm: BooleanTerm = {
      id: `term-${Date.now()}`,
      type: 'term',
      operator: 'AND',
      value: '',
    };

    if (parentId) {
      const addToParent = (items: BooleanTerm[]): BooleanTerm[] => {
        return items.map(item => {
          if (item.id === parentId && item.type === 'group') {
            return {
              ...item,
              children: [...(item.children || []), newTerm],
            };
          }
          if (item.children) {
            return {
              ...item,
              children: addToParent(item.children),
            };
          }
          return item;
        });
      };
      updateTerms(addToParent(terms));
    } else {
      updateTerms([...terms, newTerm]);
    }
  };

  const addGroup = (parentId?: string) => {
    const newGroup: BooleanTerm = {
      id: `group-${Date.now()}`,
      type: 'group',
      operator: 'AND',
      children: [],
    };

    if (parentId) {
      const addToParent = (items: BooleanTerm[]): BooleanTerm[] => {
        return items.map(item => {
          if (item.id === parentId && item.type === 'group') {
            return {
              ...item,
              children: [...(item.children || []), newGroup],
            };
          }
          if (item.children) {
            return {
              ...item,
              children: addToParent(item.children),
            };
          }
          return item;
        });
      };
      updateTerms(addToParent(terms));
    } else {
      updateTerms([...terms, newGroup]);
    }
  };

  const removeTerm = (id: string) => {
    const removeFromTerms = (items: BooleanTerm[]): BooleanTerm[] => {
      return items
        .filter(item => item.id !== id)
        .map(item => {
          if (item.children) {
            return {
              ...item,
              children: removeFromTerms(item.children),
            };
          }
          return item;
        });
    };
    updateTerms(removeFromTerms(terms));
  };

  const updateTerm = (id: string, updates: Partial<BooleanTerm>) => {
    const updateInTerms = (items: BooleanTerm[]): BooleanTerm[] => {
      return items.map(item => {
        if (item.id === id) {
          return { ...item, ...updates };
        }
        if (item.children) {
          return {
            ...item,
            children: updateInTerms(item.children),
          };
        }
        return item;
      });
    };
    updateTerms(updateInTerms(terms));
  };

  const renderTerm = (term: BooleanTerm, index: number, parentId?: string) => {
    const isFirst = index === 0;

    if (term.type === 'term') {
      return (
        <div key={term.id} className="flex items-center space-x-2 mb-2">
          {!isFirst && (
            <Select
              value={term.operator}
              onValueChange={(value) => updateTerm(term.id, { operator: value as BooleanOperator })}
              disabled={disabled}
            >
              <SelectTrigger className="w-20 bg-slate-800 border-slate-700 text-slate-100">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-700">
                <SelectItem value="AND" className="text-slate-100">AND</SelectItem>
                <SelectItem value="OR" className="text-slate-100">OR</SelectItem>
                <SelectItem value="NOT" className="text-slate-100">NOT</SelectItem>
              </SelectContent>
            </Select>
          )}
          <Input
            type="text"
            placeholder="Enter search term"
            value={term.value || ''}
            onChange={(e) => updateTerm(term.id, { value: e.target.value })}
            disabled={disabled}
            className="flex-1 bg-slate-800 border-slate-700 text-slate-100 placeholder:text-slate-400"
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => removeTerm(term.id)}
            disabled={disabled}
            className="text-slate-400 hover:text-red-400 hover:bg-slate-800"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      );
    }

    return (
      <div key={term.id} className="border border-slate-700 rounded-lg p-3 mb-2 bg-slate-800/50">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            {!isFirst && (
              <Select
                value={term.operator}
                onValueChange={(value) => updateTerm(term.id, { operator: value as BooleanOperator })}
                disabled={disabled}
              >
                <SelectTrigger className="w-20 bg-slate-800 border-slate-700 text-slate-100">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  <SelectItem value="AND" className="text-slate-100">AND</SelectItem>
                  <SelectItem value="OR" className="text-slate-100">OR</SelectItem>
                  <SelectItem value="NOT" className="text-slate-100">NOT</SelectItem>
                </SelectContent>
              </Select>
            )}
            <span className="text-sm font-medium text-slate-300">Group</span>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => addTerm(term.id)}
              disabled={disabled}
              className="text-slate-400 hover:text-slate-100 h-7 text-xs"
            >
              <Plus className="w-3 h-3 mr-1" />
              Term
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => addGroup(term.id)}
              disabled={disabled}
              className="text-slate-400 hover:text-slate-100 h-7 text-xs"
            >
              <Plus className="w-3 h-3 mr-1" />
              Group
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => removeTerm(term.id)}
              disabled={disabled}
              className="text-slate-400 hover:text-red-400 hover:bg-slate-800 h-7 w-7"
            >
              <X className="w-3 h-3" />
            </Button>
          </div>
        </div>
        <div className="pl-4 border-l-2 border-slate-700">
          {term.children && term.children.length > 0 ? (
            term.children.map((child, idx) => renderTerm(child, idx, term.id))
          ) : (
            <p className="text-sm text-slate-400 italic">Empty group - add terms or groups</p>
          )}
        </div>
      </div>
    );
  };

  const buildQueryString = (items: BooleanTerm[]): string => {
    if (!items || items.length === 0) return '';

    return items.map((term, index) => {
      const operator = index === 0 ? '' : ` ${term.operator} `;
      
      if (term.type === 'term') {
        return `${operator}"${term.value || ''}"`;
      } else if (term.type === 'group' && term.children) {
        const groupString = buildQueryString(term.children);
        return groupString ? `${operator}(${groupString})` : '';
      }
      return '';
    }).join('');
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-slate-200">Boolean Query Builder</label>
        <div className="flex space-x-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => addTerm()}
            disabled={disabled}
            className="border-slate-700 text-slate-300 hover:bg-slate-800 h-8"
          >
            <Plus className="w-3 h-3 mr-1" />
            Add Term
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => addGroup()}
            disabled={disabled}
            className="border-slate-700 text-slate-300 hover:bg-slate-800 h-8"
          >
            <Plus className="w-3 h-3 mr-1" />
            Add Group
          </Button>
        </div>
      </div>

      <div className="border border-slate-700 rounded-lg p-3 bg-slate-900/50 min-h-[100px]">
        {terms.length > 0 ? (
          terms.map((term, index) => renderTerm(term, index))
        ) : (
          <p className="text-sm text-slate-400 text-center py-6">
            Click &quot;Add Term&quot; or &quot;Add Group&quot; to start building your query
          </p>
        )}
      </div>

      {terms.length > 0 && (
        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-3">
          <div className="text-xs font-medium text-slate-400 mb-1">Query Preview:</div>
          <div className="text-sm text-slate-100 font-mono">
            {buildQueryString(terms) || '(empty query)'}
          </div>
        </div>
      )}
    </div>
  );
}

