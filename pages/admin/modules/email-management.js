/**
 * Admin Email Management Module
 * Send emails, test Resend integration, view email history
 */

class EmailManagement {
    constructor(adminDashboard) {
        this.admin = adminDashboard;
        this.isSending = false;
    }

    async init() {
        this.render();
    }

    getToken() {
        return localStorage.getItem('authToken') || '';
    }

    render() {
        const container = document.getElementById('emailContent');
        if (!container) return;

        container.innerHTML = `
            <div style="padding:0 0 2rem 0;">
                <!-- Header -->
                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:2rem;flex-wrap:wrap;gap:1rem;">
                    <div>
                        <h2 style="margin:0;color:white;"><i class="fas fa-envelope"></i> Email Management</h2>
                        <p style="margin:0.5rem 0 0;color:rgba(255,255,255,0.6);">Send emails and test your Resend integration</p>
                    </div>
                </div>

                <!-- Cards row -->
                <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:1.5rem;margin-bottom:2rem;">

                    <!-- Test Email Card -->
                    <div style="background:rgba(59,130,246,0.1);border:1px solid rgba(59,130,246,0.3);border-radius:1rem;padding:1.5rem;">
                        <h3 style="color:white;margin:0 0 1rem;"><i class="fas fa-flask" style="color:#3b82f6;"></i> Test Email</h3>
                        <p style="color:rgba(255,255,255,0.7);font-size:0.9rem;margin-bottom:1rem;">Send a test email to verify Resend is working correctly.</p>
                        <input type="email" id="testEmailTo" placeholder="recipient@example.com"
                            style="width:100%;padding:0.75rem;border-radius:0.5rem;border:1px solid rgba(255,255,255,0.2);background:rgba(255,255,255,0.1);color:white;margin-bottom:0.75rem;box-sizing:border-box;">
                        <button id="sendTestEmailBtn" class="btn btn-primary" style="width:100%;">
                            <i class="fas fa-paper-plane"></i> Send Test Email
                        </button>
                        <div id="testEmailResult" style="margin-top:0.75rem;font-size:0.85rem;"></div>
                    </div>

                    <!-- Welcome Email Card -->
                    <div style="background:rgba(16,185,129,0.1);border:1px solid rgba(16,185,129,0.3);border-radius:1rem;padding:1.5rem;">
                        <h3 style="color:white;margin:0 0 1rem;"><i class="fas fa-hand-wave" style="color:#10b981;"></i> Welcome Email</h3>
                        <p style="color:rgba(255,255,255,0.7);font-size:0.9rem;margin-bottom:1rem;">Manually send a welcome email to a user by their User ID.</p>
                        <input type="text" id="welcomeUserId" placeholder="User UUID"
                            style="width:100%;padding:0.75rem;border-radius:0.5rem;border:1px solid rgba(255,255,255,0.2);background:rgba(255,255,255,0.1);color:white;margin-bottom:0.75rem;box-sizing:border-box;">
                        <button id="sendWelcomeBtn" class="btn btn-success" style="width:100%;background:linear-gradient(135deg,#10b981,#059669);border:none;color:white;padding:0.75rem;border-radius:0.5rem;cursor:pointer;font-weight:600;">
                            <i class="fas fa-paper-plane"></i> Send Welcome Email
                        </button>
                        <div id="welcomeEmailResult" style="margin-top:0.75rem;font-size:0.85rem;"></div>
                    </div>

                    <!-- Bulk Announcement Card -->
                    <div style="background:rgba(245,158,11,0.1);border:1px solid rgba(245,158,11,0.3);border-radius:1rem;padding:1.5rem;">
                        <h3 style="color:white;margin:0 0 1rem;"><i class="fas fa-bullhorn" style="color:#f59e0b;"></i> Bulk Announcement</h3>
                        <p style="color:rgba(255,255,255,0.7);font-size:0.9rem;margin-bottom:1rem;">Send an announcement email to all active members.</p>
                        <input type="text" id="announcementSubject" placeholder="Subject"
                            style="width:100%;padding:0.75rem;border-radius:0.5rem;border:1px solid rgba(255,255,255,0.2);background:rgba(255,255,255,0.1);color:white;margin-bottom:0.75rem;box-sizing:border-box;">
                        <textarea id="announcementBody" placeholder="Message body..." rows="3"
                            style="width:100%;padding:0.75rem;border-radius:0.5rem;border:1px solid rgba(255,255,255,0.2);background:rgba(255,255,255,0.1);color:white;margin-bottom:0.75rem;box-sizing:border-box;resize:vertical;"></textarea>
                        <button id="sendAnnouncementBtn" class="btn" style="width:100%;background:linear-gradient(135deg,#f59e0b,#d97706);border:none;color:white;padding:0.75rem;border-radius:0.5rem;cursor:pointer;font-weight:600;">
                            <i class="fas fa-paper-plane"></i> Send to All Members
                        </button>
                        <div id="announcementResult" style="margin-top:0.75rem;font-size:0.85rem;"></div>
                    </div>
                </div>

                <!-- Config status -->
                <div style="background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);border-radius:1rem;padding:1.5rem;">
                    <h3 style="color:white;margin:0 0 1rem;"><i class="fas fa-cog"></i> Email Configuration</h3>
                    <div id="emailConfigStatus" style="color:rgba(255,255,255,0.7);">
                        <p>Checking configuration...</p>
                    </div>
                </div>
            </div>
        `;

        this.attachListeners();
        this.checkConfig();
    }

    attachListeners() {
        document.getElementById('sendTestEmailBtn')?.addEventListener('click', () => this.sendTestEmail());
        document.getElementById('sendWelcomeBtn')?.addEventListener('click', () => this.sendWelcomeEmail());
        document.getElementById('sendAnnouncementBtn')?.addEventListener('click', () => this.sendAnnouncement());
    }

    showResult(elementId, message, success) {
        const el = document.getElementById(elementId);
        if (!el) return;
        el.innerHTML = `<span style="color:${success ? '#10b981' : '#ef4444'};">
            <i class="fas fa-${success ? 'check-circle' : 'exclamation-circle'}"></i> ${this.escapeHTML(message)}
        </span>`;
    }

    async sendTestEmail() {
        const to = document.getElementById('testEmailTo')?.value?.trim();
        if (!to) { this.showResult('testEmailResult', 'Please enter a recipient email', false); return; }

        const btn = document.getElementById('sendTestEmailBtn');
        btn.disabled = true;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';

        try {
            const res = await fetch('/api/v1/email/test', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${this.getToken()}` },
                body: JSON.stringify({ to })
            });
            const data = await res.json();
            this.showResult('testEmailResult', res.ok ? `Sent to ${to}` : (data.error || data.message), res.ok);
        } catch (e) {
            this.showResult('testEmailResult', e.message, false);
        } finally {
            btn.disabled = false;
            btn.innerHTML = '<i class="fas fa-paper-plane"></i> Send Test Email';
        }
    }

    async sendWelcomeEmail() {
        const userId = document.getElementById('welcomeUserId')?.value?.trim();
        if (!userId) { this.showResult('welcomeEmailResult', 'Please enter a User ID', false); return; }

        const btn = document.getElementById('sendWelcomeBtn');
        btn.disabled = true;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';

        try {
            const res = await fetch('/api/v1/email/welcome', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${this.getToken()}` },
                body: JSON.stringify({ userId })
            });
            const data = await res.json();
            this.showResult('welcomeEmailResult', res.ok ? `Welcome email sent to ${data.recipient}` : (data.error || data.message), res.ok);
        } catch (e) {
            this.showResult('welcomeEmailResult', e.message, false);
        } finally {
            btn.disabled = false;
            btn.innerHTML = '<i class="fas fa-paper-plane"></i> Send Welcome Email';
        }
    }

    async sendAnnouncement() {
        const subject = document.getElementById('announcementSubject')?.value?.trim();
        const body = document.getElementById('announcementBody')?.value?.trim();
        if (!subject || !body) { this.showResult('announcementResult', 'Subject and message are required', false); return; }

        if (!confirm(`Send this announcement to ALL active members?\n\nSubject: ${subject}`)) return;

        const btn = document.getElementById('sendAnnouncementBtn');
        btn.disabled = true;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';

        try {
            const res = await fetch('/api/v1/email/announcement', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${this.getToken()}` },
                body: JSON.stringify({ subject, body })
            });
            const data = await res.json();
            this.showResult('announcementResult', res.ok ? `Sent to ${data.sentCount} members` : (data.error || data.message), res.ok);
        } catch (e) {
            this.showResult('announcementResult', e.message, false);
        } finally {
            btn.disabled = false;
            btn.innerHTML = '<i class="fas fa-paper-plane"></i> Send to All Members';
        }
    }

    checkConfig() {
        const el = document.getElementById('emailConfigStatus');
        if (!el) return;
        el.innerHTML = `
            <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:1rem;">
                <div><span style="color:#10b981;">✅</span> Provider: <strong style="color:white;">Resend</strong></div>
                <div><span style="color:#10b981;">✅</span> From: <strong style="color:white;">noreply@iecjkuat.com</strong></div>
                <div><span style="color:#10b981;">✅</span> Domain: <strong style="color:white;">iecjkuat.com</strong></div>
                <div><span style="color:#f59e0b;">⚠️</span> API Key: <strong style="color:white;">Set via env var</strong></div>
            </div>
            <p style="margin-top:1rem;font-size:0.85rem;color:rgba(255,255,255,0.5);">
                Use the Test Email card above to verify the integration is working end-to-end.
            </p>
        `;
    }

    escapeHTML(str) {
        if (!str) return '';
        const d = document.createElement('div');
        d.textContent = str;
        return d.innerHTML;
    }
}

window.EmailManagement = EmailManagement;
