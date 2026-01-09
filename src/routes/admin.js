
const express = require('express');
const router = express.Router();
const Product = require('../models/product');
const Order = require('../models/order');
const User = require('../models/user');
const { protect } = require('../middleware/auth');

// Admin middleware
const isAdmin = (req, res, next) => {
    if (!req.user || (!req.user.isAdmin && req.user.role !== 'admin')) {
        return res.status(403).json({
            success: false,
            message: 'Admin access required'
        });
    }
    next();
};

// Apply authentication and admin check to all routes
router.use(protect);
router.use(isAdmin);

// ==================== ADMIN STATS ====================
router.get('/stats', async (req, res) => {
    try {
        console.log('📊 Admin stats requested');
        
        // Get statistics
        const [
            totalOrders,
            totalProducts,
            totalUsers,
            recentOrders,
            totalRevenueResult
        ] = await Promise.all([
            Order.countDocuments(),
            Product.countDocuments(),
            User.countDocuments(),
            Order.find().sort({ createdAt: -1 }).limit(5),
            Order.aggregate([
                { $match: { paymentStatus: 'paid' } },
                { $group: { _id: null, total: { $sum: '$totalAmount' } } }
            ])
        ]);

        // Get new customers from last 7 days
        const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        const newCustomers = await User.countDocuments({ 
            createdAt: { $gte: weekAgo } 
        });

        // Get low stock products (less than 10 in stock)
        const lowStockProducts = await Product.countDocuments({ 
            stockQuantity: { $lt: 10 } 
        });

        const totalRevenue = totalRevenueResult[0]?.total || 0;

        res.json({
            success: true,
            data: {
                totalOrders,
                totalRevenue,
                totalUsers,
                totalProducts,
                newCustomers,
                lowStockProducts
            }
        });
    } catch (error) {
        console.error('Admin stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to load admin stats'
        });
    }
});

// ==================== ALL ORDERS ====================
router.get('/orders', async (req, res) => {
    try {
        const { limit, page, status, search } = req.query;
        const pageNumber = parseInt(page) || 1;
        const limitNumber = parseInt(limit) || 50;
        const skip = (pageNumber - 1) * limitNumber;

        let filter = {};
        
        // Filter by status
        if (status && status !== 'all') {
            filter.status = status;
        }
        
        // Search filter
        if (search) {
            filter.$or = [
                { orderNumber: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
                { 'shippingAddress.fullName': { $regex: search, $options: 'i' } }
            ];
        }

        const orders = await Order.find(filter)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limitNumber);

        const totalOrders = await Order.countDocuments(filter);

        res.json({
            success: true,
            data: orders,
            pagination: {
                page: pageNumber,
                limit: limitNumber,
                total: totalOrders,
                pages: Math.ceil(totalOrders / limitNumber)
            }
        });
    } catch (error) {
        console.error('Admin orders error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to load orders'
        });
    }
});

// ==================== SINGLE ORDER ====================
router.get('/orders/:id', async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);
        
        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        res.json({
            success: true,
            data: order
        });
    } catch (error) {
        console.error('Get order error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to load order'
        });
    }
});

// ==================== UPDATE ORDER STATUS ====================
router.put('/orders/:id/status', async (req, res) => {
    try {
        const { status } = req.body;
        
        if (!status) {
            return res.status(400).json({
                success: false,
                message: 'Status is required'
            });
        }

        const validStatuses = ['pending', 'paid', 'shipped', 'delivered', 'cancelled'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid status. Use: pending, paid, shipped, delivered, cancelled'
            });
        }

        const order = await Order.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true }
        );

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        // If status is paid, update paymentStatus and paidAt
        if (status === 'paid') {
            order.paymentStatus = 'paid';
            order.paidAt = new Date();
            await order.save();
        }

        res.json({
            success: true,
            data: order,
            message: 'Order status updated successfully'
        });
    } catch (error) {
        console.error('Update order status error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update order status'
        });
    }
});

// ==================== PRODUCTS MANAGEMENT ====================
router.get('/products', async (req, res) => {
    try {
        const products = await Product.find().sort({ createdAt: -1 });
        
        res.json({
            success: true,
            data: products
        });
    } catch (error) {
        console.error('Admin products error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to load products'
        });
    }
});

// ==================== USERS/CUSTOMERS ====================
router.get('/customers', async (req, res) => {
    try {
        const users = await User.find().sort({ createdAt: -1 });
        
        res.json({
            success: true,
            data: users
        });
    } catch (error) {
        console.error('Admin customers error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to load customers'
        });
    }
});

module.exports = router;