import React, { useRef, useState, useEffect } from 'react';
import { Copy, Check, Heart, Share2, Maximize2, Bookmark, Eye, Download, Tag, Star } from 'lucide-react';
import { Prompt } from '../hooks/usePrompts';
import { useInView } from '../hooks/useInView';
import { cn } from '../utils/cn';
import AspectRatio from './AspectRatio';
import PromptDetailModal from './PromptDetailModal';
import ShareModal from './ShareModal';
import { usePrompts } from '../hooks/usePrompts';

interface PromptImageCardProps {
  prompt: Prompt;
  index: number;
  viewMode?: 'masonry' | 'grid' | 'list';
}

const PromptImageCard: React.FC<PromptImageCardProps> = ({ prompt, index, viewMode = 'masonry' }) => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true });
  const [isLoading, setIsLoading] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  
  // Get functions from usePrompts hook for tracking and interactions
  const { incrementDownload, toggleLike, sharePrompt, hasUserLiked, hasUserShared } = usePrompts();
  
  // Check if user has liked this prompt
  const isLiked = hasUserLiked(prompt._id);
  const hasShared = hasUserShared(prompt._id);
  
  // Load like status on component mount
  useEffect(() => {
    // Like status is managed by the usePrompts hook
  }, [prompt._id]);

  const handleCopyPrompt = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(prompt.description);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error('Failed to copy prompt:', err);
    }
  };

  // Handle opening modal - let modal handle view tracking
  const handleOpenModal = () => {
    setShowDetailModal(true);
  };

  // Handle download with download tracking
  const handleDownload = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    try {
      // Track download count
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

  // Handle like with proper toggle functionality
  const handleLike = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await toggleLike(prompt._id);
      console.log(`Prompt ${isLiked ? 'unliked' : 'liked'} successfully`);
    } catch (err) {
      console.error('Failed to toggle like:', err);
    }
  };

  const handleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsFavorited(!isFavorited);
  };

  const handleBookmark = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsBookmarked(!isBookmarked);
  };

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowShareModal(true);
  };
  
  const handleSharePrompt = async (shareType: string) => {
    try {
      return await sharePrompt(prompt._id, shareType);
    } catch (err) {
      console.error('Failed to share prompt:', err);
      throw err;
    }
  };

  // Determine aspect ratio based on image dimensions or default to landscape
  const aspectRatio = 16/9; // Default to landscape since we don't have isPortrait in API

  if (viewMode === 'list') {
    return (
      <div 
        ref={ref}
        className="group bg-white rounded-2xl border-2 border-gray-200 p-6 hover:border-purple-300 hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="flex gap-6">
          {/* Image */}
          <div className="w-32 h-32 flex-shrink-0">
            <img
              alt={prompt.title}
              src={prompt.imageUrl || '/placeholder-image.jpg'}
              className="w-full h-full object-cover rounded-xl"
              onLoad={() => setIsLoading(false)}
              loading="lazy"
            />
          </div>
          
          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{prompt.title}</h3>
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full font-medium">
                    {typeof prompt.category === 'object' ? prompt.category.name : prompt.category}
                  </span>
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-500" />
                    <span>{prompt.likes}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Eye className="w-4 h-4" />
                    <span>{prompt.views}</span>
                  </div>
                </div>
              </div>
              
              {/* Actions */}
              <div className="flex items-center gap-2">
                <button
                  onClick={handleLike}
                  className={cn(
                    "p-2 rounded-full transition-colors",
                    isLiked ? 'text-red-500 bg-red-50' : 'text-gray-400 hover:text-red-500 hover:bg-red-50'
                  )}
                >
                  <Heart className="w-5 h-5" fill={isLiked ? 'currentColor' : 'none'} />
                </button>
                <button
                  onClick={handleBookmark}
                  className={cn(
                    "p-2 rounded-full transition-colors",
                    isBookmarked ? 'text-blue-500 bg-blue-50' : 'text-gray-400 hover:text-blue-500 hover:bg-blue-50'
                  )}
                >
                  <Bookmark className="w-5 h-5" fill={isBookmarked ? 'currentColor' : 'none'} />
                </button>
                <button
                  onClick={handleShare}
                  className="p-2 rounded-full text-gray-400 hover:text-purple-500 hover:bg-purple-50 transition-colors"
                >
                  <Share2 className="w-5 h-5" />
                </button>
              </div>
            </div>
            
            <p className="text-gray-600 mb-4 line-clamp-2">{prompt.description}</p>
            
            {/* Tags */}
            <div className="flex flex-wrap gap-2 mb-4">
              {prompt.tags.map((tag, i) => (
                <span key={i} className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-600 rounded-full">
                  #{tag}
                </span>
              ))}
            </div>
            
            {/* Copy Button */}
            <button
              onClick={handleCopyPrompt}
              className={`px-6 py-2 rounded-xl font-semibold text-sm transition-all duration-200 flex items-center gap-2 ${
                copySuccess 
                  ? "bg-green-600 text-white" 
                  : "bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:shadow-lg transform hover:scale-105"
              }`}
            >
              {copySuccess ? (
                <>
                  <Check className="w-4 h-4" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  Copy Prompt
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      ref={ref}
      className="relative group cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleOpenModal}
    >
      <AspectRatio
        ratio={viewMode === 'grid' ? 1 : aspectRatio}
        className="bg-gradient-to-br from-gray-50 to-gray-100 relative w-full rounded-2xl border-2 border-gray-200 overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:scale-[1.02] group-hover:border-purple-300"
      >
        {/* Main Image */}
        <img
          alt={prompt.title}
          src={prompt.imageUrl || '/placeholder-image.jpg'}
          className={cn(
            'w-full h-full object-cover transition-all duration-700 ease-in-out',
            {
              'opacity-100 scale-100': isInView && !isLoading,
              'opacity-0 scale-95': !isInView || isLoading,
              'scale-110': isHovered
            }
          )}
          onLoad={() => setIsLoading(false)}
          loading="lazy"
        />
        
        {/* Top Actions Bar */}
        <div className={cn(
          "absolute top-4 left-4 right-4 flex justify-between items-center transition-all duration-300",
          isHovered ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2"
        )}>
          {/* Category & Stats */}
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-white/90 backdrop-blur-sm rounded-full text-xs font-bold text-gray-800 border border-white/50">
              {typeof prompt.category === 'object' ? prompt.category.name : prompt.category}
            </span>
            <div className="flex items-center gap-1 px-2 py-1 bg-white/90 backdrop-blur-sm rounded-full border border-white/50">
              <Star className="w-3 h-3 text-yellow-500" />
              <span className="text-xs font-bold text-gray-800">{prompt.likes}</span>
            </div>
          </div>
          
          {/* Quick Actions */}
          <div className="flex items-center gap-1">
            <button
              onClick={handleLike}
              className={cn(
                "p-2 rounded-full backdrop-blur-sm border border-white/50 transition-all duration-200",
                isLiked 
                  ? 'bg-red-500 text-white' 
                  : 'bg-white/90 text-gray-700 hover:bg-red-500 hover:text-white'
              )}
            >
              <Heart className="w-4 h-4" fill={isLiked ? 'currentColor' : 'none'} />
            </button>
            <button
              onClick={handleBookmark}
              className={cn(
                "p-2 rounded-full backdrop-blur-sm border border-white/50 transition-all duration-200",
                isBookmarked 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-white/90 text-gray-700 hover:bg-blue-500 hover:text-white'
              )}
            >
              <Bookmark className="w-4 h-4" fill={isBookmarked ? 'currentColor' : 'none'} />
            </button>
            <button
              onClick={handleShare}
              className={cn(
                "p-2 rounded-full backdrop-blur-sm border border-white/50 transition-all duration-200",
                hasShared 
                  ? 'bg-purple-500 text-white' 
                  : 'bg-white/90 text-gray-700 hover:bg-purple-500 hover:text-white'
              )}
            >
              <Share2 className="w-4 h-4" />
            </button>
          </div>
        </div>
        
        {/* Enhanced Overlay on Hover */}
        <div className={cn(
          "absolute inset-0 bg-gradient-to-t from-black/95 via-black/50 to-transparent transition-all duration-500 ease-in-out",
          isHovered ? "opacity-100" : "opacity-0"
        )}>
          
          {/* Content Container */}
          <div className={cn(
            "absolute inset-x-4 bottom-4 transform transition-all duration-500 ease-in-out",
            isHovered ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"
          )}>
            
            {/* Title */}
            <h3 className="text-white text-lg font-bold mb-2 line-clamp-1">{prompt.title}</h3>
            
            {/* Prompt Text */}
            <p className="text-white/90 text-sm leading-relaxed mb-4 line-clamp-3 font-mono bg-black/20 rounded-lg p-3 backdrop-blur-sm">
              "{prompt.description}"
            </p>
            
            {/* Tags */}
            <div className="flex flex-wrap gap-2 mb-4">
              {prompt.tags.slice(0, 3).map((tag, i) => (
                <span key={i} className="px-2 py-1 text-xs font-medium bg-white/20 text-white rounded-full backdrop-blur-sm border border-white/30">
                  #{tag}
                </span>
              ))}
              {prompt.tags.length > 3 && (
                <span className="px-2 py-1 text-xs font-medium bg-white/20 text-white rounded-full backdrop-blur-sm border border-white/30">
                  +{prompt.tags.length - 3}
                </span>
              )}
            </div>
            
            {/* Action Buttons */}
            <div className="flex gap-2">
              <button
                onClick={handleCopyPrompt}
                className={cn(
                  "flex-1 py-3 px-4 rounded-xl font-bold text-sm transition-all duration-200 flex items-center justify-center gap-2 border-2",
                  copySuccess 
                    ? "bg-green-600 text-white border-green-600 scale-105" 
                    : "bg-white text-gray-900 border-white hover:bg-gray-100 hover:scale-105 shadow-lg"
                )}
              >
                {copySuccess ? (
                  <>
                    <Check className="w-4 h-4" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    Copy
                  </>
                )}
              </button>
              
              <button className="p-3 bg-white/20 backdrop-blur-sm text-white border-2 border-white/30 rounded-xl hover:bg-white/30 transition-all duration-200 hover:scale-110"
                onClick={(e) => {
                  e.stopPropagation();
                  handleOpenModal(); // Use consistent modal opening
                }}
              >
                <Maximize2 className="w-4 h-4" />
              </button>
            </div>
            
            {/* View Stats - use real data */}
            <div className="flex items-center justify-between mt-3 text-xs text-white/70">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1">
                  <Eye className="w-3 h-3" />
                  <span>{prompt.views}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Download className="w-3 h-3" />
                  <span>{prompt.downloads}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Heart className="w-3 h-3" />
                  <span>{prompt.likes}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Share2 className="w-3 h-3" />
                  <span>{prompt.shares || 0}</span>
                </div>
              </div>
              <div className="text-xs text-white/50">
                #{prompt._id.slice(-4)}
              </div>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-200 animate-pulse rounded-2xl flex items-center justify-center">
            <div className="w-8 h-8 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
          </div>
        )}
        
        {/* Featured Indicator */}
        {prompt.featured && (
          <div className="absolute top-2 right-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg animate-pulse">
            🔥 FEATURED
          </div>
        )}
      </AspectRatio>
      
      {/* Detail Modal - handles its own view tracking */}
      <PromptDetailModal 
        prompt={prompt}
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
      />
      
      {/* Share Modal */}
      <ShareModal 
        prompt={prompt}
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        onShare={handleSharePrompt}
      />
    </div>
  );
};

export default PromptImageCard;