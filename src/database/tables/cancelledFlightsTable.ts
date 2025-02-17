import { Model, DataTypes } from 'sequelize';
import sequelize from '../../config/sql';

export interface TicketCRInfo {
  ChangeRequestId: number;
  TicketId: number;
  Status: number;
  Remarks: string;
  ChangeRequestStatus: number;
  CancellationCharge: number;
  RefundedAmount: number;
  ServiceTaxOnRAF: number;
  SwachhBharatCess: number;
  KrishiKalyanCess: number;
  CreditNoteNo: string;
  CreditNoteCreatedOn: string;
};

export interface cancelledTicket {
  TicketId: number;
  TicketCRInfo: TicketCRInfo;
  RefundedAmount: number | string;
  RequestedDate: Date | string;
  RefundedDate: Date | string;
  RefundCreditedOn?: Date | string;
  RefundProcessedOn?: Date | string;
  RefundStatus: "Pending" | "Rejected" | "Accepted";
};

interface CancelledFlightsTypes {
  id?: number;
  userId: number;

  updatedByStaffId?: number;
  description?: string;
  bookingId: number;
  cancellationType: "Full" | "Partial";
  cancelledTickets: cancelledTicket[];

  created_at?: Date;
  updated_at?: Date;
};

class CancelledFlights extends Model<CancelledFlightsTypes> {
  declare id?: number;
  declare userId: number;

  declare updatedByStaffId?: number;
  declare description?: string;
  declare bookingId: number;
  declare cancellationType: "Full" | "Partial";
  declare cancelledTickets: cancelledTicket[];

  declare created_at?: Date;
  declare updated_at?: Date;
};

CancelledFlights.init({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    allowNull: false,
    autoIncrement: true,
  },
  bookingId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  description: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  cancelledTickets: {
    type: DataTypes.JSON,
    allowNull: true,
  },
  updatedByStaffId: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  cancellationType: {
    type: DataTypes.ENUM("Full", "Partial"),
    allowNull: true,
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    // references: {
    //   model: User,
    //   key: 'id',
    // },
  },
}, {
  sequelize,
  tableName: 'cancelledflights',
  timestamps: true,
  createdAt: "created_at",
  updatedAt: "updated_at"
});

// CancelledFlights.belongsTo(User, { foreignKey: 'userId', as: 'users', onDelete: "CASCADE", onUpdate: "CASCADE" });

export default CancelledFlights;