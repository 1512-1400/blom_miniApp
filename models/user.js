const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const User = sequelize.define('User', {
    phone: { type: DataTypes.NUMBER },
    invite_count: { type: DataTypes.NUMBER },
}, {
    timestamps: true,
    tableName: 'pwa_users',
});

module.exports = User;
