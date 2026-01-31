// routes/api.js
const express = require('express');
const router = express.Router();
const controller = require('../controllers/bookController');
const { isAdmin, isUser } = require('../middleware/auth');

// Public Routes [cite: 59-61]
router.get('/books', controller.getAllBooks);
router.get('/books/:id', controller.getBookById);

// Admin Routes (Butuh Header x-user-role: admin) [cite: 62-65]
router.post('/books', isAdmin, controller.createBook);
router.put('/books/:id', isAdmin, controller.updateBook);
router.delete('/books/:id', isAdmin, controller.deleteBook);


// User Routes (Butuh Header x-user-role: user) [cite: 66, 67]
router.post('/borrow', isUser, controller.borrowBook);

module.exports = router;