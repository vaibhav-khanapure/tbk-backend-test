import {Model,DataTypes} from 'sequelize';
import sequelize from '../../config/sql';
import User from './usersTable';

interface TravellerDetailsTypes {
  id?: string;
  firstName: string;
  lastName: string;
  dateOfBirth: Date;
  nationality: string;
  gender: string;
  travellerType: string;
  passportNumber?: string;
  passportExpiry?: string;
  passportIssuingCountry?: string;
  createdAt?: Date;
  updatedAt?: Date;
  userId?: string;
};

class TravellerDetails extends Model<TravellerDetailsTypes> {
  public id?: string;
  public firstName!: string;
  public lastName!: string;
  public dateOfBirth!: Date;
  public nationality!: string;
  public gender!: string;
  public travellerType!: string;
  public passportNumber?: string;
  public passportExpiry?: string;
  public passportIssuingCountry?: string;
  public createdAt?: Date;
  public updatedAt?: Date;
  public userId?: string;

  public user?: User;
};

TravellerDetails.init({
  id: {
    type: DataTypes.UUID,
    primaryKey: true,
    defaultValue: DataTypes.UUIDV4,
  },
  firstName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  lastName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  dateOfBirth: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  nationality: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  gender: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  travellerType: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  passportNumber: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  passportExpiry: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  passportIssuingCountry: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: User,
      key: 'id',
    },
  },
},{
  sequelize,
  tableName: 'travellerDetails',
  timestamps: true,
});

TravellerDetails.belongsTo(User,{foreignKey: 'userId',as: 'users'});

export default TravellerDetails;