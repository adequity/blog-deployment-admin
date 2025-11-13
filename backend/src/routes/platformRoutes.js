import express from 'express';
import { protect, admin } from '../middleware/auth.js';
import {
  getPlatforms,
  getPlatformById,
  getAllPlatformsAdmin,
  createPlatform,
  updatePlatform,
  deletePlatform,
  togglePlatformStatus,
} from '../controllers/platformController.js';

const router = express.Router();

// 사용자용 API (인증 필요)
router.get('/', protect, getPlatforms);
router.get('/:id', protect, getPlatformById);

// 관리자용 API (관리자 권한 필요)
router.get('/admin/all', protect, admin, getAllPlatformsAdmin);
router.post('/admin', protect, admin, createPlatform);
router.put('/admin/:id', protect, admin, updatePlatform);
router.delete('/admin/:id', protect, admin, deletePlatform);
router.patch('/admin/:id/status', protect, admin, togglePlatformStatus);

export default router;
