import express from 'express';
import { body, query } from 'express-validator';
import {
  getPlatforms,
  getPlatform,
  createPlatform,
  updatePlatform,
  deletePlatform,
} from '../controllers/platform.controller.js';
import { protect, admin } from '../middleware/auth.js';

const router = express.Router();

// All routes are protected and admin-only
router.use(protect, admin);

// GET /api/v1/admin/platforms - Get all platforms
router.get(
  '/',
  [query('includeInactive').optional().isBoolean()],
  getPlatforms
);

// GET /api/v1/admin/platforms/:id - Get single platform
router.get('/:id', getPlatform);

// POST /api/v1/admin/platforms - Create new platform
router.post(
  '/',
  [
    body('name').trim().notEmpty().withMessage('Platform name is required'),
    body('displayName').trim().notEmpty().withMessage('Display name is required'),
    body('description').optional().trim(),
    body('icon').optional().trim(),
    body('apiEndpoint').optional().trim().isURL().withMessage('Valid API endpoint URL is required'),
    body('loginUrl').optional().trim().isURL().withMessage('Valid login URL is required'),
    body('isActive').optional().isBoolean(),
  ],
  createPlatform
);

// PUT /api/v1/admin/platforms/:id - Update platform
router.put('/:id', updatePlatform);

// DELETE /api/v1/admin/platforms/:id - Delete platform
router.delete('/:id', deletePlatform);

export default router;
