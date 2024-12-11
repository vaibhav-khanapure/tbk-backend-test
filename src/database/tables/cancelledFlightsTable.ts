import { Model, DataTypes } from 'sequelize';
import sequelize from '../../config/sql';
import User from './usersTable';

interface CancelledFlightsTypes {
  id?: string;
  cancellationDate?: Date;
  cancellationCharge?: number;
  cancellationType: "Full" | "Partial";
  ServiceTaxOnRAF?: number;
  ChangeRequestId: string;
  ChangeRequestStatus?: string;
  CreditNoteCreatedOn?: Date;
  Remarks: string;
  Status: number;
  CreditNoteNo?: string;
  KrishiKalyanCess?: number;
  RefundedAmount?: number;
  refundExpectedBy?: Date;
  refundRequestRaised?: Date;
  SwachhBharatCess?: number;
  TicketId?: number;
  TraceId?: string;
  userId: string;
};

class CancelledFlights extends Model<CancelledFlightsTypes> {
 declare id?: string;
 declare cancellationDate?: Date;
 declare cancellationCharge?: number;
 declare cancellationType: "Full" | "Partial";
 declare ServiceTaxOnRAF?: number;
 declare ChangeRequestId: string;
 declare ChangeRequestStatus?: string;
 declare CreditNoteCreatedOn?: Date;
 declare Remarks: string;
 declare Status: number;
 declare CreditNoteNo?: string;
 declare KrishiKalyanCess?: number;
 declare RefundedAmount?: number;
 declare refundExpectedBy?: Date;
 declare refundRequestRaised?: Date;
 declare SwachhBharatCess?: number;
 declare TicketId?: number;
 declare TraceId?: string;
 declare userId: string;
};

CancelledFlights.init({
  id: {
    type: DataTypes.UUID,
    primaryKey: true,
    defaultValue: DataTypes.UUIDV4,
  },
  cancellationDate: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  cancellationType: {
   type: DataTypes.ENUM("Full", "Partial"),
   allowNull: false,
  },
  cancellationCharge: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  Remarks: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  ServiceTaxOnRAF: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  Status: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  ChangeRequestId: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  ChangeRequestStatus: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  CreditNoteCreatedOn: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  CreditNoteNo: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  KrishiKalyanCess: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  RefundedAmount: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  refundExpectedBy: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  refundRequestRaised: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  SwachhBharatCess: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  TicketId: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  TraceId: {
    type: DataTypes.STRING,
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
  tableName: 'cancelledFlights',
  timestamps: true,
});

// CancelledFlights.belongsTo(User, { foreignKey: 'userId', as: 'users', onDelete: "CASCADE", onUpdate: "CASCADE" });

export default CancelledFlights;