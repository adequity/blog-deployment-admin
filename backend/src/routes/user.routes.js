import express from 'express';
import { protect, admin } from '../middleware/auth.js';
import {
  updateUserProfile,
  uploadIdVerification,
  getMyProfile,
  verifyUserIdentity,
  getAllUsers,
  updateUserSettlement,
} from '../controllers/userController.js';

const router = express.Router();

// 일반 사용자 API
router.get('/me', protect, getMyProfile); // 내 프로필 조회
router.put('/me', protect, updateUserProfile); // 프로필 업데이트
router.post('/me/id-verification', protect, uploadIdVerification); // 신분증 업로드
router.put('/me/settlement', protect, updateUserSettlement); // 정산 정보 업데이트

// 기존 API (호환성)
router.get('/profile', protect, getMyProfile);
router.get('/stats', protect, (req, res) => {
  res.json({ success: true, message: 'Get user stats - Coming soon' });
});

// 관리자 API
router.get('/admin/all', protect, admin, getAllUsers); // 전체 사용자 조회
router.post('/admin/:userId/verify', protect, admin, verifyUserIdentity); // 신분증 인증

export default router;
