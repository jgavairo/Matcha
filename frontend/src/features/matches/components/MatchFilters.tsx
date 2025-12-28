import React from 'react';
import { Button, Label, RangeSlider, Select, TextInput } from 'flowbite-react';
import { HiAdjustments, HiSortAscending, HiSortDescending } from 'react-icons/hi';
import { MatchFiltersState } from '../types/match';
import { DEFAULT_FILTERS } from '../hooks/useMatches';
import { INTERESTS } from '../../../data/mockUsers';

interface MatchFiltersProps {
  filters: MatchFiltersState;
  onFilterChange: (filters: MatchFiltersState) => void;
  mode?: 'discover' | 'search';
  className?: string;
}

const MatchFilters: React.FC<MatchFiltersProps> = ({ filters, onFilterChange, mode = 'discover', className }) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const [localFilters, setLocalFilters] = React.useState<MatchFiltersState>(filters);

  // Check if current filters are different from defaults (ignoring sort)
  const hasActiveFilters = React.useMemo(() => {
    const { sortBy, sortOrder, ...filterCriteria } = filters;
    const { sortBy: defaultSortBy, sortOrder: defaultSortOrder, ...defaultCriteria } = DEFAULT_FILTERS;
    return JSON.stringify(filterCriteria) !== JSON.stringify(defaultCriteria);
  }, [filters]);

  const handleApply = () => {
    onFilterChange(localFilters);
    setIsOpen(false);
  };

  const handleReset = () => {
    setLocalFilters(DEFAULT_FILTERS);
    onFilterChange(DEFAULT_FILTERS);
    setIsOpen(false);
  };

  const handleChange = (key: keyof MatchFiltersState, value: any) => {
    setLocalFilters(prev => ({ ...prev, [key]: value }));
  };

  const toggleTag = (tag: string) => {
    const currentTags = localFilters.tags || [];
    const newTags = currentTags.includes(tag)
      ? currentTags.filter(t => t !== tag)
      : [...currentTags, tag];
    handleChange('tags', newTags);
  };

  return (
    <div className={className || "absolute top-4 left-4 z-30"}>
      <Button color="light" pill onClick={() => setIsOpen(!isOpen)} className="relative">
        <HiAdjustments className="mr-2 h-5 w-5" />
        Filters & Sort
        {hasActiveFilters && (
          <span className="absolute top-0 right-0 -mt-1 -mr-1 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-pink-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-pink-500"></span>
          </span>
        )}
      </Button>

      {isOpen && (
        <div className="absolute top-12 left-0 w-80 max-w-[calc(100vw-2rem)] max-h-[70vh] overflow-y-auto bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 p-4">
          <div className="space-y-4">
            {/* Sort */}
            <div>
              <div className="mb-2 block">
                <Label>Sort by</Label>
              </div>
              <div className="flex gap-2">
                <Select 
                  value={localFilters.sortBy}
                  onChange={(e) => handleChange('sortBy', e.target.value)}
                  className="flex-1"
                >
                  <option value="distance">Distance</option>
                  <option value="age">Age</option>
                  <option value="fameRating">Fame Rating</option>
                  <option value="commonTags">Common Tags</option>
                </Select>
                <Button 
                  color="gray" 
                  onClick={() => handleChange('sortOrder', localFilters.sortOrder === 'asc' ? 'desc' : 'asc')}
                >
                  {localFilters.sortOrder === 'asc' ? <HiSortAscending /> : <HiSortDescending />}
                </Button>
              </div>
            </div>

            <hr className="border-gray-200 dark:border-gray-700" />

            {mode === 'search' && (
              <div>
                <div className="mb-2 block">
                  <Label htmlFor="location">Location</Label>
                </div>
                <TextInput
                  id="location"
                  placeholder="e.g. Lyon"
                  value={localFilters.location || ''}
                  onChange={(e) => handleChange('location', e.target.value)}
                />
              </div>
            )}

            {/* Age Range */}
            <div>
              <div className="mb-2 flex justify-between">
                <Label>Age Gap</Label>
                <span className="text-sm text-gray-500">{localFilters.ageRange[0]} - {localFilters.ageRange[1]}</span>
              </div>
              <div className="flex gap-2 items-center">
                 <TextInput 
                    type="number" 
                    sizing="sm"
                    className="w-20"
                    value={localFilters.ageRange[0]} 
                    onChange={(e) => handleChange('ageRange', [parseInt(e.target.value), localFilters.ageRange[1]])}
                  />
                  <span>-</span>
                  <TextInput 
                    type="number" 
                    sizing="sm"
                    className="w-20"
                    value={localFilters.ageRange[1]} 
                    onChange={(e) => handleChange('ageRange', [localFilters.ageRange[0], parseInt(e.target.value)])}
                  />
              </div>
            </div>

            {/* Distance Range */}
            <div>
              <div className="mb-2 flex justify-between">
                <Label htmlFor="distance-range">Max Distance (km)</Label>
                <span className="text-sm text-gray-500">{localFilters.distanceRange[1]} km</span>
              </div>
              <RangeSlider 
                id="distance-range"
                sizing="md"
                min={0} 
                max={500} 
                value={localFilters.distanceRange[1]}
                onChange={(e) => handleChange('distanceRange', [0, parseInt(e.target.value)])}
              />
            </div>

            {/* Fame Rating */}
            <div>
              <div className="mb-2 flex justify-between">
                <Label htmlFor="fame-range">Min Fame Rating</Label>
                <span className="text-sm text-gray-500">{localFilters.fameRange[0]}</span>
              </div>
              <RangeSlider 
                id="fame-range"
                sizing="md"
                min={0} 
                max={1000} 
                value={localFilters.fameRange[0]}
                onChange={(e) => handleChange('fameRange', [parseInt(e.target.value), 1000])}
              />
            </div>

            {/* Common Tags */}
            <div>
              <div className="mb-2 flex justify-between">
                <Label htmlFor="tags-range">Min Common Tags</Label>
                <span className="text-sm text-gray-500">{localFilters.minCommonTags}</span>
              </div>
              <RangeSlider 
                id="tags-range"
                sizing="md"
                min={0} 
                max={10} 
                value={localFilters.minCommonTags}
                onChange={(e) => handleChange('minCommonTags', parseInt(e.target.value))}
              />
            </div>

            {mode === 'search' && (
              <div>
                <div className="mb-2 block">
                  <Label>Tags</Label>
                </div>
                <div className="flex flex-wrap gap-2">
                  {INTERESTS.map(tag => (
                    <button
                      key={tag}
                      onClick={() => toggleTag(tag)}
                      className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                        (localFilters.tags || []).includes(tag)
                          ? 'bg-pink-500 text-white border-pink-500'
                          : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600'
                      }`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="flex gap-2 mt-4">
              <Button color="gray" className="flex-1" onClick={handleReset}>
                Reset
              </Button>
              <Button className="flex-1" onClick={handleApply}>
                Apply Filters
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MatchFilters;
