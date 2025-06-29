import { Model, DataTypes } from 'sequelize';
import sequelize from '../../config/sql';

export interface paymentTypes {
    id?: number;
    userId: number;

    InvoiceNo?: string;
    Reason?: string;
    TransactionId?: string;
    OrderAmount?: string;
    PaidAmount?: string;
    PaymentMethod?: string;

    RazorpayOrderId: string;
    RazorpayPaymentId?: string;
    RazorpaySignature?: string;

    isUsed?: boolean;

    created_at?: string;
    updated_at?: string;
};

class Payments extends Model<paymentTypes> {
    declare id?: number;
    declare userId: number;

    declare InvoiceNo?: string;
    declare Reason?: string;
    declare TransactionId?: string;
    declare OrderAmount?: string;
    declare PaidAmount?: string;
    declare PaymentMethod?: string;

    declare RazorpayOrderId: string;
    declare RazorpayPaymentId?: string;
    declare RazorpaySignature?: string;

    declare isUsed?: boolean;

    declare created_at?: string;
    declare updated_at?: string;
};

Payments.init({
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
    },
    InvoiceNo: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    Reason: {
        type: DataTypes.TEXT,
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
        type: DataTypes.TEXT,
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
    isUsed: {
        type: DataTypes.BOOLEAN,
        allowNull: true
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
}, {
    sequelize,
    modelName: 'payments',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
});

export default Payments;