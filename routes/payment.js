const express = require('express');
const router = express.Router();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Order = require('../models/order');
const User = require('../models/user');
const emailService = require('../utils/emailService');
const { requireAuth } = require('../middleware/auth');

// Checkout page
router.get('/checkout', requireAuth, (req, res) => {
    const cart = req.session.cart || [];
    
    if (cart.length === 0) {
        req.flash('error', 'Your cart is empty');
        return res.redirect('/cart');
    }
    
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const shipping = req.session.shipping?.cost || 0;
    const discount = req.session.discount?.amount || 0;
    const tax = subtotal * 0.08; // Simplified tax calculation
    const total = subtotal + shipping + tax - discount;
    
    res.render('checkout', {
        title: 'Checkout',
        cart,
        subtotal: subtotal.toFixed(2),
        shipping: shipping.toFixed(2),
        tax: tax.toFixed(2),
        discount: discount.toFixed(2),
        total: total.toFixed(2),
        discountCode: req.session.discount?.code,
        user: req.session.user
    });
});

// Process payment
router.post('/process', requireAuth, async (req, res) => {
    try {
        const { paymentMethod, bankDetails } = req.body;
        const cart = req.session.cart || [];
        const user = req.session.user;
        
        if (cart.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Your cart is empty'
            });
        }
        
        // Calculate totals
        const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const shipping = req.session.shipping?.cost || 0;
        const discount = req.session.discount?.amount || 0;
        const tax = subtotal * 0.08;
        const total = subtotal + shipping + tax - discount;
        
        // Generate order number
        const orderNumber = `ROI-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
        
        // Create order
        const orderData = {
            orderNumber,
            userId: user._id,
            email: user.email,
            items: cart.map(item => ({
                productId: item.productId,
                name: item.name,
                price: item.price,
                quantity: item.quantity,
                size: item.size,
                image: item.image
            })),
            shippingAddress: req.session.shippingAddress || {},
            billingAddress: req.session.billingAddress || req.session.shippingAddress || {},
            subtotal,
            shippingCost: shipping,
            tax,
            discount: discount,
            totalAmount: total,
            paymentMethod,
            paymentStatus: paymentMethod === 'bank-transfer' ? 'pending' : 'pending',
            status: paymentMethod === 'bank-transfer' ? 'pending_payment' : 'processing'
        };
        
        // Add bank transfer details if applicable
        if (paymentMethod === 'bank-transfer') {
            orderData.bankTransferDetails = {
                bankName: bankDetails.bankName,
                accountName: bankDetails.accountName,
                accountNumber: bankDetails.accountNumber,
                routingNumber: bankDetails.routingNumber,
                reference: `ROI-${orderNumber}`
            };
            orderData.paymentInstructions = `
                Please transfer $${total.toFixed(2)} to:
                Bank: ${bankDetails.bankName}
                Account Name: ${bankDetails.accountName}
                Account Number: ${bankDetails.accountNumber}
                Routing Number: ${bankDetails.routingNumber}
                Reference: ROI-${orderNumber}
                
                Your order will be processed once payment is confirmed (usually within 24 hours).
            `;
        }
        
        const order = new Order(orderData);
        await order.save();
        
        // Update user stats
        const userDoc = await User.findById(user._id);
        if (userDoc) {
            userDoc.orderCount += 1;
            userDoc.totalSpent += total;
            await userDoc.save();
        }
        
        // Clear cart
        req.session.cart = [];
        delete req.session.discount;
        delete req.session.shipping;
        
        // Process payment based on method
        let paymentResult;
        
        switch (paymentMethod) {
            case 'stripe':
                paymentResult = await processStripePayment(order, req.body.paymentIntentId);
                break;
                
            case 'bank-transfer':
                paymentResult = await processBankTransfer(order, user);
                break;
                
            case 'paypal':
                paymentResult = await processPayPalPayment(order);
                break;
                
            default:
                throw new Error('Invalid payment method');
        }
        
        if (paymentResult.success) {
            // Update order with payment result
            order.paymentStatus = paymentResult.paymentStatus || 'succeeded';
            order.status = paymentResult.orderStatus || 'processing';
            order.paidAt = new Date();
            
            if (paymentResult.transactionId) {
                order.transactionId = paymentResult.transactionId;
            }
            
            await order.save();
            
            // Send confirmation email
            await emailService.sendOrderConfirmation(order, user);
            
            // Send admin notification
            await emailService.sendAdminNotification(
                'New Order Received',
                `Order #${order.orderNumber} has been placed by ${user.name} (${user.email}). Total: $${total.toFixed(2)}`
            );
            
            res.json({
                success: true,
                orderId: order._id,
                orderNumber: order.orderNumber,
                message: 'Order placed successfully!',
                redirectUrl: `/order/confirmation/${order._id}`
            });
        } else {
            throw new Error(paymentResult.message || 'Payment processing failed');
        }
        
    } catch (error) {
        console.error('Payment processing error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Payment processing failed'
        });
    }
});

// Stripe payment
async function processStripePayment(order, paymentIntentId) {
    try {
        if (!paymentIntentId) {
            throw new Error('Payment intent ID is required');
        }
        
        // Retrieve and confirm payment intent
        const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
        
        if (paymentIntent.status !== 'succeeded') {
            throw new Error(`Payment not completed. Status: ${paymentIntent.status}`);
        }
        
        return {
            success: true,
            transactionId: paymentIntent.id,
            paymentStatus: 'succeeded',
            orderStatus: 'processing'
        };
    } catch (error) {
        console.error('Stripe payment error:', error);
        return {
            success: false,
            message: error.message
        };
    }
}

// Bank transfer payment
async function processBankTransfer(order, user) {
    try {
        // For bank transfer, we mark as pending and wait for manual confirmation
        // In a real implementation, you would:
        // 1. Generate payment instructions
        // 2. Send email with bank details
        // 3. Wait for manual confirmation from admin
        
        // Send bank transfer instructions email
        await emailService.sendBankTransferInstructions(order, user);
        
        // Send admin notification for manual verification
        await emailService.sendAdminNotification(
            'Bank Transfer Payment Pending',
            `Order #${order.orderNumber} is awaiting bank transfer payment. Amount: $${order.totalAmount.toFixed(2)}`
        );
        
        return {
            success: true,
            paymentStatus: 'pending',
            orderStatus: 'pending_payment',
            message: 'Bank transfer instructions sent. Order will be processed once payment is confirmed.'
        };
    } catch (error) {
        console.error('Bank transfer processing error:', error);
        return {
            success: false,
            message: error.message
        };
    }
}

// PayPal payment (simplified)
async function processPayPalPayment(order) {
    try {
        // In a real implementation, integrate with PayPal API
        // This is a simplified version
        return {
            success: true,
            transactionId: `PAYPAL-${Date.now()}`,
            paymentStatus: 'succeeded',
            orderStatus: 'processing'
        };
    } catch (error) {
        console.error('PayPal payment error:', error);
        return {
            success: false,
            message: error.message
        };
    }
}

// Create Stripe payment intent
router.post('/create-payment-intent', requireAuth, async (req, res) => {
    try {
        const cart = req.session.cart || [];
        
        if (cart.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Cart is empty'
            });
        }
        
        const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const shipping = req.session.shipping?.cost || 0;
        const discount = req.session.discount?.amount || 0;
        const tax = subtotal * 0.08;
        const total = subtotal + shipping + tax - discount;
        
        // Create Stripe payment intent
        const paymentIntent = await stripe.paymentIntents.create({
            amount: Math.round(total * 100), // Convert to cents
            currency: 'usd',
            metadata: {
                userId: req.session.user._id,
                orderNumber: `ROI-${Date.now()}`
            }
        });
        
        res.json({
            success: true,
            clientSecret: paymentIntent.client_secret,
            paymentIntentId: paymentIntent.id
        });
        
    } catch (error) {
        console.error('Create payment intent error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create payment intent'
        });
    }
});

// Order confirmation page
router.get('/confirmation/:orderId', requireAuth, async (req, res) => {
    try {
        const order = await Order.findById(req.params.orderId);
        
        if (!order) {
            req.flash('error', 'Order not found');
            return res.redirect('/account/orders');
        }
        
        // Check if user owns this order
        if (order.userId.toString() !== req.session.user._id && !req.session.user.isAdmin) {
            req.flash('error', 'Access denied');
            return res.redirect('/account/orders');
        }
        
        res.render('order-confirmation', {
            title: 'Order Confirmation',
            order,
            user: req.session.user
        });
        
    } catch (error) {
        console.error('Order confirmation error:', error);
        req.flash('error', 'Failed to load order confirmation');
        res.redirect('/account/orders');
    }
});

// Bank transfer instructions page
router.get('/bank-transfer/:orderId', requireAuth, async (req, res) => {
    try {
        const order = await Order.findById(req.params.orderId);
        
        if (!order) {
            req.flash('error', 'Order not found');
            return res.redirect('/account/orders');
        }
        
        if (order.userId.toString() !== req.session.user._id) {
            req.flash('error', 'Access denied');
            return res.redirect('/account/orders');
        }
        
        if (order.paymentMethod !== 'bank-transfer') {
            req.flash('error', 'This order is not a bank transfer order');
            return res.redirect(`/order/confirmation/${order._id}`);
        }
        
        res.render('bank-transfer-instructions', {
            title: 'Bank Transfer Instructions',
            order,
            user: req.session.user
        });
        
    } catch (error) {
        console.error('Bank transfer instructions error:', error);
        req.flash('error', 'Failed to load instructions');
        res.redirect('/account/orders');
    }
});

// Webhook for Stripe payments
router.post('/webhook/stripe', express.raw({type: 'application/json'}), async (req, res) => {
    const sig = req.headers['stripe-signature'];
    let event;
    
    try {
        event = stripe.webhooks.constructEvent(
            req.body,
            sig,
            process.env.STRIPE_WEBHOOK_SECRET
        );
    } catch (err) {
        console.error('Webhook signature verification failed:', err.message);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }
    
    // Handle the event
    switch (event.type) {
        case 'payment_intent.succeeded':
            const paymentIntent = event.data.object;
            await handleSuccessfulPayment(paymentIntent);
            break;
            
        case 'payment_intent.payment_failed':
            const failedPayment = event.data.object;
            await handleFailedPayment(failedPayment);
            break;
            
        default:
            console.log(`Unhandled event type ${event.type}`);
    }
    
    res.json({received: true});
});

async function handleSuccessfulPayment(paymentIntent) {
    try {
        const orderNumber = paymentIntent.metadata.orderNumber;
        const order = await Order.findOne({ orderNumber });
        
        if (order) {
            order.paymentStatus = 'succeeded';
            order.status = 'processing';
            order.paidAt = new Date();
            order.transactionId = paymentIntent.id;
            await order.save();
            
            // Send confirmation email
            const user = await User.findById(order.userId);
            if (user) {
                await emailService.sendOrderConfirmation(order, user);
            }
            
            console.log(`✅ Payment succeeded for order ${orderNumber}`);
        }
    } catch (error) {
        console.error('Handle successful payment error:', error);
    }
}

async function handleFailedPayment(paymentIntent) {
    try {
        const orderNumber = paymentIntent.metadata.orderNumber;
        const order = await Order.findOne({ orderNumber });
        
        if (order) {
            order.paymentStatus = 'failed';
            order.status = 'cancelled';
            await order.save();
            
            console.log(`❌ Payment failed for order ${orderNumber}`);
        }
    } catch (error) {
        console.error('Handle failed payment error:', error);
    }
}

module.exports = router;