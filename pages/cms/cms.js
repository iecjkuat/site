/**
 * JKUAT Innovation Club - Modular CMS System
 * Secure entry point with robust error handling and timeout protection
 */

import { SecureCMSManager } from '/cms/modules/cms-manager.js';

// Utility functions
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Trusted development host detection (security hardening)
const isTrustedDevHost = () => {
    const h = window.location.hostname;
    return (
        h === 'localhost' ||
        h === '127.0.0.1' ||
        h === '' || // file:// protocol (though protocol check is safer)
        h.startsWith('192.168.') ||
        h.startsWith('10.') ||
        h.endsWith('.local') ||
        h.startsWith('dev.') ||
        (h.includes('vercel.app') && h.includes('preview')) ||
        (h.includes('netlify.app') && h.includes('deploy-preview')) ||
        window.location.protocol === 'file:' // Explicit file:// check
    );
};

// More comprehensive but safer development detection
// SECURITY: Only honor debug flags on trusted hostnames to prevent production debug exposure
const isDevelopment = () => {
    const search = window.location.search;
    const debugFlag = search.includes('debug=1') || localStorage.getItem('cms-debug') === 'true';
    
    // Debug flags only work on trusted dev hosts
    return isTrustedDevHost() && debugFlag;
};

/**
 * Wait for auth manager with timeout protection
 * Prevents infinite hanging if auth system fails to load
 * SECURITY: Also checks for required methods to detect partial initialization
 */
async function waitForAuthManager(timeoutMs = 8000) {
    const start = Date.now();
    
    // Accept either AuthState (new) or authManager (legacy)
    while (true) {
        // New system: AuthState
        if (window.AuthState?.isAuthenticated !== undefined) {
            return; // AuthState is a getter, not a function — it's ready
        }
        // Legacy system: authManager
        if (typeof window.authManager?.isAuthenticated === 'function' &&
            typeof window.authManager?.getUser === 'function') {
            return;
        }
        if (Date.now() - start > timeoutMs) {
            throw new Error('Auth system did not load within timeout. Please refresh the page or check your connection.');
        }
        await sleep(100);
    }
}

// Module-scoped rate limiting (avoid window pollution)
let lastCMSErrorNotification = 0;
let lastCMSRejectionNotification = 0;

/**
 * Show user-friendly error message instead of harsh alert()
 * Accessible modal with proper ARIA attributes and keyboard support
 * SECURITY: Proper cleanup of event listeners to prevent memory leaks
 */
function showInitializationError(error) {
    // Log full error for debugging (only in dev)
    if (isDevelopment()) {
        console.error('❌ Full CMS initialization error:', error);
        console.error('Stack trace:', error.stack);
    } else {
        // Log the actual error in production too — needed for debugging
        console.error('CMS initialization failed:', error?.message || error);
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
    errorContainer.tabIndex = -1; // Make focusable for keyboard navigation
    errorContainer.setAttribute('role', 'dialog');
    errorContainer.setAttribute('aria-modal', 'true');
    errorContainer.setAttribute('aria-labelledby', 'error-title');
    errorContainer.setAttribute('aria-describedby', 'error-message');
    errorContainer.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: #000000;
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
    
    // Cleanup function to remove modal and event listeners
    const cleanup = () => {
        document.removeEventListener('keydown', onKeyDown);
        backdrop.remove();
    };
    
    // Keydown handler
    const onKeyDown = (e) => {
        if (e.key === 'Escape') {
            window.location.reload();
        }
    };
    
    // Setup event listeners
    document.addEventListener('keydown', onKeyDown);
    
    // Add event listeners with CSS hover effects
    refreshButton.addEventListener('click', () => window.location.reload());
    refreshButton.addEventListener('mouseover', () => refreshButton.style.backgroundColor = '#dc2626');
    refreshButton.addEventListener('mouseout', () => refreshButton.style.backgroundColor = '#ef4444');
    refreshButton.addEventListener('focus', () => refreshButton.style.backgroundColor = '#dc2626');
    refreshButton.addEventListener('blur', () => refreshButton.style.backgroundColor = '#ef4444');
    
    // Dashboard button - conditional redirect based on auth availability
    dashboardButton.addEventListener('click', () => {
        window.location.href = window.authManager ? '/dashboard' : '/';
    });
    dashboardButton.addEventListener('mouseover', () => dashboardButton.style.backgroundColor = '#4b5563');
    dashboardButton.addEventListener('mouseout', () => dashboardButton.style.backgroundColor = '#374151');
    dashboardButton.addEventListener('focus', () => dashboardButton.style.backgroundColor = '#4b5563');
    dashboardButton.addEventListener('blur', () => dashboardButton.style.backgroundColor = '#374151');
    
    // Backdrop click reloads
    backdrop.addEventListener('click', (e) => {
        if (e.target === backdrop) {
            window.location.reload();
        }
    });
    
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
        errorContainer.focus();
    }, 0);
    
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
        // Open the detailed HTML modal instead of generic form
        const modal = document.getElementById('createEventModal');
        if (modal) {
            modal.classList.remove('hidden');
        } else if (isDevelopment()) {
            console.warn('Event modal not found');
        }
    },
    
    showCreateOpportunity: () => {
        const modal = document.getElementById('createOpportunityModal');
        if (modal) {
            modal.classList.remove('hidden');
        } else if (typeof window.cmsManager?.showCreateForm === 'function') {
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
// SECURITY: Use defineProperty with non-writable in production to prevent tampering
if (isDevelopment()) {
    // In development, allow flexibility for hot reload
    Object.assign(window, cmsActions);
} else {
    // In production, make properties non-writable and non-configurable
    for (const [key, value] of Object.entries(cmsActions)) {
        Object.defineProperty(window, key, {
            value: value,
            writable: false,
            configurable: false,
            enumerable: true
        });
    }
}

// Freeze the cmsActions object itself (prevents modification of the object)
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
        
        // Accept either auth system
        const isAuthed = window.AuthState?.isAuthenticated
            || window.authManager?.isAuthenticated?.();

        if (!isAuthed) {
            sessionStorage.setItem('redirectAfterLogin', window.location.pathname);
            window.location.href = '/signin';
            return;
        }
        
        // Initialize CMS manager (handles all auth checks internally)
        window.cmsManager = new SecureCMSManager();
        
        // Verify CMS manager initialized properly with type checking
        if (typeof window.cmsManager?.switchTab !== 'function') {
            throw new Error('CMS Manager failed to initialize properly (missing switchTab method)');
        }

        if (isDevelopment()) {
            window.cmsDebug = {
                manager: window.cmsManager,
                reloadCMS: () => window.location.reload(),
                enableDebug: () => localStorage.setItem('cms-debug', 'true'),
                disableDebug: () => localStorage.removeItem('cms-debug')
            };
            console.log('✅ CMS initialized. Debug: window.cmsDebug');
        } else {
            console.log('✅ CMS initialized');
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
 * SECURITY: Enhanced detection using stack traces (bundler-safe)
 */
window.addEventListener('error', (event) => {
    // Enhanced CMS error detection using stack traces (bundler-safe)
    const stack = event.error?.stack || '';
    const isCMSError = (
        // Stack-based detection (works with bundlers)
        stack.includes('/modules/cms-') ||
        stack.includes('SecureCMSManager') ||
        stack.includes('CMSUI') ||
        stack.includes('CMSSecurity') ||
        stack.includes('CMSData') ||
        stack.includes('CMSAPI') ||
        // Filename-based detection (works in dev)
        event.filename?.includes('cms-manager.js') || 
        event.filename?.includes('cms-data.js') ||
        event.filename?.includes('cms-ui.js') ||
        event.filename?.includes('cms-security.js') ||
        event.filename?.includes('cms-api.js') ||
        event.filename?.includes('cms-supabase.js') ||
        event.filename?.includes('cms-notifications.js') ||
        event.filename?.includes('cms-editors.js') ||
        // Tagged errors
        (event.error?.cms === true)
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
 * SECURITY: Tightened detection to avoid silencing non-CMS errors
 */
window.addEventListener('unhandledrejection', (event) => {
    // Enhanced CMS-related promise rejection detection using stack traces
    const reason = event.reason;
    const stack = reason?.stack || '';
    const isCMSRejection = (
        // Stack-based detection (bundler-safe)
        stack.includes('/modules/cms-') ||
        stack.includes('SecureCMSManager') ||
        stack.includes('CMSUI') ||
        stack.includes('CMSSecurity') ||
        stack.includes('CMSData') ||
        stack.includes('CMSAPI') ||
        // Tagged errors
        (reason?.cms === true)
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