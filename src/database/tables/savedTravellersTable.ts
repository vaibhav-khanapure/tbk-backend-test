import { Model, DataTypes } from 'sequelize';
import sequelize from '../../config/sql';
import User from './usersTable';

export interface SavedTravellerTypes {
  id?: string;
  gender: string;
  firstName: string;
  lastName: string;
  isLead?: boolean;
  label?: string;
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

  createdAt?: Date;
  updatedAt?: Date;

  userId?: string;
};

class SavedTravellers extends Model<SavedTravellerTypes> {
  declare id?: string;
  declare gender: string;
  declare firstName: string;
  declare lastName: string;
  declare isLead?: boolean;
  declare label?: string;
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

  declare createdAt?: Date;
  declare updatedAt?: Date;

  declare userId?: string;
};

SavedTravellers.init({
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
    allowNull: true,
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
  isLead: {
    type: DataTypes.BOOLEAN,
    allowNull: true,
  },
  label: {
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
  userId: {
    type: DataTypes.UUID,
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