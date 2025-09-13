import React, { useState, useEffect } from 'react';
import { Search, X } from 'lucide-react';
import { Prompt, categories, sortOptions } from '../data/promptsData';

interface SearchAndFiltersProps {
  onFilter: (filteredPrompts: Prompt[]) => void;
  prompts: Prompt[];
}

const SearchAndFilters: React.FC<SearchAndFiltersProps> = ({ onFilter, prompts }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState('popular');

  useEffect(() => {
    let filtered = [...prompts];

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(prompt =>
        prompt.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        prompt.prompt.toLowerCase().includes(searchTerm.toLowerCase()) ||
        prompt.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Filter by category
    if (selectedCategory !== 'All') {
      filtered = filtered.filter(prompt => prompt.category === selectedCategory);
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
  }, [searchTerm, selectedCategory, sortBy, prompts, onFilter]);

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('All');
    setSortBy('popular');
  };

  const hasActiveFilters = searchTerm || selectedCategory !== 'All' || sortBy !== 'popular';

  return (
    <div className="space-y-6">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          type="text"
          placeholder="Search prompts, categories, or tags..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-12 pr-4 py-4 bg-white border border-gray-200 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-all duration-200 shadow-sm hover:shadow-md"
        />
      </div>

      {/* Filters Row */}
      <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
        {/* Category Filters */}
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                selectedCategory === category
                  ? 'bg-black text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:scale-105'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Sort and Clear */}
        <div className="flex items-center gap-4">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-all duration-200"
          >
            {sortOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-black transition-colors duration-200"
            >
              <X className="w-4 h-4" />
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Results Count */}
      <div className="text-sm text-gray-500">
        {prompts.length} prompts available
      </div>
    </div>
  );
};

export default SearchAndFilters;