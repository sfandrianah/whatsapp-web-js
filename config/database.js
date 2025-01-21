const { Sequelize } = require('sequelize');

const sequelize = new Sequelize('tripoin_whatsapp_web', 'sfandrianah', 'fandrianah2', {
    host: 'localhost',
    dialect: 'mysql'
});

module.exports = sequelize;