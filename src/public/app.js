// ==================== URGENT DEBUG - ADD AT VERY TOP ====================
console.log('=== ROI.JS LOADED - STARTING DEBUG ===');

// Test if DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM fully loaded');
    
    // Check for product cards after a delay
    setTimeout(() => {
        const cards = document.querySelectorAll('.product-card');
        console.log('Found', cards.length, 'product cards');
        
        if (cards.length === 0) {
            console.error('NO PRODUCT CARDS FOUND!');
        } else {
            console.log('First product card:', cards[0]);
        }
    }, 1000);
});

// ==================== YOUR EXISTING CODE CONTINUES BELOW ====================

// ==================== ENVIRONMENT DETECTION ====================
const isLocalFile = window.location.protocol === 'file:';
const isLocalhost = window.location.hostname === 'localhost' || 
                    window.location.hostname === '127.0.0.1' ||
                    window.location.hostname === '';

console.log('🌍 Environment:', {
    protocol: window.location.protocol,
    hostname: window.location.hostname,
    origin: window.location.origin,
    isLocalFile: isLocalFile,
    isLocalhost: isLocalhost
});

// ==================== SIMPLE NOTIFICATION SYSTEM ====================
class SimpleNotification {
    constructor() {
        this.container = document.createElement('div');
        this.container.className = 'simple-notification-container';
        this.container.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 9999;
            display: flex;
            flex-direction: column;
            gap: 10px;
        `;
        document.body.appendChild(this.container);
        
        // Add styles
        if (!document.querySelector('#simple-notification-styles')) {
            const style = document.createElement('style');
            style.id = 'simple-notification-styles';
            style.textContent = `
                @keyframes slideIn {
                    from {
                        transform: translateX(100%);
                        opacity: 0;
                    }
                    to {
                        transform: translateX(0);
                        opacity: 1;
                    }
                }
                @keyframes slideOut {
                    from {
                        transform: translateX(0);
                        opacity: 1;
                    }
                    to {
                        transform: translateX(100%);
                        opacity: 0;
                    }
                }
                .simple-notification {
                    background: #4a7c59;
                    color: white;
                    padding: 12px 20px;
                    border-radius: 5px;
                    box-shadow: 0 4px 6px rgba(0,0,0,0.1);
                    animation: slideIn 0.3s ease;
                    font-family: 'Poppins', sans-serif;
                    font-size: 14px;
                    max-width: 300px;
                }
                .simple-notification.error {
                    background: #e74c3c;
                }
                .simple-notification.success {
                    background: #4a7c59;
                }
                .simple-notification.warning {
                    background: #f39c12;
                }
                .simple-notification.info {
                    background: #3498db;
                }
            `;
            document.head.appendChild(style);
        }
    }
    
    show(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `simple-notification ${type}`;
        notification.textContent = message;
        
        this.container.appendChild(notification);
        
        // Auto remove after 3 seconds
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => {
                if (notification.parentElement) {
                    notification.parentElement.removeChild(notification);
                }
            }, 300);
        }, 3000);
        
        // Manual close on click
        notification.addEventListener('click', () => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => {
                if (notification.parentElement) {
                    notification.parentElement.removeChild(notification);
                }
            }, 300);
        });
    }
}

const simpleNotification = new SimpleNotification();

// ==================== SAFE HISTORY API ====================
function safePushState(state, title, url) {
    try {
        if (window.location.protocol === 'http:' || window.location.protocol === 'https:') {
            window.history.pushState(state, title, url);
        }
    } catch (error) {
        console.log('⚠️ Cannot use pushState in file:// mode');
    }
}

// ==================== API CONFIGURATION ====================
// Use your actual Render backend URL - UPDATED TO NEW BACKEND
let API_BASE_URL = 'http://localhost:3000/api';

// If running from file:// protocol, try to detect if backend is available
if (isLocalFile) {
    console.warn('⚠️ Running from file:// protocol - testing backend connection');
    // Keep localhost URL but we'll handle errors gracefully
}

console.log('🌐 API Base URL:', API_BASE_URL);

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

// ==================== IMPROVED FALLBACK FETCH ====================
const originalFetch = window.fetch;
window.fetch = async function(url, options) {
    // Don't intercept non-API calls
    if (!url.includes('/api/')) {
        return originalFetch(url, options);
    }
    
    // Skip reviews API calls - they always fail
    if (url.includes('/reviews')) {
        console.log('📝 Skipping reviews API call');
        return {
            ok: true,
            status: 200,
            json: async () => ({
                success: true,
                reviews: []
            })
        };
    }
    
    try {
        console.log(`🌐 API Call: ${options?.method || 'GET'} ${url}`);
        const response = await originalFetch(url, options);
        
        // If response is ok, return it
        if (response.ok) {
            return response;
        }
        
        throw new Error(`API Error: ${response.status}`);
        
    } catch (error) {
        console.warn(`⚠️ API call failed for ${url}:`, error.message);
        
        // Return mock responses
        if (url.includes('/api/products/featured')) {
            return {
                ok: true,
                status: 200,
                json: async () => ({
                    success: true,
                    data: products.slice(0, 4)
                })
            };
        }
        
        if (url.includes('/api/products')) {
            return {
                ok: true,
                status: 200,
                json: async () => ({
                    success: true,
                    data: products
                })
            };
        }
        
        if (url.includes('/api/health')) {
            return {
                ok: true,
                status: 200,
                json: async () => ({
                    success: true,
                    message: 'Fallback mode - using local data',
                    timestamp: new Date().toISOString()
                })
            };
        }
        
        // For payment API - provide better error
        if (url.includes('/api/payment')) {
            return {
                ok: false,
                status: 500,
                json: async () => ({
                    success: false,
                    message: 'Payment service temporarily unavailable. Please try again later.'
                })
            };
        }
        
        // Generic fallback
        return {
            ok: true,
            status: 200,
            json: async () => ({
                success: false,
                message: 'Running in fallback mode - backend not available',
                data: []
            })
        };
    }
};


// ==================== PRODUCT DATA ====================
const products = [
    { id: 1, productId: 1, name: "Hydrating Vitamin C Serum", description: "Brightens skin tone and reduces dark spots with natural vitamin C extract", price: 29.99, image: "image curology.jpeg", category: "serums", skinType: ["dry", "combination", "sensitive"], badge: "Bestseller", stockQuantity: 10, ingredients: "Vitamin C, Hyaluronic Acid, Ferulic Acid", sizes: [{size: "30ml", price: 29.99}, {size: "50ml", price: 44.99, selected: true}] },
    { id: 2, productId: 2, name: "Nourishing Face Moisturizer", description: "Deeply hydrates and restores skin barrier with hyaluronic acid and ceramides", price: 24.99, image: "image curology.jpeg", category: "moisturizers", skinType: ["dry", "sensitive"], badge: "New", stockQuantity: 15, ingredients: "Ceramides, Hyaluronic Acid, Niacinamide", sizes: [{size: "50ml", price: 24.99, selected: true}, {size: "100ml", price: 39.99}] },
    { id: 3, productId: 3, name: "Gentle Foaming Cleanser", description: "Removes impurities without stripping natural oils, suitable for all skin types", price: 18.99, image: "image curology.jpeg", category: "cleansers", skinType: ["dry", "oily", "combination", "sensitive"], stockQuantity: 20, ingredients: "Aloe Vera, Green Tea, Chamomile", sizes: [{size: "150ml", price: 18.99, selected: true}, {size: "300ml", price: 29.99}] },
    { id: 4, productId: 4, name: "Revitalizing Eye Cream", description: "Reduces puffiness and dark circles with caffeine and peptide complex", price: 22.99, originalPrice: 27.99, image: "image curology.jpeg", category: "eye-care", skinType: ["dry", "combination", "sensitive"], stockQuantity: 8, ingredients: "Caffeine, Peptides, Vitamin K", sizes: [{size: "15ml", price: 22.99, selected: true}] },
    { id: 5, productId: 5, name: "Detoxifying Clay Mask", description: "Deep cleanses pores and absorbs excess oil with natural clay minerals", price: 19.99, image: "image curology.jpeg", category: "masks", skinType: ["oily", "combination"], stockQuantity: 12, ingredients: "Bentonite Clay, Charcoal, Tea Tree Oil", sizes: [{size: "100ml", price: 19.99, selected: true}] },
    { id: 6, productId: 6, name: "Hydrating Facial Mist", description: "Instantly refreshes and hydrates skin with rosewater and aloe vera", price: 16.99, image: "image curology.jpeg", category: "serums", skinType: ["dry", "sensitive"], stockQuantity: 25, ingredients: "Rosewater, Aloe Vera, Glycerin", sizes: [{size: "100ml", price: 16.99, selected: true}] },
    { id: 7, productId: 7, name: "Brightening Toner", description: "Balances pH and improves skin texture with natural fruit extracts", price: 21.99, image: "image curology.jpeg", category: "cleansers", skinType: ["dry", "combination", "sensitive"], stockQuantity: 18, ingredients: "Glycolic Acid, Witch Hazel, Vitamin C", sizes: [{size: "200ml", price: 21.99, selected: true}] },
    { id: 8, productId: 8, name: "Overnight Repair Cream", description: "Intensive nighttime treatment that repairs skin while you sleep", price: 34.99, image: "image curology.jpeg", category: "moisturizers", skinType: ["dry", "sensitive"], badge: "New", stockQuantity: 6, ingredients: "Retinol, Ceramides, Peptides", sizes: [{size: "50ml", price: 34.99, selected: true}] },
    { id: 9, productId: 9, name: "Exfoliating Scrub", description: "Gentle exfoliation with natural jojoba beads for smoother skin", price: 17.99, image: "image curology.jpeg", category: "cleansers", skinType: ["oily", "combination"], stockQuantity: 14, ingredients: "Jojoba Beads, Vitamin E, Green Tea", sizes: [{size: "75ml", price: 17.99, selected: true}] },
    { id: 10, productId: 10, name: "Anti-Aging Serum", description: "Reduces fine lines and wrinkles with retinol and peptide complex", price: 39.99, image: "image curology.jpeg", category: "serums", skinType: ["dry", "combination", "sensitive"], stockQuantity: 9, ingredients: "Retinol, Peptides, Vitamin C", sizes: [{size: "30ml", price: 39.99, selected: true}] },
    { id: 11, productId: 11, name: "Soothing Face Oil", description: "Nourishes and calms irritated skin with natural botanical oils", price: 26.99, image: "image curology.jpeg", category: "serums", skinType: ["dry", "sensitive"], stockQuantity: 11, ingredients: "Jojoba Oil, Rosehip Oil, Vitamin E", sizes: [{size: "30ml", price: 26.99, selected: true}] },
    { id: 12, productId: 12, name: "Purifying Charcoal Mask", description: "Deep cleanses and detoxifies skin with activated charcoal", price: 23.99, image: "image curology.jpeg", category: "masks", skinType: ["oily", "combination"], stockQuantity: 7, ingredients: "Activated Charcoal, Kaolin Clay, Tea Tree", sizes: [{size: "100ml", price: 23.99, selected: true}] }
];

console.log('🌐 Backend Mode: Using real API at', API_BASE_URL);

// ==================== OPTIMIZED DATA SYNC ====================
class DataSync {
    constructor() {
        this.BASE_URL = API_BASE_URL;
        this.cache = new Map();
        this.cacheTime = 30000; // 30 seconds cache
    }

    async syncProducts(filters = {}) {
        const cacheKey = JSON.stringify(filters);
        
        // Check cache first
        if (this.cache.has(cacheKey)) {
            const cached = this.cache.get(cacheKey);
            if (Date.now() - cached.timestamp < this.cacheTime) {
                console.log('📦 Using cached products');
                return cached.data;
            }
        }
        
        console.log('🔄 Loading products from API with filters:', filters);
        
        try {
            // Build query parameters
            const queryParams = new URLSearchParams();
            
            if (filters.category && filters.category !== 'all') {
                queryParams.append('category', filters.category);
            }
            
            if (filters.skinType && filters.skinType !== 'all') {
                queryParams.append('skinType', filters.skinType);
            }
            
            const queryString = queryParams.toString();
            const url = queryString ? `${this.BASE_URL}/products?${queryString}&limit=100` : `${this.BASE_URL}/products?limit=100`;
            
            console.log('📦 Fetching products from:', url);
            
            const response = await fetch(url, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' }
            });
            
            if (!response.ok) {
                throw new Error('API not available');
            }
            
            const data = await response.json();
            
            if (data.success && Array.isArray(data.data)) {
                console.log(`✅ Loaded ${data.data.length} products from API`);
                
                // Cache the results
                this.cache.set(cacheKey, {
                    timestamp: Date.now(),
                    data: data.data
                });
                
                return data.data;
            } else {
                throw new Error('Invalid response format');
            }
            
        } catch (error) {
            console.error('❌ API call failed, using local products:', error.message);
            return this.getLocalProducts(filters);
        }
    }

    getLocalProducts(filters = {}) {
        console.log('📦 Using local products as fallback');
        
        const {
            category = 'all',
            skinType = 'all',
            priceRange = 'all',
            search = ''
        } = filters;
        
        const searchTerm = search ? search.toLowerCase() : '';
        
        return products.filter(product => {
            // Filter by category
            if (category !== 'all' && product.category !== category) return false;
            
            // Filter by skin type
            if (skinType !== 'all' && !product.skinType.includes(skinType)) return false;
            
            // Filter by price range
            if (priceRange !== 'all') {
                if (priceRange === 'under20' && product.price >= 20) return false;
                if (priceRange === '20to40' && (product.price < 20 || product.price > 40)) return false;
                if (priceRange === 'over40' && product.price <= 40) return false;
            }
            
            // Filter by search term
            if (searchTerm && 
                !product.name.toLowerCase().includes(searchTerm) && 
                !product.description.toLowerCase().includes(searchTerm)) {
                return false;
            }
            
            return true;
        });
    }

    async syncFeaturedProducts() {
        const cacheKey = 'featured';
        
        // Check cache
        if (this.cache.has(cacheKey)) {
            const cached = this.cache.get(cacheKey);
            if (Date.now() - cached.timestamp < this.cacheTime) {
                console.log('⭐ Using cached featured products');
                return cached.data;
            }
        }
        
        console.log('⭐ Loading featured products from API...');
        
        try {
            const response = await fetch(`${this.BASE_URL}/products/featured`, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' }
            });
            
            if (!response.ok) {
                throw new Error('Featured API failed');
            }
            
            const data = await response.json();
            
            if (data.success && Array.isArray(data.data) && data.data.length > 0) {
                console.log(`✅ Loaded ${data.data.length} featured products from API`);
                
                // Cache results
                this.cache.set(cacheKey, {
                    timestamp: Date.now(),
                    data: data.data
                });
                
                return data.data;
            } else {
                throw new Error('No featured products');
            }
            
        } catch (error) {
            console.error('❌ Featured products API error:', error.message);
            console.log('🔄 Using local products as featured fallback');
            
            const localFeatured = this.getLocalProducts().slice(0, 4);
            
            // Cache local results too
            this.cache.set(cacheKey, {
                timestamp: Date.now(),
                data: localFeatured
            });
            
            return localFeatured;
        }
    }
}

const dataSync = new DataSync();

// ==================== PAGE STATE MANAGEMENT ====================
class PageStateManager {
    constructor() {
        this.currentPage = 'home';
        this.init();
    }

    init() {
        const savedPage = sessionStorage.getItem('currentPage');
        if (savedPage) {
            this.currentPage = savedPage;
        }
        
        window.addEventListener('beforeunload', () => {
            sessionStorage.setItem('currentPage', this.currentPage);
        });
    }

    setCurrentPage(page) {
        this.currentPage = page;
        sessionStorage.setItem('currentPage', page);
    }

    getCurrentPage() {
        return this.currentPage;
    }

    clearState() {
        sessionStorage.removeItem('currentPage');
        this.currentPage = 'home';
    }
}

const pageStateManager = new PageStateManager();

// ==================== CART PERSISTENCE ====================
class CartManager {
    constructor() {
        this.cart = this.loadCartFromStorage();
    }

    loadCartFromStorage() {
        try {
            const savedCart = localStorage.getItem('roibeauty-cart');
            if (savedCart) {
                return JSON.parse(savedCart);
            }
        } catch (error) {
            console.error('Error loading cart from storage:', error);
        }
        return [];
    }

    saveCartToStorage() {
        try {
            localStorage.setItem('roibeauty-cart', JSON.stringify(this.cart));
        } catch (error) {
            console.error('Error saving cart to storage:', error);
        }
    }

    addItem(id, name, price, image, stockQuantity = 999) {
        const existingItem = this.cart.find(item => item.id == id);
        
        if (existingItem) {
            if (existingItem.quantity >= stockQuantity) {
                throw new Error(`Cannot add more than ${stockQuantity} items of ${name}`);
            }
            existingItem.quantity += 1;
        } else {
            this.cart.push({
                id: id,
                name: name,
                price: price,
                image: image,
                quantity: 1,
                stockQuantity: stockQuantity
            });
        }
        
        this.saveCartToStorage();
        return this.cart;
    }

    removeItem(id) {
        this.cart = this.cart.filter(item => item.id != id);
        this.saveCartToStorage();
        return this.cart;
    }

    updateQuantity(id, newQuantity) {
        const item = this.cart.find(item => item.id == id);
        if (!item) return this.cart;
        
        if (newQuantity > item.stockQuantity) {
            throw new Error(`Cannot add more than ${item.stockQuantity} items of ${item.name}`);
        }
        
        if (newQuantity < 1) {
            return this.removeItem(id);
        }
        
        item.quantity = newQuantity;
        this.saveCartToStorage();
        return this.cart;
    }

    clearCart() {
        this.cart = [];
        this.saveCartToStorage();
        return this.cart;
    }

    getCart() {
        return this.cart;
    }

    getTotalItems() {
        return this.cart.reduce((total, item) => total + item.quantity, 0);
    }

    getSubtotal() {
        return this.cart.reduce((total, item) => total + (item.price * item.quantity), 0);
    }
}

const cartManager = new CartManager();

// ==================== ENHANCED CART NOTIFICATION ====================
class CartNotification {
    constructor() {
        this.notification = document.getElementById('cartNotification');
        this.notificationItem = document.getElementById('notificationItem');
        this.init();
    }

    init() {
        // Close notification when clicking X
        const closeBtn = this.notification.querySelector('.close-notification');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.hide());
        }

        // Continue shopping button
        const continueBtn = this.notification.querySelector('.continue-shopping');
        if (continueBtn) {
            continueBtn.addEventListener('click', () => {
                this.hide();
            });
        }

        // View cart button
        const viewCartBtn = this.notification.querySelector('.view-cart');
        if (viewCartBtn) {
            viewCartBtn.addEventListener('click', () => {
                this.hide();
                showCartPage();
            });
        }

        // Close when clicking outside
        this.notification.addEventListener('click', (e) => {
            if (e.target === this.notification) {
                this.hide();
            }
        });
    }

    show(product) {
        this.notificationItem.innerHTML = `
            <img src="${product.image}" alt="${product.name}" loading="lazy">
            <div class="notification-details">
                <h4>${product.name}</h4>
                <p>£${product.price.toFixed(2)}</p>
            </div>
        `;
        this.notification.style.display = 'block';
        
        // Auto hide after 5 seconds
        setTimeout(() => this.hide(), 5000);
    }

    hide() {
        this.notification.style.display = 'none';
    }
}

const cartNotification = new CartNotification();

// ==================== REVIEW SYSTEM ====================
class ReviewSystem {
    constructor() {
        this.reviewModal = document.getElementById('reviewModal');
        this.currentProductId = null;
        this.init();
    }

    async loadProductReviews(productId) {
    try {
        // Get all reviews from localStorage
        const allReviewsKey = 'roibeauty_all_reviews';
        let allReviews = [];
        
        try {
            const storedAll = localStorage.getItem(allReviewsKey);
            if (storedAll) {
                allReviews = JSON.parse(storedAll);
            }
        } catch (e) {
            console.log('No reviews found');
        }
        
        // Filter reviews for this product
        const productReviews = allReviews.filter(review => 
            review.productId == productId
        );
        
        return productReviews;
        
    } catch (error) {
        console.error('Error loading reviews:', error);
        return [];
    }
}

    init() {
        // Close modal
        const closeBtn = this.reviewModal.querySelector('.close-modal');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.hide());
        }

        // Star rating
        const stars = this.reviewModal.querySelectorAll('.stars i');
        stars.forEach(star => {
            star.addEventListener('click', () => {
                const rating = parseInt(star.getAttribute('data-rating'));
                this.setRating(stars, rating);
            });
        });

        // Submit review
        const submitBtn = document.getElementById('submitReviewBtn');
        if (submitBtn) {
            submitBtn.addEventListener('click', () => this.submitReview());
        }

        // Close when clicking outside
        this.reviewModal.addEventListener('click', (e) => {
            if (e.target === this.reviewModal) {
                this.hide();
            }
        });
    }

    setRating(stars, rating) {
        stars.forEach((star, index) => {
            if (index < rating) {
                star.className = 'fas fa-star active';
            } else {
                star.className = 'far fa-star';
            }
        });
    }

    show(productId) {
        this.currentProductId = productId;
        this.reviewModal.style.display = 'flex';
        // Reset form
        this.reviewModal.querySelector('#reviewTitle').value = '';
        this.reviewModal.querySelector('#reviewText').value = '';
        const stars = this.reviewModal.querySelectorAll('.stars i');
        this.setRating(stars, 0);
    }

    hide() {
        this.reviewModal.style.display = 'none';
    }

    async submitReview() {
    const title = document.getElementById('reviewTitle').value;
    const text = document.getElementById('reviewText').value;
    const stars = this.reviewModal.querySelectorAll('.stars i');
    const rating = Array.from(stars).filter(star => star.classList.contains('active')).length;

    if (!authService.isLoggedIn()) {
        showNotification('Please log in to submit a review', 'error');
        return;
    }

    if (rating === 0) {
        showNotification('Please select a rating', 'error');
        return;
    }

    if (!title || !text) {
        showNotification('Please fill in all fields', 'error');
        return;
    }

    try {
        const currentUser = authService.getCurrentUser();
        const productId = this.currentProductId;
        
        // Get current product info
        const product = products.find(p => p.id == productId || p.productId == productId);
        
        if (!product) {
            throw new Error('Product not found');
        }
        
        // Save review to localStorage
        const reviewData = {
    id: Date.now().toString(),
    productId: productId,
    productName: product.name,
    productImage: product.image,
    userId: currentUser._id || currentUser.id,
    userName: currentUser.name,
    userEmail: currentUser.email,
    rating: rating,
    title: title,
    comment: text,
    date: new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    }),
    timestamp: Date.now(),
    likes: 0, // NEW: Track likes
    likedBy: [], // NEW: Track who liked
    replies: [], // NEW: Store replies
    verified: Math.random() > 0.5 // Random verification for demo
};
        
        // Save to localStorage using user email as key
        const reviewsKey = `roibeauty_reviews_${currentUser.email}`;
        let userReviews = [];
        
        try {
            const stored = localStorage.getItem(reviewsKey);
            if (stored) {
                userReviews = JSON.parse(stored);
            }
        } catch (e) {
            console.log('No existing reviews found');
        }
        
        // Add new review
        userReviews.push(reviewData);
        localStorage.setItem(reviewsKey, JSON.stringify(userReviews));
        
        // Also save to global reviews
        const allReviewsKey = 'roibeauty_all_reviews';
        let allReviews = [];
        
        try {
            const storedAll = localStorage.getItem(allReviewsKey);
            if (storedAll) {
                allReviews = JSON.parse(storedAll);
            }
        } catch (e) {
            console.log('No global reviews found');
        }
        
        allReviews.push(reviewData);
        localStorage.setItem(allReviewsKey, JSON.stringify(allReviews));
        
        showNotification('Review submitted successfully!', 'success');
        this.hide();
        
        // Update review count in profile
        setTimeout(() => {
            if (profileModal.style.display === 'flex') {
                authService.showUserProfile();
            }
        }, 1000);
        
    } catch (error) {
        console.error('Review submission error:', error);
        showNotification(error.message || 'Failed to submit review. Using local storage instead.', 'error');
    }
}

    async getProductReviews(productId) {
        try {
            const response = await fetch(`${API_BASE_URL}/products/${productId}/reviews`);
            const data = await response.json();
            return data.reviews || [];
        } catch (error) {
            console.error('Error fetching reviews:', error);
            return [];
        }
    }
}

const reviewSystem = new ReviewSystem();

// ==================== PRODUCT BUNDLES ====================
async function loadProductBundles() {
    try {
        const response = await fetch(`${API_BASE_URL}/products/bundles`);
        const data = await response.json();
        
        if (data.success && data.bundles) {
            displayBundles(data.bundles);
        } else {
            // Fallback to sample bundles
            displayBundles(getSampleBundles());
        }
    } catch (error) {
        console.error('Error loading bundles:', error);
        displayBundles(getSampleBundles());
    }
}

function getSampleBundles() {
    return [
        {
            id: 'bundle1',
            name: 'Complete Skincare Routine',
            description: 'Cleanser, Serum, Moisturizer & Eye Cream',
            price: 89.99,
            originalPrice: 116.96,
            image: 'image curology.jpeg',
            savings: 'Save 23%'
        },
        {
            id: 'bundle2',
            name: 'Anti-Aging Duo',
            description: 'Vitamin C Serum + Retinol Night Cream',
            price: 64.99,
            originalPrice: 79.98,
            image: 'image curology.jpeg',
            savings: 'Save 19%'
        },
        {
            id: 'bundle3',
            name: 'Sensitive Skin Kit',
            description: 'Gentle Cleanser, Soothing Serum & Calming Moisturizer',
            price: 74.99,
            originalPrice: 92.97,
            image: 'image curology.jpeg',
            savings: 'Save 19%'
        }
    ];
}

function displayBundles(bundles) {
    const bundlesGrid = document.getElementById('bundlesGrid');
    if (!bundlesGrid) return;

    bundlesGrid.innerHTML = bundles.map(bundle => `
        <div class="bundle-card">
            <div class="bundle-badge">BUNDLE</div>
            <div class="bundle-image">
                <img src="${bundle.image}" alt="${bundle.name}" loading="lazy">
            </div>
            <div class="bundle-info">
                <h3 class="bundle-title">${bundle.name}</h3>
                <p class="bundle-description">${bundle.description}</p>
                <div class="bundle-price">
                    <span class="current">£${bundle.price.toFixed(2)}</span>
                    <span class="original">£${bundle.originalPrice.toFixed(2)}</span>
                    <span class="bundle-savings">${bundle.savings}</span>
                </div>
                <button class="cta-button small add-bundle" 
                    data-id="${bundle.id}"
                    data-name="${bundle.name}"
                    data-price="${bundle.price}"
                    data-image="${bundle.image}">
                    <i class="fas fa-cart-plus"></i> Add Bundle
                </button>
            </div>
        </div>
    `).join('');

    // Add event listeners to bundle buttons
    document.querySelectorAll('.add-bundle').forEach(button => {
        button.addEventListener('click', function() {
            const bundleId = this.getAttribute('data-id');
            const bundleName = this.getAttribute('data-name');
            const bundlePrice = parseFloat(this.getAttribute('data-price'));
            const bundleImage = this.getAttribute('data-image');
            
            // In a real implementation, you would add each item in the bundle
            // For now, we'll add the bundle as a single item
            addToCart(bundleId, bundleName, bundlePrice, bundleImage, 999);
            
            // Show notification
            cartNotification.show({
                name: bundleName,
                price: bundlePrice,
                image: bundleImage
            });
        });
    });
}

// ==================== OPTIMIZED PRODUCT DETAIL DISPLAY ====================
async function showEnhancedProductDetail(product) {
    console.log('🔍 Opening product detail modal for:', product.name);
    
    // Use numeric ID only
    const productIdForAPI = product.productId || product.id;
    console.log('📦 Using product ID for API:', productIdForAPI);
    
    // Close any existing modal first
    const existingModal = document.getElementById('productDetailModal');
    if (existingModal) {
        existingModal.remove();
    }
    
    // Use product data directly - NO API CALL to speed up loading
    let detailedProduct = product;
    
    // Create modal immediately
    const modal = document.createElement('div');
    modal.id = 'productDetailModal';
    modal.className = 'modal';
    modal.style.cssText = `
        display: flex !important;
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.8);
        z-index: 10000;
        justify-content: center;
        align-items: center;
        padding: 20px;
        box-sizing: border-box;
    `;

    // Simple product specs
    const productSpecs = detailedProduct.ingredients ? `
        <div class="product-specs">
            <h3><i class="fas fa-flask"></i> Key Ingredients</h3>
            <p>${detailedProduct.ingredients}</p>
        </div>
    ` : '';

    // Simple sizes section
    const sizesSection = detailedProduct.sizes ? `
        <div class="product-sizes">
            <h3>Available Sizes</h3>
            <div class="size-options">
                ${detailedProduct.sizes.map(size => `
                    <button class="size-btn ${size.selected ? 'active' : ''}" 
                            data-size="${size.size}" 
                            data-price="${size.price}">
                        ${size.size}
                    </button>
                `).join('')}
            </div>
        </div>
    ` : '';

    // Simple reviews section - NO API CALL
    // Social Media Style Reviews Section
const reviewsSection = `
    <div class="social-reviews-section" style="margin-top: 30px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; border-bottom: 1px solid #eee; padding-bottom: 10px;">
            <h3 style="margin: 0; font-size: 18px;">
                <i class="fas fa-comments" style="color: #4a7c59; margin-right: 8px;"></i>
                Customer Reviews
            </h3>
            <button class="write-review-btn" data-product-id="${productIdForAPI}" style="
                background: #4a7c59;
                color: white;
                border: none;
                padding: 8px 16px;
                border-radius: 20px;
                cursor: pointer;
                font-weight: 500;
                font-size: 14px;
                display: flex;
                align-items: center;
                gap: 5px;
            ">
                <i class="fas fa-edit"></i> Write Review
            </button>
        </div>
        
        <div class="reviews-feed" id="reviewsFeed_${productIdForAPI}" style="max-height: 400px; overflow-y: auto; padding-right: 10px;">
            <div class="reviews-loading" style="text-align: center; padding: 30px;">
                <div class="loading-spinner" style="width: 30px; height: 30px; border: 3px solid #f3f3f3; border-top: 3px solid #4a7c59; border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto 15px;"></div>
                <p>Loading reviews...</p>
            </div>
        </div>
    </div>
    
    <style>
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
        .reviews-feed::-webkit-scrollbar {
            width: 6px;
        }
        .reviews-feed::-webkit-scrollbar-track {
            background: #f1f1f1;
            border-radius: 10px;
        }
        .reviews-feed::-webkit-scrollbar-thumb {
            background: #ccc;
            border-radius: 10px;
        }
    </style>
`;

    modal.innerHTML = `
        <div class="modal-content" style="
            background: white;
            padding: 30px;
            border-radius: 12px;
            max-width: 800px;
            width: 90%;
            max-height: 90vh;
            overflow-y: auto;
            position: relative;
        ">
            <button class="close-modal" style="
                position: absolute;
                top: 15px;
                right: 15px;
                background: none;
                border: none;
                font-size: 24px;
                cursor: pointer;
                color: #666;
                z-index: 10;
            ">&times;</button>
            
            <div class="product-detail-container" style="
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 40px;
                align-items: start;
            ">
                <!-- Product Images -->
                <div class="product-images" style="
                    display: flex;
                    flex-direction: column;
                    gap: 15px;
                ">
                    <div class="main-image" style="
                        border-radius: 10px;
                        overflow: hidden;
                        background: #f9fafb;
                        height: 350px;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                    ">
                        <img src="${detailedProduct.image}" alt="${detailedProduct.name}" loading="lazy" style="
                            max-width: 100%;
                            max-height: 100%;
                            object-fit: contain;
                        ">
                    </div>
                </div>
                
                <!-- Product Info -->
                <div class="product-info" style="
                    display: flex;
                    flex-direction: column;
                    gap: 20px;
                ">
                    <div>
                        <h2 style="
                            font-size: 28px;
                            color: #1a202c;
                            margin-bottom: 10px;
                        ">${detailedProduct.name}</h2>
                        
                        <div class="product-rating" style="
                            display: flex;
                            align-items: center;
                            gap: 10px;
                            margin-bottom: 15px;
                        ">
                            ${generateStarRating(detailedProduct.rating || 4.5)}
                            <span style="color: #6b7280;">(${detailedProduct.numReviews || 0} reviews)</span>
                        </div>
                        
                        <p style="
                            color: #4a5568;
                            line-height: 1.6;
                            margin-bottom: 20px;
                        ">${detailedProduct.description}</p>
                    </div>
                    
                    ${productSpecs}
                    
                    ${sizesSection}
                    
                    <div class="product-price-section" style="
                        background: #f8fafc;
                        padding: 20px;
                        border-radius: 8px;
                    ">
                        <div class="price" style="
                            font-size: 32px;
                            font-weight: bold;
                            color: #4a7c59;
                            margin-bottom: 10px;
                        ">£${detailedProduct.price.toFixed(2)}</div>
                        
                        ${detailedProduct.originalPrice ? `
                            <div style="
                                display: flex;
                                align-items: center;
                                gap: 10px;
                                margin-bottom: 10px;
                            ">
                                <span style="
                                    text-decoration: line-through;
                                    color: #9ca3af;
                                    font-size: 20px;
                                ">£${detailedProduct.originalPrice.toFixed(2)}</span>
                                <span style="
                                    background: #4a7c59;
                                    color: white;
                                    padding: 4px 8px;
                                    border-radius: 4px;
                                    font-size: 14px;
                                    font-weight: 600;
                                ">Save ${calculateSavePercent(detailedProduct.price, detailedProduct.originalPrice)}%</span>
                            </div>
                        ` : ''}
                        
                        ${detailedProduct.stockQuantity > 0 ? `
                            <div class="stock-status" style="
                                color: #059669;
                                font-weight: 500;
                                margin-bottom: 20px;
                                display: flex;
                                align-items: center;
                                gap: 8px;
                            ">
                                <i class="fas fa-check-circle"></i> In Stock (${detailedProduct.stockQuantity} available)
                            </div>
                        ` : `
                            <div class="stock-status" style="
                                color: #dc2626;
                                font-weight: 500;
                                margin-bottom: 20px;
                                display: flex;
                                align-items: center;
                                gap: 8px;
                            ">
                                <i class="fas fa-times-circle"></i> Out of Stock
                            </div>
                        `}
                        
                        <div class="product-actions" style="
                            display: flex;
                            gap: 15px;
                            flex-wrap: wrap;
                        ">
                            <button class="add-to-cart-btn" style="
                                flex: 1;
                                padding: 15px 30px;
                                background: linear-gradient(135deg, #4a7c59 0%, #3a6548 100%);
                                color: white;
                                border: none;
                                border-radius: 8px;
                                font-size: 16px;
                                font-weight: 600;
                                cursor: pointer;
                                transition: all 0.3s ease;
                                min-width: 200px;
                            " data-id="${detailedProduct.productId || detailedProduct.id}" 
                               data-name="${detailedProduct.name}" 
                               data-price="${detailedProduct.price}"
                               data-image="${detailedProduct.image}"
                               data-stock="${detailedProduct.stockQuantity}"
                               ${detailedProduct.stockQuantity === 0 ? 'disabled' : ''}>
                                ${detailedProduct.stockQuantity === 0 ? 'Out of Stock' : 'Add to Cart'}
                            </button>
                            
                            <button class="wishlist-btn" style="
                                padding: 15px 20px;
                                background: white;
                                border: 2px solid #e5e7eb;
                                border-radius: 8px;
                                color: #4b5563;
                                font-size: 16px;
                                font-weight: 600;
                                cursor: pointer;
                                transition: all 0.3s ease;
                            ">
                                <i class="far fa-heart"></i> Wishlist
                            </button>
                        </div>
                    </div>
                    
                    ${reviewsSection}
                </div>
            </div>
        </div>
    `;

    document.body.appendChild(modal);
    document.body.style.overflow = 'hidden';

    // Load reviews for this product
setTimeout(async () => {
    const reviews = await reviewSystem.loadProductReviews(productIdForAPI);
    displaySocialReviews(productIdForAPI, reviews);
}, 300);

    // Add event listeners
    const closeBtn = modal.querySelector('.close-modal');
    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            modal.style.display = 'none';
            setTimeout(() => {
                modal.remove();
                document.body.style.overflow = '';
            }, 300);
        });
    }

    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.style.display = 'none';
            setTimeout(() => {
                modal.remove();
                document.body.style.overflow = '';
            }, 300);
        }
    });

    // Add to cart functionality
    const addToCartBtn = modal.querySelector('.add-to-cart-btn');
    if (addToCartBtn) {
        addToCartBtn.addEventListener('click', function() {
            const id = this.getAttribute('data-id');
            const name = this.getAttribute('data-name');
            const price = parseFloat(this.getAttribute('data-price'));
            const image = this.getAttribute('data-image');
            const stock = parseInt(this.getAttribute('data-stock'));
            
            addToCart(id, name, price, image, stock);
            
            // Show notification
            simpleNotification.show(`Added ${name} to cart!`, 'success');
            
            // Visual feedback
            this.innerHTML = '<i class="fas fa-check"></i> Added!';
            this.style.backgroundColor = '#3a6548';
            
            setTimeout(() => {
                modal.style.display = 'none';
                setTimeout(() => {
                    modal.remove();
                    document.body.style.overflow = '';
                }, 300);
            }, 1000);
        });
    }

    // Wishlist functionality
    const wishlistBtn = modal.querySelector('.wishlist-btn');
    if (wishlistBtn) {
        wishlistBtn.addEventListener('click', function() {
            const icon = this.querySelector('i');
            if (icon.classList.contains('far')) {
                icon.classList.remove('far');
                icon.classList.add('fas');
                icon.style.color = '#e74c3c';
                simpleNotification.show('Added to wishlist!', 'success');
            } else {
                icon.classList.remove('fas');
                icon.classList.add('far');
                icon.style.color = '#4b5563';
                simpleNotification.show('Removed from wishlist', 'info');
            }
        });
    }

    // Write Review button functionality - ADD THIS CODE
const writeReviewBtn = modal.querySelector('.write-review-btn');
if (writeReviewBtn) {
    writeReviewBtn.addEventListener('click', function(e) {
        e.stopPropagation(); // Prevent event bubbling
        
        // Get the product ID from the button
        const productId = this.getAttribute('data-product-id');
        
        if (productId) {
            // Open the review modal
            reviewSystem.show(productId);
            
            // Close the product detail modal
            modal.style.display = 'none';
            setTimeout(() => {
                modal.remove();
                document.body.style.overflow = '';
            }, 300);
        }
    });
}

    // Size selection
    const sizeBtns = modal.querySelectorAll('.size-btn');
    sizeBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            sizeBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            
            const newPrice = parseFloat(this.getAttribute('data-price'));
            const priceElement = modal.querySelector('.price');
            if (priceElement) {
                priceElement.textContent = `£${newPrice.toFixed(2)}`;
            }
            
            // Update add to cart button price
            if (addToCartBtn) {
                addToCartBtn.setAttribute('data-price', newPrice);
            }
        });
    });
}

function generateStarRating(rating) {
    const fullStars = Math.floor(rating);
    const halfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);
    
    let stars = '';
    for (let i = 0; i < fullStars; i++) stars += '★';
    if (halfStar) stars += '½';
    for (let i = 0; i < emptyStars; i++) stars += '☆';
    return stars;
}

function calculateSavePercent(current, original) {
    return Math.round((1 - current / original) * 100);
}

function calculateAverageRating(reviews) {
    if (!reviews || reviews.length === 0) return 0;
    const sum = reviews.reduce((total, review) => total + review.rating, 0);
    return (sum / reviews.length).toFixed(1);
}

// ==================== FIXED AUTHENTICATION SERVICE ====================
class AuthService {
    constructor() {
        this.BASE_URL = `${API_BASE_URL}/auth`;
        this.token = null;
        this.user = null;
        this.autoLogoutTimer = null;
        
        this.loadUserData();
        this.setupAutoLogout();
    }

    saveUserData() {
        try {
            if (this.token) {
                localStorage.setItem('authToken', this.token);
            }
            
            if (this.user) {
                localStorage.setItem('user', JSON.stringify(this.user));
            }
            
            return true;
        } catch (error) {
            console.error('❌ Error saving user data:', error);
            return false;
        }
    }

    loadUserData() {
        try {
            const token = localStorage.getItem('authToken');
            const userStr = localStorage.getItem('user');
            
            if (token) this.token = token;
            
            if (userStr) {
                try {
                    this.user = JSON.parse(userStr);
                } catch (e) {
                    this.user = null;
                }
            }
            
            return { token: this.token, user: this.user };
        } catch (error) {
            console.error('❌ Error loading user data:', error);
            return null;
        }
    }

    setupAutoLogout() {
        if (this.token && this.isTokenExpired(this.token)) {
            this.logout();
            return;
        }

        if (this.token) {
            this.autoLogoutTimer = setTimeout(() => {
                this.logout();
                this.showNotification('Your session has expired. Please log in again.', 'warning');
            }, 24 * 60 * 60 * 1000);
        }
    }

    isTokenExpired(token) {
        try {
            const decoded = JSON.parse(atob(token.split('.')[1]));
            return decoded.exp * 1000 < Date.now();
        } catch (error) {
            return true;
        }
    }

    isLoggedIn() {
        const hasToken = !!localStorage.getItem('authToken');
        const hasUser = !!localStorage.getItem('user');
        
        if (hasToken && !this.token) this.token = localStorage.getItem('authToken');
        if (hasUser && !this.user) {
            try {
                this.user = JSON.parse(localStorage.getItem('user'));
            } catch (e) {
                this.user = null;
            }
        }
        
        return hasToken && hasUser;
    }

    getCurrentUser() {
        if (!this.user) {
            const userStr = localStorage.getItem('user');
            if (userStr) {
                try {
                    this.user = JSON.parse(userStr);
                } catch (e) {
                    this.user = null;
                }
            }
        }
        return this.user;
    }

    async register(userData) {
        try {
            const response = await fetch(`${this.BASE_URL}/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(userData)
            });

            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.message || 'Registration failed');
            }
            
            return await this.login({
                email: userData.email,
                password: userData.password
            });
            
        } catch (error) {
            console.error('Registration error:', error);
            throw error;
        }
    }

    async login(credentials) {
        try {
            console.log('🔄 Login attempt to:', this.BASE_URL + '/login');
            
            const response = await fetch(`${this.BASE_URL}/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(credentials)
            });

            // First, try to get the error message
            let errorMessage = `Server error: ${response.status}`;
            let data;
            
            try {
                data = await response.json();
                errorMessage = data.message || errorMessage;
            } catch (parseError) {
                try {
                    const errorText = await response.text();
                    errorMessage = errorText || errorMessage;
                } catch (textError) {
                    // If we can't read the body, use the status
                    errorMessage = `Server returned ${response.status}`;
                }
            }
            
            if (!response.ok) {
                throw new Error(errorMessage);
            }

            // If we got here, response is OK
            if (data.success) {
                this.token = data.token;
                
                this.user = {
                    _id: data.data?._id || data.data?.id || data.user?._id || data.user?.id || data.userId || 'temp-id',
                    id: data.data?._id || data.data?.id || data.user?._id || data.user?.id || data.userId || 'temp-id',
                    name: data.data?.name || data.user?.name || credentials.email.split('@')[0],
                    email: data.data?.email || data.user?.email || credentials.email,
                    isVerified: data.data?.isVerified !== undefined ? data.data.isVerified : 
                               data.user?.isVerified !== undefined ? data.user.isVerified : false,
                    role: data.data?.role || data.user?.role || 'user',
                    phone: data.data?.phone || data.user?.phone || '',
                    address: data.data?.address || data.user?.address || ''
                };
                
                console.log('👤 Created user object:', this.user);
                
                this.saveUserData();
                
                this.setupAutoLogout();
                this.updateUI();
                console.log('✅ Login successful');
                return data;
            } else {
                throw new Error(data.message || 'Login failed');
            }
        } catch (error) {
            console.error('❌ Login error:', error);
            
            if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
                throw new Error('Cannot connect to server. Please check your internet connection.');
            }
            
            throw error;
        }
    }

    logout() {
        console.log('🚪 Logging out...');
        
        this.token = null;
        this.user = null;
        
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
        
        if (this.autoLogoutTimer) {
            clearTimeout(this.autoLogoutTimer);
            this.autoLogoutTimer = null;
        }
        
        console.log('✅ Logout complete');
        
        this.updateUI();
        
        if (profileModal) {
            profileModal.style.display = 'flex';
            this.showAuthForms();
        }
    }

    async forgotPassword(email) {
        try {
            const response = await fetch(`${this.BASE_URL}/forgot-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            });

            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.message || 'Password reset failed');
            }
            
            return data;
        } catch (error) {
            console.error('Forgot password error:', error);
            throw error;
        }
    }

    async submitContact(formData) {
        try {
            const response = await fetch(`${API_BASE_URL}/contact`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.message || 'Message sending failed');
            }
            
            return data;
        } catch (error) {
            console.error('Contact form error:', error);
            // Fallback to demo mode if API fails
            console.log('📧 Contact form simulated as fallback');
            return {
                success: true,
                message: 'Message sent successfully!'
            };
        }
    }

    updateUI() {
        const profileBtn = document.getElementById('profileBtn');
        if (!profileBtn) return;
        
        const profileIcon = profileBtn.querySelector('i');
        
        if (this.isLoggedIn()) {
            if (this.user && this.user.isVerified) {
                profileIcon.className = 'fas fa-user-check';
                profileBtn.style.color = '#4a7c59';
            } else {
                profileIcon.className = 'fas fa-user-clock';
                profileBtn.style.color = '#f39c12';
            }
            const userName = this.user ? this.user.name : 'User';
            profileBtn.title = `Logged in as ${userName}`;
        } else {
            profileIcon.className = 'fas fa-user';
            profileBtn.style.color = '';
            profileBtn.title = 'Account';
        }
    }

    setupPasswordToggle() {
        const toggleLoginPassword = document.getElementById('toggleLoginPassword');
        const loginPasswordInput = document.getElementById('loginPassword');
        
        if (toggleLoginPassword && loginPasswordInput) {
            const newToggle = toggleLoginPassword.cloneNode(true);
            toggleLoginPassword.parentNode.replaceChild(newToggle, toggleLoginPassword);
            
            newToggle.addEventListener('click', () => {
                const type = loginPasswordInput.getAttribute('type') === 'password' ? 'text' : 'password';
                loginPasswordInput.setAttribute('type', type);
                const icon = newToggle.querySelector('i');
                if (icon) {
                    icon.className = type === 'password' ? 'fas fa-eye' : 'fas fa-eye-slash';
                }
            });
        }

        const toggleSignupPassword = document.getElementById('toggleSignupPassword');
        const signupPasswordInput = document.getElementById('signupPassword');
        
        if (toggleSignupPassword && signupPasswordInput) {
            const newToggle = toggleSignupPassword.cloneNode(true);
            toggleSignupPassword.parentNode.replaceChild(newToggle, toggleSignupPassword);
            
            newToggle.addEventListener('click', () => {
                const type = signupPasswordInput.getAttribute('type') === 'password' ? 'text' : 'password';
                signupPasswordInput.setAttribute('type', type);
                const icon = newToggle.querySelector('i');
                if (icon) {
                    icon.className = type === 'password' ? 'fas fa-eye' : 'fas fa-eye-slash';
                }
            });
        }
    }

    showAuthForms() {
        const modalContent = document.querySelector('.modal-content');
        if (!modalContent) return;
        
        modalContent.innerHTML = `
            <div class="modal-header">
                <h2>Account</h2>
                <button class="close-modal" id="closeModal">&times;</button>
            </div>
            <div class="auth-tabs">
                <button class="auth-tab active" data-tab="login">Login</button>
                <button class="auth-tab" data-tab="signup">Sign Up</button>
            </div>
            
            <div class="auth-form active" id="loginForm">
                <div class="form-group">
                    <label for="loginEmail">Email</label>
                    <input type="email" id="loginEmail" placeholder="Your email address" style="width: 100%; box-sizing: border-box;">
                </div>
                <div class="form-group password-group">
                    <label for="loginPassword">Password</label>
                    <div class="password-input-container">
                        <input type="password" id="loginPassword" placeholder="Your password" class="password-input" style="width: 100%; box-sizing: border-box;">
                        <button type="button" class="toggle-password" id="toggleLoginPassword">
                            <i class="fas fa-eye"></i>
                        </button>
                    </div>
                </div>
                <div class="form-group" style="text-align: right; margin-bottom: 20px;">
                    <a href="#" id="forgotPasswordLink" style="color: var(--primary); text-decoration: none; font-size: 0.9rem;">Forgot Password?</a>
                </div>
                <button class="auth-btn" id="loginBtn">Login</button>
            </div>
            
            <div class="auth-form" id="signupForm">
                <div class="form-group">
                    <label for="signupName">Full Name</label>
                    <input type="text" id="signupName" placeholder="Your full name" style="width: 100%; box-sizing: border-box;">
                </div>
                <div class="form-group">
                    <label for="signupEmail">Email</label>
                    <input type="email" id="signupEmail" placeholder="Your email address" style="width: 100%; box-sizing: border-box;">
                </div>
                <div class="form-group password-group">
                    <label for="signupPassword">Password</label>
                    <div class="password-input-container">
                        <input type="password" id="signupPassword" placeholder="Create a password (min. 6 characters)" class="password-input" style="width: 100%; box-sizing: border-box;">
                        <button type="button" class="toggle-password" id="toggleSignupPassword">
                            <i class="fas fa-eye"></i>
                        </button>
                    </div>
                </div>
                <button class="auth-btn" id="signupBtn">Sign Up</button>
            </div>
            
            <div class="auth-form" id="forgotPasswordForm">
                <div class="form-group">
                    <label for="resetEmail">Email Address</label>
                    <input type="email" id="resetEmail" placeholder="Enter your email address" style="width: 100%; box-sizing: border-box;">
                </div>
                <button class="auth-btn" id="resetPasswordBtn">Reset Password</button>
                <div class="form-group" style="text-align: center; margin-top: 15px;">
                    <a href="#" id="backToLoginLink" style="color: var(--primary); text-decoration: none; font-size: 0.9rem;">Back to Login</a>
                </div>
            </div>
        `;

        this.setupPasswordToggle();
        this.setupAuthEventListeners();
    }

    setupAuthEventListeners() {
        document.querySelectorAll('.auth-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                const targetTab = tab.getAttribute('data-tab');
                
                document.querySelectorAll('.auth-tab').forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                
                document.querySelectorAll('.auth-form').forEach(form => {
                    form.classList.remove('active');
                    if (form.id === `${targetTab}Form`) {
                        form.classList.add('active');
                    }
                });

                this.setupPasswordToggle();
            });
        });

        const loginBtn = document.getElementById('loginBtn');
        if (loginBtn) {
            loginBtn.addEventListener('click', () => this.handleLogin());
        }
        
        const signupBtn = document.getElementById('signupBtn');
        if (signupBtn) {
            signupBtn.addEventListener('click', () => this.handleSignup());
        }
        
        const forgotPasswordLink = document.getElementById('forgotPasswordLink');
        if (forgotPasswordLink) {
            forgotPasswordLink.addEventListener('click', (e) => {
                e.preventDefault();
                document.getElementById('loginForm').classList.remove('active');
                document.getElementById('forgotPasswordForm').classList.add('active');
                this.setupPasswordToggle();
            });
        }
        
        const backToLoginLink = document.getElementById('backToLoginLink');
        if (backToLoginLink) {
            backToLoginLink.addEventListener('click', (e) => {
                e.preventDefault();
                document.getElementById('forgotPasswordForm').classList.remove('active');
                document.getElementById('loginForm').classList.add('active');
                this.setupPasswordToggle();
            });
        }
        
        const resetPasswordBtn = document.getElementById('resetPasswordBtn');
        if (resetPasswordBtn) {
            resetPasswordBtn.addEventListener('click', () => this.handleForgotPassword());
        }
        
        const closeModal = document.getElementById('closeModal');
        if (closeModal) {
            const newCloseBtn = closeModal.cloneNode(true);
            closeModal.parentNode.replaceChild(newCloseBtn, closeModal);
            
            newCloseBtn.addEventListener('click', () => {
                if (profileModal) {
                    profileModal.style.display = 'none';
                }
            });
        }

        document.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                const activeForm = document.querySelector('.auth-form.active');
                if (activeForm) {
                    if (activeForm.id === 'loginForm') {
                        this.handleLogin();
                    } else if (activeForm.id === 'signupForm') {
                        this.handleSignup();
                    } else if (activeForm.id === 'forgotPasswordForm') {
                        this.handleForgotPassword();
                    }
                }
            }
        });
    }

    async handleLogin() {
        const email = document.getElementById('loginEmail')?.value;
        const password = document.getElementById('loginPassword')?.value;
        const loginBtn = document.getElementById('loginBtn');
        
        if (!email || !password) {
            this.showAuthMessage('Please fill in all fields', 'error');
            return;
        }
        
        try {
            loginBtn.innerHTML = '<div class="loading-spinner"></div> Logging in...';
            loginBtn.disabled = true;
            
            await this.login({ email, password });
            
            this.showAuthMessage('Login successful!', 'success');
            
            this.saveUserData();
            this.updateUI();
            
            setTimeout(() => {
                if (profileModal) {
                    profileModal.style.display = 'none';
                }
            }, 1500);
            
        } catch (error) {
            console.error('❌ Login error:', error);
            this.showAuthMessage(error.message, 'error');
        } finally {
            if (loginBtn) {
                loginBtn.innerHTML = 'Login';
                loginBtn.disabled = false;
            }
        }
    }

    async handleSignup() {
        const name = document.getElementById('signupName')?.value;
        const email = document.getElementById('signupEmail')?.value;
        const password = document.getElementById('signupPassword')?.value;
        const signupBtn = document.getElementById('signupBtn');
        
        if (!name || !email || !password) {
            this.showAuthMessage('Please fill in all fields', 'error');
            return;
        }
        
        if (password.length < 6) {
            this.showAuthMessage('Password must be at least 6 characters', 'error');
            return;
        }
        
        try {
            signupBtn.innerHTML = '<div class="loading-spinner"></div> Creating account...';
            signupBtn.disabled = true;
            
            await this.register({ name, email, password });
            this.showAuthMessage('Account created successfully!', 'success');
            
            setTimeout(() => {
                if (profileModal) profileModal.style.display = 'none';
            }, 1500);
            
        } catch (error) {
            this.showAuthMessage(error.message, 'error');
        } finally {
            if (signupBtn) {
                signupBtn.innerHTML = 'Sign Up';
                signupBtn.disabled = false;
            }
        }
    }

    async handleForgotPassword() {
        const email = document.getElementById('resetEmail')?.value;
        const resetBtn = document.getElementById('resetPasswordBtn');
        
        if (!email) {
            this.showAuthMessage('Please enter your email address', 'error');
            return;
        }
        
        try {
            resetBtn.innerHTML = '<div class="loading-spinner"></div> Sending...';
            resetBtn.disabled = true;
            
            await this.forgotPassword(email);
            this.showAuthMessage('Password reset instructions sent to your email', 'success');
            
            setTimeout(() => {
                document.getElementById('forgotPasswordForm').classList.remove('active');
                document.getElementById('loginForm').classList.add('active');
            }, 2000);
            
        } catch (error) {
            this.showAuthMessage(error.message, 'error');
        } finally {
            if (resetBtn) {
                resetBtn.innerHTML = 'Reset Password';
                resetBtn.disabled = false;
            }
        }
    }

    async handleContactForm() {
    const nameInput = document.getElementById('contactName');
    const emailInput = document.getElementById('contactEmail');
    const messageInput = document.getElementById('contactMessage');
    const contactBtn = document.getElementById('contactBtn');
    
    // If elements don't exist, create them
    if (!nameInput || !emailInput || !messageInput || !contactBtn) {
        console.log('🔄 Creating missing contact form elements');
        createContactFormIfMissing();
        
        // Wait a bit and try again
        setTimeout(() => {
            this.handleContactForm();
        }, 500);
        return;
    }
    
    const name = nameInput.value;
    const email = emailInput.value;
    const message = messageInput.value;
    
    if (!name || !email || !message) {
        this.showContactMessage('Please fill in all fields', 'error');
        return;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        this.showContactMessage('Please enter a valid email address', 'error');
        return;
    }
    
    try {
        contactBtn.innerHTML = '<div class="loading-spinner"></div> Sending...';
        contactBtn.disabled = true;
        
        await this.submitContact({ name, email, message });
        this.showContactMessage('Message sent successfully! We will get back to you soon.', 'success');
        
        // Clear form
        nameInput.value = '';
        emailInput.value = '';
        messageInput.value = '';
        
    } catch (error) {
        console.error('Contact form error:', error);
        this.showContactMessage(error.message || 'Failed to send message. Please try again.', 'error');
    } finally {
        contactBtn.innerHTML = 'Send Message';
        contactBtn.disabled = false;
    }
}

    showAuthMessage(message, type) {
        const existingMessage = document.querySelector('.auth-message');
        if (existingMessage) {
            existingMessage.remove();
        }
        
        const messageEl = document.createElement('div');
        messageEl.className = `auth-message ${type}`;
        messageEl.textContent = message;
        
        const activeForm = document.querySelector('.auth-form.active');
        if (activeForm) {
            activeForm.insertBefore(messageEl, activeForm.firstChild);
        }
        
        setTimeout(() => {
            if (messageEl.parentElement) {
                messageEl.remove();
            }
        }, 5000);
    }

    showContactMessage(message, type) {
        const existingMessages = document.querySelectorAll('.contact-message');
        existingMessages.forEach(msg => msg.remove());
        
        const messageEl = document.createElement('div');
        messageEl.className = `contact-message ${type}`;
        messageEl.textContent = message;
        messageEl.style.cssText = `
            padding: 12px 15px;
            border-radius: 5px;
            margin-bottom: 15px;
            text-align: center;
            font-weight: 500;
        `;
        
        if (type === 'success') {
            messageEl.style.background = '#d4edda';
            messageEl.style.color = '#155724';
            messageEl.style.border = '1px solid #c3e6cb';
        } else {
            messageEl.style.background = '#f8d7da';
            messageEl.style.color = '#721c24';
            messageEl.style.border = '1px solid #f5c6cb';
        }
        
        const contactForm = document.querySelector('.contact-form');
        if (contactForm) {
            const formElement = contactForm.querySelector('form');
            if (formElement) {
                contactForm.insertBefore(messageEl, formElement);
            } else {
                contactForm.appendChild(messageEl);
            }
        }
        
        setTimeout(() => {
            if (messageEl.parentElement) {
                messageEl.remove();
            }
        }, 5000);
    }

    showNotification(message, type = 'info') {
        simpleNotification.show(message, type);
    }

    getAuthHeaders() {
        const token = localStorage.getItem('authToken');
        
        const headers = {
            'Content-Type': 'application/json',
        };
        
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
        
        return headers;
    }

    async getUserOrders() {
    try {
        const token = localStorage.getItem('authToken');
        
        if (!token) {
            console.log('No auth token found');
            return [];
        }
        
        const response = await fetch(`${API_BASE_URL}/orders/my-orders`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });
        
        console.log('Orders API response status:', response.status);
        
        if (response.status === 401) {
            // Token expired or invalid
            console.log('Token expired, logging out');
            this.logout();
            return [];
        }
        
        if (!response.ok) {
            console.error('Orders API error:', response.status);
            return [];
        }
        
        const data = await response.json();
        
        return Array.isArray(data.data) ? data.data : 
               Array.isArray(data) ? data : 
               (data.data ? [data.data] : []);
    } catch (error) {
        console.error('Get user orders error:', error);
        return [];
    }
}

    async associateGuestOrders(email) {
        try {
            const response = await fetch(`${API_BASE_URL}/orders/associate-guest`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                },
                body: JSON.stringify({ email: email })
            });
            
            if (!response.ok) {
                const errorText = await response.text();
                console.error('❌ Server error:', errorText);
                return 0;
            }
            
            const data = await response.json();
            return data.count || 0;
            
        } catch (error) {
            console.error('❌ Associate error:', error);
            return 0;
        }
    }

    // FIXED: Profile loads immediately
    async showUserProfile() {
        const modalContent = document.querySelector('.modal-content');
        if (!this.isLoggedIn() || !modalContent) {
            this.showAuthForms();
            return;
        }

        // Show immediate loading
        modalContent.innerHTML = `
            <div class="modal-header">
                <h2>My Account</h2>
                <button class="close-modal" id="closeModal">&times;</button>
            </div>
            <div style="text-align: center; padding: 40px;">
                <div class="loading-spinner"></div>
                <p>Loading profile...</p>
            </div>
        `;

        // Load user data immediately
        setTimeout(async () => {
            try {
                const user = this.getCurrentUser();
                modalContent.innerHTML = `
                    <div class="modal-header modern-header">
                        <div class="header-content">
                            <h2><i class="fas fa-user-circle"></i> My Account</h2>
                            <p class="header-subtitle">Manage your profile and orders</p>
                        </div>
                        <button class="close-modal" id="closeModal">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    
                    <div class="modern-profile">
                        <div class="profile-card">
                            <div class="profile-avatar">
                                <div class="avatar-circle">
                                    <span>${user.name?.charAt(0) || 'U'}</span>
                                </div>
                                <div class="online-status"></div>
                            </div>
                            <div class="profile-info">
                                <h3 class="profile-name">${user.name || 'User'}</h3>
                                <p class="profile-email">${user.email || 'No email'}</p>
                                <div class="profile-stats">
    <div class="stat-item">
        <span class="stat-number" id="orderCount">0</span>
        <span class="stat-label">Orders</span>
    </div>
    <div class="stat-item">
        <span class="stat-number" id="reviewCount">0</span>
        <span class="stat-label">Reviews</span>
    </div>
</div>
                            </div>
                        </div>

                        <div class="quick-actions">
                            <h3 class="section-title"><i class="fas fa-bolt"></i> Quick Actions</h3>
                            <div class="actions-grid">
                                <button class="action-btn" id="viewOrdersBtn">
                                    <div class="action-icon">
                                        <i class="fas fa-shopping-bag"></i>
                                    </div>
                                    <span>My Orders</span>
                                </button>
                                
                                <button class="action-btn" id="viewReviewsBtn">
                                    <div class="action-icon">
                                        <i class="fas fa-star"></i>
                                    </div>
                                    <span>My Reviews</span>
                                </button>
                            </div>
                        </div>

                        <div class="account-settings">
                            <h3 class="section-title"><i class="fas fa-cog"></i> Account Settings</h3>
                            <div class="settings-list">
                                <button class="setting-item" id="editProfileBtn">
                                    <i class="fas fa-user-edit"></i>
                                    <span>Edit Profile</span>
                                    <i class="fas fa-chevron-right"></i>
                                </button>
                            </div>
                        </div>

                        <button class="logout-btn" id="logoutBtn" style="
                            width: 100%;
                            padding: 16px;
                            background: linear-gradient(135deg, #e74c3c 0%, #c0392b 100%);
                            color: white;
                            border: none;
                            border-radius: 12px;
                            font-size: 16px;
                            font-weight: 600;
                            cursor: pointer;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            gap: 10px;
                            transition: all 0.3s ease;
                            box-shadow: 0 4px 15px rgba(231, 76, 60, 0.3);
                            margin-top: 30px;
                        ">
                            <i class="fas fa-sign-out-alt"></i>
                            <span>Logout</span>
                        </button>
                    </div>
                `;

                this.setupProfileEventListeners();
                 this.loadOrderCount();
                 this.loadReviewCount();
            } catch (error) {
                console.error('Error loading profile:', error);
                this.showAuthForms();
            }
        }, 100);
    }

    // Add this method right after showUserProfile:
    async loadOrderCount() {
        try {
            const orders = await this.getUserOrders();
            const orderCountElement = document.getElementById('orderCount');
            
            if (orderCountElement) {
                orderCountElement.textContent = orders.length || 0;
            }
        } catch (error) {
            console.log('Could not load order count:', error);
        }
    }

    // Add this function
async loadReviewCount() {
    try {
        const user = authService.getCurrentUser();
        if (!user || !user.email) return;
        
        const reviewsKey = `roibeauty_reviews_${user.email}`;
        let reviews = [];
        
        try {
            const storedReviews = localStorage.getItem(reviewsKey);
            if (storedReviews) {
                reviews = JSON.parse(storedReviews);
            }
        } catch (e) {
            // No reviews yet
        }
        
        const reviewCountElement = document.getElementById('reviewCount');
        if (reviewCountElement) {
            reviewCountElement.textContent = reviews.length || 0;
        }
    } catch (error) {
        console.log('Could not load review count:', error);
    }
}

   async updateUserProfile(updatedData) {
    console.log('📦 Updating profile locally (backend not available)');
    
    // Update local user data
    this.user = { ...this.user, ...updatedData };
    this.saveUserData();
    this.updateUI();
    
    // Show success message
    this.showNotification('Profile updated locally! Changes saved to browser.', 'success');
    
    return { success: true, user: this.user };
}

    showEditProfileForm() {
    const modalContent = document.querySelector('.modal-content');
    if (!modalContent) return;

    const user = this.getCurrentUser();
    
    modalContent.innerHTML = `
        <div class="modal-header modern-header">
            <div class="header-content">
                <h2><i class="fas fa-user-edit"></i> Edit Profile</h2>
                <p class="header-subtitle">Update your personal information</p>
            </div>
            <button class="close-modal" id="closeModal">
                <i class="fas fa-times"></i>
            </button>
        </div>
        
        <div class="modern-profile">
            <div class="edit-profile-form" style="padding: 25px;">
                <div class="form-group" style="margin-bottom: 20px;">
                    <label for="editName" style="display: block; margin-bottom: 8px; font-weight: 500; color: #333;">Full Name</label>
                    <input type="text" id="editName" value="${user.name || ''}" 
                           style="width: 100%; padding: 12px; border: 1px solid #e0e0e0; border-radius: 6px; font-family: 'Poppins', sans-serif;">
                </div>
                <div class="form-group" style="margin-bottom: 20px;">
                    <label for="editEmail" style="display: block; margin-bottom: 8px; font-weight: 500; color: #333;">Email Address</label>
                    <input type="email" id="editEmail" value="${user.email || ''}" 
                           style="width: 100%; padding: 12px; border: 1px solid #e0e0e0; border-radius: 6px; font-family: 'Poppins', sans-serif;">
                </div>
                <div class="form-group" style="margin-bottom: 20px;">
                    <label for="editPhone" style="display: block; margin-bottom: 8px; font-weight: 500; color: #333;">Phone Number</label>
                    <input type="tel" id="editPhone" value="${user.phone || ''}" 
                           style="width: 100%; padding: 12px; border: 1px solid #e0e0e0; border-radius: 6px; font-family: 'Poppins', sans-serif;">
                </div>
                <div class="form-group" style="margin-bottom: 30px;">
                    <label for="editAddress" style="display: block; margin-bottom: 8px; font-weight: 500; color: #333;">Address</label>
                    <textarea id="editAddress" rows="3" 
                              style="width: 100%; padding: 12px; border: 1px solid #e0e0e0; border-radius: 6px; font-family: 'Poppins', sans-serif; resize: vertical;">${user.address || ''}</textarea>
                </div>
                
                <div class="form-actions" style="display: flex; gap: 10px; margin-top: 30px;">
                    <button type="button" class="cancel-btn" id="cancelEdit" 
                            style="flex: 1; padding: 12px; background: #f5f5f5; color: #333; border: 1px solid #e0e0e0; border-radius: 6px; font-weight: 500; cursor: pointer; transition: all 0.3s ease;">
                        Cancel
                    </button>
                    <button type="button" class="save-btn" id="saveProfile" 
                            style="flex: 1; padding: 12px; background: #4a7c59; color: white; border: none; border-radius: 6px; font-weight: 500; cursor: pointer; transition: all 0.3s ease;">
                        Save Changes
                    </button>
                </div>
            </div>
        </div>
    `;

    this.setupEditProfileListeners();
}

    setupEditProfileListeners() {
        const backBtn = document.getElementById('backToProfile');
        if (backBtn) {
            backBtn.addEventListener('click', () => this.showUserProfile());
        }

        const cancelBtn = document.getElementById('cancelEdit');
        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => this.showUserProfile());
        }

        const saveBtn = document.getElementById('saveProfile');
        if (saveBtn) {
            saveBtn.addEventListener('click', async () => {
                const updatedData = {
                    name: document.getElementById('editName').value,
                    email: document.getElementById('editEmail').value,
                    phone: document.getElementById('editPhone').value,
                    address: document.getElementById('editAddress').value
                };

                if (!updatedData.name || !updatedData.email) {
                    this.showNotification('Name and email are required', 'error');
                    return;
                }

                try {
                    await this.updateUserProfile(updatedData);
                    this.showNotification('Profile updated successfully!', 'success');
                    setTimeout(() => this.showUserProfile(), 1500);
                } catch (error) {
                    this.showNotification(error.message, 'error');
                }
            });
        }

        const closeModal = document.querySelector('.close-modal');
        if (closeModal) {
            closeModal.addEventListener('click', () => {
                if (profileModal) {
                    profileModal.style.display = 'none';
                }
            });
        }
    }

    async getUserReviews() {
        try {
            const token = localStorage.getItem('authToken');
            
            if (!token) {
                return [];
            }
            
            const response = await fetch(`${API_BASE_URL}/reviews/my-reviews`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });
            
            if (response.status === 401) {
                this.logout();
                return [];
            }
            
            if (!response.ok) {
                return [];
            }
            
            const data = await response.json();
            
            // Handle different response formats
            if (data.success && data.reviews) {
                return data.reviews;
            } else if (Array.isArray(data.data)) {
                return data.data;
            } else if (Array.isArray(data)) {
                return data;
            }
            
            return [];
        } catch (error) {
            console.error('Get user reviews error:', error);
            return [];
        }
    }

    setupProfileEventListeners() {
        const viewOrdersBtn = document.getElementById('viewOrdersBtn');
        if (viewOrdersBtn) {
            const newBtn = viewOrdersBtn.cloneNode(true);
            viewOrdersBtn.parentNode.replaceChild(newBtn, viewOrdersBtn);
            newBtn.addEventListener('click', () => this.showOrderHistory());
        }
        
        const viewAllOrdersBtn = document.getElementById('viewAllOrdersBtn');
        if (viewAllOrdersBtn) {
            const newBtn = viewAllOrdersBtn.cloneNode(true);
            viewAllOrdersBtn.parentNode.replaceChild(newBtn, viewAllOrdersBtn);
            newBtn.addEventListener('click', () => this.showOrderHistory());
        }
        
        const viewReviewsBtn = document.getElementById('viewReviewsBtn');
        if (viewReviewsBtn) {
            const newBtn = viewReviewsBtn.cloneNode(true);
            viewReviewsBtn.parentNode.replaceChild(newBtn, viewReviewsBtn);
            newBtn.addEventListener('click', () => this.showUserReviews());
        }
        
        const editProfileBtn = document.getElementById('editProfileBtn');
        if (editProfileBtn) {
            const newBtn = editProfileBtn.cloneNode(true);
            editProfileBtn.parentNode.replaceChild(newBtn, editProfileBtn);
            newBtn.addEventListener('click', () => {
                this.showEditProfileForm();
            });
        }
        
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            const newBtn = logoutBtn.cloneNode(true);
            logoutBtn.parentNode.replaceChild(newBtn, logoutBtn);
            newBtn.addEventListener('click', () => this.logout());
        }
        
        const closeModal = document.getElementById('closeModal');
        if (closeModal) {
            const newCloseBtn = closeModal.cloneNode(true);
            closeModal.parentNode.replaceChild(newCloseBtn, closeModal);
            newCloseBtn.addEventListener('click', () => {
                if (profileModal) {
                    profileModal.style.display = 'none';
                }
            });
        }
    }

    async loadRecentOrders() {
        try {
            const recentOrdersList = document.getElementById('recentOrdersList');
            if (!recentOrdersList) return;

            let orders = await this.getUserOrders();
            
            if (!Array.isArray(orders)) {
                orders = [];
            }
            
            const recentOrders = orders.slice(0, 3);
            
            if (!recentOrders || recentOrders.length === 0) {
                recentOrdersList.innerHTML = `
                    <div class="no-orders-mini">
                        <i class="fas fa-shopping-bag"></i>
                        <p>No orders yet</p>
                        <button class="btn" style="margin-top: 10px;" id="startShoppingMini">Start Shopping</button>
                    </div>
                `;
                
                const startShoppingBtn = document.getElementById('startShoppingMini');
                if (startShoppingBtn) {
                    startShoppingBtn.addEventListener('click', () => {
                        if (profileModal) profileModal.style.display = 'none';
                        showCatalogPage();
                    });
                }
                return;
            }
            
            let recentOrdersHTML = '';
            recentOrders.forEach(order => {
                const orderDate = order.createdAt 
                    ? new Date(order.createdAt).toLocaleDateString('en-US', { 
                        month: 'short', 
                        day: 'numeric' 
                    }) 
                    : 'N/A';
                
                const orderStatus = order.status || 'pending';
                const orderNumber = order.orderNumber || order.orderId?.substring(0, 8) || 'N/A';
                const totalAmount = order.totalAmount?.toFixed(2) || '0.00';
                
                recentOrdersHTML += `
                    <div class="order-item-mini" data-order-id="${order.orderId}">
                        <div class="order-mini-info">
                            <div class="order-mini-icon">
                                <i class="fas fa-box"></i>
                            </div>
                            <div class="order-mini-details">
                                <h4>Order #${orderNumber}</h4>
                                <p>${orderDate} • £${totalAmount}</p>
                            </div>
                        </div>
                        <span class="order-mini-status ${orderStatus}">${orderStatus}</span>
                    </div>
                `;
            });
            
            if (orders.length > 3) {
                recentOrdersHTML += `
                    <div class="order-item-mini view-all-mini" style="justify-content: center;">
                        <span style="color: #667eea; font-weight: 600;">
                            View all ${orders.length} orders
                        </span>
                    </div>
                `;
            }
            
            recentOrdersList.innerHTML = recentOrdersHTML;
            
            const orderCountElement = document.getElementById('orderCount');
            if (orderCountElement) {
                orderCountElement.textContent = orders.length;
            }
            
        } catch (error) {
            console.error('Error loading recent orders:', error);
            const recentOrdersList = document.getElementById('recentOrdersList');
            if (recentOrdersList) {
                recentOrdersList.innerHTML = `
                    <div class="no-orders-mini">
                        <i class="fas fa-exclamation-triangle"></i>
                        <p>Failed to load orders</p>
                    </div>
                `;
            }
        }
    }

    async showOrderHistory() {
        const modalContent = document.querySelector('.modal-content');
        if (!modalContent) return;

        try {
            modalContent.innerHTML = `
                <div class="modal-header">
                    <h2>My Orders</h2>
                    <button class="close-modal" id="closeModal">&times;</button>
                    <button class="back-btn" id="backToProfileBtn">
                        <i class="fas fa-arrow-left"></i> Back
                    </button>
                </div>
                <div class="order-history">
                    <div class="loading-orders">Loading your orders...</div>
                </div>
            `;

            let orders = await this.getUserOrders();
            
            if (!orders || !Array.isArray(orders)) {
                orders = [];
            }
            
            const orderHistory = document.querySelector('.order-history');
            
            if (orders.length === 0) {
                orderHistory.innerHTML = `
                    <div class="no-orders">
                        <i class="fas fa-shopping-bag"></i>
                        <h3>No Orders Yet</h3>
                        <p>You haven't placed any orders yet.</p>
                        <button class="btn" id="startShoppingBtn">Start Shopping</button>
                    </div>
                `;
                
                const startShoppingBtn = document.getElementById('startShoppingBtn');
                if (startShoppingBtn) {
                    const newBtn = startShoppingBtn.cloneNode(true);
                    startShoppingBtn.parentNode.replaceChild(newBtn, startShoppingBtn);
                    newBtn.addEventListener('click', () => {
                        if (profileModal) profileModal.style.display = 'none';
                        showCatalogPage();
                    });
                }
            } else {
                let ordersHTML = '';
                orders.forEach(order => {
                    const orderDate = order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'N/A';
                    const orderNumber = order.orderNumber || order._id?.substring(-8) || order.orderId?.substring(-8) || 'N/A';
                    const orderStatus = order.status || order.orderStatus || 'pending';
                    const totalPrice = order.totalPrice || order.totalAmount || 0;
                    
                    ordersHTML += `
                        <div class="order-card">
                            <div class="order-header">
                                <div>
                                    <h4>Order #${orderNumber}</h4>
                                    <p>Placed on ${orderDate}</p>
                                </div>
                                <div class="order-status ${orderStatus}">
                                    ${orderStatus}
                                </div>
                            </div>
                            <div class="order-items">
                                ${order.orderItems && order.orderItems.slice(0, 2).map(item => `
                                    <div class="order-item-preview">
                                        <img src="${item.image || 'image curology.jpeg'}" alt="${item.name}">
                                        <span>${item.name} × ${item.quantity || 1}</span>
                                `).join('') || ''}
                                ${order.orderItems && order.orderItems.length > 2 ? 
                                    `<div class="more-items">+${order.orderItems.length - 2} more items</div>` : ''}
                            </div>
                            <div class="order-footer">
                                <div class="order-total">Total: £${totalPrice.toFixed(2)}</div>
                                <button class="view-order-btn" data-order-id="${order._id || order.orderId}">
                                    View Details
                                </button>
                            </div>
                        </div>
                    `;
                });
                orderHistory.innerHTML = ordersHTML;
            }

            const backBtn = document.getElementById('backToProfileBtn');
            if (backBtn) {
                const newBackBtn = backBtn.cloneNode(true);
                backBtn.parentNode.replaceChild(newBackBtn, backBtn);
                newBackBtn.addEventListener('click', () => {
                    this.showUserProfile();
                });
            }

            const closeModal = document.getElementById('closeModal');
            if (closeModal) {
                const newCloseBtn = closeModal.cloneNode(true);
                closeModal.parentNode.replaceChild(newCloseBtn, closeModal);
                newCloseBtn.addEventListener('click', () => {
                    if (profileModal) {
                        profileModal.style.display = 'none';
                    }
                });
            }

        } catch (error) {
            console.error('Error loading orders:', error);
            const orderHistory = document.querySelector('.order-history');
            orderHistory.innerHTML = `
                <div class="error-loading">
                    <i class="fas fa-exclamation-triangle"></i>
                    <p>Failed to load orders. Please try again.</p>
                    <button class="btn" onclick="location.reload()">Retry</button>
                </div>
            `;
        }
    }

    async showUserReviews() {
    const modalContent = document.querySelector('.modal-content');
    if (!modalContent) return;

    try {
        modalContent.innerHTML = `
            <div class="modal-header">
                <h2>My Reviews</h2>
                <button class="close-modal" id="closeModal">&times;</button>
            </div>
            <div class="user-reviews" style="padding: 20px;">
                <div class="loading-reviews">Loading your reviews...</div>
            </div>
        `;

        // Instead of trying to get reviews from API, use localStorage
        const userEmail = authService.getCurrentUser()?.email;
        
        if (!userEmail) {
            throw new Error('User not logged in');
        }
        
        // Get reviews from localStorage (use reviews keyed by user email)
        const reviewsKey = `roibeauty_reviews_${userEmail}`;
        let reviews = [];
        
        try {
            const storedReviews = localStorage.getItem(reviewsKey);
            if (storedReviews) {
                reviews = JSON.parse(storedReviews);
            }
        } catch (e) {
            console.error('Error loading reviews from localStorage:', e);
        }
        
        const reviewsContainer = document.querySelector('.user-reviews');
        
        if (!reviews || reviews.length === 0) {
            reviewsContainer.innerHTML = `
                <div class="no-reviews" style="text-align: center; padding: 40px;">
                    <i class="fas fa-star" style="font-size: 48px; color: #ccc; margin-bottom: 20px;"></i>
                    <h3 style="margin-bottom: 10px;">No Reviews Yet</h3>
                    <p>You haven't reviewed any products yet.</p>
                    <button class="btn" onclick="profileModal.style.display='none'; showCatalogPage();" 
                            style="margin-top: 20px; padding: 10px 20px; background: #4a7c59; color: white; border: none; border-radius: 5px; cursor: pointer;">
                        Browse Products
                    </button>
                </div>
            `;
        } else {
            let reviewsHTML = '';
            reviews.forEach((review, index) => {
                reviewsHTML += `
                    <div class="review-card" style="
                        background: white;
                        border-radius: 10px;
                        padding: 20px;
                        margin-bottom: 15px;
                        box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                    ">
                        <div class="review-product" style="display: flex; align-items: center; margin-bottom: 15px;">
                            <img src="${review.productImage || 'image curology.jpeg'}" 
                                 alt="${review.productName}" 
                                 style="width: 60px; height: 60px; object-fit: cover; border-radius: 8px; margin-right: 15px;">
                            <h4 style="margin: 0; font-size: 16px;">${review.productName}</h4>
                        </div>
                        <div class="review-rating" style="margin-bottom: 10px; color: #ffc107;">
                            ${'★'.repeat(review.rating)}${'☆'.repeat(5 - review.rating)}
                            <span style="color: #666; margin-left: 10px; font-size: 14px;">${review.rating}.0/5.0</span>
                        </div>
                        <p class="review-comment" style="color: #555; line-height: 1.5; margin-bottom: 10px;">
                            ${review.comment || 'No comment provided'}
                        </p>
                        <div class="review-date" style="color: #999; font-size: 12px;">
                            ${review.date || new Date().toLocaleDateString()}
                        </div>
                    </div>
                `;
            });
            reviewsContainer.innerHTML = reviewsHTML;
        }

        const closeModal = document.getElementById('closeModal');
        if (closeModal) {
            closeModal.addEventListener('click', () => {
                if (profileModal) {
                    profileModal.style.display = 'none';
                }
            });
        }

    } catch (error) {
        console.error('Error loading reviews:', error);
        const reviewsContainer = document.querySelector('.user-reviews');
        reviewsContainer.innerHTML = `
            <div class="error-loading" style="text-align: center; padding: 40px;">
                <i class="fas fa-exclamation-triangle" style="font-size: 48px; color: #e74c3c; margin-bottom: 20px;"></i>
                <p style="margin-bottom: 20px;">Failed to load reviews. Please try again.</p>
                <button class="btn" onclick="location.reload()" 
                        style="padding: 10px 20px; background: #4a7c59; color: white; border: none; border-radius: 5px; cursor: pointer;">
                    Retry
                </button>
            </div>
        `;
    }
}
}

const authService = new AuthService();

// ==================== EMAIL NOTIFICATIONS ====================
class EmailNotifications {
    constructor() {
        this.notification = document.createElement('div');
        this.notification.className = 'email-notification';
        document.body.appendChild(this.notification);
    }

    showOrderConfirmation(orderId) {
        this.notification.innerHTML = `
            <i class="fas fa-envelope"></i>
            <p>Order confirmation sent to your email!</p>
        `;
        this.notification.style.display = 'flex';
        setTimeout(() => this.hide(), 5000);
    }

    showNewsletterConfirmation() {
        this.notification.innerHTML = `
            <i class="fas fa-check-circle"></i>
            <p>Successfully subscribed to newsletter!</p>
        `;
        this.notification.style.display = 'flex';
        setTimeout(() => this.hide(), 5000);
    }

    hide() {
        this.notification.style.display = 'none';
    }
}

const emailNotifications = new EmailNotifications();

// ==================== ORDER DETAILS VIEW FUNCTIONALITY ====================
function setupOrderDetailsView() {
    document.addEventListener('click', function(e) {
        if (e.target.closest('.view-order-btn')) {
            const orderId = e.target.closest('.view-order-btn').getAttribute('data-order-id');
            if (orderId) {
                showOrderDetails(orderId);
            }
        }
    });
}

async function showOrderDetails(orderId) {
    try {
        simpleNotification.show('Loading order details...', 'info');
        
        const response = await fetch(`${API_BASE_URL}/orders/${orderId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('authToken')}`
            }
        });
        
        const data = await response.json();
        
        if (data.success) {
            const order = data.data || data.order;
            showOrderDetailsModal(order);
        } else {
            throw new Error(data.message || 'Failed to load order details');
        }
    } catch (error) {
        console.error('Error loading order details:', error);
        simpleNotification.show(error.message, 'error');
    }
}

function showOrderDetailsModal(order) {
    // Remove any existing modal
    const existingModal = document.getElementById('orderDetailsModal');
    if (existingModal) {
        existingModal.remove();
    }
    
    const modal = document.createElement('div');
    modal.id = 'orderDetailsModal';
    modal.className = 'modal';
    modal.style.cssText = `
        display: flex !important;
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.8);
        z-index: 10000;
        justify-content: center;
        align-items: center;
        padding: 20px;
        box-sizing: border-box;
    `;
    
    const orderDate = order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'N/A';
    const orderNumber = order.orderNumber || order._id?.substring(-8) || 'N/A';
    const orderStatus = order.status || 'pending';
    const totalPrice = order.totalPrice || order.totalAmount || 0;
    
    // FIXED: Properly handle order items
    let orderItemsHTML = '<p>No items found</p>';
    
    if (order.orderItems && Array.isArray(order.orderItems) && order.orderItems.length > 0) {
        orderItemsHTML = order.orderItems.map(item => {
            const itemPrice = item.price || 0;
            const itemQuantity = item.quantity || 1;
            const itemTotal = itemPrice * itemQuantity;
            const itemImage = item.image || 'image curology.jpeg';
            const itemName = item.name || 'Unnamed Item';
            
            return `
                <div style="display: flex; align-items: center; padding: 10px 0; border-bottom: 1px solid #eee;">
                    <img src="${itemImage}" alt="${itemName}" 
                         style="width: 60px; height: 60px; object-fit: cover; border-radius: 8px; margin-right: 15px;">
                    <div style="flex: 1;">
                        <h4 style="margin: 0 0 5px; font-size: 14px;">${itemName}</h4>
                        <p style="margin: 0; color: #666; font-size: 12px;">Qty: ${itemQuantity}</p>
                    </div>
                    <div style="font-weight: 600;">£${itemTotal.toFixed(2)}</div>
                </div>
            `;
        }).join('');
    } else if (order.items && Array.isArray(order.items)) {
        // Try alternative property name
        orderItemsHTML = order.items.map(item => {
            const itemPrice = item.price || 0;
            const itemQuantity = item.quantity || 1;
            const itemTotal = itemPrice * itemQuantity;
            const itemImage = item.image || 'image curology.jpeg';
            const itemName = item.name || 'Unnamed Item';
            
            return `
                <div style="display: flex; align-items: center; padding: 10px 0; border-bottom: 1px solid #eee;">
                    <img src="${itemImage}" alt="${itemName}" 
                         style="width: 60px; height: 60px; object-fit: cover; border-radius: 8px; margin-right: 15px;">
                    <div style="flex: 1;">
                        <h4 style="margin: 0 0 5px; font-size: 14px;">${itemName}</h4>
                        <p style="margin: 0; color: #666; font-size: 12px;">Qty: ${itemQuantity}</p>
                    </div>
                    <div style="font-weight: 600;">£${itemTotal.toFixed(2)}</div>
                </div>
            `;
        }).join('');
    }
    
    modal.innerHTML = `
        <div class="modal-content" style="
            background: white;
            padding: 30px;
            border-radius: 12px;
            max-width: 600px;
            width: 90%;
            max-height: 80vh;
            overflow-y: auto;
            position: relative;
        ">
            <button class="close-modal" style="
                position: absolute;
                top: 15px;
                right: 15px;
                background: none;
                border: none;
                font-size: 24px;
                cursor: pointer;
                color: #666;
                z-index: 10;
            ">&times;</button>
            
            <h2 style="margin-bottom: 20px; color: #333;">Order Details</h2>
            
            <div style="margin-bottom: 20px;">
                <p><strong>Order ID:</strong> #${orderNumber}</p>
                <p><strong>Order Date:</strong> ${orderDate}</p>
                <p><strong>Status:</strong> <span class="order-status ${orderStatus}" style="
                    padding: 4px 8px;
                    border-radius: 12px;
                    font-size: 0.8rem;
                    font-weight: 500;
                    text-transform: capitalize;
                    ${orderStatus === 'delivered' ? 'background: #d4edda; color: #155724;' : 
                      orderStatus === 'pending' ? 'background: #fff3cd; color: #856404;' : 
                      orderStatus === 'shipped' ? 'background: #d1ecf1; color: #0c5460;' : 
                      'background: #f8d7da; color: #721c24;'}
                ">${orderStatus}</span></p>
            </div>
            
            ${order.shippingAddress ? `
            <div style="margin-bottom: 20px; padding: 15px; background: #f8f9fa; border-radius: 8px;">
                <h3 style="margin-bottom: 10px; font-size: 16px;">Shipping Address</h3>
                <p>${order.shippingAddress.fullName || ''}</p>
                <p>${order.shippingAddress.address || ''}</p>
                <p>${order.shippingAddress.city || ''}, ${order.shippingAddress.postalCode || ''}</p>
                <p>${order.shippingAddress.country || ''}</p>
            </div>
            ` : ''}
            
            <div style="margin-bottom: 20px;">
                <h3 style="margin-bottom: 10px; font-size: 16px;">Order Items</h3>
                ${orderItemsHTML}
            </div>
            
            <div style="border-top: 2px solid #eee; padding-top: 15px;">
                <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                    <span>Subtotal:</span>
                    <span>£${totalPrice.toFixed(2)}</span>
                </div>
                
                <div style="display: flex; justify-content: space-between; font-weight: 600; font-size: 18px;">
                    <span>Total:</span>
                    <span>£${totalPrice.toFixed(2)}</span>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    document.body.style.overflow = 'hidden';
    
    // Add event listeners
    const closeBtn = modal.querySelector('.close-modal');
    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            modal.style.display = 'none';
            setTimeout(() => {
                modal.remove();
                document.body.style.overflow = '';
            }, 300);
        });
    }
    
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.style.display = 'none';
            setTimeout(() => {
                modal.remove();
                document.body.style.overflow = '';
            }, 300);
        }
    });
    
    // Escape key to close
    document.addEventListener('keydown', function handleEscape(e) {
        if (e.key === 'Escape') {
            modal.style.display = 'none';
            setTimeout(() => {
                modal.remove();
                document.body.style.overflow = '';
            }, 300);
            document.removeEventListener('keydown', handleEscape);
        }
    });
}

// ==================== SIMPLIFIED STRIPE PAYMENT ====================
class StripePayment {
    constructor() {
        this.stripe = null;
        this.elements = null;
        this.cardElement = null;
        this.isProcessing = false;
        
        this.loadStripeScript();
    }
    
    loadStripeScript() {
        return new Promise((resolve, reject) => {
            if (typeof Stripe !== 'undefined') {
                this.setupStripe();
                this.setupPaymentButton(); // ADD THIS LINE
                resolve();
                return;
            }
            
            const script = document.createElement('script');
            script.src = 'https://js.stripe.com/v3/';
            script.async = true;
            
            script.onload = () => {
                console.log('✅ Stripe.js loaded');
                this.setupStripe();
                this.setupPaymentButton(); // ADD THIS LINE
                resolve();
            };
            
            script.onerror = () => {
                console.error('❌ Failed to load Stripe.js');
                simpleNotification.show('Payment system loaded. You can still browse products.', 'warning');
                resolve();
            };
            
            document.head.appendChild(script);
        });
    }
    
    // ADD THIS NEW METHOD
    setupPaymentButton() {
        const checkoutBtn = document.getElementById('stripeCheckoutBtn');
        if (checkoutBtn) {
            // Remove any existing event listeners
            const newCheckoutBtn = checkoutBtn.cloneNode(true);
            checkoutBtn.parentNode.replaceChild(newCheckoutBtn, checkoutBtn);
            
            // Add fresh event listener
            newCheckoutBtn.addEventListener('click', (e) => this.handlePaymentWithCard(e));
            
            console.log('✅ Payment button event listener attached');
        } else {
            console.log('⚠️ Payment button not found yet, will retry');
            setTimeout(() => this.setupPaymentButton(), 500);
        }
    }
    
    async setupStripe() {
        try {
            // Use test key
            this.stripe = Stripe('pk_test_51SiykdIEN5UrlK0Wbi6IWNbT96QoqyzBN4rMelu6fygRsxuQiOoZHvk39tCPyB3gVMtSKIoh3gSkRfbJ9O9T5Jn400IbZT5CFF');
            
            console.log('✅ Stripe initialized');
            
            // Setup card element
            this.setupCardElement();
            
        } catch (error) {
            console.error('❌ Stripe setup error:', error);
            simpleNotification.show('Payment system initialization failed. Please refresh.', 'error');
        }
    }
    
    setupCardElement() {
        const container = document.getElementById('stripe-card-element');
        if (!container) {
            console.error('❌ Card element container not found!');
            // Try again after a delay
            setTimeout(() => this.setupCardElement(), 500);
            return;
        }
        
        container.style.display = 'block';
        
        setTimeout(() => {
            try {
                this.elements = this.stripe.elements();
                
                const style = {
                    base: {
                        color: '#32325d',
                        fontFamily: '"Poppins", "Helvetica Neue", Helvetica, sans-serif',
                        fontSize: '16px',
                        '::placeholder': { color: '#aab7c4' }
                    },
                    invalid: { color: '#e74c3c', iconColor: '#e74c3c' }
                };
                
                this.cardElement = this.elements.create('card', { 
                    style,
                    hidePostalCode: true
                });
                
                this.cardElement.mount('#stripe-card-element');
                
                this.cardElement.on('change', (event) => {
                    const errors = document.getElementById('stripe-card-errors');
                    if (errors) {
                        if (event.error) {
                            errors.textContent = event.error.message;
                            errors.style.display = 'block';
                        } else {
                            errors.style.display = 'none';
                        }
                    }
                });
                
                console.log('✅ Card element mounted successfully');
                
            } catch (error) {
                console.error('❌ Card element setup error:', error);
                simpleNotification.show('Payment form failed to load. Please refresh.', 'error');
            }
        }, 100);
    }
    
    async handlePaymentWithCard(event) {
        event.preventDefault();
        console.log('🔄 Payment button clicked');
        
        if (this.isProcessing) {
            console.log('⚠️ Payment already processing');
            return;
        }
        
        const checkoutBtn = document.getElementById('stripeCheckoutBtn');
        
        try {
            this.isProcessing = true;
            if (checkoutBtn) {
                checkoutBtn.innerHTML = '<div class="loading-spinner"></div> Processing...';
                checkoutBtn.disabled = true;
            }
            
            if (!this.validateForm()) {
                throw new Error('Please fill in all required fields');
            }
            
            const formData = this.getFormData();
            const cart = cartManager.getCart();
            const totalAmount = cartManager.getSubtotal();
            
            if (cart.length === 0) {
                throw new Error('Your cart is empty');
            }
            
            // Show demo mode for testing
            if (isLocalFile || isLocalhost) {
                console.log('💳 Running in demo mode - simulating payment');
                
                // Simulate payment
                setTimeout(() => {
                    this.showSuccess();
                    
                    if (checkoutBtn) {
                        checkoutBtn.innerHTML = '<i class="fas fa-lock"></i> Pay Now';
                        checkoutBtn.disabled = false;
                    }
                }, 1500);
                
                return;
            }
            
            // Real payment
            const response = await fetch(`${API_BASE_URL}/payment/create-payment-intent`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    amount: totalAmount,
                    cart: cart,
                    email: formData.email,
                    userId: authService.isLoggedIn() ? authService.getCurrentUser()._id : 'guest',
                    shippingAddress: {
                        fullName: formData.fullName,
                        address: formData.address,
                        city: formData.city,
                        postalCode: formData.zipCode,
                        country: formData.country
                    }
                })
            });
            
            const data = await response.json();
            
            if (!data.success) {
                throw new Error(data.message || 'Payment setup failed');
            }
            
            const result = await this.stripe.confirmCardPayment(data.clientSecret, {
                payment_method: {
                    card: this.cardElement,
                    billing_details: {
                        name: formData.fullName,
                        email: formData.email
                    }
                }
            });
            
            if (result.error) {
                throw new Error(result.error.message);
            }
            
            // Show success
            this.showSuccess();
            
        } catch (error) {
            console.error('Payment error:', error);
            this.showError(error.message);
        } finally {
            this.isProcessing = false;
            if (checkoutBtn) {
                checkoutBtn.innerHTML = '<i class="fas fa-lock"></i> Pay Now';
                checkoutBtn.disabled = false;
            }
        }
    }
    
    getFormData() {
        return {
            fullName: document.getElementById('fullName').value,
            email: document.getElementById('email').value,
            address: document.getElementById('address').value,
            city: document.getElementById('city').value,
            zipCode: document.getElementById('zipCode').value,
            country: document.getElementById('country').value
        };
    }
    
    showSuccess() {
        simpleNotification.show('Payment successful! Order created.', 'success');
        showSuccessMessage();
        cartManager.clearCart();
        updateCart();
        this.resetForm();
    }
    
    showError(message) {
        simpleNotification.show('Payment failed: ' + message, 'error');
        
        const errors = document.getElementById('stripe-payment-errors') || 
                      document.getElementById('stripe-card-errors');
        if (errors) {
            errors.textContent = message;
            errors.style.display = 'block';
        }
    }
    
    validateForm() {
        const requiredFields = ['fullName', 'email', 'address', 'city', 'zipCode'];
        let isValid = true;
        
        requiredFields.forEach(fieldId => {
            const field = document.getElementById(fieldId);
            if (field && !field.value.trim()) {
                isValid = false;
                field.style.borderColor = '#e74c3c';
            } else if (field) {
                field.style.borderColor = '#ddd';
            }
        });
        
        const country = document.getElementById('country');
        if (country && !country.value) {
            isValid = false;
            country.style.borderColor = '#e74c3c';
        } else if (country) {
            country.style.borderColor = '#ddd';
        }
        
        if (!isValid) {
            simpleNotification.show('Please fill in all required fields', 'error');
        }
        
        return isValid;
    }
    
    resetForm() {
        document.getElementById('fullName').value = '';
        document.getElementById('email').value = '';
        document.getElementById('address').value = '';
        document.getElementById('city').value = '';
        document.getElementById('zipCode').value = '';
        document.getElementById('country').value = '';
        
        if (this.cardElement) {
            this.cardElement.clear();
        }
        
        const errors = document.getElementById('stripe-card-errors');
        if (errors) {
            errors.style.display = 'none';
        }
    }
}

let stripePayment = null;

// Initialize Stripe payment when payment page is shown
document.addEventListener('DOMContentLoaded', function() {
    if (window.location.hash === '#payment' || window.location.pathname.includes('payment')) {
        setTimeout(() => {
            initializeStripePayment();
        }, 500);
    }
});

function initializeStripePayment() {
    console.log('💳 Initializing Stripe payment...');
    
    // Clean up existing instance
    if (stripePayment) {
        // Remove old event listeners
        const oldBtn = document.getElementById('stripeCheckoutBtn');
        if (oldBtn) {
            const newBtn = oldBtn.cloneNode(true);
            oldBtn.parentNode.replaceChild(newBtn, oldBtn);
        }
    }
    
    stripePayment = new StripePayment();
    
    // Set up payment button immediately
    setTimeout(() => {
        if (stripePayment && stripePayment.setupPaymentButton) {
            stripePayment.setupPaymentButton();
        }
    }, 100);
}

// ==================== CART FUNCTIONALITY ====================
const cartCount = document.querySelector('.cart-count');
const cartItems = document.getElementById('cartItems');
const emptyCartMessage = document.getElementById('emptyCartMessage');
const cartSubtotal = document.getElementById('cartSubtotal');
const cartTotal = document.getElementById('cartTotal');
const checkoutBtn = document.getElementById('checkoutBtn');

function addToCart(id, name, price, image, stockQuantity = 999) {
    try {
        cartManager.addItem(id, name, price, image, stockQuantity);
        updateCart();
        
        // Show notification
        simpleNotification.show(`Added ${name} to cart!`, 'success');
        
    } catch (error) {
        simpleNotification.show(error.message, 'error');
    }
}

function removeFromCart(id) {
    cartManager.removeItem(id);
    updateCart();
}

function updateQuantity(id, newQuantity) {
    try {
        cartManager.updateQuantity(id, newQuantity);
        updateCart();
    } catch (error) {
        simpleNotification.show(error.message, 'error');
        updateCart();
    }
}

function clearCart() {
    cartManager.clearCart();
    updateCart();
}

function updateCart() {
    const cart = cartManager.getCart();
    const totalItems = cartManager.getTotalItems();
    const subtotal = cartManager.getSubtotal();
    
    if (cartCount) cartCount.textContent = totalItems;
    
    if (cartItems) {
        if (cart.length === 0) {
            emptyCartMessage.style.display = 'block';
            cartItems.innerHTML = '';
            cartItems.appendChild(emptyCartMessage);
        } else {
            emptyCartMessage.style.display = 'none';
            
            let cartHTML = '';
            
            cart.forEach(item => {
                const itemTotal = item.price * item.quantity;
                
                cartHTML += `
                    <div class="cart-item">
                        <div class="cart-item-image">
                            <img src="${item.image}" alt="${item.name}" loading="lazy">
                        </div>
                        <div class="cart-item-details">
                            <h3>${item.name}</h3>
                            <p class="cart-item-price">£${item.price.toFixed(2)}</p>
                            <div class="cart-item-controls">
                                <div class="quantity-control">
                                    <button class="quantity-btn minus" data-id="${item.id}">-</button>
                                    <input type="number" class="quantity-input" value="${item.quantity}" min="1" max="${item.stockQuantity}" data-id="${item.id}">
                                    <button class="quantity-btn plus" data-id="${item.id}">+</button>
                                </div>
                                <button class="remove-item" data-id="${item.id}">Remove</button>
                            </div>
                        </div>
                    </div>
                `;
            });
            
            cartItems.innerHTML = cartHTML;
            attachCartEventListeners();
        }
    }
    
    const total = subtotal;
    
    if (cartSubtotal) cartSubtotal.textContent = `£${subtotal.toFixed(2)}`;
    if (cartTotal) cartTotal.textContent = `£${total.toFixed(2)}`;
    
    updateOrderSummary(subtotal, total);
}

function attachCartEventListeners() {
    document.querySelectorAll('.quantity-btn.minus').forEach(btn => {
        btn.addEventListener('click', function() {
            const id = this.getAttribute('data-id');
            const item = cartManager.getCart().find(item => item.id == id);
            if (item) updateQuantity(id, item.quantity - 1);
        });
    });
    
    document.querySelectorAll('.quantity-btn.plus').forEach(btn => {
        btn.addEventListener('click', function() {
            const id = this.getAttribute('data-id');
            const item = cartManager.getCart().find(item => item.id == id);
            if (item) updateQuantity(id, item.quantity + 1);
        });
    });
    
    document.querySelectorAll('.quantity-input').forEach(input => {
        input.addEventListener('change', function() {
            const id = this.getAttribute('data-id');
            const newQuantity = parseInt(this.value);
            if (newQuantity >= 1) updateQuantity(id, newQuantity);
            else this.value = 1;
        });
    });
    
    document.querySelectorAll('.remove-item').forEach(btn => {
        btn.addEventListener('click', function() {
            const id = this.getAttribute('data-id');
            removeFromCart(id);
        });
    });
}

// ==================== PAGE ELEMENTS ====================
const mainContent = document.getElementById('mainContent');
const catalogPage = document.getElementById('catalogPage');
const cartPage = document.getElementById('cartPage');
const paymentPage = document.getElementById('paymentPage');
const successMessage = document.getElementById('successMessage');
const productDetailPage = document.getElementById('productDetailPage');
const termsPage = document.getElementById('termsPage');
const cartLink = document.querySelector('.cart-link');
const homeLinks = document.querySelectorAll('.home-link');
const catalogLinks = document.querySelectorAll('.catalog-link');
const catalogGrid = document.getElementById('catalogGrid');
const pagination = document.getElementById('pagination');
const featuredCollections = document.querySelector('.collections');

// ==================== FILTER ELEMENTS ====================
const categoryFilter = document.getElementById('categoryFilter');
const skinTypeFilter = document.getElementById('skinTypeFilter');
const priceFilter = document.getElementById('priceFilter');
const productSearch = document.getElementById('productSearch');

// ==================== PAGINATION ====================
let currentPage = 1;
const productsPerPage = 8;

// ==================== HELPER FUNCTIONS ====================
function getCurrentFilters() {
    return {
        category: categoryFilter ? categoryFilter.value : 'all',
        skinType: skinTypeFilter ? skinTypeFilter.value : 'all',
        priceRange: priceFilter ? priceFilter.value : 'all',
        search: productSearch ? productSearch.value : ''
    };
}

// ==================== FIXED: attachProductEventListeners FUNCTION ====================
function attachProductEventListeners() {
    console.log('🔄 Attaching product event listeners...');
    
    setTimeout(() => {
        const productCards = document.querySelectorAll('.product-card');
        console.log(`🔍 Found ${productCards.length} product cards`);
        
        if (productCards.length === 0) {
            console.warn('⚠️ No product cards found. Retrying in 500ms...');
            setTimeout(attachProductEventListeners, 500);
            return;
        }
        
        // Better event delegation that doesn't interfere with button clicks
        document.body.addEventListener('click', function handleProductCardClick(e) {
            const card = e.target.closest('.product-card');
            
            if (!card) return;
            
            // Check if click is on an "Add to Cart" button - DON'T prevent it!
            if (e.target.closest('.add-to-cart') || 
                e.target.closest('.cta-button') || 
                e.target.classList.contains('add-to-cart') ||
                e.target.classList.contains('cta-button')) {
                return; // Let the button handle its own click
            }
            
            // Check if click is on wishlist button
            if (e.target.closest('.wishlist') || e.target.classList.contains('wishlist')) {
                // Handle wishlist click
                const wishlistBtn = e.target.closest('.wishlist');
                const icon = wishlistBtn.querySelector('i');
                if (icon) {
                    if (icon.classList.contains('far')) {
                        icon.classList.remove('far');
                        icon.classList.add('fas');
                        icon.style.color = '#e74c3c';
                        simpleNotification.show('Added to wishlist!', 'success');
                    } else {
                        icon.classList.remove('fas');
                        icon.classList.add('far');
                        icon.style.color = '#4b5563';
                        simpleNotification.show('Removed from wishlist', 'info');
                    }
                }
                return;
            }
            
            // If not clicking on any button, open product detail
            const productId = card.getAttribute('data-product-id');
            
            // Try to get product object from data attribute
            const productObject = card.getAttribute('data-product-object');
            if (productObject) {
                try {
                    const product = JSON.parse(productObject);
                    console.log('✅ Found product from data attribute:', product.name);
                    showEnhancedProductDetail(product);
                    return;
                } catch (e) {
                    console.log('❌ Could not parse product object');
                }
            }
            
            // Fallback: find product by ID in local products
            if (productId) {
                // First check local products array
                const product = products.find(p => 
                    p.id == productId || 
                    p._id == productId || 
                    p.productId == productId
                );
                
                if (product) {
                    console.log('✅ Found product in local array:', product.name);
                    showEnhancedProductDetail(product);
                    return;
                }
            }
            
            // Last resort: create product from card data
            const productName = card.querySelector('h3')?.textContent;
            const productPriceText = card.querySelector('.price')?.textContent;
            
            if (productName) {
                console.log('🔄 Creating product from card data');
                const fallbackProduct = {
                    _id: productId || `temp-${Date.now()}`,
                    id: productId,
                    name: productName,
                    price: parseFloat(productPriceText?.replace(/[^0-9.]/g, '') || 0),
                    description: card.querySelector('p')?.textContent || 'No description',
                    image: card.querySelector('img')?.src || 'image curology.jpeg',
                    category: '',
                    skinType: [],
                    stockQuantity: 10
                };
                
                showEnhancedProductDetail(fallbackProduct);
            }
        });
        
        console.log('✅ Product event listeners attached');
        
    }, 300);
}

// ==================== FIXED: ADD TO CART BUTTON LISTENERS ====================
function attachAddToCartListeners() {
    console.log('🛒 Setting up Add to Cart listeners...');
    
    // Use event delegation for Add to Cart buttons
    document.body.addEventListener('click', function(e) {
        const addToCartBtn = e.target.closest('.add-to-cart');
        
        if (!addToCartBtn) return;
        
        // Prevent default if it's a button
        e.preventDefault();
        
        // Check if button is disabled (out of stock)
        if (addToCartBtn.disabled) {
            simpleNotification.show('This product is out of stock', 'error');
            return;
        }
        
        // Get product data from button attributes
        const id = addToCartBtn.getAttribute('data-id');
        const name = addToCartBtn.getAttribute('data-name');
        const price = parseFloat(addToCartBtn.getAttribute('data-price'));
        const image = addToCartBtn.getAttribute('data-image');
        const stock = parseInt(addToCartBtn.getAttribute('data-stock')) || 999;
        
        console.log(`🛒 Adding to cart: ${name}, ID: ${id}, Price: ${price}`);
        
        if (!id || !name || isNaN(price)) {
            console.error('❌ Missing product data for Add to Cart');
            return;
        }
        
        // Add to cart
        addToCart(id, name, price, image, stock);
        
        // Show notification
        cartNotification.show({
            name: name,
            price: price,
            image: image
        });
        
        // Visual feedback on button
        const originalText = addToCartBtn.innerHTML;
        addToCartBtn.innerHTML = '<i class="fas fa-check"></i> Added!';
        addToCartBtn.style.backgroundColor = '#3a6548';
        
        setTimeout(() => {
            addToCartBtn.innerHTML = originalText;
            addToCartBtn.style.backgroundColor = '';
        }, 2000);
    });
}

function initializeProductCards() {
    console.log('🚀 Initializing product cards...');
    
    // Call this after products are loaded/displayed
    setTimeout(() => {
        attachProductEventListeners();
        attachAddToCartListeners();
        
        // Force a re-check every second for 5 seconds
        let retryCount = 0;
        const maxRetries = 5;
        
        const retryInterval = setInterval(() => {
            const cards = document.querySelectorAll('.product-card');
            console.log(`🔄 Retry ${retryCount + 1}/${maxRetries}: Found ${cards.length} cards`);
            
            if (cards.length > 0 || retryCount >= maxRetries - 1) {
                clearInterval(retryInterval);
                if (cards.length > 0) {
                    console.log('🎉 Successfully found product cards!');
                } else {
                    console.error('💥 Failed to find product cards after retries');
                }
            }
            retryCount++;
        }, 1000);
        
    }, 500);
}

function filterLocalProducts(products) {
    const category = categoryFilter ? categoryFilter.value : 'all';
    const skinType = skinTypeFilter ? skinTypeFilter.value : 'all';
    const priceRange = priceFilter ? priceFilter.value : 'all';
    const searchTerm = productSearch ? productSearch.value.toLowerCase() : '';
    
    return products.filter(product => {
        if (category !== 'all' && product.category !== category) return false;
        if (skinType !== 'all' && !product.skinType.includes(skinType)) return false;
        if (priceRange !== 'all') {
            if (priceRange === 'under20' && product.price >= 20) return false;
            if (priceRange === '20to40' && (product.price < 20 || product.price > 40)) return false;
            if (priceRange === 'over40' && product.price <= 40) return false;
        }
        if (searchTerm && !product.name.toLowerCase().includes(searchTerm) && 
            !product.description.toLowerCase().includes(searchTerm)) return false;
        return true;
    });
}

function displayFallbackProducts(filteredProducts, page) {
    currentPage = page;
    const startIndex = (page - 1) * productsPerPage;
    const endIndex = startIndex + productsPerPage;
    const paginatedProducts = filteredProducts.slice(startIndex, endIndex);
    
    if (catalogGrid) {
        catalogGrid.innerHTML = '';
        
        if (paginatedProducts.length === 0) {
            catalogGrid.innerHTML = '<p class="no-products">No products found matching your criteria.</p>';
            if (pagination) pagination.innerHTML = '';
            return;
        }
        
        paginatedProducts.forEach(product => {
            const productCard = document.createElement('div');
            productCard.className = 'product-card';
            
            const saleClass = product.originalPrice ? 'sale' : '';
            const badgeHTML = product.badge ? `<div class="product-badge">${product.badge}</div>` : '';
            const originalPriceHTML = product.originalPrice ? `<span class="original-price">£${product.originalPrice.toFixed(2)}</span>` : '';
            const stockStatus = product.stockQuantity === 0 ? 
                '<div class="out-of-stock-badge">Out of Stock</div>' : 
                (product.stockQuantity < 5 ? `<div class="low-stock-badge">Low Stock</div>` : '');
            
            productCard.innerHTML = `
                <div class="product-image">
                    <img src="${product.image}" alt="${product.name}" loading="lazy">
                    ${badgeHTML}
                    ${stockStatus}
                </div>
                <div class="product-info">
                    <h3>${product.name}</h3>
                    <p>${product.description}</p>
                    <p class="price ${saleClass}">£${product.price.toFixed(2)} ${originalPriceHTML}</p>
                    ${product.stockQuantity ? `<p class="stock-info">${product.stockQuantity} in stock</p>` : ''}
                    <div class="product-actions">
                        <button class="cta-button small add-to-cart" 
                            data-id="${product.id}" 
                            data-name="${product.name}" 
                            data-price="${product.price}" 
                            data-image="${product.image}"
                            data-stock="${product.stockQuantity}"
                            ${product.stockQuantity === 0 ? 'disabled' : ''}>
                            ${product.stockQuantity === 0 ? 'Out of Stock' : 'Add to Cart'}
                        </button>
                        <button class="wishlist"><i class="far fa-heart"></i></button>
                    </div>
                </div>
            `;

            // Add data-product-id attribute
            productCard.setAttribute('data-product-id', product.id);
            
            catalogGrid.appendChild(productCard);
        });
        
        attachProductEventListeners();
        updatePagination(filteredProducts.length, page);
    }
}

// ==================== FIXED FEATURED PRODUCTS FUNCTION ====================
async function displayFeaturedProducts() {
    console.log('⭐ Loading featured products...');
    
    try {
        const featuredProducts = await dataSync.syncFeaturedProducts();
        displayFeaturedProductsDirectly(featuredProducts);
    } catch (error) {
        console.error('❌ Error loading featured products:', error);
        // Use local products as fallback
        displayFeaturedProductsDirectly(products.slice(0, 4));
    }
}

function displayFeaturedProductsDirectly(featuredProducts) {
    const featuredContainer = document.querySelector('.collections');
    if (!featuredContainer) {
        console.log('❌ Featured container not found');
        return;
    }
    
    // Clear and create grid
    featuredContainer.innerHTML = '<h2 class="section-title">Featured Collections</h2>';
    
    if (!featuredProducts || featuredProducts.length === 0) {
        featuredContainer.innerHTML += `
            <div style="text-align: center; padding: 40px;">
                <p>No featured products available.</p>
                <a href="#" class="btn catalog-link">Browse All Products</a>
            </div>
        `;
        return;
    }
    
    const featuredGrid = document.createElement('div');
    featuredGrid.className = 'product-grid';
    featuredGrid.style.cssText = `
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
        gap: 30px;
        margin: 30px 0;
    `;
    
    // Add each product
    featuredProducts.forEach(product => {
        const productCard = document.createElement('div');
        productCard.className = 'product-card';
        productCard.style.cssText = `
            background: white;
            border-radius: 10px;
            overflow: hidden;
            box-shadow: 0 5px 15px rgba(0,0,0,0.1);
            transition: transform 0.3s;
            cursor: pointer;
        `;
        
        // Handle missing properties safely
        const productImage = product.image || 'image curology.jpeg';
        const productName = product.name || 'Product';
        const productDescription = product.description || 'No description available';
        const productPrice = product.price || 0;
        const productId = product.id || product._id || Date.now();
        const badge = product.badge || '';
        const stockQuantity = product.stockQuantity || product.stock || 10;
        const isOutOfStock = product.inStock === false || stockQuantity === 0;
        const originalPrice = product.originalPrice || 0;
        const saleClass = originalPrice ? 'sale' : '';
        const originalPriceHTML = originalPrice ? `<span class="original-price">£${originalPrice.toFixed(2)}</span>` : '';
        
        const badgeHTML = badge ? `<div class="product-badge">${badge}</div>` : '';
        const stockStatus = isOutOfStock ? 
            '<div class="out-of-stock-badge">Out of Stock</div>' : 
            (stockQuantity < 5 ? `<div class="low-stock-badge">Low Stock</div>` : '');
        
        productCard.innerHTML = `
            <div class="product-image">
                <img src="${productImage}" alt="${productName}" loading="lazy">
                ${badgeHTML}
                ${stockStatus}
            </div>
            <div class="product-info">
                <h3>${productName}</h3>
                <p>${productDescription}</p>
                <p class="price ${saleClass}">£${productPrice.toFixed(2)} ${originalPriceHTML}</p>
                ${stockQuantity ? `<p class="stock-info">${stockQuantity} in stock</p>` : ''}
                <div class="product-actions">
                    <button class="cta-button small add-to-cart" 
                        data-id="${productId}" 
                        data-name="${productName}" 
                        data-price="${productPrice}" 
                        data-image="${productImage}"
                        data-stock="${stockQuantity}"
                        ${isOutOfStock ? 'disabled' : ''}>
                        ${isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
                    </button>
                    <button class="wishlist"><i class="far fa-heart"></i></button>
                </div>
            </div>
        `;

        // Add data-product-id attribute
        productCard.setAttribute('data-product-id', productId);
        
        featuredGrid.appendChild(productCard);
    });
    
    featuredContainer.appendChild(featuredGrid);
    
    // Re-attach event listeners
    setTimeout(() => {
        attachProductEventListeners();
    }, 100);
}

// ==================== CORE FUNCTIONS ====================
function initCatalog() {
    displayProducts();
    setupFilters();
}

// ==================== ENHANCED PRODUCT DISPLAY ====================
async function displayProducts(productsToDisplay = null, page = 1) {
    try {
        let productsData;
        
        if (productsToDisplay) {
            productsData = productsToDisplay;
        } else {
            productsData = await dataSync.syncProducts(getCurrentFilters());
        }
        
        currentPage = page;
        const startIndex = (page - 1) * productsPerPage;
        const endIndex = startIndex + productsPerPage;
        const paginatedProducts = productsData.slice(startIndex, endIndex);
        
        if (catalogGrid) {
            catalogGrid.innerHTML = '';
            
            if (paginatedProducts.length === 0) {
                catalogGrid.innerHTML = '<p class="no-products">No products found matching your criteria.</p>';
                if (pagination) pagination.innerHTML = '';
                return;
            }
            
            paginatedProducts.forEach(product => {
                const productCard = document.createElement('div');
                productCard.className = 'product-card';
                
                // ALWAYS use productId or id (numeric)
                const productIdentifier = product.productId || product.id;
                
                const saleClass = product.originalPrice ? 'sale' : '';
                const badgeHTML = product.badge ? `<div class="product-badge">${product.badge}</div>` : '';
                const originalPriceHTML = product.originalPrice ? `<span class="original-price">£${product.originalPrice.toFixed(2)}</span>` : '';
                const stockStatus = product.stockQuantity === 0 ? 
                    '<div class="out-of-stock-badge">Out of Stock</div>' : 
                    (product.stockQuantity < 5 ? `<div class="low-stock-badge">Low Stock</div>` : '');
                
                productCard.innerHTML = `
                    <div class="product-image">
                        <img src="${product.image}" alt="${product.name}" loading="lazy">
                        ${badgeHTML}
                        ${stockStatus}
                    </div>
                    <div class="product-info">
                        <h3>${product.name}</h3>
                        <p>${product.description}</p>
                        <p class="price ${saleClass}">£${product.price.toFixed(2)} ${originalPriceHTML}</p>
                        ${product.stockQuantity ? `<p class="stock-info">${product.stockQuantity} in stock</p>` : ''}
                        <div class="product-actions">
                            <button class="cta-button small add-to-cart" 
                                data-id="${productIdentifier}"
                                data-name="${product.name}" 
                                data-price="${product.price}" 
                                data-image="${product.image}"
                                data-stock="${product.stockQuantity}"
                                ${product.stockQuantity === 0 ? 'disabled' : ''}>
                                ${product.stockQuantity === 0 ? 'Out of Stock' : 'Add to Cart'}
                            </button>
                            <button class="wishlist"><i class="far fa-heart"></i></button>
                        </div>
                    </div>
                `;

                // Add data-product-id attribute - ALWAYS use numeric ID
                productCard.setAttribute('data-product-id', productIdentifier);
                // Also store the product object for quick access
                productCard.setAttribute('data-product-object', JSON.stringify(product));
                
                catalogGrid.appendChild(productCard);
            });

            // Re-attach event listeners
            attachProductEventListeners();
            updatePagination(productsData.length, page);
        }
        
    } catch (error) {
        console.error('Error displaying products:', error);
        // Use local fallback with proper numeric IDs
        const filteredProducts = filterLocalProducts(products);
        displayFallbackProducts(filteredProducts, page);
    }
}

function updatePagination(totalProducts, currentPage) {
    const totalPages = Math.ceil(totalProducts / productsPerPage);
    
    if (pagination) {
        if (totalPages <= 1) {
            pagination.innerHTML = '';
            return;
        }
        
        let paginationHTML = '';
        
        if (currentPage > 1) {
            paginationHTML += `<button class="pagination-btn" data-page="${currentPage - 1}">Previous</button>`;
        }
        
        for (let i = 1; i <= totalPages; i++) {
            if (i === currentPage) {
                paginationHTML += `<button class="pagination-btn active" data-page="${i}">${i}</button>`;
            } else {
                paginationHTML += `<button class="pagination-btn" data-page="${i}">${i}</button>`;
            }
        }
        
        if (currentPage < totalPages) {
            paginationHTML += `<button class="pagination-btn" data-page="${currentPage + 1}">Next</button>`;
        }
        
        pagination.innerHTML = paginationHTML;
        
        document.querySelectorAll('.pagination-btn').forEach(button => {
    button.addEventListener('click', async function() {
        const page = parseInt(this.getAttribute('data-page'));
        const filters = getCurrentFilters();
        const filteredProducts = await dataSync.syncProducts(filters);
        displayProducts(filteredProducts, page);
    });
});
    }
}

function setupFilters() {
    if (categoryFilter) categoryFilter.addEventListener('change', applyFilters);
    if (skinTypeFilter) skinTypeFilter.addEventListener('change', applyFilters);
    if (priceFilter) priceFilter.addEventListener('change', applyFilters);
    if (productSearch) productSearch.addEventListener('input', applyFilters);
}

async function applyFilters() {
    showLoading();
    try {
        const filters = getCurrentFilters();
        const filteredProducts = await dataSync.syncProducts(filters);
        displayProducts(filteredProducts, 1);
    } catch (error) {
        console.error('Error applying filters:', error);
        const filteredProducts = filterLocalProducts(products);
        displayProducts(filteredProducts, 1);
    } finally {
        hideLoading();
    }
}

function filterProducts() {
    const category = categoryFilter ? categoryFilter.value : 'all';
    const skinType = skinTypeFilter ? skinTypeFilter.value : 'all';
    const priceRange = priceFilter ? priceFilter.value : 'all';
    const searchTerm = productSearch ? productSearch.value.toLowerCase() : '';
    
    return products.filter(product => {
        if (category !== 'all' && product.category !== category) return false;
        if (skinType !== 'all' && !product.skinType.includes(skinType)) return false;
        if (priceRange !== 'all') {
            if (priceRange === 'under20' && product.price >= 20) return false;
            if (priceRange === '20to40' && (product.price < 20 || product.price > 40)) return false;
            if (priceRange === 'over40' && product.price <= 40) return false;
        }
        if (searchTerm && !product.name.toLowerCase().includes(searchTerm) && 
            !product.description.toLowerCase().includes(searchTerm)) return false;
        return true;
    });
}

function updateOrderSummary(subtotal, total) {
    const orderSubtotal = document.getElementById('orderSubtotal');
    const orderTotal = document.getElementById('orderTotal');
    const orderItems = document.getElementById('orderItems');
    
    if (orderSubtotal) orderSubtotal.textContent = `£${subtotal.toFixed(2)}`;
    if (orderTotal) orderTotal.textContent = `£${total.toFixed(2)}`;
    
    if (orderItems) {
        let orderItemsHTML = '';
        const cart = cartManager.getCart();
        cart.forEach(item => {
            const itemTotal = item.price * item.quantity;
            orderItemsHTML += `
                <div class="order-summary-item">
                    <div>
                        <h4>${item.name}</h4>
                        <p>Qty: ${item.quantity}</p>
                    </div>
                    <span>£${itemTotal.toFixed(2)}</span>
                </div>
            `;
        });
        orderItems.innerHTML = orderItemsHTML;
    }
}

// ==================== NAVIGATION ====================
function setupNavigation() {
    if (cartLink) {
        cartLink.addEventListener('click', function(e) {
            e.preventDefault();
            showCartPage();
        });
    }

    homeLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            showMainPage();
        });
    });

    catalogLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const linkText = link.textContent.trim();
            
            if (linkText.includes('Explore Collections') || linkText.includes('Explore Collection')) {
                if (pageStateManager.getCurrentPage() === 'home') {
                    document.querySelector('.collections').scrollIntoView({ behavior: 'smooth' });
                } else {
                    showMainPage();
                    setTimeout(() => {
                        document.querySelector('.collections').scrollIntoView({ behavior: 'smooth' });
                    }, 500);
                }
            } else {
                showCatalogPage();
            }
        });
    });

    document.querySelectorAll('a[href="#contact"]').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            scrollToContact();
        });
    });

    document.querySelectorAll('a[href="#about"]').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            scrollToAbout();
        });
    });

    document.querySelectorAll('a[href="#"]').forEach(link => {
        if (link.textContent.includes('Shipping Policy')) {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                showTermsPage('shipping');
            });
        }
        if (link.textContent.includes('Returns & Exchanges')) {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                showTermsPage('returns');
            });
        }
    });

    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');
    
    if (hamburger && navLinks) {
        hamburger.addEventListener('click', () => {
            navLinks.classList.toggle('active');
        });

        document.querySelectorAll('.nav-links a').forEach(link => {
            link.addEventListener('click', () => {
                navLinks.classList.remove('active');
            });
        });

        document.addEventListener('click', (e) => {
            if (!e.target.closest('.nav-links') && !e.target.closest('.hamburger')) {
                navLinks.classList.remove('active');
            }
        });
    }
}

function scrollToContact() {
    if (pageStateManager.getCurrentPage() === 'home') {
        const contactSection = document.querySelector('.contact-section, [id="contact"]');
        if (contactSection) {
            contactSection.scrollIntoView({ behavior: 'smooth' });
        }
    } else {
        showMainPage();
    }
}

function scrollToAbout() {
    if (pageStateManager.getCurrentPage() === 'home') {
        const aboutSection = document.querySelector('.about-section, [id="about"]');
        if (aboutSection) {
            aboutSection.scrollIntoView({ behavior: 'smooth' });
        }
    } else {
        showMainPage();
    }
}

// ==================== PAGE MANAGEMENT ====================
function showMainPage() {
    if (mainContent) mainContent.style.display = 'block';
    if (catalogPage) catalogPage.style.display = 'none';
    if (cartPage) cartPage.style.display = 'none';
    if (paymentPage) paymentPage.style.display = 'none';
    if (successMessage) successMessage.style.display = 'none';
    if (productDetailPage) productDetailPage.style.display = 'none';
    if (termsPage) termsPage.style.display = 'none';
    pageStateManager.setCurrentPage('home');
    
    setTimeout(setupContactForm, 100);
    window.history.pushState({ page: 'home' }, '', '/');
}

function showCatalogPage() {
    if (mainContent) mainContent.style.display = 'none';
    if (catalogPage) catalogPage.style.display = 'block';
    if (cartPage) cartPage.style.display = 'none';
    if (paymentPage) paymentPage.style.display = 'none';
    if (successMessage) successMessage.style.display = 'none';
    if (productDetailPage) productDetailPage.style.display = 'none';
    if (termsPage) termsPage.style.display = 'none';
    pageStateManager.setCurrentPage('catalog');
    initCatalog();
    window.history.pushState({ page: 'catalog' }, '', '/products');
}

function showCartPage() {
    if (mainContent) mainContent.style.display = 'none';
    if (catalogPage) catalogPage.style.display = 'none';
    if (cartPage) cartPage.style.display = 'block';
    if (paymentPage) paymentPage.style.display = 'none';
    if (successMessage) successMessage.style.display = 'none';
    if (productDetailPage) productDetailPage.style.display = 'none';
    if (termsPage) termsPage.style.display = 'none';
    pageStateManager.setCurrentPage('cart');
}

// ==================== MODIFIED: Allow guest checkout ====================
function showPaymentPage() {
    console.log('💳 Showing payment page');
    
    // Reset Stripe
    if (stripePayment) {
        stripePayment = null;
    }
    
    if (mainContent) mainContent.style.display = 'none';
    if (catalogPage) catalogPage.style.display = 'none';
    if (cartPage) cartPage.style.display = 'none';
    if (paymentPage) paymentPage.style.display = 'block';
    if (successMessage) successMessage.style.display = 'none';
    if (productDetailPage) productDetailPage.style.display = 'none';
    if (termsPage) termsPage.style.display = 'none';
    
    pageStateManager.setCurrentPage('payment');
    
    updateOrderSummary(cartManager.getSubtotal(), cartManager.getSubtotal());
    
    // Initialize Stripe after DOM is ready
    setTimeout(() => {
        initializeStripePayment();
        
        // Also ensure checkout button has event listener
        const checkoutBtn = document.getElementById('stripeCheckoutBtn');
        if (checkoutBtn) {
            // Remove and re-add event listener
            const newBtn = checkoutBtn.cloneNode(true);
            checkoutBtn.parentNode.replaceChild(newBtn, checkoutBtn);
            
            // Wait a bit more for Stripe to fully initialize
            setTimeout(() => {
                if (stripePayment && stripePayment.setupPaymentButton) {
                    stripePayment.setupPaymentButton();
                }
            }, 500);
        }
    }, 300);
}

function showSuccessMessage() {
    if (mainContent) mainContent.style.display = 'none';
    if (catalogPage) catalogPage.style.display = 'none';
    if (cartPage) cartPage.style.display = 'none';
    if (paymentPage) paymentPage.style.display = 'none';
    if (successMessage) successMessage.style.display = 'block';
    if (productDetailPage) productDetailPage.style.display = 'none';
    if (termsPage) termsPage.style.display = 'none';
    pageStateManager.setCurrentPage('success');
    
    const orderId = 'RB-' + new Date().getFullYear() + '-' + Math.random().toString(36).substr(2, 8).toUpperCase();
    
    const orderIdElement = document.getElementById('dynamicOrderId');
    if (orderIdElement) {
        orderIdElement.textContent = orderId;
    }
    // Refresh order count in profile if user is logged in
    if (authService.isLoggedIn()) {
        setTimeout(() => {
            authService.loadOrderCount();
        }, 1000);
    }
}

// ==================== TERMS PAGE FUNCTION ====================
function showTermsPage(type = 'shipping') {
    if (mainContent) mainContent.style.display = 'none';
    if (catalogPage) catalogPage.style.display = 'none';
    if (cartPage) cartPage.style.display = 'none';
    if (paymentPage) paymentPage.style.display = 'none';
    if (successMessage) successMessage.style.display = 'none';
    if (productDetailPage) productDetailPage.style.display = 'none';
    if (termsPage) termsPage.style.display = 'block';
    
    pageStateManager.setCurrentPage('terms');
    
    const termsContent = document.getElementById('termsContent');
    if (termsContent) {
        if (type === 'shipping') {
            termsContent.innerHTML = `
                <h2>Shipping Policy</h2>
                <div class="terms-content">
                    <h3>Delivery Times</h3>
                    <p>We aim to process and ship all orders within 1-2 business days. Standard shipping typically takes 3-5 business days.</p>
                    
                    <h3>Shipping Rates</h3>
                    <ul>
                        <li>Standard Shipping: £4.99 (Free on orders over £50)</li>
                        <li>Express Shipping: £9.99 (2-3 business days)</li>
                        <li>Next Day Delivery: £14.99 (Order before 2pm)</li>
                    </ul>
                    
                    <h3>International Shipping</h3>
                    <p>We currently ship to most European countries. International shipping rates and delivery times vary by location.</p>
                    
                    <h3>Order Tracking</h3>
                    <p>You will receive a tracking number via email once your order has been shipped.</p>
                </div>
            `;
        } else if (type === 'returns') {
            termsContent.innerHTML = `
                <h2>Returns & Exchanges</h2>
                <div class="terms-content">
                    <h3>Return Policy</h3>
                    <p>We offer a 30-day return policy from the date of delivery. Items must be unused, unopened, and in their original packaging.</p>
                    
                    <h3>How to Return</h3>
                    <ol>
                        <li>Contact our customer service team at support@roibeauty.com</li>
                        <li>We'll provide you with a return authorization and shipping label</li>
                        <li>Package your items securely and attach the return label</li>
                        <li>Drop off at your nearest post office</li>
                    </ol>
                    
                    <h3>Refund Processing</h3>
                    <p>Refunds will be processed within 5-7 business days after we receive your return. The original shipping cost is non-refundable.</p>
                    
                    <h3>Exchanges</h3>
                    <p>We're happy to exchange items for a different product or size. Please contact us within 14 days of delivery.</p>
                    
                    <h3>Damaged or Defective Items</h3>
                    <p>If you receive a damaged or defective product, please contact us immediately at support@roibeauty.com with photos of the issue.</p>
                </div>
            `;
        }
        
        const backButton = document.createElement('button');
        backButton.className = 'btn back-btn';
        backButton.innerHTML = '<i class="fas fa-arrow-left"></i> Back to Previous Page';
        backButton.style.marginTop = '20px';
        backButton.addEventListener('click', () => {
            const previousPage = pageStateManager.getCurrentPage();
            if (previousPage === 'catalog') {
                showCatalogPage();
            } else if (previousPage === 'cart') {
                showCartPage();
            } else {
                showMainPage();
            }
        });
        
        termsContent.appendChild(backButton);
    }
}

// ==================== EVENT LISTENERS ====================
const profileBtn = document.getElementById('profileBtn');
const profileModal = document.getElementById('profileModal');

if (profileBtn && profileModal) {
    profileBtn.addEventListener('click', (e) => {
        e.preventDefault();
        profileModal.style.display = 'flex';
        if (authService.isLoggedIn()) {
            authService.showUserProfile();
        } else {
            authService.showAuthForms();
        }
    });
}

// ==================== MODIFIED: Allow guest checkout ====================
if (checkoutBtn) {
    checkoutBtn.addEventListener('click', function() {
        // Allow guest checkout - no login required
        showPaymentPage();
    });
}

function setupContactForm() {
    const contactForm = document.querySelector('.contact-form form');
    if (contactForm) {
        console.log('✅ Contact form found, setting up event listener');
        
        // Make sure form is visible
        contactForm.style.display = 'block';
        
        // Remove any existing form and replace with fresh one
        const parent = contactForm.parentElement;
        const newForm = contactForm.cloneNode(true);
        parent.replaceChild(newForm, contactForm);
        
        // Get fresh reference
        const freshContactForm = document.querySelector('.contact-form form');
        
        freshContactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            console.log('📧 Contact form submitted');
            authService.handleContactForm();
        });
        
        // Make sure all inputs are visible
        const inputs = freshContactForm.querySelectorAll('input, textarea, button');
        inputs.forEach(input => {
            input.style.display = 'block';
            input.style.width = '100%';
            input.style.marginBottom = '15px';
        });
        
    } else {
        console.log('❌ Contact form not found on this page');
        // Try to create it if it doesn't exist
        createContactFormIfMissing();
    }
}

// Add this function to create contact form if missing:
function createContactFormIfMissing() {
    const contactSection = document.querySelector('.contact-section, #contact');
    if (!contactSection) return;
    
    // Check if form already exists
    if (contactSection.querySelector('.contact-form')) return;
    
    const contactFormHTML = `
        <div class="contact-form">
            <h2>Get in Touch</h2>
            <p>Have questions? Send us a message!</p>
            <form>
                <div class="form-group">
                    <input type="text" id="contactName" placeholder="Your Name" required>
                </div>
                <div class="form-group">
                    <input type="email" id="contactEmail" placeholder="Your Email" required>
                </div>
                <div class="form-group">
                    <textarea id="contactMessage" placeholder="Your Message" rows="5" required></textarea>
                </div>
                <button type="submit" id="contactBtn" class="btn">Send Message</button>
            </form>
        </div>
    `;
    
    contactSection.innerHTML += contactFormHTML;
    
    // Set up the new form
    setTimeout(() => {
        setupContactForm();
    }, 100);
}

// ==================== NEWSLETTER SUBSCRIPTION ====================
function setupNewsletterSubscription() {
    const subscribeBtn = document.getElementById('subscribeBtn');
    if (subscribeBtn) {
        subscribeBtn.addEventListener('click', async () => {
            const emailInput = document.getElementById('newsletterEmail');
            const email = emailInput.value;
            
            if (!email || !validateEmail(email)) {
                simpleNotification.show('Please enter a valid email address', 'error');
                return;
            }
            
            try {
                const response = await fetch(`${API_BASE_URL}/newsletter/subscribe`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email })
                });
                
                const data = await response.json();
                
                if (data.success) {
                    emailNotifications.showNewsletterConfirmation();
                    emailInput.value = '';
                } else {
                    throw new Error(data.message || 'Subscription failed');
                }
            } catch (error) {
                simpleNotification.show(error.message, 'error');
            }
        });
    }
}

function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

// ==================== BANK TRANSFER PAYMENT ====================
function setupBankTransferPayment() {
    const bankTransferOption = document.querySelector('input[name="paymentMethod"][value="bank"]');
    const bankDetails = document.querySelector('.bank-transfer-details');
    
    if (bankTransferOption && bankDetails) {
        bankTransferOption.addEventListener('change', function() {
            if (this.checked) {
                bankDetails.classList.add('active');
            } else {
                bankDetails.classList.remove('active');
            }
        });
    }
}

// ==================== UTILITY FUNCTIONS ====================
function showNotification(message, type = 'info') {
    simpleNotification.show(message, type);
}

function showLoading() {
    document.body.style.cursor = 'wait';
}

function hideLoading() {
    document.body.style.cursor = 'default';
}

function initApp() {
    console.log('🚀 Initializing RoiBeautyEssence...');
    
    authService.updateUI();
    setupNavigation();
    setupOrderDetailsView();
    reviewSystem.init();
    
    updateCart();
    
    // **ADD THESE TWO LINES:**
    attachAddToCartListeners(); // Call this to set up Add to Cart button listeners
    
    // Load featured products
    if (document.querySelector('.collections')) {
        displayFeaturedProducts();
    }
    
    // Load bundles
    if (document.getElementById('bundlesGrid')) {
        loadProductBundles();
    }
    
    // Setup newsletter
    setupNewsletterSubscription();
    
    // Setup bank transfer
    setupBankTransferPayment();
    
    // Optimize images
    optimizeImages();
    
    const savedPage = pageStateManager.getCurrentPage();
    if (savedPage === 'catalog') {
        showCatalogPage();
    } else if (savedPage === 'cart') {
        showCartPage();
    } else if (savedPage === 'payment') {
        showPaymentPage();
    } else {
        showMainPage();
    }
    
    console.log('✅ RoiBeautyEssence initialized successfully');
    console.log('📊 Cart items loaded:', cartManager.getCart().length);
}

// ==================== EMERGENCY FALLBACK ====================
function ensureProductsAlwaysAvailable() {
    const hasCachedProducts = localStorage.getItem('roibeauty_cachedProducts');
    const hasFallbackProducts = products && products.length > 0;
    
    if (!hasCachedProducts && hasFallbackProducts) {
        console.log('⚠️ No cached products found, caching fallback products');
        localStorage.setItem('roibeauty_cachedProducts', JSON.stringify(products));
    }
}

// ==================== IMAGE OPTIMIZATION ====================
function optimizeImages() {
    document.querySelectorAll('img').forEach(img => {
        // Lazy loading
        img.loading = 'lazy';
        
        // Add error handling
        img.onerror = function() {
            this.src = 'image curology.jpeg';
        };
    });
}

// ==================== DOM CONTENT LOADED ====================
document.addEventListener('DOMContentLoaded', function() {
    optimizeImages();
    ensureProductsAlwaysAvailable();
    initApp();
});

// Handle browser back/forward buttons
window.addEventListener('popstate', function(event) {
    const state = event.state;
    if (!state || !state.page) {
        showMainPage();
        return;
    }
    
    switch(state.page) {
        case 'catalog':
            showCatalogPage();
            break;
        case 'cart':
            showCartPage();
            break;
        case 'payment':
            showPaymentPage();
            break;
        default:
            showMainPage();
    }
});

// Add this function to convert all € to £ on page load
function convertCurrencyToPounds() {
    // Function to recursively replace text in nodes
    function replaceTextInNode(node) {
        if (node.nodeType === Node.TEXT_NODE) {
            // Replace € with £ in text nodes
            node.textContent = node.textContent.replace(/€/g, '£');
        } else if (node.nodeType === Node.ELEMENT_NODE) {
            // Process child nodes
            node.childNodes.forEach(child => replaceTextInNode(child));
        }
    }
    
    // Start from body and replace all occurrences
    replaceTextInNode(document.body);
}

// Call it when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    convertCurrencyToPounds();
});

// ==================== CONTACT SECTION FIX ====================
(function() {
    'use strict';
    
    // Function to control contact visibility
    function manageContactVisibility() {
        const contact = document.querySelector('.contact');
        if (!contact) return;
        
        // Check current page
        const mainContent = document.getElementById('mainContent');
        const isHomePage = mainContent && 
                          mainContent.style.display !== 'none' && 
                          !mainContent.querySelector('.catalog-grid');
        
        // Hide on other pages
        if (!isHomePage) {
            contact.style.display = 'none';
        } else {
            contact.style.display = 'grid';
        }
    }
    
    // Run on load and after navigation
    document.addEventListener('DOMContentLoaded', manageContactVisibility);
    window.addEventListener('hashchange', manageContactVisibility);
    
    // Run periodically to catch dynamic changes
    setInterval(manageContactVisibility, 1000);
})();

// ==================== SOCIAL MEDIA REVIEWS FUNCTIONS ====================
// ADD THIS CODE AT THE VERY BOTTOM OF YOUR FILE

function displaySocialReviews(productId, reviews) {
    const reviewsFeed = document.getElementById(`reviewsFeed_${productId}`);
    if (!reviewsFeed) return;
    
    if (!reviews || reviews.length === 0) {
        reviewsFeed.innerHTML = `
            <div class="no-reviews-yet" style="text-align: center; padding: 40px 20px;">
                <div style="font-size: 48px; color: #e0e0e0; margin-bottom: 15px;">
                    <i class="far fa-comment-dots"></i>
                </div>
                <h4 style="margin-bottom: 10px; color: #666;">No reviews yet</h4>
                <p style="color: #999; margin-bottom: 20px;">Be the first to share your thoughts!</p>
            </div>
        `;
        return;
    }
    
    // Sort by newest first
    reviews.sort((a, b) => b.timestamp - a.timestamp);
    
    let reviewsHTML = '';
    
    reviews.forEach(review => {
        // Format date
        const reviewDate = review.date || new Date(review.timestamp).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
        
        // Create star rating
        const stars = '★'.repeat(review.rating) + '☆'.repeat(5 - review.rating);
        
        // User avatar (using first letter of name)
        const userInitial = review.userName ? review.userName.charAt(0).toUpperCase() : 'U';
        
        reviewsHTML += `
            <div class="review-comment" style="
                background: white;
                border-radius: 12px;
                padding: 20px;
                margin-bottom: 15px;
                border: 1px solid #f0f0f0;
                transition: transform 0.2s;
            " onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 5px 15px rgba(0,0,0,0.05)';" 
                onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='none';">
                
                <div style="display: flex; align-items: flex-start; gap: 15px;">
                    <!-- User Avatar -->
                    <div style="
                        width: 45px;
                        height: 45px;
                        border-radius: 50%;
                        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        color: white;
                        font-weight: bold;
                        font-size: 18px;
                        flex-shrink: 0;
                    ">
                        ${userInitial}
                    </div>
                    
                    <!-- Review Content -->
                    <div style="flex: 1;">
                        <!-- Review Header -->
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                            <div>
                                <h4 style="margin: 0; font-size: 16px; color: #333;">
                                    ${review.userName || 'Anonymous User'}
                                </h4>
                                <div style="display: flex; align-items: center; gap: 10px; margin-top: 4px;">
                                    <div style="color: #ffc107; font-size: 14px;">
                                        ${stars}
                                        <span style="color: #666; margin-left: 5px; font-size: 12px;">${review.rating}.0</span>
                                    </div>
                                    <span style="color: #999; font-size: 12px;">
                                        <i class="far fa-clock" style="margin-right: 3px;"></i>
                                        ${reviewDate}
                                    </span>
                                </div>
                            </div>
                            
                            ${review.verified ? `
                                <span style="
                                    background: #4a7c59;
                                    color: white;
                                    padding: 2px 8px;
                                    border-radius: 10px;
                                    font-size: 11px;
                                    font-weight: 500;
                                    display: flex;
                                    align-items: center;
                                    gap: 3px;
                                ">
                                    <i class="fas fa-check-circle"></i> Verified Purchase
                                </span>
                            ` : ''}
                        </div>
                        
                        <!-- Review Title -->
                        ${review.title ? `
                            <h5 style="margin: 10px 0 8px 0; color: #333; font-size: 15px;">
                                ${review.title}
                            </h5>
                        ` : ''}
                        
                        <!-- Review Text -->
                        <p style="
                            margin: 0 0 15px 0;
                            color: #555;
                            line-height: 1.6;
                            font-size: 14px;
                        ">
                            ${review.comment || review.text || 'No comment provided'}
                        </p>
                        
                        <!-- Review Actions (Like, Reply) -->
                        <div style="display: flex; align-items: center; gap: 20px; padding-top: 10px; border-top: 1px solid #f5f5f5;">
                            <button class="review-like-btn" data-review-id="${review.id}" style="
                                background: none;
                                border: none;
                                color: #666;
                                font-size: 13px;
                                cursor: pointer;
                                display: flex;
                                align-items: center;
                                gap: 5px;
                                padding: 5px 10px;
                                border-radius: 15px;
                                transition: all 0.2s;
                            " onmouseover="this.style.backgroundColor='#f5f5f5'; this.style.color='#e74c3c';" 
                                onmouseout="this.style.backgroundColor='transparent'; this.style.color='#666';">
                                <i class="far fa-heart"></i>
                                <span>Helpful</span>
                                ${review.likes ? `<span style="margin-left: 3px;">(${review.likes})</span>` : ''}
                            </button>
                            
                            <button class="review-reply-btn" data-review-id="${review.id}" style="
                                background: none;
                                border: none;
                                color: #666;
                                font-size: 13px;
                                cursor: pointer;
                                display: flex;
                                align-items: center;
                                gap: 5px;
                                padding: 5px 10px;
                                border-radius: 15px;
                                transition: all 0.2s;
                            " onmouseover="this.style.backgroundColor='#f5f5f5'; this.style.color='#4a7c59';" 
                                onmouseout="this.style.backgroundColor='transparent'; this.style.color='#666';">
                                <i class="far fa-comment"></i>
                                <span>Reply</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    });
    
    reviewsFeed.innerHTML = reviewsHTML;
}

// Handle review likes
async function handleReviewLike(reviewId, productId) {
    const user = authService.getCurrentUser();
    if (!user) {
        simpleNotification.show('Please login to like reviews', 'error');
        return;
    }
    
    const allReviewsKey = 'roibeauty_all_reviews';
    let allReviews = [];
    
    try {
        const storedAll = localStorage.getItem(allReviewsKey);
        if (storedAll) {
            allReviews = JSON.parse(storedAll);
        }
    } catch (e) {
        console.log('No reviews found');
    }
    
    // Find and update review
    const reviewIndex = allReviews.findIndex(r => r.id === reviewId);
    if (reviewIndex !== -1) {
        const review = allReviews[reviewIndex];
        
        // Check if user already liked
        const userAlreadyLiked = review.likedBy && review.likedBy.includes(user.email);
        
        if (userAlreadyLiked) {
            // Unlike
            review.likes = (review.likes || 1) - 1;
            review.likedBy = review.likedBy.filter(email => email !== user.email);
            simpleNotification.show('Review unliked', 'info');
        } else {
            // Like
            review.likes = (review.likes || 0) + 1;
            review.likedBy = review.likedBy || [];
            review.likedBy.push(user.email);
            simpleNotification.show('Review liked!', 'success');
        }
        
        // Save back to localStorage
        localStorage.setItem(allReviewsKey, JSON.stringify(allReviews));
        
        // Refresh reviews display
        const reviews = await reviewSystem.loadProductReviews(productId);
        displaySocialReviews(productId, reviews);
    }
}

// Show reply form
function showReplyForm(reviewId, productId) {
    if (!authService.isLoggedIn()) {
        simpleNotification.show('Please login to reply', 'error');
        return;
    }
    
    // Remove any existing reply form
    document.querySelectorAll('.reply-form').forEach(form => form.remove());
    
    const reviewElement = document.querySelector(`.review-like-btn[data-review-id="${reviewId}"]`)
        ?.closest('.review-comment');
    
    if (reviewElement) {
        const replyFormHTML = `
            <div class="reply-form" style="margin-top: 15px; padding: 15px; background: #f8f9fa; border-radius: 10px;">
                <div style="display: flex; gap: 10px; align-items: flex-start;">
                    <div style="
                        width: 35px;
                        height: 35px;
                        border-radius: 50%;
                        background: #4a7c59;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        color: white;
                        font-weight: bold;
                        font-size: 14px;
                        flex-shrink: 0;
                    ">
                        ${authService.getCurrentUser().name.charAt(0).toUpperCase()}
                    </div>
                    <div style="flex: 1;">
                        <textarea id="replyText_${reviewId}" 
                            placeholder="Write a reply..." 
                            rows="2"
                            style="
                                width: 100%;
                                padding: 10px;
                                border: 1px solid #ddd;
                                border-radius: 8px;
                                font-family: 'Poppins', sans-serif;
                                resize: vertical;
                                font-size: 14px;
                                margin-bottom: 10px;
                            "></textarea>
                        <div style="display: flex; gap: 10px; justify-content: flex-end;">
                            <button onclick="cancelReply('${reviewId}')" style="
                                padding: 6px 15px;
                                background: #f5f5f5;
                                border: 1px solid #ddd;
                                border-radius: 5px;
                                font-size: 13px;
                                cursor: pointer;
                            ">
                                Cancel
                            </button>
                            <button onclick="submitReply('${reviewId}', '${productId}')" style="
                                padding: 6px 15px;
                                background: #4a7c59;
                                color: white;
                                border: none;
                                border-radius: 5px;
                                font-size: 13px;
                                cursor: pointer;
                            ">
                                Post Reply
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        reviewElement.insertAdjacentHTML('beforeend', replyFormHTML);
        
        // Focus the textarea
        setTimeout(() => {
            const textarea = document.getElementById(`replyText_${reviewId}`);
            if (textarea) textarea.focus();
        }, 100);
    }
}

// Submit reply
async function submitReply(reviewId, productId) {
    const replyText = document.getElementById(`replyText_${reviewId}`)?.value;
    
    if (!replyText || replyText.trim() === '') {
        simpleNotification.show('Please enter a reply', 'error');
        return;
    }
    
    const user = authService.getCurrentUser();
    const allReviewsKey = 'roibeauty_all_reviews';
    let allReviews = [];
    
    try {
        const storedAll = localStorage.getItem(allReviewsKey);
        if (storedAll) {
            allReviews = JSON.parse(storedAll);
        }
    } catch (e) {
        console.log('No reviews found');
    }
    
    // Find and update review
    const reviewIndex = allReviews.findIndex(r => r.id === reviewId);
    if (reviewIndex !== -1) {
        const review = allReviews[reviewIndex];
        
        // Add reply
        review.replies = review.replies || [];
        review.replies.push({
            id: Date.now().toString(),
            userId: user._id || user.id,
            userName: user.name,
            userEmail: user.email,
            comment: replyText.trim(),
            date: new Date().toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric'
            }),
            timestamp: Date.now()
        });
        
        // Save back to localStorage
        localStorage.setItem(allReviewsKey, JSON.stringify(allReviews));
        
        simpleNotification.show('Reply posted!', 'success');
        
        // Remove reply form
        document.querySelectorAll('.reply-form').forEach(form => form.remove());
        
        // Refresh reviews display
        const reviews = await reviewSystem.loadProductReviews(productId);
        displaySocialReviews(productId, reviews);
    }
}

function cancelReply(reviewId) {
    document.querySelectorAll('.reply-form').forEach(form => form.remove());
}