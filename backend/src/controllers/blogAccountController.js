import BlogAccount from '../models/BlogAccount.js';
import Platform from '../models/Platform.js';
import PlatformField from '../models/PlatformField.js';
import AccountFieldData from '../models/AccountFieldData.js';

// 내 블로그 계정 목록 조회
export const getMyBlogAccounts = async (req, res) => {
  try {
    const userId = req.user.id;

    const accounts = await BlogAccount.findAll({
      where: { userId },
      include: [
        {
          model: Platform,
          as: 'platform',
          include: [{
            model: PlatformField,
            as: 'fields',
          }],
        },
        {
          model: AccountFieldData,
          as: 'fieldData',
          include: [{
            model: PlatformField,
            as: 'field',
          }],
        },
      ],
      order: [['createdAt', 'DESC']],
    });

    // 암호화된 필드 복호화
    const accountsWithDecryptedData = accounts.map(account => {
      const accountJSON = account.toJSON();
      if (accountJSON.fieldData) {
        accountJSON.fieldData = accountJSON.fieldData.map(data => {
          if (data.isEncrypted && data.fieldValue) {
            try {
              data.fieldValue = AccountFieldData.decryptValue(data.fieldValue);
            } catch (error) {
              console.error('Decryption error:', error);
            }
          }
          return data;
        });
      }
      return accountJSON;
    });

    res.json({
      success: true,
      data: accountsWithDecryptedData,
    });
  } catch (error) {
    console.error('Get my blog accounts error:', error);
    res.status(500).json({
      success: false,
      message: '블로그 계정 목록 조회 실패',
      error: error.message,
    });
  }
};

// 블로그 계정 추가
export const createBlogAccount = async (req, res) => {
  try {
    const userId = req.user.id;
    const { platformId, accountName, fields } = req.body;

    // 플랫폼 존재 확인
    const platform = await Platform.findByPk(platformId, {
      include: [{
        model: PlatformField,
        as: 'fields',
      }],
    });

    if (!platform) {
      return res.status(404).json({
        success: false,
        message: '플랫폼을 찾을 수 없습니다',
      });
    }

    if (!platform.isActive) {
      return res.status(400).json({
        success: false,
        message: '비활성화된 플랫폼입니다',
      });
    }

    // 블로그 계정 생성
    const blogAccount = await BlogAccount.create({
      userId,
      platformId,
      accountName,
      isActive: true,
      syncStatus: 'pending',
    });

    // 필드 데이터 저장
    if (fields && Object.keys(fields).length > 0) {
      const fieldDataArray = [];

      for (const fieldName in fields) {
        const fieldValue = fields[fieldName];
        const platformField = platform.fields.find(f => f.fieldName === fieldName);

        if (platformField) {
          let finalValue = fieldValue;

          // 암호화가 필요한 필드 처리
          if (platformField.isEncrypted && fieldValue) {
            finalValue = AccountFieldData.encryptValue(fieldValue);
          }

          fieldDataArray.push({
            blogAccountId: blogAccount.id,
            platformFieldId: platformField.id,
            fieldValue: finalValue,
            isEncrypted: platformField.isEncrypted,
          });
        }
      }

      if (fieldDataArray.length > 0) {
        await AccountFieldData.bulkCreate(fieldDataArray);
      }
    }

    // 생성된 계정 정보 다시 조회
    const createdAccount = await BlogAccount.findByPk(blogAccount.id, {
      include: [
        {
          model: Platform,
          as: 'platform',
        },
        {
          model: AccountFieldData,
          as: 'fieldData',
          include: [{
            model: PlatformField,
            as: 'field',
          }],
        },
      ],
    });

    res.status(201).json({
      success: true,
      message: '블로그 계정이 추가되었습니다',
      data: createdAccount,
    });
  } catch (error) {
    console.error('Create blog account error:', error);
    res.status(500).json({
      success: false,
      message: '블로그 계정 추가 실패',
      error: error.message,
    });
  }
};

// 블로그 계정 수정
export const updateBlogAccount = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const { accountName, fields, isActive } = req.body;

    const blogAccount = await BlogAccount.findOne({
      where: { id, userId },
      include: [{
        model: Platform,
        as: 'platform',
        include: [{
          model: PlatformField,
          as: 'fields',
        }],
      }],
    });

    if (!blogAccount) {
      return res.status(404).json({
        success: false,
        message: '블로그 계정을 찾을 수 없습니다',
      });
    }

    // 기본 정보 업데이트
    await blogAccount.update({
      accountName: accountName !== undefined ? accountName : blogAccount.accountName,
      isActive: isActive !== undefined ? isActive : blogAccount.isActive,
    });

    // 필드 데이터 업데이트
    if (fields && Object.keys(fields).length > 0) {
      for (const fieldName in fields) {
        const fieldValue = fields[fieldName];
        const platformField = blogAccount.platform.fields.find(f => f.fieldName === fieldName);

        if (platformField) {
          let finalValue = fieldValue;

          // 암호화가 필요한 필드 처리
          if (platformField.isEncrypted && fieldValue) {
            finalValue = AccountFieldData.encryptValue(fieldValue);
          }

          // 기존 데이터 확인
          const existingData = await AccountFieldData.findOne({
            where: {
              blogAccountId: blogAccount.id,
              platformFieldId: platformField.id,
            },
          });

          if (existingData) {
            // 업데이트
            await existingData.update({
              fieldValue: finalValue,
              isEncrypted: platformField.isEncrypted,
            });
          } else {
            // 새로 생성
            await AccountFieldData.create({
              blogAccountId: blogAccount.id,
              platformFieldId: platformField.id,
              fieldValue: finalValue,
              isEncrypted: platformField.isEncrypted,
            });
          }
        }
      }
    }

    // 업데이트된 계정 정보 다시 조회
    const updatedAccount = await BlogAccount.findByPk(blogAccount.id, {
      include: [
        {
          model: Platform,
          as: 'platform',
        },
        {
          model: AccountFieldData,
          as: 'fieldData',
          include: [{
            model: PlatformField,
            as: 'field',
          }],
        },
      ],
    });

    res.json({
      success: true,
      message: '블로그 계정이 수정되었습니다',
      data: updatedAccount,
    });
  } catch (error) {
    console.error('Update blog account error:', error);
    res.status(500).json({
      success: false,
      message: '블로그 계정 수정 실패',
      error: error.message,
    });
  }
};

// 블로그 계정 삭제
export const deleteBlogAccount = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const blogAccount = await BlogAccount.findOne({
      where: { id, userId },
    });

    if (!blogAccount) {
      return res.status(404).json({
        success: false,
        message: '블로그 계정을 찾을 수 없습니다',
      });
    }

    await blogAccount.destroy();

    res.json({
      success: true,
      message: '블로그 계정이 삭제되었습니다',
    });
  } catch (error) {
    console.error('Delete blog account error:', error);
    res.status(500).json({
      success: false,
      message: '블로그 계정 삭제 실패',
      error: error.message,
    });
  }
};
