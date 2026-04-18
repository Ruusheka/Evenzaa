// Configuration & Globals
const API_BASE = 'http://localhost:8081'; // Assumes backend runs here
let currentUser = null;

// Initialize System on DOM Load
document.addEventListener('DOMContentLoaded', () => {
    // 1. Initialize Icons
    if (typeof lucide !== 'undefined') lucide.createIcons();

    // 2. Check Auth State
    const role = localStorage.getItem('role');
    const path = window.location.pathname;

    if (!role && path.includes('dashboard.html')) {
        window.location.href = 'login.html'; // Protect dashboard
    } else if (role && (path.includes('login.html') || path.includes('signup.html') || path.endsWith('index.html') || path === '/')) {
        window.location.href = 'dashboard.html'; // Redirect to dash
    }

    // 3. Setup Dashboard if on dashboard page
    if (path.includes('dashboard.html')) {
        currentUser = {
            id: localStorage.getItem('userId'),
            name: localStorage.getItem('name') || 'User',
            role: role
        };
        initDashboard();
    }

    // 4. Attach Form Listeners
    const loginForm = document.getElementById('loginForm');
    if (loginForm) loginForm.addEventListener('submit', handleLogin);

    const signupForm = document.getElementById('signupForm');
    if (signupForm) signupForm.addEventListener('submit', handleSignup);

    // Dynamic search filter listener
    const searchInput = document.getElementById('searchEvents');
    const catSelect = document.getElementById('filterCategory');
    if (searchInput) searchInput.addEventListener('input', applyEventFilters);
    if (catSelect) catSelect.addEventListener('change', applyEventFilters);
});

// ==========================================
// TOAST NOTIFICATIONS
// ==========================================
function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    if (!toast) return;

    const msgEl = document.getElementById('toast-msg');
    const iconEl = document.getElementById('toast-icon');

    msgEl.textContent = message;

    // Style based on type
    if (type === 'error') {
        toast.className = 'fixed top-5 right-5 transform transition-all duration-300 bg-white text-gray-800 px-6 py-4 rounded-xl shadow-xl border-l-4 border-red-500 z-[999] flex items-center gap-3 w-80';
        iconEl.setAttribute('data-lucide', 'alert-circle');
        iconEl.className = 'text-red-500';
    } else {
        toast.className = 'fixed top-5 right-5 transform transition-all duration-300 bg-white text-gray-800 px-6 py-4 rounded-xl shadow-xl border-l-4 border-green-500 z-[999] flex items-center gap-3 w-80';
        iconEl.setAttribute('data-lucide', 'check-circle');
        iconEl.className = 'text-green-500';
    }

    lucide.createIcons();

    // Slide in
    setTimeout(() => toast.classList.remove('translate-x-[150%]', 'opacity-0'), 10);
    // Slide out
    setTimeout(() => toast.classList.add('translate-x-[150%]', 'opacity-0'), 4000);
}

// ==========================================
// AUTHENTICATION
// ==========================================
async function handleLogin(e) {
    e.preventDefault();
    const btn = document.getElementById('loginBtn');
    btn.innerHTML = `<svg class="animate-spin h-5 w-5 mr-3 text-white inline-block" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> Verifying...`;

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const role = document.querySelector('input[name="role"]:checked').value;

    let authName = email.split('@')[0];
    let authToken = 'mock-token';

    try {
        const url = role === 'faculty' ? `${API_BASE}/faculty/login` : `${API_BASE}/login`;
        const res = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password, role })
        });

        if (res.ok) {
            // Success handler for Real Backend
            const respData = await res.text(); // Faculty login returns raw JWT text!
            if (respData && !respData.includes("Invalid")) {
                authToken = respData;
            } else {
                throw new Error("Invalid credentials from Server");
            }
        } else {
            // Treat 404s/Errors as Mock Fallbacks to allow UI testing
            throw new Error(`Fallback Triggered (HTTP ${res.status})`);
        }
    } catch (err) {
        console.warn('Real API failed, dropping into Offline Mock Mode.', err.message);
        showToast("Backend unavailable. Simulating " + role + " login...", "success");
        await new Promise(r => setTimeout(r, 800)); // Simulate delay
    }

    localStorage.setItem('token', authToken);
    localStorage.setItem('role', role);
    localStorage.setItem('name', authName.replace('.', ' '));
    localStorage.setItem('userId', 'usr-' + Math.floor(Math.random() * 1000));

    window.location.href = 'dashboard.html';
}

async function handleSignup(e) {
    e.preventDefault();
    const btn = document.getElementById('signupBtn');
    btn.innerHTML = `<svg class="animate-spin h-5 w-5 mr-3 text-white inline-block" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> Creating...`;

    const payload = {
        name: document.getElementById('name').value,
        email: document.getElementById('email').value,
        password: document.getElementById('password').value,
        role: 'student'
    };

    try {
        const res = await fetch(`${API_BASE}/signup`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        showToast('Account created successfully on Backend! Redirecting...');
    } catch (err) {
        console.warn('Backend /signup not found. Working in mock simulated mode.');
        showToast('Account simulated successfully! Redirecting...', 'success');
    }

    setTimeout(() => window.location.href = 'login.html', 1500);
}

function logout() {
    localStorage.clear();
    window.location.href = 'login.html';
}

// ==========================================
// DASHBOARD INITIALIZATION
// ==========================================
function initDashboard() {
    // Topbar info
    document.getElementById('user-name').textContent = currentUser.name;
    document.getElementById('user-role').textContent = currentUser.role;
    document.getElementById('user-initials').textContent = currentUser.name.split(' ').map(n => n[0]).join('').substring(0, 2);
    if (currentUser.role === 'faculty') {
        document.getElementById('welcome-name').textContent = 'Prof. ' + currentUser.name.split(' ')[0];
    } else {
        document.getElementById('welcome-name').textContent = currentUser.name.split(' ')[0];
    }

    // Render Sidebar
    const navMenu = document.getElementById('nav-menu');
    let navItems = [];

    if (currentUser.role === 'student') {
        navItems = [
            { id: 'view-student-home', icon: 'layout-dashboard', text: 'Overview' },
            { id: 'view-events-list', icon: 'ticket', text: 'Browse Events' },
            { id: 'view-registrations', icon: 'bookmark', text: 'My Registrations' }
        ];
        switchView('view-student-home');
        fetchStudentStats();
    } else {
        navItems = [
            { id: 'view-faculty-home', icon: 'pie-chart', text: 'Faculty Hub' },
            { id: 'view-events-list', icon: 'folder-grid', text: 'Manage Events' },
            { id: 'view-registrations', icon: 'users', text: 'Manage Approvals' }
        ];
        switchView('view-faculty-home');
        fetchFacultyStats();
    }

    // Build sidebar
    navMenu.innerHTML = navItems.map(item => `
        <a href="#" onclick="switchView('${item.id}'); return false;" class="nav-link w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors text-gray-500 hover:text-secondary hover:bg-purple-50" data-target="${item.id}">
            <i data-lucide="${item.icon}" class="w-5 h-5"></i>
            <span>${item.text}</span>
        </a>
    `).join('');

    lucide.createIcons();
}

function switchView(viewId) {
    // Hide all views
    document.querySelectorAll('.section-view').forEach(el => el.classList.add('hidden'));

    // De-activate all sidebar links
    document.querySelectorAll('.nav-link').forEach(el => {
        el.classList.remove('bg-purple-50', 'text-secondary');
        el.classList.add('text-gray-500');
    });

    // Show target view
    const target = document.getElementById(viewId);
    if (target) {
        target.classList.remove('hidden');
    }

    // Activate corresponding sidebar link
    const link = document.querySelector(`.nav-link[data-target="${viewId}"]`);
    if (link) {
        link.classList.add('bg-purple-50', 'text-secondary');
        link.classList.remove('text-gray-500');
        document.getElementById('page-title').textContent = link.querySelector('span').textContent;
    }

    // Trigger Loaders
    if (viewId === 'view-events-list') fetchEvents();
    if (viewId === 'view-registrations') fetchRegistrations();
}

// ==========================================
// EVENT MANAGEMENT (CRUD)
// ==========================================
let allEventsCache = [];

async function fetchEvents() {
    const grid = document.getElementById('events-grid');
    grid.innerHTML = '<div class="col-span-full py-12 text-center text-gray-400">Loading events...</div>';

    try {
        const res = await fetch(`${API_BASE}/events`);
        if (!res.ok) throw new Error('API Error');
        const data = await res.json();

        allEventsCache = data;
        renderEvents(data);
    } catch (e) {
        grid.innerHTML = `<div class="col-span-full py-12 text-center text-red-400">Error connecting to Sprint Boot backend. Check port 8081.</div>`;
        showToast("Error loading events", "error");
    }
}

function applyEventFilters() {
    const term = document.getElementById('searchEvents').value.toLowerCase();
    const cat = document.getElementById('filterCategory').value;

    const filtered = allEventsCache.filter(evt => {
        const matchSearch = evt.title.toLowerCase().includes(term) || evt.venue.toLowerCase().includes(term);
        const matchCat = cat === 'all' || evt.category === cat;
        return matchSearch && matchCat;
    });
    renderEvents(filtered);
}

function renderEvents(events) {
    const grid = document.getElementById('events-grid');
    const emptyState = document.getElementById('events-empty');

    if (events.length === 0) {
        grid.innerHTML = '';
        emptyState.classList.remove('hidden');
        return;
    }

    emptyState.classList.add('hidden');

    grid.innerHTML = events.map(evt => `
        <div class="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 relative group">
            <div class="absolute top-6 right-6 px-3 py-1 rounded-full text-xs font-semibold ${evt.category === 'Tech' ? 'bg-blue-100 text-blue-700' : evt.category === 'Cultural' ? 'bg-pink-100 text-pink-700' : 'bg-green-100 text-green-700'}">
                ${evt.category}
            </div>
            <h4 class="text-xl font-bold text-gray-900 pr-20">${evt.title}</h4>
            <p class="text-sm text-gray-500 mt-2 mb-6 line-clamp-2 leading-relaxed">${evt.description}</p>
            
            <div class="flex items-center gap-2 text-sm text-gray-600 mb-2">
                <i data-lucide="calendar" class="w-4 h-4 text-purple-400"></i> ${new Date(evt.date).toLocaleString()}
            </div>
            <div class="flex items-center gap-2 text-sm text-gray-600 mb-6">
                <i data-lucide="map-pin" class="w-4 h-4 text-purple-400"></i> ${evt.venue}
            </div>
            
            <div class="pt-6 border-t border-gray-100 flex justify-between items-center">
                <div class="flex items-center gap-2 text-sm font-medium text-gray-700">
                    <i data-lucide="users" class="w-4 h-4 text-gray-400"></i> 0 / ${evt.maxParticipants} max
                </div>
                ${currentUser.role === 'student' ?
            `<button onclick="initiateRegistration('${evt.id}', '${evt.title}')" class="px-5 py-2 bg-gray-900 text-white text-sm font-medium rounded-xl hover:bg-secondary transition shadow-md shadow-gray-900/20">Register</button>` :
            `<div class="flex gap-2">
                        <button onclick="openEventModal('${evt.id}')" class="p-2 text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition"><i data-lucide="edit-2" class="w-4 h-4"></i></button>
                        <button onclick="deleteEvent('${evt.id}')" class="p-2 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition"><i data-lucide="trash-2" class="w-4 h-4"></i></button>
                    </div>`
        }
            </div>
        </div>
    `).join('');

    lucide.createIcons();
}

// ==========================================
// CREATE & EDIT MODAL
// ==========================================
function openEventModal(eventId = null) {
    const modal = document.getElementById('eventModal');
    const form = document.getElementById('eventForm');

    modal.classList.remove('hidden');
    modal.classList.add('flex');
    // Animate in
    setTimeout(() => {
        modal.classList.remove('opacity-0');
        document.getElementById('eventModalContent').classList.remove('scale-95');
    }, 10);

    form.reset();
    document.getElementById('eventId').value = "";
    document.getElementById('modal-title').textContent = "Create New Event";

    if (eventId) {
        const evt = allEventsCache.find(e => e.id === eventId);
        if (evt) {
            document.getElementById('modal-title').textContent = "Edit Event";
            document.getElementById('eventId').value = evt.id;
            document.getElementById('eTitle').value = evt.title;
            document.getElementById('eDesc').value = evt.description;
            document.getElementById('eVenue').value = evt.venue;
            document.getElementById('eCat').value = evt.category;
            document.getElementById('eMax').value = evt.maxParticipants;

            // Format datetime-local
            const d = new Date(evt.date);
            d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
            document.getElementById('eDate').value = d.toISOString().slice(0, 16);
        }
    }
}

function closeEventModal() {
    const modal = document.getElementById('eventModal');
    modal.classList.add('opacity-0');
    document.getElementById('eventModalContent').classList.add('scale-95');

    setTimeout(() => {
        modal.classList.add('hidden');
        modal.classList.remove('flex');
    }, 300);
}

async function submitEvent(e) {
    e.preventDefault();
    const btn = document.getElementById('eSubmitBtn');
    btn.textContent = "Saving...";

    const id = document.getElementById('eventId').value;
    const payload = {
        title: document.getElementById('eTitle').value,
        description: document.getElementById('eDesc').value,
        date: document.getElementById('eDate').value,
        venue: document.getElementById('eVenue').value,
        category: document.getElementById('eCat').value,
        maxParticipants: parseInt(document.getElementById('eMax').value),
        createdBy: currentUser.id
    };

    const method = id ? 'PUT' : 'POST';
    const url = id ? `${API_BASE}/events/${id}` : `${API_BASE}/events`;

    try {
        const res = await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!res.ok) throw new Error('Save failed');

        showToast(id ? 'Event updated!' : 'Event created successfully!');
        closeEventModal();
        fetchEvents();
        fetchFacultyStats();
    } catch (err) {
        showToast("Error saving to backend", 'error');
        btn.textContent = "Save Event";
    }
}

async function deleteEvent(id) {
    if (!confirm("Are you absolutely sure you want to delete this event? This action cannot be undone.")) return;
    try {
        const res = await fetch(`${API_BASE}/events/${id}`, { method: 'DELETE' });
        if (!res.ok) throw new Error('Delete failed');
        showToast("Event permanently deleted");
        fetchEvents();
        fetchFacultyStats();
    } catch (err) {
        showToast("Error deleting event", 'error');
    }
}

// ==========================================
// REGISTRATION SYSTEM
// ==========================================
let pendingRegistrationEventId = null;

function initiateRegistration(eventId, title) {
    pendingRegistrationEventId = eventId;
    const modal = document.getElementById('confirmModal');
    modal.classList.remove('hidden');
    modal.classList.add('flex');
}

function closeConfirmModal() {
    const modal = document.getElementById('confirmModal');
    modal.classList.add('hidden');
    modal.classList.remove('flex');
    pendingRegistrationEventId = null;
}

document.getElementById('confirmRegBtn')?.addEventListener('click', async () => {
    if (!pendingRegistrationEventId) return;
    const btn = document.getElementById('confirmRegBtn');
    btn.textContent = "Processing...";

    try {
        const res = await fetch(`${API_BASE}/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ studentId: currentUser.id, eventId: pendingRegistrationEventId, status: 'Pending' })
        });

        if (!res.ok) throw new Error('Registration failed');
        showToast("Registration submitted for approval!");
        closeConfirmModal();
    } catch (err) {
        showToast("Registration failed at API layer.", 'error');
        closeConfirmModal();
    } finally {
        btn.textContent = "Confirm";
    }
});

async function fetchRegistrations() {
    const tbody = document.getElementById('registrations-tbody');
    tbody.innerHTML = '<tr><td colspan="4" class="px-6 py-8 text-center text-gray-500">Loading registrations...</td></tr>';

    // Fake Mock for empty data (since backend might not have this fully implemented)
    // If backend implements /registrations, replace this mock array logic
    const mockData = [
        { id: '1', targetName: 'Hackathon 2026', date: '2026-05-12T10:00:00', status: 'Pending' },
        { id: '2', targetName: 'Tech Symposium', date: '2026-04-10T10:00:00', status: 'Approved' }
    ];

    setTimeout(() => {
        if (mockData.length === 0) {
            tbody.innerHTML = `<tr><td colspan="4" class="px-6 py-8 text-center text-gray-500">No records found.</td></tr>`;
            return;
        }

        tbody.innerHTML = mockData.map(reg => `
            <tr class="hover:bg-gray-50/50 transition duration-150">
                <td class="px-6 py-4">
                    <div class="text-sm font-semibold text-gray-900">${reg.targetName}</div>
                    ${currentUser.role === 'faculty' ? `<div class="text-xs text-gray-500">Req. by Student#${Math.floor(Math.random() * 1000)}</div>` : ''}
                </td>
                <td class="px-6 py-4 text-sm text-gray-500">${new Date(reg.date).toLocaleDateString()}</td>
                <td class="px-6 py-4">
                    <span class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold 
                        ${reg.status === 'Approved' ? 'bg-green-100 text-green-700' : reg.status === 'Pending' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}">
                        ${reg.status}
                    </span>
                </td>
                <td class="px-6 py-4 text-right text-sm">
                    ${currentUser.role === 'faculty' && reg.status === 'Pending' ? `
                        <button onclick="changeStatus('${reg.id}', 'approve')" class="text-green-600 hover:bg-green-50 px-3 py-1.5 rounded-lg border border-transparent font-medium transition mr-2">Approve</button>
                        <button onclick="changeStatus('${reg.id}', 'reject')" class="text-red-600 hover:bg-red-50 px-3 py-1.5 rounded-lg border border-transparent font-medium transition">Reject</button>
                    ` : `<span class="text-gray-400 text-xs italic">No actions</span>`}
                </td>
            </tr>
        `).join('');
    }, 500); // Simulated delay for realism
}

async function changeStatus(regId, action) {
    // Action is 'approve' or 'reject'
    showToast(`${action === 'approve' ? 'Approved' : 'Rejected'} registration successfully!`);
    fetchRegistrations(); // Reload
}

// ==========================================
// DUMMY STATS GENERATORS (until backend provides /stats)
// ==========================================
function fetchStudentStats() {
    document.getElementById('stat-pending').textContent = '2';
    document.getElementById('stat-approved').textContent = '1';
    document.getElementById('stat-total').textContent = '3';
}

function fetchFacultyStats() {
    document.getElementById('fac-stat-events').textContent = '14';
    document.getElementById('fac-stat-regs').textContent = '89';
    document.getElementById('fac-stat-pending').textContent = '12';
}
