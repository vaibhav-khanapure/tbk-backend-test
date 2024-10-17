import {Model,DataTypes} from 'sequelize';
import sequelize from '../../config/sql';

interface SettingTypes {
 id?: string;
 TboTokenId: string;
};

class Settings extends Model<SettingTypes> {
 public id?: string;
 public TboTokenId!: string;
};

Settings.init({
  id: {
    type: DataTypes.UUID,
    primaryKey: true,
    defaultValue: DataTypes.UUIDV4,
  },
  TboTokenId: {
    type: DataTypes.STRING,
    allowNull: false,
  },
},{
  sequelize,
  tableName: 'settings',
  timestamps: false,
});

export default Settings;