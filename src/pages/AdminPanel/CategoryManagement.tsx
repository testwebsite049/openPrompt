import React, { useState } from 'react';
import { Plus, Edit3, Trash2, Save, X, Tag } from 'lucide-react';

interface Category {
  id: number;
  name: string;
  description?: string;
  color?: string;
  promptCount: number;
}

interface CategoryManagementProps {
  // Future props for category CRUD operations
}

const CategoryManagement: React.FC<CategoryManagementProps> = () => {
  // Initial categories with some mock data
  const [categories, setCategories] = useState<Category[]>([
    { id: 1, name: 'Portrait', description: 'Human and character portraits', color: '#3B82F6', promptCount: 15 },
    { id: 2, name: 'Landscape', description: 'Natural and urban landscapes', color: '#10B981', promptCount: 12 },
    { id: 3, name: 'Abstract', description: 'Abstract and artistic creations', color: '#8B5CF6', promptCount: 8 },
    { id: 4, name: 'Animals', description: 'Wildlife and pet photography', color: '#F59E0B', promptCount: 10 },
    { id: 5, name: 'Architecture', description: 'Buildings and structures', color: '#EF4444', promptCount: 6 },
    { id: 6, name: 'Vintage', description: 'Retro and vintage styles', color: '#84CC16', promptCount: 4 },
    { id: 7, name: 'Sci-Fi', description: 'Science fiction and futuristic', color: '#06B6D4', promptCount: 7 }
  ]);

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

  const handleAddCategory = () => {
    if (newCategory.name.trim()) {
      const category: Category = {
        id: Date.now(),
        name: newCategory.name.trim(),
        description: newCategory.description.trim(),
        color: newCategory.color,
        promptCount: 0
      };
      setCategories(prev => [...prev, category]);
      setNewCategory({ name: '', description: '', color: '#3B82F6' });
      setIsAddingCategory(false);
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

  const handleUpdateCategory = () => {
    if (editingCategory && newCategory.name.trim()) {
      setCategories(prev => prev.map(cat => 
        cat.id === editingCategory.id 
          ? { ...cat, name: newCategory.name.trim(), description: newCategory.description.trim(), color: newCategory.color }
          : cat
      ));
      setEditingCategory(null);
      setNewCategory({ name: '', description: '', color: '#3B82F6' });
    }
  };

  const handleDeleteCategory = (id: number) => {
    if (window.confirm('Are you sure you want to delete this category? This action cannot be undone.')) {
      setCategories(prev => prev.filter(cat => cat.id !== id));
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
              className="flex items-center gap-2 bg-gray-900 text-white px-4 py-2 rounded-xl font-medium hover:bg-gray-800 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Category
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
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
                  className="flex items-center gap-2 bg-gray-900 text-white px-4 py-2 rounded-xl font-medium hover:bg-gray-800 transition-colors"
                >
                  <Save className="w-4 h-4" />
                  Save Category
                </button>
                <button
                  onClick={handleCancelEdit}
                  className="px-4 py-2 border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors"
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
                  className="flex items-center gap-2 bg-gray-900 text-white px-4 py-2 rounded-xl font-medium hover:bg-gray-800 transition-colors"
                >
                  <Save className="w-4 h-4" />
                  Update Category
                </button>
                <button
                  onClick={handleCancelEdit}
                  className="px-4 py-2 border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors"
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
                key={category.id}
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
                      className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteCategory(category.id)}
                      className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
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