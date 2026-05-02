/* ===== SHARED NAVIGATION & UTILITIES ===== */

/**
 * Injects the navbar HTML into the page.
 * @param {string} activePage - The current page identifier
 */
function initNavbar(activePage) {
    const navHTML = `
    <nav class="navbar">
        <a href="index.html" class="brand"><span class="brand-c">ℂ</span>ozy <span>Corner</span></a>

        <button class="hamburger" id="hamburgerBtn" onclick="toggleMobileNav()">
            <span></span><span></span><span></span>
        </button>

        <ul class="nav-links" id="navLinks">
            <li><a href="index.html" data-page="home">Home</a></li>
            <li><a href="pomodoro.html" data-page="pomodoro">Pomodoro</a></li>
            <li><a href="spotify.html" data-page="spotify">Music</a></li>
            <li><a href="todo.html" data-page="todo">Todo</a></li>
            <li><a href="games.html" data-page="games">Games</a></li>
            <li><a href="#" data-page="cafes" onclick="openMap(); return false;">Cafes</a></li>
        </ul>

        <div class="nav-actions" id="navActions">
            <button class="btn-icon" id="modeBtn" onclick="changeMode()" title="Toggle Theme">🌙</button>
            <!-- Auth buttons will be injected dynamically -->
        </div>
    </nav>
    `;

    document.body.insertAdjacentHTML('afterbegin', navHTML);

    // Mark active link
    const links = document.querySelectorAll('.nav-links a');
    links.forEach(link => {
        if (link.dataset.page === activePage) {
            link.classList.add('active');
        }
    });

    // Inject toast container
    injectToast();

    // Inject auth modals
    injectAuthModals();

    // Inject map modal (HTML only, scripts loaded separately)
    injectMapModal();

    // Inject persistent mini Spotify player on non-spotify pages
    injectMiniPlayer(activePage);

    // Update navbar auth state (show Hi username or Login/Signup)
    updateNavAuth();
}

/* ===== NAV AUTH STATE ===== */
function updateNavAuth() {
    var actions = document.getElementById('navActions');
    if (!actions) return;

    // Remove old auth buttons (keep the Mode button)
    var oldAuth = actions.querySelectorAll('.auth-nav-btn, .user-greeting, .logout-btn');
    oldAuth.forEach(function (el) { el.remove(); });

    var user = getCurrentUser();
    if (user && user.username) {
        // Show greeting and logout
        var greeting = document.createElement('span');
        greeting.className = 'user-greeting';
        greeting.innerHTML = '☕ Hi, <strong>' + user.username + '</strong>';
        actions.appendChild(greeting);

        var logoutBtn = document.createElement('button');
        logoutBtn.className = 'btn-ghost logout-btn';
        logoutBtn.textContent = 'Logout';
        logoutBtn.onclick = logoutUser;
        actions.appendChild(logoutBtn);
    } else {
        // Show Login and Sign Up
        var loginBtn = document.createElement('button');
        loginBtn.className = 'btn-ghost auth-nav-btn';
        loginBtn.textContent = 'Login';
        loginBtn.onclick = openLogin;
        actions.appendChild(loginBtn);

        var signupBtn = document.createElement('button');
        signupBtn.className = 'btn-ghost auth-nav-btn';
        signupBtn.textContent = 'Sign Up';
        signupBtn.onclick = openSignup;
        actions.appendChild(signupBtn);
    }
}

/* ===== TOAST / IN-PAGE POPUP (replaces alerts) ===== */
function injectToast() {
    const css = document.createElement('style');
    css.textContent = `
    .cozy-toast-container { position:fixed; top:24px; right:24px; z-index:9999; display:flex; flex-direction:column; gap:10px; pointer-events:none; }
    .cozy-toast {
        pointer-events:auto;
        min-width:260px; max-width:380px;
        padding:16px 22px;
        border-radius:14px;
        background:rgba(255,255,255,0.92);
        backdrop-filter:blur(16px);
        -webkit-backdrop-filter:blur(16px);
        border:1px solid rgba(90,122,46,0.2);
        box-shadow:0 12px 40px rgba(0,0,0,0.18);
        font-family:'Outfit',sans-serif;
        font-size:0.95rem;
        font-weight:500;
        color:#2d3a1a;
        animation:toastIn 0.4s ease;
        display:flex; align-items:center; gap:12px;
    }
    .cozy-toast.toast-error {
        border:1px solid rgba(229,57,53,0.3);
        background:rgba(255,235,235,0.95);
    }
    .cozy-toast.toast-success {
        border:1px solid rgba(90,122,46,0.3);
        background:rgba(235,255,235,0.95);
    }
    .cozy-toast.toast-warning {
        border:1px solid rgba(232,168,56,0.3);
        background:rgba(255,248,230,0.95);
    }
    .cozy-toast.fade-out { animation:toastOut 0.3s ease forwards; }
    .cozy-toast .toast-icon { font-size:1.4rem; flex-shrink:0; }
    .cozy-toast .toast-msg { flex:1; }
    .cozy-toast .toast-close { background:none; border:none; font-size:1.1rem; cursor:pointer; color:#999; padding:2px 4px; }
    .cozy-toast .toast-close:hover { color:#333; }
    @keyframes toastIn { from{opacity:0;transform:translateX(40px);} to{opacity:1;transform:translateX(0);} }
    @keyframes toastOut { from{opacity:1;transform:translateX(0);} to{opacity:0;transform:translateX(40px);} }

    /* User greeting in navbar */
    .user-greeting {
        color: white;
        font-size: 0.92rem;
        font-weight: 500;
        padding: 6px 14px;
        border-radius: 10px;
        background: rgba(255,255,255,0.12);
        backdrop-filter: blur(8px);
        white-space: nowrap;
        display: flex;
        align-items: center;
        gap: 6px;
    }
    .user-greeting strong {
        color: #f0c36d;
        font-weight: 700;
    }
    `;
    document.head.appendChild(css);

    const container = document.createElement('div');
    container.className = 'cozy-toast-container';
    container.id = 'toastContainer';
    document.body.appendChild(container);
}

/**
 * Show an in-page toast popup instead of alert()
 * @param {string} message - The message to show
 * @param {string} type - 'success', 'info', 'warning', 'error'
 * @param {number} duration - milliseconds to show (default 3500)
 */
function showToast(message, type, duration) {
    type = type || 'info';
    duration = duration || 3500;
    var icons = { success: '&#10004;', info: '&#8505;', warning: '&#9888;', error: '&#10060;' };
    var container = document.getElementById('toastContainer');
    if (!container) return;

    var toast = document.createElement('div');
    toast.className = 'cozy-toast toast-' + type;
    toast.innerHTML = '<span class="toast-icon">' + (icons[type] || icons.info) + '</span>' +
        '<span class="toast-msg">' + message + '</span>' +
        '<button class="toast-close" onclick="this.parentElement.classList.add(\'fade-out\');setTimeout(function(){this.remove()}.bind(this.parentElement),300)">&times;</button>';
    container.appendChild(toast);

    setTimeout(function () {
        toast.classList.add('fade-out');
        setTimeout(function () { toast.remove(); }, 300);
    }, duration);
}

/**
 * Mobile hamburger toggle
 */
function toggleMobileNav() {
    const btn = document.getElementById('hamburgerBtn');
    const links = document.getElementById('navLinks');
    btn.classList.toggle('open');
    links.classList.toggle('show');
}

/* ===== THEME ===== */
var isNight = true;

function changeMode() {
    const video = document.getElementById('bgVideo');
    if (!video) return;
    const source = video.querySelector('source');

    if (isNight) {
        source.src = 'day.mp4';
    } else {
        source.src = 'night-rain.mp4';
    }

    video.load();
    video.play();
    isNight = !isNight;

    // Update button emoji
    var modeBtn = document.getElementById('modeBtn');
    if (modeBtn) modeBtn.textContent = isNight ? '🌙' : '☀️';

    // Save mode to DB if logged in
    var uid = getUserId();
    if (uid) {
        var theme = isNight ? 'night' : 'day';
        apiPut('/mode/' + uid, { theme: theme });
    }
}

// Keyboard shortcut
document.addEventListener('keydown', function (e) {
    if (e.key === 't' && !['INPUT', 'TEXTAREA'].includes(e.target.tagName)) {
        changeMode();
    }
});

/* ===== AUTH MODALS ===== */
function injectAuthModals() {
    const html = `
    <!-- LOGIN MODAL -->
    <div id="loginModal" class="modal-overlay" onclick="if(event.target===this)closeLogin()">
        <div class="modal-content">
            <button class="modal-close" onclick="closeLogin()">✕</button>
            <h3>Welcome Back</h3>
            <p class="modal-subtitle">Sign in to your Cozy Corner</p>
            <input type="text" id="loginUser" placeholder="Username" autocomplete="username">
            <input type="password" id="loginPass" placeholder="Password" autocomplete="current-password">
            <button class="submit-btn" id="loginSubmitBtn" onclick="loginUser()">Login</button>
            <p class="modal-switch">Don't have an account? <a href="#" onclick="closeLogin();openSignup();return false;">Sign Up</a></p>
        </div>
    </div>

    <!-- SIGNUP MODAL -->
    <div id="signupModal" class="modal-overlay" onclick="if(event.target===this)closeSignup()">
        <div class="modal-content signup-modal-wide">
            <button class="modal-close" onclick="closeSignup()">✕</button>
            <h3>Create Account</h3>
            <p class="modal-subtitle">Join Cozy Corner today</p>
            <input type="text" id="signupUser" placeholder="Username *" autocomplete="username" required>
            <input type="email" id="signupEmail" placeholder="Email *" autocomplete="email" required>
            <input type="password" id="signupPass" placeholder="Password *" autocomplete="new-password" required>
            <input type="password" id="signupConfirmPass" placeholder="Confirm Password *" autocomplete="new-password" required>
            <div class="signup-row">
                <div class="signup-field">
                    <label for="signupDob">Date of Birth</label>
                    <input type="date" id="signupDob">
                </div>
                <div class="signup-field">
                    <label for="signupPhone">Phone</label>
                    <input type="tel" id="signupPhone" placeholder="Phone number">
                </div>
            </div>
            <button class="submit-btn" id="signupSubmitBtn" onclick="signupUser()">Create Account</button>
            <p class="modal-switch">Already have an account? <a href="#" onclick="closeSignup();openLogin();return false;">Login</a></p>
        </div>
    </div>
    `;
    document.body.insertAdjacentHTML('beforeend', html);

    // Add modal styles
    const modalCSS = document.createElement('style');
    modalCSS.textContent = `
    .modal-subtitle {
        color: var(--text-muted, #7a8a5a);
        font-size: 0.9rem;
        margin-bottom: 20px;
        margin-top: -12px;
    }
    .modal-switch {
        margin-top: 16px;
        font-size: 0.85rem;
        color: var(--text-muted, #7a8a5a);
    }
    .modal-switch a {
        color: var(--primary, #5a7a2e);
        font-weight: 600;
        text-decoration: none;
    }
    .modal-switch a:hover {
        text-decoration: underline;
    }
    .signup-modal-wide {
        width: 400px !important;
    }
    .signup-row {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 12px;
        margin-bottom: 14px;
    }
    .signup-field {
        display: flex;
        flex-direction: column;
        text-align: left;
    }
    .signup-field label {
        font-size: 0.8rem;
        color: var(--text-muted, #7a8a5a);
        margin-bottom: 4px;
        font-weight: 500;
    }
    .signup-field input {
        margin-bottom: 0 !important;
    }
    .submit-btn:disabled {
        opacity: 0.6;
        cursor: not-allowed;
        transform: none !important;
    }
    .submit-btn .spinner {
        display: inline-block;
        width: 16px;
        height: 16px;
        border: 2px solid rgba(255,255,255,0.3);
        border-top-color: white;
        border-radius: 50%;
        animation: spin 0.6s linear infinite;
        margin-right: 8px;
        vertical-align: middle;
    }
    @keyframes spin {
        to { transform: rotate(360deg); }
    }
    @media (max-width: 480px) {
        .signup-modal-wide { width: 90vw !important; }
        .signup-row { grid-template-columns: 1fr; }
    }
    `;
    document.head.appendChild(modalCSS);

    // Enter key support for login
    setTimeout(function () {
        var loginPass = document.getElementById('loginPass');
        if (loginPass) {
            loginPass.addEventListener('keydown', function (e) {
                if (e.key === 'Enter') loginUser();
            });
        }
        var loginUser_input = document.getElementById('loginUser');
        if (loginUser_input) {
            loginUser_input.addEventListener('keydown', function (e) {
                if (e.key === 'Enter') loginUser();
            });
        }
        // Enter key for signup
        var signupPhone = document.getElementById('signupPhone');
        if (signupPhone) {
            signupPhone.addEventListener('keydown', function (e) {
                if (e.key === 'Enter') signupUser();
            });
        }
        var signupConfirmPass = document.getElementById('signupConfirmPass');
        if (signupConfirmPass) {
            signupConfirmPass.addEventListener('keydown', function (e) {
                if (e.key === 'Enter') signupUser();
            });
        }
    }, 100);
}

function openLogin() { document.getElementById('loginModal').classList.add('show'); }
function closeLogin() { document.getElementById('loginModal').classList.remove('show'); }
function openSignup() { document.getElementById('signupModal').classList.add('show'); }
function closeSignup() { document.getElementById('signupModal').classList.remove('show'); }

/* ===== SIGNUP — calls the backend API ===== */
async function signupUser() {
    var username = document.getElementById('signupUser').value.trim();
    var email = document.getElementById('signupEmail').value.trim();
    var password = document.getElementById('signupPass').value;
    var confirmPass = document.getElementById('signupConfirmPass').value;
    var dob = document.getElementById('signupDob').value || null;
    var phone = document.getElementById('signupPhone').value.trim() || null;

    // Validation
    if (!username || !email || !password) {
        showToast('Please fill all required fields (Username, Email, Password)', 'warning');
        return;
    }
    if (password.length < 4) {
        showToast('Password must be at least 4 characters', 'warning');
        return;
    }
    if (password !== confirmPass) {
        showToast('Passwords do not match!', 'warning');
        return;
    }
    // Basic email validation
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        showToast('Please enter a valid email address', 'warning');
        return;
    }

    // Disable button & show spinner
    var btn = document.getElementById('signupSubmitBtn');
    btn.disabled = true;
    btn.innerHTML = '<span class="spinner"></span> Creating...';

    try {
        var res = await fetch(API_BASE + '/users/signup', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: username, email: email, password: password, dob: dob, phone: phone })
        });
        var data = await res.json();

        if (!res.ok) {
            // Server returned an error
            if (res.status === 409) {
                showToast('Username or email already exists! Please try a different one.', 'error');
            } else {
                showToast(data.error || 'Signup failed. Please try again.', 'error');
            }
            return;
        }

        // Success
        showToast('Account created successfully! Please login.', 'success');
        closeSignup();
        // Clear form
        document.getElementById('signupUser').value = '';
        document.getElementById('signupEmail').value = '';
        document.getElementById('signupPass').value = '';
        document.getElementById('signupConfirmPass').value = '';
        document.getElementById('signupDob').value = '';
        document.getElementById('signupPhone').value = '';
        // Open login modal
        setTimeout(openLogin, 500);

    } catch (err) {
        showToast('Cannot connect to server. Make sure the backend is running.', 'error');
        console.error('Signup error:', err);
    } finally {
        btn.disabled = false;
        btn.innerHTML = 'Create Account';
    }
}

/* ===== LOGIN — calls the backend API ===== */
async function loginUser() {
    var username = document.getElementById('loginUser').value.trim();
    var password = document.getElementById('loginPass').value;

    if (!username || !password) {
        showToast('Please enter both username and password', 'warning');
        return;
    }

    // Disable button & show spinner
    var btn = document.getElementById('loginSubmitBtn');
    btn.disabled = true;
    btn.innerHTML = '<span class="spinner"></span> Logging in...';

    try {
        var res = await fetch(API_BASE + '/users/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: username, password: password })
        });
        var data = await res.json();

        if (!res.ok) {
            if (res.status === 404) {
                showToast('User does not exist! Please sign up first.', 'error', 5000);
            } else if (res.status === 401) {
                showToast('Incorrect password! Please try again.', 'error', 5000);
            } else {
                showToast(data.error || 'Login failed. Please try again.', 'error');
            }
            return;
        }

        // Success — store user in session and update UI
        setCurrentUser(data);
        showToast('Welcome back, ' + data.username + '! ☕', 'success');
        closeLogin();
        // Clear form
        document.getElementById('loginUser').value = '';
        document.getElementById('loginPass').value = '';
        // Update navbar
        updateNavAuth();

    } catch (err) {
        showToast('Cannot connect to server. Make sure the backend is running.', 'error');
        console.error('Login error:', err);
    } finally {
        btn.disabled = false;
        btn.innerHTML = 'Login';
    }
}

/* ===== LOGOUT ===== */
function logoutUser() {
    clearCurrentUser();
    showToast('Logged out successfully. See you soon! 👋', 'info');
    updateNavAuth();
}

/* ===== MAP MODAL ===== */
var leafletLoaded = false;

function injectMapModal() {
    // Inject only the HTML container
    const html = `
    <div id="mapOverlay" class="map-overlay" onclick="if(event.target===this)closeMap()">
        <div class="map-container">
            <button class="map-close" onclick="closeMap()">✕ Close</button>
            <div id="map"></div>
        </div>
    </div>
    `;
    document.body.insertAdjacentHTML('beforeend', html);

    // Load Leaflet CSS
    var link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
    document.head.appendChild(link);
}

function loadLeafletScript(callback) {
    if (leafletLoaded && typeof L !== 'undefined') { callback(); return; }
    var script = document.createElement('script');
    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
    script.onload = function () { leafletLoaded = true; callback(); };
    script.onerror = function () { showToast('Failed to load map library', 'error'); };
    document.head.appendChild(script);
}

function openMap() {
    document.getElementById('mapOverlay').classList.add('show');
    loadLeafletScript(function () {
        setTimeout(loadMap, 300);
    });
}

function closeMap() {
    document.getElementById('mapOverlay').classList.remove('show');
}

var mapInstance = null;

// Blue icon for user location
function createBlueIcon() {
    return L.divIcon({
        className: 'custom-blue-marker',
        html: '<div style="width:22px;height:22px;background:#2196F3;border:3px solid white;border-radius:50%;box-shadow:0 2px 8px rgba(33,150,243,0.5);"></div><div style="width:36px;height:36px;background:rgba(33,150,243,0.2);border:2px solid rgba(33,150,243,0.4);border-radius:50%;position:absolute;top:-7px;left:-7px;animation:pulse 2s ease-in-out infinite;"></div>',
        iconSize: [22, 22],
        iconAnchor: [11, 11],
        popupAnchor: [0, -14]
    });
}

// Red icon for cafes
function createRedIcon() {
    return L.divIcon({
        className: 'custom-red-marker',
        html: '<div style="width:12px;height:12px;background:#E53935;border:2.5px solid white;border-radius:50%;box-shadow:0 2px 6px rgba(229,57,53,0.5);"></div>',
        iconSize: [12, 12],
        iconAnchor: [6, 6],
        popupAnchor: [0, -10]
    });
}

function loadMap() {
    if (mapInstance) {
        mapInstance.invalidateSize();
        return;
    }

    if (!navigator.geolocation) {
        showToast('Geolocation not supported', 'error');
        return;
    }

    showToast('Getting your location...', 'info', 2000);

    navigator.geolocation.getCurrentPosition(function (position) {
        var lat = position.coords.latitude;
        var lng = position.coords.longitude;

        mapInstance = L.map('map').setView([lat, lng], 15);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: 'OpenStreetMap contributors'
        }).addTo(mapInstance);

        // Blue marker for user location
        L.marker([lat, lng], { icon: createBlueIcon(), zIndexOffset: 1000 })
            .addTo(mapInstance)
            .bindPopup('<strong style="color:#2196F3;">You are here</strong>')
            .openPopup();

        // Add legend
        var legend = L.control({ position: 'bottomleft' });
        legend.onAdd = function () {
            var div = L.DomUtil.create('div');
            div.style.cssText = 'background:white;padding:10px 14px;border-radius:8px;box-shadow:0 2px 8px rgba(0,0,0,0.15);font-family:Outfit,sans-serif;font-size:13px;';
            div.innerHTML =
                '<div style="margin-bottom:6px;font-weight:600;">Map Legend</div>' +
                '<div style="display:flex;align-items:center;gap:8px;margin-bottom:4px;"><span style="width:14px;height:14px;background:#2196F3;border:2px solid white;border-radius:50%;display:inline-block;box-shadow:0 0 4px rgba(33,150,243,0.5);"></span> Your Location</div>' +
                '<div style="display:flex;align-items:center;gap:8px;"><span style="width:14px;height:14px;background:#E53935;border:2px solid white;border-radius:50%;display:inline-block;box-shadow:0 0 4px rgba(229,57,53,0.5);"></span> Nearby Cafe</div>';
            return div;
        };
        legend.addTo(mapInstance);

        showToast('Searching for nearby cafes...', 'info', 2500);

        // Overpass query for nearby cafes
        var query = `
        [out:json];
        (
          node["amenity"="cafe"](around:3000, ${lat}, ${lng});
          node["amenity"="restaurant"](around:3000, ${lat}, ${lng});
          node["amenity"="fast_food"](around:3000, ${lat}, ${lng});
        );
        out;
        `;

        fetch('https://overpass.kumi.systems/api/interpreter', {
            method: 'POST',
            body: query
        })
            .then(function (res) { return res.json(); })
            .then(function (data) {
                if (!data.elements || data.elements.length === 0) {
                    showToast('No cafes found nearby', 'info');
                    return;
                }

                var redIcon = createRedIcon();
                var count = 0;

                data.elements.forEach(function (place) {
                    if (place.lat && place.lon) {
                        var name = (place.tags && place.tags.name) ? place.tags.name : 'Cafe nearby';
                        var type = (place.tags && place.tags.amenity) ? place.tags.amenity : '';
                        var label = type.charAt(0).toUpperCase() + type.slice(1);

                        L.marker([place.lat, place.lon], { icon: redIcon })
                            .addTo(mapInstance)
                            .bindPopup(
                                '<strong style="color:#E53935;">' + name + '</strong>' +
                                (label ? '<br><span style="font-size:12px;color:#888;">' + label + '</span>' : '')
                            );
                        count++;
                    }
                });
                showToast('Found ' + count + ' places nearby!', 'success');
            })
            .catch(function () {
                showToast('Error fetching cafes — try again later', 'error');
            });

        setTimeout(function () { mapInstance.invalidateSize(); }, 400);

    }, function () {
        showToast('Please allow location access to find nearby cafes', 'warning');
    });
}

/* ===== PERSISTENT SPOTIFY PLAYER (popup window) ===== */
var spotifyPopup = null;

function injectMiniPlayer(activePage) {
    // On the spotify page the full player is already there
    if (activePage === 'spotify') return;

    var saved = sessionStorage.getItem('cozy_spotify_url');
    if (!saved) return;

    var savedName = sessionStorage.getItem('cozy_spotify_name') || 'Now Playing';

    // Add "Now Playing" floating indicator
    var css = document.createElement('style');
    css.textContent = `
    .now-playing-badge {
        position: fixed; bottom: 16px; right: 16px; z-index: 9990;
        background: rgba(30,30,30,0.92); backdrop-filter: blur(16px);
        border: 1px solid rgba(255,255,255,0.12);
        border-radius: 40px; padding: 10px 18px 10px 14px;
        display: flex; align-items: center; gap: 10px;
        box-shadow: 0 6px 24px rgba(0,0,0,0.35);
        cursor: pointer; animation: toastIn 0.4s ease;
        transition: all 0.2s ease;
    }
    .now-playing-badge:hover { transform: translateY(-2px); box-shadow: 0 8px 32px rgba(0,0,0,0.45); }
    .npb-bars { display: flex; align-items: flex-end; gap: 2px; height: 16px; }
    .npb-bars span { width: 3px; background: #1ed760; border-radius: 2px; animation: eqBar 0.8s ease-in-out infinite alternate; }
    .npb-bars span:nth-child(1) { height: 8px; animation-delay: 0s; }
    .npb-bars span:nth-child(2) { height: 14px; animation-delay: 0.2s; }
    .npb-bars span:nth-child(3) { height: 6px; animation-delay: 0.4s; }
    .npb-bars span:nth-child(4) { height: 12px; animation-delay: 0.1s; }
    .npb-name { color: #fff; font-size: 0.82rem; font-weight: 600; max-width: 160px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .npb-open { background: #1ed760; color: #000; border: none; border-radius: 20px; padding: 5px 12px; font-size: 0.75rem; font-weight: 700; cursor: pointer; font-family: var(--font); }
    .npb-close { background: none; border: none; color: #888; font-size: 0.85rem; cursor: pointer; padding: 2px; }
    .npb-close:hover { color: #f44; }
    @keyframes eqBar { 0% { height: 4px; } 100% { height: 16px; } }
    `;
    document.head.appendChild(css);

    var badge = document.createElement('div');
    badge.className = 'now-playing-badge';
    badge.id = 'nowPlayingBadge';
    badge.innerHTML =
        '<div class="npb-bars"><span></span><span></span><span></span><span></span></div>' +
        '<span class="npb-name">' + savedName + '</span>' +
        '<button class="npb-open" onclick="openSpotifyPopup();event.stopPropagation();">Open Player</button>' +
        '<button class="npb-close" onclick="closeNowPlaying();event.stopPropagation();" title="Dismiss">✕</button>';
    badge.addEventListener('click', function () { window.location.href = 'spotify.html'; });
    document.body.appendChild(badge);
}

var lastPopupUrl = null;

function openSpotifyPopup() {
    var url = sessionStorage.getItem('cozy_spotify_url');
    if (!url) return;
    var name = sessionStorage.getItem('cozy_spotify_name') || 'Now Playing';

    var popupHTML = '<!DOCTYPE html><html><head><title>🎵 ' + name + ' — Cozy Corner</title>' +
        '<style>*{margin:0;padding:0;box-sizing:border-box}body{background:#181818;font-family:Outfit,sans-serif;display:flex;flex-direction:column;height:100vh}' +
        '.header{padding:12px 16px;background:#282828;color:#fff;font-size:0.85rem;font-weight:600;display:flex;align-items:center;gap:8px}' +
        '.header .dot{width:8px;height:8px;background:#1ed760;border-radius:50%;animation:pulse 2s infinite}' +
        '@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}}' +
        'iframe{flex:1;border:none;width:100%}</style></head>' +
        '<body><div class="header"><span class="dot"></span> ' + name + '</div>' +
        '<iframe src="' + url + '" allow="autoplay;clipboard-write;encrypted-media;fullscreen;picture-in-picture"></iframe></body></html>';

    // If popup is open and same URL, just focus it
    if (spotifyPopup && !spotifyPopup.closed && lastPopupUrl === url) {
        spotifyPopup.focus();
        return;
    }

    // If popup is open but URL changed, rewrite its content
    if (spotifyPopup && !spotifyPopup.closed) {
        spotifyPopup.document.open();
        spotifyPopup.document.write(popupHTML);
        spotifyPopup.document.close();
        spotifyPopup.focus();
        lastPopupUrl = url;
        return;
    }

    // Open new popup
    spotifyPopup = window.open('', 'CozyCornerMusic', 'width=380,height=500,resizable=yes,scrollbars=no');
    if (spotifyPopup) {
        spotifyPopup.document.open();
        spotifyPopup.document.write(popupHTML);
        spotifyPopup.document.close();
        lastPopupUrl = url;
    } else {
        showToast('Please allow popups for this site to keep music playing!', 'warning', 5000);
    }
}

function closeNowPlaying() {
    var badge = document.getElementById('nowPlayingBadge');
    if (badge) badge.remove();
    sessionStorage.removeItem('cozy_spotify_url');
    sessionStorage.removeItem('cozy_spotify_name');
    if (spotifyPopup && !spotifyPopup.closed) spotifyPopup.close();
}

// Called from spotify.html to save the current playlist
function saveMiniPlayerState(embedUrl, name) {
    sessionStorage.setItem('cozy_spotify_url', embedUrl);
    sessionStorage.setItem('cozy_spotify_name', name || 'Now Playing');
}
