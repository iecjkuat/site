// JKUAT Innovation Club - Simple Template Engine

class TemplateEngine {
    constructor() {
        this.templates = new Map();
        this.components = new Map();
    }

    // Load and cache templates
    async loadTemplate(name, path) {
        if (this.templates.has(name)) {
            return this.templates.get(name);
        }

        try {
            const response = await fetch(path);
            if (!response.ok) {
                throw new Error(`Failed to load template: ${path}`);
            }
            
            const template = await response.text();
            this.templates.set(name, template);
            return template;
        } catch (error) {
            console.error('Template loading error:', error);
            return '';
        }
    }

    // Load and cache components
    async loadComponent(name, path) {
        if (this.components.has(name)) {
            return this.components.get(name);
        }

        try {
            const response = await fetch(path);
            if (!response.ok) {
                throw new Error(`Failed to load component: ${path}`);
            }
            
            const component = await response.text();
            this.components.set(name, component);
            return component;
        } catch (error) {
            console.error('Component loading error:', error);
            return '';
        }
    }

    // Simple template rendering with variable substitution
    render(template, data = {}) {
        let rendered = template;

        // Replace variables {{variable}}
        Object.keys(data).forEach(key => {
            const regex = new RegExp(`{{${key}}}`, 'g');
            rendered = rendered.replace(regex, data[key] || '');
        });

        // Clean up any remaining placeholders
        rendered = rendered.replace(/{{[^}]+}}/g, '');

        return rendered;
    }

    // Render a page with layout
    async renderPage(layoutName, data = {}) {
        const layout = await this.loadTemplate('layout', `/templates/layouts/${layoutName}.html`);
        
        // Load common components
        const navigation = await this.loadComponent('navigation', '/templates/components/navigation.html');
        const footer = await this.loadComponent('footer', '/templates/components/footer.html');
        
        // Merge components into data
        const renderData = {
            navigation,
            footer,
            ...data
        };

        return this.render(layout, renderData);
    }

    // Insert rendered content into DOM
    insertIntoDOM(selector, content) {
        const element = document.querySelector(selector);
        if (element) {
            element.innerHTML = content;
        }
    }

    // Create a page component
    async createPage(config) {
        const {
            layout = 'base',
            title = 'JKUAT Innovation Club',
            description = 'Empowering innovation and entrepreneurship at JKUAT',
            content = '',
            additionalCSS = '',
            additionalJS = '',
            selector = 'body'
        } = config;

        const pageData = {
            title,
            description,
            content,
            additional_css: additionalCSS,
            additional_js: additionalJS,
            url: window.location.href
        };

        const renderedPage = await this.renderPage(layout, pageData);
        
        if (selector === 'body') {
            document.body.innerHTML = renderedPage;
        } else {
            this.insertIntoDOM(selector, renderedPage);
        }
    }
}

// Export for global use
window.TemplateEngine = TemplateEngine;