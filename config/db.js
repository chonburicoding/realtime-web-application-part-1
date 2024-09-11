const { Sequelize, QueryTypes } = require('sequelize');
const seq = new Sequelize('TEST', 'sa', '1234', {
    host: 'localhost',
    dialect: 'mssql',
    logging: false
})

module.exports = { seq, QueryTypes }