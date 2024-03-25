require('dotenv').config();

const Sequelize = require('sequelize');

const sequelize = new Sequelize(process.env.database, process.env.user, process.env.password,
     {dialect: 'mysql', host: process.env.host})

module.exports = sequelize;