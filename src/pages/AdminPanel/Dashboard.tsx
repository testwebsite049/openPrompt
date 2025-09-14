import React, { useState, useEffect } from 'react';
import { 
  Users, 
  FileText, 
  Eye, 
  Heart, 
  TrendingUp,
  RefreshCw,
  Star,
  Download,
  Calendar,
  Trophy
} from 'lucide-react';
import { useDashboard } from '../../hooks/useDashboard';

interface DashboardProps {
  uploadedPrompts?: any[];
}

const Dashboard: React.FC<DashboardProps> = () => {
  const [lastRefresh, setLastRefresh] = useState(new Date());

  const {
    dashboardStats,
    topContent,
    loading,
    error,
    fetchDashboardOverview,
    fetchTopContent
  } = useDashboard();

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      fetchDashboardOverview();
      fetchTopContent();
      setLastRefresh(new Date());
    }, 30000);

    return () => clearInterval(interval);
  }, [fetchDashboardOverview, fetchTopContent]);

  // Initial data load
  useEffect(() => {
    fetchDashboardOverview();
    fetchTopContent();
  }, [fetchDashboardOverview, fetchTopContent]);

  const handleRefresh = () => {
    fetchDashboardOverview();
    fetchTopContent();
    setLastRefresh(new Date());
  };

  // Stats cards data
  const statsCards = [
    {
      title: 'Total Prompts',
      value: dashboardStats?.content?.prompts?.total || 0,
      change: dashboardStats?.content?.prompts?.growth || '+0%',
      icon: FileText,
      color: 'blue'
    },
    {
      title: 'Total Views', 
      value: dashboardStats?.engagement?.views?.total || 0,
      change: '+5%',
      icon: Eye,
      color: 'green'
    },
    {
      title: 'Active Users',
      value: dashboardStats?.users?.active || 0,
      change: '+12%',
      icon: Users,
      color: 'purple'
    },
    {
      title: 'Total Likes',
      value: dashboardStats?.engagement?.likes?.total || 0,
      change: '+8%',
      icon: Heart,
      color: 'red'
    }
  ];

  const getColorClasses = (color: string) => {
    const colors = {
      blue: 'bg-blue-50 text-blue-600 border-blue-200',
      green: 'bg-green-50 text-green-600 border-green-200',
      purple: 'bg-purple-50 text-purple-600 border-purple-200',
      red: 'bg-red-50 text-red-600 border-red-200'
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-xl mb-4">⚠️ Error loading dashboard</div>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={handleRefresh}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">
            Last updated: {lastRefresh.toLocaleTimeString()}
          </p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          {loading ? 'Loading...' : 'Refresh'}
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statsCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">{stat.title}</p>
                  <p className="text-2xl font-semibold text-gray-900 mt-1">
                    {typeof stat.value === 'number' ? stat.value.toLocaleString() : stat.value}
                  </p>
                </div>
                <div className={`p-3 rounded-lg ${getColorClasses(stat.color)}`}>
                  <Icon className="w-6 h-6" />
                </div>
              </div>
              <div className="flex items-center gap-1 mt-4">
                <TrendingUp className="w-4 h-4 text-green-500" />
                <span className="text-sm text-green-600">{stat.change}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Top Prompts */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-yellow-600" />
            <h2 className="text-lg font-semibold text-gray-900">Top Performing Prompts</h2>
          </div>
          <p className="text-sm text-gray-500 mt-1">Most popular prompts based on engagement metrics</p>
        </div>

        {/* Content */}
        <div className="p-6">
          {topContent?.topPrompts?.length ? (
            <div className="space-y-4">
              {topContent.topPrompts.slice(0, 5).map((prompt, index) => {
                const isTopThree = index < 3;
                const getRankIcon = () => {
                  if (index === 0) return '🥇';
                  if (index === 1) return '🥈';
                  if (index === 2) return '🥉';
                  return index + 1;
                };
                
                const getCategoryColor = (categoryName: string) => {
                  const colors = {
                    'default': 'bg-gray-100 text-gray-700',
                    'AI': 'bg-blue-100 text-blue-700',
                    'Creative': 'bg-purple-100 text-purple-700',
                    'Business': 'bg-green-100 text-green-700',
                    'Education': 'bg-yellow-100 text-yellow-700',
                    'Marketing': 'bg-red-100 text-red-700',
                    'Writing': 'bg-indigo-100 text-indigo-700'
                  };
                  return colors[categoryName as keyof typeof colors] || colors.default;
                };

                return (
                  <div 
                    key={prompt._id} 
                    className={`group relative bg-white border rounded-xl p-4 transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 ${
                      isTopThree ? 'border-yellow-200 bg-gradient-to-r from-yellow-50/50 to-transparent' : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    {/* Rank Badge */}
                    <div className={`absolute -top-2 -left-2 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shadow-lg ${
                      isTopThree ? 'bg-gradient-to-br from-yellow-400 to-yellow-600 text-white' : 'bg-white border-2 border-gray-300 text-gray-600'
                    }`}>
                      {typeof getRankIcon() === 'string' ? getRankIcon() : `#${getRankIcon()}`}
                    </div>

                    <div className="flex items-start gap-4 ml-3">
                      {/* Image Placeholder */}
                      <div className="flex-shrink-0">
                        {prompt.imageUrl ? (
                          <img 
                            src={prompt.imageUrl} 
                            alt={prompt.title}
                            className="w-16 h-16 rounded-lg object-cover border border-gray-200"
                          />
                        ) : (
                          <div className="w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center">
                            <FileText className="w-6 h-6 text-gray-400" />
                          </div>
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <h3 className="text-base font-semibold text-gray-900 truncate group-hover:text-blue-600 transition-colors">
                              {prompt.title}
                            </h3>
                            
                            {/* Category Badge */}
                            <div className="flex items-center gap-2 mt-2">
                              {prompt.category?.name && (
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                  getCategoryColor(prompt.category.name)
                                }`}>
                                  {prompt.category.name}
                                </span>
                              )}
                              <div className="flex items-center gap-1 text-xs text-gray-500">
                                <Star className="w-3 h-3" />
                                Trending
                              </div>
                            </div>
                          </div>

                          {/* Engagement Metrics */}
                          <div className="flex items-center gap-6 text-sm">
                            <div className="flex items-center gap-1.5 text-blue-600">
                              <Eye className="w-4 h-4" />
                              <span className="font-medium">{(prompt.views || 0).toLocaleString()}</span>
                              <span className="text-xs text-gray-500">views</span>
                            </div>
                            
                            <div className="flex items-center gap-1.5 text-red-500">
                              <Heart className="w-4 h-4" />
                              <span className="font-medium">{(prompt.likes || 0).toLocaleString()}</span>
                              <span className="text-xs text-gray-500">likes</span>
                            </div>
                            
                            <div className="flex items-center gap-1.5 text-green-600">
                              <Download className="w-4 h-4" />
                              <span className="font-medium">{(prompt.downloads || 0).toLocaleString()}</span>
                              <span className="text-xs text-gray-500">downloads</span>
                            </div>
                          </div>
                        </div>

                        {/* Engagement Bar */}
                        <div className="mt-3">
                          <div className="flex items-center gap-2 text-xs text-gray-500 mb-1">
                            <span>Engagement Score</span>
                            <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-500"
                                style={{ 
                                  width: `${Math.min(100, ((prompt.views || 0) + (prompt.likes || 0) + (prompt.downloads || 0)) / 100)}%` 
                                }}
                              ></div>
                            </div>
                            <span className="font-medium text-gray-700">
                              {((prompt.views || 0) + (prompt.likes || 0) + (prompt.downloads || 0)).toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Top 3 Glow Effect */}
                    {isTopThree && (
                      <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-yellow-400/5 to-transparent pointer-events-none" />
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trophy className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Top Prompts Yet</h3>
              <p className="text-gray-500 max-w-sm mx-auto">
                Once prompts start getting engagement, they'll appear here ranked by popularity.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;