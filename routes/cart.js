const express = require('express');
const router = express.Router();
const Product = require('../models/product');

// Get cart
router.get('/', (req, res) => {
    const cart = req.session.cart || [];
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    res.json({
        success: true,
        cart,
        total: total.toFixed(2),
        itemCount: cart.reduce((count, item) => count + item.quantity, 0)
    });
});

// Add to cart
router.post('/add', async (req, res) => {
    try {
        const { productId, quantity = 1, size } = req.body;
        
        if (!productId) {
            return res.status(400).json({
                success: false,
                message: 'Product ID is required'
            });
        }
        
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }
        
        if (!product.inStock) {
            return res.status(400).json({
                success: false,
                message: 'Product is out of stock'
            });
        }
        
        if (quantity > (product.stockQuantity || 10)) {
            return res.status(400).json({
                success: false,
                message: `Only ${product.stockQuantity} items available`
            });
        }
        
        const cart = req.session.cart || [];
        
        // Check if product already in cart
        const existingItemIndex = cart.findIndex(item => 
            item.productId === productId && item.size === size
        );
        
        if (existingItemIndex > -1) {
            // Update quantity
            cart[existingItemIndex].quantity += quantity;
        } else {
            // Add new item
            cart.push({
                productId: product._id,
                name: product.name,
                price: product.price,
                image: product.getPrimaryImage(),
                quantity,
                size: size || null,
                maxQuantity: product.stockQuantity || 10,
                inStock: product.inStock
            });
        }
        
        req.session.cart = cart;
        
        // Calculate cart summary
        const itemCount = cart.reduce((count, item) => count + item.quantity, 0);
        const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        
        res.json({
            success: true,
            message: 'Product added to cart',
            cart,
            itemCount,
            total: total.toFixed(2)
        });
        
    } catch (error) {
        console.error('Add to cart error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to add product to cart'
        });
    }
});

// Update cart item quantity
router.put('/update/:productId', async (req, res) => {
    try {
        const { productId } = req.params;
        const { quantity, size } = req.body;
        
        if (!quantity || quantity < 1) {
            return res.status(400).json({
                success: false,
                message: 'Invalid quantity'
            });
        }
        
        const cart = req.session.cart || [];
        const itemIndex = cart.findIndex(item => 
            item.productId === productId && item.size === size
        );
        
        if (itemIndex === -1) {
            return res.status(404).json({
                success: false,
                message: 'Item not found in cart'
            });
        }
        
        // Check stock availability
        const product = await Product.findById(productId);
        if (quantity > (product.stockQuantity || 10)) {
            return res.status(400).json({
                success: false,
                message: `Only ${product.stockQuantity} items available`
            });
        }
        
        cart[itemIndex].quantity = quantity;
        req.session.cart = cart;
        
        // Recalculate
        const itemCount = cart.reduce((count, item) => count + item.quantity, 0);
        const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        
        res.json({
            success: true,
            message: 'Cart updated',
            cart,
            itemCount,
            total: total.toFixed(2),
            updatedItem: cart[itemIndex]
        });
        
    } catch (error) {
        console.error('Update cart error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update cart'
        });
    }
});

// Remove from cart
router.delete('/remove/:productId', (req, res) => {
    try {
        const { productId } = req.params;
        const { size } = req.query;
        
        let cart = req.session.cart || [];
        
        cart = cart.filter(item => 
            !(item.productId === productId && item.size === size)
        );
        
        req.session.cart = cart;
        
        const itemCount = cart.reduce((count, item) => count + item.quantity, 0);
        const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        
        res.json({
            success: true,
            message: 'Item removed from cart',
            cart,
            itemCount,
            total: total.toFixed(2)
        });
        
    } catch (error) {
        console.error('Remove from cart error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to remove item from cart'
        });
    }
});

// Clear cart
router.delete('/clear', (req, res) => {
    req.session.cart = [];
    
    res.json({
        success: true,
        message: 'Cart cleared',
        cart: [],
        itemCount: 0,
        total: '0.00'
    });
});

// Get cart count (for navbar)
router.get('/count', (req, res) => {
    const cart = req.session.cart || [];
    const itemCount = cart.reduce((count, item) => count + item.quantity, 0);
    
    res.json({
        success: true,
        itemCount
    });
});

// Apply discount code
router.post('/apply-discount', (req, res) => {
    try {
        const { code } = req.body;
        const cart = req.session.cart || [];
        
        if (cart.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Cart is empty'
            });
        }
        
        const discountCodes = {
            'WELCOME15': 15,
            'SAVE10': 10,
            'FIRSTORDER': 20,
            'SUMMER25': 25
        };
        
        const discountPercent = discountCodes[code.toUpperCase()];
        
        if (!discountPercent) {
            return res.status(400).json({
                success: false,
                message: 'Invalid discount code'
            });
        }
        
        const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const discountAmount = (subtotal * discountPercent) / 100;
        const total = subtotal - discountAmount;
        
        req.session.discount = {
            code: code.toUpperCase(),
            percent: discountPercent,
            amount: discountAmount
        };
        
        res.json({
            success: true,
            message: `Discount applied: ${discountPercent}% off`,
            discount: {
                code: code.toUpperCase(),
                percent: discountPercent,
                amount: discountAmount.toFixed(2)
            },
            subtotal: subtotal.toFixed(2),
            total: total.toFixed(2)
        });
        
    } catch (error) {
        console.error('Apply discount error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to apply discount'
        });
    }
});

// Remove discount
router.delete('/remove-discount', (req, res) => {
    delete req.session.discount;
    
    const cart = req.session.cart || [];
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    res.json({
        success: true,
        message: 'Discount removed',
        subtotal: subtotal.toFixed(2),
        total: subtotal.toFixed(2)
    });
});

// Calculate shipping
router.post('/calculate-shipping', (req, res) => {
    try {
        const { country, zipCode } = req.body;
        const cart = req.session.cart || [];
        
        if (cart.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Cart is empty'
            });
        }
        
        const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        
        // Shipping calculation logic
        let shippingCost = 0;
        
        if (country === 'US') {
            shippingCost = subtotal >= 50 ? 0 : 5.99;
        } else if (country === 'CA') {
            shippingCost = subtotal >= 75 ? 0 : 9.99;
        } else if (country === 'UK') {
            shippingCost = subtotal >= 100 ? 0 : 14.99;
        } else {
            shippingCost = subtotal >= 150 ? 0 : 24.99;
        }
        
        req.session.shipping = {
            country,
            zipCode,
            cost: shippingCost
        };
        
        // Calculate tax (simplified)
        const taxRate = country === 'US' ? 0.08 : 0.10;
        const tax = subtotal * taxRate;
        
        // Apply discount if exists
        const discountAmount = req.session.discount?.amount || 0;
        const total = subtotal + shippingCost + tax - discountAmount;
        
        res.json({
            success: true,
            shipping: {
                country,
                cost: shippingCost.toFixed(2),
                freeThreshold: country === 'US' ? 50 : country === 'CA' ? 75 : country === 'UK' ? 100 : 150
            },
            tax: tax.toFixed(2),
            subtotal: subtotal.toFixed(2),
            discount: discountAmount.toFixed(2),
            total: total.toFixed(2)
        });
        
    } catch (error) {
        console.error('Calculate shipping error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to calculate shipping'
        });
    }
});

module.exports = router;