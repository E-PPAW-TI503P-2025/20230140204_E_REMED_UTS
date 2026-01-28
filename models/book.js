// models/book.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Book = sequelize.define('Book', {
    title: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: { notEmpty: true } // Validasi sederhana [cite: 83]
    },
    author: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: { notEmpty: true } // Validasi sederhana [cite: 83]
    },
    stock: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
    }
});

module.exports = Book;