
// ==================== API CONFIGURATION ====================
// Determine API base URL based on current environment
function getApiBaseUrl() {
    const isLocalFile = window.location.protocol === 'file:';
    const isLocalhost = window.location.hostname === 'localhost' || 
                        window.location.hostname === '127.0.0.1';
    
    // If running from file:// or localhost, use local backend
    if (isLocalFile || isLocalhost) {
        return 'http://localhost:3000/api';
    }
    
    // For production, use your actual Render/Heroku/etc URL
    // Replace with your actual backend URL
    return 'https://your-backend-url.onrender.com/api';
}

const API_BASE_URL = getApiBaseUrl();
const isLocalFile = window.location.protocol === 'file:';

console.log('🌐 API Base URL:', API_BASE_URL);
console.log('📁 Is local file:', isLocalFile);

// ==================== CONNECTION TEST ====================
async function testBackendConnection() {
    try {
        console.log('🔍 Testing backend connection...');
        const response = await fetch(`${API_BASE_URL}/health`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        if (response.ok) {
            const data = await response.json();
            console.log('✅ Backend connection successful:', data.message);
            return true;
        } else {
            console.warn('⚠️ Backend responded but with error');
            return false;
        }
    } catch (error) {
        console.error('❌ Cannot connect to backend:', error.message);
        console.log('📦 Will use fallback/local data mode');
        return false;
    }
}

// Test connection on load
testBackendConnection();

// ==================== AUTHENTICATION CHECK ====================
function checkAdminAccess() {
    const token = localStorage.getItem('authToken');
    const userStr = localStorage.getItem('user');
    
    if (!token || !userStr) {
        console.log('❌ No authentication found');
        redirectToAdminLogin();
        return false;
    }
    
    try {
        const user = JSON.parse(userStr);
        const isAdmin = user.role === 'admin' || user.isAdmin === true;
        
        if (!isAdmin) {
            console.log('❌ User is not admin');
            redirectToAdminLogin();
            return false;
        }
        
        console.log('✅ Admin user authenticated:', user.email);
        return true;
        
    } catch (error) {
        console.error('Error parsing user data:', error);
        redirectToAdminLogin();
        return false;
    }
}

function redirectToAdminLogin() {
    const adminPanelUrl = '/admin-panel.html';
    const currentUrl = window.location.href;
    
    if (currentUrl.includes(adminPanelUrl)) {
        window.location.href = '/admin-login.html?returnTo=' + encodeURIComponent(currentUrl);
    } else {
        window.location.href = '/admin-login.html';
    }
}

// ==================== ADMIN PANEL CLASS ====================
class AdminPanel {
    constructor() {
        this.orders = [];
        this.currentPage = 1;
        this.ordersPerPage = 10;
        this.isBackendConnected = false;
        
        // Check authentication first
        if (!checkAdminAccess()) {
            return; // Stop initialization if not authenticated
        }
        
        this.init();
    }

    init() {
        this.setupNavigation();
        this.setupEventListeners();
        this.loadDashboard();
    }

    setupNavigation() {
        // Sidebar navigation
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const page = link.getAttribute('data-page');
                this.showPage(page);
                
                // Update active state
                document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
                link.classList.add('active');
            });
        });
    }

    setupEventListeners() {
        // Logout button
        document.getElementById('logoutBtn')?.addEventListener('click', () => {
            localStorage.removeItem('authToken');
            localStorage.removeItem('user');
            window.location.href = '/admin-login.html';
        });

        // Close modal
        document.getElementById('closeModal')?.addEventListener('click', () => {
            this.hideModal();
        });

        // Filter events
        document.getElementById('statusFilter')?.addEventListener('change', () => this.filterOrders());
        document.getElementById('dateFilter')?.addEventListener('change', () => this.filterOrders());
        document.getElementById('orderSearch')?.addEventListener('input', () => this.filterOrders());

        // Close modal when clicking outside
        document.getElementById('orderModal')?.addEventListener('click', (e) => {
            if (e.target === document.getElementById('orderModal')) {
                this.hideModal();
            }
        });

        // "View All" button in dashboard
        document.querySelector('.btn-view[data-page="orders"]')?.addEventListener('click', (e) => {
            e.preventDefault();
            this.showPage('orders');
            document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
            document.querySelector('.nav-link[data-page="orders"]').classList.add('active');
        });
    }

    // ... REST OF YOUR EXISTING AdminPanel CLASS METHODS REMAIN EXACTLY THE SAME ...
    // All your existing methods stay here without changes
    
}

// Initialize admin panel when DOM is loaded
let adminPanel;
document.addEventListener('DOMContentLoaded', function() {
    adminPanel = new AdminPanel();
    
    // Convert currency symbols
    convertCurrencyToPounds();
});

// Make adminPanel available globally
window.adminPanel = adminPanel;

// Currency conversion function
function convertCurrencyToPounds() {
    // Replace € with £ in text nodes
    function replaceTextInNode(node) {
        if (node.nodeType === Node.TEXT_NODE) {
            node.textContent = node.textContent.replace(/€/g, '£');
        } else if (node.nodeType === Node.ELEMENT_NODE) {
            node.childNodes.forEach(child => replaceTextInNode(child));
        }
    }
    
    // Update any element values
    document.querySelectorAll('input, select, span, div, p, h1, h2, h3, h4, h5, h6').forEach(element => {
        if (element.value && element.value.includes('€')) {
            element.value = element.value.replace(/€/g, '£');
        }
        if (element.textContent && element.textContent.includes('€')) {
            element.textContent = element.textContent.replace(/€/g, '£');
        }
        if (element.innerHTML && element.innerHTML.includes('€')) {
            element.innerHTML = element.innerHTML.replace(/€/g, '£');
        }
    });
    
    // Start from body
    replaceTextInNode(document.body);
}
