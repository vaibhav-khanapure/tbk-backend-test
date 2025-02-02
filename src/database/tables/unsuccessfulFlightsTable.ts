import {Model, DataTypes} from 'sequelize';
import sequelize from '../../config/sql';
import type { Segment } from '../../types/BookedFlights';

export interface UnsuccessfulFlightsTypes {
  id?: number;
  userId: number;

  bookingAmount: number | string;
  Currency?: string;
  paymentMethod: string;
  TraceId: string;
  RefundStatus: "Pending" | "Rejected" | "Approved";
  RefundedAmount: number | string;
  RefundProcessedOn: Date;
  Reason?: string;
  RefundCreditedDate: Date;
  RefundedUntil?: Date;
  Segments: Segment[][];
  travellers: object;
  isFlightCombo?: boolean;
  flightCities?: {origin: string; destination: string;};

  createdAt?: Date;
  updatedAt?: Date;
};

class UnsuccessfulFlights extends Model<UnsuccessfulFlightsTypes> {
 declare id?: number;
 declare userId: number;

 declare bookingAmount: number | string;
 declare Currency?: string;
 declare paymentMethod: string;
 declare TraceId: string;
 declare RefundStatus: "Pending" | "Rejected" | "Approved";
 declare RefundedAmount: number | string;
 declare RefundProcessedOn: string;
 declare Reason?: string;
 declare RefundedOn: string;
 declare RefundedUntil?: string;
 declare Segments: Segment[][];
 declare travellers: object;
 declare isFlightCombo?: boolean;
 declare flightCities?: {origin: string; destination: string;};

 declare createdAt?: Date;
 declare updatedAt?: Date;
};

UnsuccessfulFlights.init({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
  },
  TraceId: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  Currency: {
   type: DataTypes.STRING,
   allowNull: true,
   defaultValue: "INR",
  },
  bookingAmount: {
    type: DataTypes.DECIMAL(20, 2),
    allowNull: false,
  },
  Reason: {
    type: DataTypes.STRING,
    allowNull: true, 
  },
  RefundedAmount: {
    type: DataTypes.DECIMAL(20, 2),
    allowNull: true,
  },
  RefundProcessedOn: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  RefundCreditedDate: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  RefundedUntil: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  paymentMethod: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  RefundStatus: {
    type: DataTypes.ENUM("Pending", "Rejectd", "Approved"),
    allowNull: false,
  },
  Segments: {
    type: DataTypes.JSON,
    allowNull: false,
  },
  travellers: {
    type: DataTypes.JSON,
    allowNull: false,
  },
  isFlightCombo: {
    type: DataTypes.BOOLEAN,
    allowNull: true,
  },
  flightCities: {
    type: DataTypes.JSON,
    allowNull: true,
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
}, {
  sequelize,
  tableName: 'unsuccessfulflights',
  timestamps: true,
});

export default UnsuccessfulFlights;