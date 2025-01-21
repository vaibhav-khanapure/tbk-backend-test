import {Model,DataTypes} from 'sequelize';
import sequelize from '../../config/sql';

export interface userTypes {
 id?: string;
 name: string;
 email: string;
 phoneNumber: string;
 tbkCredits: number | string;
 GSTCompanyAddress?: string;
 GSTCompanyContactNumber?: string;
 GSTCompanyName?: string;
 GSTNumber?: string;
 GSTCompanyEmail?: string;

 active: boolean;

 createdAt?: Date;
 updatedAt?: Date;
};

class Users extends Model<userTypes> {
 declare id?: string;
 declare name: string;
 declare email: string;
 declare phoneNumber: string;
 declare tbkCredits: number | string;
 declare GSTCompanyAddress?: string;
 declare GSTCompanyContactNumber?: string;
 declare GSTCompanyName?: string;
 declare GSTNumber?: string;
 declare GSTCompanyEmail?: string;

 declare active: boolean;

 declare createdAt?: Date;
 declare updatedAt?: Date;
};

Users.init({
 id: {
  type: DataTypes.UUID,
  primaryKey: true,
  defaultValue: DataTypes.UUIDV4,
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
 active: {
  type: DataTypes.BOOLEAN,
  allowNull: true,
  defaultValue: false
 }
},{
 sequelize,
 modelName: 'users',
 timestamps: true,
 indexes: [
  {
   name: "user_email_index",
   unique: true,
   fields: ["email"],
  }
 ]
});

// Users.hasMany(BookingDetails,{foreignKey: 'userId', as: 'bookingDetails'});
// Users.hasMany(CancelledFlights,{foreignKey: 'userId', as: 'cancelledFlights'});
// Users.hasMany(UnsuccessfulFlights,{foreignKey: 'userId', as: 'unsuccessfulFlights'});
// Users.hasMany(SavedTravellers,{foreignKey: 'userId', as: 'savedTravellers'});

export default Users;