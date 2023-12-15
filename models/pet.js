// pet.js
const {
    DataTypes
} = require('sequelize');
const db = require('../config/database');

const Pet = db.define('Pet', {
    name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    type: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    gender: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    date: {
        type: DataTypes.DATE,
        allowNull: false,
    },
    image_url: {
        type: DataTypes.STRING,
    },
    description: {
        type: DataTypes.TEXT,
    },
    lost: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
    },
    reward: {
        type: DataTypes.INTEGER,
    },
});

module.exports = Pet;