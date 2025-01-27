import {Model, DataTypes} from 'sequelize';
import sequelize from '../../config/sql';

interface userBankDetailsTypes {
 id: number;
 userId: number;

 ReferenceId: string;
 Amount: number;
 photo: string;
 createdBy: string;
 updatedBy: string;
 paymentTransactionId: string;
 status: "Pending" | "Approved" | "Rejected";
 paymentMethod: string;
 remarks: string;
 description: string;

 createdAt?: string;
 updatedAt?: string;
};

class UserBankDetails extends Model<userBankDetailsTypes> {
 declare id: number;
 declare userId: number;

 declare ReferenceId: string;
 declare Amount: number;
 declare photo: string;
 declare createdBy: string;
 declare updatedBy: string;
 declare paymentTransactionId: string;
 declare status: "Pending" | "Approved" | "Rejected";
 declare paymentMethod: string;
 declare remarks: string;
 declare description: string;

 declare createdAt?: string;
 declare updatedAt?: string;
};

UserBankDetails.init({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
  },
  Amount: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  createdBy: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  paymentMethod: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  ReferenceId: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  photo: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  paymentTransactionId: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM("Pending", "Approved", "Rejected"),
    allowNull: true,
  },
  remarks: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  updatedBy: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
}, {
  sequelize,
  modelName: 'userbankdetails',
  timestamps: true,
});

export default UserBankDetails;