// MediLab Application - Backend API Version
const API_BASE = 'http://localhost:5000/api';

// ─── Global Loader ─────────────────────────────────────────
function initGlobalLoader() {
    if (document.getElementById('globalLoader')) return;
    const loaderHTML = `
        <div id="globalLoader" class="global-loader">
            <div class="loader-spinner"></div>
            <div class="loader-text">LOADING...</div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', loaderHTML);
}

function showLoader(text = 'LOADING...') {
    const loader = document.getElementById('globalLoader');
    if (loader) {
        loader.querySelector('.loader-text').innerText = text;
        loader.classList.add('active');
    }
}

function hideLoader() {
    const loader = document.getElementById('globalLoader');
    if (loader) loader.classList.remove('active');
}

// ─── API Helper ──────────────────────────────────────────
async function apiCall(endpoint, options = {}) {
    showLoader('PROCESSING...');
    try {
        const token = localStorage.getItem('medilab_token');
        const headers = { ...options.headers };
        if (token) headers['Authorization'] = `Bearer ${token}`;
        if (!(options.body instanceof FormData)) headers['Content-Type'] = 'application/json';
        const res = await fetch(`${API_BASE}${endpoint}`, { ...options, headers });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Request failed');
        return data;
    } finally {
        hideLoader();
    }
}

// ─── Session Manager ─────────────────────────────────────
class SessionManager {
    static setUser(user, token) {
        localStorage.setItem('medilab_user', JSON.stringify(user));
        if (token) localStorage.setItem('medilab_token', token);
    }
    static getUser() {
        const u = localStorage.getItem('medilab_user');
        return u ? JSON.parse(u) : null;
    }
    static clearUser() {
        localStorage.removeItem('medilab_user');
        localStorage.removeItem('medilab_token');
    }
    static isLoggedIn() { return !!this.getUser(); }
    static getUserRole() { const u = this.getUser(); return u ? u.role : null; }
}

// ─── Validation ──────────────────────────────────────────
const VALIDATION_PATTERNS = {
    email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    password: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[a-zA-Z\d@$!%*?&]{8,}$/,
    phone: /^[0-9]{10}$/,
    name: /^[a-zA-Z ]{2,50}$/
};

function validateInput(value, pattern, field) {
    if (!pattern.test(value)) { showAlert(`Invalid ${field}!`, 'danger'); return false; }
    return true;
}

function sanitizeInput(input) {
    const div = document.createElement('div');
    div.textContent = input;
    return div.innerHTML;
}

function validateGST(gst) { return /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(gst); }

// ─── Alert ───────────────────────────────────────────────
function showAlert(message, type) {
    const alertDiv = document.createElement('div');
    const icons = { success: '✓', danger: '✕', warning: '⚠', info: 'ℹ' };
    alertDiv.className = `alert alert-${type} alert-dismissible fade show alert-animated`;
    alertDiv.innerHTML = `<span class="alert-icon">${icons[type]}</span> ${sanitizeInput(message)}<button type="button" class="close" data-dismiss="alert">&times;</button>`;
    document.body.insertBefore(alertDiv, document.body.firstChild);
    setTimeout(() => { alertDiv.classList.add('alert-removing'); setTimeout(() => alertDiv.remove(), 300); }, 4000);
}

// ─── Mobile Menu ─────────────────────────────────────────
function initializeMobileMenu() {
    const sidebar = document.querySelector('.sidebar');
    const toggle = document.querySelector('.sidebar-toggle');
    if (!toggle || !sidebar) return;
    if (!document.querySelector('.mobile-overlay')) {
        const overlay = document.createElement('div');
        overlay.className = 'mobile-overlay';
        document.body.appendChild(overlay);
    }
    const overlay = document.querySelector('.mobile-overlay');
    toggle.addEventListener('click', (e) => { e.stopPropagation(); sidebar.classList.toggle('active'); toggle.classList.toggle('active'); overlay.classList.toggle('active'); });
    overlay.addEventListener('click', () => { sidebar.classList.remove('active'); toggle.classList.remove('active'); overlay.classList.remove('active'); });
    sidebar.querySelectorAll('a').forEach(link => link.addEventListener('click', () => { sidebar.classList.remove('active'); toggle.classList.remove('active'); overlay.classList.remove('active'); }));
    sidebar.addEventListener('click', (e) => e.stopPropagation());
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') { sidebar.classList.remove('active'); toggle.classList.remove('active'); overlay.classList.remove('active'); } });
}

// ─── Toggle Lab Fields ──────────────────────────────────
function toggleLabFields() {
    const role = document.getElementById('roleSelect')?.value;
    const labFields = document.getElementById('labFields');
    if (labFields) labFields.style.display = role === 'Admin' ? 'block' : 'none';
}

// ─── Register ────────────────────────────────────────────
async function register(event) {
    event.preventDefault();
    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const role = document.getElementById('roleSelect')?.value || 'Patient';

    if (!validateInput(name, VALIDATION_PATTERNS.name, 'Name')) return;
    if (!validateInput(email, VALIDATION_PATTERNS.email, 'Email')) return;
    if (!validateInput(password, VALIDATION_PATTERNS.password, 'Password (min 8, upper, lower, number, special)')) return;

    const body = { name, email, password, role };

    if (role === 'Admin') {
        body.labName = document.getElementById('labName')?.value.trim();
        body.labLocation = document.getElementById('labLocation')?.value.trim();
        body.labGST = document.getElementById('labGST')?.value.trim();
        body.labIdNumber = document.getElementById('labId')?.value.trim();
        body.labPhone = document.getElementById('labPhone')?.value.trim();
        body.labProfile = document.getElementById('labProfile')?.value.trim();
        if (!body.labName) { showAlert('Lab name required!', 'warning'); return; }
        if (!body.labLocation) { showAlert('Lab location required!', 'warning'); return; }
        if (body.labGST && !validateGST(body.labGST)) { showAlert('Invalid GST!', 'warning'); return; }
    }

    try {
        const data = await apiCall('/auth/register', { method: 'POST', body: JSON.stringify(body) });
        showAlert('✓ Registration successful! Redirecting...', 'success');
        setTimeout(() => window.location.href = 'login.html', 1500);
    } catch (err) { showAlert(err.message, 'danger'); }
}

// ─── Login ───────────────────────────────────────────────
async function login(event) {
    event.preventDefault();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    if (!email || !password) { showAlert('Email and password required!', 'warning'); return; }

    try {
        const data = await apiCall('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) });
        SessionManager.setUser(data.user, data.token);
        showAlert('✓ Login successful!', 'success');
        setTimeout(() => window.location.href = 'dashboard.html', 1000);
    } catch (err) { showAlert(err.message, 'danger'); }
}

// ─── Logout ──────────────────────────────────────────────
function logout() { 
    SessionManager.clearUser(); 
    showLoader('LOGGING OUT...');
    setTimeout(() => { window.location.href = 'index.html'; }, 800);
}

// ─── Load Dashboard ──────────────────────────────────────
async function loadDashboard() {
    const user = SessionManager.getUser();
    if (!user) { window.location.href = 'index.html'; return; }
    const labInfo = user.role === 'Admin' ? ' (Lab Admin)' : '';
    document.getElementById('welcome').innerHTML = `<i class="fas fa-user-md"></i> Welcome, ${user.name}${labInfo}!`;

    try {
        const data = await apiCall('/dashboard/stats');
        const s = data.stats;
        if (user.role === 'Admin') {
            document.getElementById('patientDashboard').style.display = 'none';
            document.getElementById('adminDashboard').style.display = 'block';
            const li = document.getElementById('labInfo');
            if (li) li.innerText = `Managing: ${s.labName || 'Lab Admin'}`;
            const pe = document.getElementById('pendingBookings'); if (pe) pe.innerText = s.pendingBookings;
            const aa = document.getElementById('adminApprovedBookings'); if (aa) aa.innerText = s.approvedBookings;
            const ac = document.getElementById('adminCompletedBookings'); if (ac) ac.innerText = s.completedBookings;
            const tr = document.getElementById('totalReports'); if (tr) tr.innerText = s.totalReports;
        } else {
            document.getElementById('patientDashboard').style.display = 'block';
            document.getElementById('adminDashboard').style.display = 'none';
            const tb = document.getElementById('totalBookings'); if (tb) tb.innerText = s.totalBookings;
            const ab = document.getElementById('approvedBookings'); if (ab) ab.innerText = s.approvedBookings;
            const cb = document.getElementById('completedBookings'); if (cb) cb.innerText = s.completedBookings;
        }
    } catch (err) { console.error('Dashboard error:', err); }
}

// ─── Load Lab Options ────────────────────────────────────
async function loadLabOptions(selectId) {
    const select = document.getElementById(selectId);
    if (!select) return;
    try {
        const data = await apiCall('/labs');
        select.innerHTML = '<option value="">Select Lab</option>';
        data.labs.forEach(lab => {
            const opt = document.createElement('option');
            opt.value = lab.id;
            opt.textContent = lab.name + (lab.location ? ` - ${lab.location}` : '');
            select.appendChild(opt);
        });
    } catch (err) { console.error('Load labs error:', err); }
}

// ─── Book Test ───────────────────────────────────────────
async function bookTest(event) {
    event.preventDefault();
    const user = SessionManager.getUser();
    if (!user) { window.location.href = 'index.html'; return; }

    const testName = document.getElementById('testName').value.trim();
    const labId = document.getElementById('labSelect').value;
    const patientName = document.getElementById('patientName') ? document.getElementById('patientName').value.trim() : user.name;
    
    if (!testName || testName.length < 3) { showAlert('Test name must be at least 3 chars!', 'warning'); return; }
    if (!labId) { showAlert('Please select a lab.', 'warning'); return; }
    if (!patientName) { showAlert('Patient name is required.', 'warning'); return; }

    try {
        await apiCall('/bookings', { method: 'POST', body: JSON.stringify({ labId, testName, patientName }) });
        showAlert('✓ Test booked!', 'success');
        setTimeout(() => window.location.href = 'bookings.html', 1500);
    } catch (err) { showAlert(err.message, 'danger'); }
}

// ─── Load Bookings ───────────────────────────────────────
async function loadBookings() {
    const user = SessionManager.getUser();
    if (!user) { window.location.href = 'index.html'; return; }
    const tableBody = document.getElementById('bookingsTable');
    if (!tableBody) return;

    try {
        const data = await apiCall('/bookings');
        tableBody.innerHTML = '';
        if (!data.bookings.length) { tableBody.innerHTML = '<tr><td colspan="6" class="text-center text-muted">No bookings found</td></tr>'; return; }

        data.bookings.forEach(b => {
            const date = new Date(b.bookingDate || b.booking_date).toLocaleDateString('en-IN');
            const labName = b.labId?.name || b.labs?.name || 'N/A';
            const bid = b.id || b._id;
            let statusCell = `<span class="badge badge-${b.status === 'Pending' ? 'warning' : b.status === 'Approved' ? 'success' : 'info'}">${b.status}</span>`;
            if (user.role === 'Admin') {
                statusCell = `<select class="form-control form-control-sm" onchange="updateBookingStatus('${bid}', this.value)">
                    <option value="Pending" ${b.status === 'Pending' ? 'selected' : ''}>Pending</option>
                    <option value="Approved" ${b.status === 'Approved' ? 'selected' : ''}>Approved</option>
                    <option value="Completed" ${b.status === 'Completed' ? 'selected' : ''}>Completed</option>
                </select>`;
            }
            tableBody.innerHTML += `<tr class="booking-row" data-status="${b.status}">
                <td><strong>#${String(bid).slice(-6)}</strong></td>
                <td>${b.patientName || b.patient_name}</td><td>${b.testName || b.test_name}</td>
                <td>${labName}</td><td>${date}</td><td>${statusCell}</td></tr>`;
        });
    } catch (err) { showAlert(err.message, 'danger'); }
}

// ─── Update Booking Status ───────────────────────────────
async function updateBookingStatus(bookingId, newStatus) {
    try {
        await apiCall(`/bookings/${bookingId}/status`, { method: 'PUT', body: JSON.stringify({ status: newStatus }) });
        showAlert('Status updated!', 'success');
        loadBookings();
    } catch (err) { showAlert(err.message, 'danger'); }
}

// ─── Load Reports ────────────────────────────────────────
async function loadReports() {
    const user = SessionManager.getUser();
    if (!user) { window.location.href = 'index.html'; return; }
    const tableBody = document.getElementById('reportsTable');
    if (!tableBody) return;

    try {
        const data = await apiCall('/reports');
        tableBody.innerHTML = '';
        if (!data.reports.length) { tableBody.innerHTML = '<tr><td colspan="5" class="text-center text-muted">No reports found</td></tr>'; return; }

        data.reports.forEach(r => {
            const rid = r.id || r._id;
            const testName = r.bookingId?.testName || r.bookings?.test_name || 'N/A';
            const labName = r.bookingId?.labId?.name || r.bookings?.labs?.name || 'N/A';
            const patName = r.bookingId?.patientName || r.bookings?.patient_name || 'N/A';
            tableBody.innerHTML += `<tr>
                <td>${String(rid).slice(-6)}</td><td>${patName}</td>
                <td>${testName}</td><td>${labName}</td>
                <td><button class="btn btn-sm btn-primary" onclick="viewReport('${rid}')"><i class="fas fa-eye"></i> View</button>
                ${(r.filePath || r.file_path) ? `<a href="/api/reports/${rid}/download" class="btn btn-sm btn-success ml-1"><i class="fas fa-download"></i></a>` : ''}</td></tr>`;
        });
    } catch (err) { showAlert(err.message, 'danger'); }
}

// ─── View Report ─────────────────────────────────────────
async function viewReport(reportId) {
    try {
        const data = await apiCall(`/reports/${reportId}`);
        const r = data.report;
        alert(`Report\n\nTest: ${r.bookingId?.testName || 'N/A'}\nResults: ${r.results || 'See attached file'}\nNotes: ${r.notes || 'None'}`);
    } catch (err) { showAlert(err.message, 'danger'); }
}

// ─── Upload Report ───────────────────────────────────────
async function uploadReport(event) {
    event.preventDefault();
    const user = SessionManager.getUser();
    if (!user || user.role !== 'Admin') { showAlert('Access denied!', 'danger'); return; }

    const bookingId = document.getElementById('bookingId').value;
    const fileInput = document.getElementById('reportFile');
    if (!bookingId) { showAlert('Select a booking!', 'warning'); return; }

    const formData = new FormData();
    formData.append('bookingId', bookingId);
    formData.append('results', 'Report uploaded via file');
    if (fileInput?.files[0]) formData.append('reportFile', fileInput.files[0]);

    try {
        const token = localStorage.getItem('medilab_token');
        const res = await fetch(`${API_BASE}/reports`, {
            method: 'POST', headers: { 'Authorization': `Bearer ${token}` }, body: formData
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);
        showAlert('✓ Report uploaded!', 'success');
        setTimeout(() => window.location.href = 'reports.html', 1500);
    } catch (err) { showAlert(err.message, 'danger'); }
}

// ─── Load Upload Reports (Admin) ─────────────────────────
async function loadUploadReports() {
    const user = SessionManager.getUser();
    if (!user || user.role !== 'Admin') { window.location.href = 'dashboard.html'; return; }

    try {
        const data = await apiCall('/bookings?status=Approved');
        const select = document.getElementById('bookingId');
        if (!select) return;
        select.innerHTML = '<option value="">Select Booking</option>';
        data.bookings.forEach(b => {
            const bid = b.id || b._id;
            select.innerHTML += `<option value="${bid}">ID: ${String(bid).slice(-6)} - ${b.patientName || b.patient_name} - ${b.testName || b.test_name}</option>`;
        });
    } catch (err) { console.error(err); }
}

// ─── View Bookings by Status ─────────────────────────────
async function viewBookingsByStatus(status) {
    try {
        const url = status === 'All' ? '/bookings' : `/bookings?status=${status}`;
        const data = await apiCall(url);
        document.getElementById('bookingViewLabel').innerText = status === 'All' ? 'All Bookings' : `${status} Bookings`;
        const tableBody = document.getElementById('bookingViewTableBody');
        tableBody.innerHTML = '';
        if (!data.bookings.length) {
            tableBody.innerHTML = '<tr><td colspan="5" class="text-center text-muted">No bookings found</td></tr>';
        } else {
            data.bookings.forEach(b => {
                const bid = b.id || b._id;
                const date = new Date(b.bookingDate || b.booking_date).toLocaleDateString('en-IN');
                const badge = `<span class="badge badge-${b.status === 'Pending' ? 'warning' : b.status === 'Approved' ? 'success' : 'info'}">${b.status}</span>`;
                tableBody.innerHTML += `<tr><td><strong>#${String(bid).slice(-6)}</strong></td><td>${b.testName || b.test_name}</td><td>${b.labId?.name || b.labs?.name || 'N/A'}</td><td>${badge}</td><td>${date}</td></tr>`;
            });
        }
        $('#bookingViewModal').modal('show');
    } catch (err) { showAlert(err.message, 'danger'); }
}

// ─── Auth Check ──────────────────────────────────────────
function checkAuth() {
    const user = SessionManager.getUser();
    const page = window.location.pathname.split('/').pop() || 'index.html';
    const publicPages = ['index.html', 'login.html', 'register.html', 'explore.html', ''];
    if (!user && !publicPages.includes(page)) {
        window.location.href = 'login.html';
    }
}

// ─── Sidebar ─────────────────────────────────────────────
function loadSidebar() {
    const user = SessionManager.getUser();
    if (!user) return;
    const sidebar = document.querySelector('.sidebar');
    if (!sidebar) return;
    let nav = `<h2><i class="fas fa-flask"></i> MediLab</h2>
        <a href="dashboard.html"><i class="fas fa-tachometer-alt"></i> Dashboard</a>`;
    if (user.role === 'Patient') nav += '<a href="book-test.html"><i class="fas fa-plus-circle"></i> Book Test</a>';
    nav += '<a href="bookings.html"><i class="fas fa-list"></i> Bookings</a><a href="reports.html"><i class="fas fa-file-medical"></i> Reports</a>';
    if (user.role === 'Admin') nav += '<a href="upload-reports.html"><i class="fas fa-upload"></i> Upload Report</a><a href="manage-tests.html"><i class="fas fa-flask"></i> Manage Tests</a>';
    nav += '<a href="javascript:void(0);" onclick="logout()"><i class="fas fa-sign-out-alt"></i> Logout</a>';
    sidebar.innerHTML = nav;
}

function goToPage(page) { 
    showLoader('REDIRECTING...');
    setTimeout(() => { window.location.href = page; }, 600);
}

// ─── Filter Bookings ─────────────────────────────────────
function filterBookings() {
    const searchInput = document.getElementById('searchBookings');
    const statusFilter = document.getElementById('statusFilter');
    if (!searchInput || !statusFilter) return;
    const searchTerm = searchInput.value.toLowerCase();
    const statusTerm = statusFilter.value;
    document.querySelectorAll('.booking-row').forEach(row => {
        const text = row.textContent.toLowerCase();
        const rowStatus = row.getAttribute('data-status');
        row.style.display = ((!searchTerm || text.includes(searchTerm)) && (!statusTerm || rowStatus === statusTerm)) ? '' : 'none';
    });
}

// ─── Test Management (Admin) ─────────────────────────────
async function loadAdminTests() {
    const user = SessionManager.getUser();
    if (!user || user.role !== 'Admin') return;
    const container = document.getElementById('adminTestsContainer');
    if (!container) return;

    try {
        const data = await apiCall('/tests/my-lab');
        let html = '<div class="row mb-3"><div class="col-md-12"><button class="btn btn-success" onclick="showTestForm()"><i class="fas fa-plus"></i> Add New Test</button></div></div><div class="row">';
        if (!data.tests.length) {
            html += '<div class="col-md-12"><p class="text-muted">No tests added yet.</p></div>';
        } else {
            data.tests.forEach(t => {
                const tName = t.testName || t.test_name;
                const tTime = t.turnaroundTime || t.turnaround_time;
                html += `<div class="col-md-6 col-lg-4 mb-3"><div class="card border-left-primary"><div class="card-body">
                    <h6 class="card-title"><i class="fas fa-flask"></i> ${tName}</h6>
                    <p class="card-text small"><strong>Category:</strong> ${t.category}<br><strong>Price:</strong> ₹${t.price}<br><strong>Turnaround:</strong> ${tTime}</p>
                    <button class="btn btn-sm btn-warning" onclick="showTestForm('${t.id}')"><i class="fas fa-edit"></i> Edit</button>
                    <button class="btn btn-sm btn-danger" onclick="deleteTest('${t.id}')"><i class="fas fa-trash"></i> Delete</button>
                </div></div></div>`;
            });
        }
        html += '</div>';
        container.innerHTML = html;
    } catch (err) { console.error(err); }
}

function showTestForm(testId = null) {
    let test = null;
    const buildForm = (t) => {
        const tName = t ? (t.testName || t.test_name) : '';
        const tTime = t ? (t.turnaroundTime || t.turnaround_time) : '';
        const formHTML = `
            <div class="form-group"><label>Test Name *</label><input type="text" id="testNameInput" class="form-control" value="${tName}" required></div>
            <div class="form-group"><label>Category *</label><select id="testCategoryInput" class="form-control">
                <option value="">Select</option>${['Haematology','Biochemistry','Immunology','Virology','Microbiology','Endocrinology','Cardiology','Other'].map(c => `<option value="${c}" ${t && t.category === c ? 'selected' : ''}>${c}</option>`).join('')}
            </select></div>
            <div class="form-group"><label>Price (₹) *</label><input type="number" id="testPriceInput" class="form-control" value="${t ? t.price : ''}" min="0"></div>
            <div class="form-group"><label>Turnaround *</label><select id="testTurnaroundInput" class="form-control">
                <option value="">Select</option>${['24 hours','48 hours','72 hours','1 week'].map(v => `<option value="${v}" ${t && tTime === v ? 'selected' : ''}>${v}</option>`).join('')}
            </select></div>
            <div class="form-group"><label>Description *</label><textarea id="testDescInput" class="form-control" rows="3">${t ? t.description : ''}</textarea></div>`;

        const modal = $(`<div class="modal fade" tabindex="-1"><div class="modal-dialog modal-lg"><div class="modal-content">
            <div class="modal-header"><h5>${t ? 'Edit Test' : 'Add New Test'}</h5><button class="close" data-dismiss="modal">&times;</button></div>
            <div class="modal-body">${formHTML}</div>
            <div class="modal-footer"><button class="btn btn-secondary" data-dismiss="modal">Cancel</button>
            <button class="btn btn-primary" onclick="saveTest('${t ? t.id : ''}')">${t ? 'Update' : 'Add'}</button></div>
        </div></div></div>`);
        $('body').append(modal);
        modal.modal('show');
        modal.on('hidden.bs.modal', () => modal.remove());
    };

    if (testId) {
        apiCall(`/tests/my-lab`).then(data => {
            test = data.tests.find(t => t.id === testId);
            buildForm(test);
        });
    } else { buildForm(null); }
}

async function saveTest(testId) {
    const body = {
        testName: document.getElementById('testNameInput').value.trim(),
        category: document.getElementById('testCategoryInput').value,
        price: parseFloat(document.getElementById('testPriceInput').value),
        turnaroundTime: document.getElementById('testTurnaroundInput').value,
        description: document.getElementById('testDescInput').value.trim()
    };
    if (!body.testName || !body.category || !body.price || !body.turnaroundTime) { showAlert('All fields required!', 'warning'); return; }

    try {
        if (testId) {
            await apiCall(`/tests/${testId}`, { method: 'PUT', body: JSON.stringify(body) });
            showAlert('✓ Test updated!', 'success');
        } else {
            await apiCall('/tests', { method: 'POST', body: JSON.stringify(body) });
            showAlert('✓ Test added!', 'success');
        }
        $('.modal').modal('hide');
        setTimeout(() => { loadAdminTests(); if (typeof loadManageTestsPage === 'function') loadManageTestsPage(); if (typeof updateTestStats === 'function') updateTestStats(); }, 500);
    } catch (err) { showAlert(err.message, 'danger'); }
}

async function deleteTest(testId) {
    if (!confirm('Delete this test?')) return;
    try {
        await apiCall(`/tests/${testId}`, { method: 'DELETE' });
        showAlert('✓ Test deleted!', 'success');
        loadAdminTests();
        if (typeof loadManageTestsPage === 'function') loadManageTestsPage();
        if (typeof updateTestStats === 'function') updateTestStats();
    } catch (err) { showAlert(err.message, 'danger'); }
}

// ─── Navbar Profile ──────────────────────────────────────
function loadNavbarProfile() {
    const user = SessionManager.getUser();
    if (!user) return;
    
    const navProfileName = document.getElementById('navProfileName');
    const menuProfileName = document.getElementById('menuProfileName');
    const menuProfileRole = document.getElementById('menuProfileRole');
    const navProfilePic = document.getElementById('navProfilePic');
    
    if (navProfileName) navProfileName.textContent = user.name;
    if (menuProfileName) menuProfileName.textContent = user.name;
    if (menuProfileRole) menuProfileRole.textContent = user.role;
    if (navProfilePic) navProfilePic.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=00f2fe&color=000`;
}

// ─── Family Management ─────────────────────────────────────
async function loadFamilyMembers() {
    const familyGrid = document.getElementById('familyGrid');
    if (!familyGrid) return;
    
    try {
        const data = await apiCall('/family');
        familyGrid.innerHTML = '';
        
        if (!data.family || data.family.length === 0) {
            familyGrid.innerHTML = '<div class="col-12 text-center text-muted"><p>No family members added yet.</p></div>';
            return;
        }

        data.family.forEach(member => {
            const memberCard = document.createElement('div');
            memberCard.className = 'col-md-4 mb-4';
            memberCard.innerHTML = `
                <div class="card border-left-info shadow-sm">
                    <div class="card-body text-center">
                        <img src="https://ui-avatars.com/api/?name=${encodeURIComponent(member.name)}&background=4facfe&color=fff" class="rounded-circle mb-3 border border-info" width="80" height="80">
                        <h5>${member.name}</h5>
                        <p class="text-muted small">${member.relation} • ${member.age} Years • ${member.blood_group || 'N/A'}</p>
                        <div class="btn-group mt-2">
                            <a href="book-test.html?patient=${encodeURIComponent(member.name)}" class="btn btn-sm btn-outline-primary"><i class="fas fa-calendar-plus"></i> Book Test</a>
                            <button class="btn btn-sm btn-outline-danger" onclick="deleteFamilyMember('${member.id}')"><i class="fas fa-trash"></i></button>
                        </div>
                    </div>
                </div>
            `;
            familyGrid.appendChild(memberCard);
        });
    } catch (err) {
        console.error(err);
        showAlert('Failed to load family members', 'danger');
    }
}

async function addFamilyMemberSubmit(event) {
    event.preventDefault();
    
    const body = {
        name: document.getElementById('famName').value,
        relation: document.getElementById('famRelation').value,
        age: document.getElementById('famAge').value,
        gender: document.getElementById('famGender').value,
        blood_group: document.getElementById('famBloodGroup').value
    };

    try {
        await apiCall('/family', {
            method: 'POST',
            body: JSON.stringify(body)
        });
        
        $('#addFamilyModal').modal('hide');
        document.getElementById('addFamilyForm').reset();
        showAlert('Member added successfully!', 'success');
        loadFamilyMembers();
    } catch (err) {
        showAlert(err.message, 'danger');
    }
}

async function deleteFamilyMember(id) {
    if (!confirm('Are you sure you want to remove this family member?')) return;
    try {
        await apiCall(`/family/${id}`, { method: 'DELETE' });
        showAlert('Family member removed!', 'success');
        loadFamilyMembers();
    } catch (err) {
        showAlert(err.message, 'danger');
    }
}

// ─── Profile Management ────────────────────────────────────
async function loadProfilePageData() {
    showLoader('LOADING PROFILE...');
    try {
        const data = await apiCall('/auth/me');
        const user = data.user;
        
        // Update Session in case anything changed
        SessionManager.setUser(user);
        
        document.getElementById('profileName').value = user.name || '';
        document.getElementById('profileEmail').value = user.email || '';
        document.getElementById('profilePhone').value = user.phone || '';
        if (user.gender) document.getElementById('profileGender').value = user.gender;
        if (user.blood_group) document.getElementById('profileBloodGroup').value = user.blood_group;
        if (user.dob) document.getElementById('profileDob').value = user.dob.split('T')[0];

        // Show lab details if Admin
        if (user.role === 'Admin' && user.labs) {
            document.getElementById('labDetailsSection').style.display = 'block';
            document.getElementById('labName').value = user.labs.name || '';
            document.getElementById('labLocation').value = user.labs.location || '';
            document.getElementById('labIdNum').value = user.labs.lab_id || '';
            document.getElementById('labGst').value = user.labs.gst_number || '';
        }
    } catch (err) {
        showAlert('Failed to load profile details.', 'danger');
    } finally {
        hideLoader();
    }
}

async function updateProfileSubmit(event) {
    event.preventDefault();
    const body = {
        name: document.getElementById('profileName').value,
        phone: document.getElementById('profilePhone').value,
        gender: document.getElementById('profileGender').value,
        blood_group: document.getElementById('profileBloodGroup').value,
        dob: document.getElementById('profileDob').value
    };

    try {
        await apiCall('/auth/profile', {
            method: 'PUT',
            body: JSON.stringify(body)
        });
        showAlert('Profile updated successfully!', 'success');
        
        // Refresh navbar profile
        loadNavbarProfile(); 
    } catch (err) {
        showAlert(err.message || 'Error updating profile', 'danger');
    }
}

// ─── Init ────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', function() {
    initGlobalLoader();
    checkAuth();
    loadSidebar();
    loadNavbarProfile();
    initializeMobileMenu();
    
    if (window.location.pathname.includes('family.html')) {
        loadFamilyMembers();
    }
    
    if (window.location.pathname.includes('profile.html')) {
        loadProfilePageData();
    }
    
    // Auto-fill patient name in book-test.html
    if (window.location.pathname.includes('book-test.html')) {
        const urlParams = new URLSearchParams(window.location.search);
        const patientNameParam = urlParams.get('patient');
        const patientNameInput = document.getElementById('patientName');
        if (patientNameInput) {
            patientNameInput.value = patientNameParam || (SessionManager.getUser() ? SessionManager.getUser().name : '');
        }
    }
    
    // Smooth page load effect
    showLoader('INITIALIZING...');
    setTimeout(hideLoader, 400);

    if (document.getElementById('welcome')) loadDashboard();
    if (document.getElementById('bookingsTable')) loadBookings();
    if (document.getElementById('reportsTable')) loadReports();
    if (document.getElementById('bookingId')) loadUploadReports();
    if (document.getElementById('labSelect')) loadLabOptions('labSelect');

    const searchInput = document.getElementById('searchBookings');
    const statusFilter = document.getElementById('statusFilter');
    if (searchInput) searchInput.addEventListener('input', filterBookings);
    if (statusFilter) statusFilter.addEventListener('change', filterBookings);
});
