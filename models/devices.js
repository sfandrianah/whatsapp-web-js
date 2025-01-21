const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Devices = sequelize.define('Devices', {
    value: {
        type: DataTypes.NUMBER,
        allowNull: true
    },
    oauth_token_id: {
        type: DataTypes.BIGINT,
        allowNull: true
    },
    sess_value: {
        type: DataTypes.STRING,
        allowNull: true
    },
    qrcode: {
        type: DataTypes.STRING,
        allowNull: true
    },
    ready: {
        type: DataTypes.NUMBER,
        allowNull: true
    },
    createdAt: {
        field: "created_at",
        allowNull: true,
        type: DataTypes.DATE,
    },
    updatedAt: {
        field: "updated_at",
        allowNull: true,
        type: DataTypes.DATE,
    },
}, {
    tableName: "devices"
});

module.exports = Devices;