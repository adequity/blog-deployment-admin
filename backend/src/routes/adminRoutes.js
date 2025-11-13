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

const router = express.Router();

// All admin routes require authentication and admin role
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
