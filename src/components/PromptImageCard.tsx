import React, { useRef, useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { Prompt } from '../data/promptsData';
import { useInView } from '../hooks/useInView';
import { cn } from '../utils/cn';
import AspectRatio from './AspectRatio';

interface PromptImageCardProps {
  prompt: Prompt;
  index: number;
}

const PromptImageCard: React.FC<PromptImageCardProps> = ({ prompt, index }) => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true });
  const [isLoading, setIsLoading] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);

  const handleCopyPrompt = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(prompt.prompt);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error('Failed to copy prompt:', err);
    }
  };

  const aspectRatio = prompt.isPortrait ? 9/16 : 16/9;

  return (
    <div 
      ref={ref}
      className="relative group cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <AspectRatio
        ratio={aspectRatio}
        className="bg-gray-50 relative w-full rounded-xl border border-gray-200 overflow-hidden shadow-md hover:shadow-2xl transition-all duration-300"
      >
        {/* Main Image */}
        <img
          alt={prompt.title}
          src={prompt.image_url}
          className={cn(
            'w-full h-full object-cover transition-all duration-500 ease-in-out',
            {
              'opacity-100 scale-100': isInView && !isLoading,
              'opacity-0 scale-95': !isInView || isLoading,
              'scale-105': isHovered
            }
          )}
          onLoad={() => setIsLoading(false)}
          loading="lazy"
        />
        
        {/* Dark Overlay on Hover */}
        <div className={cn(
          "absolute inset-0 bg-gradient-to-t from-black/95 via-black/60 to-transparent transition-all duration-300 ease-in-out",
          isHovered ? "opacity-100" : "opacity-0"
        )}>
          
          {/* Prompt Text Container */}
          <div className={cn(
            "absolute inset-x-4 bottom-4 transform transition-all duration-300 ease-in-out",
            isHovered ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
          )}>
            
            {/* Category Tag */}
            <div className="mb-3">
              <span className="inline-block px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-xs font-medium text-white border border-white/30">
                {prompt.category}
              </span>
            </div>
            
            {/* Prompt Text */}
            <p className="text-white text-sm font-medium leading-relaxed mb-4 line-clamp-4 font-mono">
              "{prompt.prompt}"
            </p>
            
            {/* Copy Button */}
            <button
              onClick={handleCopyPrompt}
              className={cn(
                "w-full py-3 px-4 rounded-lg font-semibold text-sm transition-all duration-200 flex items-center justify-center gap-2 border",
                copySuccess 
                  ? "bg-white text-black border-white" 
                  : "bg-transparent text-white border-white hover:bg-white hover:text-black hover:scale-105"
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
                  Copy Prompt
                </>
              )}
            </button>
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="absolute inset-0 bg-gray-100 animate-pulse rounded-xl" />
        )}
      </AspectRatio>
    </div>
  );
};

export default PromptImageCard;