import React from 'react';
import { FileText, LayoutDashboard, Upload, Clock } from 'lucide-react';
import { Prompt } from '../../data/promptsData';

interface DashboardProps {
  uploadedPrompts: Prompt[];
}

const Dashboard: React.FC<DashboardProps> = ({ uploadedPrompts }) => {
  const categories = ['Portrait', 'Landscape', 'Abstract', 'Animals', 'Architecture', 'Vintage', 'Sci-Fi'];

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Prompts</p>
              <p className="text-3xl font-bold text-gray-900">{uploadedPrompts.length}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <FileText className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Categories</p>
              <p className="text-3xl font-bold text-gray-900">{categories.length}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <LayoutDashboard className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Avg Popularity</p>
              <p className="text-3xl font-bold text-gray-900">
                {uploadedPrompts.length > 0 
                  ? Math.round(uploadedPrompts.reduce((sum, p) => sum + p.popularity, 0) / uploadedPrompts.length)
                  : 0
                }
              </p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Upload className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Recent Uploads</p>
              <p className="text-3xl font-bold text-gray-900">
                {uploadedPrompts.filter(p => Date.now() - p.id < 24 * 60 * 60 * 1000).length}
              </p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Clock className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>
      
      {/* Recent Activity */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
        </div>
        <div className="p-6">
          {uploadedPrompts.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No recent activity. Upload your first prompt to get started.</p>
          ) : (
            <div className="space-y-4">
              {uploadedPrompts.slice(0, 5).map((prompt) => (
                <div key={prompt.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                  {prompt.image_url && (
                    <img
                      src={prompt.image_url}
                      alt={prompt.title}
                      className="w-12 h-12 object-cover rounded-lg"
                    />
                  )}
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{prompt.title}</h4>
                    <p className="text-sm text-gray-600">{prompt.category} • Popularity: {prompt.popularity}</p>
                  </div>
                  <span className="text-xs text-gray-500">
                    {new Date(prompt.id).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;