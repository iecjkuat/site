/**
 * Security utilities for XSS prevention and input sanitization
 * Enhanced with TypeScript-style patterns for better security
 */

class SecurityUtils {
    /**
     * Escape HTML to prevent XSS attacks (borrowed from Instagram-style events)
     * @param {string} unsafe - Unsafe user input
     * @returns {string} - HTML-escaped string
     */
    static escapeHtml(unsafe) {
        if (typeof unsafe !== 'string') {
            return String(unsafe);
        }
        
        // Use DOM API for reliable escaping (borrowed pattern)
        const div = document.createElement('div');
        div.textContent = unsafe;
        return div.innerHTML;
    }

    /**
     * Escape HTML attributes (borrowed from Instagram-style events)
     * @param {string} unsafe - Unsafe attribute value
     * @returns {string} - Attribute-escaped string
     */
    static escapeAttr(unsafe) {
        return String(unsafe)
            .replaceAll('&', '&amp;')
            .replaceAll('"', '&quot;')
            .replaceAll("'", '&#39;')
            .replaceAll('<', '&lt;')
            .replaceAll('>', '&gt;');
    }

    /**
     * Sanitize user input for safe display
     * @param {string} input - User input
     * @returns {string} - Sanitized string
     */
    static sanitizeInput(input) {
        if (!input) return '';
        
        // Remove script tags and event handlers
        let sanitized = input.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
        sanitized = sanitized.replace(/on\w+="[^"]*"/gi, '');
        sanitized = sanitized.replace(/on\w+='[^']*'/gi, '');
        sanitized = sanitized.replace(/javascript:/gi, '');
        
        return this.escapeHtml(sanitized);
    }

    /**
     * Create safe HTML element with escaped content
     * @param {string} tag - HTML tag name
     * @param {string} content - Content to escape
     * @param {Object} attributes - Element attributes
     * @returns {HTMLElement} - Safe DOM element
     */
    static createSafeElement(tag, content = '', attributes = {}) {
        const element = document.createElement(tag);
        
        // Set text content safely (no HTML parsing)
        if (content) {
            element.textContent = content;
        }
        
        // Set attributes safely
        Object.entries(attributes).forEach(([key, value]) => {
            if (key === 'innerHTML' || key === 'outerHTML') {
                console.warn('Blocked unsafe attribute:', key);
                return;
            }
            element.setAttribute(key, this.escapeHtml(String(value)));
        });
        
        return element;
    }

    /**
     * Safe URL validation (borrowed from Instagram-style events)
     * @param {string} url - URL to validate
     * @returns {string} - Safe URL or '#' if invalid
     */
    static safeUrl(url) {
        try {
            const u = new URL(url, window.location.origin);
            if (!['http:', 'https:'].includes(u.protocol)) return '#';
            return u.toString();
        } catch {
            return '#';
        }
    }

    /**
     * Safe notification display (Instagram-style pattern)
     * @param {string} message - Message to display
     * @param {string} type - Notification type (success, error, warning)
     * @param {number} duration - Display duration in ms
     */
    static showNotification(message, type = 'info', duration = 3000) {
        // Remove existing messages
        document.querySelectorAll('.notification, .success-message, .error-message').forEach(el => el.remove());
        
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 10000;
            padding: 12px 20px;
            border-radius: 8px;
            font-weight: 600;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'};
            color: white;
            display: flex;
            align-items: center;
            gap: 8px;
        `;
        
        // Create icon element safely
        const icon = document.createElement('i');
        const iconMap = {
            success: 'fas fa-check-circle',
            error: 'fas fa-exclamation-triangle',
            warning: 'fas fa-exclamation-circle',
            info: 'fas fa-info-circle'
        };
        icon.className = iconMap[type] || iconMap.info;
        
        // Create text node safely
        const textNode = document.createTextNode(this.sanitizeInput(message));
        
        notification.appendChild(icon);
        notification.appendChild(textNode);
        document.body.appendChild(notification);
        
        // Auto-remove notification
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, duration);
    }

    /**
     * Safe error display for containers
     * @param {HTMLElement} container - Container element
     * @param {string} message - Error message
     * @param {string} prefix - Error prefix
     */
    static showError(container, message, prefix = 'Error') {
        container.innerHTML = ''; // Clear existing content
        
        const alertDiv = document.createElement('div');
        alertDiv.className = 'alert alert-danger';
        
        const icon = document.createElement('i');
        icon.className = 'fas fa-exclamation-triangle mr-2';
        
        const textNode = document.createTextNode(`${prefix}: ${this.sanitizeInput(message)}`);
        
        alertDiv.appendChild(icon);
        alertDiv.appendChild(textNode);
        container.appendChild(alertDiv);
    }

    /**
     * Validate and sanitize form data
     * @param {FormData|Object} formData - Form data to validate
     * @returns {Object} - Sanitized form data
     */
    static sanitizeFormData(formData) {
        const sanitized = {};
        
        if (formData instanceof FormData) {
            for (const [key, value] of formData.entries()) {
                sanitized[key] = this.sanitizeInput(value);
            }
        } else {
            Object.entries(formData).forEach(([key, value]) => {
                sanitized[key] = this.sanitizeInput(value);
            });
        }
        
        return sanitized;
    }

    /**
     * Generate secure random nonce for CSP
     * @returns {string} - Base64 encoded nonce
     */
    static generateNonce() {
        const array = new Uint8Array(16);
        crypto.getRandomValues(array);
        return btoa(String.fromCharCode.apply(null, array));
    }

    /**
     * Check if content is safe (basic validation)
     * @param {string} content - Content to check
     * @returns {boolean} - True if content appears safe
     */
    static isSafeContent(content) {
        if (!content) return true;
        
        const dangerousPatterns = [
            /<script/i,
            /javascript:/i,
            /on\w+=/i,
            /<iframe/i,
            /<object/i,
            /<embed/i,
            /data:text\/html/i
        ];
        
        return !dangerousPatterns.some(pattern => pattern.test(content));
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SecurityUtils;
} else {
    window.SecurityUtils = SecurityUtils;
}