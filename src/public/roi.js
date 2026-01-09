// ==================== ROI.JS - COMPLETE FIXED VERSION ====================
console.log('=== ROI.JS LOADED ===');

// ==================== ENVIRONMENT DETECTION ====================
const isLocalFile = window.location.protocol === 'file:';
const isLocalhost = window.location.hostname === 'localhost' || 
                    window.location.hostname === '127.0.0.1' ||
                    window.location.hostname === '';

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
        
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => {
                if (notification.parentElement) {
                    notification.parentElement.removeChild(notification);
                }
            }, 300);
        }, 3000);
        
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

// ==================== API CONFIGURATION ====================
let API_BASE_URL = 'http://localhost:3000/api';
console.log('🌐 Using API URL:', API_BASE_URL);

// ==================== PRODUCT DATA ====================
const products = [
    { id: 1, name: "Hydrating Vitamin C Serum", description: "Brightens skin tone and reduces dark spots with natural vitamin C extract", price: 29.99, image: "image curology.jpeg", category: "serums", skinType: ["dry", "combination", "sensitive"], badge: "Bestseller", stockQuantity: 10, ingredients: "Vitamin C, Hyaluronic Acid, Ferulic Acid", sizes: [{size: "30ml", price: 29.99}, {size: "50ml", price: 44.99, selected: true}] },
    { id: 2, name: "Nourishing Face Moisturizer", description: "Deeply hydrates and restores skin barrier with hyaluronic acid and ceramides", price: 24.99, image: "image curology.jpeg", category: "moisturizers", skinType: ["dry", "sensitive"], badge: "New", stockQuantity: 15, ingredients: "Ceramides, Hyaluronic Acid, Niacinamide", sizes: [{size: "50ml", price: 24.99, selected: true}, {size: "100ml", price: 39.99}] },
    { id: 3, name: "Gentle Foaming Cleanser", description: "Removes impurities without stripping natural oils, suitable for all skin types", price: 18.99, image: "image curology.jpeg", category: "cleansers", skinType: ["dry", "oily", "combination", "sensitive"], stockQuantity: 20, ingredients: "Aloe Vera, Green Tea, Chamomile", sizes: [{size: "150ml", price: 18.99, selected: true}, {size: "300ml", price: 29.99}] },
    { id: 4, name: "Revitalizing Eye Cream", description: "Reduces puffiness and dark circles with caffeine and peptide complex", price: 22.99, originalPrice: 27.99, image: "image curology.jpeg", category: "eye-care", skinType: ["dry", "combination", "sensitive"], stockQuantity: 8, ingredients: "Caffeine, Peptides, Vitamin K", sizes: [{size: "15ml", price: 22.99, selected: true}] },
    { id: 5, name: "Detoxifying Clay Mask", description: "Deep cleanses pores and absorbs excess oil with natural clay minerals", price: 19.99, image: "image curology.jpeg", category: "masks", skinType: ["oily", "combination"], stockQuantity: 12, ingredients: "Bentonite Clay, Charcoal, Tea Tree Oil", sizes: [{size: "100ml", price: 19.99, selected: true}] },
    { id: 6, name: "Hydrating Facial Mist", description: "Instantly refreshes and hydrates skin with rosewater and aloe vera", price: 16.99, image: "image curology.jpeg", category: "serums", skinType: ["dry", "sensitive"], stockQuantity: 25, ingredients: "Rosewater, Aloe Vera, Glycerin", sizes: [{size: "100ml", price: 16.99, selected: true}] },
    { id: 7, name: "Brightening Toner", description: "Balances pH and improves skin texture with natural fruit extracts", price: 21.99, image: "image curology.jpeg", category: "cleansers", skinType: ["dry", "combination", "sensitive"], stockQuantity: 18, ingredients: "Glycolic Acid, Witch Hazel, Vitamin C", sizes: [{size: "200ml", price: 21.99, selected: true}] },
    { id: 8, name: "Overnight Repair Cream", description: "Intensive nighttime treatment that repairs skin while you sleep", price: 34.99, image: "image curology.jpeg", category: "moisturizers", skinType: ["dry", "sensitive"], badge: "New", stockQuantity: 6, ingredients: "Retinol, Ceramides, Peptides", sizes: [{size: "50ml", price: 34.99, selected: true}] },
    { id: 9, name: "Exfoliating Scrub", description: "Gentle exfoliation with natural jojoba beads for smoother skin", price: 17.99, image: "image curology.jpeg", category: "cleansers", skinType: ["oily", "combination"], stockQuantity: 14, ingredients: "Jojoba Beads, Vitamin E, Green Tea", sizes: [{size: "75ml", price: 17.99, selected: true}] },
    { id: 10, name: "Anti-Aging Serum", description: "Reduces fine lines and wrinkles with retinol and peptide complex", price: 39.99, image: "image curology.jpeg", category: "serums", skinType: ["dry", "combination", "sensitive"], stockQuantity: 9, ingredients: "Retinol, Peptides, Vitamin C", sizes: [{size: "30ml", price: 39.99, selected: true}] },
    { id: 11, name: "Soothing Face Oil", description: "Nourishes and calms irritated skin with natural botanical oils", price: 26.99, image: "image curology.jpeg", category: "serums", skinType: ["dry", "sensitive"], stockQuantity: 11, ingredients: "Jojoba Oil, Rosehip Oil, Vitamin E", sizes: [{size: "30ml", price: 26.99, selected: true}] },
    { id: 12, name: "Purifying Charcoal Mask", description: "Deep cleanses and detoxifies skin with activated charcoal", price: 23.99, image: "image curology.jpeg", category: "masks", skinType: ["oily", "combination"], stockQuantity: 7, ingredients: "Activated Charcoal, Kaolin Clay, Tea Tree", sizes: [{size: "100ml", price: 23.99, selected: true}] }
];

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
        const closeBtn = this.notification.querySelector('.close-notification');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.hide());
        }

        const continueBtn = this.notification.querySelector('.continue-shopping');
        if (continueBtn) {
            continueBtn.addEventListener('click', () => {
                this.hide();
            });
        }

        const viewCartBtn = this.notification.querySelector('.view-cart');
        if (viewCartBtn) {
            viewCartBtn.addEventListener('click', () => {
                this.hide();
                showCartPage();
            });
        }

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
        
        setTimeout(() => this.hide(), 5000);
    }

    hide() {
        this.notification.style.display = 'none';
    }
}

const cartNotification = new CartNotification();

// ==================== ENHANCED REVIEW SYSTEM ====================
class ReviewSystem {
    constructor() {
        this.reviewModal = document.getElementById('reviewModal');
        this.currentProductId = null;
        this.currentReviewId = null;
        this.isEditing = false;
        this.init();
    }

    init() {
        const closeBtn = this.reviewModal.querySelector('.close-modal');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.hide());
        }

        const stars = this.reviewModal.querySelectorAll('.stars i');
        stars.forEach(star => {
            star.addEventListener('click', () => {
                const rating = parseInt(star.getAttribute('data-rating'));
                this.setRating(stars, rating);
            });
        });

        const submitBtn = document.getElementById('submitReviewBtn');
        if (submitBtn) {
            submitBtn.addEventListener('click', () => this.submitReview());
        }

        const cancelBtn = this.reviewModal.querySelector('.cancel-review');
        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => this.hide());
        }

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

    show(productId, reviewToEdit = null) {
        this.currentProductId = productId;
        this.isEditing = !!reviewToEdit;
        this.currentReviewId = reviewToEdit?._id;
        
        this.reviewModal.style.display = 'flex';
        
        // Update modal title
        const modalTitle = this.reviewModal.querySelector('.modal-title');
        if (modalTitle) {
            modalTitle.textContent = this.isEditing ? 'Edit Review' : 'Write a Review';
        }
        
        // Update submit button text
        const submitBtn = document.getElementById('submitReviewBtn');
        if (submitBtn) {
            submitBtn.textContent = this.isEditing ? 'Update Review' : 'Submit Review';
        }
        
        // Show/hide cancel button
        const cancelBtn = this.reviewModal.querySelector('.cancel-review');
        if (cancelBtn) {
            cancelBtn.style.display = this.isEditing ? 'inline-block' : 'none';
        }
        
        // Fill form if editing
        if (reviewToEdit) {
            document.getElementById('reviewTitle').value = reviewToEdit.title || '';
            document.getElementById('reviewText').value = reviewToEdit.comment || '';
            const stars = this.reviewModal.querySelectorAll('.stars i');
            this.setRating(stars, reviewToEdit.rating || 0);
        } else {
            // Reset form
            document.getElementById('reviewTitle').value = '';
            document.getElementById('reviewText').value = '';
            const stars = this.reviewModal.querySelectorAll('.stars i');
            this.setRating(stars, 0);
        }
    }

    hide() {
        this.reviewModal.style.display = 'none';
        this.currentProductId = null;
        this.currentReviewId = null;
        this.isEditing = false;
    }

    async submitReview() {
        const title = document.getElementById('reviewTitle').value;
        const text = document.getElementById('reviewText').value;
        const stars = this.reviewModal.querySelectorAll('.stars i');
        const rating = Array.from(stars).filter(star => star.classList.contains('active')).length;

        if (!authService.isLoggedIn()) {
            simpleNotification.show('Please log in to submit a review', 'error');
            return;
        }

        if (rating === 0) {
            simpleNotification.show('Please select a rating', 'error');
            return;
        }

        if (!text) {
            simpleNotification.show('Please write your review', 'error');
            return;
        }

        try {
            const url = this.isEditing 
                ? `${API_BASE_URL}/reviews/${this.currentReviewId}`
                : `${API_BASE_URL}/reviews/${this.currentProductId}`;
                
            const method = this.isEditing ? 'PUT' : 'POST';
            
            const response = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                },
                body: JSON.stringify({
                    rating,
                    title,
                    text
                })
            });

            const data = await response.json();
            
            if (data.success) {
                simpleNotification.show(
                    this.isEditing ? 'Review updated successfully!' : 'Review submitted successfully!', 
                    'success'
                );
                this.hide();
                
                // Refresh product detail if open
                const productModal = document.getElementById('productDetailModal');
                if (productModal && this.currentProductId) {
                    const product = products.find(p => p.id == this.currentProductId);
                    if (product) {
                        setTimeout(() => {
                            showEnhancedProductDetail(product);
                        }, 500);
                    }
                }
            } else {
                throw new Error(data.message || 'Failed to submit review');
            }
        } catch (error) {
            console.error('Review submission error:', error);
            simpleNotification.show(error.message, 'error');
        }
    }

    async getProductReviews(productId) {
        try {
            const response = await fetch(`${API_BASE_URL}/reviews/${productId}`);
            const data = await response.json();
            return data.reviews || [];
        } catch (error) {
            console.error('Error fetching reviews:', error);
            return [];
        }
    }

    async getUserReviews() {
        try {
            const token = localStorage.getItem('authToken');
            if (!token) return [];
            
            const response = await fetch(`${API_BASE_URL}/reviews/my-reviews`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });
            
            const data = await response.json();
            return data.reviews || [];
        } catch (error) {
            console.error('Error fetching user reviews:', error);
            return [];
        }
    }

    async deleteReview(reviewId) {
        try {
            const response = await fetch(`${API_BASE_URL}/reviews/${reviewId}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                }
            });
            
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error deleting review:', error);
            throw error;
        }
    }
}

const reviewSystem = new ReviewSystem();

// ==================== ENHANCED PRODUCT DETAIL DISPLAY ====================
async function showEnhancedProductDetail(product) {
    const existingModal = document.getElementById('productDetailModal');
    if (existingModal) {
        existingModal.remove();
    }
    
    let detailedProduct = product;
    
    // Try to fetch from backend
    try {
        console.log(`🔍 Fetching product details for ID: ${product.id}`);
        const response = await fetch(`${API_BASE_URL}/products/${product.id}`);
        
        if (response.ok) {
            const data = await response.json();
            if (data.success && data.product) {
                detailedProduct = data.product;
                console.log('✅ Loaded product details from backend');
            }
        }
    } catch (error) {
        console.log('🔄 Using local product data');
    }

    const reviews = await reviewSystem.getProductReviews(product.id);
    
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

    const productSpecs = detailedProduct.ingredients ? `
        <div class="product-specs">
            <h3><i class="fas fa-flask"></i> Key Ingredients</h3>
            <p>${detailedProduct.ingredients}</p>
        </div>
    ` : '';

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

    // Enhanced reviews section with edit/delete
    let reviewsSection = '';
    if (reviews.length > 0) {
        const userReviews = reviews.filter(review => review.user?._id === authService.getCurrentUser()?._id);
        const otherReviews = reviews.filter(review => review.user?._id !== authService.getCurrentUser()?._id);
        
        reviewsSection = `
            <div class="product-reviews" style="margin-top: 30px; padding: 20px; background: #f5f5f5; border-radius: 10px;">
                <div class="review-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                    <div class="overall-rating" style="display: flex; align-items: center; gap: 10px;">
                        <div class="average-rating" style="font-size: 2rem; font-weight: 700; color: #333;">${calculateAverageRating(reviews)}</div>
                        <div class="rating-stars" style="color: #ffc107; font-size: 1.2rem;">${generateStarRating(calculateAverageRating(reviews))}</div>
                        <span style="color: #777; font-size: 0.9rem;">(${reviews.length} reviews)</span>
                    </div>
                    <button class="write-review-btn" data-product-id="${product.id}" style="
                        background: #4a7c59;
                        color: white;
                        border: none;
                        padding: 10px 20px;
                        border-radius: 5px;
                        cursor: pointer;
                        font-weight: 500;
                    ">
                        Write a Review
                    </button>
                </div>
                
                ${userReviews.length > 0 ? `
                    <div class="user-reviews" style="margin-bottom: 20px;">
                        <h4 style="margin-bottom: 15px; color: #333;">Your Review</h4>
                        ${userReviews.map(review => `
                            <div class="review-item user-review" style="background: white; padding: 15px; border-radius: 8px; margin-bottom: 15px; position: relative;">
                                <div class="review-actions" style="position: absolute; top: 10px; right: 10px; display: flex; gap: 10px;">
                                    <button class="edit-review-btn" data-review-id="${review._id}" style="
                                        background: none;
                                        border: none;
                                        color: #4a7c59;
                                        cursor: pointer;
                                        font-size: 0.8rem;
                                    ">
                                        <i class="fas fa-edit"></i> Edit
                                    </button>
                                    <button class="delete-review-btn" data-review-id="${review._id}" style="
                                        background: none;
                                        border: none;
                                        color: #e74c3c;
                                        cursor: pointer;
                                        font-size: 0.8rem;
                                    ">
                                        <i class="fas fa-trash"></i> Delete
                                    </button>
                                </div>
                                <div class="review-meta" style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                                    <span class="review-author" style="font-weight: 600; color: #333;">${review.user?.name || 'You'}</span>
                                    <span class="review-date" style="color: #777; font-size: 0.8rem;">${new Date(review.createdAt).toLocaleDateString()}</span>
                                </div>
                                <div class="review-rating" style="color: #ffc107; margin-bottom: 10px;">${generateStarRating(review.rating)}</div>
                                ${review.title ? `<h5 style="margin-bottom: 8px; color: #333;">${review.title}</h5>` : ''}
                                <div class="review-text" style="line-height: 1.6; color: #555;">${review.comment}</div>
                            </div>
                        `).join('')}
                    </div>
                ` : ''}
                
                ${otherReviews.length > 0 ? `
                    <div class="other-reviews">
                        <h4 style="margin-bottom: 15px; color: #333;">Customer Reviews</h4>
                        <div class="review-list" style="max-height: 300px; overflow-y: auto;">
                            ${otherReviews.slice(0, 5).map(review => `
                                <div class="review-item" style="background: white; padding: 15px; border-radius: 8px; margin-bottom: 15px;">
                                    <div class="review-meta" style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                                        <span class="review-author" style="font-weight: 600; color: #333;">${review.user?.name || 'Customer'}</span>
                                        <span class="review-date" style="color: #777; font-size: 0.8rem;">${new Date(review.createdAt).toLocaleDateString()}</span>
                                    </div>
                                    <div class="review-rating" style="color: #ffc107; margin-bottom: 10px;">${generateStarRating(review.rating)}</div>
                                    ${review.title ? `<h5 style="margin-bottom: 8px; color: #333;">${review.title}</h5>` : ''}
                                    <div class="review-text" style="line-height: 1.6; color: #555;">${review.comment}</div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                ` : ''}
            </div>
        `;
    } else {
        reviewsSection = `
            <div class="no-reviews" style="margin-top: 30px; padding: 20px; background: #f5f5f5; border-radius: 10px; text-align: center;">
                <p style="color: #777;">No reviews yet. Be the first to review this product!</p>
                <button class="write-review-btn" data-product-id="${product.id}" style="
                    background: #4a7c59;
                    color: white;
                    border: none;
                    padding: 10px 20px;
                    border-radius: 5px;
                    cursor: pointer;
                    font-weight: 500;
                    margin-top: 10px;
                ">
                    Write a Review
                </button>
            </div>
        `;
    }

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
                            <span style="color: #6b7280;">(${detailedProduct.numReviews || reviews.length} reviews)</span>
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
                            " data-id="${detailedProduct.id}" 
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

    const addToCartBtn = modal.querySelector('.add-to-cart-btn');
    if (addToCartBtn) {
        addToCartBtn.addEventListener('click', function() {
            const id = this.getAttribute('data-id');
            const name = this.getAttribute('data-name');
            const price = parseFloat(this.getAttribute('data-price'));
            const image = this.getAttribute('data-image');
            const stock = parseInt(this.getAttribute('data-stock'));
            
            addToCart(id, name, price, image, stock);
            
            simpleNotification.show(`Added ${name} to cart!`, 'success');
            
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
            
            if (addToCartBtn) {
                addToCartBtn.setAttribute('data-price', newPrice);
            }
        });
    });

    const writeReviewBtn = modal.querySelector('.write-review-btn');
    if (writeReviewBtn) {
        writeReviewBtn.addEventListener('click', function() {
            const productId = this.getAttribute('data-product-id');
            modal.style.display = 'none';
            setTimeout(() => {
                modal.remove();
                document.body.style.overflow = '';
                reviewSystem.show(productId);
            }, 300);
        });
    }

    const editReviewBtns = modal.querySelectorAll('.edit-review-btn');
    editReviewBtns.forEach(btn => {
        btn.addEventListener('click', async function() {
            const reviewId = this.getAttribute('data-review-id');
            const review = reviews.find(r => r._id === reviewId);
            if (review) {
                modal.style.display = 'none';
                setTimeout(() => {
                    modal.remove();
                    document.body.style.overflow = '';
                    reviewSystem.show(product.id, review);
                }, 300);
            }
        });
    });

    const deleteReviewBtns = modal.querySelectorAll('.delete-review-btn');
    deleteReviewBtns.forEach(btn => {
        btn.addEventListener('click', async function() {
            const reviewId = this.getAttribute('data-review-id');
            if (confirm('Are you sure you want to delete this review?')) {
                try {
                    await reviewSystem.deleteReview(reviewId);
                    simpleNotification.show('Review deleted successfully!', 'success');
                    
                    modal.style.display = 'none';
                    setTimeout(() => {
                        modal.remove();
                        document.body.style.overflow = '';
                        showEnhancedProductDetail(product);
                    }, 500);
                } catch (error) {
                    simpleNotification.show('Failed to delete review', 'error');
                }
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

// ==================== AUTHENTICATION SERVICE ====================
class AuthService {
    constructor() {
        this.BASE_URL = `${API_BASE_URL}/auth`;
        this.token = null;
        this.user = null;
        this.loadUserData();
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
            console.error('Error saving user data:', error);
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
            console.error('Error loading user data:', error);
            return null;
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

    async login(credentials) {
        try {
            const response = await fetch(`${this.BASE_URL}/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(credentials)
            });

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
                    errorMessage = `Server returned ${response.status}`;
                }
            }
            
            if (!response.ok) {
                throw new Error(errorMessage);
            }

            if (data.success) {
                this.token = data.token;
                
                this.user = {
                    _id: data.data?._id || data.data?.id || data.user?._id || data.user?.id || data.userId || 'temp-id',
                    id: data.data?._id || data.data?.id || data.user?._id || data.user?.id || data.userId || 'temp-id',
                    name: data.data?.name || data.user?.name || credentials.email.split('@')[0],
                    email: data.data?.email || data.user?.email || credentials.email,
                    isVerified: data.data?.isVerified !== undefined ? data.data.isVerified : 
                               data.user?.isVerified !== undefined ? data.user.isVerified : false,
                    role: data.data?.role || data.user?.role || 'user'
                };
                
                this.saveUserData();
                this.updateUI();
                return data;
            } else {
                throw new Error(data.message || 'Login failed');
            }
        } catch (error) {
            console.error('Login error:', error);
            throw error;
        }
    }

    logout() {
        this.token = null;
        this.user = null;
        
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
        
        this.updateUI();
        simpleNotification.show('Logged out successfully', 'success');
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
}

const authService = new AuthService();

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
const catalogGrid = document.getElementById('catalogGrid');
const pagination = document.getElementById('pagination');

// ==================== FILTER ELEMENTS ====================
const categoryFilter = document.getElementById('categoryFilter');
const skinTypeFilter = document.getElementById('skinTypeFilter');
const priceFilter = document.getElementById('priceFilter');
const productSearch = document.getElementById('productSearch');

// ==================== PAGINATION ====================
let currentPage = 1;
const productsPerPage = 8;

// ==================== FIXED: attachProductEventListeners FUNCTION ====================
function attachProductEventListeners() {
    // Add event listeners to "Add to Cart" buttons
    document.querySelectorAll('.add-to-cart').forEach(button => {
        const newButton = button.cloneNode(true);
        button.parentNode.replaceChild(newButton, button);
        
        newButton.addEventListener('click', function(e) {
            e.stopPropagation();
            
            const id = this.getAttribute('data-id');
            const name = this.getAttribute('data-name');
            const price = parseFloat(this.getAttribute('data-price'));
            const image = this.getAttribute('data-image');
            const stock = parseInt(this.getAttribute('data-stock') || 999);
            
            if (id && name && price) {
                addToCart(id, name, price, image, stock);
                
                cartNotification.show({
                    name: name,
                    price: price,
                    image: image
                });
            }
        });
    });
    
    // Add click handlers to product cards (excluding buttons)
    document.querySelectorAll('.product-card').forEach(card => {
        card.style.cursor = 'pointer';
        
        card.addEventListener('click', function(e) {
            if (!e.target.closest('.add-to-cart') && 
                !e.target.closest('.wishlist') && 
                !e.target.closest('button') && 
                !e.target.closest('a')) {
                
                const productId = this.getAttribute('data-product-id') || 
                                this.querySelector('.add-to-cart')?.getAttribute('data-id');
                
                if (productId) {
                    const product = products.find(p => p.id == productId);
                    if (product) {
                        showEnhancedProductDetail(product);
                    }
                }
            }
        });
        
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-5px)';
            this.style.boxShadow = '0 10px 20px rgba(0,0,0,0.15)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
            this.style.boxShadow = '';
        });
    });
    
    // Add event listeners to wishlist buttons
    document.querySelectorAll('.wishlist').forEach(button => {
        button.addEventListener('click', function(e) {
            e.stopPropagation();
            const icon = this.querySelector('i');
            if (icon.classList.contains('far')) {
                icon.classList.remove('far');
                icon.classList.add('fas');
                icon.style.color = '#e74c3c';
                simpleNotification.show('Added to wishlist!', 'success');
            } else {
                icon.classList.remove('fas');
                icon.classList.add('far');
                icon.style.color = '';
                simpleNotification.show('Removed from wishlist', 'info');
            }
        });
    });
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

function displayProducts(productsToDisplay = null, page = 1) {
    try {
        let productsData;
        
        if (productsToDisplay) {
            productsData = productsToDisplay;
        } else {
            productsData = filterLocalProducts(products);
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
                productCard.setAttribute('data-product-id', product.id);
                
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
                
                catalogGrid.appendChild(productCard);
            });
            
            attachProductEventListeners();
            updatePagination(productsData.length, page);
        }
        
    } catch (error) {
        console.error('Error displaying products:', error);
        const filteredProducts = filterLocalProducts(products);
        displayProducts(filteredProducts, page);
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
            button.addEventListener('click', function() {
                const page = parseInt(this.getAttribute('data-page'));
                const filteredProducts = filterLocalProducts(products);
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
    try {
        const filters = getCurrentFilters();
        const filteredProducts = filterLocalProducts(products);
        displayProducts(filteredProducts, 1);
    } catch (error) {
        console.error('Error applying filters:', error);
        const filteredProducts = filterLocalProducts(products);
        displayProducts(filteredProducts, 1);
    }
}

function getCurrentFilters() {
    return {
        category: categoryFilter ? categoryFilter.value : 'all',
        skinType: skinTypeFilter ? skinTypeFilter.value : 'all',
        priceRange: priceFilter ? priceFilter.value : 'all',
        search: productSearch ? productSearch.value : ''
    };
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
    const cartLink = document.querySelector('.cart-link');
    const homeLinks = document.querySelectorAll('.home-link');
    const catalogLinks = document.querySelectorAll('.catalog-link');
    
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
            showCatalogPage();
        });
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

// ==================== PAGE MANAGEMENT ====================
function showMainPage() {
    if (mainContent) mainContent.style.display = 'block';
    if (catalogPage) catalogPage.style.display = 'none';
    if (cartPage) cartPage.style.display = 'none';
    document.title = 'RoiBeautyEssence - Premium Skincare';
}

function showCatalogPage() {
    if (mainContent) mainContent.style.display = 'none';
    if (catalogPage) catalogPage.style.display = 'block';
    if (cartPage) cartPage.style.display = 'none';
    document.title = 'RoiBeautyEssence - Products';
    
    // Initialize catalog
    displayProducts();
    setupFilters();
}

function showCartPage() {
    if (mainContent) mainContent.style.display = 'none';
    if (catalogPage) catalogPage.style.display = 'none';
    if (cartPage) cartPage.style.display = 'block';
    document.title = 'RoiBeautyEssence - Cart';
    
    updateCart();
}

// ==================== EVENT LISTENERS ====================
const profileBtn = document.getElementById('profileBtn');
const profileModal = document.getElementById('profileModal');

if (profileBtn && profileModal) {
    profileBtn.addEventListener('click', (e) => {
        e.preventDefault();
        profileModal.style.display = 'flex';
        if (authService.isLoggedIn()) {
            showProfilePage();
        } else {
            showLoginPage();
        }
    });
}

if (checkoutBtn) {
    checkoutBtn.addEventListener('click', function() {
        simpleNotification.show('Checkout functionality coming soon!', 'info');
    });
}

// ==================== PROFILE PAGE FUNCTIONALITY ====================
async function showProfilePage() {
    const modalContent = document.querySelector('.modal-content');
    if (!modalContent) return;
    
    const user = authService.getCurrentUser();
    
    modalContent.innerHTML = `
        <div class="modal-header">
            <h2>My Account</h2>
            <button class="close-modal" id="closeModal">&times;</button>
        </div>
        <div class="profile-content">
            <div class="user-info">
                <div class="user-avatar">
                    <i class="fas fa-user-circle"></i>
                </div>
                <h3>${user.name || 'User'}</h3>
                <p>${user.email || 'No email'}</p>
                <div class="user-stats">
                    <div class="stat">
                        <span class="stat-number">0</span>
                        <span class="stat-label">Orders</span>
                    </div>
                    <div class="stat">
                        <span class="stat-number">0</span>
                        <span class="stat-label">Reviews</span>
                    </div>
                </div>
            </div>
            
            <div class="profile-actions">
                <button class="profile-btn" id="myOrdersBtn">
                    <i class="fas fa-shopping-bag"></i>
                    <span>My Orders</span>
                </button>
                <button class="profile-btn" id="myReviewsBtn">
                    <i class="fas fa-star"></i>
                    <span>My Reviews</span>
                </button>
                <button class="profile-btn" id="editProfileBtn">
                    <i class="fas fa-user-edit"></i>
                    <span>Edit Profile</span>
                </button>
                <button class="profile-btn logout" id="logoutBtn">
                    <i class="fas fa-sign-out-alt"></i>
                    <span>Logout</span>
                </button>
            </div>
        </div>
    `;
    
    const closeModal = document.getElementById('closeModal');
    if (closeModal) {
        closeModal.addEventListener('click', () => {
            profileModal.style.display = 'none';
        });
    }
    
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            authService.logout();
            profileModal.style.display = 'none';
        });
    }
    
    const myReviewsBtn = document.getElementById('myReviewsBtn');
    if (myReviewsBtn) {
        myReviewsBtn.addEventListener('click', async () => {
            await showUserReviews();
        });
    }
}

async function showUserReviews() {
    const modalContent = document.querySelector('.modal-content');
    if (!modalContent) return;
    
    modalContent.innerHTML = `
        <div class="modal-header">
            <h2>My Reviews</h2>
            <button class="close-modal" id="closeModal">&times;</button>
            <button class="back-btn" id="backToProfile">
                <i class="fas fa-arrow-left"></i> Back
            </button>
        </div>
        <div class="user-reviews">
            <div class="loading">Loading your reviews...</div>
        </div>
    `;
    
    try {
        const reviews = await reviewSystem.getUserReviews();
        const reviewsContainer = document.querySelector('.user-reviews');
        
        if (reviews.length === 0) {
            reviewsContainer.innerHTML = `
                <div class="no-reviews">
                    <i class="fas fa-star"></i>
                    <h3>No Reviews Yet</h3>
                    <p>You haven't reviewed any products yet.</p>
                    <button class="btn" id="browseProducts">Browse Products</button>
                </div>
            `;
            
            const browseBtn = document.getElementById('browseProducts');
            if (browseBtn) {
                browseBtn.addEventListener('click', () => {
                    profileModal.style.display = 'none';
                    showCatalogPage();
                });
            }
        } else {
            let reviewsHTML = '';
            reviews.forEach(review => {
                reviewsHTML += `
                    <div class="review-card" data-review-id="${review._id}">
                        <div class="review-product">
                            <img src="${review.product?.image || 'image curology.jpeg'}" alt="${review.product?.name || 'Product'}">
                            <div class="product-details">
                                <h4>${review.product?.name || 'Product'}</h4>
                                <p class="product-price">£${review.product?.price || '0.00'}</p>
                            </div>
                        </div>
                        <div class="review-content">
                            <div class="review-header">
                                <div class="review-rating">
                                    ${generateStarRating(review.rating)}
                                </div>
                                <div class="review-actions">
                                    <button class="edit-review" data-review-id="${review._id}">
                                        <i class="fas fa-edit"></i> Edit
                                    </button>
                                    <button class="delete-review" data-review-id="${review._id}">
                                        <i class="fas fa-trash"></i> Delete
                                    </button>
                                </div>
                            </div>
                            ${review.title ? `<h5>${review.title}</h5>` : ''}
                            <p class="review-text">${review.comment}</p>
                            <div class="review-date">
                                Reviewed on ${new Date(review.createdAt).toLocaleDateString()}
                            </div>
                        </div>
                    </div>
                `;
            });
            
            reviewsContainer.innerHTML = reviewsHTML;
            
            // Add event listeners for edit/delete
            document.querySelectorAll('.edit-review').forEach(btn => {
                btn.addEventListener('click', async function() {
                    const reviewId = this.getAttribute('data-review-id');
                    const review = reviews.find(r => r._id === reviewId);
                    if (review) {
                        profileModal.style.display = 'none';
                        const product = products.find(p => p.name === review.product?.name);
                        if (product) {
                            reviewSystem.show(product.id, review);
                        }
                    }
                });
            });
            
            document.querySelectorAll('.delete-review').forEach(btn => {
                btn.addEventListener('click', async function() {
                    const reviewId = this.getAttribute('data-review-id');
                    if (confirm('Are you sure you want to delete this review?')) {
                        try {
                            await reviewSystem.deleteReview(reviewId);
                            simpleNotification.show('Review deleted successfully!', 'success');
                            showUserReviews(); // Refresh the list
                        } catch (error) {
                            simpleNotification.show('Failed to delete review', 'error');
                        }
                    }
                });
            });
        }
    } catch (error) {
        console.error('Error loading user reviews:', error);
        const reviewsContainer = document.querySelector('.user-reviews');
        reviewsContainer.innerHTML = `
            <div class="error">
                <i class="fas fa-exclamation-triangle"></i>
                <p>Failed to load reviews. Please try again.</p>
            </div>
        `;
    }
    
    const backBtn = document.getElementById('backToProfile');
    if (backBtn) {
        backBtn.addEventListener('click', () => {
            showProfilePage();
        });
    }
    
    const closeModal = document.getElementById('closeModal');
    if (closeModal) {
        closeModal.addEventListener('click', () => {
            profileModal.style.display = 'none';
        });
    }
}

function showLoginPage() {
    const modalContent = document.querySelector('.modal-content');
    if (!modalContent) return;
    
    modalContent.innerHTML = `
        <div class="modal-header">
            <h2>Login</h2>
            <button class="close-modal" id="closeModal">&times;</button>
        </div>
        <div class="auth-form">
            <div class="form-group">
                <label for="loginEmail">Email</label>
                <input type="email" id="loginEmail" placeholder="Your email address">
            </div>
            <div class="form-group">
                <label for="loginPassword">Password</label>
                <input type="password" id="loginPassword" placeholder="Your password">
            </div>
            <button class="auth-btn" id="loginBtn">Login</button>
            <div class="auth-links">
                <a href="#" id="showSignup">Don't have an account? Sign up</a>
            </div>
        </div>
    `;
    
    const closeModal = document.getElementById('closeModal');
    if (closeModal) {
        closeModal.addEventListener('click', () => {
            profileModal.style.display = 'none';
        });
    }
    
    const loginBtn = document.getElementById('loginBtn');
    if (loginBtn) {
        loginBtn.addEventListener('click', async () => {
            const email = document.getElementById('loginEmail').value;
            const password = document.getElementById('loginPassword').value;
            
            if (!email || !password) {
                simpleNotification.show('Please fill in all fields', 'error');
                return;
            }
            
            try {
                loginBtn.innerHTML = 'Logging in...';
                loginBtn.disabled = true;
                
                await authService.login({ email, password });
                simpleNotification.show('Login successful!', 'success');
                
                setTimeout(() => {
                    profileModal.style.display = 'none';
                    showProfilePage();
                }, 1500);
                
            } catch (error) {
                simpleNotification.show(error.message, 'error');
                loginBtn.innerHTML = 'Login';
                loginBtn.disabled = false;
            }
        });
    }
    
    const showSignup = document.getElementById('showSignup');
    if (showSignup) {
        showSignup.addEventListener('click', (e) => {
            e.preventDefault();
            showSignupPage();
        });
    }
}

function showSignupPage() {
    const modalContent = document.querySelector('.modal-content');
    if (!modalContent) return;
    
    modalContent.innerHTML = `
        <div class="modal-header">
            <h2>Sign Up</h2>
            <button class="close-modal" id="closeModal">&times;</button>
        </div>
        <div class="auth-form">
            <div class="form-group">
                <label for="signupName">Full Name</label>
                <input type="text" id="signupName" placeholder="Your full name">
            </div>
            <div class="form-group">
                <label for="signupEmail">Email</label>
                <input type="email" id="signupEmail" placeholder="Your email address">
            </div>
            <div class="form-group">
                <label for="signupPassword">Password</label>
                <input type="password" id="signupPassword" placeholder="Create a password (min. 6 characters)">
            </div>
            <button class="auth-btn" id="signupBtn">Sign Up</button>
            <div class="auth-links">
                <a href="#" id="showLogin">Already have an account? Login</a>
            </div>
        </div>
    `;
    
    const closeModal = document.getElementById('closeModal');
    if (closeModal) {
        closeModal.addEventListener('click', () => {
            profileModal.style.display = 'none';
        });
    }
    
    const signupBtn = document.getElementById('signupBtn');
    if (signupBtn) {
        signupBtn.addEventListener('click', async () => {
            const name = document.getElementById('signupName').value;
            const email = document.getElementById('signupEmail').value;
            const password = document.getElementById('signupPassword').value;
            
            if (!name || !email || !password) {
                simpleNotification.show('Please fill in all fields', 'error');
                return;
            }
            
            if (password.length < 6) {
                simpleNotification.show('Password must be at least 6 characters', 'error');
                return;
            }
            
            try {
                signupBtn.innerHTML = 'Creating account...';
                signupBtn.disabled = true;
                
                // In a real app, you would call authService.register()
                // For now, simulate successful registration
                setTimeout(() => {
                    simpleNotification.show('Account created successfully! Please login.', 'success');
                    showLoginPage();
                }, 1500);
                
            } catch (error) {
                simpleNotification.show(error.message, 'error');
                signupBtn.innerHTML = 'Sign Up';
                signupBtn.disabled = false;
            }
        });
    }
    
    const showLogin = document.getElementById('showLogin');
    if (showLogin) {
        showLogin.addEventListener('click', (e) => {
            e.preventDefault();
            showLoginPage();
        });
    }
}

// ==================== INITIALIZE APP ====================
function initApp() {
    authService.updateUI();
    setupNavigation();
    reviewSystem.init();
    
    updateCart();
    
    // Load featured products on home page
    if (document.querySelector('.collections')) {
        displayFeaturedProducts();
    }
    
    // Check current page
    const path = window.location.pathname;
    if (path.includes('cart') || window.location.hash === '#cart') {
        showCartPage();
    } else if (path.includes('products') || window.location.hash === '#products') {
        showCatalogPage();
    } else {
        showMainPage();
    }
}

function displayFeaturedProducts() {
    const featuredContainer = document.querySelector('.collections');
    if (!featuredContainer) return;
    
    const featuredProducts = products.slice(0, 4);
    
    featuredContainer.innerHTML = `
        <h2 class="section-title">Featured Collections</h2>
        <div class="product-grid" id="featuredGrid">
            ${featuredProducts.map(product => `
                <div class="product-card" data-product-id="${product.id}">
                    <div class="product-image">
                        <img src="${product.image}" alt="${product.name}" loading="lazy">
                        ${product.badge ? `<div class="product-badge">${product.badge}</div>` : ''}
                        ${product.stockQuantity === 0 ? '<div class="out-of-stock-badge">Out of Stock</div>' : 
                          product.stockQuantity < 5 ? '<div class="low-stock-badge">Low Stock</div>' : ''}
                    </div>
                    <div class="product-info">
                        <h3>${product.name}</h3>
                        <p>${product.description}</p>
                        <p class="price ${product.originalPrice ? 'sale' : ''}">
                            £${product.price.toFixed(2)}
                            ${product.originalPrice ? `<span class="original-price">£${product.originalPrice.toFixed(2)}</span>` : ''}
                        </p>
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
                </div>
            `).join('')}
        </div>
    `;
    
    // Attach event listeners to featured products
    setTimeout(() => {
        attachProductEventListeners();
    }, 100);
}

// ==================== DOM CONTENT LOADED ====================
document.addEventListener('DOMContentLoaded', function() {
    initApp();
    
    // Optimize images
    document.querySelectorAll('img').forEach(img => {
        img.loading = 'lazy';
        img.onerror = function() {
            this.src = 'image curology.jpeg';
        };
    });
    
    // Convert currency
    function convertCurrencyToPounds() {
        function replaceTextInNode(node) {
            if (node.nodeType === Node.TEXT_NODE) {
                node.textContent = node.textContent.replace(/€/g, '£');
            } else if (node.nodeType === Node.ELEMENT_NODE) {
                node.childNodes.forEach(child => replaceTextInNode(child));
            }
        }
        replaceTextInNode(document.body);
    }
    convertCurrencyToPounds();
});

// ==================== BACKEND CONNECTION TEST ====================
async function testBackendConnection() {
    try {
        const response = await fetch(`${API_BASE_URL}/health`);
        if (response.ok) {
            console.log('✅ Backend connection successful');
            return true;
        }
    } catch (error) {
        console.log('🌐 Backend not available, using local mode');
    }
    return false;
}

// Test connection on startup
testBackendConnection();