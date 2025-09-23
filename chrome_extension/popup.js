// Check login status when popup opens
document.addEventListener('DOMContentLoaded', function() {
    chrome.storage.local.get(["authToken", "user"], (data) => {
        if (data.authToken && data.user) {
            // User is logged in
            updatePopupStatus(data.user.firstname, true);
        } else {
            // User is not logged in
            updatePopupStatus("", false);
        }
    });
});

// Function to update popup status and button visibility
function updatePopupStatus(firstname, isLoggedIn) {
    const status = document.getElementById('status');
    const loginBtn = document.getElementById('login-btn');
    const registerBtn = document.getElementById('register-btn');
    const logoutBtn = document.getElementById('logout-btn');

    if (isLoggedIn) {
        status.textContent = `Logged in as ${firstname} ✓`;
        status.className = "status logged-in";
        
        // Hide login/register buttons, show logout button
        loginBtn.classList.add('hidden');
        registerBtn.classList.add('hidden');
        logoutBtn.classList.remove('hidden');
    } else {
        status.textContent = "Not logged in";
        status.className = "status logged-out";
        
        // Show login/register buttons, hide logout button
        loginBtn.classList.remove('hidden');
        registerBtn.classList.remove('hidden');
        logoutBtn.classList.add('hidden');
    }
}

// Logout functionality
document.getElementById('logout-btn').addEventListener('click', () => {
    chrome.storage.local.remove(["authToken", "user"], () => {
        updatePopupStatus("", false);
        console.log('Logged out successfully');
    });
});

// Login button
document.getElementById('login-btn').addEventListener('click', () => {
    chrome.windows.create({
        url: chrome.runtime.getURL('login.html'),
        type: 'popup',
        width: 400,
        height: 600,
        left: 200,
        top: 100
    });
});

// Register button
document.getElementById('register-btn').addEventListener('click', () => {
    chrome.windows.create({
        url: chrome.runtime.getURL('register.html'),
        type: 'popup',
        width: 400,
        height: 600,
        left: 200,
        top: 100
    });
});

// Listen for login success from login window
window.addEventListener('message', (event) => {
    if (event.data.type === 'AUTH_SUCCESS') {
        // Save token and user data
        chrome.storage.local.set({ 
            authToken: event.data.token,
            user: event.data.user 
        }, () => {
            // Update the popup status immediately
            updatePopupStatus(event.data.user.firstname, true);
        });
    }
});

// Listen for storage changes (in case login happens in another tab/window)
chrome.storage.onChanged.addListener((changes, namespace) => {
    if (namespace === 'local') {
        if (changes.authToken || changes.user) {
            chrome.storage.local.get(["authToken", "user"], (data) => {
                if (data.authToken && data.user) {
                    updatePopupStatus(data.user.firstname, true);
                } else {
                    updatePopupStatus("", false);
                }
            });
        }
    }
});