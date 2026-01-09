// products.js - COMPLETE FIXED VERSION
const express = require('express');
const router = express.Router();
const Product = require('../models/product');

// Helper function to transform product
function cleanProduct(product) {
    if (!product) return null;
    
    const obj = product.toObject ? product.toObject() : product;
    
    return {
        id: obj.productId,
        productId: obj.productId,
        name: obj.name,
        description: obj.description,
        price: obj.price,
        image: obj.image,
        category: obj.category,
        skinType: obj.skinType || [],
        badge: obj.badge || '',
        originalPrice: obj.originalPrice,
        isFeatured: obj.isFeatured || false,
        inStock: obj.inStock !== false,
        stockQuantity: obj.stockQuantity || 0,
        ingredients: obj.ingredients || '',
        sizes: obj.sizes || [],
        rating: obj.rating || 0,
        numReviews: obj.numReviews || 0,
        lowStockThreshold: obj.lowStockThreshold || 5,
        isLowStock: (obj.stockQuantity || 0) <= (obj.lowStockThreshold || 5),
        createdAt: obj.createdAt,
        updatedAt: obj.updatedAt
    };
}

// GET /api/products - Get all products
router.get('/', async (req, res) => {
    try {
        const { category, skinType, priceRange, search, page = 1, limit = 12 } = req.query;
        
        console.log('📦 Received query params:', { category, skinType, priceRange, search, page, limit });
        
        let filter = {};
        
        // Debug: Check what's in the database
        const totalCount = await Product.countDocuments({});
        console.log(`📊 Total products in DB: ${totalCount}`);
        
        if (category && category !== 'all') {
            filter.category = category;
            console.log(`🔍 Filtering by category: ${category}`);
        }
        
        if (skinType && skinType !== 'all') {
            filter.skinType = skinType;
            console.log(`🔍 Filtering by skinType: ${skinType}`);
        }
        
        if (priceRange && priceRange !== 'all') {
            switch (priceRange) {
                case 'under20': 
                    filter.price = { $lt: 20 }; 
                    console.log(`🔍 Filtering by price: under 20`);
                    break;
                case '20to40': 
                    filter.price = { $gte: 20, $lte: 40 }; 
                    console.log(`🔍 Filtering by price: 20 to 40`);
                    break;
                case 'over40': 
                    filter.price = { $gt: 40 }; 
                    console.log(`🔍 Filtering by price: over 40`);
                    break;
            }
        }
        
        if (search && search.trim() !== '') {
            filter.$or = [
                { name: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } }
            ];
            console.log(`🔍 Searching for: ${search}`);
        }
        
        console.log('🔍 Final filter:', filter);
        
        const products = await Product.find(filter)
            .limit(parseInt(limit))
            .skip((parseInt(page) - 1) * parseInt(limit))
            .sort({ createdAt: -1 });
        
        const total = await Product.countDocuments(filter);
        
        console.log(`✅ Found ${products.length} products (total matching: ${total})`);
        
        // Clean all products
        const cleanedProducts = products.map(cleanProduct);
        
        res.json({
            success: true,
            data: cleanedProducts,
            totalPages: Math.ceil(total / parseInt(limit)),
            currentPage: parseInt(page),
            total
        });
        
    } catch (error) {
        console.error('❌ Error fetching products:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching products',
            error: error.message
        });
    }
});

// GET /api/products/featured
router.get('/featured', async (req, res) => {
    try {
        let featuredProducts = await Product.find({ isFeatured: true }).limit(8);
        
        if (featuredProducts.length < 4) {
            const additionalProducts = await Product.find({
                productId: { $nin: featuredProducts.map(p => p.productId) }
            })
            .sort({ createdAt: -1 })
            .limit(8 - featuredProducts.length);
            
            featuredProducts = [...featuredProducts, ...additionalProducts];
        }
        
        const cleanedProducts = featuredProducts.map(cleanProduct);
        
        res.json({
            success: true,
            data: cleanedProducts
        });
    } catch (error) {
        console.error('❌ Error fetching featured products:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching featured products',
            error: error.message
        });
    }
});

// GET /api/products/:id
router.get('/:id', async (req, res) => {
    try {
        const productId = req.params.id;
        const numericId = parseInt(productId);
        
        if (isNaN(numericId)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid product ID'
            });
        }
        
        let product = await Product.findOne({ productId: numericId });
        
        if (!product) {
            return res.json({
                success: true,
                product: {
                    id: numericId,
                    productId: numericId,
                    name: "Sample Product",
                    description: "Product not found",
                    price: 0,
                    image: "image curology.jpeg",
                    category: "serums",
                    skinType: ["all"],
                    stockQuantity: 0,
                    ingredients: "",
                    sizes: [],
                    rating: 0,
                    numReviews: 0
                }
            });
        }
        
        const cleanedProduct = cleanProduct(product);
        
        res.json({
            success: true,
            product: cleanedProduct
        });
        
    } catch (error) {
        console.error('❌ Error fetching product:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching product',
            error: error.message
        });
    }
});

// ✅ ADD THIS: GET /api/products/:id/reviews
router.get('/:id/reviews', async (req, res) => {
    try {
        const productId = parseInt(req.params.id);
        
        // For now, return empty reviews array
        res.json({
            success: true,
            reviews: [],
            productId: productId
        });
    } catch (error) {
        console.error('❌ Error fetching reviews:', error);
        res.json({
            success: true,
            reviews: []
        });
    }
});

// GET /api/products/check-db - Check database status
router.get('/check-db', async (req, res) => {
    try {
        const count = await Product.countDocuments({});
        const allProducts = await Product.find({});
        
        res.json({
            success: true,
            totalProducts: count,
            products: allProducts.map(p => ({
                productId: p.productId,
                name: p.name,
                category: p.category,
                price: p.price,
                inStock: p.inStock
            }))
        });
        
    } catch (error) {
        console.error('❌ Check DB error:', error);
        res.status(500).json({
            success: false,
            message: 'Check DB failed',
            error: error.message
        });
    }
});

// POST /api/products/reset-sample
router.post('/reset-sample', async (req, res) => {
    try {
        console.log('🔄 Starting product reset...');
        
        // First, check what's currently in the database
        const existingCount = await Product.countDocuments({});
        console.log(`📊 Current products in DB: ${existingCount}`);
        
        // Delete ALL products
        const deleteResult = await Product.deleteMany({});
        console.log(`🗑️  Deleted ${deleteResult.deletedCount} products`);
        
        // CREATE ALL 8 PRODUCTS 
        const sampleProducts = [
            {
                productId: 1,
                name: "Hydrating Vitamin C Serum",
                description: "Brightens skin tone and reduces dark spots with natural vitamin C extract",
                price: 29.99,
                image: "image curology.jpeg",
                category: "serums",
                skinType: ["dry", "combination", "sensitive"],
                badge: "Bestseller",
                stockQuantity: 10,
                ingredients: "Vitamin C, Hyaluronic Acid, Ferulic Acid",
                isFeatured: true,
                rating: 4.5,
                numReviews: 24
            },
            {
                productId: 2,
                name: "Nourishing Face Moisturizer",
                description: "Deeply hydrates and restores skin barrier with hyaluronic acid and ceramides",
                price: 24.99,
                image: "image curology.jpeg",
                category: "moisturizers",
                skinType: ["dry", "sensitive"],
                badge: "New",
                stockQuantity: 15,
                ingredients: "Ceramides, Hyaluronic Acid, Niacinamide",
                isFeatured: true,
                rating: 4.3,
                numReviews: 18
            },
            {
                productId: 3,
                name: "Gentle Foaming Cleanser",
                description: "Removes impurities without stripping natural oils, suitable for all skin types",
                price: 18.99,
                image: "image curology.jpeg",
                category: "cleansers",
                skinType: ["dry", "oily", "combination", "sensitive"],
                stockQuantity: 20,
                ingredients: "Aloe Vera, Green Tea, Chamomile",
                rating: 4.7,
                numReviews: 32
            },
            {
                productId: 4,
                name: "Revitalizing Eye Cream",
                description: "Reduces puffiness and dark circles with caffeine and peptide complex",
                price: 22.99,
                originalPrice: 27.99,
                image: "image curology.jpeg",
                category: "eye-care",
                skinType: ["dry", "combination", "sensitive"],
                stockQuantity: 8,
                ingredients: "Caffeine, Peptides, Vitamin K",
                isFeatured: true,
                rating: 4.4,
                numReviews: 15
            },
            {
                productId: 5,
                name: "Detoxifying Clay Mask",
                description: "Deep cleanses pores and absorbs excess oil with natural clay minerals",
                price: 19.99,
                image: "image curology.jpeg",
                category: "masks",
                skinType: ["oily", "combination"],
                stockQuantity: 12,
                ingredients: "Bentonite Clay, Charcoal, Tea Tree Oil",
                rating: 4.6,
                numReviews: 21
            },
            {
                productId: 6,
                name: "Hydrating Facial Mist",
                description: "Instantly refreshes and hydrates skin with rosewater and aloe vera",
                price: 16.99,
                image: "image curology.jpeg",
                category: "serums",
                skinType: ["dry", "sensitive"],
                stockQuantity: 25,
                ingredients: "Rosewater, Aloe Vera, Glycerin",
                rating: 4.2,
                numReviews: 12
            },
            {
                productId: 7,
                name: "Brightening Toner",
                description: "Balances pH and improves skin texture with natural fruit extracts",
                price: 21.99,
                image: "image curology.jpeg",
                category: "cleansers",
                skinType: ["dry", "combination", "sensitive"],
                stockQuantity: 18,
                ingredients: "Glycolic Acid, Witch Hazel, Vitamin C",
                rating: 4.5,
                numReviews: 19
            },
            {
                productId: 8,
                name: "Overnight Repair Cream",
                description: "Intensive nighttime treatment that repairs skin while you sleep",
                price: 34.99,
                image: "image curology.jpeg",
                category: "moisturizers",
                skinType: ["dry", "sensitive"],
                badge: "New",
                stockQuantity: 6,
                ingredients: "Retinol, Ceramides, Peptides",
                isFeatured: true,
                rating: 4.8,
                numReviews: 28
            }
        ];

        console.log(`📝 Attempting to insert ${sampleProducts.length} products...`);
        
        // Insert ALL products
        const createdProducts = await Product.insertMany(sampleProducts, { ordered: false });
        console.log(`✅ Created ${createdProducts.length} products`);
        
        // Verify insertion
        const newCount = await Product.countDocuments({});
        console.log(`📊 New total products in DB: ${newCount}`);
        
        // List all inserted products
        const allProducts = await Product.find({});
        console.log('📋 Inserted products:', allProducts.map(p => ({ 
            productId: p.productId, 
            name: p.name 
        })));
        
        // Clean the response
        const cleanedProducts = createdProducts.map(cleanProduct);
        
        res.json({
            success: true,
            message: `Reset and created ${createdProducts.length} sample products`,
            insertedCount: createdProducts.length,
            totalInDB: newCount,
            data: cleanedProducts
        });
    } catch (error) {
        console.error('❌ Error resetting products:', error);
        
        // Check if it's a duplicate key error
        if (error.code === 11000) {
            console.error('Duplicate key error - some products already exist');
        }
        
        res.status(500).json({
            success: false,
            message: 'Error resetting products',
            error: error.message,
            errorCode: error.code
        });
    }
});

module.exports = router;