import { Model, DataTypes } from 'sequelize';
import sequelize from '../../config/sql';
import type {bookingData} from '../../types/HotelBookTypes';

export interface UnsuccessfulHotelsTypes {
  id?: number;
  userId: number;

  bookingAmount: number | string;
  Currency?: string;
  paymentMethod: string;
  TraceId: string;
  itineraryCode: string;
  RefundStatus: "Pending" | "Rejected" | "Approved";
  RefundedAmount: number | string;
  RefundProcessedOn: Date;
  Reason?: string;
  RefundCreditedDate: Date;
  RefundedUntil?: Date;
  bookingData: bookingData;

  created_at?: Date;
  updated_at?: Date;
};

class UnsuccessfulHotels extends Model<UnsuccessfulHotelsTypes> {
  declare id?: number;
  declare userId: number;

  declare bookingAmount: number | string;
  declare Currency?: string;
  declare paymentMethod: string;
  declare TraceId: string;
  declare itineraryCode: string;
  declare RefundStatus: "Pending" | "Rejected" | "Approved";
  declare RefundedAmount: number | string;
  declare RefundProcessedOn: Date;
  declare Reason?: string;
  declare RefundCreditedDate: Date;
  declare RefundedUntil?: Date;
  declare bookingData: bookingData;

  declare created_at?: Date;
  declare updated_at?: Date;
};

UnsuccessfulHotels.init({
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
  itineraryCode: {
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
  bookingData: {
    type: DataTypes.JSON,
    allowNull: false,
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
}, {
  sequelize,
  tableName: 'unsuccessfulhotels',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});

export default UnsuccessfulHotels;