import { useState, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';

interface DashboardStats {
  content: {
    prompts: {
      total: number;
      published: number;
      draft: number;
      featured: number;
      newToday: number;
      growth: string;
    };
    categories: {
      total: number;
      active: number;
      newToday: number;
    };
  };
  users: {
    total: number;
    active: number;
    newToday: number;
  };
  engagement: {
    views: { total: number; today: number };
    downloads: { total: number; today: number };
    likes: { total: number; today: number };
  };
  system: {
    cronJobs: {
      total: number;
      active: number;
    };
  };
}

interface TopContent {
  topPrompts: Array<{
    _id: string;
    title: string;
    views: number;
    downloads: number;
    likes: number;
    imageUrl?: string;
    category: { name: string; color?: string };
  }>;
  topCategories: Array<{
    _id: string;
    name: string;
    color?: string;
    promptCount: number;
    totalViews: number;
  }>;
}

export const useDashboard = () => {
  const { token } = useAuth();
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);
  const [topContent, setTopContent] = useState<TopContent | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardOverview = useCallback(async () => {
    try {
      if (!token) {
        throw new Error('No authentication token available. Please login again.');
      }
      
      const response = await fetch('/api/dashboard/overview', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      // Check if response is HTML (likely an error page)
      const contentType = response.headers.get('content-type');
      if (contentType && !contentType.includes('application/json')) {
        const text = await response.text();
        console.error('Non-JSON response received:', text.substring(0, 200));
        throw new Error(`Server returned HTML instead of JSON. Check if backend is running on the correct port.`);
      }
      
      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Authentication failed. Please login again.');
        }
        throw new Error(`HTTP ${response.status}: Failed to fetch dashboard overview`);
      }
      
      const data = await response.json();
      setDashboardStats(data.data);
    } catch (err) {
      console.error('Error fetching dashboard overview:', err);
      if (err instanceof Error) {
        if (err.name === 'TypeError' && err.message.includes('fetch')) {
          setError('Cannot connect to backend server. Make sure the backend is running on http://localhost:5000');
        } else if (err.message.includes('<!doctype') || err.message.includes('Unexpected token')) {
          setError('Backend server returned HTML instead of JSON. Check server configuration.');
        } else {
          setError(err.message);
        }
      } else {
        setError('Unknown error occurred while fetching dashboard data');
      }
    }
  }, [token]);

  const fetchTopContent = useCallback(async (metric: string = 'views') => {
    try {
      if (!token) {
        throw new Error('No authentication token available. Please login again.');
      }
      
      const response = await fetch(`/api/dashboard/top-content?metric=${metric}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      const contentType = response.headers.get('content-type');
      if (contentType && !contentType.includes('application/json')) {
        throw new Error('Server returned HTML instead of JSON. Check if backend is running.');
      }
      
      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Authentication failed. Please login again.');
        }
        throw new Error(`HTTP ${response.status}: Failed to fetch top content`);
      }
      
      const data = await response.json();
      setTopContent(data.data);
    } catch (err) {
      console.error('Error fetching top content:', err);
      if (err instanceof Error && err.name === 'TypeError' && err.message.includes('fetch')) {
        setError('Cannot connect to backend server. Make sure the backend is running.');
      } else {
        setError(err instanceof Error ? err.message : 'Unknown error');
      }
    }
  }, [token]);

  const fetchAllDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      await Promise.all([
        fetchDashboardOverview(),
        fetchTopContent()
      ]);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch dashboard data');
    } finally {
      setLoading(false);
    }
  }, [fetchDashboardOverview, fetchTopContent]);

  const generateDailyAnalytics = useCallback(async (date?: string) => {
    try {
      setLoading(true);
      const response = await fetch('/api/dashboard/generate-analytics', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ date }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to generate analytics');
      }
      
      const data = await response.json();
      // Refresh dashboard data after generating analytics
      await fetchAllDashboardData();
      return data;
    } catch (err) {
      console.error('Error generating analytics:', err);
      setError(err instanceof Error ? err.message : 'Failed to generate analytics');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchAllDashboardData]);

  return {
    // State
    dashboardStats,
    topContent,
    loading,
    error,
    
    // Actions
    fetchDashboardOverview,
    fetchTopContent,
    fetchAllDashboardData,
    generateDailyAnalytics,
    
    // Utilities
    clearError: () => setError(null),
  };
};