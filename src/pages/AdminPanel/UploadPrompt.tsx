import React, { useState } from 'react';
import { Upload, Plus, Save, AlertCircle, X } from 'lucide-react';
import { useAdminCategories } from '../../hooks/useAdminCategories';

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
  imageFile?: File | null;
}

interface AdminPromptsHook {
  uploadedPrompts: any[];
  isUploading: boolean;
  uploadPrompt: (promptData: NewPromptData) => Promise<boolean>;
  deletePrompt: (id: string) => Promise<boolean>;
  error: string | null;
  clearError: () => void;
}

interface UploadPromptProps {
  adminPromptsHook: AdminPromptsHook;
}

const UploadPrompt: React.FC<UploadPromptProps> = ({ adminPromptsHook }) => {
  const { isUploading, uploadPrompt, error, clearError } = adminPromptsHook;
  const { categories, loading: categoriesLoading } = useAdminCategories();
  const [uploadSuccess, setUploadSuccess] = useState(false);
  
  // Form state for new prompt
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    tags: '',
    featured: false,
    status: 'published',
    imageFile: null as File | null,
    imagePreview: ''
  });



  // Set default category when categories load
  React.useEffect(() => {
    if (categories.length > 0 && !formData.category) {
      setFormData(prev => ({ ...prev, category: categories[0]._id }));
    }
  }, [categories, formData.category]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData(prev => ({ ...prev, imageFile: file }));
      
      // Create preview URL
      const reader = new FileReader();
      reader.onload = (e) => {
        setFormData(prev => ({ ...prev, imagePreview: e.target?.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (error) clearError();
    
    const success = await uploadPrompt({
      title: formData.title,
      description: formData.description,
      category: formData.category,
      tags: formData.tags,
      featured: formData.featured,
      status: formData.status,
      imageFile: formData.imageFile || undefined
    });
    
    if (success) {
      setUploadSuccess(true);
      
      // Reset form
      setFormData({
        title: '',
        description: '',
        category: categories.length > 0 ? categories[0]._id : '',
        tags: '',
        featured: false,
        status: 'published',
        imageFile: null,
        imagePreview: ''
      });

      setTimeout(() => setUploadSuccess(false), 3000);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4">
      <div className="bg-white rounded-xl shadow-lg border border-gray-100">
        {/* Header Section */}
        <div className="border-b border-gray-100 p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-gray-100 rounded-lg">
              <Plus className="w-5 h-5 text-gray-700" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Upload New Prompt</h2>
          </div>
          <p className="text-gray-600 ml-11">Create and share your AI prompt with the community</p>
        </div>
        
        {/* Error Alert */}
        {error && (
          <div className="mx-6 mt-6 p-4 bg-red-50 border border-red-200 rounded-xl">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-red-800 font-semibold">Error</p>
                <p className="text-red-600 text-sm">{error}</p>
              </div>
              <button
                onClick={clearError}
                className="p-1 text-red-500 hover:text-red-700 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
        
        {uploadSuccess && (
          <div className="mx-6 mt-6 p-4 bg-green-50 border border-green-200 rounded-xl">
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0">
                <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
              <div>
                <p className="text-green-800 font-semibold">Success!</p>
                <p className="text-green-700 text-sm">Your prompt has been uploaded successfully</p>
              </div>
            </div>
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="p-6 space-y-8">
          {/* Basic Information Section */}
          <div className="space-y-6">
            <div className="border-b border-gray-100 pb-4">
              <h3 className="text-lg font-semibold text-gray-900">Basic Information</h3>
              <p className="text-sm text-gray-600 mt-1">Enter the core details of your prompt</p>
            </div>
            
            {/* Title */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-800">
                Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all duration-200 hover:border-gray-300"
                placeholder="Enter a compelling prompt title"
                required
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-800">
                Description <span className="text-red-500">*</span>
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                rows={5}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent resize-none transition-all duration-200 hover:border-gray-300"
                placeholder="Enter the detailed AI prompt content..."
                required
              />
              <p className="text-xs text-gray-500">Describe what the AI should create or do</p>
            </div>

            {/* Category */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-800">
                Category <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all duration-200 hover:border-gray-300 bg-white"
                required
                disabled={categoriesLoading}
              >
                <option value="">Select a category</option>
                {categories.map(category => (
                  <option key={category._id} value={category._id}>{category.name}</option>
                ))}
              </select>
              {categoriesLoading && (
                <p className="text-xs text-gray-500">Loading categories...</p>
              )}
            </div>

            {/* Tags */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-800">
                Tags
              </label>
              <input
                type="text"
                value={formData.tags}
                onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all duration-200 hover:border-gray-300"
                placeholder="e.g. portrait, fantasy, ethereal, mystical, professional"
              />
              <p className="text-xs text-gray-500">Separate tags with commas to help others find your prompt</p>
            </div>
          </div>

          {/* Status and Features */}
          <div className="space-y-6">
            <div className="border-b border-gray-100 pb-4">
              <h3 className="text-lg font-semibold text-gray-900">Settings</h3>
              <p className="text-sm text-gray-600 mt-1">Configure prompt status and features</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <label className="block text-sm font-semibold text-gray-800">
                  Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all duration-200 hover:border-gray-300 bg-white"
                >
                  <option value="published">Published</option>
                  <option value="draft">Draft</option>
                  <option value="archived">Archived</option>
                </select>
              </div>
              
              <div className="space-y-3">
                <label className="block text-sm font-semibold text-gray-800">
                  Features
                </label>
                <div className="flex items-center gap-3">
                  <label className="flex items-center cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={formData.featured}
                      onChange={(e) => setFormData(prev => ({ ...prev, featured: e.target.checked }))}
                      className="w-4 h-4 text-gray-900 border-gray-300 rounded focus:ring-gray-900 focus:ring-2"
                    />
                    <span className="ml-2 text-gray-700 group-hover:text-gray-900 transition-colors">Featured Prompt</span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Image Upload */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-800">
              Preview Image
            </label>
            <div className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center hover:border-gray-300 transition-all duration-200 bg-gray-50 hover:bg-gray-100">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
                id="image-upload"
              />
              <label htmlFor="image-upload" className="cursor-pointer">
                {formData.imagePreview ? (
                  <div className="space-y-4">
                    <img
                      src={formData.imagePreview}
                      alt="Preview"
                      className="max-w-full h-56 object-cover rounded-xl mx-auto shadow-md"
                    />
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-gray-700">Click to change image</p>
                      <p className="text-xs text-gray-500">Upload a different preview image</p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="mx-auto w-16 h-16 bg-gray-200 rounded-xl flex items-center justify-center">
                      <Upload className="w-8 h-8 text-gray-400" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-gray-700 font-medium">Click to upload image</p>
                      <p className="text-sm text-gray-500">PNG, JPG, GIF up to 10MB</p>
                      <p className="text-xs text-gray-400">Recommended: 800x600 or higher</p>
                    </div>
                  </div>
                )}
              </label>
            </div>
          </div>



          {/* Submit Button */}
          <div className="pt-8 border-t border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className="text-sm text-gray-500">
                <span className="text-red-500">*</span> Required fields
              </div>
            </div>
            <button
              type="submit"
              disabled={isUploading}
              className="w-full bg-gray-900 text-white py-4 rounded-xl font-semibold hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-3 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              {isUploading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Uploading...</span>
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  <span>Upload Prompt</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UploadPrompt;