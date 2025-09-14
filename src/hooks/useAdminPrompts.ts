import { useState, useCallback } from 'react';
import { Prompt } from '../data/promptsData';

interface NewPromptData {
  title: string;
  prompt: string;
  category: string;
  tags: string[];
  imageUrl: string;
  popularity: number;
  isPortrait: boolean;
}

export const useAdminPrompts = () => {
  const [uploadedPrompts, setUploadedPrompts] = useState<Prompt[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const uploadPrompt = useCallback(async (promptData: NewPromptData): Promise<boolean> => {
    setIsUploading(true);
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const newPrompt: Prompt = {
        id: Date.now(),
        title: promptData.title,
        prompt: promptData.prompt,
        category: promptData.category,
        image_url: promptData.imageUrl,
        tags: promptData.tags,
        popularity: promptData.popularity,
        isPortrait: promptData.isPortrait
      };

      setUploadedPrompts(prev => [newPrompt, ...prev]);
      
      // In a real app, this would be an API call
      console.log('Prompt uploaded:', newPrompt);
      
      setIsUploading(false);
      return true;
    } catch (error) {
      console.error('Upload failed:', error);
      setIsUploading(false);
      return false;
    }
  }, []);

  const deletePrompt = useCallback((id: number) => {
    setUploadedPrompts(prev => prev.filter(prompt => prompt.id !== id));
  }, []);

  const updatePrompt = useCallback((id: number, updates: Partial<Prompt>) => {
    setUploadedPrompts(prev => 
      prev.map(prompt => 
        prompt.id === id ? { ...prompt, ...updates } : prompt
      )
    );
  }, []);

  return {
    uploadedPrompts,
    isUploading,
    uploadPrompt,
    deletePrompt,
    updatePrompt
  };
};