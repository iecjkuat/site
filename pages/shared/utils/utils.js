/**
 * JKUAT Innovation Club - Shared Utilities
 * Unified helper functions for all pages
 */

const Utils = {
    /**
     * Escape HTML special characters to prevent XSS
     * @param {string} unsafe 
     * @returns {string}
     */
    escapeHtml(unsafe) {
        if (!unsafe || typeof unsafe !== 'string') return '';
        return unsafe
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    },

    /**
     * Show a modern toast notification
     * @param {string} message 
     * @param {string} type - 'success', 'error', 'info', 'warning'
     */
    showToast(message, type = 'info') {
        // Source of truth for toasts is now here in Utils.
        // We removed the redirection to window.homePage.showToast to prevent infinite recursion.

        const toastTypes = {
            success: { bg: 'rgba(16, 185, 129, 0.9)', color: '#ffffff', icon: 'fa-check-circle' },
            error: { bg: 'rgba(239, 68, 68, 0.9)', color: '#ffffff', icon: 'fa-exclamation-circle' },
            info: { bg: 'rgba(59, 130, 246, 0.9)', color: '#ffffff', icon: 'fa-info-circle' },
            warning: { bg: 'rgba(245, 158, 11, 0.9)', color: '#ffffff', icon: 'fa-exclamation-triangle' }
        };

        const theme = toastTypes[type] || toastTypes.info;

        // Remove existing toasts of same type to avoid clutter
        document.querySelectorAll(`.utility-toast-${type}`).forEach(t => t.remove());

        const toast = document.createElement('div');
        toast.className = `utility-toast utility-toast-${type}`;
        toast.style.cssText = `
            position: fixed;
            top: 2rem;
            right: 2rem;
            background: ${theme.bg};
            backdrop-filter: blur(10px);
            color: ${theme.color};
            padding: 1rem 1.5rem;
            border-radius: 0.75rem;
            font-size: 0.875rem;
            font-weight: 500;
            z-index: 11000;
            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
            display: flex;
            align-items: center;
            gap: 0.75rem;
            transform: translateX(120%);
            transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
            max-width: 350px;
        `;

        toast.innerHTML = `
            <i class="fas ${theme.icon}"></i>
            <span>${message}</span>
        `;

        document.body.appendChild(toast);

        // Animate in
        requestAnimationFrame(() => toast.style.transform = 'translateX(0)');

        // Remove after 4s
        const timeout = setTimeout(() => {
            toast.style.transform = 'translateX(120%)';
            setTimeout(() => toast.remove(), 300);
        }, 4000);

        // Allow manual close on click
        toast.onclick = () => {
            clearTimeout(timeout);
            toast.style.transform = 'translateX(120%)';
            setTimeout(() => toast.remove(), 300);
        };
    },

    /**
     * Format timestamp to relative time (e.g., "2 hours ago")
     * @param {string|Date} date 
     * @returns {string}
     */
    getTimeAgo(date) {
        const seconds = Math.floor((new Date() - new Date(date)) / 1000);
        let interval = seconds / 31536000;

        if (interval > 1) return Math.floor(interval) + " years ago";
        interval = seconds / 2592000;
        if (interval > 1) return Math.floor(interval) + " months ago";
        interval = seconds / 86400;
        if (interval > 1) return Math.floor(interval) + " days ago";
        interval = seconds / 3600;
        if (interval > 1) return Math.floor(interval) + " hours ago";
        interval = seconds / 60;
        if (interval > 1) return Math.floor(interval) + " minutes ago";
        return Math.floor(seconds) + " seconds ago";
    }
};

window.Utils = Utils;
