import express from 'express';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.get('/summary', (req, res) => {
  res.json({ success: true, message: 'Revenue summary - Coming soon' });
});

router.get('/daily', (req, res) => {
  res.json({ success: true, message: 'Daily revenue - Coming soon' });
});

router.get('/monthly', (req, res) => {
  res.json({ success: true, message: 'Monthly revenue - Coming soon' });
});

export default router;
