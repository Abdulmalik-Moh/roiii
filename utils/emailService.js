const nodemailer = require('nodemailer');
const fs = require('fs').promises;
const path = require('path');

class EmailService {
    constructor() {
        this.transporter = nodemailer.createTransport({
            host: process.env.EMAIL_HOST || 'smtp.gmail.com',
            port: process.env.EMAIL_PORT || 587,
            secure: process.env.EMAIL_SECURE === 'true',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });

        // Test email configuration
        this.testEmailService();
    }

    // Test email configuration
    async testEmailService() {
        try {
            await this.transporter.verify();
            console.log('✅ Email service is ready');
        } catch (error) {
            console.error('❌ Email service configuration error:', error);
        }
    }

    // Load email template
    async loadTemplate(templateName, data = {}) {
        try {
            const templatePath = path.join(__dirname, 'email-templates', `${templateName}.html`);
            let template = await fs.readFile(templatePath, 'utf8');
            
            // Replace placeholders with data
            Object.keys(data).forEach(key => {
                const placeholder = new RegExp(`{{${key}}}`, 'g');
                template = template.replace(placeholder, data[key]);
            });
            
            return template;
        } catch (error) {
            console.error(`Error loading template ${templateName}:`, error);
            return this.generateBasicTemplate(data);
        }
    }

    // Generate basic template fallback
    generateBasicTemplate(data) {
        return `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <div style="background: linear-gradient(135deg, #4a7c59, #3a6548); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
                    <h1 style="color: white; margin: 0;">ROI Beauty</h1>
                    <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0;">Premium Skincare</p>
                </div>
                
                <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                    ${data.content || 'Thank you for choosing ROI Beauty!'}
                    
                    <hr style="border: none; border-top: 1px solid #eee; margin: 25px 0;">
                    
                    <div style="color: #888; font-size: 12px; text-align: center;">
                        <p>ROI Beauty Team</p>
                        <p><a href="${process.env.BASE_URL}" style="color: #4a7c59;">${process.env.BASE_URL}</a></p>
                    </div>
                </div>
            </div>
        `;
    }

    // Send order confirmation email
    async sendOrderConfirmation(order, user) {
        try {
            const itemsHtml = order.items.map(item => `
                <tr>
                    <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">
                        <img src="${item.image || `${process.env.BASE_URL}/images/default-product.jpg`}" 
                             alt="${item.name}" 
                             width="50" 
                             style="border-radius: 5px;">
                    </td>
                    <td style="padding: 10px; border-bottom: 1px solid #eee;">
                        ${item.name}
                        ${item.size ? `<br><small style="color: #666;">Size: ${item.size}</small>` : ''}
                    </td>
                    <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">
                        ${item.quantity}
                    </td>
                    <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">
                        $${(item.price || 0).toFixed(2)}
                    </td>
                </tr>
            `).join('');

            const templateData = {
                customerName: user.name,
                orderNumber: order.orderNumber,
                orderDate: new Date(order.createdAt).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                }),
                items: itemsHtml,
                subtotal: order.subtotal?.toFixed(2) || order.totalAmount?.toFixed(2),
                shipping: order.shippingCost?.toFixed(2) || '0.00',
                tax: order.tax?.toFixed(2) || '0.00',
                total: order.totalAmount?.toFixed(2),
                shippingAddress: `
                    ${order.shippingAddress?.fullName || ''}<br>
                    ${order.shippingAddress?.address || ''}<br>
                    ${order.shippingAddress?.city || ''}, ${order.shippingAddress?.state || ''} ${order.shippingAddress?.zipCode || ''}<br>
                    ${order.shippingAddress?.country || ''}
                `,
                trackingNumber: order.trackingNumber || 'Will be updated soon',
                estimatedDelivery: order.estimatedDelivery || '3-5 business days',
                orderLink: `${process.env.BASE_URL}/account/orders/${order._id}`
            };

            const html = await this.loadTemplate('order-confirmation', templateData);

            const mailOptions = {
                from: `"ROI Beauty" <${process.env.EMAIL_USER}>`,
                to: user.email,
                subject: `Order Confirmation #${order.orderNumber}`,
                html: html
            };

            await this.transporter.sendMail(mailOptions);
            console.log(`✅ Order confirmation sent to ${user.email}`);
            return true;
        } catch (error) {
            console.error('❌ Order confirmation email error:', error);
            return false;
        }
    }

    // Send order status update email
    async sendOrderStatusUpdate(order, status) {
        try {
            const user = order.userId ? await require('../models/user').findById(order.userId) : null;
            if (!user) return false;

            const statusMessages = {
                processing: 'Your order is being processed',
                confirmed: 'Your order has been confirmed',
                shipped: 'Your order has been shipped',
                delivered: 'Your order has been delivered',
                cancelled: 'Your order has been cancelled'
            };

            const templateData = {
                customerName: user.name,
                orderNumber: order.orderNumber,
                status: status.charAt(0).toUpperCase() + status.slice(1),
                statusMessage: statusMessages[status] || 'Your order status has been updated',
                trackingNumber: order.trackingNumber || null,
                shippingCarrier: order.shippingCarrier || null,
                estimatedDelivery: order.estimatedDelivery || null,
                orderLink: `${process.env.BASE_URL}/account/orders/${order._id}`
            };

            const html = await this.loadTemplate('order-status', templateData);

            const mailOptions = {
                from: `"ROI Beauty" <${process.env.EMAIL_USER}>`,
                to: user.email,
                subject: `Order Update #${order.orderNumber} - ${status.charAt(0).toUpperCase() + status.slice(1)}`,
                html: html
            };

            await this.transporter.sendMail(mailOptions);
            console.log(`✅ Order status update sent to ${user.email}`);
            return true;
        } catch (error) {
            console.error('❌ Order status email error:', error);
            return false;
        }
    }

    // Send shipping confirmation email
    async sendShippingConfirmation(order) {
        try {
            const user = order.userId ? await require('../models/user').findById(order.userId) : null;
            if (!user) return false;

            const templateData = {
                customerName: user.name,
                orderNumber: order.orderNumber,
                trackingNumber: order.trackingNumber,
                shippingCarrier: order.shippingCarrier || 'Our shipping partner',
                estimatedDelivery: order.estimatedDelivery || '3-5 business days',
                trackingLink: order.trackingLink || '#',
                orderLink: `${process.env.BASE_URL}/account/orders/${order._id}`
            };

            const html = await this.loadTemplate('shipping-confirmation', templateData);

            const mailOptions = {
                from: `"ROI Beauty" <${process.env.EMAIL_USER}>`,
                to: user.email,
                subject: `Your Order #${order.orderNumber} Has Shipped!`,
                html: html
            };

            await this.transporter.sendMail(mailOptions);
            console.log(`✅ Shipping confirmation sent to ${user.email}`);
            return true;
        } catch (error) {
            console.error('❌ Shipping confirmation email error:', error);
            return false;
        }
    }

    // Send delivery confirmation email
    async sendDeliveryConfirmation(order) {
        try {
            const user = order.userId ? await require('../models/user').findById(order.userId) : null;
            if (!user) return false;

            const templateData = {
                customerName: user.name,
                orderNumber: order.orderNumber,
                deliveredDate: new Date().toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                }),
                reviewLink: `${process.env.BASE_URL}/products`,
                orderLink: `${process.env.BASE_URL}/account/orders/${order._id}`
            };

            const html = await this.loadTemplate('delivery-confirmation', templateData);

            const mailOptions = {
                from: `"ROI Beauty" <${process.env.EMAIL_USER}>`,
                to: user.email,
                subject: `Your Order #${order.orderNumber} Has Been Delivered!`,
                html: html
            };

            await this.transporter.sendMail(mailOptions);
            console.log(`✅ Delivery confirmation sent to ${user.email}`);
            return true;
        } catch (error) {
            console.error('❌ Delivery confirmation email error:', error);
            return false;
        }
    }

    // Send newsletter
    async sendNewsletter(to, subject, content) {
        try {
            const templateData = {
                content: content,
                unsubscribeLink: `${process.env.BASE_URL}/account/preferences`
            };

            const html = await this.loadTemplate('newsletter', templateData);

            const mailOptions = {
                from: `"ROI Beauty Newsletter" <${process.env.EMAIL_USER}>`,
                to: to,
                subject: subject,
                html: html,
                headers: {
                    'List-Unsubscribe': `<${process.env.BASE_URL}/unsubscribe?email=${encodeURIComponent(to)}>`,
                    'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click'
                }
            };

            await this.transporter.sendMail(mailOptions);
            console.log(`✅ Newsletter sent to ${to}`);
            return true;
        } catch (error) {
            console.error('❌ Newsletter email error:', error);
            return false;
        }
    }

    // Send welcome newsletter
    async sendWelcomeNewsletter(user) {
        try {
            const templateData = {
                customerName: user.name,
                discountCode: 'WELCOME15',
                discountPercent: '15',
                productsLink: `${process.env.BASE_URL}/products`,
                accountLink: `${process.env.BASE_URL}/account`,
                unsubscribeLink: `${process.env.BASE_URL}/account/preferences`
            };

            const html = await this.loadTemplate('welcome-newsletter', templateData);

            const mailOptions = {
                from: `"ROI Beauty" <${process.env.EMAIL_USER}>`,
                to: user.email,
                subject: '👋 Welcome to ROI Beauty! Your Skincare Journey Starts Here 🌿',
                html: html
            };

            await this.transporter.sendMail(mailOptions);
            console.log(`✅ Welcome newsletter sent to ${user.email}`);
            return true;
        } catch (error) {
            console.error('❌ Welcome newsletter error:', error);
            return false;
        }
    }

    // Send product back in stock notification
    async sendBackInStockNotification(product, emails) {
        try {
            const templateData = {
                productName: product.name,
                productImage: product.images?.[0]?.url || `${process.env.BASE_URL}/images/default-product.jpg`,
                productLink: `${process.env.BASE_URL}/product/${product.slug || product._id}`,
                price: product.price?.toFixed(2),
                originalPrice: product.originalPrice?.toFixed(2)
            };

            const html = await this.loadTemplate('back-in-stock', templateData);

            // Send to all subscribers
            for (const email of emails) {
                const mailOptions = {
                    from: `"ROI Beauty" <${process.env.EMAIL_USER}>`,
                    to: email,
                    subject: `🌟 Back in Stock: ${product.name}`,
                    html: html
                };

                await this.transporter.sendMail(mailOptions);
                console.log(`✅ Back in stock notification sent to ${email}`);
            }

            return true;
        } catch (error) {
            console.error('❌ Back in stock notification error:', error);
            return false;
        }
    }

    // Send abandoned cart reminder
    async sendAbandonedCartReminder(user, cartItems) {
        try {
            const itemsHtml = cartItems.map(item => `
                <tr>
                    <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">
                        <img src="${item.image || `${process.env.BASE_URL}/images/default-product.jpg`}" 
                             alt="${item.name}" 
                             width="50" 
                             style="border-radius: 5px;">
                    </td>
                    <td style="padding: 10px; border-bottom: 1px solid #eee;">
                        ${item.name}
                    </td>
                    <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">
                        ${item.quantity}
                    </td>
                    <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">
                        $${(item.price || 0).toFixed(2)}
                    </td>
                </tr>
            `).join('');

            const total = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

            const templateData = {
                customerName: user.name,
                items: itemsHtml,
                total: total.toFixed(2),
                cartLink: `${process.env.BASE_URL}/cart`,
                discountCode: 'COMEBACK10',
                discountPercent: '10'
            };

            const html = await this.loadTemplate('abandoned-cart', templateData);

            const mailOptions = {
                from: `"ROI Beauty" <${process.env.EMAIL_USER}>`,
                to: user.email,
                subject: '🛒 Finish Your Purchase - Your Cart is Waiting!',
                html: html
            };

            await this.transporter.sendMail(mailOptions);
            console.log(`✅ Abandoned cart reminder sent to ${user.email}`);
            return true;
        } catch (error) {
            console.error('❌ Abandoned cart reminder error:', error);
            return false;
        }
    }

    // Send password reset email
    async sendPasswordResetEmail(user, resetToken) {
        try {
            const resetLink = `${process.env.BASE_URL}/auth/reset-password/${resetToken}`;

            const templateData = {
                customerName: user.name,
                resetLink: resetLink,
                expiryTime: '1 hour'
            };

            const html = await this.loadTemplate('password-reset', templateData);

            const mailOptions = {
                from: `"ROI Beauty" <${process.env.EMAIL_USER}>`,
                to: user.email,
                subject: 'Reset Your Password - ROI Beauty',
                html: html
            };

            await this.transporter.sendMail(mailOptions);
            console.log(`✅ Password reset email sent to ${user.email}`);
            return true;
        } catch (error) {
            console.error('❌ Password reset email error:', error);
            return false;
        }
    }

    // Send contact form confirmation
    async sendContactConfirmation(contactData) {
        try {
            const templateData = {
                customerName: contactData.name,
                message: contactData.message,
                responseTime: '24 hours',
                supportEmail: 'support@roibeauty.com'
            };

            const html = await this.loadTemplate('contact-confirmation', templateData);

            const mailOptions = {
                from: `"ROI Beauty Support" <${process.env.EMAIL_USER}>`,
                to: contactData.email,
                subject: 'Thank You for Contacting ROI Beauty!',
                html: html
            };

            await this.transporter.sendMail(mailOptions);
            console.log(`✅ Contact confirmation sent to ${contactData.email}`);
            return true;
        } catch (error) {
            console.error('❌ Contact confirmation error:', error);
            return false;
        }
    }

    // Send admin notification
    async sendAdminNotification(subject, message) {
        try {
            const adminEmail = process.env.ADMIN_EMAIL || process.env.EMAIL_USER;
            
            const mailOptions = {
                from: `"ROI Beauty System" <${process.env.EMAIL_USER}>`,
                to: adminEmail,
                subject: `🔔 ${subject}`,
                html: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                        <div style="background: #f8f9fa; padding: 20px; border-radius: 10px; border-left: 4px solid #4a7c59;">
                            <h3 style="margin-top: 0; color: #4a7c59;">${subject}</h3>
                            <p>${message}</p>
                            <p style="color: #666; font-size: 12px; margin-top: 20px;">
                                Sent from ROI Beauty System
                            </p>
                        </div>
                    </div>
                `
            };

            await this.transporter.sendMail(mailOptions);
            console.log(`✅ Admin notification sent`);
            return true;
        } catch (error) {
            console.error('❌ Admin notification error:', error);
            return false;
        }
    }

    // Send bulk emails (for newsletters)
    async sendBulkEmails(emails, subject, html) {
        try {
            const batchSize = 50; // Send in batches to avoid rate limiting
            const batches = [];
            
            for (let i = 0; i < emails.length; i += batchSize) {
                batches.push(emails.slice(i, i + batchSize));
            }
            
            let successCount = 0;
            let failCount = 0;
            
            for (const batch of batches) {
                const promises = batch.map(async (email) => {
                    try {
                        const mailOptions = {
                            from: `"ROI Beauty Newsletter" <${process.env.EMAIL_USER}>`,
                            to: email,
                            subject: subject,
                            html: html,
                            headers: {
                                'List-Unsubscribe': `<${process.env.BASE_URL}/unsubscribe?email=${encodeURIComponent(email)}>`
                            }
                        };
                        
                        await this.transporter.sendMail(mailOptions);
                        successCount++;
                        return true;
                    } catch (error) {
                        console.error(`Failed to send to ${email}:`, error.message);
                        failCount++;
                        return false;
                    }
                });
                
                await Promise.all(promises);
                
                // Wait between batches to avoid rate limiting
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
            
            console.log(`✅ Bulk email sent: ${successCount} successful, ${failCount} failed`);
            return { success: successCount, failed: failCount };
        } catch (error) {
            console.error('❌ Bulk email error:', error);
            return { success: 0, failed: emails.length };
        }
    }
}

module.exports = new EmailService();