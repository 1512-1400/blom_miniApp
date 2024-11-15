// models/Reminder.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Messages_log = sequelize.define('alldata',
    {
        index: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        "پیام ارسالی": {
            type: DataTypes.STRING,
        },
        "چت آیدی": {
            type: DataTypes.STRING,
        },
        "نام کاربر": {
            type: DataTypes.STRING,
        }
    }, {
    freezeTableName: true,
    timestamps: false
});

module.exports = Messages_log;
