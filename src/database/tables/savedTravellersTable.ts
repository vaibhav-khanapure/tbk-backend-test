import { Model, DataTypes } from 'sequelize';
import sequelize from '../../config/sql';
import User from './usersTable';

export interface SavedTravellerTypes {
  id?: number;
  userId?: number;

  gender: string;
  firstName: string;
  lastName: string;
  dateOfBirth?: Date;
  nationality: string;
  travellerType: string;
  passportNo?: string;
  passportIssueCountryCode?: string;
  passportIssueDate?: string;
  passportExpiry: string;
  GSTCompanyAddress?: string;
  GSTCompanyContactNumber?: string;
  GSTCompanyName?: string;
  GSTNumber?: string;
  GSTCompanyEmail?: string;
  PAN?: string;

  createdAt?: Date;
  updatedAt?: Date;
};

class SavedTravellers extends Model<SavedTravellerTypes> {
  declare id?: number;
  declare userId?: number;

  declare gender: string;
  declare firstName: string;
  declare lastName: string;
  declare dateOfBirth?: Date;
  declare nationality: string;
  declare travellerType: string;
  declare passportNo?: string;
  declare passportIssueCountryCode?: string;
  declare passportIssueDate?: string;
  declare passportExpiry: string;
  declare GSTCompanyAddress?: string;
  declare GSTCompanyContactNumber?: string;
  declare GSTCompanyName?: string;
  declare GSTNumber?: string;
  declare GSTCompanyEmail?: string;
  declare PAN?: string;

  declare createdAt?: Date;
  declare updatedAt?: Date;
};

SavedTravellers.init({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    allowNull: false,
    autoIncrement: true,
  },
  firstName: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  lastName: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  dateOfBirth: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  nationality: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  gender: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  travellerType: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  passportNo: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  passportExpiry: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  passportIssueCountryCode: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  passportIssueDate: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  GSTCompanyAddress: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  GSTCompanyContactNumber: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  GSTCompanyEmail: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  GSTCompanyName: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  GSTNumber: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  PAN: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: User,
      key: 'id',
    },
  },
}, {
  sequelize,
  tableName: 'savedtravellers',
  timestamps: true,
});

SavedTravellers.belongsTo(User, {foreignKey: 'userId', as: 'users', onDelete: "CASCADE", onUpdate: "CASCADE"});

export default SavedTravellers;