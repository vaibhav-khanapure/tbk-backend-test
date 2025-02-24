import {Model, DataTypes} from 'sequelize';
import sequelize from '../../config/sql';

interface GroupAttributes {
  id?: number;

  name: string;
  description?: string;
  updatedByStaffId?: number;

  created_at?: string;
  updated_at?: string;
  deleted_at?: string;
};

class Groups extends Model<GroupAttributes> {
 declare id?: string;
  
 declare name: string;
 declare description?: string;
 declare updatedByStaffId?: number;
  
 declare created_at?: string;
 declare updated_at?: string;
 declare deleted_at?: string;
};

Groups.init({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  updatedByStaffId: {
    type: DataTypes.INTEGER,
    allowNull: true,
  }
}, {
  sequelize,
  modelName: 'groups',
  timestamps: true,
  paranoid: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  deletedAt: 'deleted_at'
});

export default Groups;