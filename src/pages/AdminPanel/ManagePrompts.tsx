import React, { useState } from 'react';
import { Trash2, Eye, Edit3, Search, Filter, MoreVertical, X, Save } from 'lucide-react';
import { useAdminCategories } from '../../hooks/useAdminCategories';

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

interface UpdatePromptData {
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

interface ManagePromptsProps {
  uploadedPrompts: Prompt[];
  deletePrompt: (id: string) => Promise<boolean>;
  updatePrompt?: (id: string, updatedData: Partial<UpdatePromptData>) => Promise<boolean>;
  loading?: boolean;
  error?: string | null;
}

interface ViewModalProps {
  prompt: Prompt | null;
  isOpen: boolean;
  onClose: () => void;
}

interface EditModalProps {
  prompt: Prompt | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedData: Partial<UpdatePromptData>) => void;
}

const ViewModal: React.FC<ViewModalProps> = ({ prompt, isOpen, onClose }) => {
  if (!isOpen || !prompt) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <h3 className="text-xl font-bold text-gray-900">View Prompt</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>
        
        <div className="p-6 space-y-6">
          {prompt.imageUrl && (
            <div>
              <img
                src={prompt.imageUrl}
                alt={prompt.title}
                className="w-full h-64 object-cover rounded-xl"
              />
            </div>
          )}
          
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-2">Title</label>
            <p className="text-gray-700">{prompt.title}</p>
          </div>
          
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-2">Description</label>
            <p className="text-gray-700 leading-relaxed">{prompt.description}</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2">Category</label>
              <span className="inline-block px-3 py-1 bg-gray-100 text-gray-700 rounded-lg text-sm">
                {prompt.category.name}
              </span>
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2">Views</label>
              <div className="flex items-center gap-2">
                <div className="bg-gray-200 rounded-full h-2 w-20">
                  <div 
                    className="bg-gray-900 h-2 rounded-full" 
                    style={{ width: `${Math.min((prompt.views / 100) * 100, 100)}%` }}
                  ></div>
                </div>
                <span className="text-sm text-gray-600">{prompt.views} views</span>
              </div>
            </div>
          </div>
          
          {prompt.tags && prompt.tags.length > 0 && (
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2">Tags</label>
              <div className="flex flex-wrap gap-2">
                {prompt.tags.map((tag, index) => (
                  <span 
                    key={index}
                    className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const EditModal: React.FC<EditModalProps> = ({ prompt, isOpen, onClose, onSave }) => {
  const { categories } = useAdminCategories();
  const [editData, setEditData] = useState({
    title: prompt?.title || '',
    description: prompt?.description || '',
    category: prompt?.category?._id || '',
    tags: prompt?.tags?.join(', ') || '',
    author: prompt?.author || '',
    aiModelCompatibility: prompt?.aiModelCompatibility?.[0] || 'GPT-4',
    difficultyLevel: prompt?.difficultyLevel || 'Beginner',
    estimatedTime: prompt?.estimatedTime || '',
    usageInstructions: prompt?.usageInstructions || '',
    outputFormat: prompt?.outputFormat || 'Text',
    licenseType: prompt?.licenseType || 'MIT',
    featured: prompt?.featured || false,
    status: prompt?.status || 'published'
  });

  // Update editData when prompt changes
  React.useEffect(() => {
    if (prompt) {
      setEditData({
        title: prompt.title,
        description: prompt.description,
        category: prompt.category._id,
        tags: prompt.tags.join(', '),
        author: prompt.author || '',
        aiModelCompatibility: prompt.aiModelCompatibility?.[0] || 'GPT-4',
        difficultyLevel: prompt.difficultyLevel || 'Beginner',
        estimatedTime: prompt.estimatedTime || '',
        usageInstructions: prompt.usageInstructions || '',
        outputFormat: prompt.outputFormat || 'Text',
        licenseType: prompt.licenseType || 'MIT',
        featured: prompt.featured,
        status: prompt.status
      });
    }
  }, [prompt]);

  if (!isOpen || !prompt) return null;

  const handleSave = () => {
    const tagsArray = editData.tags.split(',').map(tag => tag.trim()).filter(tag => tag);
    onSave({
      ...editData,
      tags: tagsArray.join(',')
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <h3 className="text-xl font-bold text-gray-900">Edit Prompt</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>
        
        <div className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-2">Title</label>
            <input
              type="text"
              value={editData.title}
              onChange={(e) => setEditData(prev => ({ ...prev, title: e.target.value }))}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all"
            />
          </div>
          
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-2">Description</label>
            <textarea
              value={editData.description}
              onChange={(e) => setEditData(prev => ({ ...prev, description: e.target.value }))}
              rows={5}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent resize-none transition-all"
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2">Category</label>
              <select
                value={editData.category}
                onChange={(e) => setEditData(prev => ({ ...prev, category: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all bg-white"
              >
                <option value="">Select a category</option>
                {categories.map(category => (
                  <option key={category._id} value={category._id}>{category.name}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2">Author</label>
              <input
                type="text"
                value={editData.author}
                onChange={(e) => setEditData(prev => ({ ...prev, author: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all"
                placeholder="Author name"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2">AI Model</label>
              <select
                value={editData.aiModelCompatibility}
                onChange={(e) => setEditData(prev => ({ ...prev, aiModelCompatibility: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all bg-white"
              >
                <option value="GPT-4">GPT-4</option>
                <option value="GPT-3.5">GPT-3.5</option>
                <option value="Claude">Claude</option>
                <option value="Gemini">Gemini</option>
                <option value="Other">Other</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2">Difficulty</label>
              <select
                value={editData.difficultyLevel}
                onChange={(e) => setEditData(prev => ({ ...prev, difficultyLevel: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all bg-white"
              >
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
                <option value="Expert">Expert</option>
              </select>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-2">Tags</label>
            <input
              type="text"
              value={editData.tags}
              onChange={(e) => setEditData(prev => ({ ...prev, tags: e.target.value }))}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all"
              placeholder="Separate tags with commas"
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2">Status</label>
              <select
                value={editData.status}
                onChange={(e) => setEditData(prev => ({ ...prev, status: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all bg-white"
              >
                <option value="published">Published</option>
                <option value="draft">Draft</option>
                <option value="archived">Archived</option>
              </select>
            </div>
            
            <div className="flex items-center gap-3 pt-6">
              <label className="flex items-center cursor-pointer group">
                <input
                  type="checkbox"
                  checked={editData.featured}
                  onChange={(e) => setEditData(prev => ({ ...prev, featured: e.target.checked }))}
                  className="w-4 h-4 text-gray-900 border-gray-300 rounded focus:ring-gray-900 focus:ring-2"
                />
                <span className="ml-2 text-gray-700 group-hover:text-gray-900 transition-colors">Featured Prompt</span>
              </label>
            </div>
          </div>
          
          <div className="flex gap-3 pt-4">
            <button
              onClick={handleSave}
              className="flex-1 bg-gray-900 text-white py-3 px-4 rounded-xl font-semibold hover:bg-gray-800 transition-colors flex items-center justify-center gap-2"
            >
              <Save className="w-4 h-4" />
              Save Changes
            </button>
            <button
              onClick={onClose}
              className="px-6 py-3 border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const ManagePrompts: React.FC<ManagePromptsProps> = ({ 
  uploadedPrompts, 
  deletePrompt, 
  updatePrompt, 
  loading = false, 
  error = null 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [viewPrompt, setViewPrompt] = useState<Prompt | null>(null);
  const [editPrompt, setEditPrompt] = useState<Prompt | null>(null);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  
  // Load categories for filtering
  const { categories, loading: categoriesLoading } = useAdminCategories();

  // Build dynamic categories list including 'All' option
  const filterCategories = ['All', ...categories.map(cat => cat.name)];

  // Filter prompts based on search and category
  const filteredPrompts = uploadedPrompts.filter(prompt => {
    const matchesSearch = prompt.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         prompt.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         prompt.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === 'All' || prompt.category.name === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleEdit = (prompt: Prompt) => {
    setEditPrompt(prompt);
    setActiveDropdown(null);
  };

  const handleView = (prompt: Prompt) => {
    setViewPrompt(prompt);
    setActiveDropdown(null);
  };

  const handleDelete = (promptId: string) => {
    deletePrompt(promptId);
    setActiveDropdown(null);
  };

  const handleUpdatePrompt = (updatedData: Partial<UpdatePromptData>) => {
    if (editPrompt && updatePrompt) {
      updatePrompt(editPrompt._id, updatedData);
    }
  };
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-lg border border-gray-100">
        {/* Header */}
        <div className="border-b border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Manage Prompts</h2>
              <p className="text-gray-600 mt-1">{filteredPrompts.length} of {uploadedPrompts.length} prompts</p>
            </div>
          </div>
          
          {/* Search and Filter */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search prompts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all"
              />
            </div>
            
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="pl-10 pr-8 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all bg-white appearance-none cursor-pointer"
                disabled={categoriesLoading}
              >
                {filterCategories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
              {categoriesLoading && (
                <div className="absolute right-10 top-1/2 transform -translate-y-1/2">
                  <div className="w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin"></div>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Content */}
        <div className="p-6">
          {/* Error State */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 text-red-500">
                  <svg fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <p className="text-red-800 font-semibold">Error loading prompts</p>
                  <p className="text-red-600 text-sm">{error}</p>
                </div>
              </div>
            </div>
          )}
          
          {/* Loading State */}
          {loading ? (
            <div className="text-center py-16">
              <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <div className="w-8 h-8 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin"></div>
              </div>
              <p className="text-gray-600 font-medium">Loading prompts...</p>
              <p className="text-sm text-gray-500 mt-1">Please wait while we fetch all prompts</p>
            </div>
          ) : filteredPrompts.length === 0 ? (
            <div className="text-center py-16">
              <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <Search className="w-8 h-8 text-gray-400" />
              </div>
              {uploadedPrompts.length === 0 ? (
                <div>
                  <p className="text-gray-600 font-medium">No prompts uploaded yet</p>
                  <p className="text-sm text-gray-500 mt-1">Upload your first prompt to see it here</p>
                </div>
              ) : (
                <div>
                  <p className="text-gray-600 font-medium">No prompts match your search</p>
                  <p className="text-sm text-gray-500 mt-1">Try adjusting your search terms or filters</p>
                </div>
              )}
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filteredPrompts.map((prompt) => (
                <div 
                  key={prompt._id} 
                  className="group bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-all duration-200 hover:border-gray-300"
                >
                  {/* Image */}
                  {prompt.imageUrl && (
                    <div className="relative overflow-hidden">
                      <img
                        src={prompt.imageUrl}
                        alt={prompt.title}
                        className="w-full h-40 object-cover group-hover:scale-105 transition-transform duration-200"
                      />
                      <div className="absolute top-2 right-2">
                        <div className="relative">
                          <button
                            onClick={() => setActiveDropdown(activeDropdown === prompt._id ? null : prompt._id)}
                            className="p-2 bg-white bg-opacity-90 hover:bg-opacity-100 rounded-lg shadow-sm transition-all"
                          >
                            <MoreVertical className="w-4 h-4 text-gray-600" />
                          </button>
                          
                          {activeDropdown === prompt._id && (
                            <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 min-w-[140px]">
                              <button
                                onClick={() => handleView(prompt)}
                                className="w-full flex items-center gap-2 px-4 py-2 text-left text-gray-700 hover:bg-gray-50 transition-colors"
                              >
                                <Eye className="w-4 h-4" />
                                View
                              </button>
                              <button
                                onClick={() => handleEdit(prompt)}
                                className="w-full flex items-center gap-2 px-4 py-2 text-left text-gray-700 hover:bg-gray-50 transition-colors"
                              >
                                <Edit3 className="w-4 h-4" />
                                Edit
                              </button>
                              <button
                                onClick={() => handleDelete(prompt._id)}
                                className="w-full flex items-center gap-2 px-4 py-2 text-left text-red-600 hover:bg-red-50 transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                                Delete
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Content */}
                  <div className="p-4 space-y-3">
                    <div>
                      <h3 className="font-semibold text-gray-900 line-clamp-1 group-hover:text-gray-700 transition-colors">
                        {prompt.title}
                      </h3>
                      <p className="text-sm text-gray-600 line-clamp-2 mt-1">{prompt.description}</p>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="inline-block px-3 py-1 bg-gray-100 text-gray-700 rounded-lg text-xs font-medium">
                        {prompt.category.name}
                      </span>
                      <div className="flex items-center gap-2">
                        <div className="bg-gray-200 rounded-full h-1.5 w-12">
                          <div 
                            className="bg-gray-900 h-1.5 rounded-full" 
                            style={{ width: `${Math.min((prompt.views / 100) * 100, 100)}%` }}
                          ></div>
                        </div>
                        <span className="text-xs text-gray-500">{prompt.views} views</span>
                      </div>
                    </div>
                    
                    {prompt.tags && prompt.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {prompt.tags.slice(0, 2).map((tag, index) => (
                          <span 
                            key={index}
                            className="px-2 py-1 bg-gray-50 text-gray-600 rounded text-xs"
                          >
                            {tag}
                          </span>
                        ))}
                        {prompt.tags.length > 2 && (
                          <span className="px-2 py-1 bg-gray-50 text-gray-500 rounded text-xs">
                            +{prompt.tags.length - 2}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      
      {/* Modals */}
      <ViewModal 
        prompt={viewPrompt} 
        isOpen={!!viewPrompt} 
        onClose={() => setViewPrompt(null)} 
      />
      <EditModal 
        prompt={editPrompt} 
        isOpen={!!editPrompt} 
        onClose={() => setEditPrompt(null)}
        onSave={handleUpdatePrompt}
      />
      
      {/* Click outside to close dropdown */}
      {activeDropdown && (
        <div 
          className="fixed inset-0 z-0" 
          onClick={() => setActiveDropdown(null)}
        />
      )}
    </div>
  );
};

export default ManagePrompts;