// models/Reminder.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database'); // اتصال به دیتابیس

const Reminder = sequelize.define('new_version',
    {
        index: {
            type: DataTypes.INTEGER,
            primaryKey: true, // اضافه کردن این خط برای مشخص کردن id به عنوان کلید اصلی
            autoIncrement: true // در صورت نیاز برای افزایش خودکار مقدار id
        },
        row_number: {
            type: DataTypes.NUMBER,
        },
        plant_id: {
            type: DataTypes.STRING,
        },
        chat_id: {
            type: DataTypes.STRING,
        },
        messenger: {
            type: DataTypes.STRING,
        },
        "نام کاربر": {
            type: DataTypes.STRING,
        },
        plant_name: {
            type: DataTypes.STRING,
        },
        plant_code: {
            type: DataTypes.STRING,
        },
        remind: {
            type: DataTypes.STRING,
        },
        next_remind: {
            type: DataTypes.DATE,
        },
        "فواصل یاداوری": {
            type: DataTypes.NUMBER,
        },
        today: {
            type: DataTypes.DATE,
        },
        "ساعت یادآوری": {
            type: DataTypes.NUMBER,
        },
        image_message_code: {
            type: DataTypes.STRING,
        },
        "بازخورد خاک": {
            type: DataTypes.STRING,
        },
        counter: {
            type: DataTypes.NUMBER,
        },
        "یادآوری سم  و کود": {
            type: DataTypes.NUMBER,
        },
        plant_situation: {
            type: DataTypes.STRING,
        },
        days_until_next_remind: {
            type: DataTypes.STRING,
        },
        my_garden_message: {
            type: DataTypes.STRING,
        },
        "کود_مناسب": {
            type: DataTypes.STRING,
        },
        UPDATE_ON: {
            type: DataTypes.STRING,
        },
        "یادآوری_چکاپ_ماهیانه": {
            type: DataTypes.NUMBER,
        },
    }, {
    freezeTableName: true,
    timestamps: false
});

module.exports = Reminder;
