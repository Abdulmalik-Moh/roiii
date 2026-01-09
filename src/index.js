
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();

// Simple CORS configuration - this should work
app.use(cors({
  origin: '*', // Allow all origins in development
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Parse JSON bodies
app.use(express.json());

// Simple request logging
app.use((req, res, next) => {
    console.log(`${req.method} ${req.url} - Origin: ${req.headers.origin || 'no-origin'}`);
    next();
});

// Health check
app.get('/api/health', (req, res) => {
    res.json({ success: true, message: 'Server is running!' });
});

// Import routes
const productsRouter = require('./routes/products');
const authRouter = require('./routes/auth');
const paymentRouter = require('./routes/stripe');
const ordersRouter = require('./routes/orders');
const reviewsRouter = require('./routes/reviews');
const adminRouter = require('./routes/admin');
const contactRouter = require('./routes/contact');

// Use routes
app.use('/api/products', productsRouter);
app.use('/api/auth', authRouter);
app.use('/api/payment', paymentRouter);
app.use('/api/orders', ordersRouter);
app.use('/api/reviews', reviewsRouter);
app.use('/api/admin', adminRouter);
app.use('/api/contact', contactRouter);

// Add this route to index.js after other routes
app.get('/api/setup', async (req, res) => {
    try {
        // Setup sample products
        const setupResponse = await fetch('http://localhost:3000/api/products/reset-sample', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        });
        
        const setupData = await setupResponse.json();
        
        res.json({
            success: true,
            message: 'Setup completed',
            products: setupData
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Setup failed',
            error: error.message
        });
    }
});

app.post('/api/newsletter/subscribe', (req, res) => {
    try {
        const { email } = req.body;
        
        if (!email) {
            return res.status(400).json({ 
                success: false, 
                message: 'Email is required' 
            });
        }
        
        console.log('📧 Newsletter subscription:', email);
        
        res.json({ 
            success: true, 
            message: 'Subscribed to newsletter successfully!' 
        });
        
    } catch (error) {
        console.error('Newsletter error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Subscription failed' 
        });
    }
});

// Serve admin login page
app.get('/admin-login.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'admin-login.html'));
});

// Serve admin panel (actual auth is handled by frontend)
app.get('/admin-panel.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'admin-panel.html'));
});

// Custom 404 for API routes - FIXED: Use regex instead of wildcard
app.use('/api', (req, res) => {
    res.status(404).json({
        success: false,
        message: `API endpoint not found: ${req.method} ${req.originalUrl}`
    });
});

// Serve static files
app.use(express.static('public'));

// Serve index.html for all non-API routes - FIXED: Use regex pattern
app.get(/^\/(?!api\/).*/, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// MongoDB connection with your Atlas connection string
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://scentsbyroi:Scentsbyroi@cluster0.pcx1iig.mongodb.net/roibeauty?retryWrites=true&w=majority';

mongoose.connect(MONGODB_URI)
    .then(() => {
        console.log('✅ MongoDB connected to Atlas');
        const PORT = process.env.PORT || 3000;
        app.listen(PORT, () => {
            console.log(`🚀 Server running on http://localhost:${PORT}`);
            console.log(`📊 MongoDB Atlas: Connected to roibeauty database`);
            console.log(`🌐 CORS enabled for all origins (*)`);
        });
    })
    .catch(err => {
        console.error('❌ MongoDB connection failed:', err);
        process.exit(1);
    });

module.exports = app;
