import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { User } from '../models/index.js';

// Load environment variables
dotenv.config();

// Connect to MongoDB
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/openprompt');
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('❌ Error connecting to MongoDB:', error.message);
    console.log('\n💡 Make sure MongoDB is running:');
    console.log('   - Start MongoDB service');
    console.log('   - Or run: mongod');
    console.log('   - Check if MongoDB is installed');
    process.exit(1);
  }
};

// Create admin user
const createAdminUser = async () => {
  try {
    // Admin user details
    const adminData = {
      email: 'admin@openprompt.com',
      password: 'Admin123!',
      role: 'admin',
      isActive: true,
      isEmailVerified: true,
      profile: {
        firstName: 'Admin',
        lastName: 'User'
      }
    };

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: adminData.email });
    
    if (existingAdmin) {
      console.log('❌ Admin user already exists with email:', adminData.email);
      console.log('Admin details:');
      console.log('📧 Email:', existingAdmin.email);
      console.log('👤 Name:', existingAdmin.fullName);
      console.log('🔐 Role:', existingAdmin.role);
      console.log('✅ Active:', existingAdmin.isActive);
      return;
    }

    // Create new admin user
    const adminUser = await User.create(adminData);
    
    console.log('✅ Admin user created successfully!');
    console.log('\n🎉 Admin Access Details:');
    console.log('================================');
    console.log('📧 Email:', adminUser.email);
    console.log('🔑 Password:', adminData.password);
    console.log('👤 Name:', adminUser.fullName);
    console.log('🔐 Role:', adminUser.role);
    console.log('🆔 User ID:', adminUser._id);
    console.log('================================');
    console.log('\n🚀 You can now access the admin panel at:');
    console.log('   http://localhost:5173/admin-panel-secure-access');
    console.log('\n💡 Use the above credentials to login!');

  } catch (error) {
    console.error('❌ Error creating admin user:', error);
  }
};

// Main function
const main = async () => {
  console.log('🚀 Creating Admin User for OpenPrompt...\n');
  
  await connectDB();
  await createAdminUser();
  
  console.log('\n✅ Script completed. Disconnecting from database...');
  await mongoose.disconnect();
  process.exit(0);
};

// Run if called directly
if (process.argv[1] === new URL(import.meta.url).pathname) {
  main().catch(error => {
    console.error('❌ Script failed:', error);
    process.exit(1);
  });
}

export { createAdminUser };