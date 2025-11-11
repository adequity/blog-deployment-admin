import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Platform = sequelize.define('Platform', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
    comment: '플랫폼 이름 (예: 네이버, 티스토리)',
  },
  displayName: {
    type: DataTypes.STRING(100),
    allowNull: false,
    comment: '플랫폼 표시명',
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: '플랫폼 설명',
  },
  icon: {
    type: DataTypes.STRING(50),
    allowNull: true,
    comment: '플랫폼 아이콘 (이모지 또는 아이콘 코드)',
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    comment: '플랫폼 활성화 여부',
  },
  apiEndpoint: {
    type: DataTypes.STRING(500),
    allowNull: true,
    comment: '플랫폼 API 엔드포인트',
  },
  loginUrl: {
    type: DataTypes.STRING(500),
    allowNull: true,
    comment: '플랫폼 로그인 URL',
  },
}, {
  tableName: 'platforms',
  timestamps: true,
  indexes: [
    { fields: ['name'], unique: true },
    { fields: ['is_active'] },
  ],
});

export default Platform;

