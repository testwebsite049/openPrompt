import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';

interface Prompt {
  _id: string;
  title: string;
  description: string;
  category: {
    _id: string;
    name: string;
    color?: string;
  };
  tags: string[];
  imageUrl?: string;
  cloudinaryPublicId?: string;
  author?: string;
  aiModelCompatibility?: string[];
  difficultyLevel?: string;
  estimatedTime?: string;
  usageInstructions?: string;
  outputFormat?: string;
  licenseType?: string;
  featured: boolean;
  status: string;
  views: number;
  downloads: number;
  likes: number;
  createdAt: string;
  updatedAt: string;
}

interface NewPromptData {
  title: string;
  description: string;
  category: string;
  tags: string;
  author?: string;
  aiModelCompatibility?: string;
  difficultyLevel?: string;
  estimatedTime?: string;
  usageInstructions?: string;
  outputFormat?: string;
  licenseType?: string;
  featured?: boolean;
  status?: string;
  imageFile?: File;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

const API_BASE_URL = 'http://localhost:5000/api';

export const useAdminPrompts = () => {
  const [uploadedPrompts, setUploadedPrompts] = useState<Prompt[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { token } = useAuth();

  // API request helper
  const apiRequest = async <T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> => {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
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

  // Fetch all prompts
  const fetchPrompts = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Use admin endpoint for better performance and all statuses
      const response = await apiRequest<{ prompts: Prompt[] }>('/prompts/admin/all?limit=1000');
      setUploadedPrompts(response.data.prompts);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch prompts';
      setError(errorMessage);
      console.error('Error fetching prompts:', err);
    } finally {
      setLoading(false);
    }
  }, [token]);

  // Upload new prompt
  const uploadPrompt = useCallback(async (promptData: NewPromptData): Promise<boolean> => {
    setIsUploading(true);
    setError(null);
    
    try {
      const formData = new FormData();
      
      // Add text fields
      formData.append('title', promptData.title);
      formData.append('description', promptData.description);
      formData.append('category', promptData.category);
      formData.append('tags', promptData.tags);
      
      if (promptData.author) formData.append('author', promptData.author);
      if (promptData.aiModelCompatibility) formData.append('aiModelCompatibility', promptData.aiModelCompatibility);
      if (promptData.difficultyLevel) formData.append('difficultyLevel', promptData.difficultyLevel);
      if (promptData.estimatedTime) formData.append('estimatedTime', promptData.estimatedTime);
      if (promptData.usageInstructions) formData.append('usageInstructions', promptData.usageInstructions);
      if (promptData.outputFormat) formData.append('outputFormat', promptData.outputFormat);
      if (promptData.licenseType) formData.append('licenseType', promptData.licenseType);
      if (promptData.featured !== undefined) formData.append('featured', String(promptData.featured));
      if (promptData.status) formData.append('status', promptData.status);
      
      // Add image file if provided
      if (promptData.imageFile) {
        formData.append('image', promptData.imageFile);
      }
      
      const response = await apiRequest<Prompt>('/prompts', {
        method: 'POST',
        body: formData,
      });
      
      // Add the new prompt to the list
      setUploadedPrompts(prev => [response.data, ...prev]);
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to upload prompt';
      setError(errorMessage);
      console.error('Error uploading prompt:', err);
      return false;
    } finally {
      setIsUploading(false);
    }
  }, [token]);

  // Update existing prompt
  const updatePrompt = useCallback(async (
    id: string,
    updates: Partial<NewPromptData>
  ): Promise<boolean> => {
    setLoading(true);
    setError(null);
    
    try {
      const formData = new FormData();
      
      // Add updated fields
      Object.entries(updates).forEach(([key, value]) => {
        if (value !== undefined && key !== 'imageFile') {
          if (typeof value === 'boolean') {
            formData.append(key, String(value));
          } else {
            formData.append(key, value as string);
          }
        }
      });
      
      // Add image file if provided
      if (updates.imageFile) {
        formData.append('image', updates.imageFile);
      }
      
      const response = await apiRequest<Prompt>(`/prompts/${id}`, {
        method: 'PUT',
        body: formData,
      });
      
      // Update the prompt in the list
      setUploadedPrompts(prev => 
        prev.map(prompt => prompt._id === id ? response.data : prompt)
      );
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update prompt';
      setError(errorMessage);
      console.error('Error updating prompt:', err);
      return false;
    } finally {
      setLoading(false);
    }
  }, [token]);

  // Delete prompt
  const deletePrompt = useCallback(async (id: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    
    try {
      await apiRequest(`/prompts/${id}`, {
        method: 'DELETE',
      });
      
      // Remove the prompt from the list
      setUploadedPrompts(prev => prev.filter(prompt => prompt._id !== id));
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete prompt';
      setError(errorMessage);
      console.error('Error deleting prompt:', err);
      return false;
    } finally {
      setLoading(false);
    }
  }, [token]);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Load prompts on mount
  useEffect(() => {
    if (token) {
      fetchPrompts();
    }
  }, [fetchPrompts, token]);

  return {
    uploadedPrompts,
    isUploading,
    loading,
    error,
    uploadPrompt,
    updatePrompt,
    deletePrompt,
    fetchPrompts,
    clearError
  };
};