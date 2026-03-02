/**
 * Minimal Footer Component
 * Simple footer for all pages except home
 */

function renderMinimalFooter() {
    const footer = document.createElement('footer');
    footer.className = 'minimal-footer';
    footer.style.cssText = 'background: rgba(0, 0, 0, 0.3) !important; backdrop-filter: blur(10px) !important; -webkit-backdrop-filter: blur(10px) !important; border-top: 1px solid rgba(255, 255, 255, 0.1) !important; padding: 2rem 0 !important; margin-top: 4rem !important; text-align: center !important; width: 100% !important; display: block !important; position: relative !important; left: 0 !important; right: 0 !important;';
    
    const container = document.createElement('div');
    container.className = 'minimal-footer-container';
    container.style.cssText = 'max-width: 1200px !important; margin: 0 auto !important; padding: 0 1rem !important; text-align: center !important; display: block !important;';
    
    const p = document.createElement('p');
    p.style.cssText = 'color: rgba(255, 255, 255, 0.6) !important; font-size: 0.875rem !important; margin: 0 auto !important; text-align: center !important; display: block !important; width: 100% !important;';
    p.textContent = `© ${new Date().getFullYear()} JKUAT Innovation and Entrepreneurship Club. All rights reserved.`;
    
    container.appendChild(p);
    footer.appendChild(container);
    
    // Add styles if not already added
    if (!document.getElementById('minimal-footer-styles')) {
        const style = document.createElement('style');
        style.id = 'minimal-footer-styles';
        style.textContent = `
            .minimal-footer {
                background: rgba(0, 0, 0, 0.3) !important;
                backdrop-filter: blur(10px) !important;
                -webkit-backdrop-filter: blur(10px) !important;
                border-top: 1px solid rgba(255, 255, 255, 0.1) !important;
                padding: 2rem 0 !important;
                margin-top: 4rem !important;
                text-align: center !important;
                width: 100% !important;
                display: block !important;
                position: relative !important;
                left: 0 !important;
                right: 0 !important;
            }

            .minimal-footer * {
                text-align: center !important;
            }

            .minimal-footer-container {
                max-width: 1200px !important;
                margin: 0 auto !important;
                padding: 0 1rem !important;
                text-align: center !important;
                display: block !important;
            }

            .minimal-footer p {
                color: rgba(255, 255, 255, 0.6) !important;
                font-size: 0.875rem !important;
                margin: 0 auto !important;
                text-align: center !important;
                display: block !important;
                width: 100% !important;
            }

            @media (max-width: 768px) {
                .minimal-footer {
                    padding: 1.5rem 0 !important;
                    margin-top: 2rem !important;
                }

                .minimal-footer p {
                    font-size: 0.8rem !important;
                }
            }
        `;
        document.head.appendChild(style);
    }
    
    return footer;
}

// Auto-render if footer placeholder exists
document.addEventListener('DOMContentLoaded', () => {
    const placeholder = document.getElementById('footer-placeholder');
    if (placeholder) {
        const footer = renderMinimalFooter();
        placeholder.replaceWith(footer);
    } else {
        // If no placeholder, append to body
        const existingFooter = document.querySelector('footer');
        if (!existingFooter) {
            document.body.appendChild(renderMinimalFooter());
        }
    }
});

// Export for manual use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { renderMinimalFooter };
}
