import { Model, DataTypes } from 'sequelize';
import sequelize from '../../config/sql';
import User from './usersTable';

interface InvoiceTypes {
  id?: string;
//   invoiceId: string;
  totalAmount: number;
};

class Invoices extends Model<InvoiceTypes> {
  public id!: string;
//   public invoiceId!: string;
  public totalAmount!: string;
  public user?: User;
};

Invoices.init({
  id: {
    type: DataTypes.STRING,
    primaryKey: true,
    allowNull: false,
  },
  totalAmount: {
   type: DataTypes.INTEGER,
   allowNull: false, 
  },
//   userId: {
//     type: DataTypes.UUID,
//     allowNull: false,
//     references: {
//       model: User,
//       key: 'id',
//     },
//   },
}, {
  sequelize,
  modelName: 'invoices',
  timestamps: true,
});

// Invoices.belongsTo(User, { foreignKey: 'userId', as: 'users' });

export default Invoices;