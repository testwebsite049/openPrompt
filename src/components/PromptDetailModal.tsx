import React, { useState } from 'react';
import { X, Copy, Check, Heart, Share2, Download, Maximize2, Minimize2, Tag, Star, Eye, Calendar, User } from 'lucide-react';
import { Prompt } from '../data/promptsData';

interface PromptDetailModalProps {
  prompt: Prompt | null;
  isOpen: boolean;
  onClose: () => void;
}

const PromptDetailModal: React.FC<PromptDetailModalProps> = ({ prompt, isOpen, onClose }) => {
  const [copySuccess, setCopySuccess] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [activeTab, setActiveTab] = useState<'prompt' | 'details' | 'variations'>('prompt');

  if (!isOpen || !prompt) return null;

  const handleCopyPrompt = async () => {
    try {
      await navigator.clipboard.writeText(prompt.prompt);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error('Failed to copy prompt:', err);
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: prompt.title,
        text: prompt.prompt,
        url: window.location.href
      });
    }
  };

  const handleDownload = () => {
    // Create a text file with the prompt
    const element = document.createElement('a');
    const file = new Blob([prompt.prompt], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `${prompt.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className={`bg-white rounded-3xl shadow-2xl transition-all duration-300 ${
        isFullscreen ? 'w-full h-full' : 'max-w-4xl max-h-[90vh] w-full'
      }`}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-4">
            <h2 className="text-2xl font-bold text-gray-900">{prompt.title}</h2>
            <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
              {prompt.category}
            </span>
            <div className="flex items-center gap-1 text-sm text-gray-500">
              <Star className="w-4 h-4 text-yellow-500" />
              <span>{prompt.popularity}</span>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors"
            >
              {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="flex h-full">
          {/* Image Section */}
          <div className="flex-1 p-6">
            <div className="relative rounded-2xl overflow-hidden bg-gray-100 h-full">
              <img
                src={prompt.image_url}
                alt={prompt.title}
                className="w-full h-full object-cover"
              />
              
              {/* Image Overlay Actions */}
              <div className="absolute top-4 right-4 flex gap-2">
                <button
                  onClick={() => setIsFavorited(!isFavorited)}
                  className={`p-3 rounded-full backdrop-blur-sm transition-all ${
                    isFavorited 
                      ? 'bg-red-500 text-white' 
                      : 'bg-white/90 text-gray-700 hover:bg-red-500 hover:text-white'
                  }`}
                >
                  <Heart className="w-5 h-5" fill={isFavorited ? 'currentColor' : 'none'} />
                </button>
                <button
                  onClick={handleShare}
                  className="p-3 rounded-full bg-white/90 backdrop-blur-sm text-gray-700 hover:bg-purple-500 hover:text-white transition-all"
                >
                  <Share2 className="w-5 h-5" />
                </button>
                <button
                  onClick={handleDownload}
                  className="p-3 rounded-full bg-white/90 backdrop-blur-sm text-gray-700 hover:bg-green-500 hover:text-white transition-all"
                >
                  <Download className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Content Section */}
          <div className="w-96 border-l border-gray-200 flex flex-col">
            {/* Tabs */}
            <div className="flex border-b border-gray-200">
              {[
                { id: 'prompt', label: 'Prompt', icon: Copy },
                { id: 'details', label: 'Details', icon: Tag },
                { id: 'variations', label: 'Similar', icon: Eye }
              ].map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 text-sm font-medium transition-colors ${
                      activeTab === tab.id
                        ? 'text-purple-600 border-b-2 border-purple-600 bg-purple-50'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {tab.label}
                  </button>
                );
              })}
            </div>

            {/* Tab Content */}
            <div className="flex-1 p-6 overflow-y-auto">
              {activeTab === 'prompt' && (
                <div className="space-y-6">
                  {/* Prompt Text */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">AI Prompt</h3>
                    <div className="bg-gray-50 rounded-xl p-4 border-2 border-dashed border-gray-200">
                      <p className="text-gray-800 leading-relaxed font-mono text-sm">
                        "{prompt.prompt}"
                      </p>
                    </div>
                  </div>

                  {/* Copy Button */}
                  <button
                    onClick={handleCopyPrompt}
                    className={`w-full py-4 px-6 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center gap-3 ${
                      copySuccess
                        ? 'bg-green-600 text-white'
                        : 'bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:shadow-lg transform hover:scale-105'
                    }`}
                  >
                    {copySuccess ? (
                      <>
                        <Check className="w-5 h-5" />
                        Copied to Clipboard!
                      </>
                    ) : (
                      <>
                        <Copy className="w-5 h-5" />
                        Copy Prompt
                      </>
                    )}
                  </button>

                  {/* Usage Tips */}
                  <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                    <h4 className="font-semibold text-blue-900 mb-2">💡 Usage Tips</h4>
                    <ul className="text-blue-800 text-sm space-y-1">
                      <li>• Adjust specific details to match your vision</li>
                      <li>• Add style modifiers like "cinematic" or "artistic"</li>
                      <li>• Experiment with aspect ratios and resolutions</li>
                    </ul>
                  </div>
                </div>
              )}

              {activeTab === 'details' && (
                <div className="space-y-6">
                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl p-4 text-center">
                      <div className="text-2xl font-bold text-purple-600">{prompt.popularity}</div>
                      <div className="text-sm text-gray-600">Popularity</div>
                    </div>
                    <div className="bg-gradient-to-br from-green-50 to-teal-50 rounded-xl p-4 text-center">
                      <div className="text-2xl font-bold text-green-600">{Math.floor(Math.random() * 500) + 100}</div>
                      <div className="text-sm text-gray-600">Downloads</div>
                    </div>
                  </div>

                  {/* Tags */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <Tag className="w-5 h-5" />
                      Tags
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {prompt.tags.map((tag, i) => (
                        <span
                          key={i}
                          className="px-3 py-2 bg-gradient-to-r from-purple-100 to-blue-100 text-purple-700 rounded-full text-sm font-medium hover:from-purple-200 hover:to-blue-200 transition-colors cursor-pointer"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Metadata */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900">Metadata</h3>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 text-sm">
                        <User className="w-4 h-4 text-gray-500" />
                        <span className="text-gray-600">Created by</span>
                        <span className="font-medium">AI Curator</span>
                      </div>
                      <div className="flex items-center gap-3 text-sm">
                        <Calendar className="w-4 h-4 text-gray-500" />
                        <span className="text-gray-600">Added</span>
                        <span className="font-medium">2 days ago</span>
                      </div>
                      <div className="flex items-center gap-3 text-sm">
                        <Eye className="w-4 h-4 text-gray-500" />
                        <span className="text-gray-600">Views</span>
                        <span className="font-medium">{Math.floor(Math.random() * 1000) + 500}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'variations' && (
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-gray-900">Similar Prompts</h3>
                  <div className="grid gap-4">
                    {/* Placeholder for similar prompts */}
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="flex gap-3 bg-gray-50 rounded-xl p-3 hover:bg-gray-100 transition-colors cursor-pointer">
                        <div className="w-16 h-16 bg-gray-200 rounded-lg flex-shrink-0"></div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-gray-900 text-sm mb-1 truncate">
                            Similar Prompt {i}
                          </h4>
                          <p className="text-xs text-gray-600 line-clamp-2">
                            This is a similar prompt that might interest you...
                          </p>
                          <div className="flex items-center gap-2 mt-2">
                            <Star className="w-3 h-3 text-yellow-500" />
                            <span className="text-xs text-gray-500">{90 + i}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PromptDetailModal;