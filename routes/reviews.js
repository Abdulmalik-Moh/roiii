const express = require('express');
const router = express.Router();
const Review = require('../models/review');
const Product = require('../models/product');
const { requireAuth, requireVerifiedEmail } = require('../middleware/auth');

// Get reviews for a product
router.get('/product/:productId', async (req, res) => {
    try {
        const { page = 1, limit = 10, sort = 'newest' } = req.query;
        const skip = (page - 1) * limit;
        
        let sortOption = { createdAt: -1 };
        if (sort === 'highest') sortOption = { rating: -1 };
        if (sort === 'lowest') sortOption = { rating: 1 };
        if (sort === 'most-helpful') sortOption = { helpfulCount: -1 };
        
        const reviews = await Review.find({ 
            product: req.params.productId,
            isApproved: true 
        })
        .populate('user', 'name profileImage')
        .skip(skip)
        .limit(parseInt(limit))
        .sort(sortOption);
        
        const totalReviews = await Review.countDocuments({ 
            product: req.params.productId,
            isApproved: true 
        });
        
        // Calculate average rating
        const ratingStats = await Review.aggregate([
            { $match: { product: req.params.productId, isApproved: true } },
            { 
                $group: {
                    _id: '$product',
                    averageRating: { $avg: '$rating' },
                    totalReviews: { $sum: 1 },
                    ratingCounts: {
                        $push: '$rating'
                    }
                }
            }
        ]);
        
        // Calculate rating distribution
        const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
        reviews.forEach(review => {
            if (distribution[review.rating] !== undefined) {
                distribution[review.rating]++;
            }
        });
        
        res.json({
            success: true,
            reviews,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                totalPages: Math.ceil(totalReviews / limit),
                totalReviews
            },
            stats: ratingStats[0] || {
                averageRating: 0,
                totalReviews: 0
            },
            distribution
        });
        
    } catch (error) {
        console.error('Get reviews error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to load reviews'
        });
    }
});

// Submit a review
router.post('/submit', requireAuth, requireVerifiedEmail, async (req, res) => {
    try {
        const { productId, rating, comment, title } = req.body;
        const userId = req.session.user._id;
        
        // Validation
        if (!productId || !rating || !comment) {
            return res.status(400).json({
                success: false,
                message: 'Product ID, rating, and comment are required'
            });
        }
        
        if (rating < 1 || rating > 5) {
            return res.status(400).json({
                success: false,
                message: 'Rating must be between 1 and 5'
            });
        }
        
        // Check if product exists
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }
        
        // Check if user has purchased this product
        // In a real implementation, check order history
        // For now, we'll allow all verified users to review
        
        // Check for existing review
        const existingReview = await Review.findOne({
            user: userId,
            product: productId
        });
        
        if (existingReview) {
            return res.status(400).json({
                success: false,
                message: 'You have already reviewed this product'
            });
        }
        
        // Create review
        const review = new Review({
            user: userId,
            product: productId,
            rating: parseInt(rating),
            comment: comment.trim(),
            title: title?.trim(),
            isVerified: true, // In production, mark as verified only if user purchased
            isApproved: true // Auto-approve for now, could require admin approval
        });
        
        await review.save();
        
        // Update product rating
        await updateProductRating(productId);
        
        res.json({
            success: true,
            message: 'Review submitted successfully!',
            review: {
                _id: review._id,
                rating: review.rating,
                comment: review.comment,
                title: review.title,
                createdAt: review.createdAt,
                user: {
                    name: req.session.user.name,
                    profileImage: req.session.user.profileImage
                }
            }
        });
        
    } catch (error) {
        console.error('Submit review error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to submit review'
        });
    }
});

// Update a review
router.put('/:reviewId', requireAuth, async (req, res) => {
    try {
        const { rating, comment, title } = req.body;
        const userId = req.session.user._id;
        
        const review = await Review.findOne({
            _id: req.params.reviewId,
            user: userId
        });
        
        if (!review) {
            return res.status(404).json({
                success: false,
                message: 'Review not found or access denied'
            });
        }
        
        // Update review
        if (rating !== undefined) review.rating = parseInt(rating);
        if (comment !== undefined) review.comment = comment.trim();
        if (title !== undefined) review.title = title.trim();
        
        review.updatedAt = new Date();
        await review.save();
        
        // Update product rating
        await updateProductRating(review.product);
        
        res.json({
            success: true,
            message: 'Review updated successfully',
            review
        });
        
    } catch (error) {
        console.error('Update review error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update review'
        });
    }
});

// Delete a review
router.delete('/:reviewId', requireAuth, async (req, res) => {
    try {
        const userId = req.session.user._id;
        
        const review = await Review.findOne({
            _id: req.params.reviewId,
            user: userId
        });
        
        if (!review) {
            return res.status(404).json({
                success: false,
                message: 'Review not found or access denied'
            });
        }
        
        const productId = review.product;
        await review.deleteOne();
        
        // Update product rating
        await updateProductRating(productId);
        
        res.json({
            success: true,
            message: 'Review deleted successfully'
        });
        
    } catch (error) {
        console.error('Delete review error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete review'
        });
    }
});

// Mark review as helpful
router.post('/:reviewId/helpful', requireAuth, async (req, res) => {
    try {
        const review = await Review.findById(req.params.reviewId);
        
        if (!review) {
            return res.status(404).json({
                success: false,
                message: 'Review not found'
            });
        }
        
        // Check if user already marked as helpful
        const userId = req.session.user._id.toString();
        if (review.helpfulUsers.includes(userId)) {
            return res.status(400).json({
                success: false,
                message: 'You have already marked this review as helpful'
            });
        }
        
        review.helpfulCount += 1;
        review.helpfulUsers.push(userId);
        await review.save();
        
        res.json({
            success: true,
            message: 'Marked as helpful',
            helpfulCount: review.helpfulCount
        });
        
    } catch (error) {
        console.error('Mark helpful error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to mark review as helpful'
        });
    }
});

// Report a review
router.post('/:reviewId/report', requireAuth, async (req, res) => {
    try {
        const { reason } = req.body;
        const userId = req.session.user._id;
        
        const review = await Review.findById(req.params.reviewId);
        
        if (!review) {
            return res.status(404).json({
                success: false,
                message: 'Review not found'
            });
        }
        
        // Check if user already reported
        if (review.reportedBy.includes(userId)) {
            return res.status(400).json({
                success: false,
                message: 'You have already reported this review'
            });
        }
        
        review.reportedBy.push(userId);
        review.reportCount += 1;
        
        // Store report reason
        review.reports.push({
            userId,
            reason,
            reportedAt: new Date()
        });
        
        await review.save();
        
        // Send admin notification
        const emailService = require('../utils/emailService');
        await emailService.sendAdminNotification(
            'Review Reported',
            `Review ${review._id} has been reported by user ${req.session.user.name}. Reason: ${reason}`
        );
        
        res.json({
            success: true,
            message: 'Review reported. Our team will review it shortly.'
        });
        
    } catch (error) {
        console.error('Report review error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to report review'
        });
    }
});

// Get user's reviews
router.get('/my-reviews', requireAuth, async (req, res) => {
    try {
        const { page = 1, limit = 10 } = req.query;
        const skip = (page - 1) * limit;
        const userId = req.session.user._id;
        
        const reviews = await Review.find({ user: userId })
            .populate('product', 'name images price')
            .skip(skip)
            .limit(parseInt(limit))
            .sort({ createdAt: -1 });
        
        const totalReviews = await Review.countDocuments({ user: userId });
        
        res.json({
            success: true,
            reviews,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                totalPages: Math.ceil(totalReviews / limit),
                totalReviews
            }
        });
        
    } catch (error) {
        console.error('Get user reviews error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to load your reviews'
        });
    }
});

// Helper function to update product rating
async function updateProductRating(productId) {
    try {
        const stats = await Review.aggregate([
            { $match: { product: productId, isApproved: true } },
            { 
                $group: {
                    _id: '$product',
                    averageRating: { $avg: '$rating' },
                    totalReviews: { $sum: 1 }
                }
            }
        ]);
        
        if (stats.length > 0) {
            await Product.findByIdAndUpdate(productId, {
                rating: parseFloat(stats[0].averageRating.toFixed(1)),
                numReviews: stats[0].totalReviews
            });
        }
    } catch (error) {
        console.error('Update product rating error:', error);
    }
}

module.exports = router;