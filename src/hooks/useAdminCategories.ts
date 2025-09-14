import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { getApiUrl, debugLog, errorLog } from '../utils/config';

interface Category {
  _id: string;
  name: string;
  description?: string;
  color?: string;
  promptCount: number;
  isActive: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
}

interface NewCategoryData {
  name: string;
  description?: string;
  color?: string;
  order?: number;
}

interface UpdateCategoryData extends NewCategoryData {
  isActive?: boolean;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  pagination?: {
    current: number;
    pages: number;
    total: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}



export const useAdminCategories = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { token } = useAuth();

  // API request helper
  const apiRequest = async <T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> => {
    const response = await fetch(getApiUrl(endpoint), {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
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
      const response = await apiRequest<{ categories: Category[] }>('/categories');
      setCategories(response.data.categories);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch categories';
      setError(errorMessage);
      console.error('Error fetching categories:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Create new category
  const createCategory = useCallback(async (categoryData: NewCategoryData): Promise<boolean> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await apiRequest<Category>('/categories', {
        method: 'POST',
        body: JSON.stringify(categoryData),
      });
      
      // Add the new category to the list
      setCategories(prev => [response.data, ...prev]);
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create category';
      setError(errorMessage);
      console.error('Error creating category:', err);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  // Update existing category
  const updateCategory = useCallback(async (
    categoryId: string,
    categoryData: UpdateCategoryData
  ): Promise<boolean> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await apiRequest<Category>(`/categories/${categoryId}`, {
        method: 'PUT',
        body: JSON.stringify(categoryData),
      });
      
      // Update the category in the list
      setCategories(prev => 
        prev.map(cat => cat._id === categoryId ? response.data : cat)
      );
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update category';
      setError(errorMessage);
      console.error('Error updating category:', err);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  // Delete category
  const deleteCategory = useCallback(async (categoryId: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    
    try {
      await apiRequest(`/categories/${categoryId}`, {
        method: 'DELETE',
      });
      
      // Remove the category from the list
      setCategories(prev => prev.filter(cat => cat._id !== categoryId));
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete category';
      setError(errorMessage);
      console.error('Error deleting category:', err);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  // Get category statistics
  const getCategoryStats = useCallback(async (categoryId: string) => {
    try {
      const response = await apiRequest(`/categories/${categoryId}/stats`);
      return response.data;
    } catch (err) {
      console.error('Error fetching category stats:', err);
      return null;
    }
  }, []);

  // Reorder categories
  const reorderCategories = useCallback(async (categoryOrders: { id: string; order: number }[]): Promise<boolean> => {
    setLoading(true);
    setError(null);
    
    try {
      await apiRequest('/categories/reorder', {
        method: 'PUT',
        body: JSON.stringify({ categories: categoryOrders }),
      });
      
      // Update local state with new order
      setCategories(prev => {
        const updated = [...prev];
        categoryOrders.forEach(({ id, order }) => {
          const index = updated.findIndex(cat => cat._id === id);
          if (index !== -1) {
            updated[index] = { ...updated[index], order };
          }
        });
        return updated.sort((a, b) => a.order - b.order);
      });
      
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to reorder categories';
      setError(errorMessage);
      console.error('Error reordering categories:', err);
      return false;
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
    createCategory,
    updateCategory,
    deleteCategory,
    getCategoryStats,
    reorderCategories,
    clearError
  };
};