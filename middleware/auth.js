const jwt = require('jsonwebtoken');
const User = require('../models/user');

const protect = async (req, res, next) => {
    try {
        let token;

        // Check for token in header
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        }

        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Not authorized to access this route'
            });
        }

        try {
            // Verify token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            
            // Get user from token
            req.user = await User.findById(decoded.userId).select('-password');
            
            if (!req.user) {
                return res.status(401).json({
                    success: false,
                    message: 'User not found'
                });
            }
            
            next();
        } catch (error) {
            return res.status(401).json({
                success: false,
                message: 'Not authorized to access this route'
            });
        }
    } catch (error) {
        next(error);
    }
};

// Add these missing middleware functions
const requireAuth = (req, res, next) => {
    // This is a simplified version - using session instead of JWT
    // You might need to adapt this based on your actual auth setup
    if (!req.session || !req.session.user) {
        return res.status(401).json({
            success: false,
            message: 'Authentication required'
        });
    }
    req.user = req.session.user;
    next();
};

const requireVerifiedEmail = (req, res, next) => {
    // Check if email is verified
    if (!req.user || !req.user.isEmailVerified) {
        return res.status(403).json({
            success: false,
            message: 'Email verification required'
        });
    }
    next();
};

module.exports = { 
    protect,
    requireAuth, 
    requireVerifiedEmail 
};