import User from '../models/User.js';

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
