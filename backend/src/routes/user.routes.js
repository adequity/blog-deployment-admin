import express from 'express';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.get('/profile', (req, res) => {
  res.json({ success: true, message: 'Get user profile - Coming soon' });
});

router.get('/stats', (req, res) => {
  res.json({ success: true, message: 'Get user stats - Coming soon' });
});

export default router;
