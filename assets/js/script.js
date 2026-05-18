// MediLab Application - Backend API Version
const API_BASE = 'https://medilab-jw45.onrender.com/api';

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

// --- Mobile Bottom Nav & Bot Injector ---
function initFuturisticUI() {
    const user = SessionManager.getUser();
    if (!user) return;

    // Inject Background Orbs
    if (!document.querySelector('.orb-1')) {
        document.body.insertAdjacentHTML('afterbegin', '<div class="bg-orb orb-1"></div><div class="bg-orb orb-2"></div>');
    }

    // Inject Mobile Bottom Nav
    if (!document.querySelector('.mobile-bottom-nav')) {
        const path = window.location.pathname;
        const bottomNavHTML = `
            <div class="mobile-bottom-nav">
                <a href="dashboard.html" class="${path.includes('dashboard') ? 'active' : ''}">
                    <i class="fas fa-home"></i><span>Home</span>
                </a>
                <a href="bookings.html" class="${path.includes('bookings') ? 'active' : ''}">
                    <i class="fas fa-calendar-alt"></i><span>Bookings</span>
                </a>
                <a href="reports.html" class="${path.includes('reports') ? 'active' : ''}">
                    <i class="fas fa-file-medical-alt"></i><span>Reports</span>
                </a>
                <a href="profile.html" class="${path.includes('profile') ? 'active' : ''}">
                    <i class="fas fa-user"></i><span>Profile</span>
                </a>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', bottomNavHTML);
    }

    // Inject MediBot FAB
    if (!document.querySelector('.medibot-fab')) {
        const botHTML = `
            <div class="medibot-fab" onclick="toggleMediBot()">
                <i class="fas fa-robot"></i>
            </div>
            <div id="medibotChat" class="card medibot-chat-panel" style="display:none; position:fixed; bottom:160px; right:25px; width:300px; z-index:1061; border-radius: 20px;">
                <div class="card-header bg-primary text-black d-flex justify-content-between align-items-center" style="border-radius: 20px 20px 0 0;">
                    <h6 class="mb-0 font-weight-bold"><i class="fas fa-robot"></i> MediBot AI</h6>
                    <button type="button" class="close text-black" onclick="toggleMediBot()">&times;</button>
                </div>
                <div class="card-body" style="max-height: 350px; overflow-y: auto; background: rgba(8,11,18,0.95);">
                    <div class="bot-msg mb-2">
                        <small class="text-primary font-weight-bold">MediBot:</small>
                        <p class="mb-0 text-white small">Hello! I'm your AI health assistant. How can I help you today?</p>
                    </div>
                    <div class="user-options d-flex flex-wrap gap-2 mt-3">
                        <button class="btn btn-xs btn-outline-primary mb-2 mr-1" style="font-size: 0.7rem; padding: 4px 8px;" onclick="botTalk('How to stay healthy?')">Healthy Tips</button>
                        <button class="btn btn-xs btn-outline-primary mb-2 mr-1" style="font-size: 0.7rem; padding: 4px 8px;" onclick="botTalk('Where is my report?')">Report Status</button>
                        <button class="btn btn-xs btn-outline-primary mb-2 mr-1" style="font-size: 0.7rem; padding: 4px 8px;" onclick="botTalk('Book a test')">Book Test</button>
                    </div>
                    <div id="botResponse" class="mt-3 small text-info" style="min-height: 40px; border-top: 1px solid rgba(255,255,255,0.1); padding-top: 10px;"></div>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', botHTML);
    }
}

function toggleMediBot() {
    const chat = document.getElementById('medibotChat');
    if (chat) {
        $(chat).fadeToggle();
    }
}

function botTalk(query) {
    const resp = document.getElementById('botResponse');
    resp.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Analyzing...';

    setTimeout(() => {
        let answer = "I'm processing your request. Please check our dedicated sections for more details.";
        if (query.includes('healthy')) answer = "Stay hydrated, exercise 30 mins daily, and get regular checkups at MediLab! 🍏";
        if (query.includes('report')) answer = "You can view and download your reports from the 'Medical Reports' section once they are ready.";
        if (query.includes('Book')) answer = "Click on 'Book New Test' to schedule your next health checkup instantly!";

        resp.innerHTML = `<i class="fas fa-comment-dots"></i> ${answer}`;
    }, 1000);
}

function initHealthMetrics() {
    const container = document.getElementById('healthMetricsContainer');
    if (!container) return;

    const metrics = [
        { label: 'Blood Sugar', value: '98', unit: 'mg/dL', progress: 75, color: '#00f2fe' },
        { label: 'Heart Rate', value: '72', unit: 'BPM', progress: 65, color: '#ff3366' },
        { label: 'BMI Index', value: '22.4', unit: '', progress: 45, color: '#00c6ff' }
    ];

    container.innerHTML = metrics.map(m => `
        <div class="col-md-4 mb-4">
            <div class="metric-card card-holographic">
                <div class="metric-label">${m.label}</div>
                <div class="metric-value">${m.value}<small style="font-size: 1rem; margin-left: 5px;">${m.unit}</small></div>
                <div class="progress-cyber">
                    <div class="progress-cyber-bar" style="width: ${m.progress}%; background: ${m.color}; box-shadow: 0 0 10px ${m.color}cc;"></div>
                </div>
            </div>
        </div>
    `).join('');
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

function toast(message, type = 'info') {
    let container = document.getElementById('toastContainer');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toastContainer';
        document.body.appendChild(container);
    }

    const toastItem = document.createElement('div');
    toastItem.className = `toast-item ${type}`;
    
    let icon = 'fa-info-circle';
    if (type === 'success') icon = 'fa-check-circle';
    if (type === 'danger') icon = 'fa-exclamation-circle';
    if (type === 'warning') icon = 'fa-exclamation-triangle';

    toastItem.innerHTML = `
        <i class="fas ${icon}" style="font-size: 1.2rem; color: var(--${type}-color, var(--primary-color))"></i>
        <div>${sanitizeInput(message)}</div>
    `;
    container.appendChild(toastItem);

    setTimeout(() => {
        toastItem.style.opacity = '0';
        toastItem.style.transform = 'translateX(100%)';
        toastItem.style.transition = 'all 0.4s ease-in';
        setTimeout(() => {
            toastItem.remove();
            if (container.children.length === 0) {
                container.remove();
            }
        }, 400);
    }, 4000);
}

// ─── Mobile Menu ─────────────────────────────────────────
function initializeMobileMenu() {
    const sidebar = document.querySelector('.sidebar');
    if (!sidebar) return;

    // Dynamically insert premium mobile top navbar if not already present
    let mobileHeader = document.getElementById('mobileHeaderBar');
    if (!mobileHeader) {
        mobileHeader = document.createElement('div');
        mobileHeader.id = 'mobileHeaderBar';
        mobileHeader.className = 'mobile-header-bar';

        // Dynamically determine current active page/section title
        const path = window.location.pathname.toLowerCase();
        let pageTitle = 'Dashboard'; // Fallback
        if (path.includes('dashboard')) {
            pageTitle = 'Dashboard';
        } else if (path.includes('book-test')) {
            pageTitle = 'Book New Test';
        } else if (path.includes('bookings')) {
            const user = SessionManager.getUser();
            pageTitle = (user && user.role === 'Admin') ? 'Manage Orders' : 'My Bookings';
        } else if (path.includes('reports') || path.includes('upload-reports')) {
            pageTitle = path.includes('upload') ? 'Upload Results' : 'Medical Reports';
        } else if (path.includes('family')) {
            pageTitle = 'Family Members';
        } else if (path.includes('profile')) {
            pageTitle = 'My Profile';
        } else if (path.includes('settings')) {
            pageTitle = 'Settings';
        } else if (path.includes('subscription')) {
            pageTitle = 'Upgrade to Pro';
        } else if (path.includes('manage-tests')) {
            pageTitle = 'Test Catalog';
        } else if (path.includes('history')) {
            pageTitle = 'Profile History';
        } else {
            const docTitle = document.title.replace('- MediLab', '').replace('MediLab', '').trim();
            if (docTitle) pageTitle = docTitle;
        }

        mobileHeader.innerHTML = `
            <div class="mobile-header-title"><i class="fas fa-flask text-primary mr-2"></i> ${pageTitle}</div>
        `;
        document.body.appendChild(mobileHeader);
    }

    // Dynamically insert premium mobile menu toggle if not already present
    let mobileToggle = document.getElementById('mobileMenuToggle');
    if (!mobileToggle) {
        mobileToggle = document.createElement('button');
        mobileToggle.id = 'mobileMenuToggle';
        mobileToggle.className = 'mobile-menu-toggle';
        mobileToggle.innerHTML = '<span></span>';
        mobileToggle.setAttribute('aria-label', 'Toggle Navigation');
        document.body.appendChild(mobileToggle);
    }

    if (!document.querySelector('.mobile-overlay')) {
        const overlay = document.createElement('div');
        overlay.className = 'mobile-overlay';
        document.body.appendChild(overlay);
    }
    const overlay = document.querySelector('.mobile-overlay');
    const closeButton = sidebar.querySelector('.sidebar-close');
    const navbarToggle = document.querySelector('.sidebar-toggle');

    const toggles = [navbarToggle, mobileToggle].filter(Boolean);

    const toggleMenu = (e) => {
        if (e) e.stopPropagation();
        sidebar.classList.toggle('active');
        toggles.forEach(t => t.classList.toggle('active'));
        overlay.classList.toggle('active');
    };

    const closeAll = () => {
        sidebar.classList.remove('active');
        toggles.forEach(t => t.classList.remove('active'));
        overlay.classList.remove('active');
    };

    toggles.forEach(t => t.addEventListener('click', toggleMenu));
    if (closeButton) closeButton.addEventListener('click', closeAll);
    overlay.addEventListener('click', closeAll);
    
    // Close sidebar on link click, EXCEPT when clicking the inner profile accordion settings link
    sidebar.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', (e) => {
            if (link.closest('#sidebarProfileSubmenu') || link.id === 'sidebarProfileTrigger' || link.closest('#sidebarProfileTrigger')) {
                return; // Do not close if navigating profile submenu trigger
            }
            closeAll();
        });
    });

    sidebar.addEventListener('click', (e) => e.stopPropagation());
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeAll(); });
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

        // --- Init Futuristic Components ---
        initHealthMetrics();
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

    const profileHtml = `
        <div class="sidebar-profile">
            <!-- Dynamic Accordion Profile Header displaying User Name -->
            <div class="d-flex align-items-center justify-content-between" style="width: 100%;">
                <div class="sidebar-profile-meta" id="sidebarProfileTrigger" style="cursor: pointer; display: flex; align-items: center; justify-content: space-between; flex-fill: 1; width: calc(100% - 40px);">
                    <div class="d-flex align-items-center">
                        <span class="sidebar-avatar">${user.name ? user.name.charAt(0).toUpperCase() : 'U'}</span>
                        <div class="ml-2" style="line-height: 1.2;">
                            <div class="sidebar-profile-name" style="font-size: 0.95rem; font-weight: 700; color: var(--text-main);">${user.name}</div>
                            <div class="sidebar-profile-role text-primary font-weight-bold" style="font-size: 0.75rem; text-transform: uppercase;">${user.role === 'Admin' ? 'LAB ADMIN' : 'PATIENT'}</div>
                        </div>
                    </div>
                    <i class="fas fa-chevron-down profile-chevron mr-2" style="transition: transform 0.3s ease; color: var(--text-muted); font-size: 0.8rem;"></i>
                </div>
                <button type="button" class="sidebar-close" aria-label="Close menu" style="margin-left: auto;">&times;</button>
            </div>
            
            <!-- Collapsible Submenu (No redundant logout option) -->
            <div class="sidebar-profile-submenu" id="sidebarProfileSubmenu" style="max-height: 0; overflow: hidden; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); opacity: 0;">
                <a href="profile.html"><i class="fas fa-user-edit text-primary"></i> Edit Profile</a>
                <a href="subscription.html"><i class="fas fa-crown text-warning"></i> Upgrade / Pro</a>
                <a href="family.html"><i class="fas fa-users text-info"></i> Family Members</a>
                <a href="reports.html"><i class="fas fa-file-medical-alt text-danger"></i> Reports</a>
                <a href="history.html"><i class="fas fa-history text-secondary"></i> Profile History</a>
                <a href="settings.html"><i class="fas fa-cog text-light"></i> Settings</a>
            </div>
        </div>
    `;

    let navItems = `
        <div class="sidebar-head">
            <h2><i class="fas fa-flask"></i> MediLab</h2>
        </div>
        <a href="dashboard.html" class="${window.location.pathname.includes('dashboard') ? 'active' : ''}"><i class="fas fa-tachometer-alt"></i> Dashboard</a>
    `;

    if (user.role === 'Patient') {
        navItems += `
            <a href="book-test.html" class="${window.location.pathname.includes('book-test') ? 'active' : ''}"><i class="fas fa-plus-circle"></i> Book New Test</a>
            <a href="bookings.html" class="${window.location.pathname.includes('bookings') ? 'active' : ''}"><i class="fas fa-calendar-alt"></i> My Bookings</a>
            <a href="reports.html" class="${window.location.pathname.includes('reports') ? 'active' : ''}"><i class="fas fa-file-medical-alt"></i> Medical Reports</a>
            <a href="family.html" class="${window.location.pathname.includes('family') ? 'active' : ''}"><i class="fas fa-users"></i> Family Members</a>
        `;
    } else if (user.role === 'Admin') {
        navItems += `
            <a href="bookings.html" class="${window.location.pathname.includes('bookings') ? 'active' : ''}"><i class="fas fa-clipboard-list"></i> Manage Orders</a>
            <a href="upload-reports.html" class="${window.location.pathname.includes('upload-reports') ? 'active' : ''}"><i class="fas fa-upload"></i> Upload Results</a>
            <a href="manage-tests.html" class="${window.location.pathname.includes('manage-tests') ? 'active' : ''}"><i class="fas fa-flask"></i> Test Catalog</a>
        `;
    }

    navItems += `
        <a href="settings.html" class="${window.location.pathname.includes('settings') ? 'active' : ''}"><i class="fas fa-cog"></i> Settings</a>
        <a href="javascript:void(0);" onclick="logout()" class="text-danger mt-4"><i class="fas fa-sign-out-alt"></i> Sign Out</a>
    `;

    sidebar.innerHTML = `${profileHtml}${navItems}`;

    // Add interactivity to the responsive profile trigger
    const trigger = sidebar.querySelector('#sidebarProfileTrigger');
    const submenu = sidebar.querySelector('#sidebarProfileSubmenu');
    const chevron = sidebar.querySelector('.profile-chevron');
    if (trigger && submenu && chevron) {
        trigger.addEventListener('click', (e) => {
            e.stopPropagation();
            const isCollapsed = submenu.style.maxHeight === '0px' || submenu.style.maxHeight === '';
            if (isCollapsed) {
                submenu.style.maxHeight = '400px';
                submenu.style.opacity = '1';
                submenu.style.marginTop = '12px';
                chevron.style.transform = 'rotate(180deg)';
            } else {
                submenu.style.maxHeight = '0px';
                submenu.style.opacity = '0';
                submenu.style.marginTop = '0px';
                chevron.style.transform = 'rotate(0deg)';
            }
        });
    }
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
                <option value="">Select</option>${['Haematology', 'Biochemistry', 'Immunology', 'Virology', 'Microbiology', 'Endocrinology', 'Cardiology', 'Other'].map(c => `<option value="${c}" ${t && t.category === c ? 'selected' : ''}>${c}</option>`).join('')}
            </select></div>
            <div class="form-group"><label>Price (₹) *</label><input type="number" id="testPriceInput" class="form-control" value="${t ? t.price : ''}" min="0"></div>
            <div class="form-group"><label>Turnaround *</label><select id="testTurnaroundInput" class="form-control">
                <option value="">Select</option>${['24 hours', '48 hours', '72 hours', '1 week'].map(v => `<option value="${v}" ${t && tTime === v ? 'selected' : ''}>${v}</option>`).join('')}
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
    if (menuProfileRole) menuProfileRole.textContent = user.role === 'Admin' ? 'Lab Administrator' : 'Patient';
    if (navProfilePic) navProfilePic.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=00f2fe&color=000`;

    // Role-based Navbar Dropdown Items
    const profileMenu = document.querySelector('.profile-menu');
    if (profileMenu) {
        let menuItems = `
            <div class="dropdown-header d-flex align-items-center">
                <div class="header-avatar mr-3">
                    <i class="fas fa-user-circle fa-2x text-primary"></i>
                </div>
                <div>
                    <h6 class="mb-0 text-white">${user.name}</h6>
                    <small class="text-muted">${user.role === 'Admin' ? 'Lab Administrator' : 'Patient'}</small>
                </div>
            </div>
            <div class="dropdown-divider"></div>
            <a class="dropdown-item" href="profile.html"><i class="fas fa-user-edit text-primary"></i> Profile Settings</a>
        `;

        if (user.role === 'Patient') {
            menuItems += `
                <a class="dropdown-item" href="subscription.html"><i class="fas fa-crown text-warning"></i> Upgrade / Subscription</a>
                <a class="dropdown-item" href="family.html"><i class="fas fa-users text-info"></i> Manage Family</a>
                <a class="dropdown-item" href="reports.html"><i class="fas fa-file-medical-alt text-danger"></i> My Reports</a>
                <a class="dropdown-item" href="history.html"><i class="fas fa-history text-secondary"></i> Test History</a>
            `;
        } else if (user.role === 'Admin') {
            menuItems += `
                <a class="dropdown-item" href="subscription.html"><i class="fas fa-crown text-warning"></i> Upgrade / Subscription</a>
                <a class="dropdown-item" href="bookings.html"><i class="fas fa-tasks text-success"></i> Manage Orders</a>
                <a class="dropdown-item" href="manage-tests.html"><i class="fas fa-flask text-info"></i> Test Catalog</a>
                <a class="dropdown-item" href="upload-reports.html"><i class="fas fa-upload text-warning"></i> Upload Results</a>
            `;
        }

        menuItems += `
            <a class="dropdown-item" href="settings.html"><i class="fas fa-cog text-light"></i> Account Settings</a>
            <div class="dropdown-divider"></div>
            <a class="dropdown-item text-danger" href="#" onclick="logout()"><i class="fas fa-sign-out-alt"></i> Logout</a>
        `;
        profileMenu.innerHTML = menuItems;
    }
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

        const patientSection = document.getElementById('patientSection');
        const labAdminSection = document.getElementById('labAdminSection');

        if (user.role === 'Patient') {
            if (patientSection) patientSection.style.display = 'block';
            if (labAdminSection) labAdminSection.style.display = 'none';

            if (document.getElementById('profileName')) document.getElementById('profileName').value = user.name || '';
            if (document.getElementById('profileEmail')) document.getElementById('profileEmail').value = user.email || '';
            if (document.getElementById('profilePhone')) document.getElementById('profilePhone').value = user.phone || '';
            if (document.getElementById('profileAge')) document.getElementById('profileAge').value = user.age || '';
            if (user.gender && document.getElementById('profileGender')) document.getElementById('profileGender').value = user.gender;
            if (user.blood_group && document.getElementById('profileBloodGroup')) document.getElementById('profileBloodGroup').value = user.blood_group;
            if (user.dob && document.getElementById('profileDob')) document.getElementById('profileDob').value = user.dob.split('T')[0];
        } else if (user.role === 'Admin') {
            if (patientSection) patientSection.style.display = 'none';
            if (labAdminSection) labAdminSection.style.display = 'block';

            if (document.getElementById('adminName')) document.getElementById('adminName').value = user.name || '';
            if (document.getElementById('adminEmail')) document.getElementById('adminEmail').value = user.email || '';

            if (user.labs) {
                if (document.getElementById('labName')) document.getElementById('labName').value = user.labs.name || '';
                if (document.getElementById('labLocation')) document.getElementById('labLocation').value = user.labs.location || '';
                if (document.getElementById('labIdNum')) document.getElementById('labIdNum').value = user.labs.lab_id || '';
                if (document.getElementById('labGst')) document.getElementById('labGst').value = user.labs.gst_number || '';
            }
        }


    } catch (err) {
        console.error(err);
        showAlert('Failed to load profile details.', 'danger');
    } finally {
        hideLoader();
    }
}

async function updateProfileSubmit(event) {
    event.preventDefault();
    const user = SessionManager.getUser();
    if (!user) return;

    let body = {};

    if (user.role === 'Patient') {
        body = {
            name: document.getElementById('profileName').value,
            phone: document.getElementById('profilePhone').value,
            age: document.getElementById('profileAge').value,
            gender: document.getElementById('profileGender').value,
            blood_group: document.getElementById('profileBloodGroup').value,
            dob: document.getElementById('profileDob').value
        };
    } else if (user.role === 'Admin') {
        body = {
            name: document.getElementById('adminName').value,
            // Add other admin-editable fields if any
        };
    }

    try {
        await apiCall('/auth/profile', {
            method: 'PUT',
            body: JSON.stringify(body)
        });
        showAlert('Profile updated successfully!', 'success');

        // Update user in session
        const updatedUser = { ...user, ...body };
        SessionManager.setUser(updatedUser);

        // Refresh navbar and sidebar profile
        loadNavbarProfile();
        loadSidebar();
    } catch (err) {
        showAlert(err.message || 'Error updating profile', 'danger');
    }
}

// ─── Init ────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', function () {
    initGlobalLoader();
    checkAuth();
    loadSidebar();
    loadNavbarProfile();
    initializeMobileMenu();

    if (window.location.pathname.includes('family.html')) {
        loadFamilyMembers();
    }

    if (window.location.pathname.includes('profile.html') || window.location.pathname.includes('subscription.html')) {
        if (window.location.pathname.includes('profile.html')) loadProfilePageData();
        loadSubscriptionPlans();
    }

    if (window.location.pathname.includes('book-test.html')) {
        const urlParams = new URLSearchParams(window.location.search);
        const patientNameParam = urlParams.get('patient');
        const patientNameInput = document.getElementById('patientName');
        if (patientNameInput) {
            patientNameInput.value = patientNameParam || (SessionManager.getUser() ? SessionManager.getUser().name : '');
        }
        loadFeaturedLabs();
    }

    // Smooth page load effect
    const loader = document.getElementById('globalLoader');
    if (loader) {
        setTimeout(() => {
            loader.style.opacity = '0';
            setTimeout(() => { loader.style.display = 'none'; }, 300);
        }, 150); // Reduced delay for better feel
    }

    if (document.getElementById('welcome')) loadDashboard();
    if (document.getElementById('bookingsTable')) loadBookings();
    if (document.getElementById('reportsTable')) loadReports();
    if (document.getElementById('bookingId')) loadUploadReports();
    if (document.getElementById('labSelect')) loadLabOptions('labSelect');

    // Inject Global Footer
    renderGlobalFooter();
});

// ─── Global Footer ─────────────────────────────────────────
function renderGlobalFooter() {
    // Skip if we are on the landing page (it has its own specific footer structure)
    const path = window.location.pathname;
    if (path.endsWith('index.html') || path.endsWith('/')) return;

    let target = document.querySelector('.main');
    if (!target) target = document.body;

    // Remove any existing static footers to avoid duplication
    document.querySelectorAll('.footer, .explore-footer').forEach(f => f.remove());

    const footerHTML = `
        <footer class="footer">
            <div class="container">
                <div class="footer-grid">
                    <div class="footer-col">
                        <h5><i class="fas fa-flask"></i> MediLab</h5>
                        <p>India's smart pathology platform. Connecting patients with certified diagnostic labs for a seamless health experience.</p>
                    </div>
                    <div class="footer-col">
                        <h5>Quick Links</h5>
                        <a href="index.html#about">About Us</a>
                        <a href="index.html#services">Services</a>
                        <a href="index.html#how-it-works">How It Works</a>
                        <a href="index.html#contact">Contact</a>
                    </div>
                    <div class="footer-col">
                        <h5>For Users</h5>
                        <a href="login.html">Sign In</a>
                        <a href="register.html">Create Account</a>
                        <a href="#">Privacy Policy</a>
                        <a href="#">Terms of Service</a>
                    </div>
                    <div class="footer-col">
                        <h5>Follow Us</h5>
                        <div class="social-links">
                            <a href="#"><i class="fab fa-twitter"></i></a>
                            <a href="#"><i class="fab fa-linkedin"></i></a>
                            <a href="#"><i class="fab fa-instagram"></i></a>
                            <a href="#"><i class="fab fa-github"></i></a>
                        </div>
                    </div>
                </div>
                <div class="footer-bottom">
                    <p>&copy; 2026 MediLab. All rights reserved. Built with <i class="fas fa-heart text-danger"></i> in India.</p>
                </div>
            </div>
        </footer>
    `;

    target.insertAdjacentHTML('beforeend', footerHTML);
}

// ─── Manage Tests (Catalog) ────────────────────────────────
async function loadManageTestsPage() {
    const user = SessionManager.getUser();
    if (!user || user.role !== 'Admin') return;

    const testsGrid = document.getElementById('testsGrid');
    const emptyState = document.getElementById('emptyState');
    if (!testsGrid) return;

    // Show Skeletons
    testsGrid.innerHTML = Array(3).fill(0).map(() => `
        <div class="col-md-6 col-lg-4 mb-4">
            <div class="card skeleton-card skeleton"></div>
        </div>
    `).join('');

    try {
        const data = await apiCall('/tests/my-lab');
        const labTests = data.tests || [];

        testsGrid.innerHTML = '';

        if (labTests.length === 0) {
            if (emptyState) emptyState.style.display = 'block';
            return;
        }

        if (emptyState) emptyState.style.display = 'none';
        const statsSec = document.getElementById('statsSection');
        if (statsSec) statsSec.style.display = 'flex';

        labTests.forEach(test => {
            const tName = test.testName || test.test_name || 'Unnamed Test';
            const tPrice = test.price || 0;
            const tCategory = test.category || 'General';
            const tTime = test.turnaroundTime || test.turnaround_time || '24 hrs';
            const tDesc = test.description || 'Professional diagnostic service provided by our certified laboratory.';

            const card = document.createElement('div');
            card.className = 'col-md-6 col-lg-4 mb-4';
            card.innerHTML = `
                <div class="card h-100 test-card">
                    <div class="card-header bg-transparent border-0 d-flex justify-content-between">
                        <span class="badge badge-info">${tCategory}</span>
                        <span class="text-primary font-weight-bold">₹${tPrice}</span>
                    </div>
                    <div class="card-body pt-0">
                        <h5 class="card-title text-white mb-2">${tName}</h5>
                        <p class="card-text text-muted small">${tDesc.substring(0, 80)}${tDesc.length > 80 ? '...' : ''}</p>
                        <div class="d-flex justify-content-between align-items-center mt-3">
                            <small class="text-muted"><i class="fas fa-clock"></i> ${tTime}</small>
                            <div class="btn-group btn-group-sm">
                                <button class="btn btn-outline-primary" onclick="showTestForm('${test.id}')"><i class="fas fa-edit"></i></button>
                                <button class="btn btn-outline-danger" onclick="deleteTest('${test.id}')"><i class="fas fa-trash"></i></button>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            testsGrid.appendChild(card);
        });

        updateTestStats(labTests);

    } catch (err) {
        console.error('Catalog error:', err);
        showAlert('Failed to load test catalog.', 'danger');
    } finally {
        hideLoader();
    }
}

function updateTestStats(tests) {
    const total = document.getElementById('totalTestsCount');
    const avg = document.getElementById('avgPriceCount');
    const fast = document.getElementById('fastTestsCount');
    if (!total || !avg) return;

    total.textContent = tests.length;
    const avgP = tests.length > 0 ? Math.round(tests.reduce((sum, t) => sum + (t.price || 0), 0) / tests.length) : 0;
    avg.textContent = `₹${avgP}`;

    if (fast) {
        const fastCount = tests.filter(t => (t.turnaroundTime || t.turnaround_time || '').toLowerCase().includes('24')).length;
        fast.textContent = fastCount;
    }
}

// ─── Subscription Plans (Role-Based) ────────────────────────
function loadSubscriptionPlans() {
    const container = document.getElementById('subscriptionPlansContainer');
    if (!container) return;

    const user = SessionManager.getUser();
    if (!user) return;

    const isPatient = user.role === 'Patient';

    const plans = isPatient ? [
        {
            name: "Basic",
            price: "Free",
            icon: "fas fa-leaf",
            features: [
                "Online test booking",
                "Digital report access",
                "1 month data history",
                "Standard support"
            ],
            btnText: "Current Plan",
            btnClass: "btn-outline-primary",
            popular: false
        },
        {
            name: "Plus",
            price: "₹199",
            period: "/mo",
            icon: "fas fa-shield-alt",
            features: [
                "Instant Price Comparison",
                "Priority booking slots",
                "Express 12h Reports",
                "Family Dashboard (3 members)",
                "1 year report storage"
            ],
            btnText: "Upgrade to Plus",
            btnClass: "btn-primary",
            popular: true
        },
        {
            name: "Pro",
            price: "₹499",
            period: "/mo",
            icon: "fas fa-crown",
            features: [
                "Smart AI Lab Recommendations",
                "Real-time Health Trends (Charts)",
                "24/7 AI Health Assistant",
                "Home Collection (15% Off)",
                "Unlimited Lifetime Storage"
            ],
            btnText: "Go Pro",
            btnClass: "btn-primary",
            popular: false
        }
    ] : [
        {
            name: "Standard",
            price: "Free",
            icon: "fas fa-hospital",
            features: [
                "Standard dashboard",
                "Up to 50 bookings/month",
                "1 staff account",
                "Basic analytics"
            ],
            btnText: "Current Plan",
            btnClass: "btn-outline-primary",
            popular: false
        },
        {
            name: "Plus",
            price: "₹999",
            period: "/mo",
            icon: "fas fa-rocket",
            features: [
                "Priority Lab Listing (Top Search)",
                "Premium 'Verified' Badge",
                "Unlimited bookings",
                "5 staff accounts",
                "Advanced patient analytics"
            ],
            btnText: "Upgrade to Plus",
            btnClass: "btn-primary",
            popular: true
        },
        {
            name: "Enterprise",
            price: "₹2499",
            period: "/mo",
            icon: "fas fa-vial",
            features: [
                "'MediLab Recommended' Status",
                "Featured Lab on Home Page",
                "API access for LIMS",
                "Multiple branch support",
                "White-label reports"
            ],
            btnText: "Get Enterprise",
            btnClass: "btn-primary",
            popular: false
        }
    ];

    container.innerHTML = plans.map(plan => `
        <div class="pricing-card ${plan.popular ? 'popular' : ''}">
            ${plan.popular ? '<div class="popular-badge">Best Value</div>' : ''}
            <div class="plan-icon">
                <i class="${plan.icon}"></i>
            </div>
            <h4 class="plan-name">${plan.name}</h4>
            <div class="plan-price">${plan.price}${plan.period || ''}</div>
            <ul class="plan-features">
                ${plan.features.map(f => `<li><i class="fas fa-check-circle"></i> ${f}</li>`).join('')}
            </ul>
            <button class="btn btn-plan ${plan.btnClass}">${plan.btnText}</button>
        </div>
    `).join('');
}

// ─── Featured Labs & Recommendations ───────────────────────
async function loadFeaturedLabs() {
    const list = document.getElementById('featuredLabsList');
    if (!list) return;

    try {
        const data = await apiCall('/labs');
        const labs = data.labs || [];

        // Filter "Featured" labs (Simulating premium status)
        const featured = labs.slice(0, 3); // Take first 3 as featured for demo

        list.innerHTML = featured.map(lab => `
            <div class="col-4">
                <div class="featured-lab-card" onclick="selectRecommendedLab('${lab.id}', '${lab.name}')">
                    <i class="fas fa-hospital"></i>
                    <span>${lab.name}</span>
                    <div class="badge mt-2">Recommended</div>
                </div>
            </div>
        `).join('');
    } catch (err) { console.error('Featured labs error:', err); }
}

function selectRecommendedLab(id, name) {
    const select = document.getElementById('labSelect');
    if (!select) return;

    select.value = id;
    toast(`✓ Selected ${name}`, 'success');
}

// ─── Price Comparison Logic ───────────────────────────────
let comparisonTimeout;
async function comparePrices() {
    const query = document.getElementById('testName').value.trim();
    const tool = document.getElementById('priceComparisonTool');
    const container = document.getElementById('comparisonResults');

    if (!query || query.length < 3) {
        if (tool) tool.style.display = 'none';
        return;
    }

    clearTimeout(comparisonTimeout);
    comparisonTimeout = setTimeout(async () => {
        try {
            // In a real app, we would search across all labs. 
            // For now, we simulate by fetching all labs and showing sample prices.
            const data = await apiCall('/labs');
            const labs = data.labs || [];

            if (labs.length === 0) return;

            if (tool) tool.style.display = 'block';

            // Generate some dynamic mock prices based on test name length and lab name
            const results = labs.map(lab => {
                const basePrice = 500 + (query.length * 20);
                const variance = (lab.name.length % 5) * 50;
                return {
                    name: lab.name,
                    price: basePrice + variance,
                    id: lab.id
                };
            }).sort((a, b) => a.price - b.price);

            const minPrice = results.length > 0 ? results[0].price : 0;

            if (container) {
                container.innerHTML = results.slice(0, 4).map(res => `
                    <div class="comparison-item ${res.price === minPrice ? 'cheapest' : ''}" onclick="selectRecommendedLab('${res.id}', '${res.name}')" style="cursor:pointer">
                        <div class="lab-name">
                            ${res.name}
                            ${res.price === minPrice ? '<span class="badge badge-success ml-2">Best Price</span>' : ''}
                        </div>
                        <div class="lab-price">₹${res.price}</div>
                    </div>
                `).join('');
            }

        } catch (err) { console.error('Comparison error:', err); }
    }, 500);
}


