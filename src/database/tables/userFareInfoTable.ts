import {Model,DataTypes} from 'sequelize';
import sequelize from '../../config/sql';

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
  type: DataTypes.INTEGER,
  allowNull: true,  
 },
 userId: {
  type: DataTypes.UUID,
  allowNull: false,
 },
},{
 sequelize,
 modelName: 'userFareInfo',
 timestamps: true,
 updatedAt: false,
});

export default UserFareInfo;