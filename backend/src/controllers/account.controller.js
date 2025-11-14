import { validationResult } from 'express-validator';
import { Op } from 'sequelize';
import Account from '../models/Account.js';
import User from '../models/User.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { ValidationError, NotFoundError, AuthorizationError } from '../middleware/errorHandler.js';

// Helper function to check account access authorization
const checkAccountAuthorization = async (account, user) => {
  if (user.role === 'admin') {
    return true; // Admin can access all accounts
  }

  if (user.role === 'moderator') {
    // Moderator can access own accounts and referred users' accounts
    if (account.user_id === user.id) {
      return true;
    }
    const accountOwner = await User.findByPk(account.user_id);
    if (accountOwner && accountOwner.referred_by === user.id) {
      return true;
    }
    return false;
  }

  // Regular user can only access own accounts
  return account.user_id === user.id;
};

// @desc    Get all accounts based on user role
// @route   GET /api/v1/accounts
// @access  Private
export const getAccounts = asyncHandler(async (req, res) => {
  const { platform, sort = 'updated', page = 1, limit = 20 } = req.query;

  // Build filter based on user role
  let where = {};

  if (req.user.role === 'admin') {
    // Admin: 모든 계정 조회 (no filter)
    if (platform) {
      where.platform = platform;
    }
  } else if (req.user.role === 'moderator') {
    // Moderator: 본인이 리퍼한 유저들의 계정 조회
    // 1. 본인의 referral_code로 가입한 유저들 찾기
    const referredUsers = await User.findAll({
      where: { referred_by: req.user.id },
      attributes: ['id'],
    });

    const referredUserIds = referredUsers.map(u => u.id);
    // 2. 본인 + 리퍼한 유저들의 계정 조회
    where.user_id = { [Op.in]: [req.user.id, ...referredUserIds] };

    if (platform) {
      where.platform = platform;
    }
  } else {
    // User: 본인 계정만 조회
    where.user_id = req.user.id;
    if (platform) {
      where.platform = platform;
    }
  }

  // Build sort
  const orderMap = {
    revenue: [['monthly_revenue', 'DESC']],
    posts: [['post_count', 'DESC']],
    name: [['name', 'ASC']],
    updated: [['updated_at', 'DESC']],
  };
  const order = orderMap[sort] || orderMap.updated;

  // Pagination
  const offset = (page - 1) * limit;

  // Query with user information for admin/moderator
  const includeUser = req.user.role !== 'user';
  const queryOptions = {
    where,
    order,
    limit: parseInt(limit),
    offset,
  };

  if (includeUser) {
    queryOptions.include = [
      {
        model: User,
        as: 'user',
        attributes: ['id', 'username', 'email', 'role'],
      },
    ];
  }

  const { count, rows: accounts } = await Account.findAndCountAll(queryOptions);

  res.json({
    success: true,
    data: accounts,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total: count,
      pages: Math.ceil(count / limit),
    },
  });
});

// @desc    Get single account
// @route   GET /api/v1/accounts/:id
// @access  Private
export const getAccount = asyncHandler(async (req, res) => {
  const account = await Account.findByPk(req.params.id, {
    include: req.user.role !== 'user' ? [
      {
        model: User,
        as: 'user',
        attributes: ['id', 'username', 'email', 'role'],
      },
    ] : [],
  });

  if (!account) {
    throw new NotFoundError('Account not found');
  }

  // Check authorization
  const authorized = await checkAccountAuthorization(account, req.user);
  if (!authorized) {
    throw new AuthorizationError('Not authorized to access this account');
  }

  res.json({
    success: true,
    data: account,
  });
});

// @desc    Create new account
// @route   POST /api/v1/accounts
// @access  Private
export const createAccount = asyncHandler(async (req, res) => {
  // Validate request
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new ValidationError(errors.array()[0].msg);
  }

  const { name, platform, url, api_key } = req.body;

  // Check for duplicate URL
  const existingAccount = await Account.findOne({ where: { url } });
  if (existingAccount) {
    throw new ValidationError('An account with this URL already exists');
  }

  // Create account
  const account = await Account.create({
    user_id: req.user.id,
    name,
    platform,
    url,
    api_key,
  });

  res.status(201).json({
    success: true,
    message: 'Account created successfully',
    data: account,
  });
});

// @desc    Update account
// @route   PUT /api/v1/accounts/:id
// @access  Private
export const updateAccount = asyncHandler(async (req, res) => {
  const account = await Account.findByPk(req.params.id);

  if (!account) {
    throw new NotFoundError('Account not found');
  }

  // Check authorization
  const authorized = await checkAccountAuthorization(account, req.user);
  if (!authorized) {
    throw new AuthorizationError('Not authorized to update this account');
  }

  const { name, url, api_key, is_active } = req.body;

  // Update fields
  if (name !== undefined) account.name = name;
  if (url !== undefined) account.url = url;
  if (api_key !== undefined) account.api_key = api_key;
  if (is_active !== undefined) account.is_active = is_active;

  await account.save();

  res.json({
    success: true,
    message: 'Account updated successfully',
    data: account,
  });
});

// @desc    Delete account
// @route   DELETE /api/v1/accounts/:id
// @access  Private
export const deleteAccount = asyncHandler(async (req, res) => {
  const account = await Account.findByPk(req.params.id);

  if (!account) {
    throw new NotFoundError('Account not found');
  }

  // Check authorization
  const authorized = await checkAccountAuthorization(account, req.user);
  if (!authorized) {
    throw new AuthorizationError('Not authorized to delete this account');
  }

  await account.destroy();

  res.json({
    success: true,
    message: 'Account deleted successfully',
  });
});

// @desc    Sync account data
// @route   POST /api/v1/accounts/:id/sync
// @access  Private
export const syncAccount = asyncHandler(async (req, res) => {
  const account = await Account.findByPk(req.params.id);

  if (!account) {
    throw new NotFoundError('Account not found');
  }

  // Check authorization
  const authorized = await checkAccountAuthorization(account, req.user);
  if (!authorized) {
    throw new AuthorizationError('Not authorized to sync this account');
  }

  // TODO: Implement actual sync logic with platform APIs
  // For now, just update the last_synced timestamp
  account.last_synced = new Date();
  await account.save();

  res.json({
    success: true,
    message: 'Account synced successfully',
    data: account,
  });
});
