const API_URL = 'http://localhost:3000/api';
let currentRole = 'guest'; 
let currentUserId = 850; 
let allBooks = []; 

document.addEventListener('DOMContentLoaded', () => {
    changeRole('guest'); // Default saat pertama buka
    fetchBooks();
});

// --- NAVIGATION ---
function showSection(sectionId) {
    document.querySelectorAll('.view-section').forEach(el => el.classList.remove('active'));
    document.getElementById(`view-${sectionId}`).classList.add('active');
    if (sectionId === 'books') fetchBooks();
}

// --- ROLE MANAGEMENT (UPDATED) ---
function changeRole(role) {
    currentRole = role;
    
    // Update Text UI
    const displayRole = role.toUpperCase();
    document.getElementById('currentRoleDisplay').innerText = displayRole;
    document.getElementById('dashboard-role-text').innerText = displayRole;
    document.getElementById('dashboard-user-id').innerText = (role === 'guest') ? '-' : currentUserId;

    // 1. LOGIKA DASHBOARD: Sembunyikan/Tampilkan Kartu Geolocation
    // Kartu Geo hanya muncul jika role adalah USER
    const cardGeo = document.getElementById('card-geo');
    if (role === 'user') {
        cardGeo.style.display = 'block';  // User butuh fitur pinjam
    } else {
        cardGeo.style.display = 'none';   // Admin & Guest tidak butuh fitur pinjam di dashboard
    }

    // 2. Tombol Add Book (Hanya Admin)
    const btnAdd = document.getElementById('btn-add-new');
    if (role === 'admin') btnAdd.classList.remove('d-none');
    else btnAdd.classList.add('d-none');

    fetchBooks(); // Refresh tampilan buku sesuai role baru
    
    Swal.mixin({ toast: true, position: 'top-end', showConfirmButton: false, timer: 2000 })
        .fire({ icon: 'success', title: `Switched to ${displayRole}` });
}

// --- DATA FETCHING ---
async function fetchBooks() {
    try {
        const res = await fetch(`${API_URL}/books`);
        allBooks = await res.json();
        renderBooksGrid(allBooks);
        updateStats(allBooks);
    } catch (error) { console.error("Error fetching books:", error); }
}

function updateStats(books) {
    let available = 0, outStock = 0, totalCopies = 0;
    books.forEach(b => {
        totalCopies += b.stock;
        if (b.stock > 0) available++; else outStock++;
    });
    document.getElementById('stat-total').innerText = books.length;
    document.getElementById('stat-available').innerText = available;
    document.getElementById('stat-out').innerText = outStock;
    document.getElementById('stat-copies').innerText = totalCopies;
}

// --- RENDER BOOKS (LOGIKA UTAMA TOMBOL) ---
function renderBooksGrid(books) {
    const container = document.getElementById('books-grid');
    container.innerHTML = '';

    if (books.length === 0) {
        container.innerHTML = '<div class="col-12 text-center text-muted py-5">No books available.</div>';
        return;
    }

    books.forEach(book => {
        const stockBadge = book.stock > 0 
            ? `<span class="badge-stock text-white bg-success"><i class="fas fa-check me-1"></i> ${book.stock} available</span>`
            : `<span class="badge-stock text-white bg-danger"><i class="fas fa-times me-1"></i> Out of stock</span>`;

        let actionButtons = '';

        // --- PEMISAHAN LOGIKA TOMBOL ---
        if (currentRole === 'admin') {
            // ADMIN: Edit & Delete
            actionButtons = `
                <div class="d-flex gap-2 justify-content-end">
                    <button class="btn btn-warning btn-sm" onclick="showEditForm(${book.id})"><i class="fas fa-edit"></i></button>
                    <button class="btn btn-outline-danger btn-sm" onclick="deleteBook(${book.id})"><i class="fas fa-trash-alt"></i></button>
                </div>
            `;
        } else if (currentRole === 'user') {
            // USER: Details & Borrow
            actionButtons = `
                 <div class="d-flex gap-2">
                    <button class="btn btn-outline-primary btn-sm flex-grow-1" onclick="showDetail(${book.id})">Details</button>
                    <button class="btn btn-success btn-sm flex-grow-1 ${book.stock < 1 ? 'disabled' : ''}" onclick="openBorrowPage(${book.id})">
                        Borrow
                    </button>
                 </div>
            `;
        } else {
            // GUEST: HANYA DETAILS (Sesuai permintaan)
            actionButtons = `
                <div class="d-grid">
                    <button class="btn btn-outline-primary btn-sm" onclick="showDetail(${book.id})"><i class="fas fa-eye me-1"></i> Details</button>
                </div>
            `;
        }

        const card = `
            <div class="col-md-6 col-lg-4">
                <div class="card h-100 book-card">
                    <div class="card-body">
                        <div class="d-flex justify-content-between align-items-start mb-2">
                            <h5 class="card-title fw-bold text-dark mb-0 text-truncate">${book.title}</h5>
                            ${currentRole === 'admin' ? '<span class="badge bg-dark">#'+book.id+'</span>' : ''}
                        </div>
                        <p class="text-muted small mb-3"><i class="fas fa-user-edit me-1"></i> ${book.author}</p>
                        <div class="mb-3 text-center py-2 bg-light rounded">${stockBadge}</div>
                        <div class="pt-2 border-top">${actionButtons}</div>
                    </div>
                </div>
            </div>
        `;
        container.innerHTML += card;
    });
}

// --- DETAILS & ACTIONS ---
function showDetail(id) {
    const book = allBooks.find(b => b.id === id);
    if (!book) return;

    document.getElementById('detail-title').innerText = book.title;
    document.getElementById('detail-author').innerText = book.author;
    document.getElementById('detail-id').innerText = book.id;
    document.getElementById('detail-stock').innerText = book.stock;

    const badge = document.getElementById('detail-badge');
    const btnBorrow = document.getElementById('btn-borrow-detail');

    if (book.stock > 0) {
        badge.className = 'badge bg-success fs-6 mb-3'; badge.innerText = 'Available';
        btnBorrow.disabled = false; btnBorrow.onclick = () => openBorrowPage(book.id);
    } else {
        badge.className = 'badge bg-danger fs-6 mb-3'; badge.innerText = 'Out of Stock';
        btnBorrow.disabled = true;
    }

    // Hide all first
    document.getElementById('detail-admin-actions').classList.add('d-none');
    document.getElementById('detail-user-actions').classList.add('d-none');
    document.getElementById('detail-guest-actions').classList.add('d-none');

    // Show based on Role
    if (currentRole === 'admin') {
        document.getElementById('detail-admin-actions').classList.remove('d-none');
        document.getElementById('btn-edit-detail').onclick = () => showEditForm(book.id);
        document.getElementById('btn-delete-detail').onclick = () => deleteBook(book.id);
    } else if (currentRole === 'user') {
        document.getElementById('detail-user-actions').classList.remove('d-none');
    } else {
        // Guest lihat pesan "Login to borrow"
        document.getElementById('detail-guest-actions').classList.remove('d-none');
    }

    showSection('detail');
}

// --- FORMS (ADD/EDIT/DELETE) ---
function showAddForm() {
    document.getElementById('bookForm').reset();
    document.getElementById('form-book-id').value = '';
    document.getElementById('form-title').innerText = "Add New Book";
    showSection('form');
}

function showEditForm(id) {
    const book = allBooks.find(b => b.id === id);
    document.getElementById('form-book-id').value = book.id;
    document.getElementById('form-input-title').value = book.title;
    document.getElementById('form-input-author').value = book.author;
    document.getElementById('form-input-stock').value = book.stock;
    document.getElementById('form-title').innerText = "Edit Book";
    showSection('form');
}

document.getElementById('bookForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = document.getElementById('form-book-id').value;
    const body = JSON.stringify({
        title: document.getElementById('form-input-title').value,
        author: document.getElementById('form-input-author').value,
        stock: document.getElementById('form-input-stock').value
    });
    const url = id ? `${API_URL}/books/${id}` : `${API_URL}/books`;
    const method = id ? 'PUT' : 'POST';

    await fetch(url, { method, headers: { 'Content-Type': 'application/json', 'x-user-role': 'admin' }, body });
    Swal.fire('Saved!', '', 'success');
    showSection('books');
});

async function deleteBook(id) {
    const res = await Swal.fire({ title: 'Delete book?', icon: 'warning', showCancelButton: true });
    if (res.isConfirmed) {
        await fetch(`${API_URL}/books/${id}`, { method: 'DELETE', headers: { 'x-user-role': 'admin' } });
        fetchBooks();
        showSection('books');
    }
}

// --- BORROW (USER ONLY) ---
function openBorrowPage(bookId) {
    if (currentRole !== 'user') return;
    document.getElementById('borrowForm').reset();
    document.getElementById('borrow-book-id').value = bookId;
    document.getElementById('borrow-book-id-display').innerText = bookId;
    detectLocation();
    showSection('borrow');
}

function detectLocation() {
    const latIn = document.getElementById('borrow-lat');
    const longIn = document.getElementById('borrow-long');
    latIn.value = '...'; longIn.value = '...';
    
    if (!navigator.geolocation) return Swal.fire('Error', 'No Geo Support', 'error');
    
    navigator.geolocation.getCurrentPosition(
        (pos) => { latIn.value = pos.coords.latitude; longIn.value = pos.coords.longitude; },
        (err) => { latIn.value = ''; longIn.value = ''; Swal.fire('Error', 'Location Access Denied', 'error'); }
    );
}

document.getElementById('borrowForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const bookId = document.getElementById('borrow-book-id').value;
    const lat = document.getElementById('borrow-lat').value;
    const long = document.getElementById('borrow-long').value;

    if (!lat || lat === '...') return Swal.fire('Location needed!', '', 'warning');

    const res = await fetch(`${API_URL}/borrow`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-user-role': 'user', 'x-user-id': currentUserId },
        body: JSON.stringify({ bookId, latitude: lat, longitude: long })
    });
    
    if (res.ok) { Swal.fire('Borrowed!', '', 'success'); showSection('books'); }
    else Swal.fire('Failed', 'Stock Empty / Error', 'error');
});