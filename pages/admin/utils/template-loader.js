/**
 * Template Loader Utility
 * Handles loading and caching of HTML templates with rendering support
 */

class TemplateLoader {
    constructor() {
        this.cache = new Map();
        this.basePath = 'templates/';
        this.renderer = window.templateRenderer || new TemplateRenderer();
    }

    async loadTemplate(templateName) {
        // Check cache first
        if (this.cache.has(templateName)) {
            return this.cache.get(templateName);
        }

        try {
            const response = await fetch(`${this.basePath}${templateName}.html`);
            if (!response.ok) {
                throw new Error(`Template ${templateName} not found`);
            }
            
            const html = await response.text();
            this.cache.set(templateName, html);
            return html;
        } catch (error) {
            console.error(`Failed to load template ${templateName}:`, error);
            return `<div class="alert alert-danger">Failed to load template: ${templateName}</div>`;
        }
    }

    async renderTemplate(templateName, data = {}, container = null) {
        const template = await this.loadTemplate(templateName);
        const rendered = this.renderer.renderEnhanced(template, data);
        
        if (container) {
            container.innerHTML = rendered;
        }
        return rendered;
    }

    async renderTemplateList(templateName, items = [], container = null) {
        const template = await this.loadTemplate(templateName);
        const rendered = items.map(item => 
            this.renderer.renderEnhanced(template, item)
        ).join('');
        
        if (container) {
            container.innerHTML = rendered;
        }
        return rendered;
    }

    async appendTemplate(templateName, data = {}, container) {
        const rendered = await this.renderTemplate(templateName, data);
        if (container) {
            container.insertAdjacentHTML('beforeend', rendered);
        }
        return rendered;
    }

    async prependTemplate(templateName, data = {}, container) {
        const rendered = await this.renderTemplate(templateName, data);
        if (container) {
            container.insertAdjacentHTML('afterbegin', rendered);
        }
        return rendered;
    }

    clearCache() {
        this.cache.clear();
    }

    preloadTemplates(templateNames) {
        return Promise.all(
            templateNames.map(name => this.loadTemplate(name))
        );
    }

    // Utility method to show loading skeleton
    async showLoadingSkeleton(container, count = 3) {
        const skeletons = Array(count).fill().map(() => 
            this.renderTemplate('loading-skeleton')
        );
        const rendered = await Promise.all(skeletons);
        
        if (container) {
            container.innerHTML = rendered.join('');
        }
        return rendered.join('');
    }

    // Utility method to replace loading skeleton with actual content
    async replaceLoadingSkeleton(container, templateName, data) {
        // Remove loading skeletons
        const skeletons = container.querySelectorAll('.loading-skeleton');
        skeletons.forEach(skeleton => skeleton.remove());
        
        // Render actual content
        return await this.renderTemplate(templateName, data, container);
    }
}

// Global template loader instance
window.templateLoader = new TemplateLoader();