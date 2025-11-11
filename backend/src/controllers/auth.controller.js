import { validationResult } from 'express-validator';
import { Op } from 'sequelize';
import User from '../models/User.js';
import { generateToken } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { ValidationError, AuthenticationError } from '../middleware/errorHandler.js';

// @desc    Register new user
// @route   POST /api/v1/auth/signup
// @access  Public
export const signup = asyncHandler(async (req, res) => {
  // Validate request
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new ValidationError(errors.array()[0].msg);
  }

  const { username, email, phone, password } = req.body;

  // Check if user exists
  const existingUser = await User.findOne({
    where: {
      [Op.or]: [{ username }, { email }],
    },
  });

  if (existingUser) {
    throw new ValidationError('Username or email already exists');
  }

  // Hash password
  const password_hash = await User.hashPassword(password);

  // Create user
  const user = await User.create({
    username,
    email,
    phone,
    password_hash,
  });

  // Generate token
  const token = generateToken(user.id);

  res.status(201).json({
    success: true,
    message: 'User registered successfully',
    token,
    user: user.toJSON(),
  });
});

// @desc    Login user
// @route   POST /api/v1/auth/login
// @access  Public
export const login = asyncHandler(async (req, res) => {
  // Validate request
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new ValidationError(errors.array()[0].msg);
  }

  const { username, password } = req.body;

  // Find user
  const user = await User.findOne({
    where: { username },
  });

  if (!user) {
    throw new AuthenticationError('Invalid credentials');
  }

  // Check password
  const isPasswordValid = await user.comparePassword(password);

  if (!isPasswordValid) {
    throw new AuthenticationError('Invalid credentials');
  }

  // Check if user is active
  if (!user.is_active) {
    throw new AuthenticationError('Account is deactivated');
  }

  // Update last login
  await user.update({ last_login: new Date() });

  // Generate token
  const token = generateToken(user.id);

  res.json({
    success: true,
    message: 'Login successful',
    token,
    user: user.toJSON(),
  });
});

// @desc    Get current user
// @route   GET /api/v1/auth/me
// @access  Private
export const getMe = asyncHandler(async (req, res) => {
  const user = await User.findByPk(req.user.id, {
    attributes: { exclude: ['password_hash'] },
  });

  res.json({
    success: true,
    user,
  });
});

// @desc    Update user profile
// @route   PUT /api/v1/auth/profile
// @access  Private
export const updateProfile = asyncHandler(async (req, res) => {
  const { email, phone } = req.body;

  const user = await User.findByPk(req.user.id);

  if (email) user.email = email;
  if (phone) user.phone = phone;

  await user.save();

  res.json({
    success: true,
    message: 'Profile updated successfully',
    user: user.toJSON(),
  });
});

// @desc    Change password
// @route   PUT /api/v1/auth/password
// @access  Private
export const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  const user = await User.findByPk(req.user.id);

  // Verify current password
  const isPasswordValid = await user.comparePassword(currentPassword);

  if (!isPasswordValid) {
    throw new AuthenticationError('Current password is incorrect');
  }

  // Hash new password
  user.password_hash = await User.hashPassword(newPassword);
  await user.save();

  res.json({
    success: true,
    message: 'Password changed successfully',
  });
});
