/**
 * Email Templates for Collaboration Notifications
 * JKUAT Innovation and Entrepreneurship Club
 */

const emailTemplates = {
    /**
     * Email sent when a collaboration request is submitted
     * Sent to: Project Lead
     */
    collaborationRequestReceived: (data) => {
        const { projectTitle, projectLead, requester, role, skills, message, timeCommitment, email } = data;
        
        return {
            subject: `New Collaboration Request for "${projectTitle}"`,
            html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <style>
                        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                        .header { background: linear-gradient(135deg, #f59e0b, #d97706); color: white; padding: 20px; border-radius: 8px 8px 0 0; }
                        .content { background: #f9f9f9; padding: 20px; border-radius: 0 0 8px 8px; }
                        .request-details { background: white; padding: 15px; border-radius: 8px; margin: 15px 0; border-left: 4px solid #f59e0b; }
                        .detail-row { margin: 10px 0; }
                        .detail-label { font-weight: bold; color: #666; }
                        .detail-value { color: #333; margin-top: 5px; }
                        .message-box { background: #fff3cd; padding: 15px; border-radius: 8px; margin: 15px 0; border-left: 4px solid #ffc107; }
                        .btn { display: inline-block; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 10px 5px; font-weight: bold; }
                        .btn-accept { background: #10b981; color: white; }
                        .btn-view { background: #3b82f6; color: white; }
                        .footer { text-align: center; margin-top: 20px; color: #666; font-size: 14px; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1>🤝 New Collaboration Request</h1>
                            <p>JKUAT Innovation and Entrepreneurship Club</p>
                        </div>
                        <div class="content">
                            <p>Dear ${projectLead.name},</p>
                            <p>You have received a new collaboration request for your project <strong>"${projectTitle}"</strong>.</p>
                            
                            <div class="request-details">
                                <h3 style="margin-top: 0; color: #f59e0b;">👤 Requester Information</h3>
                                <div class="detail-row">
                                    <div class="detail-label">Name:</div>
                                    <div class="detail-value">${requester.name}</div>
                                </div>
                                <div class="detail-row">
                                    <div class="detail-label">Email:</div>
                                    <div class="detail-value"><a href="mailto:${email}">${email}</a></div>
                                </div>
                                <div class="detail-row">
                                    <div class="detail-label">Desired Role:</div>
                                    <div class="detail-value">${role}</div>
                                </div>
                                <div class="detail-row">
                                    <div class="detail-label">Skills Offered:</div>
                                    <div class="detail-value">${skills}</div>
                                </div>
                                <div class="detail-row">
                                    <div class="detail-label">Time Commitment:</div>
                                    <div class="detail-value">${timeCommitment}</div>
                                </div>
                            </div>
                            
                            <div class="message-box">
                                <h4 style="margin-top: 0;">💬 Their Message:</h4>
                                <p style="margin: 0;">${message}</p>
                            </div>
                            
                            <p><strong>Next Steps:</strong></p>
                            <ul>
                                <li>Review the request in your dashboard</li>
                                <li>Accept or decline the collaboration request</li>
                                <li>If accepted, reach out to coordinate next steps</li>
                            </ul>
                            
                            <div style="text-align: center; margin: 20px 0;">
                                <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/dashboard" class="btn btn-view">View in Dashboard</a>
                            </div>
                            
                            <p>Best regards,<br>JKUAT Innovation and Entrepreneurship Club</p>
                        </div>
                        <div class="footer">
                            <p>© 2024 JKUAT Innovation and Entrepreneurship Club. All rights reserved.</p>
                            <p>This is an automated notification. Please do not reply to this email.</p>
                        </div>
                    </div>
                </body>
                </html>
            `
        };
    },

    /**
     * Email sent when collaboration request is accepted
     * Sent to: Requester
     */
    collaborationRequestAccepted: (data) => {
        const { projectTitle, projectLead, requester, role, responseMessage } = data;
        
        return {
            subject: `✅ Your collaboration request for "${projectTitle}" was accepted!`,
            html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <style>
                        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                        .header { background: linear-gradient(135deg, #10b981, #059669); color: white; padding: 20px; border-radius: 8px 8px 0 0; }
                        .content { background: #f9f9f9; padding: 20px; border-radius: 0 0 8px 8px; }
                        .success-box { background: #d1fae5; padding: 20px; border-radius: 8px; margin: 15px 0; border-left: 4px solid #10b981; text-align: center; }
                        .contact-box { background: white; padding: 15px; border-radius: 8px; margin: 15px 0; border-left: 4px solid #3b82f6; }
                        .detail-row { margin: 10px 0; }
                        .detail-label { font-weight: bold; color: #666; }
                        .detail-value { color: #333; margin-top: 5px; }
                        ${responseMessage ? `.response-box { background: #fff3cd; padding: 15px; border-radius: 8px; margin: 15px 0; border-left: 4px solid #ffc107; }` : ''}
                        .btn { display: inline-block; background: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 10px 0; font-weight: bold; }
                        .footer { text-align: center; margin-top: 20px; color: #666; font-size: 14px; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1>🎉 Collaboration Request Accepted!</h1>
                            <p>JKUAT Innovation and Entrepreneurship Club</p>
                        </div>
                        <div class="content">
                            <p>Dear ${requester.name},</p>
                            
                            <div class="success-box">
                                <h2 style="margin: 0; color: #10b981;">✅ Great News!</h2>
                                <p style="margin: 10px 0 0 0; font-size: 16px;">Your collaboration request for <strong>"${projectTitle}"</strong> has been accepted!</p>
                            </div>
                            
                            <p>You will be joining the project as a <strong>${role}</strong>.</p>
                            
                            ${responseMessage ? `
                                <div class="response-box">
                                    <h4 style="margin-top: 0;">💬 Message from Project Lead:</h4>
                                    <p style="margin: 0;">${responseMessage}</p>
                                </div>
                            ` : ''}
                            
                            <div class="contact-box">
                                <h3 style="margin-top: 0; color: #3b82f6;">📞 Project Lead Contact</h3>
                                <div class="detail-row">
                                    <div class="detail-label">Name:</div>
                                    <div class="detail-value">${projectLead.name}</div>
                                </div>
                                <div class="detail-row">
                                    <div class="detail-label">Email:</div>
                                    <div class="detail-value"><a href="mailto:${projectLead.email}">${projectLead.email}</a></div>
                                </div>
                                ${projectLead.phone ? `
                                    <div class="detail-row">
                                        <div class="detail-label">Phone:</div>
                                        <div class="detail-value">${projectLead.phone}</div>
                                    </div>
                                ` : ''}
                            </div>
                            
                            <p><strong>Next Steps:</strong></p>
                            <ul>
                                <li>The project lead will reach out to you soon to discuss onboarding</li>
                                <li>Prepare any questions you have about the project</li>
                                <li>Review the project details and requirements</li>
                                <li>Be ready to contribute your skills and expertise!</li>
                            </ul>
                            
                            <div style="text-align: center; margin: 20px 0;">
                                <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/projects" class="btn">View Project</a>
                            </div>
                            
                            <p>We're excited to see what you'll accomplish together!</p>
                            <p>Best regards,<br>JKUAT Innovation and Entrepreneurship Club</p>
                        </div>
                        <div class="footer">
                            <p>© 2024 JKUAT Innovation and Entrepreneurship Club. All rights reserved.</p>
                        </div>
                    </div>
                </body>
                </html>
            `
        };
    },

    /**
     * Email sent when collaboration request is declined
     * Sent to: Requester
     */
    collaborationRequestDeclined: (data) => {
        const { projectTitle, requester, responseMessage } = data;
        
        return {
            subject: `Update on your collaboration request for "${projectTitle}"`,
            html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <style>
                        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                        .header { background: linear-gradient(135deg, #6366f1, #4f46e5); color: white; padding: 20px; border-radius: 8px 8px 0 0; }
                        .content { background: #f9f9f9; padding: 20px; border-radius: 0 0 8px 8px; }
                        .info-box { background: #e0e7ff; padding: 20px; border-radius: 8px; margin: 15px 0; border-left: 4px solid #6366f1; }
                        ${responseMessage ? `.response-box { background: #fff3cd; padding: 15px; border-radius: 8px; margin: 15px 0; border-left: 4px solid #ffc107; }` : ''}
                        .btn { display: inline-block; background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 10px 0; font-weight: bold; }
                        .footer { text-align: center; margin-top: 20px; color: #666; font-size: 14px; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1>📋 Collaboration Request Update</h1>
                            <p>JKUAT Innovation and Entrepreneurship Club</p>
                        </div>
                        <div class="content">
                            <p>Dear ${requester.name},</p>
                            
                            <div class="info-box">
                                <p style="margin: 0;">Thank you for your interest in collaborating on <strong>"${projectTitle}"</strong>.</p>
                                <p style="margin: 10px 0 0 0;">After careful consideration, the project lead has decided not to move forward with your collaboration request at this time.</p>
                            </div>
                            
                            ${responseMessage ? `
                                <div class="response-box">
                                    <h4 style="margin-top: 0;">💬 Message from Project Lead:</h4>
                                    <p style="margin: 0;">${responseMessage}</p>
                                </div>
                            ` : ''}
                            
                            <p><strong>Don't be discouraged!</strong> There are many other exciting projects you can contribute to:</p>
                            <ul>
                                <li>Browse other available projects on our platform</li>
                                <li>Submit your own project idea</li>
                                <li>Attend club events to network with other members</li>
                                <li>Join our hackathons and competitions</li>
                            </ul>
                            
                            <div style="text-align: center; margin: 20px 0;">
                                <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/projects" class="btn">Browse Other Projects</a>
                            </div>
                            
                            <p>Keep innovating and don't hesitate to apply for other opportunities!</p>
                            <p>Best regards,<br>JKUAT Innovation and Entrepreneurship Club</p>
                        </div>
                        <div class="footer">
                            <p>© 2024 JKUAT Innovation and Entrepreneurship Club. All rights reserved.</p>
                        </div>
                    </div>
                </body>
                </html>
            `
        };
    }
};

module.exports = emailTemplates;
