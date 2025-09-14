import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Search, Grid3X3, List, LayoutGrid } from 'lucide-react';
import PromptImageGallery from '../components/PromptImageGallery';
import { usePrompts } from '../hooks/usePrompts';
import { useCategories } from '../hooks/useCategories';

// Custom hook for debounced search
const useDebounce = (value: string, delay: number) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

const ExplorePage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [hasInitialized, setHasInitialized] = useState(false);
  
  // Debounce search query to prevent excessive API calls
  const debouncedSearchQuery = useDebounce(searchQuery, 500); // 500ms delay
  
  // Use dynamic hooks
  const { prompts, loading, totalCount, fetchPrompts } = usePrompts();
  const { categories } = useCategories();

  // Memoize fetch parameters to prevent unnecessary re-computations
  const fetchParams = useMemo(() => {
    const params: any = { limit: 50 };
    
    if (activeTab === 'trending') {
      params.sortBy = 'views';
      params.sortOrder = 'desc';
    } else if (activeTab === 'favorites') {
      params.featured = true;
    }
    
    if (debouncedSearchQuery) {
      params.search = debouncedSearchQuery;
    }
    
    return params;
  }, [activeTab, debouncedSearchQuery]);

  // Stable fetch function to prevent useEffect from re-running
  const stableFetchPrompts = useCallback(() => {
    fetchPrompts(fetchParams);
  }, [fetchPrompts, fetchParams]);

  // Fetch prompts when filters change (only after initial load)
  useEffect(() => {
    if (hasInitialized) {
      console.log('🔄 ExplorePage: Filter change detected, fetching with params:', fetchParams);
      stableFetchPrompts();
    }
  }, [stableFetchPrompts, hasInitialized]);

  // Handle initial load to prevent double API calls
  useEffect(() => {
    if (!hasInitialized) {
      // Only fetch if prompts array is empty (hook hasn't loaded yet)
      if (prompts.length === 0 && !loading) {
        console.log('🚀 ExplorePage: Initial fetch triggered');
        stableFetchPrompts();
      } else if (prompts.length > 0) {
        console.log('📊 ExplorePage: Prompts already loaded, skipping initial fetch');
      }
      setHasInitialized(true);
    }
  }, [prompts.length, loading, hasInitialized, stableFetchPrompts]);

  // Calculate filtered count for display
  const getFilteredCount = () => {
    if (loading) return 0;
    return prompts.length;
  };

  const tabs = [
    { id: 'all', label: 'All' },
    { id: 'trending', label: 'Trending' },
    { id: 'favorites', label: 'Favorites' }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Minimal Header */}
      <div className="border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 py-8">
          {/* Title and Search */}
          <div className="mb-8">
            <h1 className="text-3xl font-semibold text-gray-900 mb-2">
              Explore Prompts
            </h1>
            <p className="text-gray-600">
              {loading ? 'Loading...' : `${totalCount} AI prompts to inspire your creativity`}
            </p>
          </div>

          {/* Search Bar */}
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search prompts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all"
            />
          </div>

          {/* Simple Tabs */}
          <div className="flex items-center justify-between">
            <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
                    activeTab === tab.id
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
            
            {/* Results count */}
            <div className="text-sm text-gray-500">
              {loading ? 'Loading...' : `${getFilteredCount()} results`}
            </div>
          </div>
        </div>
      </div>

      {/* Gallery */}
      <PromptImageGallery 
        activeTab={activeTab} 
        searchQuery={searchQuery} 
        prompts={prompts}
        loading={loading}
      />
    </div>
  );
};

export default ExplorePage;