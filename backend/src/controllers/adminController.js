import User from '../models/User.js';
import bcrypt from 'bcryptjs';

// Get all users (admin only)
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: [
        'id',
        'username',
        'email',
        'phone',
        'role',
        'is_active',
        'referral_code',
        'created_at',
        'updated_at',
      ],
      order: [['created_at', 'DESC']],
    });

    res.json({
      success: true,
      data: users,
    });
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({
      success: false,
      message: '사용자 목록 조회에 실패했습니다.',
    });
  }
};

// Update user status (admin only)
export const updateUserStatus = async (req, res) => {
  try {
    const { userId } = req.params;
    const { is_active } = req.body;

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: '사용자를 찾을 수 없습니다.',
      });
    }

    // Prevent admin from deactivating themselves
    if (user.id === req.user.id && !is_active) {
      return res.status(400).json({
        success: false,
        message: '자신의 계정을 비활성화할 수 없습니다.',
      });
    }

    await user.update({ is_active });

    res.json({
      success: true,
      message: '사용자 상태가 업데이트되었습니다.',
      data: {
        id: user.id,
        username: user.username,
        email: user.email,
        is_active: user.is_active,
      },
    });
  } catch (error) {
    console.error('Update user status error:', error);
    res.status(500).json({
      success: false,
      message: '사용자 상태 업데이트에 실패했습니다.',
    });
  }
};

// Get user statistics (admin only)
export const getUserStats = async (req, res) => {
  try {
    const totalUsers = await User.count();
    const activeUsers = await User.count({ where: { is_active: true } });
    const inactiveUsers = await User.count({ where: { is_active: false } });
    const adminUsers = await User.count({ where: { role: 'admin' } });

    res.json({
      success: true,
      data: {
        total: totalUsers,
        active: activeUsers,
        inactive: inactiveUsers,
        admins: adminUsers,
      },
    });
  } catch (error) {
    console.error('Get user stats error:', error);
    res.status(500).json({
      success: false,
      message: '사용자 통계 조회에 실패했습니다.',
    });
  }
};

// Create new user (admin only)
export const createUser = async (req, res) => {
  try {
    const { username, email, phone, password, role, referral_code } = req.body;

    // Validation
    if (!username || !email || !password) {
      return res.status(400).json({
        success: false,
        message: '필수 항목을 모두 입력해주세요.',
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: '이미 존재하는 이메일입니다.',
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const newUser = await User.create({
      username,
      email,
      phone: phone || '',
      password_hash: hashedPassword,
      role: role || 'user',
      referral_code: referral_code || null,
      is_active: true,
    });

    res.status(201).json({
      success: true,
      message: '사용자가 생성되었습니다.',
      data: {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
        phone: newUser.phone,
        role: newUser.role,
        is_active: newUser.is_active,
        referral_code: newUser.referral_code,
      },
    });
  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({
      success: false,
      message: '사용자 생성에 실패했습니다.',
    });
  }
};

// Update user information (admin only)
export const updateUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const { username, email, phone, role, referral_code, password } = req.body;

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: '사용자를 찾을 수 없습니다.',
      });
    }

    // Check if email is being changed and already exists
    if (email && email !== user.email) {
      const existingUser = await User.findOne({ where: { email } });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: '이미 존재하는 이메일입니다.',
        });
      }
    }

    // Prepare update data
    const updateData = {};
    if (username) updateData.username = username;
    if (email) updateData.email = email;
    if (phone !== undefined) updateData.phone = phone;
    if (role) updateData.role = role;
    if (referral_code !== undefined) updateData.referral_code = referral_code;

    // Hash new password if provided
    if (password) {
      const salt = await bcrypt.genSalt(10);
      updateData.password_hash = await bcrypt.hash(password, salt);
    }

    await user.update(updateData);

    res.json({
      success: true,
      message: '사용자 정보가 업데이트되었습니다.',
      data: {
        id: user.id,
        username: user.username,
        email: user.email,
        phone: user.phone,
        role: user.role,
        is_active: user.is_active,
        referral_code: user.referral_code,
      },
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({
      success: false,
      message: '사용자 정보 업데이트에 실패했습니다.',
    });
  }
};

// Delete user (admin only)
export const deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: '사용자를 찾을 수 없습니다.',
      });
    }

    // Prevent admin from deleting themselves
    if (user.id === req.user.id) {
      return res.status(400).json({
        success: false,
        message: '자신의 계정을 삭제할 수 없습니다.',
      });
    }

    await user.destroy();

    res.json({
      success: true,
      message: '사용자가 삭제되었습니다.',
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({
      success: false,
      message: '사용자 삭제에 실패했습니다.',
    });
  }
};
