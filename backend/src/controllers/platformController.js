import Platform from '../models/Platform.js';
import PlatformField from '../models/PlatformField.js';
import BlogAccount from '../models/BlogAccount.js';
import AccountFieldData from '../models/AccountFieldData.js';

// 플랫폼 목록 조회 (사용자용 - 활성화된 플랫폼만)
export const getPlatforms = async (req, res) => {
  try {
    const platforms = await Platform.findAll({
      where: { isActive: true },
      include: [{
        model: PlatformField,
        as: 'fields',
        order: [['displayOrder', 'ASC']],
      }],
      order: [['displayName', 'ASC']],
    });

    res.json({
      success: true,
      data: platforms,
    });
  } catch (error) {
    console.error('Get platforms error:', error);
    res.status(500).json({
      success: false,
      message: '플랫폼 목록 조회 실패',
      error: error.message,
    });
  }
};

// 플랫폼 상세 조회
export const getPlatformById = async (req, res) => {
  try {
    const { id } = req.params;

    const platform = await Platform.findByPk(id, {
      include: [{
        model: PlatformField,
        as: 'fields',
        order: [['displayOrder', 'ASC']],
      }],
    });

    if (!platform) {
      return res.status(404).json({
        success: false,
        message: '플랫폼을 찾을 수 없습니다',
      });
    }

    res.json({
      success: true,
      data: platform,
    });
  } catch (error) {
    console.error('Get platform error:', error);
    res.status(500).json({
      success: false,
      message: '플랫폼 조회 실패',
      error: error.message,
    });
  }
};

// === 관리자 전용 API ===

// 모든 플랫폼 조회 (관리자용)
export const getAllPlatformsAdmin = async (req, res) => {
  try {
    const platforms = await Platform.findAll({
      include: [{
        model: PlatformField,
        as: 'fields',
        order: [['displayOrder', 'ASC']],
      }, {
        model: BlogAccount,
        as: 'blogAccounts',
        attributes: ['id'],
      }],
      order: [['createdAt', 'DESC']],
    });

    // 각 플랫폼별 연결된 계정 수 추가
    const platformsWithStats = platforms.map(platform => ({
      ...platform.toJSON(),
      accountCount: platform.blogAccounts?.length || 0,
    }));

    res.json({
      success: true,
      data: platformsWithStats,
    });
  } catch (error) {
    console.error('Get all platforms admin error:', error);
    res.status(500).json({
      success: false,
      message: '플랫폼 목록 조회 실패',
      error: error.message,
    });
  }
};

// 플랫폼 생성 (관리자용)
export const createPlatform = async (req, res) => {
  try {
    const { name, displayName, description, icon, apiEndpoint, loginUrl, fields } = req.body;

    // 플랫폼 생성
    const platform = await Platform.create({
      name,
      displayName,
      description,
      icon,
      apiEndpoint,
      loginUrl,
      isActive: true,
    });

    // 필드 생성
    if (fields && fields.length > 0) {
      const platformFields = fields.map((field, index) => ({
        platformId: platform.id,
        fieldName: field.fieldName,
        fieldLabel: field.fieldLabel,
        fieldType: field.fieldType || 'text',
        placeholder: field.placeholder,
        helpText: field.helpText,
        isRequired: field.isRequired !== false,
        isEncrypted: field.isEncrypted || false,
        displayOrder: field.displayOrder !== undefined ? field.displayOrder : index,
        validation: field.validation,
        options: field.options,
      }));

      await PlatformField.bulkCreate(platformFields);
    }

    // 생성된 플랫폼 데이터 다시 조회
    const createdPlatform = await Platform.findByPk(platform.id, {
      include: [{
        model: PlatformField,
        as: 'fields',
        order: [['displayOrder', 'ASC']],
      }],
    });

    res.status(201).json({
      success: true,
      message: '플랫폼이 생성되었습니다',
      data: createdPlatform,
    });
  } catch (error) {
    console.error('Create platform error:', error);
    res.status(500).json({
      success: false,
      message: '플랫폼 생성 실패',
      error: error.message,
    });
  }
};

// 플랫폼 수정 (관리자용)
export const updatePlatform = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, displayName, description, icon, apiEndpoint, loginUrl, isActive, fields } = req.body;

    const platform = await Platform.findByPk(id);

    if (!platform) {
      return res.status(404).json({
        success: false,
        message: '플랫폼을 찾을 수 없습니다',
      });
    }

    // 플랫폼 정보 업데이트
    await platform.update({
      name,
      displayName,
      description,
      icon,
      apiEndpoint,
      loginUrl,
      isActive,
    });

    // 필드 업데이트
    if (fields) {
      // 기존 필드 삭제
      await PlatformField.destroy({ where: { platformId: id } });

      // 새 필드 생성
      if (fields.length > 0) {
        const platformFields = fields.map((field, index) => ({
          platformId: platform.id,
          fieldName: field.fieldName,
          fieldLabel: field.fieldLabel,
          fieldType: field.fieldType || 'text',
          placeholder: field.placeholder,
          helpText: field.helpText,
          isRequired: field.isRequired !== false,
          isEncrypted: field.isEncrypted || false,
          displayOrder: field.displayOrder !== undefined ? field.displayOrder : index,
          validation: field.validation,
          options: field.options,
        }));

        await PlatformField.bulkCreate(platformFields);
      }
    }

    // 업데이트된 플랫폼 데이터 다시 조회
    const updatedPlatform = await Platform.findByPk(id, {
      include: [{
        model: PlatformField,
        as: 'fields',
        order: [['displayOrder', 'ASC']],
      }],
    });

    res.json({
      success: true,
      message: '플랫폼이 수정되었습니다',
      data: updatedPlatform,
    });
  } catch (error) {
    console.error('Update platform error:', error);
    res.status(500).json({
      success: false,
      message: '플랫폼 수정 실패',
      error: error.message,
    });
  }
};

// 플랫폼 삭제 (관리자용)
export const deletePlatform = async (req, res) => {
  try {
    const { id } = req.params;

    const platform = await Platform.findByPk(id, {
      include: [{
        model: BlogAccount,
        as: 'blogAccounts',
      }],
    });

    if (!platform) {
      return res.status(404).json({
        success: false,
        message: '플랫폼을 찾을 수 없습니다',
      });
    }

    // 연결된 계정이 있으면 삭제 불가
    if (platform.blogAccounts && platform.blogAccounts.length > 0) {
      return res.status(400).json({
        success: false,
        message: '이 플랫폼을 사용하는 계정이 있어 삭제할 수 없습니다',
        accountCount: platform.blogAccounts.length,
      });
    }

    await platform.destroy();

    res.json({
      success: true,
      message: '플랫폼이 삭제되었습니다',
    });
  } catch (error) {
    console.error('Delete platform error:', error);
    res.status(500).json({
      success: false,
      message: '플랫폼 삭제 실패',
      error: error.message,
    });
  }
};

// 플랫폼 활성화/비활성화 (관리자용)
export const togglePlatformStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;

    const platform = await Platform.findByPk(id);

    if (!platform) {
      return res.status(404).json({
        success: false,
        message: '플랫폼을 찾을 수 없습니다',
      });
    }

    await platform.update({ isActive });

    res.json({
      success: true,
      message: `플랫폼이 ${isActive ? '활성화' : '비활성화'}되었습니다`,
      data: platform,
    });
  } catch (error) {
    console.error('Toggle platform status error:', error);
    res.status(500).json({
      success: false,
      message: '플랫폼 상태 변경 실패',
      error: error.message,
    });
  }
};
