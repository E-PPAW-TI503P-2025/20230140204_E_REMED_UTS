// config/database.js
const { Sequelize } = require('sequelize');

// Sesuaikan username dan password dengan MySQL Workbench Anda
const sequelize = new Sequelize('remedial_perpustakaan', 'root', 'gyan1234', {
    host: 'localhost',
    dialect: 'mysql',
    port: 3307
});

module.exports = sequelize;