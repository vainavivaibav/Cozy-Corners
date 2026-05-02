/* ===== COZY CORNER API HELPER ===== */
const API_BASE = 'http://localhost:3000/api';

// Get current user from sessionStorage
function getCurrentUser() {
    var data = sessionStorage.getItem('cozy_user');
    return data ? JSON.parse(data) : null;
}

function getUserId() {
    var u = getCurrentUser();
    return u ? u.user_id : null;
}

function setCurrentUser(user) {
    sessionStorage.setItem('cozy_user', JSON.stringify(user));
}

function clearCurrentUser() {
    sessionStorage.removeItem('cozy_user');
}

// Generic API calls
async function apiGet(path) {
    try {
        var res = await fetch(API_BASE + path);
        return await res.json();
    } catch (e) {
        console.warn('API GET failed:', path, e);
        return null;
    }
}

async function apiPost(path, data) {
    try {
        var res = await fetch(API_BASE + path, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        return await res.json();
    } catch (e) {
        console.warn('API POST failed:', path, e);
        return null;
    }
}

async function apiPut(path, data) {
    try {
        var res = await fetch(API_BASE + path, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        return await res.json();
    } catch (e) {
        console.warn('API PUT failed:', path, e);
        return null;
    }
}

async function apiDelete(path) {
    try {
        var res = await fetch(API_BASE + path, { method: 'DELETE' });
        return await res.json();
    } catch (e) {
        console.warn('API DELETE failed:', path, e);
        return null;
    }
}
