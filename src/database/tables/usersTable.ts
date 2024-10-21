import {Model,DataTypes} from 'sequelize';
import sequelize from '../../config/sql';
import BookingDetails from './bookingDetailsTable';
import CancelledFlights from './cancelledFlightsTable';
import UnsuccessfullFlights from './unsuccessFullFlightsTable';
import TravellerDetails from './travellerDetailsTable';

interface userTypes {
 id?: string;
 name: string;
 emailId: string;
 phoneNumber: string;
 tbkCredits: number;
 createdAt?: Date;
};

class Users extends Model<userTypes> {
 declare id?: string;
 declare name: string;
 declare emailId: string;
 declare phoneNumber: string;
 declare tbkCredits: number;
 declare createdAt: Date;

 declare bookings?: BookingDetails[];
 declare cancelled?: CancelledFlights[];
 declare unsuccessfulFlights?: UnsuccessfullFlights[];
 declare travellerDetails?: TravellerDetails[];
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
 emailId: {
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
  type: DataTypes.INTEGER,
  defaultValue: 1000000,
  allowNull: true,
 },
 createdAt: {
  type: DataTypes.DATE,
  defaultValue: DataTypes.NOW,
 },
},{
 sequelize,
 modelName: 'users',
 timestamps: false,
 indexes: [
  {
   name: "user_email_index",
   unique: true,
   fields: ["emailId"]
  }
 ]
});

// Users.hasMany(BookingDetails,{foreignKey: 'userId', as: 'bookingDetails'});
// Users.hasMany(CancelledFlights,{foreignKey: 'userId', as: 'cancelledFlights'});
// Users.hasMany(UnsuccessfullFlights,{foreignKey: 'userId', as: 'unsuccessfullFlights'});
// Users.hasMany(TravellerDetails,{foreignKey: 'userId', as: 'travellerDetails'});

export default Users;