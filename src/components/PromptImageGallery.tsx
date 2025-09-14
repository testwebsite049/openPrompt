import React, { useState, useEffect } from 'react';
import { Grid, List, LayoutGrid, Search } from 'lucide-react';
import { Prompt } from '../hooks/usePrompts';
import PromptImageCard from './PromptImageCard';
import { usePrompts } from '../hooks/usePrompts';

interface PromptImageGalleryProps {
  activeTab?: string;
  searchQuery?: string;
  prompts: Prompt[];
  loading?: boolean;
}

const PromptImageGallery: React.FC<PromptImageGalleryProps> = ({ 
  activeTab = 'all', 
  searchQuery = '', 
  prompts = [],
  loading = false 
}) => {
  const [filteredPrompts, setFilteredPrompts] = useState<Prompt[]>([]);
  const [viewMode, setViewMode] = useState<'masonry' | 'grid' | 'list'>('masonry');

  // Masonry grid column management - moved to component level
  const getColumnCount = () => {
    if (typeof window !== 'undefined') {
      if (window.innerWidth >= 1536) return 5; // 2xl
      if (window.innerWidth >= 1280) return 4; // xl
      if (window.innerWidth >= 1024) return 3; // lg
      if (window.innerWidth >= 768) return 2;  // md
      return 1; // sm
    }
    return 4;
  };

  const [columnCount, setColumnCount] = useState(getColumnCount());

  // Debounced resize handler for better performance - moved to component level
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    const handleResize = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        setColumnCount(getColumnCount());
      }, 100);
    };
    
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(timeoutId);
    };
  }, []);

  // Filter prompts based on search query (other filtering done via API)
  useEffect(() => {
    let filtered = prompts;
    
    // Client-side search filtering if needed
    if (searchQuery && !loading) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(prompt =>
        prompt.title.toLowerCase().includes(query) ||
        prompt.description.toLowerCase().includes(query) ||
        prompt.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }
    
    setFilteredPrompts(filtered);
  }, [prompts, searchQuery, loading]);

  // Distribute items across columns - moved to component level
  const distributeItems = React.useMemo(() => {
    const columns: Prompt[][] = Array.from({ length: columnCount }, () => []);
    const columnHeights = Array(columnCount).fill(0);

    filteredPrompts.forEach((prompt) => {
      // Find the shortest column
      const shortestColumnIndex = columnHeights.indexOf(Math.min(...columnHeights));
      
      // Add item to shortest column
      columns[shortestColumnIndex].push(prompt);
      
      // Default height estimation (no isPortrait available in API)
      let estimatedHeight = 1;
      
      // Add extra height for prompts with longer text
      if (prompt.description.length > 100) {
        estimatedHeight += 0.2;
      }
      
      // Featured items get slight bonus to balance visual weight
      if (prompt.featured) {
        estimatedHeight += 0.1;
      }
      
      columnHeights[shortestColumnIndex] += estimatedHeight;
    });

    return columns;
  }, [filteredPrompts, columnCount]);

  const viewModes = [
    { id: 'masonry', icon: LayoutGrid, label: 'Masonry' },
    { id: 'grid', icon: Grid, label: 'Grid' },
    { id: 'list', icon: List, label: 'List' }
  ];

  // Minimal masonry grid
  const renderMasonryGrid = () => {
    return (
      <div 
        className="grid gap-4"
        style={{
          gridTemplateColumns: `repeat(${columnCount}, 1fr)`,
          gridAutoFlow: 'column'
        }}
      >
        {distributeItems.map((columnItems, colIndex) => (
          <div key={`col-${colIndex}`} className="flex flex-col gap-4">
            {columnItems.map((prompt, index) => (
              <PromptImageCard
                key={prompt._id}
                prompt={prompt}
                index={index}
                viewMode={viewMode}
              />
            ))}
          </div>
        ))}
      </div>
    );
  };

  const renderRegularGrid = () => (
    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {filteredPrompts.map((prompt, index) => (
        <PromptImageCard
          key={prompt._id}
          prompt={prompt}
          index={index}
          viewMode={viewMode}
        />
      ))}
    </div>
  );

  const renderListView = () => (
    <div className="space-y-4">
      {filteredPrompts.map((prompt, index) => (
        <PromptImageCard
          key={prompt._id}
          prompt={prompt}
          index={index}
          viewMode={viewMode}
        />
      ))}
    </div>
  );

  return (
    <div className="py-8 px-4">
      {/* Minimal View Mode Toggle */}
      <div className="max-w-6xl mx-auto mb-8">
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600">
            {filteredPrompts.length} prompts
          </div>
          
          {/* Simple View Mode Toggle */}
          <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
            {viewModes.map((mode) => {
              const Icon = mode.icon;
              return (
                <button
                  key={mode.id}
                  onClick={() => setViewMode(mode.id as any)}
                  className={`p-2 rounded-md transition-all ${
                    viewMode === mode.id
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </button>
              );
            })}
          </div>
        </div>
      </div>
      
      {/* Loading State */}
      {loading && (
        <div className="max-w-6xl mx-auto">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="aspect-[4/5] bg-gray-100 rounded-lg animate-pulse" />
            ))}
          </div>
        </div>
      )}
      
      {/* Gallery Content */}
      {!loading && (
        <div className="max-w-6xl mx-auto">
          {viewMode === 'masonry' && renderMasonryGrid()}
          {viewMode === 'grid' && renderRegularGrid()}
          {viewMode === 'list' && renderListView()}
        </div>
      )}

      {/* No Results */}
      {!loading && filteredPrompts.length === 0 && (
        <div className="text-center py-16 max-w-6xl mx-auto">
          <div className="text-gray-400 mb-4">
            <Search className="w-12 h-12 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No prompts found</h3>
          <p className="text-gray-600">Try adjusting your search or browse different categories.</p>
        </div>
      )}
    </div>
  );
};

export default PromptImageGallery;