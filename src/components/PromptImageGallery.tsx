import React, { useState } from 'react';
import { promptsData } from '../data/promptsData';
import SearchAndFilters from './SearchAndFilters';
import PromptImageCard from './PromptImageCard';

const PromptImageGallery: React.FC = () => {
  const [prompts] = useState(promptsData);
  const [filteredPrompts, setFilteredPrompts] = useState(promptsData);

  return (
    <div className="relative flex min-h-screen w-full flex-col py-10 px-4 bg-white">
      {/* Search and Filter Section */}
      <div className="mx-auto w-full max-w-6xl mb-8">
        <SearchAndFilters onFilter={setFilteredPrompts} prompts={prompts} />
      </div>
      
      {/* Masonry Grid */}
      <div className="mx-auto grid w-full max-w-6xl gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, col) => (
          <div key={col} className="grid gap-6">
            {filteredPrompts
              .filter((_, index) => index % 4 === col)
              .map((prompt, index) => (
                <PromptImageCard
                  key={prompt.id}
                  prompt={prompt}
                  index={index}
                />
              ))}
          </div>
        ))}
      </div>

      {/* No Results */}
      {filteredPrompts.length === 0 && (
        <div className="text-center py-20">
          <p className="text-gray-500 text-lg">No prompts found matching your criteria.</p>
          <p className="text-gray-400 text-sm mt-2">Try adjusting your search or filters.</p>
        </div>
      )}
    </div>
  );
};

export default PromptImageGallery;