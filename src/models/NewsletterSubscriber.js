const mongoose = require('mongoose');

const newsletterSubscriberSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    name: String,
    source: {
        type: String,
        enum: ['website', 'checkout', 'manual', 'import'],
        default: 'website'
    },
    status: {
        type: String,
        enum: ['active', 'unsubscribed', 'bounced'],
        default: 'active'
    },
    subscribedAt: {
        type: Date,
        default: Date.now
    },
    unsubscribedAt: Date,
    lastEmailed: Date,
    preferences: {
        skincareTips: { type: Boolean, default: true },
        promotions: { type: Boolean, default: true },
        newProducts: { type: Boolean, default: true }
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('NewsletterSubscriber', newsletterSubscriberSchema);