import { Model, DataTypes } from 'sequelize';
import sequelize from '../../config/sql';

interface HeadlineAttributes {
    id?: number;

    name?: string;
    description?: string;
    updatedByStaffId?: number;

    userId?: number;
    groupId?: number;

    created_at?: string;
    updated_at?: string;
    deleted_at?: string;
};

class Headlines extends Model<HeadlineAttributes> {
    declare id?: string;

    declare name?: string;
    declare description?: string;
    declare updatedByStaffId?: number;

    declare userId?: number;
    declare groupId?: number;

    declare created_at?: string;
    declare updated_at?: string;
    declare deleted_at?: string;
};

Headlines.init({
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
    },
    name: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    groupId: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    updatedByStaffId: {
        type: DataTypes.INTEGER,
        allowNull: true,
    }
}, {
    sequelize,
    modelName: 'headlines',
    timestamps: true,
    paranoid: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    deletedAt: 'deleted_at'
});

export default Headlines;