import {Model, DataTypes} from 'sequelize';
import sequelize from '../../config/sql';

export interface paymentTypes {
 id?: string;
 InvoiceNo?: string;
 Reason?: string;
 TransactionId?: string;
 OrderAmount?: string;
 PaidAmount?: string;
 PaymentMethod?: string;

 RazorpayOrderId: string;
 RazorpayPaymentId?: string;
 RazorpaySignature?: string;

 createdAt?: string;
 updatedAt?: string;

 userId: string;
};

class Payments extends Model<paymentTypes> {
 declare id?: string;
 declare InvoiceNo?: string;
 declare Reason?: string;
 declare TransactionId?: string;
 declare Amount?: string;
 declare PaymentMethod?: string;

 declare RazorpayOrderId: string;
 declare RazorpayPaymentId: string;
 declare RazorpaySignature: string;

 declare createdAt?: string;
 declare updatedAt?: string;

 declare userId: string;
};

Payments.init({
 id: {
  type: DataTypes.UUID,
  primaryKey: true,
  defaultValue: DataTypes.UUIDV4,
 },
 InvoiceNo: {
  type: DataTypes.STRING,
  allowNull: true,
 },
 Reason: {
  type: DataTypes.STRING,
  allowNull: true,
 },
 OrderAmount: {
  type: DataTypes.DECIMAL(10, 2),
  allowNull: true,
 },
 PaymentMethod: {
  type: DataTypes.STRING,
  allowNull: true,
 },
 PaidAmount: {
  type: DataTypes.DECIMAL(10, 2),
  allowNull: true,
 },
 TransactionId: {
  type: DataTypes.STRING,
  allowNull: true,
 },
 RazorpayOrderId: {
  type: DataTypes.STRING,
  allowNull: false,
 },
 RazorpayPaymentId: {
  type: DataTypes.STRING,
  allowNull: true,
 },
 RazorpaySignature: {
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
},{
 sequelize,
 modelName: 'payments',
 timestamps: true,
});

// UserFareInfo.belongsTo(Users, { foreignKey: 'userId', as: 'users', onDelete: "CASCADE", onUpdate: "CASCADE" });

export default Payments;