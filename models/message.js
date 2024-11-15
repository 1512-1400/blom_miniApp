// models/Message.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Message = sequelize.define('Message', {
  "چت آیدی": {
    type: DataTypes.STRING,
    allowNull: false,
  },
  "پیام ارسالی": {
    type: DataTypes.STRING,
    allowNull: false,
  },
  "نام کاربر": {
    type: DataTypes.STRING,
    allowNull: false,
  },
  "نام گیاه": {
    type: DataTypes.STRING,
    allowNull: false,
  },
  "نام علمی": {
    type: DataTypes.STRING,
    allowNull: false,
  },
  "کد پیام": {
    type: DataTypes.STRING,
    allowNull: false,
  },
  "آخرین کد پیام": {
    type: DataTypes.STRING,
    allowNull: false,
  },
  "یادآوری بعدی": {
    type: DataTypes.STRING,
    allowNull: true,
  },
  "آفت شایع": {
    type: DataTypes.STRING,
    allowNull: true,
  },
  "نور مناسب": {
    type: DataTypes.STRING,
    allowNull: true,
  },
  "تقویتی مناسب": {
    type: DataTypes.STRING,
    allowNull: true,
  },
  "محل مناسب نگهداری گیاه": {
    type: DataTypes.STRING,
    allowNull: true,
  },
}, {
  freezeTableName: true,
  timestamps: false,
  tableName: 'show_result', // اطمینان حاصل کنید که نام جدول درست است
});

module.exports = Message;
