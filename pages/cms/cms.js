/**
 * CMS Entry Point
 * Bootstraps the CMS after auth is confirmed.
 */

import { SecureCMSManager } from '/cms/modules/cms-manager.js';

// ── Auth wait — event-driven ────────────────────────────
function waitForAuth(timeoutMs = 8000) {
    return new Promise((resolve, reject) => {
        // Are we already authenticated?
        if (window.AuthState?.isAuthenticated !== undefined || 
            typeof window.authManager?.isAuthenticated === 'function') {
            return resolve();
        }

        // Wait for the authReady event
        const timer = setTimeout(() => {
            document.removeEventListener('authReady', onReady);
            reject(new Error('Auth system timed out. Please refresh the page.'));
        }, timeoutMs);

        const onReady = () => { 
            clearTimeout(timer); 
            resolve(); 
        };
        
        document.addEventListener('authReady', onReady, { once: true });
    });
}

// ── Error UI ──────────────────────────────────────────────────────────────────
function showError(error) {
    console.error('CMS failed to load:', error?.message || error);

    // Remove any existing error UI
    document.getElementById('cms-error-backdrop')?.remove();

    const backdrop = document.createElement('div');
    backdrop.id = 'cms-error-backdrop';
    backdrop.className = 'cms-error-backdrop';

    const dialog = document.createElement('div');
    dialog.setAttribute('role', 'dialog');
    dialog.setAttribute('aria-modal', 'true');
    dialog.setAttribute('aria-labelledby', 'cms-err-title');
    dialog.className = 'cms-error-dialog';
    dialog.tabIndex = -1;

    const title = document.createElement('h3');
    title.id = 'cms-err-title';
    title.textContent = 'CMS Failed to Load';

    const msg = document.createElement('p');
    msg.textContent = error?.message?.includes('timeout')
        ? 'Authentication timed out. Please check your connection and try again.'
        : 'The CMS could not initialize. Please refresh or contact an administrator.';

    const btnRow = document.createElement('div');
    btnRow.className = 'cms-error-buttons';

    const refreshBtn = document.createElement('button');
    refreshBtn.textContent = 'Refresh';
    refreshBtn.className = 'cms-error-btn cms-error-btn--primary';
    refreshBtn.addEventListener('click', () => window.location.reload());

    const dashBtn = document.createElement('button');
    dashBtn.textContent = 'Go to Dashboard';
    dashBtn.className = 'cms-error-btn cms-error-btn--secondary';
    dashBtn.addEventListener('click', () => { window.location.href = '/dashboard'; });

    btnRow.append(refreshBtn, dashBtn);
    dialog.append(title, msg, btnRow);
    backdrop.appendChild(dialog);
    document.body.appendChild(backdrop);

    // Escape key
    const onKey = (e) => { if (e.key === 'Escape') window.location.reload(); };
    document.addEventListener('keydown', onKey, { once: true });

    // Focus for accessibility
    requestAnimationFrame(() => dialog.focus());
}

// ── Bootstrap ─────────────────────────────────────────────────────────────────
async function bootstrapCMS() {
    console.log('CMS: bootstrapping...');

    try {
        await waitForAuth();

        const isAuthed = window.AuthState?.isAuthenticated || 
                        window.authManager?.isAuthenticated?.();

        if (!isAuthed) {
            sessionStorage.setItem('redirectAfterLogin', window.location.pathname);
            window.location.href = '/signin';
            return;
        }

        window.cmsManager = new SecureCMSManager();

        if (typeof window.cmsManager?.switchTab !== 'function') {
            throw new Error('CMS Manager did not initialize correctly.');
        }

        console.log('CMS: ready');

    } catch (err) {
        showError(err);
    }
}

document.addEventListener('DOMContentLoaded', bootstrapCMS);
