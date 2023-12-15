// database.js
const {
    Sequelize
} = require('sequelize');

const db = new Sequelize({
    dialect: 'mysql',
    host: process.env.DB_HOST || 'localhost',
    username: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_DATABASE || 'petrescue',
});

module.exports = db;