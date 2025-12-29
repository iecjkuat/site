// JKUAT Innovation Club - Notification Helper Functions
const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

class NotificationHelpers {
    
    // Event-related notifications
    static async sendEventReminder(eventId, reminderType = '24h') {
        try {
            // Get event details
            const { data: event, error } = await supabase
                .from('events')
                .select(`
                    *,
                    event_registrations!inner(user_id, users!inner(id, name, email))
                `)
                .eq('id', eventId)
                .single();

            if (error) throw error;

            // Send reminder to all registered users
            const notifications = event.event_registrations.map(registration => ({
                userId: registration.user_id,
                type: 'event_reminder',
                title: `Event Reminder: ${event.title}`,
                message: `Don't forget about "${event.title}" starting ${this.formatEventTime(event.start_date)} at ${event.location}`,
                priority: reminderType === '1h' ? 'high' : 'medium',
                actionUrl: `/events?id=${eventId}`,
                actionText: 'View Event',
                metadata: {
                    event_id: eventId,
                    event_title: event.title,
                    event_time: this.formatEventTime(event.start_date),
                    event_location: event.location,
                    event_description: event.description,
                    reminder_type: reminderType
                },
                relatedEntityType: 'event',
                relatedEntityId: eventId
            }));

            return await this.sendBulkNotifications(notifications);
        } catch (error) {
            console.error('Error sending event reminder:', error);
            throw error;
        }
    }

    static async sendMeetingSchedule(meetingData) {
        try {
            const notifications = meetingData.attendees.map(userId => ({
                userId,
                type: 'meeting_schedule',
                title: `Meeting: ${meetingData.title}`,
                message: `You have a meeting scheduled for ${this.formatDateTime(meetingData.dateTime)} - ${meetingData.title}`,
                priority: 'medium',
                actionUrl: meetingData.meetingLink || '/dashboard',
                actionText: 'Join Meeting',
                metadata: {
                    meeting_title: meetingData.title,
                    meeting_date: this.formatDate(meetingData.dateTime),
                    meeting_time: this.formatTime(meetingData.dateTime),
                    meeting_location: meetingData.location,
                    meeting_agenda: meetingData.agenda,
                    meeting_link: meetingData.meetingLink
                },
                scheduledFor: new Date(meetingData.dateTime - 15 * 60 * 1000) // 15 minutes before
            }));

            return await this.sendBulkNotifications(notifications);
        } catch (error) {
            console.error('Error sending meeting schedule:', error);
            throw error;
        }
    }

    static async sendPaymentReminder(paymentData) {
        try {
            const notification = {
                userId: paymentData.userId,
                type: 'payment_reminder',
                title: `Payment Due: KES ${paymentData.amount.toLocaleString()}`,
                message: `Your payment of KES ${paymentData.amount.toLocaleString()} for ${paymentData.description} is due on ${this.formatDate(paymentData.dueDate)}`,
                priority: this.getPaymentPriority(paymentData.dueDate),
                actionUrl: `/payment?id=${paymentData.id}`,
                actionText: 'Pay Now',
                metadata: {
                    amount: `KES ${paymentData.amount.toLocaleString()}`,
                    item: paymentData.description,
                    due_date: this.formatDate(paymentData.dueDate),
                    payment_id: paymentData.id
                },
                relatedEntityType: 'payment',
                relatedEntityId: paymentData.id
            };

            return await this.sendSingleNotification(notification);
        } catch (error) {
            console.error('Error sending payment reminder:', error);
            throw error;
        }
    }

    static async sendAnnouncement(announcementData) {
        try {
            // Get target users based on audience
            const users = await this.getTargetUsers(announcementData.targetAudience);

            const notifications = users.map(user => ({
                userId: user.id,
                type: 'announcement',
                title: announcementData.title,
                message: announcementData.message,
                priority: announcementData.priority || 'medium',
                actionUrl: announcementData.actionUrl,
                actionText: announcementData.actionText || 'Read More',
                metadata: {
                    user_name: user.name,
                    title: announcementData.title,
                    message: announcementData.message,
                    announcement_id: announcementData.id
                },
                relatedEntityType: 'announcement',
                relatedEntityId: announcementData.id
            }));

            return await this.sendBulkNotifications(notifications);
        } catch (error) {
            console.error('Error sending announcement:', error);
            throw error;
        }
    }

    static async sendIdeaComment(commentData) {
        try {
            // Get idea owner
            const { data: idea, error } = await supabase
                .from('ideas')
                .select('user_id, title, users!inner(name)')
                .eq('id', commentData.ideaId)
                .single();

            if (error) throw error;

            // Don't notify if commenter is the idea owner
            if (idea.user_id === commentData.commenterId) return;

            const notification = {
                userId: idea.user_id,
                type: 'idea_comment',
                title: 'New comment on your idea',
                message: `${commentData.commenterName} commented on "${idea.title}"`,
                priority: 'medium',
                actionUrl: `/ideas?id=${commentData.ideaId}`,
                actionText: 'View Comment',
                metadata: {
                    user_name: idea.users.name,
                    commenter_name: commentData.commenterName,
                    idea_title: idea.title,
                    comment_text: commentData.commentText,
                    idea_id: commentData.ideaId
                },
                relatedEntityType: 'idea',
                relatedEntityId: commentData.ideaId
            };

            return await this.sendSingleNotification(notification);
        } catch (error) {
            console.error('Error sending idea comment notification:', error);
            throw error;
        }
    }

    static async sendCollaborationRequest(collaborationData) {
        try {
            // Get idea details
            const { data: idea, error } = await supabase
                .from('ideas')
                .select('user_id, title, users!inner(name)')
                .eq('id', collaborationData.ideaId)
                .single();

            if (error) throw error;

            const notification = {
                userId: idea.user_id,
                type: 'idea_collaboration',
                title: 'Collaboration request for your idea',
                message: `${collaborationData.requesterName} wants to collaborate on "${idea.title}"`,
                priority: 'medium',
                actionUrl: `/ideas?id=${collaborationData.ideaId}`,
                actionText: 'View Request',
                metadata: {
                    user_name: idea.users.name,
                    requester_name: collaborationData.requesterName,
                    idea_title: idea.title,
                    request_message: collaborationData.message,
                    skills_offered: collaborationData.skillsOffered.join(', '),
                    idea_id: collaborationData.ideaId
                },
                relatedEntityType: 'idea',
                relatedEntityId: collaborationData.ideaId
            };

            return await this.sendSingleNotification(notification);
        } catch (error) {
            console.error('Error sending collaboration request notification:', error);
            throw error;
        }
    }

    static async sendElectionNotification(electionData) {
        try {
            // Get all eligible voters
            const { data: users, error } = await supabase
                .from('users')
                .select('id, name')
                .eq('membership_status', 'active');

            if (error) throw error;

            const notifications = users.map(user => ({
                userId: user.id,
                type: 'election_period',
                title: `Club Elections: ${electionData.title}`,
                message: `Voting is now open for ${electionData.title}. Cast your vote by ${this.formatDate(electionData.deadline)}`,
                priority: 'high',
                actionUrl: `/leadership?election=${electionData.id}`,
                actionText: 'Vote Now',
                metadata: {
                    user_name: user.name,
                    election_title: electionData.title,
                    start_date: this.formatDate(electionData.startDate),
                    end_date: this.formatDate(electionData.endDate),
                    deadline: this.formatDate(electionData.deadline),
                    positions: electionData.positions.join(', '),
                    election_id: electionData.id
                },
                relatedEntityType: 'election',
                relatedEntityId: electionData.id
            }));

            return await this.sendBulkNotifications(notifications);
        } catch (error) {
            console.error('Error sending election notification:', error);
            throw error;
        }
    }

    // Helper methods
    static async sendSingleNotification(notificationData) {
        try {
            const response = await fetch(`${process.env.BACKEND_URL}/api/notifications`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(notificationData)
            });

            if (!response.ok) throw new Error('Failed to send notification');
            return await response.json();
        } catch (error) {
            console.error('Error in sendSingleNotification:', error);
            throw error;
        }
    }

    static async sendBulkNotifications(notifications) {
        try {
            const promises = notifications.map(notification => 
                this.sendSingleNotification(notification)
            );
            return await Promise.allSettled(promises);
        } catch (error) {
            console.error('Error in sendBulkNotifications:', error);
            throw error;
        }
    }

    static async getTargetUsers(criteria) {
        let query = supabase.from('users').select('id, name, email');
        
        if (criteria.roles && criteria.roles.length > 0) {
            query = query.in('role', criteria.roles);
        }
        
        if (criteria.membershipStatus) {
            query = query.eq('membership_status', criteria.membershipStatus);
        }

        const { data: users, error } = await query;
        if (error) throw error;
        
        return users || [];
    }

    static formatEventTime(dateString) {
        const date = new Date(dateString);
        const now = new Date();
        const diffInHours = (date - now) / (1000 * 60 * 60);

        if (diffInHours < 1) {
            return 'in less than an hour';
        } else if (diffInHours < 24) {
            return `in ${Math.round(diffInHours)} hours`;
        } else if (diffInHours < 48) {
            return 'tomorrow';
        } else {
            return `on ${this.formatDate(dateString)}`;
        }
    }

    static formatDateTime(dateString) {
        const date = new Date(dateString);
        return date.toLocaleString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    static formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }

    static formatTime(dateString) {
        const date = new Date(dateString);
        return date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    static getPaymentPriority(dueDate) {
        const now = new Date();
        const due = new Date(dueDate);
        const daysUntilDue = (due - now) / (1000 * 60 * 60 * 24);

        if (daysUntilDue < 1) return 'urgent';
        if (daysUntilDue < 3) return 'high';
        if (daysUntilDue < 7) return 'medium';
        return 'low';
    }
}

module.exports = NotificationHelpers;