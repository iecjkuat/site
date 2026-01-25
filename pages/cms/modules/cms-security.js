/**
 * CMS Security Module
 * Handles input sanitization, validation, and security utilities
 * Enhanced with robust error handling and secure practices
 */

export class CMSSecurity {
    static escapeHtml(unsafe) {
        if (unsafe === null || unsafe === undefined) return '';
        return String(unsafe)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    static sanitizeForDisplay(obj, fields = []) {
        const source = obj && typeof obj === 'object' ? obj : {};
        const sanitized = {};
        for (const field of fields) {
            sanitized[field] = this.escapeHtml(source[field]);
        }
        return sanitized;
    }

    static validateRole(user) {
        // CMS access: executives (primary users) and admins (full access)
        return !!user && (user.role === 'executive' || user.role === 'admin');
    }

    static validateInput(data = {}, rules = {}) {
        const errors = [];
        
        for (const [field, rule] of Object.entries(rules)) {
            const value = data?.[field];
            
            const isEmpty = 
                value === null ||
                value === undefined ||
                (typeof value === 'string' && value.trim() === '');
            
            if (rule.required && isEmpty) {
                errors.push(`${field} is required`);
                continue;
            }
            
            if (value !== null && value !== undefined) {
                const str = typeof value === 'string' ? value : String(value);
                
                if (rule.minLength && str.length < rule.minLength) {
                    errors.push(`${field} must be at least ${rule.minLength} characters`);
                }
                
                if (rule.maxLength && str.length > rule.maxLength) {
                    errors.push(`${field} must be no more than ${rule.maxLength} characters`);
                }
                
                if (rule.pattern) {
                    if (!(rule.pattern instanceof RegExp)) {
                        errors.push(`${field} validation misconfigured`);
                    } else if (!rule.pattern.test(str)) {
                        errors.push(`${field} format is invalid`);
                    }
                }
                
                if (rule.type === 'email' && !this.isValidEmail(str)) {
                    errors.push(`${field} must be a valid email address`);
                }
                
                if (rule.type === 'url' && !this.isSafeHttpUrl(str)) {
                    errors.push(`${field} must be a valid http/https URL`);
                }
            }
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

    // Legacy method for backward compatibility - now redirects to isSafeHttpUrl
    static isValidUrl(url) {
        return this.isSafeHttpUrl(url);
    }

    /**
     * Basic HTML sanitizer - removes dangerous tags and attributes
     * For production, consider using DOMPurify library for more comprehensive sanitization
     */
    static sanitizeHtml(html) {
        if (!html) return '';
        
        const str = String(html);
        
        // Remove script tags and their content
        let cleaned = str.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
        
        // Remove dangerous tags
        const dangerousTags = ['script', 'iframe', 'object', 'embed', 'form', 'input', 'textarea', 'button', 'select', 'option'];
        for (const tag of dangerousTags) {
            const regex = new RegExp(`<\\/?${tag}\\b[^>]*>`, 'gi');
            cleaned = cleaned.replace(regex, '');
        }
        
        // Remove dangerous attributes
        const dangerousAttrs = ['onload', 'onerror', 'onclick', 'onmouseover', 'onfocus', 'onblur', 'onchange', 'onsubmit'];
        for (const attr of dangerousAttrs) {
            const regex = new RegExp(`\\s${attr}\\s*=\\s*[^\\s>]*`, 'gi');
            cleaned = cleaned.replace(regex, '');
        }
        
        // Remove javascript: and data: URLs
        cleaned = cleaned.replace(/href\s*=\s*["']?\s*javascript:/gi, 'href="#"');
        cleaned = cleaned.replace(/src\s*=\s*["']?\s*javascript:/gi, 'src="#"');
        cleaned = cleaned.replace(/href\s*=\s*["']?\s*data:/gi, 'href="#"');
        cleaned = cleaned.replace(/src\s*=\s*["']?\s*data:/gi, 'src="#"');
        
        return cleaned;
    }

    /**
     * Render HTML content safely in a container
     * Uses DOMPurify if available, falls back to basic sanitization
     */
    static renderSafeHtml(htmlContent, container) {
        if (!container || !htmlContent) return;
        
        // Use DOMPurify if available (loaded from CDN)
        if (window.DOMPurify) {
            const sanitized = DOMPurify.sanitize(String(htmlContent), {
                USE_PROFILES: { html: true },
                ALLOWED_URI_REGEXP: /^https?:/i,
                FORBID_TAGS: ['script', 'object', 'embed', 'form', 'input'],
                FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover']
            });
            container.innerHTML = sanitized;
        } else {
            // Fallback to basic sanitization
            const sanitized = this.sanitizeHtml(htmlContent);
            container.innerHTML = sanitized;
        }
    }

    /**
     * Render Delta content safely using Quill (preferred method)
     */
    static renderDeltaInto(container, delta) {
        if (!container || !delta) return;
        
        container.innerHTML = ''; // clear
        const tmp = document.createElement('div');
        container.appendChild(tmp);

        // Check if Quill is available
        if (typeof Quill === 'undefined') {
            // Fallback: show plain text
            const fallback = document.createElement('div');
            fallback.textContent = 'Rich content (Quill editor not loaded)';
            fallback.style.cssText = 'color: #666; font-style: italic; padding: 1rem;';
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
        return (crypto?.randomUUID?.() ?? this.fallbackSecureId());
    }

    static fallbackSecureId() {
        // Reasonably strong fallback if randomUUID not available
        if (crypto?.getRandomValues) {
            const bytes = new Uint8Array(16);
            crypto.getRandomValues(bytes);
            return Array.from(bytes, b => b.toString(16).padStart(2, '0')).join('');
        }
        
        // Final fallback for very old browsers
        return `${Date.now()}-${Math.random().toString(36).slice(2)}-${Math.random().toString(36).slice(2)}`;
    }
}