import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import { Prompt } from '../data/promptsData';

interface AppContextType {
  // Favorites
  favorites: Set<number>;
  toggleFavorite: (promptId: number) => void;
  isFavorited: (promptId: number) => boolean;
  
  // Bookmarks
  bookmarks: Set<number>;
  toggleBookmark: (promptId: number) => void;
  isBookmarked: (promptId: number) => boolean;
  
  // View preferences
  defaultViewMode: 'masonry' | 'grid' | 'list';
  setDefaultViewMode: (mode: 'masonry' | 'grid' | 'list') => void;
  
  // Performance
  imageLoadingStrategy: 'eager' | 'lazy';
  setImageLoadingStrategy: (strategy: 'eager' | 'lazy') => void;
  
  // Analytics
  incrementViewCount: (promptId: number) => void;
  getViewCount: (promptId: number) => number;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};

interface AppProviderProps {
  children: React.ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  // State management with localStorage persistence
  const [favorites, setFavorites] = useState<Set<number>>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('openprompt_favorites');
      return saved ? new Set(JSON.parse(saved)) : new Set();
    }
    return new Set();
  });

  const [bookmarks, setBookmarks] = useState<Set<number>>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('openprompt_bookmarks');
      return saved ? new Set(JSON.parse(saved)) : new Set();
    }
    return new Set();
  });

  const [defaultViewMode, setDefaultViewMode] = useState<'masonry' | 'grid' | 'list'>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('openprompt_view_mode');
      return (saved as any) || 'masonry';
    }
    return 'masonry';
  });

  const [imageLoadingStrategy, setImageLoadingStrategy] = useState<'eager' | 'lazy'>('lazy');
  
  const [viewCounts, setViewCounts] = useState<Map<number, number>>(new Map());

  // Memoized functions for better performance
  const toggleFavorite = useCallback((promptId: number) => {
    setFavorites(prev => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(promptId)) {
        newFavorites.delete(promptId);
      } else {
        newFavorites.add(promptId);
      }
      
      // Persist to localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('openprompt_favorites', JSON.stringify(Array.from(newFavorites)));
      }
      
      return newFavorites;
    });
  }, []);

  const toggleBookmark = useCallback((promptId: number) => {
    setBookmarks(prev => {
      const newBookmarks = new Set(prev);
      if (newBookmarks.has(promptId)) {
        newBookmarks.delete(promptId);
      } else {
        newBookmarks.add(promptId);
      }
      
      // Persist to localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('openprompt_bookmarks', JSON.stringify(Array.from(newBookmarks)));
      }
      
      return newBookmarks;
    });
  }, []);

  const isFavorited = useCallback((promptId: number) => favorites.has(promptId), [favorites]);
  const isBookmarked = useCallback((promptId: number) => bookmarks.has(promptId), [bookmarks]);

  const handleViewModeChange = useCallback((mode: 'masonry' | 'grid' | 'list') => {
    setDefaultViewMode(mode);
    if (typeof window !== 'undefined') {
      localStorage.setItem('openprompt_view_mode', mode);
    }
  }, []);

  const incrementViewCount = useCallback((promptId: number) => {
    setViewCounts(prev => {
      const newCounts = new Map(prev);
      newCounts.set(promptId, (newCounts.get(promptId) || 0) + 1);
      return newCounts;
    });
  }, []);

  const getViewCount = useCallback((promptId: number) => {
    return viewCounts.get(promptId) || Math.floor(Math.random() * 1000) + 100;
  }, [viewCounts]);

  // Memoize the context value to prevent unnecessary re-renders
  const contextValue = useMemo(() => ({
    favorites,
    toggleFavorite,
    isFavorited,
    bookmarks,
    toggleBookmark,
    isBookmarked,
    defaultViewMode,
    setDefaultViewMode: handleViewModeChange,
    imageLoadingStrategy,
    setImageLoadingStrategy,
    incrementViewCount,
    getViewCount,
  }), [
    favorites,
    toggleFavorite,
    isFavorited,
    bookmarks,
    toggleBookmark,
    isBookmarked,
    defaultViewMode,
    handleViewModeChange,
    imageLoadingStrategy,
    incrementViewCount,
    getViewCount,
  ]);

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
};

// Performance hooks
export const useImageIntersection = (options?: IntersectionObserverInit) => {
  const [isVisible, setIsVisible] = useState(false);
  const [hasBeenVisible, setHasBeenVisible] = useState(false);
  
  const observerRef = useCallback((node: HTMLElement | null) => {
    if (hasBeenVisible) return;
    
    if (node) {
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            setHasBeenVisible(true);
            observer.unobserve(node);
          }
        },
        { threshold: 0.1, ...options }
      );
      
      observer.observe(node);
      
      return () => observer.unobserve(node);
    }
  }, [hasBeenVisible, options]);
  
  return { isVisible: isVisible || hasBeenVisible, observerRef };
};