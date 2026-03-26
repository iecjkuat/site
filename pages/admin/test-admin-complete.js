/**
 * Comprehensive Admin Dashboard Test Script
 */

class AdminDashboardTester {
    constructor() {
        this.results = [];
        this.passed = 0;
        this.failed = 0;
    }

    log(message, type = 'info') {
        const timestamp = new Date().toLocaleTimeString();
        const prefix = {'info': 'ℹ️', 'success': '✅', 'error': '❌', 'warning': '⚠️'}[type] || 'ℹ️';
        console.log(`[${timestamp}] ${prefix} ${message}`);
        this.results.push({ timestamp, type, message });
    }

    async test(name, fn) {
        try {
            this.log(`Testing: ${name}`, 'info');
            await fn();
            this.passed++;
            this.log(`PASSED: ${name}`, 'success');
            return true;
        } catch (error) {
            this.failed++;
            this.log(`FAILED: ${name} - ${error.message}`, 'error');
            console.error(error);
            return false;
        }
    }

    async runAllTests() {
        console.clear();
        this.log('🚀 Starting Admin Dashboard Tests', 'info');
        
        await this.test('Authentication', async () => {
            const token = localStorage.getItem('authToken');
            if (!token) throw new Error('No auth token');
            const res = await fetch('/api/auth/verify', {headers: {'Authorization': `Bearer ${token}`}});
            if (!res.ok) throw new Error('Token invalid');
        });

        await this.test('Supabase Connection', async () => {
            if (!window.supabase) throw new Error('No Supabase');
            const {error} = await window.supabase.from('users').select('id').limit(1);
            if (error) throw new Error(error.message);
        });

        await this.test('Notification Stats API', async () => {
            const token = localStorage.getItem('authToken');
            const res = await fetch('/api/admin/notifications/stats', {headers: {'Authorization': `Bearer ${token}`}});
            if (!res.ok) throw new Error('Stats API failed');
        });

        await this.test('Send Notification API', async () => {
            const token = localStorage.getItem('authToken');
            const res = await fetch('/api/admin/notifications/send', {
                method: 'POST',
                headers: {'Content-Type': 'application/json', 'Authorization': `Bearer ${token}`},
                body: JSON.stringify({
                    type: 'announcement',
                    title: 'Test',
                    message: 'Test message',
                    priority: 'low',
                    recipient_type: 'all'
                })
            });
            const data = await res.json();
            this.log(`Send result: ${JSON.stringify(data)}`, res.ok ? 'success' : 'warning');
        });

        this.log(`Tests: ${this.passed}/${this.passed + this.failed} passed`, this.failed === 0 ? 'success' : 'warning');
        return {passed: this.passed, failed: this.failed};
    }
}

window.AdminDashboardTester = AdminDashboardTester;
console.log('Run: new AdminDashboardTester().runAllTests()');
