import { Model, DataTypes } from 'sequelize';
import sequelize from '../../config/sql';
import type { bookingData } from '../../types/HotelBookTypes';

interface CancellationPolicy {
    text: string;
    rules: {
        value: number;
        valueType: "Amount" | "Nights" | "Percentage";
        estimatedValue: number;
        start: string;
        end: string;
    }[];
};

interface HotelBookingTypes {
    id?: number;
    userId: number;

    bookingCode: string;
    TraceId: string;
    coins: number;

    InvoiceId: number;
    InvoiceNo: string;
    tbkAmount?: number | string;
    travclanAmount?: number | string;
    rateIds: string[];
    cancellationPolicies?: { room: string; cancellationPolicies: CancellationPolicy[]; }[];

    discount: number;
    markup: number;
    discountUpdatedByStaffId: number;

    bookingData: bookingData;
    bookingStatus?: string;

    serviceCharge?: number;
    IGST?: number;
    less?: number;

    created_at?: string;
    updated_at?: string;
};

class HotelBookings extends Model<HotelBookingTypes> {
    declare id?: number;
    declare userId: number;

    declare bookingCode: string;
    declare TraceId: string;
    declare coins: number;

    declare InvoiceId: number;
    declare InvoiceNo: string;
    declare tbkAmount?: number | string;
    declare travclanAmount?: number | string;

    declare rateIds: string[];
    declare cancellationPolicies?: { room: string; cancellationPolicies: CancellationPolicy[]; }[];

    declare discount: number;
    declare markup: number;
    declare discountUpdatedByStaffId: number;

    declare bookingData: bookingData;
    declare bookingStatus?: string;

    declare serviceCharge: number;
    declare IGST: number;
    declare less: number;

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
    TraceId: {
        type: DataTypes.TEXT,
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
    travclanAmount: {
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
    coins: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        allowNull: true
    },
    discountUpdatedByStaffId: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    bookingData: {
        type: DataTypes.JSON,
        allowNull: false
    },
    rateIds: {
        type: DataTypes.JSON,
        allowNull: true
    },
    cancellationPolicies: {
        type: DataTypes.JSON,
        allowNull: true
    },
    bookingStatus: {
        type: DataTypes.STRING,
        allowNull: false
    },
    serviceCharge: {
        type: DataTypes.DECIMAL(20, 2),
        allowNull: true,
    },
    IGST: {
        type: DataTypes.DECIMAL(20, 2),
        allowNull: true,
    },
    less: {
        type: DataTypes.DECIMAL(20, 2),
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