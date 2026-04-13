// MediLab Application - localStorage Version

// Validation patterns
const VALIDATION_PATTERNS = {
    email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    password: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[a-zA-Z\d@$!%*?&]{8,}$/,
    phone: /^[0-9]{10}$/,
    name: /^[a-zA-Z ]{2,50}$/
};

// Mobile Hamburger Menu Toggle - Enhanced
function initializeMobileMenu() {
    const sidebar = document.querySelector('.sidebar');
    const toggle = document.querySelector('.sidebar-toggle');
    
    // Create overlay if it doesn't exist
    if (!document.querySelector('.mobile-overlay')) {
        const overlay = document.createElement('div');
        overlay.className = 'mobile-overlay';
        document.body.appendChild(overlay);
    }
    
    const overlay = document.querySelector('.mobile-overlay');
    
    if (toggle) {
        // Toggle on button click
        toggle.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleMenu();
        });
        
        // Close menu when overlay is clicked
        overlay.addEventListener('click', () => {
            closeMenu();
        });
        
        // Close menu when a link is clicked
        const sidebarLinks = document.querySelectorAll('.sidebar a');
        sidebarLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.stopPropagation();
                closeMenu();
            });
        });
        
        // Prevent closing when clicking sidebar
        sidebar.addEventListener('click', (e) => {
            e.stopPropagation();
        });
        
        // Close menu on window resize (when going back to desktop)
        window.addEventListener('resize', () => {
            if (window.innerWidth > 1023) {
                closeMenu();
            }
        });
        
        // Prevent body scroll when menu is open
        document.addEventListener('touchmove', (e) => {
            if (sidebar.classList.contains('active') && !sidebar.contains(e.target)) {
                e.preventDefault();
            }
        }, { passive: false });
        
        // Keyboard support - Escape key to close menu
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && sidebar.classList.contains('active')) {
                closeMenu();
            }
        });
    }
}

function toggleMenu() {
    const sidebar = document.querySelector('.sidebar');
    
    if (sidebar.classList.contains('active')) {
        closeMenu();
    } else {
        openMenu();
    }
}

function openMenu() {
    const sidebar = document.querySelector('.sidebar');
    const toggle = document.querySelector('.sidebar-toggle');
    const overlay = document.querySelector('.mobile-overlay');
    
    sidebar.classList.add('active');
    toggle.classList.add('active');
    overlay.classList.add('active');
    
    // Haptic feedback on supported devices
    if (navigator.vibrate) {
        navigator.vibrate(10);
    }
    
    // Add focus to sidebar for accessibility
    const firstLink = sidebar.querySelector('a');
    if (firstLink) {
        firstLink.focus();
    }
}

function closeMenu() {
    const sidebar = document.querySelector('.sidebar');
    const toggle = document.querySelector('.sidebar-toggle');
    const overlay = document.querySelector('.mobile-overlay');
    
    sidebar.classList.remove('active');
    toggle.classList.remove('active');
    overlay.classList.remove('active');
    
    // Return focus to toggle button
    if (toggle) {
        toggle.focus();
    }
}

// Session Manager using localStorage
class SessionManager {
    static setUser(user) {
        localStorage.setItem('currentUser', JSON.stringify(user));
    }

    static getUser() {
        const user = localStorage.getItem('currentUser');
        return user ? JSON.parse(user) : null;
    }

    static clearUser() {
        localStorage.removeItem('currentUser');
    }

    static isLoggedIn() {
        return this.getUser() !== null;
    }

    static getUserRole() {
        const user = this.getUser();
        return user ? user.role : null;
    }
}

// Initialize sample data
function initializeSampleData() {
    if (!localStorage.getItem('labs')) {
        const labs = [
            { id: 1, name: 'PathLab Delhi', location: 'New Delhi', phone: '9111234567', gstNumber: '27AABAA0000R0Z0', labId: 'LAB-001', profile: 'Premium pathology lab with advanced testing facilities', status: 'Verified', registeredDate: '2025-01-15' },
            { id: 2, name: 'PathLab Mumbai', location: 'Mumbai', phone: '9221234567', gstNumber: '27AABAA0000R0Z1', labId: 'LAB-002', profile: 'Certified diagnostic center with home sample collection', status: 'Verified', registeredDate: '2025-01-20' },
            { id: 3, name: 'PathLab Bangalore', location: 'Bangalore', phone: '9801234567', gstNumber: '27AABAA0000R0Z2', labId: 'LAB-003', profile: 'High-tech lab with experienced pathologists', status: 'Verified', registeredDate: '2025-02-01' },
            { id: 4, name: 'PathLab Hyderabad', location: 'Hyderabad', phone: '9401234567', gstNumber: '27AABAA0000R0Z3', labId: 'LAB-004', profile: 'Full-service diagnostic lab for all test types', status: 'Verified', registeredDate: '2025-02-10' },
            { id: 5, name: 'PathLab Kolkata', location: 'Kolkata', phone: '9331234567', gstNumber: '27AABAA0000R0Z4', labId: 'LAB-005', profile: 'ISO certified and NABL accredited laboratory', status: 'Verified', registeredDate: '2025-02-15' },
            { id: 6, name: 'PathLab Chennai', location: 'Chennai', phone: '9441234567', gstNumber: '27AABAA0000R0Z5', labId: 'LAB-006', profile: 'Modern lab with online report delivery system', status: 'Verified', registeredDate: '2025-03-01' }
        ];
        localStorage.setItem('labs', JSON.stringify(labs));
    }

    if (!localStorage.getItem('users')) {
        const users = [
            { id: 1, name: 'Admin Alpha', email: 'admin-alpha@medilab.com', password: 'Admin@123', role: 'Admin', labId: 1, phone: '9876543210' },
            { id: 2, name: 'Admin Beta', email: 'admin-beta@medilab.com', password: 'Admin@123', role: 'Admin', labId: 2, phone: '9876543211' },
            { id: 3, name: 'Rajesh Kumar', email: 'rajesh.kumar@email.com', password: 'Patient@123', role: 'Patient', phone: '9876543212' },
            { id: 4, name: 'Priya Singh', email: 'priya.singh@email.com', password: 'Patient@123', role: 'Patient', phone: '9876543213' },
            { id: 5, name: 'Amit Patel', email: 'amit.patel@email.com', password: 'Patient@123', role: 'Patient', phone: '9876543214' },
            { id: 6, name: 'Neha Gupta', email: 'neha.gupta@email.com', password: 'Patient@123', role: 'Patient', phone: '9876543215' },
            { id: 7, name: 'Rohan Verma', email: 'rohan.verma@email.com', password: 'Patient@123', role: 'Patient', phone: '9876543216' }
        ];
        localStorage.setItem('users', JSON.stringify(users));
    }

    if (!localStorage.getItem('bookings')) {
        localStorage.setItem('bookings', JSON.stringify([]));
    }

    if (!localStorage.getItem('reports')) {
        localStorage.setItem('reports', JSON.stringify([]));
    }

    if (!localStorage.getItem('tests')) {
        const tests = [
            { id: 1, labId: 1, testName: 'Blood Test - Complete Blood Count', category: 'Haematology', price: 499, turnaroundTime: '24 hours', description: 'Complete Blood Count (CBC) includes hemoglobin, RBC, WBC, platelets' },
            { id: 2, labId: 1, testName: 'Blood Test - Lipid Profile', category: 'Biochemistry', price: 599, turnaroundTime: '24 hours', description: 'Tests for cholesterol, triglycerides, HDL, LDL' },
            { id: 3, labId: 1, testName: 'COVID-19 RT-PCR', category: 'Virology', price: 799, turnaroundTime: '48 hours', description: 'RT-PCR test for COVID-19 detection' },
            { id: 4, labId: 1, testName: 'Thyroid Profile (TSH, T3, T4)', category: 'Endocrinology', price: 699, turnaroundTime: '24 hours', description: 'Complete thyroid function tests' },
            { id: 5, labId: 2, testName: 'Blood Test - Complete Blood Count', category: 'Haematology', price: 449, turnaroundTime: '24 hours', description: 'Complete Blood Count (CBC)' },
            { id: 6, labId: 2, testName: 'Liver Function Test', category: 'Biochemistry', price: 549, turnaroundTime: '24 hours', description: 'Tests for bilirubin, AST, ALT, ALP, albumin, protein' },
            { id: 7, labId: 3, testName: 'Kidney Function Test', category: 'Biochemistry', price: 499, turnaroundTime: '24 hours', description: 'Tests for creatinine, urea, BUN, electrolytes' },
            { id: 8, labId: 3, testName: 'Vitamin B12 & Folate', category: 'Biochemistry', price: 899, turnaroundTime: '48 hours', description: 'Deficiency screening for Vitamin B12 and Folate' }
        ];
        localStorage.setItem('tests', JSON.stringify(tests));
    }
}

// Enhanced validation function
function validateInput(value, pattern, field) {
    if (!pattern.test(value)) {
        showAlert(`Invalid ${field}!`, 'danger');
        return false;
    }
    return true;
}

// Sanitize input to prevent XSS
function sanitizeInput(input) {
    const div = document.createElement('div');
    div.textContent = input;
    return div.innerHTML;
}

// Enhanced alert with icons and animations
function showAlert(message, type) {
    const alertDiv = document.createElement('div');
    const icons = {
        success: '✓',
        danger: '✕',
        warning: '⚠',
        info: 'ℹ'
    };
    alertDiv.className = `alert alert-${type} alert-dismissible fade show alert-animated`;
    alertDiv.innerHTML = `<span class="alert-icon">${icons[type]}</span> ${sanitizeInput(message)}<button type="button" class="close" data-dismiss="alert">&times;</button>`;
    document.body.insertBefore(alertDiv, document.body.firstChild);
    setTimeout(() => {
        alertDiv.classList.add('alert-removing');
        setTimeout(() => alertDiv.remove(), 300);
    }, 4000);
}

// Toggle Lab Registration Fields
function toggleLabFields() {
    const role = document.getElementById('roleSelect').value;
    const labFields = document.getElementById('labFields');
    labFields.style.display = role === 'Admin' ? 'block' : 'none';
}

// Registration
async function register(event) {
    event.preventDefault();
    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const role = document.getElementById('roleSelect') ? document.getElementById('roleSelect').value : 'Patient';

    // Validation
    if (!validateInput(name, VALIDATION_PATTERNS.name, 'Name (2-50 characters)')) return;
    if (!validateInput(email, VALIDATION_PATTERNS.email, 'Email')) return;
    if (!validateInput(password, VALIDATION_PATTERNS.password, 'Password (min 8 chars, uppercase, lowercase, number, special char)')) return;

    // Check email exists
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    if (users.find(u => u.email === email)) {
        showAlert('Email already registered!', 'danger');
        return;
    }

    // Validate Lab fields if Admin
    if (role === 'Admin') {
        const labName = document.getElementById('labName').value.trim();
        const labLocation = document.getElementById('labLocation').value.trim();
        const labGST = document.getElementById('labGST').value.trim();
        const labId = document.getElementById('labId').value.trim();
        const labPhone = document.getElementById('labPhone').value.trim();
        const labProfile = document.getElementById('labProfile').value.trim();

        if (!labName) { showAlert('Lab name is required!', 'warning'); return; }
        if (!labLocation) { showAlert('Lab location is required!', 'warning'); return; }
        if (!labGST || !validateGST(labGST)) { showAlert('Valid GST number required (e.g., 27AABAU1234R0Z0)!', 'warning'); return; }
        if (!labId) { showAlert('Lab ID / License number is required!', 'warning'); return; }
        if (!labPhone || !/^[0-9]{10}$/.test(labPhone)) { showAlert('Valid 10-digit phone number required!', 'warning'); return; }
        if (!labProfile) { showAlert('Lab profile/description is required!', 'warning'); return; }

        // Get next lab ID
        const labs = JSON.parse(localStorage.getItem('labs') || '[]');
        const nextLabId = labs.length > 0 ? Math.max(...labs.map(l => l.id)) + 1 : 1;

        // Store lab info
        labs.push({
            id: nextLabId,
            name: labName,
            location: labLocation,
            gstNumber: labGST,
            labId: labId,
            phone: labPhone,
            profile: labProfile,
            status: 'Pending', // Admin will verify
            registeredDate: new Date().toLocaleString()
        });
        localStorage.setItem('labs', JSON.stringify(labs));

        // Create admin user
        const newUser = {
            id: Date.now(),
            name, email, password, role,
            labId: nextLabId,
            labName: labName,
            phone: labPhone,
            status: 'Pending'
        };
        users.push(newUser);
        localStorage.setItem('users', JSON.stringify(users));

        showAlert('✓ Lab registration submitted! Awaiting admin verification...', 'success');
        setTimeout(() => window.location.href = 'index.html', 2000);
    } else {
        // Patient registration
        const newUser = {
            id: Date.now(),
            name, email, password, role,
            labId: null,
            phone: ''
        };
        users.push(newUser);
        localStorage.setItem('users', JSON.stringify(users));

        showAlert('✓ Registration successful! Redirecting to login...', 'success');
        setTimeout(() => window.location.href = 'index.html', 2000);
    }
}

// GST Validation
function validateGST(gst) {
    const gstPattern = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
    return gstPattern.test(gst);
}

// Login
async function login(event) {
    event.preventDefault();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;

    if (!email || !password) {
        showAlert('Email and password are required!', 'warning');
        return;
    }

    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const user = users.find(u => u.email === email && u.password === password);

    if (!user) {
        showAlert('Invalid email or password!', 'danger');
        return;
    }

    // Remove password before storing session
    const { password: _, ...userSession } = user;
    SessionManager.setUser(userSession);
    
    showAlert('✓ Login successful! Redirecting...', 'success');
    setTimeout(() => window.location.href = 'dashboard.html', 1000);
}

// Book Test
async function bookTest(event) {
    event.preventDefault();
    const user = SessionManager.getUser();
    if (!user) {
        window.location.href = 'index.html';
        return;
    }

    const testName = document.getElementById('testName').value.trim();
    const labId = parseInt(document.getElementById('labSelect').value);
    const testDate = document.getElementById('testDate')?.value || '';
    const testTime = document.getElementById('testTime')?.value || '';
    const notes = document.getElementById('notes')?.value.trim() || '';
    
    if (!testName || testName.length < 3) {
        showAlert('Test name must be at least 3 characters!', 'warning');
        return;
    }

    if (!labId) {
        showAlert('Please select a valid path lab.', 'warning');
        return;
    }

    const booking = {
        id: Date.now(),
        userId: user.id,
        labId,
        testName,
        patientName: user.name,
        patientEmail: user.email,
        bookingDate: new Date().toISOString(),
        testDate,
        testTime,
        notes,
        status: 'Pending'
    };

    const bookings = JSON.parse(localStorage.getItem('bookings') || '[]');
    bookings.push(booking);
    localStorage.setItem('bookings', JSON.stringify(bookings));

    showAlert('✓ Test booked successfully! Redirecting...', 'success');
    setTimeout(() => window.location.href = 'bookings.html', 1500);
}

// Upload Report (Admin only)
async function uploadReport(event) {
    event.preventDefault();
    const user = SessionManager.getUser();
    if (!user || user.role !== 'Admin') {
        showAlert('Access denied!', 'danger');
        return;
    }

    const bookingId = document.getElementById('bookingId').value;
    const results = document.getElementById('results').value.trim();
    const notes = document.getElementById('notes').value.trim();

    if (!bookingId || !results) {
        showAlert('Please fill in all required fields!', 'warning');
        return;
    }

    const report = {
        id: Date.now(),
        bookingId: parseInt(bookingId),
        userId: user.id,
        labId: user.labId,
        results,
        notes,
        uploadDate: new Date().toISOString()
    };

    const reports = JSON.parse(localStorage.getItem('reports') || '[]');
    reports.push(report);
    localStorage.setItem('reports', JSON.stringify(reports));

    // Mark booking as completed
    const bookings = JSON.parse(localStorage.getItem('bookings') || '[]');
    const booking = bookings.find(b => b.id === parseInt(bookingId));
    if (booking) {
        booking.status = 'Completed';
        localStorage.setItem('bookings', JSON.stringify(bookings));
    }

    showAlert('✓ Report uploaded successfully!', 'success');
    setTimeout(() => window.location.href = 'reports.html', 2000);
}

// Logout
function logout() {
    SessionManager.clearUser();
    window.location.href = 'index.html';
}

// Load Dashboard
async function loadDashboard() {
    const user = SessionManager.getUser();
    if (!user) {
        window.location.href = 'index.html';
        return;
    }

    const labInfo = user.role === 'Admin' ? ` (Lab Admin)` : '';
    document.getElementById('welcome').innerHTML = `<i class="fas fa-user-md"></i> Welcome to MediLab, ${user.name}${labInfo}!`;
    
    if (user.role === 'Admin') {
        document.getElementById('patientDashboard').style.display = 'none';
        document.getElementById('adminDashboard').style.display = 'block';
        loadAdminDashboard(user);
    } else {
        document.getElementById('patientDashboard').style.display = 'block';
        document.getElementById('adminDashboard').style.display = 'none';
        loadPatientDashboard(user);
    }
}

// Load Patient Dashboard
async function loadPatientDashboard(user) {
    const bookings = JSON.parse(localStorage.getItem('bookings') || '[]');
    const userBookings = bookings.filter(b => b.userId === user.id);
    
    document.getElementById('totalBookings').innerText = userBookings.length;
    document.getElementById('approvedBookings').innerText = userBookings.filter(b => b.status === 'Approved').length;
    document.getElementById('completedBookings').innerText = userBookings.filter(b => b.status === 'Completed').length;
}

// Load Admin Dashboard
async function loadAdminDashboard(user) {
    const bookings = JSON.parse(localStorage.getItem('bookings') || '[]');
    const reports = JSON.parse(localStorage.getItem('reports') || '[]');
    const labs = JSON.parse(localStorage.getItem('labs') || '[]');
    
    const lab = labs.find(l => l.id === user.labId);
    const labBookings = bookings.filter(b => b.labId === user.labId);
    
    document.getElementById('labInfo').innerText = `Managing: ${lab ? lab.name : 'Lab Admin'}`;
    document.getElementById('pendingBookings').innerText = labBookings.filter(b => b.status === 'Pending').length;
    document.getElementById('adminApprovedBookings').innerText = labBookings.filter(b => b.status === 'Approved').length;
    document.getElementById('adminCompletedBookings').innerText = labBookings.filter(b => b.status === 'Completed').length;
    document.getElementById('totalReports').innerText = reports.filter(r => r.labId === user.labId).length;
    
    // Load tests management section
    loadAdminTests();
}

// Load Bookings
async function loadBookings() {
    const user = SessionManager.getUser();
    if (!user) {
        window.location.href = 'index.html';
        return;
    }

    const bookings = JSON.parse(localStorage.getItem('bookings') || '[]');
    const labs = JSON.parse(localStorage.getItem('labs') || '[]');
    let userBookings = user.role === 'Patient' 
        ? bookings.filter(b => b.userId === user.id)
        : bookings.filter(b => b.labId === user.labId);

    const tableBody = document.getElementById('bookingsTable');
    tableBody.innerHTML = '';

    if (userBookings.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="6" class="text-center text-muted">No bookings found</td></tr>';
        return;
    }

    userBookings.forEach(booking => {
        const bookingDate = new Date(booking.bookingDate).toLocaleDateString('en-IN');
        const lab = labs.find(l => l.id === booking.labId);
        const labName = lab ? lab.name : `Lab #${booking.labId}`;
        
        let statusCell = `<span class="badge badge-${booking.status === 'Pending' ? 'warning' : booking.status === 'Approved' ? 'success' : 'info'}">${booking.status}</span>`;
        
        if (user.role === 'Admin') {
            statusCell = `
                <select class="form-control form-control-sm status-select" onchange="updateBookingStatus(${booking.id}, this.value)">
                    <option value="Pending" ${booking.status === 'Pending' ? 'selected' : ''}>Pending</option>
                    <option value="Approved" ${booking.status === 'Approved' ? 'selected' : ''}>Approved</option>
                    <option value="Completed" ${booking.status === 'Completed' ? 'selected' : ''}>Completed</option>
                </select>
            `;
        }
        const row = `<tr class="booking-row" data-status="${booking.status}">
            <td><strong>#${booking.id}</strong></td>
            <td>${booking.patientName}</td>
            <td>${booking.testName}</td>
            <td>${labName}</td>
            <td>${bookingDate}</td>
            <td>${statusCell}</td>
        </tr>`;
        tableBody.innerHTML += row;
    });
}

// Update Booking Status
async function updateBookingStatus(bookingId, newStatus) {
    const user = SessionManager.getUser();
    if (!user || user.role !== 'Admin') {
        showAlert('Access denied!', 'danger');
        return;
    }

    const bookings = JSON.parse(localStorage.getItem('bookings') || '[]');
    const booking = bookings.find(b => b.id === bookingId);
    if (booking) {
        booking.status = newStatus;
        localStorage.setItem('bookings', JSON.stringify(bookings));
        showAlert('Booking status updated!', 'success');
        loadBookings();
    }
}

// Load Reports
async function loadReports() {
    const user = SessionManager.getUser();
    if (!user) {
        window.location.href = 'index.html';
        return;
    }

    const reports = JSON.parse(localStorage.getItem('reports') || '[]');
    let userReports = user.role === 'Patient'
        ? reports.filter(r => r.userId === user.id)
        : reports.filter(r => r.labId === user.labId);

    const tableBody = document.getElementById('reportsTable');
    tableBody.innerHTML = '';

    if (userReports.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="5" class="text-center text-muted">No reports found</td></tr>';
        return;
    }

    userReports.forEach(report => {
        const uploadDate = new Date(report.uploadDate).toLocaleDateString('en-IN');
        const row = `<tr>
            <td>${report.id}</td>
            <td>${report.userId}</td>
            <td>${report.bookingId}</td>
            <td>${report.results.substring(0, 50)}...</td>
            <td>
                <button class="btn btn-sm btn-primary" onclick="viewReport(${report.id})">
                    <i class="fas fa-eye"></i> View
                </button>
            </td>
        </tr>`;
        tableBody.innerHTML += row;
    });
}

// View Report
async function viewReport(reportId) {
    const reports = JSON.parse(localStorage.getItem('reports') || '[]');
    const report = reports.find(r => r.id === reportId);
    if (report) {
        alert(`Report #${report.id}\n\nResults:\n${report.results}\n\nNotes:\n${report.notes}`);
    }
}

// Load Upload Reports (Admin)
async function loadUploadReports() {
    const user = SessionManager.getUser();
    if (!user || user.role !== 'Admin') {
        showAlert('Access denied!', 'danger');
        window.location.href = 'dashboard.html';
        return;
    }

    const bookings = JSON.parse(localStorage.getItem('bookings') || '[]');
    let labBookings = bookings.filter(b => b.labId === user.labId && b.status === 'Approved');
    
    const select = document.getElementById('bookingId');
    select.innerHTML = '<option value="">Select Booking</option>';

    labBookings.forEach(booking => {
        const option = `<option value="${booking.id}">ID: ${booking.id} - ${booking.patientName} - ${booking.testName}</option>`;
        select.innerHTML += option;
    });
}

// Check authentication on page load
function checkAuth() {
    const user = SessionManager.getUser();
    const currentPage = window.location.pathname.split('/').pop();
    if (!user && currentPage !== 'index.html' && currentPage !== 'register.html' && currentPage !== '') {
        window.location.href = 'index.html';
    }
}

// Load lab options
async function loadLabOptions(selectId) {
    const select = document.getElementById(selectId);
    if (!select) return;
    
    const labs = JSON.parse(localStorage.getItem('labs') || '[]');
    select.innerHTML = '<option value="">Select Lab</option>';
    labs.forEach(lab => {
        const option = document.createElement('option');
        option.value = lab.id;
        option.textContent = lab.name + (lab.location ? ` - ${lab.location}` : '');
        select.appendChild(option);
    });
}

function toggleRegisterLabSelect() {
    const roleSelect = document.getElementById('roleSelect');
    const labGroup = document.getElementById('labSelectGroup');
    if (!roleSelect || !labGroup) return;
    labGroup.style.display = roleSelect.value === 'Admin' ? 'block' : 'none';
}

// Sidebar navigation
function loadSidebar() {
    const user = SessionManager.getUser();
    if (!user) return;

    const sidebar = document.querySelector('.sidebar');
    if (!sidebar) return;

    let nav = `
        <h2><i class="fas fa-flask"></i> MediLab</h2>
        <a href="dashboard.html"><i class="fas fa-tachometer-alt"></i> Dashboard</a>
    `;
    if (user.role === 'Patient') {
        nav += `<a href="book-test.html"><i class="fas fa-plus-circle"></i> Book Test</a>`;
    }
    nav += `
        <a href="bookings.html"><i class="fas fa-list"></i> Bookings</a>
        <a href="reports.html"><i class="fas fa-file-medical"></i> Reports</a>
    `;
    if (user.role === 'Admin') {
        nav += `<a href="upload-reports.html"><i class="fas fa-upload"></i> Upload Report</a>
                <a href="manage-tests.html"><i class="fas fa-flask"></i> Manage Tests</a>`;
    }
    nav += `<a href="javascript:void(0);" onclick="logout()"><i class="fas fa-sign-out-alt"></i> Logout</a>`;
    sidebar.innerHTML = nav;
}

// Go to page helper
function goToPage(page) {
    window.location.href = page;
}

// View Bookings by Status
async function viewBookingsByStatus(status) {
    const user = SessionManager.getUser();
    if (!user) {
        window.location.href = 'index.html';
        return;
    }

    const bookings = JSON.parse(localStorage.getItem('bookings') || '[]');
    const labs = JSON.parse(localStorage.getItem('labs') || '[]');
    let filteredBookings = user.role === 'Patient'
        ? bookings.filter(b => b.userId === user.id && (status === 'All' || b.status === status))
        : bookings.filter(b => b.labId === user.labId && (status === 'All' || b.status === status));

    const statusText = status === 'All' ? 'All Bookings' : `${status} Bookings`;
    document.getElementById('bookingViewLabel').innerText = statusText;
    
    const tableBody = document.getElementById('bookingViewTableBody');
    tableBody.innerHTML = '';
    
    if (filteredBookings.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="6" class="text-center text-muted">No bookings found</td></tr>`;
    } else {
        filteredBookings.forEach(booking => {
            const bookingDate = new Date(booking.bookingDate).toLocaleDateString('en-IN');
            const lab = labs.find(l => l.id === booking.labId);
            const labName = lab ? lab.name : `Lab #${booking.labId}`;
            const statusBadge = `<span class="badge badge-${booking.status === 'Pending' ? 'warning' : booking.status === 'Approved' ? 'success' : booking.status === 'Completed' ? 'info' : 'secondary'}">${booking.status}</span>`;
            
            const row = `<tr>
                <td><strong>#${booking.id}</strong></td>
                <td>${booking.testName}</td>
                <td>${labName}</td>
                <td>${statusBadge}</td>
                <td>${bookingDate}</td>
            </tr>`;
            tableBody.innerHTML += row;
        });
    }
    
    $('#bookingViewModal').modal('show');
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    initializeSampleData();
    checkAuth();
    loadSidebar();
    initializeMobileMenu();
    
    if (document.getElementById('welcome')) loadDashboard();
    if (document.getElementById('bookingsTable')) loadBookings();
    if (document.getElementById('reportsTable')) loadReports();
    if (document.getElementById('bookingId')) loadUploadReports();
    if (document.getElementById('labSelect')) loadLabOptions('labSelect');
    if (document.getElementById('registerLab')) loadLabOptions('registerLab');
    if (document.getElementById('roleSelect')) {
        document.getElementById('roleSelect').addEventListener('change', toggleRegisterLabSelect);
    }
});

// Search and filter functionality
function filterBookings() {
    const searchInput = document.getElementById('searchBookings');
    const statusFilter = document.getElementById('statusFilter');
    
    if (!searchInput || !statusFilter) return;

    const searchTerm = searchInput.value.toLowerCase();
    const statusTerm = statusFilter.value;
    const rows = document.querySelectorAll('.booking-row');

    rows.forEach(row => {
        const text = row.textContent.toLowerCase();
        const rowStatus = row.getAttribute('data-status');
        
        const matchesSearch = !searchTerm || text.includes(searchTerm);
        const matchesStatus = !statusTerm || rowStatus === statusTerm;
        
        row.style.display = (matchesSearch && matchesStatus) ? '' : 'none';
    });

    const visibleRows = document.querySelectorAll('.booking-row:not([style*="display: none"])').length;
    const resultCounter = document.getElementById('resultCount');
    if (resultCounter) {
        resultCounter.textContent = `${visibleRows} booking${visibleRows !== 1 ? 's' : ''}`;
    }
}

document.addEventListener('DOMContentLoaded', function() {
    const searchInput = document.getElementById('searchInput');
    const statusFilter = document.getElementById('statusFilter');
    
    if (searchInput) {
        searchInput.addEventListener('input', filterBookings);
    }
    if (statusFilter) {
        statusFilter.addEventListener('change', filterBookings);
    }
});

// ===== TEST MANAGEMENT FUNCTIONS FOR ADMINS =====

// Load Tests for Admin Dashboard
async function loadAdminTests() {
    const user = SessionManager.getUser();
    if (!user || user.role !== 'Admin') {
        showAlert('Access denied!', 'danger');
        return;
    }

    const tests = JSON.parse(localStorage.getItem('tests') || '[]');
    const labTests = tests.filter(t => t.labId === user.labId);
    
    const testsContainer = document.getElementById('adminTestsContainer');
    if (!testsContainer) return;

    let html = `
        <div class="row mb-3">
            <div class="col-md-12">
                <button class="btn btn-success" onclick="showTestForm()">
                    <i class="fas fa-plus"></i> Add New Test
                </button>
            </div>
        </div>
        <div class="row">
    `;

    if (labTests.length === 0) {
        html += `<div class="col-md-12"><p class="text-muted">No tests added yet. Click "Add New Test" to start.</p></div>`;
    } else {
        labTests.forEach(test => {
            html += `
                <div class="col-md-6 col-lg-4 mb-3">
                    <div class="card border-left-primary">
                        <div class="card-body">
                            <h6 class="card-title"><i class="fas fa-test"></i> ${test.testName}</h6>
                            <p class="card-text small">
                                <strong>Category:</strong> ${test.category}<br>
                                <strong>Price:</strong> ₹${test.price}<br>
                                <strong>Turnaround:</strong> ${test.turnaroundTime}<br>
                                <strong>Description:</strong> ${test.description.substring(0, 60)}...
                            </p>
                            <button class="btn btn-sm btn-warning" onclick="editTest(${test.id})">
                                <i class="fas fa-edit"></i> Edit
                            </button>
                            <button class="btn btn-sm btn-danger" onclick="deleteTest(${test.id})">
                                <i class="fas fa-trash"></i> Delete
                            </button>
                        </div>
                    </div>
                </div>
            `;
        });
    }

    html += `</div>`;
    testsContainer.innerHTML = html;
}

// Show Test Add/Edit Form
function showTestForm(testId = null) {
    const user = SessionManager.getUser();
    if (!user || user.role !== 'Admin') {
        showAlert('Access denied!', 'danger');
        return;
    }

    const tests = JSON.parse(localStorage.getItem('tests') || '[]');
    const test = testId ? tests.find(t => t.id === testId) : null;

    const formHTML = `
        <div class="form-group">
            <label for="testName">Test Name *</label>
            <input type="text" id="testName" class="form-control" placeholder="e.g., Blood Test - CBC" value="${test ? test.testName : ''}" required>
        </div>
        <div class="form-group">
            <label for="testCategory">Category *</label>
            <select id="testCategory" class="form-control" required>
                <option value="">Select Category</option>
                <option value="Haematology" ${test && test.category === 'Haematology' ? 'selected' : ''}>Haematology</option>
                <option value="Biochemistry" ${test && test.category === 'Biochemistry' ? 'selected' : ''}>Biochemistry</option>
                <option value="Immunology" ${test && test.category === 'Immunology' ? 'selected' : ''}>Immunology</option>
                <option value="Virology" ${test && test.category === 'Virology' ? 'selected' : ''}>Virology</option>
                <option value="Microbiology" ${test && test.category === 'Microbiology' ? 'selected' : ''}>Microbiology</option>
                <option value="Endocrinology" ${test && test.category === 'Endocrinology' ? 'selected' : ''}>Endocrinology</option>
                <option value="Cardiology" ${test && test.category === 'Cardiology' ? 'selected' : ''}>Cardiology</option>
                <option value="Other" ${test && test.category === 'Other' ? 'selected' : ''}>Other</option>
            </select>
        </div>
        <div class="form-group">
            <label for="testPrice">Price (₹) *</label>
            <input type="number" id="testPrice" class="form-control" placeholder="e.g., 499" value="${test ? test.price : ''}" min="0" required>
        </div>
        <div class="form-group">
            <label for="testTurnaround">Turnaround Time *</label>
            <select id="testTurnaround" class="form-control" required>
                <option value="">Select Turnaround Time</option>
                <option value="24 hours" ${test && test.turnaroundTime === '24 hours' ? 'selected' : ''}>24 hours</option>
                <option value="48 hours" ${test && test.turnaroundTime === '48 hours' ? 'selected' : ''}>48 hours</option>
                <option value="72 hours" ${test && test.turnaroundTime === '72 hours' ? 'selected' : ''}>72 hours</option>
                <option value="1 week" ${test && test.turnaroundTime === '1 week' ? 'selected' : ''}>1 week</option>
            </select>
        </div>
        <div class="form-group">
            <label for="testDescription">Description *</label>
            <textarea id="testDescription" class="form-control" placeholder="Describe the test details, what it covers, etc." rows="3" required>${test ? test.description : ''}</textarea>
        </div>
    `;

    const modal = $('<div class="modal fade" id="testFormModal" tabindex="-1" role="dialog">' +
        '<div class="modal-dialog modal-lg" role="document">' +
        '<div class="modal-content">' +
        '<div class="modal-header">' +
        `<h5 class="modal-title">${test ? 'Edit Test' : 'Add New Test'}</h5>` +
        '<button type="button" class="close" data-dismiss="modal">&times;</button>' +
        '</div>' +
        '<div class="modal-body">' + formHTML + '</div>' +
        '<div class="modal-footer">' +
        '<button type="button" class="btn btn-secondary" data-dismiss="modal">Cancel</button>' +
        `<button type="button" class="btn btn-primary" onclick="saveTest(${test ? test.id : 'null'})">` +
        (test ? 'Update Test' : 'Add Test') + '</button>' +
        '</div>' +
        '</div>' +
        '</div>' +
        '</div>');

    $('body').append(modal);
    modal.modal('show');
    modal.on('hidden.bs.modal', function() {
        modal.remove();
    });
}

// Save Test (Add or Edit)
function saveTest(testId = null) {
    const user = SessionManager.getUser();
    if (!user || user.role !== 'Admin') {
        showAlert('Access denied!', 'danger');
        return;
    }

    const testName = document.getElementById('testName').value.trim();
    const testCategory = document.getElementById('testCategory').value;
    const testPrice = parseFloat(document.getElementById('testPrice').value);
    const testTurnaround = document.getElementById('testTurnaround').value;
    const testDescription = document.getElementById('testDescription').value.trim();

    // Validation
    if (!testName || !testCategory || !testPrice || !testTurnaround || !testDescription) {
        showAlert('All fields are required!', 'warning');
        return;
    }

    if (testPrice <= 0) {
        showAlert('Price must be greater than 0!', 'warning');
        return;
    }

    const tests = JSON.parse(localStorage.getItem('tests') || '[]');

    if (testId) {
        // Edit existing test
        const test = tests.find(t => t.id === testId);
        if (test && test.labId === user.labId) {
            test.testName = testName;
            test.category = testCategory;
            test.price = testPrice;
            test.turnaroundTime = testTurnaround;
            test.description = testDescription;
            localStorage.setItem('tests', JSON.stringify(tests));
            showAlert('✓ Test updated successfully!', 'success');
        }
    } else {
        // Add new test
        const newTest = {
            id: Date.now(),
            labId: user.labId,
            testName,
            category: testCategory,
            price: testPrice,
            turnaroundTime: testTurnaround,
            description: testDescription
        };
        tests.push(newTest);
        localStorage.setItem('tests', JSON.stringify(tests));
        showAlert('✓ Test added successfully!', 'success');
    }

    $('#testFormModal').modal('hide');
    setTimeout(() => loadAdminTests(), 500);
}

// Edit Test
function editTest(testId) {
    showTestForm(testId);
}

// Delete Test
function deleteTest(testId) {
    const user = SessionManager.getUser();
    if (!user || user.role !== 'Admin') {
        showAlert('Access denied!', 'danger');
        return;
    }

    if (confirm('Are you sure you want to delete this test?')) {
        const tests = JSON.parse(localStorage.getItem('tests') || '[]');
        const testIndex = tests.findIndex(t => t.id === testId && t.labId === user.labId);
        
        if (testIndex !== -1) {
            tests.splice(testIndex, 1);
            localStorage.setItem('tests', JSON.stringify(tests));
            showAlert('✓ Test deleted successfully!', 'success');
            loadAdminTests();
        } else {
            showAlert('Test not found!', 'danger');
        }
    }
}

// Load Available Tests for Booking
async function loadAvailableTests() {
    await loadLabOptions('bookingLabSelect');
    
    const bookingLabSelect = document.getElementById('bookingLabSelect');
    if (!bookingLabSelect) return;
    
    bookingLabSelect.addEventListener('change', function() {
        const labId = parseInt(this.value);
        const tests = JSON.parse(localStorage.getItem('tests') || '[]');
        const labTests = tests.filter(t => t.labId === labId);
        
        const testsSelect = document.getElementById('availableTestsSelect');
        if (!testsSelect) return;
        
        testsSelect.innerHTML = '<option value="">Select Test</option>';
        labTests.forEach(test => {
            const option = document.createElement('option');
            option.value = test.testName;
            option.textContent = `${test.testName} (₹${test.price}, ${test.turnaroundTime})`;
            testsSelect.appendChild(option);
        });
    });
}
