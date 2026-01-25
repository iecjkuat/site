/**
 * HTML Sanitizer Utility
 * Prevents XSS by escaping dangerous characters.
 */
export const sanitizeHTML = (str) => {
    if (!str) return '';
    const div = document.createElement('div');
    div.textContent = String(str);
    return div.innerHTML;
};

/**
 * Sanitizes an object's string properties (shallow keys).
 */
export const sanitizeObject = (obj) => {
    const sanitized = {};
    for (const key in obj) {
        if (typeof obj[key] === 'string') {
            sanitized[key] = sanitizeHTML(obj[key]);
        } else {
            sanitized[key] = obj[key];
        }
    }
    return sanitized;
};
