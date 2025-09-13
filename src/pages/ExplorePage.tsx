import React from 'react';
import PromptImageGallery from '../components/PromptImageGallery';

const ExplorePage: React.FC = () => {
  return (
    <div className="bg-white min-h-screen">
      {/* Page Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <h1 className="text-4xl sm:text-5xl font-bold text-black mb-4 tracking-tight">
              Explore Prompts
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Discover and copy amazing AI image prompts from our curated collection
            </p>
          </div>
        </div>
      </div>

      {/* Gallery */}
      <PromptImageGallery />
    </div>
  );
};

export default ExplorePage;