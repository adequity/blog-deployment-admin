import { asyncHandler } from '../middleware/errorHandler.js';
import { ValidationError, NotFoundError, AuthenticationError } from '../middleware/errorHandler.js';
import User from '../models/User.js';
import { saveBase64Image, deleteIdImage, readImageAsBase64 } from '../config/upload.js';

/**
 * @desc    내 프로필 조회
 * @route   GET /api/v1/users/me
 * @access  Private
 */
export const getMyProfile = asyncHandler(async (req, res) => {
  const user = await User.findByPk(req.user.id);

  if (!user) {
    throw new NotFoundError('User not found');
  }

  res.status(200).json({
    success: true,
    data: user,
  });
});

/**
 * @desc    프로필 업데이트 (기본 정보)
 * @route   PUT /api/v1/users/me
 * @access  Private
 */
export const updateUserProfile = asyncHandler(async (req, res) => {
  const { username, email, phone } = req.body;

  const user = await User.findByPk(req.user.id);

  if (!user) {
    throw new NotFoundError('User not found');
  }

  // 업데이트
  if (username) user.username = username;
  if (email) user.email = email;
  if (phone) user.phone = phone;

  await user.save();

  res.status(200).json({
    success: true,
    message: 'Profile updated successfully',
    data: user,
  });
});

/**
 * @desc    신분증 업로드 (Base64)
 * @route   POST /api/v1/users/me/id-verification
 * @access  Private
 */
export const uploadIdVerification = asyncHandler(async (req, res) => {
  const { realName, idType, idImageBase64 } = req.body;

  // 필수 필드 검증
  if (!realName || !idType || !idImageBase64) {
    throw new ValidationError('Real name, ID type, and image are required');
  }

  // idType 검증
  const validIdTypes = ['resident_card', 'driver_license', 'passport'];
  if (!validIdTypes.includes(idType)) {
    throw new ValidationError('Invalid ID type');
  }

  const user = await User.findByPk(req.user.id);

  if (!user) {
    throw new NotFoundError('User not found');
  }

  // 기존 신분증 이미지 삭제
  if (user.id_image_key) {
    deleteIdImage(user.id_image_key);
  }

  // Base64 이미지 저장
  const { filename, url } = saveBase64Image(idImageBase64, user.id);

  // DB 업데이트
  user.real_name = realName;
  user.id_type = idType;
  user.id_image_url = url;
  user.id_image_key = filename;
  user.id_verified = false; // 관리자 인증 대기
  user.id_verified_at = null;

  await user.save();

  res.status(200).json({
    success: true,
    message: 'ID verification image uploaded successfully. Pending admin approval.',
    data: {
      realName: user.real_name,
      idType: user.id_type,
      idImageUrl: user.id_image_url,
      idVerified: user.id_verified,
    },
  });
});

/**
 * @desc    정산 정보 업데이트
 * @route   PUT /api/v1/users/me/settlement
 * @access  Private
 */
export const updateUserSettlement = asyncHandler(async (req, res) => {
  const { bankName, accountNumber, accountHolder } = req.body;

  const user = await User.findByPk(req.user.id);

  if (!user) {
    throw new NotFoundError('User not found');
  }

  // 업데이트
  if (bankName !== undefined) user.bank_name = bankName;
  if (accountNumber !== undefined) user.account_number = accountNumber;
  if (accountHolder !== undefined) user.account_holder = accountHolder;

  await user.save();

  res.status(200).json({
    success: true,
    message: 'Settlement information updated successfully',
    data: {
      bankName: user.bank_name,
      accountNumber: user.account_number,
      accountHolder: user.account_holder,
    },
  });
});

/**
 * @desc    전체 사용자 조회 (관리자)
 * @route   GET /api/v1/users/admin/all
 * @access  Private/Admin
 */
export const getAllUsers = asyncHandler(async (req, res) => {
  const users = await User.findAll({
    attributes: { exclude: ['password_hash'] },
    order: [['created_at', 'DESC']],
  });

  res.status(200).json({
    success: true,
    count: users.length,
    data: users,
  });
});

/**
 * @desc    신분증 인증 승인/거부 (관리자)
 * @route   POST /api/v1/users/admin/:userId/verify
 * @access  Private/Admin
 */
export const verifyUserIdentity = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const { verified } = req.body; // true or false

  if (typeof verified !== 'boolean') {
    throw new ValidationError('verified field must be a boolean');
  }

  const user = await User.findByPk(userId);

  if (!user) {
    throw new NotFoundError('User not found');
  }

  if (!user.id_image_key) {
    throw new ValidationError('User has not uploaded ID verification image');
  }

  // 인증 상태 업데이트
  user.id_verified = verified;
  user.id_verified_at = verified ? new Date() : null;

  await user.save();

  res.status(200).json({
    success: true,
    message: verified
      ? 'User identity verified successfully'
      : 'User identity verification rejected',
    data: {
      userId: user.id,
      realName: user.real_name,
      idType: user.id_type,
      idVerified: user.id_verified,
      idVerifiedAt: user.id_verified_at,
    },
  });
});
