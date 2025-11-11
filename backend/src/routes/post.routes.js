import express from 'express';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.get('/', (req, res) => {
  res.json({ success: true, message: 'Get all posts - Coming soon' });
});

router.get('/:id', (req, res) => {
  res.json({ success: true, message: 'Get post detail - Coming soon' });
});

router.post('/', (req, res) => {
  res.json({ success: true, message: 'Create post - Coming soon' });
});

export default router;
