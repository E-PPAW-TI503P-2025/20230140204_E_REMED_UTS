// app.js
const express = require('express');
const cors = require('cors');
const sequelize = require('./config/database');
const apiRoutes = require('./routes/api');
const Book = require('./models/book');
const BorrowLog = require('./models/borrowlog');

const app = express();
const PORT = 3000;

// Middleware dasar
app.use(cors());
app.use(express.json()); // Untuk membaca body JSON

// Routes
app.use('/api', apiRoutes);

// Sinkronisasi Database & Jalankan Server [cite: 38]
sequelize.sync({ force: false }) // force: false agar data tidak hilang saat restart
    .then(() => {
        console.log('Database connected & synchronized');
        app.listen(PORT, () => {
            console.log(`Server berjalan di http://localhost:${PORT}`);
        });
    })
    .catch(err => console.error('Gagal koneksi database:', err));