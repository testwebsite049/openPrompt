import { Category, User, CronJob } from '../models/index.js';
import connectDB from '../config/database.js';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Seed the database with initial data
 */
async function seedDatabase() {
  try {
    console.log('🌱 Starting database seeding...');
    
    // Connect to database
    await connectDB();
    
    // Clear existing data (optional - remove in production)
    // await clearDatabase();
    
    // Seed categories
    await seedCategories();
    
    // Seed admin user
    await seedAdminUser();
    
    // Seed default cron jobs
    await seedCronJobs();
    
    console.log('✅ Database seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Database seeding failed:', error);
    process.exit(1);
  }
}

/**
 * Clear existing data (use with caution)
 */
async function clearDatabase() {
  console.log('🗑️ Clearing existing data...');
  
  await Promise.all([
    Category.deleteMany({}),
    User.deleteMany({}),
    CronJob.deleteMany({})
  ]);
  
  console.log('✅ Database cleared');
}

/**
 * Seed categories
 */
async function seedCategories() {
  console.log('📁 Seeding categories...');
  
  const categories = [
    {
      name: 'Writing & Content',
      description: 'Prompts for content creation, copywriting, and creative writing',
      color: '#3B82F6',
      icon: '✍️',
      order: 1
    },
    {
      name: 'Marketing & Sales',
      description: 'Marketing campaigns, sales copy, and promotional content',
      color: '#10B981',
      icon: '📈',
      order: 2
    },
    {
      name: 'Code & Development',
      description: 'Programming, debugging, and software development prompts',
      color: '#8B5CF6',
      icon: '💻',
      order: 3
    },
    {
      name: 'Business & Strategy',
      description: 'Business planning, strategy, and professional communications',
      color: '#F59E0B',
      icon: '💼',
      order: 4
    },
    {
      name: 'Education & Learning',
      description: 'Educational content, tutoring, and learning assistance',
      color: '#EF4444',
      icon: '📚',
      order: 5
    },
    {
      name: 'Creative & Art',
      description: 'Creative projects, art direction, and design inspiration',
      color: '#EC4899',
      icon: '🎨',
      order: 6
    },
    {
      name: 'Research & Analysis',
      description: 'Research assistance, data analysis, and information gathering',
      color: '#6366F1',
      icon: '🔍',
      order: 7
    },
    {
      name: 'Personal & Lifestyle',
      description: 'Personal development, lifestyle, and everyday tasks',
      color: '#14B8A6',
      icon: '🌟',
      order: 8
    }
  ];
  
  for (const categoryData of categories) {
    const existing = await Category.findOne({ name: categoryData.name });
    if (!existing) {
      await Category.create(categoryData);
      console.log(`   ✅ Created category: ${categoryData.name}`);
    } else {
      console.log(`   ⏭️ Category already exists: ${categoryData.name}`);
    }
  }
  
  console.log('✅ Categories seeded');
}

/**
 * Seed admin user
 */
async function seedAdminUser() {
  console.log('👤 Seeding admin user...');
  
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@openprompt.com';
  
  const existing = await User.findOne({ email: adminEmail });
  if (!existing) {
    await User.create({
      email: adminEmail,
      password: process.env.ADMIN_PASSWORD || 'admin123',
      role: 'admin',
      profile: {
        firstName: 'Admin',
        lastName: 'User'
      },
      isActive: true,
      isEmailVerified: true
    });
    console.log(`   ✅ Created admin user: ${adminEmail}`);
  } else {
    console.log(`   ⏭️ Admin user already exists: ${adminEmail}`);
  }
  
  console.log('✅ Admin user seeded');
}

/**
 * Seed default cron jobs
 */
async function seedCronJobs() {
  console.log('⏰ Seeding default cron jobs...');
  
  const cronJobs = [
    {
      name: 'Daily Analytics Generation',
      description: 'Generate daily analytics and statistics',
      schedule: '0 1 * * *', // Daily at 1 AM
      type: 'analytics',
      taskFunction: 'generateDailyAnalytics',
      config: {},
      isActive: true,
      notifyOnFailure: true,
      priority: 8
    },
    {
      name: 'Weekly File Cleanup',
      description: 'Clean up orphaned and old files',
      schedule: '0 2 * * 0', // Weekly on Sunday at 2 AM
      type: 'cleanup',
      taskFunction: 'cleanupOldFiles',
      config: {
        maxAgeDays: 30
      },
      isActive: true,
      notifyOnFailure: true,
      priority: 6
    },
    {
      name: 'Update Prompt Statistics',
      description: 'Update category prompt counts and other statistics',
      schedule: '0 */6 * * *', // Every 6 hours
      type: 'maintenance',
      taskFunction: 'updatePromptStats',
      config: {},
      isActive: true,
      notifyOnFailure: true,
      priority: 4
    },
    {
      name: 'Cleanup Expired Tokens',
      description: 'Remove expired password reset and email verification tokens',
      schedule: '0 3 * * *', // Daily at 3 AM
      type: 'cleanup',
      taskFunction: 'cleanupExpiredTokens',
      config: {},
      isActive: true,
      notifyOnFailure: true,
      priority: 5
    },
    {
      name: 'Database Backup',
      description: 'Create database backup (placeholder)',
      schedule: '0 4 * * 0', // Weekly on Sunday at 4 AM
      type: 'backup',
      taskFunction: 'backupDatabase',
      config: {},
      isActive: false, // Disabled by default
      notifyOnSuccess: true,
      notifyOnFailure: true,
      priority: 9
    }
  ];
  
  for (const jobData of cronJobs) {
    const existing = await CronJob.findOne({ name: jobData.name });
    if (!existing) {
      await CronJob.create(jobData);
      console.log(`   ✅ Created cron job: ${jobData.name}`);
    } else {
      console.log(`   ⏭️ Cron job already exists: ${jobData.name}`);
    }
  }
  
  console.log('✅ Cron jobs seeded');
}

// Run seeding if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seedDatabase();
}

export { seedDatabase, seedCategories, seedAdminUser, seedCronJobs };