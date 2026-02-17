/**
 * Collaboration Email Service
 * Handles sending emails for collaboration requests
 */

const nodemailer = require('nodemailer');
const emailTemplates = require('./email-templates');

// Create email transporter
const createTransporter = () => {
    if (process.env.NODE_ENV === 'production') {
        // Production email service
        return nodemailer.createTransporter({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });
    } else {
        // Development - use Ethereal for testing (no configuration needed!)
        // Emails are captured but not sent - you get a preview URL
        return nodemailer.createTransporter({
            host: 'smtp.ethereal.email',
            port: 587,
            secure: false,
            auth: {
                user: 'ethereal.user@ethereal.email', // Dummy credentials - Ethereal accepts anything
                pass: 'ethereal.pass'
            }
        });
    }
};

const collaborationEmailService = {
    /**
     * Send email when a new collaboration request is received
     * @param {Object} data - Collaboration request data
     */
    async sendRequestReceivedEmail(data) {
        try {
            const template = emailTemplates.collaborationRequestReceived(data);
            const transporter = createTransporter();
            
            const mailOptions = {
                from: process.env.EMAIL_FROM || 'JKUAT Innovation Club <noreply@jkuat.ac.ke>',
                to: data.projectLead.email,
                subject: template.subject,
                html: template.html
            };

            const info = await transporter.sendMail(mailOptions);
            
            console.log(`✅ Collaboration request notification sent to ${data.projectLead.email}`);
            console.log(`   Project: ${data.projectTitle}`);
            console.log(`   Requester: ${data.requester.name}`);
            
            if (process.env.NODE_ENV !== 'production') {
                console.log(`   Preview URL: ${nodemailer.getTestMessageUrl(info)}`);
            }
            
            return { success: true, messageId: info.messageId };
        } catch (error) {
            console.error('❌ Error sending collaboration request email:', error);
            return { success: false, error: error.message };
        }
    },

    /**
     * Send email when a collaboration request is accepted
     * @param {Object} data - Acceptance data
     */
    async sendRequestAcceptedEmail(data) {
        try {
            const template = emailTemplates.collaborationRequestAccepted(data);
            const transporter = createTransporter();
            
            const mailOptions = {
                from: process.env.EMAIL_FROM || 'JKUAT Innovation Club <noreply@jkuat.ac.ke>',
                to: data.requester.email,
                subject: template.subject,
                html: template.html
            };

            const info = await transporter.sendMail(mailOptions);
            
            console.log(`✅ Collaboration acceptance email sent to ${data.requester.email}`);
            console.log(`   Project: ${data.projectTitle}`);
            
            if (process.env.NODE_ENV !== 'production') {
                console.log(`   Preview URL: ${nodemailer.getTestMessageUrl(info)}`);
            }
            
            return { success: true, messageId: info.messageId };
        } catch (error) {
            console.error('❌ Error sending collaboration acceptance email:', error);
            return { success: false, error: error.message };
        }
    },

    /**
     * Send email when a collaboration request is declined
     * @param {Object} data - Decline data
     */
    async sendRequestDeclinedEmail(data) {
        try {
            const template = emailTemplates.collaborationRequestDeclined(data);
            const transporter = createTransporter();
            
            const mailOptions = {
                from: process.env.EMAIL_FROM || 'JKUAT Innovation Club <noreply@jkuat.ac.ke>',
                to: data.requester.email,
                subject: template.subject,
                html: template.html
            };

            const info = await transporter.sendMail(mailOptions);
            
            console.log(`✅ Collaboration decline email sent to ${data.requester.email}`);
            console.log(`   Project: ${data.projectTitle}`);
            
            if (process.env.NODE_ENV !== 'production') {
                console.log(`   Preview URL: ${nodemailer.getTestMessageUrl(info)}`);
            }
            
            return { success: true, messageId: info.messageId };
        } catch (error) {
            console.error('❌ Error sending collaboration decline email:', error);
            return { success: false, error: error.message };
        }
    }
};

module.exports = collaborationEmailService;
