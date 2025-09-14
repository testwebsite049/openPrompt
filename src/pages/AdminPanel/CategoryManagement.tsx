import React, { useState } from 'react';
import { Plus, Edit3, Trash2, Save, X, Tag, AlertCircle, Loader2 } from 'lucide-react';
import { useAdminCategories } from '../../hooks/useAdminCategories';

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

interface CategoryManagementProps {
  // Props for category CRUD operations
}

const CategoryManagement: React.FC<CategoryManagementProps> = () => {
  // Use the custom hook for category management
  const {
    categories,
    loading,
    error,
    createCategory,
    updateCategory,
    deleteCategory,
    clearError
  } = useAdminCategories();

  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [newCategory, setNewCategory] = useState({
    name: '',
    description: '',
    color: '#3B82F6'
  });

  const colorOptions = [
    '#3B82F6', '#10B981', '#8B5CF6', '#F59E0B', '#EF4444', 
    '#84CC16', '#06B6D4', '#EC4899', '#F97316', '#6366F1'
  ];

  const handleAddCategory = async () => {
    if (newCategory.name.trim()) {
      const success = await createCategory({
        name: newCategory.name.trim(),
        description: newCategory.description.trim() || undefined,
        color: newCategory.color,
        order: categories.length
      });
      
      if (success) {
        setNewCategory({ name: '', description: '', color: '#3B82F6' });
        setIsAddingCategory(false);
      }
    }
  };

  const handleEditCategory = (category: Category) => {
    setEditingCategory(category);
    setNewCategory({
      name: category.name,
      description: category.description || '',
      color: category.color || '#3B82F6'
    });
  };

  const handleUpdateCategory = async () => {
    if (editingCategory && newCategory.name.trim()) {
      const success = await updateCategory(editingCategory._id, {
        name: newCategory.name.trim(),
        description: newCategory.description.trim() || undefined,
        color: newCategory.color
      });
      
      if (success) {
        setEditingCategory(null);
        setNewCategory({ name: '', description: '', color: '#3B82F6' });
      }
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this category? This action cannot be undone.')) {
      await deleteCategory(id);
    }
  };

  const handleCancelEdit = () => {
    setEditingCategory(null);
    setIsAddingCategory(false);
    setNewCategory({ name: '', description: '', color: '#3B82F6' });
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-lg border border-gray-100">
        {/* Header */}
        <div className="border-b border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gray-100 rounded-lg">
                <Tag className="w-5 h-5 text-gray-700" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Category Management</h2>
                <p className="text-gray-600 mt-1">Manage prompt categories and their settings</p>
              </div>
            </div>
            <button
              onClick={() => setIsAddingCategory(true)}
              disabled={loading || isAddingCategory}
              className="flex items-center gap-2 bg-gray-900 text-white px-4 py-2 rounded-xl font-medium hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Plus className="w-4 h-4" />
              Add Category
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Error Alert */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-red-800 font-medium">Error</p>
                <p className="text-red-600 text-sm">{error}</p>
              </div>
              <button
                onClick={clearError}
                className="p-1 text-red-500 hover:text-red-700 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Loading State */}
          {loading && (
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-xl flex items-center gap-3">
              <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />
              <p className="text-blue-800 font-medium">Processing...</p>
            </div>
          )}
          {/* Add New Category Form */}
          {isAddingCategory && (
            <div className="mb-6 p-6 bg-gray-50 rounded-xl border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Add New Category</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-2">
                    Category Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={newCategory.name}
                    onChange={(e) => setNewCategory(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all"
                    placeholder="Enter category name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-2">Color</label>
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-12 h-12 rounded-xl border-2 border-gray-200"
                      style={{ backgroundColor: newCategory.color }}
                    ></div>
                    <select
                      value={newCategory.color}
                      onChange={(e) => setNewCategory(prev => ({ ...prev, color: e.target.value }))}
                      className="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all bg-white"
                    >
                      {colorOptions.map(color => (
                        <option key={color} value={color}>{color}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-semibold text-gray-800 mb-2">Description</label>
                <textarea
                  value={newCategory.description}
                  onChange={(e) => setNewCategory(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent resize-none transition-all"
                  placeholder="Enter category description (optional)"
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={handleAddCategory}
                  disabled={loading || !newCategory.name.trim()}
                  className="flex items-center gap-2 bg-gray-900 text-white px-4 py-2 rounded-xl font-medium hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  Save Category
                </button>
                <button
                  onClick={handleCancelEdit}
                  disabled={loading}
                  className="px-4 py-2 border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Edit Category Form */}
          {editingCategory && (
            <div className="mb-6 p-6 bg-blue-50 rounded-xl border border-blue-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Edit Category</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-2">
                    Category Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={newCategory.name}
                    onChange={(e) => setNewCategory(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all"
                    placeholder="Enter category name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-2">Color</label>
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-12 h-12 rounded-xl border-2 border-gray-200"
                      style={{ backgroundColor: newCategory.color }}
                    ></div>
                    <select
                      value={newCategory.color}
                      onChange={(e) => setNewCategory(prev => ({ ...prev, color: e.target.value }))}
                      className="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all bg-white"
                    >
                      {colorOptions.map(color => (
                        <option key={color} value={color}>{color}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-semibold text-gray-800 mb-2">Description</label>
                <textarea
                  value={newCategory.description}
                  onChange={(e) => setNewCategory(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent resize-none transition-all"
                  placeholder="Enter category description (optional)"
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={handleUpdateCategory}
                  disabled={loading || !newCategory.name.trim()}
                  className="flex items-center gap-2 bg-gray-900 text-white px-4 py-2 rounded-xl font-medium hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  Update Category
                </button>
                <button
                  onClick={handleCancelEdit}
                  disabled={loading}
                  className="px-4 py-2 border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Categories Grid */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {categories.map((category) => (
              <div
                key={category._id}
                className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-all duration-200"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: category.color }}
                    ></div>
                    <h3 className="font-semibold text-gray-900">{category.name}</h3>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleEditCategory(category)}
                      disabled={loading}
                      className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteCategory(category._id)}
                      disabled={loading}
                      className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                
                {category.description && (
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">{category.description}</p>
                )}
                
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Prompts</span>
                  <span className="font-medium text-gray-900">{category.promptCount}</span>
                </div>
              </div>
            ))}
          </div>

          {categories.length === 0 && (
            <div className="text-center py-16">
              <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <Tag className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-600 font-medium">No categories created yet</p>
              <p className="text-sm text-gray-500 mt-1">Create your first category to organize prompts</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CategoryManagement;