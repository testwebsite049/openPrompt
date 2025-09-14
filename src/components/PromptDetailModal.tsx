import React, { useState, useEffect } from 'react';
import { X, Copy, Check, Heart, Share2, Download, Maximize2, Minimize2, Tag, Star, Eye, Calendar, User } from 'lucide-react';
import { Prompt } from '../hooks/usePrompts';
import { usePrompts } from '../hooks/usePrompts';
import ShareModal from './ShareModal';
import ViewCountDebug from './ViewCountDebug';

interface PromptDetailModalProps {
  prompt: Prompt | null;
  isOpen: boolean;
  onClose: () => void;
  viewTracked?: boolean; // Track if view has already been counted
}

const PromptDetailModal: React.FC<PromptDetailModalProps> = ({ prompt, isOpen, onClose, viewTracked = false }) => {
  const [copySuccess, setCopySuccess] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [activeTab, setActiveTab] = useState<'prompt' | 'details' | 'variations'>('prompt');
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  
  // Get tracking functions
  const { incrementDownload, trackView, hasViewedPrompt, sharePrompt, toggleLike, hasUserLiked } = usePrompts();
  
  // Track if view has been counted for this session to prevent duplicate calls
  const [hasTrackedView, setHasTrackedView] = useState(false);
  const [showViewTracked, setShowViewTracked] = useState(false);
  
  // Get user interaction state
  const isLiked = hasUserLiked(prompt?._id || '');
  const [localLikeCount, setLocalLikeCount] = useState(prompt?.likes || 0);

  // Reset states when prompt changes
  useEffect(() => {
    if (prompt) {
      setImageLoading(true);
      setImageError(false);
      setLocalLikeCount(prompt.likes);
      
      // Check if view has already been tracked for this prompt
      const alreadyViewed = hasViewedPrompt(prompt._id);
      setHasTrackedView(alreadyViewed || viewTracked);
      
      // Preload image for better performance
      if (prompt.imageUrl) {
        const img = new Image();
        img.onload = () => {
          setImageLoading(false);
          setImageError(false);
        };
        img.onerror = () => {
          setImageLoading(false);
          setImageError(true);
        };
        img.src = prompt.imageUrl;
      }
    }
  }, [prompt, viewTracked, hasViewedPrompt]);

  // Track view when modal opens (with proper cooldown)
  useEffect(() => {
    if (isOpen && prompt && !viewTracked) {
      const handleViewTracking = async () => {
        try {
          const success = await trackView(prompt._id);
          if (success) {
            setHasTrackedView(true);
            setShowViewTracked(true);
            console.log(`Modal view tracked for: ${prompt.title}`);
            
            // Hide the indicator after 2 seconds
            setTimeout(() => setShowViewTracked(false), 2000);
          }
        } catch (error) {
          console.error('Failed to track view in modal:', error);
        }
      };
      
      // Track after a small delay to ensure modal is fully rendered
      const timeoutId = setTimeout(handleViewTracking, 100);
      return () => clearTimeout(timeoutId);
    }
  }, [isOpen, prompt, viewTracked, trackView]);

  // Reset states when modal closes
  useEffect(() => {
    if (!isOpen) {
      setActiveTab('prompt');
      setIsFullscreen(false);
      setCopySuccess(false);
      setShowShareModal(false);
      // Note: We don't reset hasTrackedView here to prevent re-tracking
    }
  }, [isOpen]);

  const handleImageLoad = () => {
    setImageLoading(false);
    setImageError(false);
  };

  const handleImageError = () => {
    setImageLoading(false);
    setImageError(true);
  };

  const handleRetryImage = () => {
    if (prompt?.imageUrl) {
      setImageLoading(true);
      setImageError(false);
      
      // Force reload with cache busting
      const img = new Image();
      img.onload = handleImageLoad;
      img.onerror = handleImageError;
      img.src = prompt.imageUrl + '?retry=' + Date.now();
    }
  };

  // Handle modal close with proper cleanup
  const handleClose = () => {
    // Reset UI states but keep tracking state
    setActiveTab('prompt');
    setIsFullscreen(false);
    setCopySuccess(false);
    setShowShareModal(false);
    onClose();
  };

  // Handle like functionality
  const handleLike = async () => {
    if (!prompt) return;
    
    try {
      const result = await toggleLike(prompt._id);
      setLocalLikeCount(result.likesCount);
    } catch (err) {
      console.error('Failed to toggle like:', err);
    }
  };

  // Handle share functionality
  const handleShare = () => {
    setShowShareModal(true);
  };
  
  // Handle share prompt from modal
  const handleSharePrompt = async (shareType: string) => {
    if (!prompt) throw new Error('No prompt available');
    
    try {
      return await sharePrompt(prompt._id, shareType);
    } catch (err) {
      console.error('Failed to share prompt:', err);
      throw err;
    }
  };

  if (!isOpen || !prompt) return null;

  const handleCopyPrompt = async () => {
    try {
      await navigator.clipboard.writeText(prompt.description);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error('Failed to copy prompt:', err);
    }
  };

  const handleDownload = async () => {
    if (!prompt) return;
    
    try {
      // Track download count in backend
      await incrementDownload(prompt._id);
      
      // Create and download the file
      const element = document.createElement('a');
      const file = new Blob([prompt.description], { type: 'text/plain' });
      element.href = URL.createObjectURL(file);
      element.download = `${prompt.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.txt`;
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
    } catch (err) {
      console.error('Failed to download prompt:', err);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
      onClick={handleClose} // Close on backdrop click
    >
      <div 
        className={`bg-white rounded-3xl shadow-2xl transition-all duration-300 overflow-hidden ${
          isFullscreen ? 'w-full h-full' : 'max-w-6xl max-h-[90vh] w-full'
        }`}
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside modal
      >
        {/* Enhanced Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white relative">
          {/* View Tracking Indicator */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-bold text-gray-900 line-clamp-1">{prompt.title}</h2>
              {prompt.featured && (
                <span className="px-2 py-1 bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs font-bold rounded-full animate-pulse">
                  🔥 FEATURED
                </span>
              )}
            </div>
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
                {typeof prompt.category === 'object' ? prompt.category.name : prompt.category}
              </span>
              <div className="flex items-center gap-1 text-sm text-gray-500">
                <Star className="w-4 h-4 text-yellow-500" />
                <span className="font-medium">{localLikeCount}</span>
              </div>
              <div className="flex items-center gap-1 text-sm text-gray-500">
                <Eye className="w-4 h-4" />
                <span className="font-medium">{prompt.views}</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors"
              title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
            >
              {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
            </button>
            <button
              onClick={handleClose}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors"
              title="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Enhanced Layout */}
        <div className={`flex ${
          isFullscreen ? 'h-[calc(100vh-140px)]' : 'h-[calc(90vh-140px)]'
        }`}>
          {/* Enhanced Image Section */}
          <div className="flex-1 p-6 flex flex-col">
            <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 h-full shadow-inner">
              {/* Main Image with optimized loading */}
              {!imageError && (
                <img
                  src={prompt.imageUrl || '/placeholder-image.jpg'}
                  alt={prompt.title}
                  className={`w-full h-full object-contain bg-white transition-all duration-500 hover:scale-105 ${
                    imageLoading ? 'opacity-0' : 'opacity-100'
                  }`}
                  onLoad={handleImageLoad}
                  onError={handleImageError}
                  loading="eager"
                />
              )}
              
              {/* Image Loading State */}
              {imageLoading && !imageError && (
                <div className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                  <div className="text-gray-400 text-center">
                    <div className="w-16 h-16 border-4 border-gray-300 border-t-purple-500 rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-sm font-medium">Loading image...</p>
                  </div>
                </div>
              )}
              
              {/* Image Error State */}
              {imageError && (
                <div className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                  <div className="text-gray-400 text-center">
                    <div className="w-16 h-16 bg-gray-300 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-2xl">🖼️</span>
                    </div>
                    <p className="text-sm font-medium">Failed to load image</p>
                    <button 
                      onClick={handleRetryImage}
                      className="mt-2 px-3 py-1 text-xs bg-purple-100 text-purple-700 rounded-full hover:bg-purple-200 transition-colors"
                    >
                      Retry
                    </button>
                  </div>
                </div>
              )}
              
              {/* Enhanced Image Overlay Actions */}
              <div className="absolute top-4 right-4 flex flex-col gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleLike();
                  }}
                  className={`p-3 rounded-full backdrop-blur-md transition-all duration-300 transform hover:scale-110 ${
                    isLiked 
                      ? 'bg-red-500 text-white shadow-lg shadow-red-500/30' 
                      : 'bg-white/90 text-gray-700 hover:bg-red-500 hover:text-white shadow-lg'
                  }`}
                  title={isLiked ? 'Unlike this prompt' : 'Like this prompt'}
                >
                  <Heart className="w-5 h-5" fill={isLiked ? 'currentColor' : 'none'} />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleShare();
                  }}
                  className="p-3 rounded-full bg-white/90 backdrop-blur-md text-gray-700 hover:bg-purple-500 hover:text-white transition-all duration-300 transform hover:scale-110 shadow-lg hover:shadow-purple-500/30"
                  title="Share this prompt"
                >
                  <Share2 className="w-5 h-5" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDownload();
                  }}
                  className="p-3 rounded-full bg-white/90 backdrop-blur-md text-gray-700 hover:bg-green-500 hover:text-white transition-all duration-300 transform hover:scale-110 shadow-lg hover:shadow-green-500/30"
                  title="Download prompt"
                >
                  <Download className="w-5 h-5" />
                </button>
              </div>

            </div>
            
            {/* Enhanced Image Info Bar */}
            <div className="mt-4 flex items-center justify-between text-sm text-gray-500">
              <div className="flex items-center gap-4">
                {imageLoading ? (
                  <span className="flex items-center gap-2">
                    <div className="w-3 h-3 border-2 border-purple-300 border-t-purple-600 rounded-full animate-spin"></div>
                    Loading...
                  </span>
                ) : imageError ? (
                  <span className="text-red-500">Error loading image</span>
                ) : (
                  <>
                    <span>High Quality Image</span>
                    <span>•</span>
                    <span>Click to zoom</span>
                  </>
                )}
              </div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-1 bg-gray-100 rounded-full text-xs">
                  ID: #{prompt._id.slice(-6).toUpperCase()}
                </span>
                {!imageLoading && !imageError && (
                  <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs">
                    ✓ Loaded
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Enhanced Content Section */}
          <div className="w-[420px] border-l border-gray-100 flex flex-col bg-gradient-to-b from-gray-50/50 to-white">
            {/* Enhanced Tabs */}
            <div className="flex border-b border-gray-100 bg-white/80 backdrop-blur-sm">
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
                    className={`flex-1 flex items-center justify-center gap-2 py-4 px-4 text-sm font-medium transition-all duration-300 ${
                      activeTab === tab.id
                        ? 'text-purple-600 border-b-2 border-purple-600 bg-purple-50/80 transform scale-105'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {tab.label}
                  </button>
                );
              })}
            </div>

            {/* Enhanced Tab Content */}
            <div className="flex-1 p-6 overflow-y-auto custom-scrollbar">
              {activeTab === 'prompt' && (
                <div className="space-y-6 animate-fadeIn">
                  {/* Enhanced Prompt Text */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <div className="w-2 h-6 bg-gradient-to-b from-purple-500 to-blue-500 rounded-full"></div>
                      AI Prompt
                    </h3>
                    <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-5 border border-gray-200 shadow-sm">
                      <p className="text-gray-800 leading-relaxed font-mono text-sm selection:bg-purple-200">
                        "{prompt.description}"
                      </p>
                    </div>
                  </div>

                  {/* Enhanced Copy Button */}
                  <button
                    onClick={handleCopyPrompt}
                    className={`w-full py-4 px-6 rounded-2xl font-semibold transition-all duration-300 flex items-center justify-center gap-3 transform hover:scale-105 ${
                      copySuccess
                        ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg shadow-green-500/30'
                        : 'bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:shadow-xl hover:shadow-purple-500/30'
                    }`}
                  >
                    {copySuccess ? (
                      <>
                        <Check className="w-5 h-5" />
                        Successfully Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="w-5 h-5" />
                        Copy to Clipboard
                      </>
                    )}
                  </button>

                  {/* Enhanced Usage Tips */}
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-5 border border-blue-200">
                    <h4 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
                      💡 Pro Tips
                    </h4>
                    <ul className="text-blue-800 text-sm space-y-2">
                      <li className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></span>
                        Customize specific details to match your creative vision
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></span>
                        Add style modifiers like "cinematic", "artistic", or "photorealistic"
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></span>
                        Experiment with different aspect ratios and resolutions
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></span>
                        Try combining multiple prompts for unique results
                      </li>
                    </ul>
                  </div>
                </div>
              )}

              {activeTab === 'details' && (
                <div className="space-y-6 animate-fadeIn">
                  {/* Enhanced Stats */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-2xl p-5 text-center border border-purple-100 hover:shadow-lg transition-all duration-300">
                      <div className="text-3xl font-bold text-purple-600 mb-1">{localLikeCount}</div>
                      <div className="text-sm text-gray-600 font-medium">Likes</div>
                    </div>
                    <div className="bg-gradient-to-br from-green-50 to-teal-50 rounded-2xl p-5 text-center border border-green-100 hover:shadow-lg transition-all duration-300">
                      <div className="text-3xl font-bold text-green-600 mb-1">{prompt.downloads}</div>
                      <div className="text-sm text-gray-600 font-medium">Downloads</div>
                    </div>
                  </div>

                  {/* Enhanced Tags */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <div className="w-2 h-6 bg-gradient-to-b from-purple-500 to-blue-500 rounded-full"></div>
                      <Tag className="w-5 h-5" />
                      Tags
                    </h3>
                    <div className="flex flex-wrap gap-3">
                      {prompt.tags.map((tag, i) => (
                        <span
                          key={i}
                          className="px-4 py-2 bg-gradient-to-r from-purple-100 to-blue-100 text-purple-700 rounded-full text-sm font-medium hover:from-purple-200 hover:to-blue-200 transition-all duration-300 cursor-pointer transform hover:scale-105 border border-purple-200"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Enhanced Metadata */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                      <div className="w-2 h-6 bg-gradient-to-b from-purple-500 to-blue-500 rounded-full"></div>
                      Information
                    </h3>
                    <div className="bg-gray-50 rounded-2xl p-5 space-y-4 border border-gray-200">
                      <div className="flex items-center justify-between py-2">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                            <User className="w-4 h-4 text-purple-600" />
                          </div>
                          <span className="text-gray-600 font-medium">Creator</span>
                        </div>
                        <span className="font-semibold text-gray-900">AI Curator</span>
                      </div>
                      <div className="flex items-center justify-between py-2">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                            <Calendar className="w-4 h-4 text-blue-600" />
                          </div>
                          <span className="text-gray-600 font-medium">Created</span>
                        </div>
                        <span className="font-semibold text-gray-900">{new Date(prompt.createdAt).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center justify-between py-2">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                            <Eye className="w-4 h-4 text-green-600" />
                          </div>
                          <span className="text-gray-600 font-medium">Views</span>
                        </div>
                        <span className="font-semibold text-gray-900">{prompt.views.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'variations' && (
                <div className="space-y-6 animate-fadeIn">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                      <div className="w-2 h-6 bg-gradient-to-b from-purple-500 to-blue-500 rounded-full"></div>
                      Similar Prompts
                    </h3>
                    <span className="text-sm text-gray-500">3 found</span>
                  </div>
                  
                  <div className="space-y-4">
                    {/* Enhanced similar prompts */}
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="group flex gap-4 bg-gradient-to-r from-gray-50 to-white rounded-2xl p-4 hover:from-purple-50 hover:to-blue-50 transition-all duration-300 cursor-pointer border border-gray-200 hover:border-purple-200 hover:shadow-lg">
                        <div className="w-20 h-20 bg-gradient-to-br from-gray-200 to-gray-300 rounded-xl flex-shrink-0 group-hover:scale-105 transition-transform duration-300 shadow-sm"></div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-gray-900 text-sm mb-2 group-hover:text-purple-700 transition-colors">
                            {i === 1 ? 'Artistic Digital Portrait' : i === 2 ? 'Creative Photography Style' : 'Modern Art Concept'}
                          </h4>
                          <p className="text-xs text-gray-600 line-clamp-2 mb-3">
                            {i === 1 ? 'A stunning digital artwork featuring vibrant colors and intricate details...' : 
                             i === 2 ? 'Professional photography prompt with cinematic lighting and composition...' :
                             'Contemporary art style with bold elements and creative expression...'}
                          </p>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="flex items-center gap-1">
                                <Star className="w-3 h-3 text-yellow-500" />
                                <span className="text-xs text-gray-500 font-medium">{90 + i * 5}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Eye className="w-3 h-3 text-gray-400" />
                                <span className="text-xs text-gray-500">{200 + i * 50}</span>
                              </div>
                            </div>
                            <button className="text-xs text-purple-600 hover:text-purple-700 font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                              View →
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {/* View more button */}
                  <button className="w-full py-3 px-4 border-2 border-dashed border-gray-300 rounded-2xl text-gray-600 hover:border-purple-300 hover:text-purple-600 transition-all duration-300 flex items-center justify-center gap-2 group">
                    <Eye className="w-4 h-4 group-hover:scale-110 transition-transform" />
                    <span className="font-medium">Browse More Similar Prompts</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Debug Component */}
      <ViewCountDebug promptId={prompt._id} currentViews={prompt.views} />
      
      {/* Share Modal */}
      {showShareModal && (
        <ShareModal 
          prompt={prompt}
          isOpen={showShareModal}
          onClose={() => setShowShareModal(false)}
          onShare={handleSharePrompt}
        />
      )}
    </div>
  );
};

export default PromptDetailModal;