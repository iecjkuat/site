/**
 * SEO Tags Injector
 * Call injectSEO(config) in each page's <head> to add all meta tags consistently.
 * This runs before DOMContentLoaded so tags are present for crawlers.
 */
(function() {
    const SITE = 'https://iecjkuat.com';
    const SITE_NAME = 'JKUAT Innovation & Entrepreneurship Club';
    const DEFAULT_IMAGE = `${SITE}/pages/shared/assets/images/backgrounds/tech-meeting-flatlay.jpg`;
    const TWITTER_HANDLE = '@JKUATInnovation';

    window.injectSEO = function({ title, description, path, image, type, noindex }) {
        const fullTitle = title ? `${title} | ${SITE_NAME}` : SITE_NAME;
        const url = `${SITE}${path || window.location.pathname}`;
        const img = image || DEFAULT_IMAGE;

        // Title
        document.title = fullTitle;

        const set = (name, content, attr = 'name') => {
            let el = document.querySelector(`meta[${attr}="${name}"]`);
            if (!el) { el = document.createElement('meta'); el.setAttribute(attr, name); document.head.appendChild(el); }
            el.setAttribute('content', content);
        };

        const setLink = (rel, href) => {
            let el = document.querySelector(`link[rel="${rel}"]`);
            if (!el) { el = document.createElement('link'); el.setAttribute('rel', rel); document.head.appendChild(el); }
            el.setAttribute('href', href);
        };

        // Core
        set('description', description);
        set('robots', noindex ? 'noindex, nofollow' : 'index, follow');

        // Open Graph
        set('og:type', type || 'website', 'property');
        set('og:title', fullTitle, 'property');
        set('og:description', description, 'property');
        set('og:url', url, 'property');
        set('og:image', img, 'property');
        set('og:image:width', '1200', 'property');
        set('og:image:height', '630', 'property');
        set('og:site_name', SITE_NAME, 'property');
        set('og:locale', 'en_KE', 'property');

        // Twitter Card
        set('twitter:card', 'summary_large_image');
        set('twitter:site', TWITTER_HANDLE);
        set('twitter:title', fullTitle);
        set('twitter:description', description);
        set('twitter:image', img);

        // Canonical
        setLink('canonical', url);
    };
})();
