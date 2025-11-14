import express from 'express';
import User from '../models/User.js';

const router = express.Router();

// @desc    Create initial admin user (for setup only)
// @route   POST /api/v1/admin/setup
// @access  Public (should be disabled after initial setup)
router.post('/setup', async (req, res) => {
  try {
    // Check if admin already exists
    const existingAdmin = await User.findOne({
      where: { username: 'admin' }
    });

    if (existingAdmin) {
      return res.status(400).json({
        success: false,
        message: 'Admin user already exists'
      });
    }

    // Create admin user
    const password_hash = await User.hashPassword('admin123!@#');
    const admin = await User.create({
      username: 'admin',
      email: 'admin@example.com',
      phone: '010-0000-0000',
      password_hash,
      role: 'admin',
      is_active: true,
    });

    res.status(201).json({
      success: true,
      message: 'Admin user created successfully',
      user: {
        username: admin.username,
        email: admin.email,
        role: admin.role
      }
    });
  } catch (error) {
    console.error('Error creating admin:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create admin user',
      error: error.message
    });
  }
});

// @desc    Check if test data exists
// @route   GET /api/v1/admin/check-test-data
// @access  Public
router.get('/check-test-data', async (req, res) => {
  try {
    const adminCount = await User.count({ where: { role: 'admin' } });
    const totalUsers = await User.count();

    res.json({
      success: true,
      data: {
        adminUsers: adminCount,
        totalUsers: totalUsers,
        hasAdmin: adminCount > 0
      }
    });
  } catch (error) {
    console.error('Error checking test data:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check test data',
      error: error.message
    });
  }
});

export default router;
