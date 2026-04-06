/**
 * CMS Security Module
 * Handles input sanitization, validation, and security utilities
 * Enhanced with robust error handling and secure practices
 */

export class CMSSecurity {
    static sanitizeForDisplay(obj, fields = []) {
        const source = obj && typeof obj === 'object' ? obj : {};
        const sanitized = {};
        for (const field of fields) {
            sanitized[field] = this.escapeHtml(source[field]);
        }
        return sanitized;
    }

    /**
     * IMPORTANT: Only use escapeHtml() for innerHTML contexts
     * For textContent or setAttribute, use raw values (browser handles escaping)
     * 
     * Example:
     *   element.innerHTML = escapeHtml(userInput); // ✅ Correct
     *   element.textContent = userInput;           // ✅ Correct (no escaping needed)
     *   element.textContent = escapeHtml(userInput); // ❌ Wrong (double-escaping)
     */
    static escapeHtml(unsafe) {
        if (unsafe === null || unsafe === undefined) return '';
        return String(unsafe)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    static validateRole(user) {
        // CMS access: executives (primary users) and admins (full access)
        // SECURITY: Normalize case and handle missing role safely
        const role = String(user?.role || '').toLowerCase();
        return role === 'executive' || role === 'admin';
    }

    static validateInput(data = {}, rules = {}) {
        const errors = [];
        
        for (const [field, rule] of Object.entries(rules)) {
            const value = data?.[field];
            const isEmpty = value === null || value === undefined || (typeof value === 'string' && value.trim() === '');
            
            if (rule.required && isEmpty) {
                errors.push(`${field} is required`);
            }
            // Trusting backend and HTML5 forms for advanced validation (URLs, regex, limits)
        }
        
        return errors;
    }

    static isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(String(email));
    }

    static isSafeHttpUrl(url) {
        try {
            const s = String(url).trim();
            if (/^\/{2,}/.test(s)) return false; // block scheme-relative //evil.com
            const u = new URL(s, window.location.origin);
            return u.protocol === 'http:' || u.protocol === 'https:';
        } catch {
            return false;
        }
    }

    static toSafeHttpUrl(url) {
        try {
            const s = String(url).trim();
            if (/^\/{2,}/.test(s)) return '';
            const u = new URL(s, window.location.origin);
            if (u.protocol !== 'http:' && u.protocol !== 'https:') return '';
            return u.href;
        } catch {
            return '';
        }
    }

    /**
     * Check if URL is same-origin (stricter than isSafeHttpUrl)
     * Use for contexts where off-site links should be blocked (e.g., media URLs)
     */
    static isSameOriginHttpUrl(url) {
        try {
            const s = String(url).trim();
            if (/^\/{2,}/.test(s)) return false;
            const u = new URL(s, window.location.origin);
            return (
                (u.protocol === 'http:' || u.protocol === 'https:') &&
                u.origin === window.location.origin
            );
        } catch {
            return false;
        }
    }

    // Legacy method for backward compatibility - now redirects to isSafeHttpUrl
    static isValidUrl(url) {
        return this.isSafeHttpUrl(url);
    }

    /**
     * Basic HTML sanitizer - UNSAFE FALLBACK ONLY
     * WARNING: This is NOT safe for production use. Regex-based sanitizers are bypassable.
     * @deprecated Use renderSafeHtml() with DOMPurify instead
     * 
     * This method now returns PLAIN TEXT only (strips all HTML tags)
     * to prevent misuse as a "safe" HTML sanitizer.
     */
    static sanitizeHtmlFallbackUnsafe(html) {
        // Strip all HTML tags and return plain text
        return String(html ?? '').replace(/<[^>]*>/g, '');
    }

    /**
     * Render HTML content safely in a container
     * SECURITY: Relies on generic DOMPurify or simple textContent for fallback.
     */
    static renderSafeHtml(htmlContent, container) {
        if (!container) return;
        
        const purifier = window.DOMPurify;
        if (!purifier) {
            container.textContent = String(htmlContent ?? '');
            return;
        }
        
        container.innerHTML = purifier.sanitize(String(htmlContent));
        
        // Basic Post-processing: Harden links
        this.hardenLinks(container);
    }

    /**
     * Harden all links in container
     * - Force rel="noopener noreferrer" for _blank
     * - Remove non-standard target values
     */
    static hardenLinks(container) {
        container.querySelectorAll('a').forEach(a => {
            const target = (a.getAttribute('target') || '').toLowerCase();
            
            if (target === '_blank') {
                // Prevent tabnabbing
                a.setAttribute('rel', 'noopener noreferrer');
            } else if (target && target !== '_self' && target !== '_parent' && target !== '_top') {
                // Remove weird/custom target values
                a.removeAttribute('target');
            }
        });
    }

    /**
     * Harden all images in container
     * - Add privacy/security attributes
     * - Optionally enforce same-origin (uncomment if needed)
     */
    static hardenImages(container) {
        container.querySelectorAll('img').forEach(img => {
            // Privacy: Don't leak referrer to external sites
            img.setAttribute('referrerpolicy', 'no-referrer');
            
            // Performance: Lazy load images
            img.setAttribute('loading', 'lazy');
            img.setAttribute('decoding', 'async');
            
            // OPTIONAL: Enforce same-origin images only (uncomment if needed)
            // const src = img.getAttribute('src') || '';
            // if (!this.isSameOriginHttpUrl(src)) {
            //     img.remove();
            // }
        });
    }

    /**
     * Render Delta content safely using Quill (preferred method)
     * SECURITY: Delta format is safer than HTML as it's structured data
     */
    static renderDeltaInto(container, delta) {
        if (!container || !delta) return;
        
        container.innerHTML = ''; // clear
        const tmp = document.createElement('div');
        container.appendChild(tmp);

        // Check if Quill is available
        if (typeof Quill === 'undefined') {
            // SAFE FALLBACK: Extract plain text from delta
            const plainText = this.deltaToPlainText(delta);
            const fallback = document.createElement('div');
            fallback.textContent = plainText || 'Content not available (Quill editor not loaded)';
            fallback.style.cssText = 'color: #666; font-style: italic; padding: 1rem; white-space: pre-wrap;';
            container.replaceChild(fallback, tmp);
            return;
        }

        const q = new Quill(tmp, {
            readOnly: true,
            theme: 'bubble', // minimal theme for display
            modules: { toolbar: false }
        });

        // Accept only well-formed delta
        if (delta && typeof delta === 'object' && Array.isArray(delta.ops)) {
            q.setContents(delta);
        } else {
            q.setText(''); // empty if invalid
        }

        // Prevent editing & selection quirks
        const editor = tmp.querySelector('.ql-editor');
        if (editor) {
            editor.setAttribute('contenteditable', 'false');
            editor.style.cursor = 'default';
        }
    }

    /**
     * Extract plain text from Quill Delta format
     * Helper for fallback when Quill is not available
     */
    static deltaToPlainText(delta) {
        if (!delta || !Array.isArray(delta.ops)) return '';
        
        return delta.ops
            .map(op => {
                if (typeof op.insert === 'string') {
                    return op.insert;
                }
                // Handle embeds (images, videos, etc.) with placeholders
                if (op.insert && typeof op.insert === 'object') {
                    return '[media]';
                }
                return '';
            })
            .join('');
    }

    /**
     * Safe content rendering - prefers Delta, falls back to sanitized HTML
     */
    static renderContent(container, data) {
        if (!container) return;
        
        // Prefer Delta content if available
        if (data.content_delta) {
            this.renderDeltaInto(container, data.content_delta);
            return;
        }
        
        // Fallback to HTML content with sanitization
        const htmlContent = data.content_html || data.content || data.description_html || data.description || '';
        if (htmlContent) {
            this.renderSafeHtml(htmlContent, container);
        } else {
            container.textContent = 'No content available.';
        }
    }

    static sanitizeFileName(fileName) {
        const raw = String(fileName ?? '').trim();
        let cleaned = raw
            .replace(/[^a-zA-Z0-9.-]/g, '_')
            .replace(/^\.*/, ''); // drop leading dots
        
        if (!cleaned || cleaned === '.' || cleaned === '..') return 'file';
        
        // Preserve extension if we trim long names
        if (cleaned.length > 120) {
            const lastDot = cleaned.lastIndexOf('.');
            if (lastDot > 0 && lastDot > cleaned.length - 10) {
                const extension = cleaned.slice(lastDot);
                const basename = cleaned.slice(0, lastDot);
                cleaned = basename.slice(0, 120 - extension.length) + extension;
            } else {
                cleaned = cleaned.slice(0, 120);
            }
        }
        
        return cleaned;
    }

    static generateSecureId() {
        // Use crypto.randomUUID if available (most secure)
        if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
            return crypto.randomUUID();
        }
        return this.fallbackSecureId();
    }

    static fallbackSecureId() {
        // Reasonably strong fallback if randomUUID not available
        if (typeof crypto !== 'undefined' && typeof crypto.getRandomValues === 'function') {
            const bytes = new Uint8Array(16);
            crypto.getRandomValues(bytes);
            return Array.from(bytes, b => b.toString(16).padStart(2, '0')).join('');
        }
        
        // Final fallback for very old browsers (less secure but functional)
        return `${Date.now()}-${Math.random().toString(36).slice(2)}-${Math.random().toString(36).slice(2)}`;
    }
}