const mongoose = require('mongoose');
const Product = require('../models/product');
require('dotenv').config();

const products = [
    {
        name: "Glow-Getter Vitamin C Serum",
        slug: "glow-getter-vitamin-c-serum",
        description: "Brighten dull skin and fade dark spots with our potent Vitamin C serum. Achieve a radiant, even-toned complexion.",
        detailedDescription: `
            <h3>Transform Your Skin's Radiance</h3>
            <p>Our Glow-Getter Vitamin C Serum is specially formulated to tackle uneven skin tone, dark spots, and dullness. Infused with 20% pure Vitamin C (L-Ascorbic Acid), this potent serum delivers visible results in just 4 weeks.</p>
            
            <h4>Key Benefits:</h4>
            <ul>
                <li>Reduces appearance of dark spots and hyperpigmentation</li>
                <li>Boosts collagen production for firmer skin</li>
                <li>Protects against environmental stressors</li>
                <li>Improves skin texture and radiance</li>
                <li>Minimizes fine lines and wrinkles</li>
            </ul>
            
            <h4>How to Use:</h4>
            <p>Apply 2-3 drops to clean, dry face every morning. Follow with moisturizer and sunscreen. For best results, use daily.</p>
            
            <h4>Ingredients:</h4>
            <p>Water, L-Ascorbic Acid (Vitamin C), Ferulic Acid, Vitamin E, Hyaluronic Acid, Aloe Vera, Green Tea Extract</p>
        `,
        ingredients: [
            { name: "L-Ascorbic Acid (Vitamin C)", benefit: "Brightens, protects, and boosts collagen" },
            { name: "Ferulic Acid", benefit: "Stabilizes Vitamin C and provides antioxidant protection" },
            { name: "Vitamin E", benefit: "Nourishes and repairs skin barrier" },
            { name: "Hyaluronic Acid", benefit: "Intensely hydrates and plumps skin" },
            { name: "Aloe Vera", benefit: "Soothes and calms irritation" }
        ],
        benefits: [
            "Brightens complexion",
            "Fades dark spots",
            "Boosts collagen",
            "Protects from pollution",
            "Hydrates deeply"
        ],
        howToUse: "Apply 2-3 drops to clean, dry face every morning. Follow with moisturizer and sunscreen.",
        sizes: [
            { size: "30ml", price: 42.99, sku: "VITC-30", stock: 50 },
            { size: "50ml", price: 64.99, sku: "VITC-50", stock: 30 },
            { size: "100ml", price: 99.99, sku: "VITC-100", stock: 15 }
        ],
        category: "serums",
        subcategory: "brightening",
        price: 42.99,
        originalPrice: 49.99,
        images: [
            { url: "/images/products/vitamin-c-serum-1.jpg", altText: "Vitamin C Serum Bottle", isPrimary: true },
            { url: "/images/products/vitamin-c-serum-2.jpg", altText: "Vitamin C Serum Application" },
            { url: "/images/products/vitamin-c-serum-3.jpg", altText: "Vitamin C Serum Results" }
        ],
        skinType: ["dry", "combination", "normal", "sensitive"],
        concerns: ["dark spots", "dullness", "uneven tone", "aging"],
        badge: "Bestseller",
        tags: ["vitamin c", "brightening", "anti-aging", "serum", "glow"],
        isFeatured: true,
        inStock: true,
        stockQuantity: 50,
        rating: 4.8,
        numReviews: 124,
        salesCount: 856
    },
    {
        name: "Hydra-Boost Hyaluronic Moisturizer",
        slug: "hydra-boost-hyaluronic-moisturizer",
        description: "Quench thirsty skin with our ultra-hydrating hyaluronic acid moisturizer. 72-hour hydration in one application.",
        detailedDescription: `
            <h3>Deep Hydration That Lasts</h3>
            <p>Say goodbye to dry, flaky skin with our Hydra-Boost Moisturizer. Formulated with 5 types of hyaluronic acid, it delivers multi-level hydration that penetrates deep into the skin's layers.</p>
            
            <h4>Why It Works:</h4>
            <ul>
                <li>Contains 5 molecular weights of Hyaluronic Acid for multi-level hydration</li>
                <li>Ceramides strengthen skin barrier function</li>
                <li>Niacinamide reduces redness and improves texture</li>
                <li>Lightweight formula absorbs quickly without greasiness</li>
                <li>Suitable for all skin types, including sensitive skin</li>
            </ul>
            
            <h4>Clinical Results:</h4>
            <p>In a 4-week consumer study, 94% of participants reported improved skin hydration, 89% noticed smoother texture, and 87% saw reduced appearance of fine lines.</p>
            
            <h4>Perfect For:</h4>
            <p>Dry skin, dehydrated skin, sensitive skin, mature skin, and anyone seeking intense hydration without heaviness.</p>
        `,
        ingredients: [
            { name: "Hyaluronic Acid Complex", benefit: "Multi-level hydration from surface to deep layers" },
            { name: "Ceramides", benefit: "Restores and strengthens skin barrier" },
            { name: "Niacinamide", benefit: "Reduces redness and improves texture" },
            { name: "Squalane", benefit: "Moisturizes without clogging pores" },
            { name: "Allantoin", benefit: "Soothes and calms irritated skin" }
        ],
        benefits: [
            "72-hour hydration",
            "Strengthens skin barrier",
            "Reduces redness",
            "Improves texture",
            "Lightweight feel"
        ],
        howToUse: "Apply to clean face and neck morning and night. Can be used under makeup.",
        sizes: [
            { size: "50ml", price: 36.99, sku: "HYDRA-50", stock: 75 },
            { size: "100ml", price: 58.99, sku: "HYDRA-100", stock: 40 }
        ],
        category: "moisturizers",
        subcategory: "hydrating",
        price: 36.99,
        originalPrice: 42.99,
        images: [
            { url: "/images/products/moisturizer-1.jpg", altText: "Hydra-Boost Moisturizer", isPrimary: true },
            { url: "/images/products/moisturizer-2.jpg", altText: "Moisturizer Texture" },
            { url: "/images/products/moisturizer-3.jpg", altText: "Before and After Results" }
        ],
        skinType: ["dry", "sensitive", "combination", "normal", "oily"],
        concerns: ["dryness", "dehydration", "redness", "sensitivity", "texture"],
        badge: "New",
        tags: ["hyaluronic acid", "moisturizer", "hydration", "sensitive skin", "ceramides"],
        isFeatured: true,
        inStock: true,
        stockQuantity: 75,
        rating: 4.7,
        numReviews: 89,
        salesCount: 523
    },
    {
        name: "Pure Cleanse Gentle Foaming Cleanser",
        slug: "pure-cleanse-gentle-foaming-cleanser",
        description: "Effectively remove impurities without stripping skin's natural moisture. Perfect for daily use on all skin types.",
        detailedDescription: `
            <h3>The Gentle Yet Effective Cleanse</h3>
            <p>Our Pure Cleanse Foaming Cleanser transforms from gel to luxurious foam that thoroughly cleanses while respecting your skin's natural balance. Formulated with amino acids and botanical extracts, it leaves skin clean, soft, and comfortable—never tight or dry.</p>
            
            <h4>What Makes It Special:</h4>
            <ul>
                <li>Amino Acid-based formula cleanses without stripping</li>
                <li>Prebiotics support skin's microbiome health</li>
                <li>Chamomile and Green Tea extracts soothe and calm</li>
                <li>pH-balanced (5.5) to match skin's natural acidity</li>
                <li>Free from sulfates, parabens, and artificial fragrances</li>
            </ul>
            
            <h4>How to Use:</h4>
            <p>Wet face with lukewarm water. Dispense a pea-sized amount, lather in hands, and massage onto face for 60 seconds. Rinse thoroughly and pat dry.</p>
            
            <h4>Ideal For:</h4>
            <p>All skin types, especially sensitive, dry, or acne-prone skin. Safe for daily use morning and night.</p>
        `,
        ingredients: [
            { name: "Amino Acid Surfactants", benefit: "Gentle cleansing without stripping" },
            { name: "Prebiotics", benefit: "Supports healthy skin microbiome" },
            { name: "Chamomile Extract", benefit: "Soothes and reduces inflammation" },
            { name: "Green Tea Extract", benefit: "Antioxidant protection" },
            { name: "Aloe Vera", benefit: "Hydrates and calms" }
        ],
        benefits: [
            "Gentle yet effective cleansing",
            "Maintains skin's moisture balance",
            "Soothes irritated skin",
            "pH-balanced formula",
            "Safe for daily use"
        ],
        howToUse: "Use morning and night. Massage onto damp skin, then rinse thoroughly.",
        sizes: [
            { size: "150ml", price: 24.99, sku: "CLEAN-150", stock: 100 },
            { size: "300ml", price: 39.99, sku: "CLEAN-300", stock: 60 }
        ],
        category: "cleansers",
        subcategory: "foaming",
        price: 24.99,
        images: [
            { url: "/images/products/cleanser-1.jpg", altText: "Pure Cleanse Cleanser", isPrimary: true },
            { url: "/images/products/cleanser-2.jpg", altText: "Foaming Action" },
            { url: "/images/products/cleanser-3.jpg", altText: "Clean Skin Results" }
        ],
        skinType: ["sensitive", "dry", "combination", "oily", "normal"],
        concerns: ["impurities", "sensitivity", "dryness", "acne"],
        badge: "",
        tags: ["cleanser", "gentle", "foaming", "sensitive skin", "daily"],
        isFeatured: false,
        inStock: true,
        stockQuantity: 100,
        rating: 4.6,
        numReviews: 203,
        salesCount: 1247
    },
    {
        name: "Overnight Renewal Night Cream",
        slug: "overnight-renewal-night-cream",
        description: "Wake up to transformed skin. Our overnight cream works while you sleep to repair, renew, and revitalize.",
        detailedDescription: `
            <h3>Nighttime Skin Transformation</h3>
            <p>Your skin does its most important repair work while you sleep. Our Overnight Renewal Cream is specifically formulated to support this natural process, delivering powerful ingredients that work through the night to reveal smoother, brighter, more youthful-looking skin by morning.</p>
            
            <h4>Key Active Ingredients:</h4>
            <ul>
                <li>Retinol (0.3%): Stimulates collagen, reduces wrinkles</li>
                <li>Peptides: Boost firmness and elasticity</li>
                <li>Niacinamide: Improves texture and reduces pores</li>
                <li>Ceramides: Reinforce skin barrier function</li>
                <li>Antioxidant Complex: Protects against nighttime damage</li>
            </ul>
            
            <h4>Clinical Results:</h4>
            <p>After 8 weeks of use, clinical studies show:
            <br>• 87% reduction in appearance of fine lines
            <br>• 91% improvement in skin firmness
            <br>• 84% brighter, more even complexion
            <br>• 79% smoother skin texture</p>
            
            <h4>Usage Tips:</h4>
            <p>Apply as the last step in your evening routine. Start with 2-3 times per week, gradually increasing to nightly use as your skin adjusts. Always follow with sunscreen in the morning.</p>
        `,
        ingredients: [
            { name: "Encapsulated Retinol (0.3%)", benefit: "Reduces wrinkles without irritation" },
            { name: "Matrixyl 3000 Peptides", benefit: "Boosts collagen for firmer skin" },
            { name: "Niacinamide", benefit: "Improves texture and reduces redness" },
            { name: "Ceramide Complex", benefit: "Strengthens skin barrier" },
            { name: "Antioxidant Blend", benefit: "Protects against environmental damage" }
        ],
        benefits: [
            "Reduces wrinkles and fine lines",
            "Improves skin firmness",
            "Brightens complexion",
            "Strengthens skin barrier",
            "Non-greasy formula"
        ],
        howToUse: "Apply to clean face and neck before bed. Start 2-3 times weekly, increasing gradually.",
        sizes: [
            { size: "50ml", price: 58.99, sku: "NIGHT-50", stock: 40 },
            { size: "100ml", price: 94.99, sku: "NIGHT-100", stock: 20 }
        ],
        category: "moisturizers",
        subcategory: "night-care",
        price: 58.99,
        originalPrice: 68.99,
        images: [
            { url: "/images/products/night-cream-1.jpg", altText: "Overnight Renewal Cream", isPrimary: true },
            { url: "/images/products/night-cream-2.jpg", altText: "Rich Cream Texture" },
            { url: "/images/products/night-cream-3.jpg", altText: "Morning Results" }
        ],
        skinType: ["dry", "combination", "normal" ],
        concerns: ["aging", "wrinkles", "loss of firmness", "dullness"],
        badge: "Bestseller",
        tags: ["night cream", "retinol", "anti-aging", "peptides", "repair"],
        isFeatured: true,
        inStock: true,
        stockQuantity: 40,
        rating: 4.9,
        numReviews: 167,
        salesCount: 689
    }
];

const seedDatabase = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/roibeauty');
        console.log('✅ Connected to MongoDB');
        
        // Clear existing products
        await Product.deleteMany({});
        console.log('🗑️  Cleared existing products');
        
        // Insert new products
        await Product.insertMany(products);
        console.log(`✅ Seeded ${products.length} products`);
        
        // Display seeded products
        const seededProducts = await Product.find({});
        console.log('\n📦 Seeded Products:');
        console.log('='.repeat(80));
        seededProducts.forEach((product, index) => {
            console.log(`\n${index + 1}. ${product.name}`);
            console.log(`   Category: ${product.category}`);
            console.log(`   Price: $${product.price}`);
            console.log(`   Featured: ${product.isFeatured ? '⭐' : 'No'}`);
            console.log(`   SKU: ${product.sizes[0]?.sku || 'N/A'}`);
        });
        console.log('\n' + '='.repeat(80));
        
        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding database:', error);
        process.exit(1);
    }
};

seedDatabase();