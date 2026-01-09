const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    productId: {
        type: Number,
        unique: true,
        required: true,
        index: true
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true,
        min: 0,
        default: 0
    },
    image: {
        type: String,
        default: 'image curology.jpeg'
    },
    category: {
        type: String,
        required: true,
        enum: ['cleansers', 'serums', 'moisturizers', 'masks', 'eye-care', 'toners', 'sunscreen', 'treatment']
    },
    skinType: [{
        type: String,
        enum: ['dry', 'oily', 'combination', 'sensitive', 'normal', 'all', 'mature']
    }],
    badge: {
        type: String,
        enum: ['Bestseller', 'New', 'Sale', ''],
        default: ''
    },
    originalPrice: {
        type: Number,
        min: 0
    },
    isFeatured: {
        type: Boolean,
        default: false
    },
    inStock: {
        type: Boolean,
        default: true
    },
    stockQuantity: {
        type: Number,
        default: 10,
        min: 0
    },
    ingredients: {
        type: String,
        default: ''
    },
    sizes: [{
        size: String,
        price: Number,
        selected: Boolean
    }],
    rating: {
        type: Number,
        default: 0,
        min: 0,
        max: 5
    },
    numReviews: {
        type: Number,
        default: 0
    },
    lowStockThreshold: {
        type: Number,
        default: 5
    }
}, {
    timestamps: true,
    // Disable the default _id
    id: false
});

// Don't use virtuals, they're causing issues
// Instead add a method to transform the data

productSchema.methods.toCleanObject = function() {
    const obj = this.toObject();
    return {
        id: obj.productId,
        productId: obj.productId,
        name: obj.name,
        description: obj.description,
        price: obj.price,
        image: obj.image,
        category: obj.category,
        skinType: obj.skinType,
        badge: obj.badge,
        originalPrice: obj.originalPrice,
        isFeatured: obj.isFeatured,
        inStock: obj.inStock,
        stockQuantity: obj.stockQuantity,
        ingredients: obj.ingredients,
        sizes: obj.sizes || [],
        rating: obj.rating,
        numReviews: obj.numReviews,
        lowStockThreshold: obj.lowStockThreshold,
        isLowStock: obj.stockQuantity <= obj.lowStockThreshold,
        createdAt: obj.createdAt,
        updatedAt: obj.updatedAt
    };
};

// Indexes
productSchema.index({ productId: 1 });
productSchema.index({ category: 1, skinType: 1 });
productSchema.index({ isFeatured: 1 });
productSchema.index({ name: 'text', description: 'text' });

const Product = mongoose.model('Product', productSchema);

module.exports = Product;