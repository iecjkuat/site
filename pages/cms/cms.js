/**
 * JKUAT Innovation Club - Modular CMS System
 * Minimal entry point - all functionality is in modules
 */

import { SecureCMSManager } from './modules/cms-manager.js';
import { CMSAnalytics } from './modules/cms-analytics.js';

// Global functions for HTML onclick compatibility
window.showCreateArticle = () => window.cmsManager?.showCreateForm('article');
window.showCreateEvent = () => window.cmsManager?.showCreateForm('event');
window.showCreateOpportunity = () => window.cmsManager?.showCreateForm('opportunity');
window.showMediaLibrary = () => window.cmsManager?.switchTab('media');
window.showAnalytics = () => CMSAnalytics.showAnalyticsModal();
window.showHomepageManager = () => window.cmsManager?.notifications.show('Homepage manager - Advanced feature coming soon! 🏠', 'info');

// Initialize CMS
document.addEventListener('DOMContentLoaded', async () => {
    console.log('🔧 Initializing Modular CMS...');
    
    try {
        // Wait for auth system
        while (!window.authManager) {
            await new Promise(resolve => setTimeout(resolve, 100));
        }
        
        // Initialize CMS manager (handles all auth checks internally)
        window.cmsManager = new SecureCMSManager();
        
    } catch (error) {
        console.error('❌ CMS initialization failed:', error);
        alert(`CMS initialization failed: ${error.message}`);
    }
});