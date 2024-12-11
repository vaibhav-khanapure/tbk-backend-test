import { Model, DataTypes } from 'sequelize';
import sequelize from '../../config/sql';

export interface UnsuccessfulFlightsTypes {
  id?: string;
  bookingAmount: number;
  Currency?: string;
  paymentType?: string;
  TraceId: string;
  RefundStatus: "Pending" | "Rejected" | "Approved";
  RefundedAmount: number;
  RefundProcessedOn: Date;
  Reason?: string;
  RefundedOn: Date;
  RefundedUntil?: Date;
  Segments: object;
  travellers: object;
  isFlightInternational?: boolean;

  userId: string;
};

class UnsuccessfulFlights extends Model<UnsuccessfulFlightsTypes> {
 declare id?: string;
 declare bookingAmount: number;
 declare Currency?: string;
 declare paymentType?: string;
 declare TraceId: string;
 declare RefundStatus: "Pending" | "Rejected" | "Approved";
 declare RefundedAmount: number;
 declare RefundProcessedOn: string;
 declare Reason?: string;
 declare RefundedOn: string;
 declare RefundedUntil?: string;
 declare Segments: object;
 declare travellers: object;
 declare isFlightInternational?: boolean;

 declare userId: string
};

UnsuccessfulFlights.init({
  id: {
    type: DataTypes.UUID,
    primaryKey: true,
    defaultValue: DataTypes.UUIDV4,
  },
  TraceId: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  Currency: {
   type: DataTypes.STRING,
   defaultValue: "INR" 
  },
  bookingAmount: {
    type: DataTypes.DECIMAL,
    allowNull: false,
  },
  Reason: {
    type: DataTypes.STRING,
    allowNull: true, 
  },
  RefundedAmount: {
    type: DataTypes.DECIMAL,
    allowNull: true,
  },
  RefundedOn: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  RefundProcessedOn: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  RefundedUntil: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  paymentType: {
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
  isFlightInternational: {
    type: DataTypes.BOOLEAN,
    allowNull: true,
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    // references: {
    //   model: User,
    //   key: 'id',
    // },
  },
}, {
  sequelize,
  tableName: 'unsuccessfulflights',
  timestamps: true,
});

// UnsuccessfulFlights.belongsTo(User,{ foreignKey: 'userId',as: 'users', onDelete: "CASCADE", onUpdate: "CASCADE" });

export default UnsuccessfulFlights;