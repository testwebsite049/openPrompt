import React from 'react';
import { Plus, Edit3, Trash2 } from 'lucide-react';

const CronJobs: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Cron Jobs Management */}
      <div className="bg-white rounded-lg shadow-md p-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Cron Jobs</h2>
          <button className="bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Add Cron Job
          </button>
        </div>
        
        {/* Cron Jobs List */}
        <div className="space-y-4">
          {/* Sample Cron Jobs */}
          <div className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 mb-2">Auto Backup Prompts</h3>
                <p className="text-sm text-gray-600 mb-2">Automatically backup all prompts to cloud storage</p>
                <div className="flex items-center gap-4 text-xs text-gray-500">
                  <span className="px-2 py-1 bg-green-100 text-green-800 rounded">Active</span>
                  <span>Schedule: Daily at 2:00 AM</span>
                  <span>Last run: 2 hours ago</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button className="text-gray-600 hover:text-gray-900 p-2">
                  <Edit3 className="w-4 h-4" />
                </button>
                <button className="text-red-600 hover:text-red-800 p-2">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
          
          <div className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 mb-2">Update Popular Prompts</h3>
                <p className="text-sm text-gray-600 mb-2">Calculate and update popularity scores based on user interactions</p>
                <div className="flex items-center gap-4 text-xs text-gray-500">
                  <span className="px-2 py-1 bg-green-100 text-green-800 rounded">Active</span>
                  <span>Schedule: Every 6 hours</span>
                  <span>Last run: 3 hours ago</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button className="text-gray-600 hover:text-gray-900 p-2">
                  <Edit3 className="w-4 h-4" />
                </button>
                <button className="text-red-600 hover:text-red-800 p-2">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
          
          <div className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 mb-2">Clean Temporary Files</h3>
                <p className="text-sm text-gray-600 mb-2">Remove temporary image files and unused uploads</p>
                <div className="flex items-center gap-4 text-xs text-gray-500">
                  <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded">Paused</span>
                  <span>Schedule: Weekly on Sunday at 3:00 AM</span>
                  <span>Last run: 3 days ago</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button className="text-gray-600 hover:text-gray-900 p-2">
                  <Edit3 className="w-4 h-4" />
                </button>
                <button className="text-red-600 hover:text-red-800 p-2">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Cron Logs */}
      <div className="bg-white rounded-lg shadow-md p-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Recent Cron Activity</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between py-3 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <div>
                <p className="font-medium text-gray-900">Auto Backup Prompts</p>
                <p className="text-sm text-gray-600">Backup completed successfully - 45 prompts backed up</p>
              </div>
            </div>
            <span className="text-sm text-gray-500">2 hours ago</span>
          </div>
          
          <div className="flex items-center justify-between py-3 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <div>
                <p className="font-medium text-gray-900">Update Popular Prompts</p>
                <p className="text-sm text-gray-600">Popularity scores updated for 45 prompts</p>
              </div>
            </div>
            <span className="text-sm text-gray-500">3 hours ago</span>
          </div>
          
          <div className="flex items-center justify-between py-3 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
              <div>
                <p className="font-medium text-gray-900">Clean Temporary Files</p>
                <p className="text-sm text-gray-600">Job skipped - scheduled for Sunday</p>
              </div>
            </div>
            <span className="text-sm text-gray-500">6 hours ago</span>
          </div>
          
          <div className="flex items-center justify-between py-3">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <div>
                <p className="font-medium text-gray-900">Auto Backup Prompts</p>
                <p className="text-sm text-gray-600">Backup completed successfully - 44 prompts backed up</p>
              </div>
            </div>
            <span className="text-sm text-gray-500">1 day ago</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CronJobs;