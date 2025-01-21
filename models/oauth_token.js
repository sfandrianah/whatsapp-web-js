const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const OauthToken = sequelize.define('OauthToken', {
    type: {
        type: DataTypes.STRING,
        allowNull: false
    },
    token: {
        type: DataTypes.STRING
    },
    createdAt: {
        field: "created_at",
        allowNull: false,
        type: DataTypes.DATE,
    },
    updatedAt: {
        field: "updated_at",
        allowNull: false,
        type: DataTypes.DATE,
    },
}, {
    tableName: "oauth_token"
});

module.exports = OauthToken;