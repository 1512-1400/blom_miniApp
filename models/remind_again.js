// models/Remind_again.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database'); // اتصال به دیتابیس

const Remind_again = sequelize.define('remind_me_again',
    {
        index: {
            type: DataTypes.INTEGER,
            primaryKey: true, // اضافه کردن این خط برای مشخص کردن id به عنوان کلید اصلی
            autoIncrement: true // در صورت نیاز برای افزایش خودکار مقدار id
        },
        "آیدی گیاه": {
            type: DataTypes.STRING,
        },
        "چت آیدی": {
            type: DataTypes.STRING,
        },
        "پیامرسان": {
            type: DataTypes.STRING,
        },
        "نام کاربر": {
            type: DataTypes.STRING,
        },
        "نام گیاه": {
            type: DataTypes.STRING,
        },
        "کد گیاه": {
            type: DataTypes.STRING,
        },
        "یاداوری": {
            type: DataTypes.STRING,
        },
        "یاداوری بعدی": {
            type: DataTypes.DATE,
        },
        "ساعت یادآوری": {
            type: DataTypes.NUMBER,
        },
        "کد پیام عکس": {
            type: DataTypes.STRING,
        },
        counter: {
            type: DataTypes.NUMBER,
        }
    }, {
    freezeTableName: true,
    timestamps: false
});

module.exports = Remind_again;
