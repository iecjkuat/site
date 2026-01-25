/**
 * CMS Security Module
 * Handles input sanitization, validation, and security utilities
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

    static sanitizeForDisplay(obj, fields) {
        const sanitized = {};
        fields.forEach(field => {
            sanitized[field] = this.escapeHtml(obj[field]);
        });
        return sanitized;
    }

    static validateRole(user) {
        // CMS access: executives (primary users) and admins (full access)
        return user && (user.role === 'executive' || user.role === 'admin');
    }

    static validateInput(data, rules) {
        const errors = [];
        
        for (const [field, rule] of Object.entries(rules)) {
            const value = data[field];
            
            if (rule.required && (!value || value.trim() === '')) {
                errors.push(`${field} is required`);
                continue;
            }
            
            if (value && rule.minLength && value.length < rule.minLength) {
                errors.push(`${field} must be at least ${rule.minLength} characters`);
            }
            
            if (value && rule.maxLength && value.length > rule.maxLength) {
                errors.push(`${field} must be no more than ${rule.maxLength} characters`);
            }
            
            if (value && rule.pattern && !rule.pattern.test(value)) {
                errors.push(`${field} format is invalid`);
            }
            
            if (value && rule.type === 'email' && !this.isValidEmail(value)) {
                errors.push(`${field} must be a valid email address`);
            }
            
            if (value && rule.type === 'url' && !this.isValidUrl(value)) {
                errors.push(`${field} must be a valid URL`);
            }
        }
        
        return errors;
    }

    static isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    static isValidUrl(url) {
        try {
            new URL(url);
            return true;
        } catch {
            return false;
        }
    }

    static sanitizeFileName(fileName) {
        return fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
    }

    static generateSecureId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }
}