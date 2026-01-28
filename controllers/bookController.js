// controllers/bookController.js
const Book = require('../models/book');
const BorrowLog = require('../models/borrowlog');

// 1. Public: Lihat semua buku [cite: 60]
exports.getAllBooks = async (req, res) => {
    try {
        const books = await Book.findAll();
        res.json(books);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// 2. Public: Detail buku [cite: 61]
exports.getBookById = async (req, res) => {
    try {
        const book = await Book.findByPk(req.params.id);
        if (!book) return res.status(404).json({ message: 'Buku tidak ditemukan' });
        res.json(book);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// 3. Admin: Tambah Buku [cite: 63]
exports.createBook = async (req, res) => {
    try {
        const { title, author, stock } = req.body;
        const newBook = await Book.create({ title, author, stock });
        res.status(201).json(newBook);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// 4. Admin: Update Buku [cite: 64]
exports.updateBook = async (req, res) => {
    try {
        const { title, author, stock } = req.body;
        await Book.update({ title, author, stock }, { where: { id: req.params.id } });
        res.json({ message: 'Buku berhasil diupdate' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// 5. Admin: Hapus Buku [cite: 65]
exports.deleteBook = async (req, res) => {
    try {
        await Book.destroy({ where: { id: req.params.id } });
        res.json({ message: 'Buku berhasil dihapus' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// 6. User: Pinjam Buku (Fitur Utama) [cite: 67, 75]
exports.borrowBook = async (req, res) => {
    try {
        const { bookId, latitude, longitude } = req.body; // Ambil data lokasi [cite: 57, 72-74]
        const userId = req.userId; // Dari middleware

        // Cek stok buku
        const book = await Book.findByPk(bookId);
        if (!book) return res.status(404).json({ message: 'Buku tidak ditemukan' });
        if (book.stock < 1) return res.status(400).json({ message: 'Stok habis' });

        // Logic: Kurangi stok & Catat Log [cite: 75]
        book.stock -= 1;
        await book.save();

        const log = await BorrowLog.create({
            userId,
            bookId,
            latitude,
            longitude
        });

        res.json({ message: 'Peminjaman berhasil', data: log });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};