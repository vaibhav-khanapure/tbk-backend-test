import { Model, DataTypes } from 'sequelize';
import sequelize from '../../config/sql';

interface InvoiceTypes {
  id?: string;
  InvoiceId: number;
  InvoiceNo: string;
  tbkAmount: number;
  tboAmount: number;
  userId: string;
};

class Invoices extends Model<InvoiceTypes> {
 declare id?: string;
 declare InvoiceId: number;
 declare InvoiceNo: string;
 declare tbkAmount: number;
 declare tboAmount: number;
 declare userId: string;
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

// Invoices.belongsTo(User, { foreignKey: 'userId', as: 'users', onDelete: "CASCADE", onUpdate: "CASCADE" });

export default Invoices;