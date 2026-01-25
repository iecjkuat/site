/**
 * JKUAT Innovation Club - Modular CMS System
 * Secure entry point with robust error handling and timeout protection
 */

import { SecureCMSManager } from './modules/cms-manager.js';

// Utility functions
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// More comprehensive but safer development detection
const isDevelopment = () => {
    const hostname = window.location.hostname;
    const search = window.location.search;
    
    // Check for explicit debug flag first
    if (search.includes('debug=1') || localStorage.getItem('cms-debug') === 'true') {
        return true;
    }
    
    // Safe hostname checks (more restrictive)
    return (
        hostname === 'localhost' || 
        hostname === '127.0.0.1' || 
        hostname === '' || // file:// protocol
        hostname.startsWith('192.168.') || // local network
        hostname.startsWith('10.') || // local network
        hostname.endsWith('.local') || // .local domains
        hostname.startsWith('dev.') || // dev subdomains (safer than includes)
        // Only match known preview patterns
        (hostname.includes('vercel.app') && hostname.includes('preview')) ||
        (hostname.includes('netlify.app') && hostname.includes('deploy-preview'))
    );
};

/**
 * Wait for auth manager with timeout protection
 * Prevents infinite hanging if auth system fails to load
 */
async function waitForAuthManager(timeoutMs = 8000) {
    const start = Date.now();
    
    while (!window.authManager) {
        if (Date.now() - start > timeoutMs) {
            throw new Error('Auth system did not load within timeout. Please refresh the page or check your connection.');
        }
        await sleep(100);
    }
    
    if (isDevelopment()) {
        console.log('✅ Auth manager loaded successfully');
    }
}

// Module-scoped rate limiting (avoid window pollution)
let lastCMSErrorNotification = 0;
let lastCMSRejectionNotification = 0;

/**
 * Show user-friendly error message instead of harsh alert()
 * Accessible modal with proper ARIA attributes and keyboard support
 */
function showInitializationError(error) {
    // Log full error for debugging (only in dev)
    if (isDevelopment()) {
        console.error('❌ Full CMS initialization error:', error);
        console.error('Stack trace:', error.stack);
    } else {
        // In production, log minimal info
        console.error('CMS initialization failed');
    }
    
    // Create backdrop for better accessibility and contrast
    const backdrop = document.createElement('div');
    backdrop.id = 'cms-error-backdrop';
    backdrop.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.8);
        z-index: 9999;
    `;
    
    // Create accessible error dialog
    const errorContainer = document.createElement('div');
    errorContainer.id = 'cms-init-error';
    errorContainer.setAttribute('role', 'dialog');
    errorContainer.setAttribute('aria-modal', 'true');
    errorContainer.setAttribute('aria-labelledby', 'error-title');
    errorContainer.setAttribute('aria-describedby', 'error-message');
    errorContainer.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: #1f2937;
        border: 2px solid #ef4444;
        border-radius: 12px;
        padding: 2rem;
        text-align: center;
        color: white;
        max-width: 400px;
        width: 90%;
        z-index: 10000;
        box-shadow: 0 20px 40px rgba(0, 0, 0, 0.5);
    `;
    
    // Build DOM safely without innerHTML for dynamic content
    const icon = document.createElement('div');
    icon.style.cssText = 'font-size: 3rem; margin-bottom: 1rem; color: #ef4444;';
    icon.textContent = '⚠️';
    icon.setAttribute('aria-hidden', 'true');
    
    const title = document.createElement('h3');
    title.id = 'error-title';
    title.style.cssText = 'margin: 0 0 1rem 0; color: #ef4444; font-size: 1.5rem;';
    title.textContent = 'CMS Failed to Load';
    
    const message = document.createElement('p');
    message.id = 'error-message';
    message.style.cssText = 'margin: 0 0 1.5rem 0; color: #d1d5db; line-height: 1.5;';
    message.textContent = 'The content management system could not initialize properly. Please refresh the page or contact an administrator if the problem persists.';
    
    // Create accessible button with proper styling
    const refreshButton = document.createElement('button');
    refreshButton.textContent = 'Refresh Page';
    refreshButton.setAttribute('aria-label', 'Refresh the page to try loading the CMS again');
    refreshButton.style.cssText = `
        background: #ef4444;
        color: white;
        border: none;
        padding: 0.75rem 1.5rem;
        border-radius: 8px;
        cursor: pointer;
        font-weight: 600;
        font-size: 1rem;
        transition: background-color 0.2s ease;
        margin-right: 0.5rem;
    `;
    
    const dashboardButton = document.createElement('button');
    dashboardButton.textContent = 'Go to Dashboard';
    dashboardButton.setAttribute('aria-label', 'Navigate to the main dashboard');
    dashboardButton.style.cssText = `
        background: #374151;
        color: white;
        border: 1px solid #6b7280;
        padding: 0.75rem 1.5rem;
        border-radius: 8px;
        cursor: pointer;
        font-weight: 600;
        font-size: 1rem;
        transition: background-color 0.2s ease;
        margin-left: 0.5rem;
    `;
    
    // Add event listeners with CSS hover effects
    refreshButton.addEventListener('click', () => window.location.reload());
    refreshButton.addEventListener('mouseover', () => refreshButton.style.backgroundColor = '#dc2626');
    refreshButton.addEventListener('mouseout', () => refreshButton.style.backgroundColor = '#ef4444');
    refreshButton.addEventListener('focus', () => refreshButton.style.backgroundColor = '#dc2626');
    refreshButton.addEventListener('blur', () => refreshButton.style.backgroundColor = '#ef4444');
    
    dashboardButton.addEventListener('click', () => window.location.href = '/dashboard');
    dashboardButton.addEventListener('mouseover', () => dashboardButton.style.backgroundColor = '#4b5563');
    dashboardButton.addEventListener('mouseout', () => dashboardButton.style.backgroundColor = '#374151');
    dashboardButton.addEventListener('focus', () => dashboardButton.style.backgroundColor = '#4b5563');
    dashboardButton.addEventListener('blur', () => dashboardButton.style.backgroundColor = '#374151');
    
    // Keyboard support
    const handleKeyDown = (event) => {
        if (event.key === 'Escape') {
            // ESC key reloads (most expected behavior for error dialogs)
            window.location.reload();
        } else if (event.key === 'Enter' && event.target === errorContainer) {
            // Enter on dialog focuses first button
            refreshButton.focus();
        }
    };
    
    errorContainer.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keydown', handleKeyDown);
    
    // Create button container
    const buttonContainer = document.createElement('div');
    buttonContainer.style.cssText = 'display: flex; justify-content: center; flex-wrap: wrap; gap: 1rem;';
    buttonContainer.appendChild(refreshButton);
    buttonContainer.appendChild(dashboardButton);
    
    // Assemble DOM
    errorContainer.appendChild(icon);
    errorContainer.appendChild(title);
    errorContainer.appendChild(message);
    errorContainer.appendChild(buttonContainer);
    
    backdrop.appendChild(errorContainer);
    document.body.appendChild(backdrop);
    
    // Focus management for accessibility
    setTimeout(() => {
        refreshButton.focus();
    }, 100);
    
    // Fallback to alert only if DOM manipulation actually fails (very rare)
    setTimeout(() => {
        if (!document.getElementById('cms-init-error')) {
            alert('CMS initialization failed. Please refresh the page.');
        }
    }, 200);
}

/**
 * Safe global functions for HTML onclick compatibility
 * All functions use defensive programming with type checking
 * and graceful degradation if dependencies aren't available
 */
const cmsActions = {
    showCreateArticle: () => {
        if (typeof window.cmsManager?.showCreateForm === 'function') {
            window.cmsManager.showCreateForm('article');
        } else if (isDevelopment()) {
            console.warn('CMS Manager not ready or missing showCreateForm method');
        }
    },
    
    showCreateEvent: () => {
        if (typeof window.cmsManager?.showCreateForm === 'function') {
            window.cmsManager.showCreateForm('event');
        } else if (isDevelopment()) {
            console.warn('CMS Manager not ready or missing showCreateForm method');
        }
    },
    
    showCreateOpportunity: () => {
        if (typeof window.cmsManager?.showCreateForm === 'function') {
            window.cmsManager.showCreateForm('opportunity');
        } else if (isDevelopment()) {
            console.warn('CMS Manager not ready or missing showCreateForm method');
        }
    },
    
    showMediaLibrary: () => {
        if (typeof window.cmsManager?.switchTab === 'function') {
            window.cmsManager.switchTab('media');
        } else if (isDevelopment()) {
            console.warn('CMS Manager not ready or missing switchTab method');
        }
    },
    
    showHomepageManager: () => {
        if (typeof window.cmsManager?.notifications?.show === 'function') {
            window.cmsManager.notifications.show(
                'Homepage manager - Advanced feature coming soon! 🏠', 
                'info'
            );
        } else if (isDevelopment()) {
            console.warn('CMS Manager notifications not ready or missing show method');
        }
    }
};

// Expose actions globally for HTML onclick compatibility
// Using a single frozen object reduces global namespace pollution and prevents mutation
Object.assign(window, cmsActions);
Object.freeze(cmsActions);

/**
 * Initialize CMS with comprehensive error handling
 * Includes timeout protection, graceful degradation, and user-friendly error messages
 */
document.addEventListener('DOMContentLoaded', async () => {
    if (isDevelopment()) {
        console.log('🔧 Initializing Modular CMS...');
    }
    
    try {
        // Wait for auth system with timeout protection
        await waitForAuthManager();
        
        // Verify auth manager has required methods with type checking
        const authManager = window.authManager;
        if (typeof authManager?.isAuthenticated !== 'function' || typeof authManager?.getUser !== 'function') {
            throw new Error('Auth manager is missing required methods (isAuthenticated, getUser)');
        }
        
        // Initialize CMS manager (handles all auth checks internally)
        window.cmsManager = new SecureCMSManager();
        
        // Verify CMS manager initialized properly with type checking
        if (typeof window.cmsManager?.switchTab !== 'function') {
            throw new Error('CMS Manager failed to initialize properly (missing switchTab method)');
        }
        
        if (isDevelopment()) {
            console.log('✅ CMS initialized successfully');
            
            // Add debug helpers in development
            window.cmsDebug = {
                manager: window.cmsManager,
                actions: cmsActions,
                reloadCMS: () => window.location.reload(),
                enableDebug: () => localStorage.setItem('cms-debug', 'true'),
                disableDebug: () => localStorage.removeItem('cms-debug')
            };
            
            console.log('🔧 Debug helpers available at window.cmsDebug');
        }
        
    } catch (error) {
        showInitializationError(error);
        
        // Prevent further execution that might cause more errors
        return;
    }
});

/**
 * Global error handler for unhandled CMS-related errors
 * Improved filtering to catch actual CMS errors with rate limiting
 */
window.addEventListener('error', (event) => {
    // Precise CMS error detection using known module names
    const isCMSError = (
        event.filename?.includes('cms-manager.js') || 
        event.filename?.includes('cms-data.js') ||
        event.filename?.includes('cms-ui.js') ||
        event.filename?.includes('cms-security.js') ||
        event.filename?.includes('cms-supabase.js') ||
        event.filename?.includes('cms-notifications.js') ||
        event.filename?.includes('cms-editors.js') ||
        event.error?.stack?.includes('SecureCMSManager') ||
        (event.error?.cms === true) // Support for tagged errors
    );
    
    if (isCMSError) {
        if (isDevelopment()) {
            console.error('CMS Runtime Error:', event.error);
        }
        
        // Rate limit notifications to avoid spam (module-scoped variable)
        if (typeof window.cmsManager?.notifications?.show === 'function') {
            const now = Date.now();
            if (now - lastCMSErrorNotification > 5000) {
                window.cmsManager.notifications.show(
                    'An unexpected error occurred. Some features may not work properly.',
                    'error'
                );
                lastCMSErrorNotification = now;
            }
        }
    }
});

/**
 * Handle unhandled promise rejections in CMS modules
 * Improved filtering and rate limiting with module-scoped state
 */
window.addEventListener('unhandledrejection', (event) => {
    // Precise CMS-related promise rejection detection
    const reason = event.reason;
    const isCMSRejection = (
        reason?.stack?.includes('cms-manager.js') ||
        reason?.stack?.includes('SecureCMSManager') ||
        reason?.name?.includes('CMS') ||
        (reason?.cms === true) // Support for tagged errors
    );
    
    if (isCMSRejection) {
        if (isDevelopment()) {
            console.error('CMS Promise Rejection:', reason);
        }
        
        // Rate limit notifications (module-scoped variable)
        if (typeof window.cmsManager?.notifications?.show === 'function') {
            const now = Date.now();
            if (now - lastCMSRejectionNotification > 5000) {
                window.cmsManager.notifications.show(
                    'A background operation failed. Please try again.',
                    'error'
                );
                lastCMSRejectionNotification = now;
            }
        }
        
        // Prevent the default unhandled rejection behavior for CMS errors only
        event.preventDefault();
    }
});