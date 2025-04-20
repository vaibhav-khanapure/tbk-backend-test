import { Model, DataTypes } from 'sequelize';
import sequelize from '../../config/sql';

interface HotelBookingTypes {
    id?: number;
    userId: number;

    bookingCode: string;

    InvoiceId: number;
    InvoiceNo: string;
    tbkAmount?: number | string;
    tboAmount?: number | string;

    discount: number;
    markup: number;
    discountUpdatedByStaffId: number;

    created_at?: string;
    updated_at?: string;
};

class HotelBookings extends Model<HotelBookingTypes> {
    declare id?: number;
    declare userId: number;

    declare bookingCode: string;

    declare InvoiceId: number;
    declare InvoiceNo: string;
    declare tbkAmount?: number | string;
    declare tboAmount?: number | string;

    declare discount: number;
    declare markup: number;
    declare discountUpdatedByStaffId: number;

    declare created_at?: string;
    declare updated_at?: string;
};

HotelBookings.init({
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
    },
    bookingCode: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    InvoiceNo: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    InvoiceId: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    tboAmount: {
        type: DataTypes.DECIMAL(20, 2),
        allowNull: false,
    },
    tbkAmount: {
        type: DataTypes.DECIMAL(20, 2),
        allowNull: false,
    },
    discount: {
        type: DataTypes.DECIMAL(20, 2),
        allowNull: true,
    },
    markup: {
        type: DataTypes.DECIMAL(20, 2),
        allowNull: true,
    },
    discountUpdatedByStaffId: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
}, {
    sequelize,
    modelName: 'hotelbookings',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
});

export default HotelBookings;