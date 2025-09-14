import React, { useState } from 'react';
import { useAdminPrompts } from '../../hooks/useAdminPrompts';
import { useAuth } from '../../context/AuthContext';
import LoginForm from './LoginForm';
import Sidebar from './Sidebar';
import Header from './Header';
import Dashboard from './Dashboard';
import UploadPrompt from './UploadPrompt';
import ManagePrompts from './ManagePrompts';
import CategoryManagement from './CategoryManagement';
import CronJobs from './CronJobs';

export type ActiveTab = 'dashboard' | 'upload' | 'manage' | 'categories' | 'cron';

const AdminPanel: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { isAuthenticated, logout } = useAuth();
  
  // Use admin prompts hook
  const adminPromptsHook = useAdminPrompts();

  if (!isAuthenticated) {
    return (
      <LoginForm 
        onLogin={() => {}} // The AuthContext handles the state
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar 
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        onLogout={logout}
      />

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-gray-600 bg-opacity-75 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <div className="flex-1 lg:pl-0">
        <Header 
          activeTab={activeTab}
          setSidebarOpen={setSidebarOpen}
        />

        {/* Page Content */}
        <div className="p-4 sm:p-6 lg:p-8">
          {activeTab === 'dashboard' && (
            <Dashboard 
              uploadedPrompts={adminPromptsHook.uploadedPrompts}
            />
          )}
          
          {activeTab === 'upload' && (
            <UploadPrompt 
              adminPromptsHook={adminPromptsHook}
            />
          )}

          {activeTab === 'manage' && (
            <ManagePrompts 
              uploadedPrompts={adminPromptsHook.uploadedPrompts}
              deletePrompt={adminPromptsHook.deletePrompt}
              updatePrompt={adminPromptsHook.updatePrompt}
              loading={adminPromptsHook.loading}
              error={adminPromptsHook.error}
            />
          )}

          {activeTab === 'categories' && (
            <CategoryManagement />
          )}

          {activeTab === 'cron' && (
            <CronJobs />
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;