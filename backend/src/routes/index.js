import express from 'express';
import authRoutes from './auth.routes.js';
import accountRoutes from './account.routes.js';
import revenueRoutes from './revenue.routes.js';
import postRoutes from './post.routes.js';
import userRoutes from './user.routes.js';
import platformRoutes from './platformRoutes.js';
import blogAccountRoutes from './blogAccountRoutes.js';
import adminRoutes from './admin.routes.js';

const router = express.Router();

// API Information
router.get('/', (req, res) => {
  res.json({
    name: 'Blog Deployment System API',
    version: '1.0.0',
    description: '블로그 배포 통합 관리 시스템 API',
    endpoints: {
      auth: `${req.baseUrl}/auth`,
      accounts: `${req.baseUrl}/accounts`,
      revenue: `${req.baseUrl}/revenue`,
      posts: `${req.baseUrl}/posts`,
      users: `${req.baseUrl}/users`,
      platforms: `${req.baseUrl}/platforms`,
      blogAccounts: `${req.baseUrl}/blog-accounts`,
      admin: `${req.baseUrl}/admin`,
    },
    documentation: `${req.baseUrl}/docs`,
    health: '/health',
  });
});

// Mount routes
router.use('/auth', authRoutes);
router.use('/accounts', accountRoutes);
router.use('/revenue', revenueRoutes);
router.use('/posts', postRoutes);
router.use('/users', userRoutes);
router.use('/platforms', platformRoutes);
router.use('/blog-accounts', blogAccountRoutes);
router.use('/admin', adminRoutes);

export default router;
