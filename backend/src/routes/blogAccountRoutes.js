import express from 'express';
import { authenticate } from '../middleware/auth.js';
import {
  getMyBlogAccounts,
  createBlogAccount,
  updateBlogAccount,
  deleteBlogAccount,
} from '../controllers/blogAccountController.js';

const router = express.Router();

// 내 블로그 계정 관리
router.get('/', authenticate, getMyBlogAccounts);
router.post('/', authenticate, createBlogAccount);
router.put('/:id', authenticate, updateBlogAccount);
router.delete('/:id', authenticate, deleteBlogAccount);

export default router;
