import { useState, useEffect, useCallback } from 'react';

interface Category {
  _id: string;
  name: string;
  slug: string;
  color?: string;
  description?: string;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

const API_BASE_URL = 'http://localhost:5000/api';

export const useCategories = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // API request helper for public endpoints
  const apiRequest = async <T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> => {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Request failed' }));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  };

  // Fetch all categories
  const fetchCategories = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await apiRequest<Category[]>('/categories');
      setCategories(response.data);
      return response.data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch categories';
      setError(errorMessage);
      console.error('Error fetching categories:', err);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Load categories on mount
  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  return {
    categories,
    loading,
    error,
    fetchCategories,
    clearError
  };
};

export type { Category };