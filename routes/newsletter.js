const express = require('express');
const router = express.Router();
const User = require('../models/user');
const NewsletterSubscriber = require('../models/NewsletterSubscriber');
const emailService = require('../utils/emailService');

// Subscribe to newsletter
router.post('/subscribe', async (req, res) => {
    try {
        const { email, name } = req.body;
        
        if (!email) {
            return res.status(400).json({
                success: false,
                message: 'Email is required'
            });
        }
        
        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({
                success: false,
                message: 'Please enter a valid email address'
            });
        }
        
        // Check if already subscribed as a user
        const existingUser = await User.findOne({ 
            email,
            newsletterSubscribed: true 
        });
        
        if (existingUser) {
            return res.json({
                success: true,
                message: 'You are already subscribed to our newsletter!'
            });
        }
        
        // Check if already in newsletter subscribers
        const existingSubscriber = await NewsletterSubscriber.findOne({ email });
        
        if (existingSubscriber) {
            if (existingSubscriber.status === 'active') {
                return res.json({
                    success: true,
                    message: 'You are already subscribed to our newsletter!'
                });
            } else {
                // Reactivate
                existingSubscriber.status = 'active';
                existingSubscriber.name = name || existingSubscriber.name;
                existingSubscriber.subscribedAt = new Date();
                await existingSubscriber.save();
            }
        } else {
            // Create new subscriber
            const subscriber = new NewsletterSubscriber({
                email,
                name: name || '',
                source: 'website',
                status: 'active'
            });
            
            await subscriber.save();
        }
        
        // Send welcome email
        await emailService.sendNewsletterWelcome(email, name);
        
        res.json({
            success: true,
            message: 'Successfully subscribed to our newsletter!'
        });
        
    } catch (error) {
        console.error('Newsletter subscription error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to subscribe. Please try again.'
        });
    }
});

// Unsubscribe from newsletter
router.get('/unsubscribe', async (req, res) => {
    try {
        const { email, token } = req.query;
        
        if (!email) {
            return res.status(400).render('newsletter/unsubscribe-error', {
                title: 'Unsubscribe Error',
                message: 'Email address is required'
            });
        }
        
        // Find and update user
        const user = await User.findOne({ email });
        if (user) {
            user.newsletterSubscribed = false;
            await user.save();
        }
        
        // Find and update newsletter subscriber
        const subscriber = await NewsletterSubscriber.findOne({ email });
        if (subscriber) {
            subscriber.status = 'unsubscribed';
            subscriber.unsubscribedAt = new Date();
            await subscriber.save();
        }
        
        res.render('newsletter/unsubscribe-success', {
            title: 'Unsubscribed Successfully',
            email
        });
        
    } catch (error) {
        console.error('Unsubscribe error:', error);
        res.render('newsletter/unsubscribe-error', {
            title: 'Unsubscribe Error',
            message: 'Failed to unsubscribe. Please try again or contact support.'
        });
    }
});

// Send newsletter (admin only)
router.post('/send', async (req, res) => {
    try {
        // In production, add admin authentication
        const { subject, content, segment } = req.body;
        
        if (!subject || !content) {
            return res.status(400).json({
                success: false,
                message: 'Subject and content are required'
            });
        }
        
        // Get subscribers based on segment
        let query = { status: 'active' };
        
        if (segment === 'users') {
            // Send to registered users only
            const users = await User.find({ 
                newsletterSubscribed: true,
                emailVerified: true
            }).select('email name');
            
            const emails = users.map(user => user.email);
            
            // Send newsletter
            const result = await emailService.sendBulkEmails(
                emails,
                subject,
                content
            );
            
            // Log the campaign
            await NewsletterCampaign.create({
                subject,
                content,
                segment,
                sentTo: result.success,
                failed: result.failed,
                sentAt: new Date()
            });
            
            return res.json({
                success: true,
                message: `Newsletter sent to ${result.success} users`,
                stats: result
            });
            
        } else {
            // Send to all subscribers
            const subscribers = await NewsletterSubscriber.find(query);
            const emails = subscribers.map(sub => sub.email);
            
            // Send newsletter
            const result = await emailService.sendBulkEmails(
                emails,
                subject,
                content
            );
            
            // Log the campaign
            await NewsletterCampaign.create({
                subject,
                content,
                segment: 'all',
                sentTo: result.success,
                failed: result.failed,
                sentAt: new Date()
            });
            
            return res.json({
                success: true,
                message: `Newsletter sent to ${result.success} subscribers`,
                stats: result
            });
        }
        
    } catch (error) {
        console.error('Send newsletter error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to send newsletter'
        });
    }
});

// Get newsletter analytics
router.get('/analytics', async (req, res) => {
    try {
        // In production, add admin authentication
        
        // Get total subscribers
        const totalSubscribers = await NewsletterSubscriber.countDocuments({ 
            status: 'active' 
        });
        
        const totalUsers = await User.countDocuments({ 
            newsletterSubscribed: true 
        });
        
        // Get subscription growth (last 30 days)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        
        const newSubscribers = await NewsletterSubscriber.countDocuments({
            status: 'active',
            subscribedAt: { $gte: thirtyDaysAgo }
        });
        
        // Get unsubscription rate
        const totalUnsubscribed = await NewsletterSubscriber.countDocuments({
            status: 'unsubscribed'
        });
        
        const unsubscriptionRate = totalSubscribers > 0 
            ? (totalUnsubscribed / (totalSubscribers + totalUnsubscribed)) * 100 
            : 0;
        
        // Get recent campaigns
        const recentCampaigns = await NewsletterCampaign.find()
            .sort({ sentAt: -1 })
            .limit(5);
        
        res.json({
            success: true,
            analytics: {
                totalSubscribers,
                totalUsers,
                newSubscribers,
                unsubscriptionRate: unsubscriptionRate.toFixed(2),
                recentCampaigns
            }
        });
        
    } catch (error) {
        console.error('Get analytics error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to load analytics'
        });
    }
});

module.exports = router;