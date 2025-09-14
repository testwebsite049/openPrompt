import { useState, useEffect, useCallback } from 'react';
import { getApiUrl, debugLog, errorLog } from '../utils/config';

interface Category {
  _id: string;
  name: string;
  color?: string;
  slug: string;
}

interface Prompt {
  _id: string;
  title: string;
  description: string;
  category: Category;
  tags: string[];
  imageUrl?: string;
  imageVariants?: {
    thumbnail: string;
    small: string;
    medium: string;
    large: string;
    original: string;
  };
  views: number;
  downloads: number;
  likes: number;
  shares: number;
  featured: boolean;
  status: string;
  createdAt: string;
  updatedAt: string;
}

interface PromptsResponse {
  prompts: Prompt[];
  pagination: {
    current: number;
    pages: number;
    total: number;
    hasNext: boolean;
    hasPrev: boolean;
    limit: number;
  };
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}



export const usePrompts = () => {
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);
  
  // Track which prompts have been viewed in this session to prevent duplicate tracking
  const [viewedPrompts, setViewedPrompts] = useState<Set<string>>(new Set());
  const [downloadedPrompts, setDownloadedPrompts] = useState<Set<string>>(new Set());
  
  // Track user interactions (likes, shares)
  const [userLikes, setUserLikes] = useState<Set<string>>(new Set());
  const [userShares, setUserShares] = useState<Set<string>>(new Set());
  
  // Session ID for anonymous user tracking
  const [sessionId, setSessionId] = useState<string>(() => {
    // Generate or retrieve session ID
    let id = localStorage.getItem('userSessionId');
    if (!id) {
      id = Date.now().toString(36) + Math.random().toString(36).substr(2);
      localStorage.setItem('userSessionId', id);
    }
    return id;
  });

  // API request helper for public endpoints
  const apiRequest = async <T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> => {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'X-Session-ID': sessionId,
      ...options.headers as Record<string, string>,
    };
    
    const response = await fetch(getApiUrl(endpoint), {
      ...options,
      headers,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Request failed' }));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  };

  // Fetch prompts with filters
  const fetchPrompts = useCallback(async (params: {
    page?: number;
    limit?: number;
    category?: string;
    search?: string;
    featured?: boolean;
    sortBy?: string;
    sortOrder?: string;
  } = {}) => {
    console.log('🔍 usePrompts: fetchPrompts called with params:', params);
    setLoading(true);
    setError(null);
    
    try {
      const queryParams = new URLSearchParams();
      
      // Add parameters
      if (params.page) queryParams.append('page', params.page.toString());
      if (params.limit) queryParams.append('limit', params.limit.toString());
      if (params.category && params.category !== 'all') queryParams.append('category', params.category);
      if (params.search) queryParams.append('search', params.search);
      if (params.featured !== undefined) queryParams.append('featured', params.featured.toString());
      if (params.sortBy) queryParams.append('sortBy', params.sortBy);
      if (params.sortOrder) queryParams.append('sortOrder', params.sortOrder);
      
      const response = await apiRequest<PromptsResponse>(`/prompts?${queryParams.toString()}`);
      
      if (params.page && params.page > 1) {
        // Append to existing prompts for pagination
        setPrompts(prev => [...prev, ...response.data.prompts]);
      } else {
        // Replace prompts for new search/filter
        setPrompts(response.data.prompts);
      }
      
      setTotalCount(response.data.pagination.total);
      return response.data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch prompts';
      setError(errorMessage);
      console.error('Error fetching prompts:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch featured prompts
  const fetchFeaturedPrompts = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await apiRequest<Prompt[]>('/prompts/featured');
      setPrompts(response.data);
      setTotalCount(response.data.length);
      return response.data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch featured prompts';
      setError(errorMessage);
      console.error('Error fetching featured prompts:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Get single prompt with view tracking
  const getPrompt = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await apiRequest<Prompt>(`/prompts/${id}`);
      return response.data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch prompt';
      setError(errorMessage);
      console.error('Error fetching prompt:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Increment view count (with better session management)
  const incrementView = useCallback(async (id: string) => {
    try {
      // Always make the API call for accurate tracking
      await apiRequest(`/prompts/${id}/view`, {
        method: 'POST',
      });
      
      // Mark as viewed for this session (for UI feedback)
      setViewedPrompts(prev => new Set([...prev, id]));
      
      // Update local state to reflect the view increment
      setPrompts(prev => 
        prev.map(prompt => 
          prompt._id === id 
            ? { ...prompt, views: prompt.views + 1 }
            : prompt
        )
      );
      
      console.log(`View tracked for prompt ${id}`);
      return true;
    } catch (err) {
      console.error('Error incrementing view:', err);
      return false;
    }
  }, []);

  // Enhanced toggle like with proper state management
  const toggleLike = useCallback(async (id: string) => {
    try {
      const response = await apiRequest<{
        action: string;
        isLiked: boolean;
        likesCount: number;
      }>(`/prompts/${id}/like`, {
        method: 'POST',
      });
      
      const { action, isLiked, likesCount } = response.data;
      
      // Update local user likes state
      setUserLikes(prev => {
        const newSet = new Set(prev);
        if (isLiked) {
          newSet.add(id);
        } else {
          newSet.delete(id);
        }
        return newSet;
      });
      
      // Update local prompts state
      setPrompts(prev => 
        prev.map(prompt => 
          prompt._id === id 
            ? { ...prompt, likes: likesCount }
            : prompt
        )
      );
      
      return { action, isLiked, likesCount };
    } catch (err) {
      console.error('Error toggling like:', err);
      throw err;
    }
  }, []);
  
  // Check like status for a prompt
  const getLikeStatus = useCallback(async (id: string) => {
    try {
      const response = await apiRequest<{
        isLiked: boolean;
        likesCount: number;
      }>(`/prompts/${id}/like-status`);
      
      const { isLiked, likesCount } = response.data;
      
      // Update local state
      setUserLikes(prev => {
        const newSet = new Set(prev);
        if (isLiked) {
          newSet.add(id);
        } else {
          newSet.delete(id);
        }
        return newSet;
      });
      
      return { isLiked, likesCount };
    } catch (err) {
      console.error('Error getting like status:', err);
      return { isLiked: false, likesCount: 0 };
    }
  }, []);
  
  // Share prompt functionality
  const sharePrompt = useCallback(async (id: string, shareType: string = 'copy') => {
    try {
      const response = await apiRequest<{
        shareType: string;
        sharesCount: number;
        shareData: {
          title: string;
          description: string;
          url: string;
          imageUrl?: string;
          hashtags: string;
        };
        shareUrls: {
          twitter?: string;
          facebook?: string;
          linkedin?: string;
          whatsapp?: string;
          telegram?: string;
          email?: string;
        };
      }>(`/prompts/${id}/share`, {
        method: 'POST',
        body: JSON.stringify({ shareType })
      });
      
      const { sharesCount, shareData, shareUrls } = response.data;
      
      // Update local shares state
      setUserShares(prev => new Set([...prev, id]));
      
      // Update local prompts state
      setPrompts(prev => 
        prev.map(prompt => 
          prompt._id === id 
            ? { ...prompt, shares: sharesCount }
            : prompt
        )
      );
      
      return { sharesCount, shareData, shareUrls };
    } catch (err) {
      console.error('Error sharing prompt:', err);
      throw err;
    }
  }, []);

  // Increment download count (with duplicate prevention for rapid clicks)
  const incrementDownload = useCallback(async (id: string) => {
    // Prevent rapid duplicate downloads (allow after 1 second)
    const downloadKey = `${id}_${Math.floor(Date.now() / 1000)}`;
    if (downloadedPrompts.has(downloadKey)) {
      console.log('Download already tracked recently for this prompt');
      return true;
    }
    
    try {
      await apiRequest(`/prompts/${id}/download`, {
        method: 'POST',
      });
      
      // Mark as downloaded to prevent rapid duplicate tracking
      setDownloadedPrompts(prev => new Set([...prev, downloadKey]));
      
      // Clean up old download tracking entries (keep last 10)
      setDownloadedPrompts(prev => {
        const entries = Array.from(prev);
        if (entries.length > 10) {
          return new Set(entries.slice(-10));
        }
        return prev;
      });
      
      // Update local state
      setPrompts(prev => 
        prev.map(prompt => 
          prompt._id === id 
            ? { ...prompt, downloads: prompt.downloads + 1 }
            : prompt
        )
      );
      return true;
    } catch (err) {
      console.error('Error incrementing download:', err);
      return false;
    }
  }, [downloadedPrompts]);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);
  
  // Check if prompt has been viewed in current session (for UI feedback only)
  const hasViewedPrompt = useCallback((id: string) => {
    return viewedPrompts.has(id);
  }, [viewedPrompts]);
  
  // Check if we should track a view (prevent rapid duplicate calls within 5 seconds)
  const shouldTrackView = useCallback((id: string) => {
    const lastTracked = localStorage.getItem(`lastViewed_${id}`);
    if (!lastTracked) return true;
    
    const timeDiff = Date.now() - parseInt(lastTracked);
    return timeDiff > 5000; // 5 seconds cooldown
  }, []);
  
  // Enhanced increment view with cooldown instead of session blocking
  const trackView = useCallback(async (id: string) => {
    // Check cooldown to prevent rapid duplicate calls
    if (!shouldTrackView(id)) {
      console.log(`View tracking on cooldown for prompt ${id}`);
      return true;
    }
    
    console.log(`Attempting to track view for prompt ${id}`);
    
    try {
      const success = await incrementView(id);
      if (success) {
        // Set cooldown timestamp
        localStorage.setItem(`lastViewed_${id}`, Date.now().toString());
        console.log(`Successfully tracked view for prompt ${id}`);
      }
      return success;
    } catch (err) {
      console.error('Error tracking view:', err);
      return false;
    }
  }, [incrementView, shouldTrackView]);
  
  // Clear tracking data (useful for testing or reset)
  const clearTrackingData = useCallback(() => {
    setViewedPrompts(new Set());
    setDownloadedPrompts(new Set());
    setUserLikes(new Set());
    setUserShares(new Set());
  }, []);
  
  // Helper functions to check user interaction state
  const hasUserLiked = useCallback((id: string) => {
    return userLikes.has(id);
  }, [userLikes]);
  
  const hasUserShared = useCallback((id: string) => {
    return userShares.has(id);
  }, [userShares]);
  
  // Load user interaction state on component mount
  useEffect(() => {
    // Load stored interaction data if needed
    const storedLikes = localStorage.getItem(`userLikes_${sessionId}`);
    const storedShares = localStorage.getItem(`userShares_${sessionId}`);
    
    if (storedLikes) {
      try {
        const likes = JSON.parse(storedLikes);
        setUserLikes(new Set(likes));
      } catch (e) {
        console.error('Error loading stored likes:', e);
      }
    }
    
    if (storedShares) {
      try {
        const shares = JSON.parse(storedShares);
        setUserShares(new Set(shares));
      } catch (e) {
        console.error('Error loading stored shares:', e);
      }
    }
  }, [sessionId]);
  
  // Save user interaction state to localStorage
  useEffect(() => {
    localStorage.setItem(`userLikes_${sessionId}`, JSON.stringify([...userLikes]));
  }, [userLikes, sessionId]);
  
  useEffect(() => {
    localStorage.setItem(`userShares_${sessionId}`, JSON.stringify([...userShares]));
  }, [userShares, sessionId]);

  // Optional initial load - only load if explicitly requested
  useEffect(() => {
    // Remove automatic loading to prevent conflicts with pages that manage their own loading
    // Pages should call fetchPrompts explicitly when needed
  }, []);

  return {
    prompts,
    loading,
    error,
    totalCount,
    fetchPrompts,
    fetchFeaturedPrompts,
    getPrompt,
    incrementView,
    trackView,
    toggleLike,
    getLikeStatus,
    sharePrompt,
    incrementDownload,
    clearError,
    hasViewedPrompt,
    shouldTrackView,
    clearTrackingData,
    hasUserLiked,
    hasUserShared,
    sessionId
  };
};

export type { Prompt, Category };