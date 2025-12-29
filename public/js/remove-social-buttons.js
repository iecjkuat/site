// Immediately remove social share buttons
(function() {
    'use strict';
    
    function removeSocialButtons() {
        const container = document.getElementById('social-share-container');
        if (container) {
            container.remove();
            console.log('🗑️ Social share buttons removed');
        }
        
        // Also remove any buttons that might be created later
        const observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                mutation.addedNodes.forEach(function(node) {
                    if (node.id === 'social-share-container') {
                        node.remove();
                        console.log('🗑️ Prevented social share buttons from appearing');
                    }
                });
            });
        });
        
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }
    
    // Remove immediately if DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', removeSocialButtons);
    } else {
        removeSocialButtons();
    }
    
    // Also remove after a short delay to catch any delayed creation
    setTimeout(removeSocialButtons, 1000);
    setTimeout(removeSocialButtons, 3000);
    setTimeout(removeSocialButtons, 5000);
})();