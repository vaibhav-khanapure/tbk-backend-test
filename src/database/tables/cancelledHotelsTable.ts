import {Model, DataTypes} from 'sequelize';
import sequelize from '../../config/sql';

interface CancelledBookingTypes {
  id?: number;
  userId: number;

  updatedByStaffId?: number;
  description?: string;
  bookingCode: number;

  refundedAmount: number;
  result: any;

  created_at?: Date;
  updated_at?: Date;
};

class CancelledHotels extends Model<CancelledBookingTypes> {
  declare id?: number;
  declare userId: number;

  declare updatedByStaffId?: number;
  declare description?: string;
  declare bookingCode: number;

  declare refundedAmount: number;
  declare result: any;

  declare created_at?: Date;
  declare updated_at?: Date;
};

CancelledHotels.init({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    allowNull: false,
    autoIncrement: true,
  },
  bookingCode: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  refundedAmount: {
    type: DataTypes.DECIMAL(20, 2),
    allowNull: true,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  updatedByStaffId: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  result: {
    type: DataTypes.JSON,
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
  tableName: 'cancelledhotels',
  timestamps: true,
  createdAt: "created_at",
  updatedAt: "updated_at"
});

// CancelledFlights.belongsTo(User, { foreignKey: 'userId', as: 'users', onDelete: "CASCADE", onUpdate: "CASCADE" });

export default CancelledHotels;