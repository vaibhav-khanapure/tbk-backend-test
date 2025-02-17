import { Model, DataTypes } from 'sequelize';
import sequelize from '../../config/sql';
import type { Passenger, Segment } from '../../types/BookedFlights';

interface nonLCCBookingsTable {
  id?: number;
  userId: number;

  bookingId: number;
  TraceId: string;
  PNR: string;
  isFlightCombo: boolean;
  tboAmount: number | string;
  tbkAmount: number | string;
  bookedDate: Date;
  Source: number;
  flightStatus?: string;
  paymentTransactionId?: string;
  paymentStatus: 'pending' | 'completed' | 'failed';
  bookingStatus: 'initiated' | 'hold' | 'confirmed' | 'expired';
  bookingExpiryDate: string;
  Segments: Segment[];
  Passenger: Passenger[];
  flightCities?: { origin: string; destination: string };
  isPNRCancelled: boolean;
  isTicketGenerated: boolean;

  created_at?: Date;
  updated_at?: Date;
};

class NonLCCBookings extends Model<nonLCCBookingsTable> {
  declare id?: number;
  declare userId: number;

  declare bookingId: number;
  declare TraceId: string;
  declare PNR: string;
  declare isFlightCombo: boolean;
  declare tboAmount: number | string;
  declare tbkAmount: number | string;
  declare bookedDate: Date;
  declare Source: number;
  declare flightStatus?: string;
  declare paymentTransactionId?: string;
  declare paymentStatus: 'pending' | 'completed' | 'failed';
  declare bookingStatus: 'initiated' | 'hold' | 'confirmed' | 'expired';
  declare bookingExpiryDate: string;
  declare Segments: Segment[];
  declare Passenger: Passenger[];
  declare flightCities?: { origin: string; destination: string };
  declare isPNRCancelled: boolean;
  declare isTicketGenerated: boolean;

  declare created_at?: Date;
  declare updated_at?: Date;
};

NonLCCBookings.init({
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
    allowNull: false,
  },
  bookingId: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  TraceId: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  PNR: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  paymentTransactionId: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  Source: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  isFlightCombo: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  flightCities: {
    type: DataTypes.JSON,
    allowNull: true,
  },
  paymentStatus: {
    type: DataTypes.ENUM('pending', 'completed', 'failed'),
    defaultValue: 'pending'
  },
  bookingStatus: {
    type: DataTypes.ENUM('initiated', 'hold', 'confirmed', 'expired'),
    defaultValue: 'initiated'
  },
  bookingExpiryDate: {
    type: DataTypes.DATE,
    allowNull: true
  },
  tboAmount: {
    type: DataTypes.DECIMAL(20, 2),
    allowNull: true,
  },
  tbkAmount: {
    type: DataTypes.DECIMAL(20, 2),
    allowNull: true,
  },
  bookedDate: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  flightStatus: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  isPNRCancelled: {
    type: DataTypes.BOOLEAN,
    allowNull: true,
    defaultValue: true,
  },
  isTicketGenerated: {
    type: DataTypes.BOOLEAN,
    allowNull: true,
    defaultValue: true,
  },
  Segments: {
    type: DataTypes.JSON,
    allowNull: true,
  },
  Passenger: {
    type: DataTypes.JSON,
    allowNull: true,
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
}, {
  sequelize,
  tableName: 'nonlccbookings',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});

export default NonLCCBookings;