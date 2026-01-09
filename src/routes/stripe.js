const express = require('express');
const router = express.Router();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY || 'sk_test_51QhRekHwV9Bv8TExoJwf4fssuZPYh1z5o3NzLmOQvjvNzkNQ9Fk7nV7v9kK4m4U3BpL8S6A9T2X5s7R8hV4G7tC00');
const mongoose = require('mongoose');

// Simple Order model if not exists
const orderSchema = new mongoose.Schema({
    orderId: { type: String, unique: true },
    orderNumber: String,
    userId: String,
    email: String,
    items: Array,
    shippingAddress: Object,
    totalAmount: Number,
    status: { type: String, default: 'pending' },
    paymentMethod: { type: String, default: 'stripe' },
    paymentStatus: { type: String, default: 'pending' },
    stripePaymentId: String,
    receiptUrl: String,
    paidAt: Date
}, { timestamps: true });

const Order = mongoose.models.Order || mongoose.model('Order', orderSchema);

// ✅ FIXED: Create payment intent
router.post('/create-payment-intent', async (req, res) => {
    try {
        console.log('💰 Creating payment intent...');
        
        const { amount, cart, email, userId, shippingAddress } = req.body;
        
        // Validate
        if (!amount || amount <= 0) {
            return res.status(400).json({
                success: false,
                message: 'Invalid amount'
            });
        }
        
        // Generate IDs
        const orderId = `RB-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
        const orderNumber = `ORD${Date.now()}${Math.floor(Math.random() * 1000)}`;
        
        // Create order first
        const orderData = {
            orderId,
            orderNumber,
            userId: userId || 'guest',
            email: email || 'guest@example.com',
            items: cart || [],
            shippingAddress: shippingAddress || {},
            totalAmount: amount,
            status: 'pending',
            paymentMethod: 'stripe',
            paymentStatus: 'pending'
        };
        
        console.log('📝 Creating order:', orderData);
        
        const order = new Order(orderData);
        await order.save();
        console.log('✅ Order saved:', orderId);
        
        // Create payment intent
        const paymentIntent = await stripe.paymentIntents.create({
            amount: Math.round(amount * 100), // Convert to cents
            currency: 'eur',
            metadata: {
                orderId: orderId,
                orderNumber: orderNumber,
                email: email || 'guest',
                userId: userId || 'guest'
            }
        });
        
        // Update order with Stripe payment ID
        order.stripePaymentId = paymentIntent.id;
        await order.save();
        
        res.json({
            success: true,
            clientSecret: paymentIntent.client_secret,
            paymentIntentId: paymentIntent.id,
            orderId: orderId,
            orderNumber: orderNumber
        });
        
    } catch (error) {
        console.error('❌ Payment intent error:', error);
        res.status(500).json({
            success: false,
            message: 'Payment setup failed: ' + error.message
        });
    }
});

// ✅ FIXED: Confirm payment
router.post('/confirm-payment', async (req, res) => {
    try {
        const { paymentIntentId, orderId } = req.body;
        
        if (!paymentIntentId) {
            return res.status(400).json({
                success: false,
                message: 'Payment intent ID required'
            });
        }
        
        // Verify with Stripe
        const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
        
        if (paymentIntent.status !== 'succeeded') {
            return res.status(400).json({
                success: false,
                message: `Payment not completed. Status: ${paymentIntent.status}`,
                status: paymentIntent.status
            });
        }
        
        // Find and update order
        const order = await Order.findOne({ 
            $or: [
                { orderId: orderId },
                { stripePaymentId: paymentIntentId }
            ]
        });
        
        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }
        
        // Update order
        order.paymentStatus = 'succeeded';
        order.status = 'paid';
        order.paidAt = new Date();
        
        if (paymentIntent.charges?.data?.[0]?.receipt_url) {
            order.receiptUrl = paymentIntent.charges.data[0].receipt_url;
        }
        
        await order.save();
        
        res.json({
            success: true,
            message: 'Payment confirmed successfully',
            order: {
                orderId: order.orderId,
                orderNumber: order.orderNumber,
                status: order.status,
                amount: order.totalAmount,
                paidAt: order.paidAt
            }
        });
        
    } catch (error) {
        console.error('❌ Confirm payment error:', error);
        res.status(500).json({
            success: false,
            message: 'Payment confirmation failed: ' + error.message
        });
    }
});

// ✅ Test endpoint
router.get('/test', (req, res) => {
    res.json({
        success: true,
        message: 'Stripe payment API is working',
        timestamp: new Date().toISOString(),
        stripeKey: !!process.env.STRIPE_SECRET_KEY
    });
});

// ✅ Simple health check
router.get('/health', (req, res) => {
    res.json({
        success: true,
        message: 'Payment API is running',
        timestamp: new Date().toISOString()
    });
});

module.exports = router;