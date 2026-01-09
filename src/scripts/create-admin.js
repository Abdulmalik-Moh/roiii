const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

async function createAdminUser() {
    try {
        console.log('🔗 Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        // Try to load the User model
        let User;
        try {
            User = require('../models/user');
        } catch (error) {
            console.error('❌ Could not load User model:', error.message);
            console.log('Creating User model dynamically...');
            
            // Create a simple user schema
            const userSchema = new mongoose.Schema({
                name: String,
                email: { type: String, unique: true },
                password: String,
                role: { type: String, default: 'user' },
                isAdmin: { type: Boolean, default: false },
                isVerified: { type: Boolean, default: true },
                createdAt: { type: Date, default: Date.now }
            });
            
            // Hash password middleware
            userSchema.pre('save', async function(next) {
                if (this.isModified('password')) {
                    this.password = await bcrypt.hash(this.password, 10);
                }
                next();
            });
            
            User = mongoose.model('User', userSchema);
        }

        // Create admin@roibeauty.com
        const adminEmail = 'admin@roibeauty.com';
        const existingAdmin = await User.findOne({ email: adminEmail });

        if (existingAdmin) {
            console.log('ℹ️ Admin user already exists:');
            console.log(`   Email: ${existingAdmin.email}`);
            console.log(`   Name: ${existingAdmin.name}`);
            
            // Update to admin if not already
            if (!existingAdmin.isAdmin || existingAdmin.role !== 'admin') {
                existingAdmin.role = 'admin';
                existingAdmin.isAdmin = true;
                await existingAdmin.save();
                console.log('✅ Updated user to admin role');
            }
        } else {
            // Create new admin user
            const hashedPassword = await bcrypt.hash('admin123', 10);
            
            const adminUser = new User({
                name: 'Administrator',
                email: adminEmail,
                password: hashedPassword,
                role: 'admin',
                isAdmin: true,
                isVerified: true
            });

            await adminUser.save();
            console.log('✅ Created admin user:');
            console.log(`   Email: ${adminEmail}`);
            console.log(`   Password: admin123`);
            console.log(`   Role: admin`);
            console.log(`\n⚠️ IMPORTANT: Change the password immediately in production!`);
        }

        // List all admin users
        const adminUsers = await User.find({
            $or: [
                { role: 'admin' },
                { isAdmin: true }
            ]
        });

        console.log('\n📋 All admin users:');
        adminUsers.forEach(user => {
            console.log(`  - ${user.email} (Name: ${user.name}, Role: ${user.role}, isAdmin: ${user.isAdmin})`);
        });

        console.log('\n✅ Admin setup complete!');
        process.exit(0);

    } catch (error) {
        console.error('❌ Error creating admin user:', error);
        process.exit(1);
    }
}

createAdminUser();