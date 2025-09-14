import React, { useState } from 'react';
import { Search, Grid3X3, List, LayoutGrid } from 'lucide-react';
import PromptImageGallery from '../components/PromptImageGallery';
import { promptsData } from '../data/promptsData';

const ExplorePage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

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
              {promptsData.length} AI prompts to inspire your creativity
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
              {promptsData.filter(p => {
                if (activeTab === 'trending') return p.popularity > 85;
                if (activeTab === 'favorites') return p.popularity > 90;
                return true;
              }).length} results
            </div>
          </div>
        </div>
      </div>

      {/* Gallery */}
      <PromptImageGallery activeTab={activeTab} searchQuery={searchQuery} />
    </div>
  );
};

export default ExplorePage;