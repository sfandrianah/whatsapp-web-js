const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const HistorySendMessages = sequelize.define('HistorySendMessages', {
    uuid: {
        type: DataTypes.UUID,
        allowNull: false,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4
    },
    from_number: {
        type: DataTypes.NUMBER,
        allowNull: false
    },
    to_number: {
        type: DataTypes.NUMBER,
        allowNull: false
    },
    messages: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    device_id: {
        type: DataTypes.BIGINT,
        allowNull: true
    },
    image_type: {
        type: DataTypes.STRING,
        allowNull: true
    },
    image_value: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    err_messages: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    createdAt: {
        field: "created_at",
        allowNull: true,
        type: DataTypes.DATE,
    },
    updatedAt: {
        field: "updated_at",
        allowNull: false,
        type: DataTypes.DATE,
    },
}, {
    tableName: "history_send_messages"
});

module.exports = HistorySendMessages;