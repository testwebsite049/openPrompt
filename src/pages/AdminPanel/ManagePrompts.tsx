import React, { useState } from 'react';
import { Trash2, Eye, Edit3, Search, Filter, MoreVertical, X, Save } from 'lucide-react';
import { Prompt } from '../../data/promptsData';

interface ManagePromptsProps {
  uploadedPrompts: Prompt[];
  deletePrompt: (id: number) => void;
  updatePrompt?: (id: number, updatedData: Partial<Prompt>) => void;
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
  onSave: (updatedData: Partial<Prompt>) => void;
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
          {prompt.image_url && (
            <div>
              <img
                src={prompt.image_url}
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
            <label className="block text-sm font-semibold text-gray-800 mb-2">Prompt Content</label>
            <p className="text-gray-700 leading-relaxed">{prompt.prompt}</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2">Category</label>
              <span className="inline-block px-3 py-1 bg-gray-100 text-gray-700 rounded-lg text-sm">
                {prompt.category}
              </span>
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2">Popularity</label>
              <div className="flex items-center gap-2">
                <div className="bg-gray-200 rounded-full h-2 w-20">
                  <div 
                    className="bg-gray-900 h-2 rounded-full" 
                    style={{ width: `${prompt.popularity}%` }}
                  ></div>
                </div>
                <span className="text-sm text-gray-600">{prompt.popularity}%</span>
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
  const [editData, setEditData] = useState({
    title: prompt?.title || '',
    prompt: prompt?.prompt || '',
    category: prompt?.category || 'Portrait',
    tags: prompt?.tags?.join(', ') || '',
    popularity: prompt?.popularity || 50
  });

  // Update editData when prompt changes
  React.useEffect(() => {
    if (prompt) {
      setEditData({
        title: prompt.title,
        prompt: prompt.prompt,
        category: prompt.category,
        tags: prompt.tags.join(', '),
        popularity: prompt.popularity
      });
    }
  }, [prompt]);

  if (!isOpen || !prompt) return null;

  const handleSave = () => {
    onSave({
      ...editData,
      tags: editData.tags.split(',').map(tag => tag.trim()).filter(tag => tag)
    });
    onClose();
  };

  const categories = ['Portrait', 'Landscape', 'Abstract', 'Animals', 'Architecture', 'Vintage', 'Sci-Fi'];

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
            <label className="block text-sm font-semibold text-gray-800 mb-2">Prompt Content</label>
            <textarea
              value={editData.prompt}
              onChange={(e) => setEditData(prev => ({ ...prev, prompt: e.target.value }))}
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
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2">Popularity</label>
              <input
                type="number"
                min="0"
                max="100"
                value={editData.popularity}
                onChange={(e) => setEditData(prev => ({ ...prev, popularity: parseInt(e.target.value) }))}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all"
              />
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

const ManagePrompts: React.FC<ManagePromptsProps> = ({ uploadedPrompts, deletePrompt, updatePrompt }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [viewPrompt, setViewPrompt] = useState<Prompt | null>(null);
  const [editPrompt, setEditPrompt] = useState<Prompt | null>(null);
  const [activeDropdown, setActiveDropdown] = useState<number | null>(null);

  const categories = ['All', 'Portrait', 'Landscape', 'Abstract', 'Animals', 'Architecture', 'Vintage', 'Sci-Fi'];

  // Filter prompts based on search and category
  const filteredPrompts = uploadedPrompts.filter(prompt => {
    const matchesSearch = prompt.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         prompt.prompt.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         prompt.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === 'All' || prompt.category === selectedCategory;
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

  const handleDelete = (promptId: number) => {
    deletePrompt(promptId);
    setActiveDropdown(null);
  };

  const handleUpdatePrompt = (updatedData: Partial<Prompt>) => {
    if (editPrompt && updatePrompt) {
      updatePrompt(editPrompt.id, updatedData);
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
              >
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
        
        {/* Content */}
        <div className="p-6">
          {filteredPrompts.length === 0 ? (
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
                  key={prompt.id} 
                  className="group bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-all duration-200 hover:border-gray-300"
                >
                  {/* Image */}
                  {prompt.image_url && (
                    <div className="relative overflow-hidden">
                      <img
                        src={prompt.image_url}
                        alt={prompt.title}
                        className="w-full h-40 object-cover group-hover:scale-105 transition-transform duration-200"
                      />
                      <div className="absolute top-2 right-2">
                        <div className="relative">
                          <button
                            onClick={() => setActiveDropdown(activeDropdown === prompt.id ? null : prompt.id)}
                            className="p-2 bg-white bg-opacity-90 hover:bg-opacity-100 rounded-lg shadow-sm transition-all"
                          >
                            <MoreVertical className="w-4 h-4 text-gray-600" />
                          </button>
                          
                          {activeDropdown === prompt.id && (
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
                                onClick={() => handleDelete(prompt.id)}
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
                      <p className="text-sm text-gray-600 line-clamp-2 mt-1">{prompt.prompt}</p>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="inline-block px-3 py-1 bg-gray-100 text-gray-700 rounded-lg text-xs font-medium">
                        {prompt.category}
                      </span>
                      <div className="flex items-center gap-2">
                        <div className="bg-gray-200 rounded-full h-1.5 w-12">
                          <div 
                            className="bg-gray-900 h-1.5 rounded-full" 
                            style={{ width: `${prompt.popularity}%` }}
                          ></div>
                        </div>
                        <span className="text-xs text-gray-500">{prompt.popularity}%</span>
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