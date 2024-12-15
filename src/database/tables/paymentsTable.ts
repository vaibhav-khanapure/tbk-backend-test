import {Model, DataTypes} from 'sequelize';
import sequelize from '../../config/sql';

export interface paymentTypes {
 id?: string;
 RazorpayOrderId: string;
 RazorpayPaymentId: string;
 RazorpaySignature: string;

 userId: string;

 // paymentMethod, paymentFor = flightbooking, InvoiceId, InviceNo, Amount 
};

class Payments extends Model<paymentTypes> {
 declare id?: string;
 declare RazorpayOrderId: string;
 declare RazorpayPaymentId: string;
 declare RazorpaySignature: string;
 declare userId: string;
};

Payments.init({
 id: {
  type: DataTypes.UUID,
  primaryKey: true,
  defaultValue: DataTypes.UUIDV4,
 },
 RazorpayOrderId: {
  type: DataTypes.STRING,
  allowNull: false,
 },
 RazorpayPaymentId: {
  type: DataTypes.STRING,
  allowNull: false,
 },
 RazorpaySignature: {
  type: DataTypes.STRING,
  allowNull: false,
 },
 userId: {
  type: DataTypes.UUID,
  allowNull: false,
   // references: {
   //   model: User,
   //   key: 'id',
   // },
 },
},{
 sequelize,
 modelName: 'payments',
 timestamps: true,
});

// UserFareInfo.belongsTo(Users, { foreignKey: 'userId', as: 'users', onDelete: "CASCADE", onUpdate: "CASCADE" });

export default Payments;