// models/Reminder.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Dr_blom = sequelize.define('dr_blom_pwa',
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        userId: {
            type: DataTypes.INTEGER,
        },
        img: {
            type: DataTypes.STRING,
        },
        answer:{
            type: DataTypes.STRING,
        },
        done: {
            type: DataTypes.INTEGER,
        },
        showen: {
            type: DataTypes.INTEGER,
        },
    }, {
    freezeTableName: true,
    timestamps: false
});

module.exports = Dr_blom;
