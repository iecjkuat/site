/**
 * Event Details Modal Component
 * Handles event details display and interactions
 */

class EventModal {
    constructor(eventsService) {
        this.eventsService = eventsService;
        this.currentEvent = null;
        this.onRegister = null;
        this.init();
    }

    init() {
        this.bindEvents();
    }

    bindEvents() {
        // Modal controls
        document.getElementById('closeModalBtn')?.addEventListener('click', () => {
            this.close();
        });

        document.getElementById('modalRegisterBtn')?.addEventListener('click', () => {
            this.handleRegistration();
        });

        document.getElementById('modalShareBtn')?.addEventListener('click', () => {
            this.shareEvent();
        });

        document.getElementById('modalReminderBtn')?.addEventListener('click', () => {
            this.setReminder();
        });

        // Close on outside click
        document.getElementById('eventDetailsModal')?.addEventListener('click', (e) => {
            if (e.target.id === 'eventDetailsModal') {
                this.close();
            }
        });
    }

    async show(eventId) {
        try {
            const event = await this.eventsService.getEvent(eventId);
            this.currentEvent = event;
            
            this.populateModal(event);
            this.generateQRCode(event);
            this.updateButtons(event);
            
            document.getElementById('eventDetailsModal').style.display = 'block';
            document.body.style.overflow = 'hidden';
            
        } catch (error) {
            console.error('Error loading event details:', error);
            this.showNotification('Error', 'Failed to load event details', 'error');
        }
    }

    close() {
        document.getElementById('eventDetailsModal').style.display = 'none';
        document.body.style.overflow = 'auto';
        this.currentEvent = null;
    }

    populateModal(event) {
        // Title and category
        document.getElementById('modalEventTitle').textContent = event.title;
        
        const categoryEl = document.getElementById('modalEventCategory');
        const categoryColor = this.eventsService.getCategoryColor(event.event_type);
        categoryEl.textContent = event.event_type;
        categoryEl.style.background = `${categoryColor}20`;
        categoryEl.style.color = categoryColor;
        
        // Event details
        const detailsEl = document.getElementById('modalEventDetails');
        detailsEl.innerHTML = this.createDetailsHTML(event);
    }

    createDetailsHTML(event) {
        const startDate = new Date(event.start_date);
        const endDate = new Date(event.end_date);
        const isMultiDay = startDate.toDateString() !== endDate.toDateString();
        
        return `
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1.5rem; margin-bottom: 2rem;">
                ${this.createDateTimeSection(event, isMultiDay)}
                ${this.createLocationSection(event)}
                ${this.createAttendanceSection(event)}
                ${this.createFeeSection(event)}
            </div>
            
            ${this.createDescriptionSection(event)}
            ${this.createTagsSection(event)}
            ${this.createDeadlineSection(event)}
        `;
    }

    createDateTimeSection(event, isMultiDay) {
        return `
            <div>
                <h4 style="color: white; font-weight: 600; margin-bottom: 0.5rem;">📅 Date & Time</h4>
                <p style="color: rgba(255, 255, 255, 0.8); margin-bottom: 0.25rem;">
                    ${isMultiDay 
                        ? `${this.eventsService.formatEventDate(event.start_date)} - ${this.eventsService.formatEventDate(event.end_date)}`
                        : this.eventsService.formatEventDate(event.start_date)
                    }
                </p>
                <p style="color: rgba(255, 255, 255, 0.8);">
                    ${this.eventsService.formatEventTime(event.start_date)} - ${this.eventsService.formatEventTime(event.end_date)}
                </p>
            </div>
        `;
    }

    createLocationSection(event) {
        return `
            <div>
                <h4 style="color: white; font-weight: 600; margin-bottom: 0.5rem;">📍 Location</h4>
                <p style="color: rgba(255, 255, 255, 0.8);">${event.location}</p>
                ${event.venue_details ? `<p style="color: rgba(255, 255, 255, 0.6); font-size: 0.875rem;">${event.venue_details}</p>` : ''}
            </div>
        `;
    }

    createAttendanceSection(event) {
        return `
            <div>
                <h4 style="color: white; font-weight: 600; margin-bottom: 0.5rem;">👥 Attendance</h4>
                <p style="color: rgba(255, 255, 255, 0.8);">
                    ${event.stats.totalAttendees} ${event.max_attendees ? `of ${event.max_attendees}` : ''} attendees
                </p>
                ${event.max_attendees && event.stats.spotsRemaining !== null ? 
                    `<p style="color: ${event.stats.spotsRemaining > 0 ? '#10b981' : '#ef4444'}; font-size: 0.875rem;">
                        ${event.stats.spotsRemaining > 0 ? `${event.stats.spotsRemaining} spots remaining` : 'Event is full'}
                    </p>` : ''
                }
            </div>
        `;
    }

    createFeeSection(event) {
        return `
            <div>
                <h4 style="color: white; font-weight: 600; margin-bottom: 0.5rem;">💰 Fee</h4>
                <p style="color: rgba(255, 255, 255, 0.8);">
                    ${event.fee > 0 ? `KES ${event.fee.toLocaleString()}` : 'Free for members'}
                </p>
            </div>
        `;
    }

    createDescriptionSection(event) {
        return `
            <div style="margin-bottom: 2rem;">
                <h4 style="color: white; font-weight: 600; margin-bottom: 0.5rem;">📝 Description</h4>
                <p style="color: rgba(255, 255, 255, 0.8); line-height: 1.6;">${event.description}</p>
            </div>
        `;
    }

    createTagsSection(event) {
        if (!event.tags || event.tags.length === 0) return '';
        
        return `
            <div style="margin-bottom: 2rem;">
                <h4 style="color: white; font-weight: 600; margin-bottom: 0.5rem;">🏷️ Tags</h4>
                <div style="display: flex; flex-wrap: wrap; gap: 0.5rem;">
                    ${event.tags.map(tag => `
                        <span style="background: rgba(255, 255, 255, 0.1); color: rgba(255, 255, 255, 0.8); font-size: 0.875rem; padding: 0.5rem 1rem; border-radius: 20px; border: 1px solid rgba(255, 255, 255, 0.2);">
                            ${tag}
                        </span>
                    `).join('')}
                </div>
            </div>
        `;
    }

    createDeadlineSection(event) {
        if (!event.registration_deadline) return '';
        
        return `
            <div style="background: rgba(245, 158, 11, 0.1); border: 1px solid rgba(245, 158, 11, 0.2); border-radius: 8px; padding: 1rem; margin-bottom: 2rem;">
                <h4 style="color: #f59e0b; font-weight: 600; margin-bottom: 0.5rem;">⏰ Registration Deadline</h4>
                <p style="color: rgba(255, 255, 255, 0.8);">
                    ${new Date(event.registration_deadline).toLocaleDateString('en-US', { 
                        weekday: 'long', 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric',
                        hour: 'numeric',
                        minute: '2-digit'
                    })}
                </p>
            </div>
        `;
    }

    async generateQRCode(event) {
        try {
            const authManager = window.jkuatApp?.getModule('auth');
            if (!authManager || !authManager.isLoggedIn()) return;

            const qrData = {
                eventId: event.id,
                eventTitle: event.title,
                attendeeId: authManager.getUser()?.id,
                timestamp: new Date().toISOString()
            };
            
            const qrCodeContainer = document.getElementById('qrCodeContainer');
            const qrCodeSection = document.getElementById('qrCodeSection');
            
            qrCodeContainer.innerHTML = '';
            
            await QRCode.toCanvas(qrCodeContainer, JSON.stringify(qrData), {
                width: 200,
                margin: 2,
                color: {
                    dark: '#000000',
                    light: '#FFFFFF'
                }
            });
            
            qrCodeSection.style.display = 'block';
            
        } catch (error) {
            console.error('Error generating QR code:', error);
        }
    }

    updateButtons(event) {
        const registerBtn = document.getElementById('modalRegisterBtn');
        const isRegistrationOpen = this.eventsService.isRegistrationOpen(event);
        
        if (isRegistrationOpen) {
            registerBtn.innerHTML = '<i class="fas fa-calendar-plus"></i>Register for Event';
            registerBtn.className = 'btn btn-primary';
            registerBtn.disabled = false;
        } else {
            registerBtn.innerHTML = '<i class="fas fa-calendar-times"></i>Registration Closed';
            registerBtn.className = 'btn btn-glass';
            registerBtn.disabled = true;
        }
    }

    handleRegistration() {
        if (!this.currentEvent || !this.onRegister) return;
        
        const eventData = {
            target: {
                dataset: {
                    eventId: this.currentEvent.id,
                    eventTitle: this.currentEvent.title,
                    eventFee: this.currentEvent.fee
                }
            }
        };
        
        this.onRegister(eventData);
        this.close();
    }

    shareEvent() {
        if (!this.currentEvent) return;
        
        const event = this.currentEvent;
        const shareData = {
            title: event.title,
            text: `Join me at ${event.title} - ${event.description.substring(0, 100)}...`,
            url: `${window.location.origin}/events?event=${event.id}`
        };
        
        if (navigator.share) {
            navigator.share(shareData);
        } else {
            navigator.clipboard.writeText(`${shareData.title}\n${shareData.text}\n${shareData.url}`);
            this.showNotification('Shared', 'Event details copied to clipboard', 'success');
        }
    }

    setReminder() {
        if (!this.currentEvent) return;
        
        const event = this.currentEvent;
        const eventDate = new Date(event.start_date);
        const reminderTime = new Date(eventDate.getTime() - 24 * 60 * 60 * 1000);
        
        const reminders = JSON.parse(localStorage.getItem('eventReminders') || '[]');
        const reminder = {
            eventId: event.id,
            eventTitle: event.title,
            eventDate: event.start_date,
            reminderTime: reminderTime.toISOString(),
            created: new Date().toISOString()
        };
        
        reminders.push(reminder);
        localStorage.setItem('eventReminders', JSON.stringify(reminders));
        
        this.showNotification('Reminder Set', `You'll be reminded 24 hours before ${event.title}`, 'success');
    }

    setRegisterCallback(callback) {
        this.onRegister = callback;
    }

    showNotification(title, message, type = 'success') {
        // This would typically call a global notification system
        console.log(`${type.toUpperCase()}: ${title} - ${message}`);
    }
}

window.EventModal = EventModal;