import { validationResult } from 'express-validator';
import { Op } from 'sequelize';
import Account from '../models/Account.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { ValidationError, NotFoundError, AuthorizationError } from '../middleware/errorHandler.js';

// @desc    Get all accounts for current user
// @route   GET /api/v1/accounts
// @access  Private
export const getAccounts = asyncHandler(async (req, res) => {
  const { platform, sort = 'updated', page = 1, limit = 20 } = req.query;

  // Build filter
  const where = { user_id: req.user.id };
  if (platform) {
    where.platform = platform;
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

  // Query
  const { count, rows: accounts } = await Account.findAndCountAll({
    where,
    order,
    limit: parseInt(limit),
    offset,
  });

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
  const account = await Account.findByPk(req.params.id);

  if (!account) {
    throw new NotFoundError('Account not found');
  }

  // Check ownership
  if (account.user_id !== req.user.id) {
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

  // Check ownership
  if (account.user_id !== req.user.id) {
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

  // Check ownership
  if (account.user_id !== req.user.id) {
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

  // Check ownership
  if (account.user_id !== req.user.id) {
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
