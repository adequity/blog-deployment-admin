import express from 'express';
import { authenticate } from '../middleware/auth.js';
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
router.get('/', authenticate, getPlatforms);
router.get('/:id', authenticate, getPlatformById);

// 관리자용 API (추후 관리자 권한 미들웨어 추가 필요)
router.get('/admin/all', authenticate, getAllPlatformsAdmin);
router.post('/admin', authenticate, createPlatform);
router.put('/admin/:id', authenticate, updatePlatform);
router.delete('/admin/:id', authenticate, deletePlatform);
router.patch('/admin/:id/status', authenticate, togglePlatformStatus);

export default router;
