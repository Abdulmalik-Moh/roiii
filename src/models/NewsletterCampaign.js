const mongoose = require('mongoose');

const newsletterCampaignSchema = new mongoose.Schema({
    subject: {
        type: String,
        required: true
    },
    content: {
        type: String,
        required: true
    },
    segment: {
        type: String,
        enum: ['all', 'users', 'subscribers', 'specific'],
        default: 'all'
    },
    sentTo: Number,
    failed: Number,
    opened: {
        type: Number,
        default: 0
    },
    clicked: {
        type: Number,
        default: 0
    },
    sentBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    sentAt: {
        type: Date,
        default: Date.now
    },
    status: {
        type: String,
        enum: ['draft', 'scheduled', 'sending', 'sent', 'failed'],
        default: 'draft'
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('NewsletterCampaign', newsletterCampaignSchema);