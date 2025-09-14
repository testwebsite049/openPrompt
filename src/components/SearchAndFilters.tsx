import React, { useState, useEffect, useMemo } from 'react';
import { Search, X, Filter, SlidersHorizontal, Tag, TrendingUp, Star, Clock } from 'lucide-react';
import { Prompt, categories, sortOptions } from '../data/promptsData';

interface SearchAndFiltersProps {
  onFilter: (filteredPrompts: Prompt[]) => void;
  prompts: Prompt[];
  activeTab?: string;
}

const SearchAndFilters: React.FC<SearchAndFiltersProps> = ({ onFilter, prompts, activeTab = 'all' }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState('popular');
  const [minPopularity, setMinPopularity] = useState(0);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  // Get all unique tags from prompts
  const allTags = useMemo(() => {
    const tagsSet = new Set<string>();
    prompts.forEach(prompt => {
      prompt.tags.forEach(tag => tagsSet.add(tag));
    });
    return Array.from(tagsSet).sort();
  }, [prompts]);

  useEffect(() => {
    let filtered = [...prompts];

    // Filter by search term
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(prompt =>
        prompt.title.toLowerCase().includes(searchLower) ||
        prompt.prompt.toLowerCase().includes(searchLower) ||
        prompt.tags.some(tag => tag.toLowerCase().includes(searchLower))
      );
    }

    // Filter by category
    if (selectedCategory !== 'All') {
      filtered = filtered.filter(prompt => prompt.category === selectedCategory);
    }

    // Filter by minimum popularity
    if (minPopularity > 0) {
      filtered = filtered.filter(prompt => prompt.popularity >= minPopularity);
    }

    // Filter by selected tags
    if (selectedTags.length > 0) {
      filtered = filtered.filter(prompt =>
        selectedTags.some(selectedTag =>
          prompt.tags.some(tag => tag.toLowerCase() === selectedTag.toLowerCase())
        )
      );
    }

    // Sort
    switch (sortBy) {
      case 'popular':
        filtered.sort((a, b) => b.popularity - a.popularity);
        break;
      case 'recent':
        filtered.sort((a, b) => b.id - a.id);
        break;
      case 'trending':
        filtered.sort((a, b) => b.popularity - a.popularity);
        break;
      case 'alphabetical':
        filtered.sort((a, b) => a.title.localeCompare(b.title));
        break;
    }

    onFilter(filtered);
  }, [searchTerm, selectedCategory, sortBy, minPopularity, selectedTags, prompts, onFilter]);

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('All');
    setSortBy('popular');
    setMinPopularity(0);
    setSelectedTags([]);
  };

  const toggleTag = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag)
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const hasActiveFilters = searchTerm || selectedCategory !== 'All' || sortBy !== 'popular' || minPopularity > 0 || selectedTags.length > 0;
  const filteredCount = prompts.length;

  const getSortIcon = (sortValue: string) => {
    switch (sortValue) {
      case 'popular': return Star;
      case 'recent': return Clock;
      case 'trending': return TrendingUp;
      default: return Filter;
    }
  };

  return (
    <div className="space-y-6">
      {/* Enhanced Search Bar */}
      <div className="relative group">
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 group-focus-within:text-purple-500 transition-colors" />
        <input
          type="text"
          placeholder="Search prompts, categories, or tags..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-12 pr-4 py-4 bg-white border-2 border-gray-200 rounded-2xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 shadow-sm hover:shadow-md group-focus-within:shadow-lg"
        />
        {searchTerm && (
          <button
            onClick={() => setSearchTerm('')}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Main Filters Row */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Categories */}
        <div className="flex-1">
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => {
              const isSelected = selectedCategory === category;
              return (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 transform hover:scale-105 ${
                    isSelected
                      ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg'
                      : 'bg-white text-gray-700 hover:bg-gray-50 hover:text-gray-900 border-2 border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {category}
                  {isSelected && category !== 'All' && (
                    <span className="ml-2 text-xs bg-white/20 px-2 py-1 rounded-full">
                      {prompts.filter(p => p.category === category).length}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Sort and Controls */}
        <div className="flex items-center gap-4">
          {/* Sort Dropdown */}
          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="appearance-none pl-10 pr-8 py-3 bg-white border-2 border-gray-200 rounded-xl text-gray-700 font-medium focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 cursor-pointer hover:border-gray-300"
            >
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            {React.createElement(getSortIcon(sortBy), {
              className: "absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500"
            })}
          </div>

          {/* Advanced Filters Toggle */}
          <button
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            className={`flex items-center gap-2 px-4 py-3 rounded-xl font-medium transition-all duration-200 ${
              showAdvancedFilters
                ? 'bg-purple-100 text-purple-700 border-2 border-purple-200'
                : 'bg-white text-gray-700 border-2 border-gray-200 hover:border-gray-300'
            }`}
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span className="hidden sm:inline">Filters</span>
          </button>

          {/* Clear Filters */}
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="flex items-center gap-2 px-4 py-3 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all duration-200 border-2 border-transparent hover:border-red-200"
            >
              <X className="w-4 h-4" />
              <span className="hidden sm:inline">Clear</span>
            </button>
          )}
        </div>
      </div>

      {/* Advanced Filters Panel */}
      {showAdvancedFilters && (
        <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-2xl p-6 border-2 border-gray-200 animate-in slide-in-from-top-2 duration-300">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Popularity Filter */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <Star className="w-4 h-4" />
                Minimum Popularity: {minPopularity}
              </label>
              <input
                type="range"
                min="0"
                max="100"
                value={minPopularity}
                onChange={(e) => setMinPopularity(Number(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>0</span>
                <span>50</span>
                <span>100</span>
              </div>
            </div>

            {/* Tags Filter */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <Tag className="w-4 h-4" />
                Tags ({selectedTags.length} selected)
              </label>
              <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
                {allTags.map((tag) => {
                  const isSelected = selectedTags.includes(tag);
                  return (
                    <button
                      key={tag}
                      onClick={() => toggleTag(tag)}
                      className={`px-3 py-1 text-xs font-medium rounded-full transition-all duration-200 ${
                        isSelected
                          ? 'bg-purple-600 text-white'
                          : 'bg-white text-gray-600 hover:bg-purple-50 hover:text-purple-600 border border-gray-200'
                      }`}
                    >
                      #{tag}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Results Summary */}
      <div className="flex items-center justify-between text-sm bg-white rounded-xl p-4 border border-gray-200">
        <div className="flex items-center gap-4">
          <span className="text-gray-600">
            <span className="font-semibold text-gray-900">{filteredCount}</span> prompts found
          </span>
          {hasActiveFilters && (
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
              <span className="text-purple-600 font-medium">Filters active</span>
            </div>
          )}
        </div>
        
        {/* Active Filters Summary */}
        {(selectedTags.length > 0 || minPopularity > 0) && (
          <div className="flex items-center gap-2 text-xs">
            {selectedTags.length > 0 && (
              <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full">
                {selectedTags.length} tags
              </span>
            )}
            {minPopularity > 0 && (
              <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full">
                ≥{minPopularity}% popularity
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchAndFilters;

// Add slider styles
const sliderStyles = `
  .slider::-webkit-slider-thumb {
    appearance: none;
    height: 20px;
    width: 20px;
    border-radius: 50%;
    background: linear-gradient(135deg, #8b5cf6, #3b82f6);
    cursor: pointer;
    box-shadow: 0 2px 4px rgba(0,0,0,0.2);
  }
  
  .slider::-moz-range-thumb {
    height: 20px;
    width: 20px;
    border-radius: 50%;
    background: linear-gradient(135deg, #8b5cf6, #3b82f6);
    cursor: pointer;
    border: none;
    box-shadow: 0 2px 4px rgba(0,0,0,0.2);
  }
`;

if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.textContent = sliderStyles;
  document.head.appendChild(styleSheet);
}