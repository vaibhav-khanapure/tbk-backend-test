import { Model, DataTypes } from 'sequelize';
import sequelize from '../../config/sql';
import Users from './usersTable';

export interface userTypes {
  id?: string;
  charge: number;
  userId: string;
};

class UserFareInfo extends Model<userTypes> {
 declare id?: string;
 declare charge: number;
 declare userId: string;
};

UserFareInfo.init({
  id: {
    type: DataTypes.UUID,
    primaryKey: true,
    defaultValue: DataTypes.UUIDV4,
  },
  charge: {
    type: DataTypes.DECIMAL(20, 2),
    allowNull: true,
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    // references: {
    //   model: User,
    //   key: 'id',
    // },
  },
}, {
  sequelize,
  modelName: 'userfareinfo',
  timestamps: true,
});

// UserFareInfo.belongsTo(Users, { foreignKey: 'userId', as: 'users', onDelete: "CASCADE", onUpdate: "CASCADE" });

export default UserFareInfo;