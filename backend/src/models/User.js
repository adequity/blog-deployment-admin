import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';
import bcrypt from 'bcryptjs';

const User = sequelize.define('User', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  username: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true,
    validate: {
      len: [3, 50],
      isAlphanumeric: true,
    },
  },
  email: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true,
    },
  },
  phone: {
    type: DataTypes.STRING(20),
    allowNull: false,
    validate: {
      is: /^[0-9-+()]*$/,
    },
  },
  password_hash: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  last_login: {
    type: DataTypes.DATE,
  },
}, {
  tableName: 'users',
  indexes: [
    { fields: ['username'] },
    { fields: ['email'] },
  ],
});

// Instance methods
User.prototype.comparePassword = async function(password) {
  return await bcrypt.compare(password, this.password_hash);
};

User.prototype.toJSON = function() {
  const values = Object.assign({}, this.get());
  delete values.password_hash;
  return values;
};

// Class methods
User.hashPassword = async function(password) {
  const salt = await bcrypt.genSalt(12);
  return await bcrypt.hash(password, salt);
};

export default User;
