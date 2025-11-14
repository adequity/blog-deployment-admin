import { validationResult } from 'express-validator';
import Platform from '../models/Platform.js';
import PlatformField from '../models/PlatformField.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { ValidationError, NotFoundError } from '../middleware/errorHandler.js';

// @desc    Get all platforms
// @route   GET /api/v1/admin/platforms
// @access  Private (Admin only)
export const getPlatforms = asyncHandler(async (req, res) => {
  const { includeInactive } = req.query;

  const where = {};
  if (!includeInactive || includeInactive === 'false') {
    where.isActive = true;
  }

  const platforms = await Platform.findAll({
    where,
    include: [
      {
        model: PlatformField,
        as: 'fields',
        required: false,
      },
    ],
    order: [
      ['isActive', 'DESC'],
      ['name', 'ASC'],
    ],
  });

  res.json({
    success: true,
    data: platforms,
  });
});

// @desc    Get single platform
// @route   GET /api/v1/admin/platforms/:id
// @access  Private (Admin only)
export const getPlatform = asyncHandler(async (req, res) => {
  const platform = await Platform.findByPk(req.params.id, {
    include: [
      {
        model: PlatformField,
        as: 'fields',
        required: false,
      },
    ],
  });

  if (!platform) {
    throw new NotFoundError('Platform not found');
  }

  res.json({
    success: true,
    data: platform,
  });
});

// @desc    Create new platform
// @route   POST /api/v1/admin/platforms
// @access  Private (Admin only)
export const createPlatform = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new ValidationError(errors.array()[0].msg);
  }

  const { name, displayName, description, icon, apiEndpoint, loginUrl, isActive } = req.body;

  // Check for duplicate name
  const existingPlatform = await Platform.findOne({ where: { name } });
  if (existingPlatform) {
    throw new ValidationError('A platform with this name already exists');
  }

  const platform = await Platform.create({
    name,
    displayName,
    description,
    icon,
    apiEndpoint,
    loginUrl,
    isActive: isActive !== undefined ? isActive : true,
  });

  res.status(201).json({
    success: true,
    message: 'Platform created successfully',
    data: platform,
  });
});

// @desc    Update platform
// @route   PUT /api/v1/admin/platforms/:id
// @access  Private (Admin only)
export const updatePlatform = asyncHandler(async (req, res) => {
  const platform = await Platform.findByPk(req.params.id);

  if (!platform) {
    throw new NotFoundError('Platform not found');
  }

  const { name, displayName, description, icon, apiEndpoint, loginUrl, isActive } = req.body;

  // Check for duplicate name (excluding current platform)
  if (name && name !== platform.name) {
    const existingPlatform = await Platform.findOne({ where: { name } });
    if (existingPlatform) {
      throw new ValidationError('A platform with this name already exists');
    }
  }

  // Update fields
  if (name !== undefined) platform.name = name;
  if (displayName !== undefined) platform.displayName = displayName;
  if (description !== undefined) platform.description = description;
  if (icon !== undefined) platform.icon = icon;
  if (apiEndpoint !== undefined) platform.apiEndpoint = apiEndpoint;
  if (loginUrl !== undefined) platform.loginUrl = loginUrl;
  if (isActive !== undefined) platform.isActive = isActive;

  await platform.save();

  res.json({
    success: true,
    message: 'Platform updated successfully',
    data: platform,
  });
});

// @desc    Delete platform
// @route   DELETE /api/v1/admin/platforms/:id
// @access  Private (Admin only)
export const deletePlatform = asyncHandler(async (req, res) => {
  const platform = await Platform.findByPk(req.params.id);

  if (!platform) {
    throw new NotFoundError('Platform not found');
  }

  // TODO: Check if platform is in use by any accounts
  // If yes, prevent deletion or soft delete

  await platform.destroy();

  res.json({
    success: true,
    message: 'Platform deleted successfully',
  });
});
