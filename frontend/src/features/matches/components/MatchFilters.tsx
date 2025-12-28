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
  const [isVisible, setIsVisible] = React.useState(true);
  const [localFilters, setLocalFilters] = React.useState<MatchFiltersState>(filters);
  const lastScrollY = React.useRef(0);

  // Scroll handling for search mode
  React.useEffect(() => {
    if (mode !== 'search') return;
    
    const container = document.getElementById('app-scroll-container');
    if (!container) return;

    const handleScroll = () => {
      const currentScrollY = container.scrollTop;
      
      // Always show if at top or if dropdown is open
      if (currentScrollY < 10 || isOpen) {
        setIsVisible(true);
      } else {
        // Hide on scroll down, show on scroll up
        if (currentScrollY > lastScrollY.current) {
          setIsVisible(false);
        } else {
          setIsVisible(true);
        }
      }
      lastScrollY.current = currentScrollY;
    };

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, [mode, isOpen]);

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
    <>
      {/* Filter Bar */}
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed top-16 left-0 right-0 z-filters bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm h-12 transition-all duration-300 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-750 ${
          !isVisible && mode === 'search' ? '-translate-y-full' : 'translate-y-0'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 h-full flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
            {hasActiveFilters && (
              <span className="flex items-center gap-1 text-pink-600 dark:text-pink-400 font-medium">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-pink-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-pink-500"></span>
                </span>
                Active Filters
              </span>
            )}
          </div>
          
          <div 
            className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
              isOpen 
                ? 'text-pink-600 dark:text-pink-400' 
                : 'text-gray-700 dark:text-gray-200'
            }`}
          >
            <HiAdjustments className="w-5 h-5" />
            <span>Filters & Sort</span>
            {isOpen ? <HiSortAscending className="w-4 h-4 rotate-180" /> : <HiSortDescending className="w-4 h-4" />}
          </div>
        </div>

        {/* Dropdown Content */}
        {isOpen && (
          <div 
            className="absolute top-full left-0 right-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-lg max-h-[calc(100vh-8rem)] overflow-y-auto cursor-default"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="max-w-7xl mx-auto p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Sort Column */}
                <div className="space-y-4">
                  <h3 className="font-medium text-gray-900 dark:text-white border-b pb-2 dark:border-gray-700">Sort</h3>
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
                </div>

                {/* Filters Column 1 */}
                <div className="space-y-4">
                  <h3 className="font-medium text-gray-900 dark:text-white border-b pb-2 dark:border-gray-700">Criteria</h3>
                  
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
                </div>

                {/* Filters Column 2 */}
                <div className="space-y-4">
                  <h3 className="font-medium text-gray-900 dark:text-white border-b pb-2 dark:border-gray-700">More</h3>
                  
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
                </div>
              </div>

              <div className="flex justify-end gap-2 mt-6 pt-4 border-t border-gray-100 dark:border-gray-700">
                <Button color="gray" onClick={handleReset}>
                  Reset Defaults
                </Button>
                <Button color="pink" onClick={handleApply}>
                  Apply Filters
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
      {/* Spacer to prevent content overlap */}
      <div className="h-12 flex-none w-full" />
    </>
  );
};

export default MatchFilters;
