import express from 'express';
import { getAllUsers, updateUserStatus, getUserStats } from '../controllers/adminController.js';
import { protect, admin } from '../middleware/auth.js';

const router = express.Router();

// All admin routes require authentication and admin role
router.use(protect);
router.use(admin);

// Get all users
router.get('/users', getAllUsers);

// Get user statistics
router.get('/stats', getUserStats);

// Update user status
router.patch('/users/:userId', updateUserStatus);

export default router;
