// controllers/reviewsController.js - Updated for Mongoose
const Review = require('../models/review');
const Product = require('../models/product');

exports.createReview = async (req, res) => {
    try {
        const { productId } = req.params;
        const { rating, comment, userId } = req.body;
        
        // Validation
        if (!rating || !comment || !userId) {
            return res.status(400).json({ error: 'Missing required fields' });
        }
        
        // Check if product exists
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }
        
        // Create review
        const review = new Review({
            product: productId,
            user: userId,
            rating,
            comment
        });
        
        await review.save();
        
        res.status(201).json({
            message: 'Review created successfully',
            reviewId: review._id
        });
    } catch (error) {
        console.error('Error creating review:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

exports.getProductReviews = async (req, res) => {
    try {
        const { productId } = req.params;
        
        const reviews = await Review.find({ product: productId })
            .populate('user', 'name email')
            .sort({ createdAt: -1 });
        
        res.json({ 
            success: true, 
            reviews 
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};