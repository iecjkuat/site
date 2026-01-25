/**
 * HTML Sanitizer Utility (Global Version)
 * Prevents XSS by escaping dangerous characters.
 * Attached to window for non-module usage.
 */

window.sanitizeHTML = (str) => {
    if (!str) return '';
    const div = document.createElement('div');
    div.textContent = String(str);
    return div.innerHTML;
};

window.sanitizeObject = (obj) => {
    const sanitized = {};
    for (const key in obj) {
        if (typeof obj[key] === 'string') {
            sanitized[key] = window.sanitizeHTML(obj[key]);
        } else {
            sanitized[key] = obj[key];
        }
    }
    return sanitized;
};
