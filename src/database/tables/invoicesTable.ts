import { Model, DataTypes } from 'sequelize';
import sequelize from '../../config/sql';
import User from './usersTable';

interface InvoiceTypes {
  id?: string;
  InvoiceId: number;
  InvoiceNo: string;
  tbkAmount: number;
  tboAmount: number;
  userId: string;
};

class Invoices extends Model<InvoiceTypes> {
  public id!: string;
  public InvoiceNo!: string;
  public InvoiceId!: number;
  public tbkAmount!: number;
  public tboAmount!: number;
  public userId!: string;
  public user?: User;
};

Invoices.init({
  id: {
    type: DataTypes.STRING,
    primaryKey: true,
    defaultValue: DataTypes.UUIDV4,
  },
  InvoiceId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  InvoiceNo: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  tbkAmount: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  tboAmount: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    //     references: {
    //       model: User,
    //       key: 'id',
    //     },
  },
}, {
  sequelize,
  modelName: 'invoices',
  timestamps: true,
});

// Invoices.belongsTo(User, { foreignKey: 'userId', as: 'users' });

export default Invoices;