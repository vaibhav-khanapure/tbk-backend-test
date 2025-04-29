import { Model, DataTypes } from 'sequelize';
import sequelize from '../../config/sql';

export interface UserAttributes {
  id?: number;
  name: string;
  email: string;
  phoneNumber: string;
  tbkCredits: number | string;
  GSTCompanyAddress?: string;
  GSTCompanyContactNumber?: string;
  GSTCompanyName?: string;
  GSTNumber?: string;
  GSTCompanyEmail?: string;

  email_verified_at?: string;
  remember_token?: string;

  groupId?: number;
  hotelGroupId?: number;
  updatedByStaffId?: number;

  password?: string;
  role: "staff" | "admin" | "user";

  active: boolean;
  disableTicket: boolean;

  created_at?: Date;
  updated_at?: Date;
  deleted_at?: Date;
}

class Users extends Model<UserAttributes> {
  declare id?: number;
  declare name: string;
  declare email: string;
  declare phoneNumber: string;
  declare tbkCredits: number | string;
  declare GSTCompanyAddress?: string;
  declare GSTCompanyContactNumber?: string;
  declare GSTCompanyName?: string;
  declare GSTNumber?: string;
  declare GSTCompanyEmail?: string;

  declare email_verified_at?: string;
  declare remember_token?: string;

  declare password?: string;
  declare role: "staff" | "admin" | "user";

  declare active: boolean;
  declare disableTicket: boolean;

  declare groupId?: number;
  declare hotelGroupId?: number;
  declare updatedByStaffId?: number;

  declare created_at?: Date;
  declare updated_at?: Date;
  declare deleted_at?: Date;
};

Users.init(
  {
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
    email: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false,
    },
    email_verified_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    phoneNumber: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false,
    },
    tbkCredits: {
      type: DataTypes.DECIMAL(20, 2),
      defaultValue: 0,
      allowNull: true,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    remember_token: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    role: {
      type: DataTypes.ENUM("staff", "admin", "user"),
      allowNull: false,
      defaultValue: "user",
    },
    active: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
    },
    disableTicket: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
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
    groupId: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    hotelGroupId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 1,
    },
    updatedByStaffId: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: 'users',
    timestamps: true,
    paranoid: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    deletedAt: "deleted_at",
    indexes: [
      {
        name: 'user_email_index',
        unique: true,
        fields: ['email'],
      },
    ],
  }
);

// Users.hasMany(BookingDetails, { foreignKey: 'userId', as: 'bookingDetails' });
// Users.hasMany(CancelledFlights, { foreignKey: 'userId', as: 'cancelledFlights' });
// Users.hasMany(UnsuccessfulFlights, { foreignKey: 'userId', as: 'unsuccessfulFlights' });
// Users.hasMany(SavedTravellers, { foreignKey: 'userId', as: 'savedTravellers' });

export default Users;