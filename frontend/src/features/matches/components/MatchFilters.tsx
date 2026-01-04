import React from 'react';
import { Button, Label, RangeSlider, Select, TextInput, Badge, Checkbox } from 'flowbite-react';
import { HiAdjustments, HiSortAscending, HiSortDescending, HiX, HiLocationMarker } from 'react-icons/hi';
import { MatchFiltersState } from '../types/match';
import { DEFAULT_FILTERS } from '../hooks/useMatches';
import { api } from '../../../services/api';
import { useNotification } from '../../../context/NotificationContext';
import { useAuth } from '../../../context/AuthContext';

interface MatchFiltersProps {
  filters: MatchFiltersState;
  onFilterChange: (filters: MatchFiltersState) => void;
  mode?: 'discover' | 'search';
  className?: string;
  isOpen?: boolean;
  onToggle?: (isOpen: boolean) => void;
  hasSearched?: boolean;
  onClear?: () => void;
}

const MatchFilters: React.FC<MatchFiltersProps> = ({ 
  filters, 
  onFilterChange, 
  mode = 'discover', 
  className,
  isOpen: controlledIsOpen,
  onToggle,
  hasSearched = false,
  onClear
}) => {
  const [internalIsOpen, setInternalIsOpen] = React.useState(false);
  const isControlled = controlledIsOpen !== undefined;
  const isOpen = isControlled ? controlledIsOpen : internalIsOpen;

  const handleToggle = (newState: boolean) => {
    if (isControlled) {
      onToggle?.(newState);
    } else {
      setInternalIsOpen(newState);
    }
  };

  const [isVisible, setIsVisible] = React.useState(true);
  const [localFilters, setLocalFilters] = React.useState<MatchFiltersState>(filters);
  const [availableTags, setAvailableTags] = React.useState<string[]>([]);
  const [searchTerm, setSearchTerm] = React.useState("");
  const [showDropdown, setShowDropdown] = React.useState(false);
  const [locationError, setLocationError] = React.useState<string | null>(null);
  const lastScrollY = React.useRef(0);
  const { addToast } = useNotification();
  const { user } = useAuth();

  const hasChanges = React.useMemo(() => {
    return JSON.stringify(localFilters) !== JSON.stringify(filters);
  }, [localFilters, filters]);

  // Sync local filters with prop filters
  React.useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  React.useEffect(() => {
    const fetchTags = async () => {
        try {
            const response = await api.get('/tags');
            setAvailableTags(response.data);
        } catch (error) {
            console.error('Failed to fetch tags:', error);
        }
    };
    fetchTags();
  }, []);

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
    if (mode === 'search' && hasSearched) return true;
    
    const { sortBy, sortOrder, ...filterCriteria } = filters;
    const { sortBy: defaultSortBy, sortOrder: defaultSortOrder, ...defaultCriteria } = DEFAULT_FILTERS;
    return JSON.stringify(filterCriteria) !== JSON.stringify(defaultCriteria);
  }, [filters, mode, hasSearched]);

  const handleAroundMe = () => {
    if (!user?.geolocationConsent) {
        addToast("Please enable geolocation in your profile security settings first", 'error');
        return;
    }

    if (!navigator.geolocation) {
      addToast("Geolocation is not supported by your browser", 'error');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
            // Reverse geocoding to get city name for the input
            const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
            const data = await res.json();
            const city = data.address.city || data.address.town || data.address.village || "Current Location";
            
            setLocalFilters(prev => ({
                ...prev,
                location: city,
                locationCoords: { latitude, longitude }
            }));
            setLocationError(null);
        } catch (error) {
            console.error('Reverse geocoding error:', error);
            // Fallback if reverse geocoding fails but we have coords
             setLocalFilters(prev => ({
                ...prev,
                location: "Current Location",
                locationCoords: { latitude, longitude }
            }));
        }
      },
      (error) => {
        console.error('Geolocation error:', error);
        addToast("Unable to retrieve your location", 'error');
      }
    );
  };

  const handleApply = async () => {
    let filtersToApply = { ...localFilters };
    setLocationError(null);

    if (filtersToApply.location) {
        try {
            const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(filtersToApply.location)}&limit=1`);
            const data = await res.json();
            if (data && data.length > 0) {
                filtersToApply.locationCoords = {
                    latitude: parseFloat(data[0].lat),
                    longitude: parseFloat(data[0].lon)
                };
            } else {
                setLocationError("Location not found. Please check the spelling.");
                addToast("Location not found. Please check the spelling.", 'error');
                return;
            }
        } catch (error) {
            console.error('Geocoding error:', error);
            setLocationError("Unable to validate location.");
            addToast("Unable to validate location. Please try again.", 'error');
            return;
        }
    } else {
        filtersToApply.locationCoords = undefined;
    }

    setLocalFilters(filtersToApply);
    onFilterChange(filtersToApply);
    handleToggle(false);
  };

  const handleClear = () => {
    const defaults = { ...DEFAULT_FILTERS };
    if (mode === 'search') {
      defaults.includeInteracted = true;
    }
    setLocalFilters(defaults);
  };

  const handleChange = (key: keyof MatchFiltersState, value: any) => {
    setLocalFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleAddTag = (tag: string) => {
    const currentTags = localFilters.tags || [];
    if (tag && !currentTags.includes(tag)) {
        handleChange('tags', [...currentTags, tag]);
    }
    setSearchTerm("");
    setShowDropdown(false);
  };

  const handleRemoveTag = (tagToRemove: string) => {
    const currentTags = localFilters.tags || [];
    handleChange('tags', currentTags.filter(tag => tag !== tagToRemove));
  };

  const filteredTags = availableTags.filter(tag => 
    tag.toLowerCase().includes(searchTerm.toLowerCase()) && 
    !(localFilters.tags || []).includes(tag)
  );

  return (
    <>
      {/* Filter Bar Wrapper - Handles positioning and z-index context */}
      <div 
        className={`fixed top-16 left-0 right-0 z-filters h-12 transition-all duration-300 ${
          !isVisible && mode === 'search' ? '-translate-y-full' : 'translate-y-0'
        }`}
      >
        {/* Dropdown Content - Rendered first (behind) or with lower z-index */}
        <div 
          className={`absolute top-0 left-0 w-full z-filter-dropdown pt-12 transition-transform duration-300 ease-in-out ${
            isOpen ? 'translate-y-0' : '-translate-y-full'
          }`}
        >
          <div 
            className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-lg max-h-[calc(100vh-10.5rem)] overflow-y-auto cursor-default"
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
                      <div className="flex gap-2">
                        <TextInput
                            id="location"
                            placeholder="e.g. Lyon"
                            value={localFilters.location || ''}
                            onChange={(e) => {
                                handleChange('location', e.target.value);
                                setLocationError(null);
                            }}
                            color={locationError ? "failure" : "gray"}
                            className="flex-1"
                        />
                        <Button color="light" onClick={handleAroundMe} title="Around Me">
                            <HiLocationMarker className="h-5 w-5" />
                        </Button>
                      </div>
                      {(locationError || localFilters.location) && (
                        <p className={`mt-2 text-sm ${locationError ? "text-red-600 dark:text-red-500" : "text-gray-500 dark:text-gray-400"}`}>
                          {locationError ? (
                            locationError
                          ) : (
                            "Distance filter will be relative to this location"
                          )}
                        </p>
                      )}
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
                      <Label htmlFor="distance-range">
                        {localFilters.location ? `Max Distance from: ${localFilters.location}` : "Max Distance (km)"}
                      </Label>
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

                  {/* Gender Identity */}
                  {mode === 'search' && (
                    <div>
                      <div className="mb-2 block">
                        <Label>Gender Identity</Label>
                      </div>
                      <div className="flex flex-wrap gap-4">
                        {['male', 'female', 'other'].map((gender) => (
                          <div key={gender} className="flex items-center gap-2">
                            <Checkbox 
                              id={`gender-${gender}`} 
                              checked={(localFilters.gender || []).includes(gender)}
                              onChange={(e) => {
                                const current = localFilters.gender || [];
                                if (e.target.checked) {
                                  handleChange('gender', [...current, gender]);
                                } else {
                                  handleChange('gender', current.filter(g => g !== gender));
                                }
                              }}
                            />
                            <Label htmlFor={`gender-${gender}`} className="capitalize">
                              {gender === 'male' ? 'Male' : gender === 'female' ? 'Female' : 'Other'}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Sexual Orientation */}
                  {mode === 'search' && (
                    <div>
                      <div className="mb-2 block">
                        <Label>Interested in</Label>
                      </div>
                      <div className="flex flex-wrap gap-4">
                        {['male', 'female', 'other'].map((orientation) => (
                          <div key={orientation} className="flex items-center gap-2">
                            <Checkbox 
                              id={`orientation-${orientation}`} 
                              checked={(localFilters.sexualPreference || []).includes(orientation)}
                              onChange={(e) => {
                                const current = localFilters.sexualPreference || [];
                                if (e.target.checked) {
                                  handleChange('sexualPreference', [...current, orientation]);
                                } else {
                                  handleChange('sexualPreference', current.filter(o => o !== orientation));
                                }
                              }}
                            />
                            <Label htmlFor={`orientation-${orientation}`} className="capitalize">
                              {orientation === 'male' ? 'Male' : orientation === 'female' ? 'Female' : 'Other'}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Include Interacted Users */}
                  {mode === 'search' && (
                    <div className="flex items-center gap-2 pt-2">
                      <Checkbox 
                        id="include-interacted" 
                        checked={localFilters.includeInteracted || false}
                        onChange={(e) => handleChange('includeInteracted', e.target.checked)}
                      />
                      <Label htmlFor="include-interacted">
                        Include users I've already liked/disliked
                      </Label>
                    </div>
                  )}
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
                      <div className="flex flex-wrap gap-2 mb-2">
                        {(localFilters.tags || []).map(tag => (
                          <Badge key={tag} color="info" size="sm" className="px-2 py-1 flex items-center gap-1">
                              {tag}
                              <button type="button" onClick={() => handleRemoveTag(tag)} className="hover:text-red-500 ml-1">
                                  <HiX className="w-3 h-3" />
                              </button>
                          </Badge>
                        ))}
                      </div>
                      <div className="relative">
                        <TextInput 
                            placeholder="Type to search interests..." 
                            value={searchTerm}
                            onChange={(e) => {
                                setSearchTerm(e.target.value);
                                setShowDropdown(true);
                            }}
                            onFocus={() => setShowDropdown(true)}
                            onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
                            autoComplete="off"
                        />
                        {showDropdown && (
                            <ul className="absolute z-10 w-full bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-md shadow-lg max-h-60 overflow-auto mt-1">
                                {filteredTags.length > 0 ? (
                                    filteredTags.map(tag => (
                                        <li 
                                            key={tag} 
                                            className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer text-gray-700 dark:text-gray-200"
                                            onClick={() => handleAddTag(tag)}
                                        >
                                            {tag}
                                        </li>
                                    ))
                                ) : (
                                    <li className="px-4 py-2 text-gray-500 dark:text-gray-400">No matching interests</li>
                                )}
                            </ul>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-2 mt-6 pt-4 border-t border-gray-100 dark:border-gray-700">
                <Button color="gray" onClick={handleClear}>
                  Clear Filters
                </Button>
                <Button color="pink" onClick={handleApply} disabled={!hasChanges}>
                  Apply Filters
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Bar Content - Visually on top */}
        <div 
          onClick={() => handleToggle(!isOpen)}
          className="relative z-50 h-full bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-750"
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
        </div>
      </div>
      {/* Spacer to prevent content overlap */}
      <div className="h-12 flex-none w-full" />
    </>
  );
};

export default MatchFilters;
