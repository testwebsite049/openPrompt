import { Prompt, Category, User, CronJob } from '../models/index.js';
import { asyncHandler, AppError } from '../middleware/index.js';

// @desc    Get dashboard overview statistics
// @route   GET /api/dashboard/overview
// @access  Private (Admin/Moderator)
export const getDashboardOverview = asyncHandler(async (req, res) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  
  const weekAgo = new Date(today);
  weekAgo.setDate(weekAgo.getDate() - 7);
  
  const monthAgo = new Date(today);
  monthAgo.setDate(monthAgo.getDate() - 30);

  // Get current totals
  const [
    totalPrompts,
    publishedPrompts,
    draftPrompts,
    featuredPrompts,
    totalCategories,
    activeCategories,
    totalUsers,
    activeUsers,
    totalCronJobs,
    activeCronJobs
  ] = await Promise.all([
    Prompt.countDocuments(),
    Prompt.countDocuments({ status: 'published' }),
    Prompt.countDocuments({ status: 'draft' }),
    Prompt.countDocuments({ featured: true }),
    Category.countDocuments(),
    Category.countDocuments({ isActive: true }),
    User.countDocuments(),
    User.countDocuments({ isActive: true }),
    CronJob.countDocuments(),
    CronJob.countDocuments({ isActive: true })
  ]);

  // Get today's new content
  const [
    newPromptsToday,
    newCategoriestoday,
    newUsersToday
  ] = await Promise.all([
    Prompt.countDocuments({ createdAt: { $gte: today } }),
    Category.countDocuments({ createdAt: { $gte: today } }),
    User.countDocuments({ createdAt: { $gte: today } })
  ]);

  // Get engagement statistics
  const [totalViews, totalDownloads, totalLikes] = await Promise.all([
    Prompt.aggregate([
      { $group: { _id: null, total: { $sum: '$views' } } }
    ]),
    Prompt.aggregate([
      { $group: { _id: null, total: { $sum: '$downloads' } } }
    ]),
    Prompt.aggregate([
      { $group: { _id: null, total: { $sum: '$likes' } } }
    ])
  ]);

  // Get engagement for today
  const [viewsToday, downloadsToday, likesToday] = await Promise.all([
    Prompt.aggregate([
      { $match: { updatedAt: { $gte: today } } },
      { $group: { _id: null, total: { $sum: '$views' } } }
    ]),
    Prompt.aggregate([
      { $match: { updatedAt: { $gte: today } } },
      { $group: { _id: null, total: { $sum: '$downloads' } } }
    ]),
    Prompt.aggregate([
      { $match: { updatedAt: { $gte: today } } },
      { $group: { _id: null, total: { $sum: '$likes' } } }
    ])
  ]);

  // Calculate growth percentages (simplified)
  const yesterdayPrompts = await Prompt.countDocuments({ 
    createdAt: { $gte: yesterday, $lt: today } 
  });
  const promptGrowth = yesterdayPrompts > 0 ? 
    ((newPromptsToday - yesterdayPrompts) / yesterdayPrompts * 100).toFixed(1) : 0;

  const overview = {
    content: {
      prompts: {
        total: totalPrompts,
        published: publishedPrompts,
        draft: draftPrompts,
        featured: featuredPrompts,
        newToday: newPromptsToday,
        growth: `${promptGrowth}%`
      },
      categories: {
        total: totalCategories,
        active: activeCategories,
        newToday: newCategoriestoday
      }
    },
    users: {
      total: totalUsers,
      active: activeUsers,
      newToday: newUsersToday
    },
    engagement: {
      views: {
        total: totalViews[0]?.total || 0,
        today: viewsToday[0]?.total || 0
      },
      downloads: {
        total: totalDownloads[0]?.total || 0,
        today: downloadsToday[0]?.total || 0
      },
      likes: {
        total: totalLikes[0]?.total || 0,
        today: likesToday[0]?.total || 0
      }
    },
    system: {
      cronJobs: {
        total: totalCronJobs,
        active: activeCronJobs
      }
    }
  };

  res.status(200).json({
    success: true,
    data: overview
  });
});

// @desc    Get top performing content
// @route   GET /api/dashboard/top-content
// @access  Private (Admin/Moderator)
export const getTopContent = asyncHandler(async (req, res) => {
  const { limit = 10, metric = 'views' } = req.query;

  // Get top prompts by specified metric
  const topPrompts = await Prompt.find({ status: 'published' })
    .populate('category', 'name color')
    .sort({ [metric]: -1 })
    .limit(Number(limit))
    .select('title views downloads likes imageUrl createdAt')
    .lean();

  // Get top categories by prompt count
  const topCategories = await Category.aggregate([
    {
      $lookup: {
        from: 'prompts',
        localField: '_id',
        foreignField: 'category',
        as: 'prompts'
      }
    },
    {
      $match: { isActive: true }
    },
    {
      $addFields: {
        promptCount: { $size: '$prompts' },
        totalViews: { $sum: '$prompts.views' },
        totalDownloads: { $sum: '$prompts.downloads' },
        totalLikes: { $sum: '$prompts.likes' }
      }
    },
    {
      $sort: { promptCount: -1 }
    },
    {
      $limit: Number(limit)
    },
    {
      $project: {
        name: 1,
        color: 1,
        promptCount: 1,
        totalViews: 1,
        totalDownloads: 1,
        totalLikes: 1
      }
    }
  ]);

  res.status(200).json({
    success: true,
    data: {
      topPrompts,
      topCategories,
      metric
    }
  });
});