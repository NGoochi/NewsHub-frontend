'use client';

import { useState, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, X, Globe, MapPin, Languages } from 'lucide-react';
import { Source } from '@/types';

interface SourceSelectorProps {
  sources: Source[];
  selectedSources: string[];
  onChange: (selectedIds: string[]) => void;
  disabled?: boolean;
}

export function SourceSelector({ sources, selectedSources, onChange, disabled }: SourceSelectorProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [regionFilter, setRegionFilter] = useState<string>('all');
  const [countryFilter, setCountryFilter] = useState<string>('all');
  const [languageFilter, setLanguageFilter] = useState<string>('all');

  // Extract unique values for filters
  const { regions, countries, languages } = useMemo(() => {
    const regionsSet = new Set<string>();
    const countriesSet = new Set<string>();
    const languagesSet = new Set<string>();

    sources.forEach(source => {
      const s = source as any;
      if (s.region) regionsSet.add(s.region);
      if (source.country) countriesSet.add(source.country);
      if (source.language) languagesSet.add(source.language);
    });

    return {
      regions: Array.from(regionsSet).sort(),
      countries: Array.from(countriesSet).sort(),
      languages: Array.from(languagesSet).sort(),
    };
  }, [sources]);

  // Filter sources based on search and filters
  const filteredSources = useMemo(() => {
    return sources.filter(source => {
      const s = source as any;
      
      // Search term filter
      if (searchTerm && !source.title.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false;
      }

      // Region filter
      if (regionFilter !== 'all' && s.region !== regionFilter) {
        return false;
      }

      // Country filter
      if (countryFilter !== 'all' && source.country !== countryFilter) {
        return false;
      }

      // Language filter
      if (languageFilter !== 'all' && source.language !== languageFilter) {
        return false;
      }

      return true;
    });
  }, [sources, searchTerm, regionFilter, countryFilter, languageFilter]);

  const toggleSource = (sourceId: string) => {
    if (disabled) return;
    
    if (selectedSources.includes(sourceId)) {
      onChange(selectedSources.filter(id => id !== sourceId));
    } else {
      onChange([...selectedSources, sourceId]);
    }
  };

  const selectAll = () => {
    if (disabled) return;
    onChange(filteredSources.map(s => s.id));
  };

  const clearAll = () => {
    if (disabled) return;
    onChange([]);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setRegionFilter('all');
    setCountryFilter('all');
    setLanguageFilter('all');
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-slate-200 flex items-center space-x-2">
          <Globe className="w-4 h-4" />
          <span>News Sources</span>
        </label>
        <div className="flex space-x-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={selectAll}
            disabled={disabled || filteredSources.length === 0}
            className="border-slate-700 text-slate-300 hover:bg-slate-800 h-7 text-xs"
          >
            Select All ({filteredSources.length})
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={clearAll}
            disabled={disabled || selectedSources.length === 0}
            className="border-slate-700 text-slate-300 hover:bg-slate-800 h-7 text-xs"
          >
            Clear All
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="space-y-2">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            type="text"
            placeholder="Search sources..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            disabled={disabled}
            className="pl-9 bg-slate-800 border-slate-700 text-slate-100 placeholder:text-slate-400"
          />
        </div>

        <div className="grid grid-cols-3 gap-2">
          <Select value={regionFilter} onValueChange={setRegionFilter} disabled={disabled}>
            <SelectTrigger className="bg-slate-800 border-slate-700 text-slate-100">
              <MapPin className="w-3 h-3 mr-1" />
              <SelectValue placeholder="Region" />
            </SelectTrigger>
            <SelectContent className="bg-slate-800 border-slate-700">
              <SelectItem value="all" className="text-slate-100">All Regions</SelectItem>
              {regions.map(region => (
                <SelectItem key={region} value={region} className="text-slate-100">
                  {region}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={countryFilter} onValueChange={setCountryFilter} disabled={disabled}>
            <SelectTrigger className="bg-slate-800 border-slate-700 text-slate-100">
              <Globe className="w-3 h-3 mr-1" />
              <SelectValue placeholder="Country" />
            </SelectTrigger>
            <SelectContent className="bg-slate-800 border-slate-700">
              <SelectItem value="all" className="text-slate-100">All Countries</SelectItem>
              {countries.map(country => (
                <SelectItem key={country} value={country} className="text-slate-100">
                  {country}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={languageFilter} onValueChange={setLanguageFilter} disabled={disabled}>
            <SelectTrigger className="bg-slate-800 border-slate-700 text-slate-100">
              <Languages className="w-3 h-3 mr-1" />
              <SelectValue placeholder="Language" />
            </SelectTrigger>
            <SelectContent className="bg-slate-800 border-slate-700">
              <SelectItem value="all" className="text-slate-100">All Languages</SelectItem>
              {languages.map(language => (
                <SelectItem key={language} value={language} className="text-slate-100">
                  {language}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {(searchTerm || regionFilter !== 'all' || countryFilter !== 'all' || languageFilter !== 'all') && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            disabled={disabled}
            className="text-slate-400 hover:text-slate-100 h-7 text-xs"
          >
            <X className="w-3 h-3 mr-1" />
            Clear Filters
          </Button>
        )}
      </div>

      {/* Sources List */}
      <div className="border border-slate-700 rounded-lg bg-slate-900/50 max-h-64 overflow-y-auto">
        {filteredSources.length > 0 ? (
          <div className="p-2 space-y-1">
            {filteredSources.map(source => {
              const s = source as any;
              return (
                <div
                  key={source.id}
                  className="flex items-center space-x-2 p-2 rounded hover:bg-slate-800/50 transition-colors cursor-pointer"
                  onClick={() => toggleSource(source.id)}
                >
                  <Checkbox
                    checked={selectedSources.includes(source.id)}
                    disabled={disabled}
                    className="border-slate-600"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm text-slate-200 font-medium truncate">
                      {source.title}
                    </div>
                    <div className="text-xs text-slate-400 flex items-center space-x-2">
                      {source.country && <span>{source.country}</span>}
                      {s.region && source.country && <span>•</span>}
                      {s.region && <span>{s.region}</span>}
                      {source.language && (s.region || source.country) && <span>•</span>}
                      {source.language && <span>{source.language}</span>}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-8 text-center text-slate-400 text-sm">
            No sources match your filters
          </div>
        )}
      </div>

      {/* Selected Sources Summary */}
      {selectedSources.length > 0 && (
        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-3">
          <div className="text-xs font-medium text-slate-400 mb-2">
            Selected Sources ({selectedSources.length}):
          </div>
          <div className="flex flex-wrap gap-1">
            {selectedSources.slice(0, 10).map(sourceId => {
              const source = sources.find(s => s.id === sourceId);
              return source ? (
                <Badge
                  key={sourceId}
                  variant="secondary"
                  className="bg-blue-600 text-white text-xs"
                >
                  {source.title}
                </Badge>
              ) : null;
            })}
            {selectedSources.length > 10 && (
              <Badge variant="secondary" className="bg-slate-700 text-slate-300 text-xs">
                +{selectedSources.length - 10} more
              </Badge>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

