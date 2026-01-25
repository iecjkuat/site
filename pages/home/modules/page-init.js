/**
 * Home Page Initialization
 * Contains page-specific initialization code moved from inline scripts
 */

document.addEventListener('DOMContentLoaded', function() {
    // Initialize Navigation
    if (typeof window.Navigation === 'function' && !window.navInstance) {
        window.navInstance = new Navigation();
    }
});
