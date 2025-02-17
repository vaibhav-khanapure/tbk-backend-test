import { Model, DataTypes } from 'sequelize';
import sequelize from '../../config/sql';

export interface userTypes {
  id?: number;
  charge: number;
  userId: number;

  created_at?: Date;
  updated_at?: Date;
};

class UserFareInfo extends Model<userTypes> {
  declare id?: number;
  declare charge: number;
  declare userId: number;

  declare created_at?: Date;
  declare updated_at?: Date;
};

UserFareInfo.init({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
  },
  charge: {
    type: DataTypes.DECIMAL(20, 2),
    allowNull: true,
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
}, {
  sequelize,
  modelName: 'userfareinfo',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});

export default UserFareInfo;