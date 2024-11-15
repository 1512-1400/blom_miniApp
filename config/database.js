// config/database.js
const { Sequelize } = require('sequelize');

const sequelize = new Sequelize('bloom_help_sheet', 'root', 'Jwa3ddRBZ6R1W1q7ei3qCp9j', {
  host: 'kamet.liara.cloud',
  port: 31024,
  dialect: 'mysql', // می‌توانید به جای postgres از mysql یا sqlite استفاده کنید
  logging: (msg) => {
    if (msg.includes('Executing')) return; // از نمایش لاگ‌های اجرای کوئری جلوگیری می‌کند
}
});

module.exports = sequelize;
