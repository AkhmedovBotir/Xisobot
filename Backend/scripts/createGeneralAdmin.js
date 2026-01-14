require('dotenv').config();
const mongoose = require('mongoose');
const Admin = require('../models/Admin');
const connectDB = require('../config/database');

const createGeneralAdmin = async () => {
  try {
    // Connect to database
    await connectDB();

    // Get admin details from command line arguments or use defaults
    const username = process.argv[2] || 'general_admin';
    const email = process.argv[3] || 'general@admin.com';
    const password = process.argv[4] || 'admin123';

    // Check if admin already exists
    const existingAdmin = await Admin.findOne({
      $or: [{ email }, { username }],
    });

    if (existingAdmin) {
      console.log('❌ Admin with this email or username already exists!');
      process.exit(1);
    }

    // Create admin
    const admin = await Admin.create({
      username,
      email,
      password,
      adminType: 'General',
      isActive: true,
    });

    console.log('✅ General Admin created successfully!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`Username: ${admin.username}`);
    console.log(`Email: ${admin.email}`);
    console.log(`Admin Type: ${admin.adminType}`);
    console.log(`ID: ${admin._id}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('⚠️  Please save these credentials securely!');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating admin:', error.message);
    process.exit(1);
  }
};

// Run the script
createGeneralAdmin();
