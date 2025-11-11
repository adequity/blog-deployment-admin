import express from 'express';
import { body, query } from 'express-validator';
import {
  getAccounts,
  getAccount,
  createAccount,
  updateAccount,
  deleteAccount,
  syncAccount,
} from '../controllers/account.controller.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// All routes are protected
router.use(protect);

// GET /api/v1/accounts - Get all accounts with filtering
router.get(
  '/',
  [
    query('platform').optional().isIn(['naver', 'tistory', 'velog', 'brunch']),
    query('sort').optional().isIn(['revenue', 'posts', 'name', 'updated']),
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 }),
  ],
  getAccounts
);

// GET /api/v1/accounts/:id - Get single account
router.get('/:id', getAccount);

// POST /api/v1/accounts - Create new account
router.post(
  '/',
  [
    body('name').trim().notEmpty().withMessage('Account name is required'),
    body('platform')
      .isIn(['naver', 'tistory', 'velog', 'brunch'])
      .withMessage('Invalid platform'),
    body('url').trim().isURL().withMessage('Valid URL is required'),
  ],
  createAccount
);

// PUT /api/v1/accounts/:id - Update account
router.put('/:id', updateAccount);

// DELETE /api/v1/accounts/:id - Delete account
router.delete('/:id', deleteAccount);

// POST /api/v1/accounts/:id/sync - Sync account data
router.post('/:id/sync', syncAccount);

export default router;
