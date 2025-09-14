import React from 'react';
import { Menu } from 'lucide-react';
import { ActiveTab } from './index';

interface HeaderProps {
  activeTab: ActiveTab;
  setSidebarOpen: (open: boolean) => void;
}

const Header: React.FC<HeaderProps> = ({ activeTab, setSidebarOpen }) => {
  const getPageTitle = (tab: ActiveTab): string => {
    switch (tab) {
      case 'dashboard':
        return 'Dashboard';
      case 'upload':
        return 'Upload Prompt';
      case 'manage':
        return 'Manage Prompts';
      case 'categories':
        return 'Categories';
      case 'cron':
        return 'Cron Jobs';
      default:
        return 'Dashboard';
    }
  };

  return (
    <div className="bg-white border-b border-gray-200">
      <div className="px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden text-gray-500 hover:text-gray-700"
            >
              <Menu className="w-6 h-6" />
            </button>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {getPageTitle(activeTab)}
              </h2>
              <p className="text-gray-600">Manage your prompts and content</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Header;