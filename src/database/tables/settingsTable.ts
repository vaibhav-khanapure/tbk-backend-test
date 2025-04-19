import {Model, DataTypes} from 'sequelize';
import sequelize from '../../config/sql';

interface SettingTypes {
 id?: string;
 key: string;
 value: string;
};

class Settings extends Model<SettingTypes> {
 declare id?: string;
 declare key: string;
 declare value: string;
};

Settings.init({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
  },
  key: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  value: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
},{
  sequelize,
  tableName: 'settings',
  timestamps: false,
});

export default Settings;