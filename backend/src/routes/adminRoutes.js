import express from 'express';
import {
  getAllUsers,
  updateUserStatus,
  getUserStats,
  createUser,
  updateUser,
  deleteUser
} from '../controllers/adminController.js';
import { protect, admin } from '../middleware/auth.js';
import User from '../models/User.js';

const router = express.Router();

// Public setup endpoint (no authentication required)
router.post('/setup', async (req, res) => {
  try {
    const existingAdmin = await User.findOne({ where: { username: 'admin' } });
    const password_hash = await User.hashPassword('admin123!@#');

    if (existingAdmin) {
      // Update existing admin password instead of returning error
      existingAdmin.password_hash = password_hash;
      await existingAdmin.save();
      return res.json({
        success: true,
        message: 'Admin password updated successfully',
        user: { username: existingAdmin.username, email: existingAdmin.email, role: existingAdmin.role }
      });
    }

    // Create new admin if doesn't exist
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
      user: { username: admin.username, email: admin.email, role: admin.role }
    });
  } catch (error) {
    console.error('Error creating/updating admin:', error);
    res.status(500).json({ success: false, message: 'Failed to create/update admin user', error: error.message });
  }
});

router.get('/check-test-data', async (req, res) => {
  try {
    const adminCount = await User.count({ where: { role: 'admin' } });
    const totalUsers = await User.count();
    res.json({ success: true, data: { adminUsers: adminCount, totalUsers: totalUsers, hasAdmin: adminCount > 0 } });
  } catch (error) {
    console.error('Error checking test data:', error);
    res.status(500).json({ success: false, message: 'Failed to check test data', error: error.message });
  }
});

// All admin routes below require authentication and admin role
router.use(protect);
router.use(admin);

// Get all users
router.get('/users', getAllUsers);

// Get user statistics
router.get('/stats', getUserStats);

// Create new user
router.post('/users', createUser);

// Update user information
router.put('/users/:userId', updateUser);

// Update user status
router.patch('/users/:userId', updateUserStatus);

// Delete user
router.delete('/users/:userId', deleteUser);

export default router;
