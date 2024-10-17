import {Model,DataTypes} from 'sequelize';
import sequelize from '../../config/sql';
import User from './usersTable';

interface CancelledFlightsTypes {
  id?: string;
  flightData: object;
  cancelledDate?: Date;
  CancellationCharge?: string;
  ServiceTaxOnRAF?: string;
  ChangeRequestId: string;
  ChangeRequestStatus?: string;
  CreditNoteCreatedOn?: Date;
  CreditNoteNo?: string;
  KrishiKalyanCess?: string;
  RefundedAmount?: string;
  refundExpectedBy?: Date;
  refundRequestRaised?: Date;
  SwachhBharatCess?: string;
  TicketId?: object;
  TraceId?: string;
  userId: string;
};

class CancelledFlights extends Model<CancelledFlightsTypes> {
  public id!: string;
  public flightData!: object;
  public cancelledDate?: Date;
  public CancellationCharge?: string;
  public ServiceTaxOnRAF?: string;
  public ChangeRequestId!: string;
  public ChangeRequestStatus?: string;
  public CreditNoteCreatedOn?: Date;
  public CreditNoteNo?: string;
  public KrishiKalyanCess?: string;
  public RefundedAmount?: string;
  public refundExpectedBy?: Date;
  public refundRequestRaised?: Date;
  public SwachhBharatCess?: string;
  public TicketId?: object;
  public TraceId?: string;
  public userId!: string;

  public user?: User;
};

CancelledFlights.init({
  id: {
    type: DataTypes.UUID,
    primaryKey: true,
    defaultValue: DataTypes.UUIDV4,
  },
  flightData: {
    type: DataTypes.JSON,
    allowNull: false,
  },
  cancelledDate: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  CancellationCharge: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  ServiceTaxOnRAF: {
    type: DataTypes.STRING,
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
    type: DataTypes.STRING,
    allowNull: true,
  },
  RefundedAmount: {
    type: DataTypes.STRING,
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
    type: DataTypes.STRING,
    allowNull: true,
  },
  TicketId: {
    type: DataTypes.JSON,
    allowNull: true,
  },
  TraceId: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: User,
      key: 'id',
     },
  },
},{
  sequelize,
  tableName: 'cancelledFlights',
  timestamps: false,
});

CancelledFlights.belongsTo(User,{foreignKey: 'userId',as: 'users'});

export default CancelledFlights;