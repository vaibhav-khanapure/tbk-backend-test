import {Model, DataTypes} from 'sequelize';
import sequelize from '../../config/sql';
import type {Passenger, Segment} from '../../types/BookedFlights';

export interface FlightBookingTypes {
  id?: number;
  userId: number;

  bookingId: string;
  TraceId: string;
  PNR: string;
  isFlightCombo: boolean;
  tboAmount: number | string;
  tbkAmount: number | string;
  bookedDate: Date;
  InvoiceNo: string;
  InvoiceId: number;
  IsLCC: boolean;
  flightStatus?: string;
  Segments: Segment[];
  Passenger: Passenger[];
  flightCities?: {origin: string; destination: string};
  cancelledTickets?: number[];

  createdAt?: Date;
  updatedAt?: Date;
};

class FlightBookings extends Model<FlightBookingTypes> {
  declare id?: number;
  declare userId: number;

  declare bookingId: string;
  declare TraceId: string;
  declare PNR: string;
  declare isFlightCombo: boolean;
  declare tboAmount: number;
  declare tbkAmount: number;
  declare bookedDate: Date;
  declare InvoiceNo: string;
  declare InvoiceId: number;
  declare IsLCC: boolean;
  declare flightStatus?: string;
  declare Segments: Segment[];
  declare Passenger: Passenger[];
  declare flightCities?: {origin: string; destination: string};
  declare cancelledTickets: number[];

  declare createdAt?: Date;
  declare updatedAt?: Date;
};

FlightBookings.init({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
  },
  bookingId: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  TraceId: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  PNR: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  isFlightCombo: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  flightCities: {
    type: DataTypes.JSON,
    allowNull: true,
  },
  tboAmount: {
    type: DataTypes.DECIMAL(20, 2),
    allowNull: false,
  },
  tbkAmount: {
    type: DataTypes.DECIMAL(20, 2),
    allowNull: false,
  },
  bookedDate: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  InvoiceNo: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  InvoiceId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  IsLCC: {
    type: DataTypes.BOOLEAN,
    allowNull: true,
  },
  flightStatus: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  Segments: {
    type: DataTypes.JSON,
    allowNull: true,
  },
  Passenger: {
    type: DataTypes.JSON,
    allowNull: true,
  },
  cancelledTickets: {
    type: DataTypes.JSON,
    allowNull: true,
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
}, {
  sequelize,
  modelName: 'flightbookings',
  timestamps: true,
});

export default FlightBookings;