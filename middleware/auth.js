// middleware/auth.js

// Middleware untuk cek apakah user adalah Admin [cite: 55, 62]
const isAdmin = (req, res, next) => {
    const role = req.headers['x-user-role'];
    if (role === 'admin') {
        next();
    } else {
        res.status(403).json({ message: 'Akses ditolak. Khusus Admin.' });
    }
};

// Middleware untuk cek apakah user adalah User biasa [cite: 56, 66]
const isUser = (req, res, next) => {
    const role = req.headers['x-user-role'];
    const userId = req.headers['x-user-id']; // Simulasi User ID [cite: 52]

    if (role === 'user' && userId) {
        req.userId = userId; // Simpan userId ke request agar bisa dipakai nanti
        next();
    } else {
        res.status(403).json({ message: 'Akses ditolak. Header role atau user-id salah.' });
    }
};

module.exports = { isAdmin, isUser };