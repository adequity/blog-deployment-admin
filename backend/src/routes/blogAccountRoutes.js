import express from 'express';
import { protect } from '../middleware/auth.js';
import {
  getMyBlogAccounts,
  createBlogAccount,
  updateBlogAccount,
  deleteBlogAccount,
} from '../controllers/blogAccountController.js';

const router = express.Router();

// 내 블로그 계정 관리
router.get('/', protect, getMyBlogAccounts);
router.post('/', protect, createBlogAccount);
router.put('/:id', protect, updateBlogAccount);
router.delete('/:id', protect, deleteBlogAccount);

export default router;
