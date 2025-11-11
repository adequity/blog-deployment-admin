import express from 'express';
import { protect } from '../middleware/auth.js';
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

// 관리자용 API (추후 관리자 권한 미들웨어 추가 필요)
router.get('/admin/all', protect, getAllPlatformsAdmin);
router.post('/admin', protect, createPlatform);
router.put('/admin/:id', protect, updatePlatform);
router.delete('/admin/:id', protect, deletePlatform);
router.patch('/admin/:id/status', protect, togglePlatformStatus);

export default router;
