/**
 * Template Renderer Utility
 * Handles template interpolation and conditional rendering
 */

class TemplateRenderer {
    constructor() {
        this.helpers = new Map();
        this.registerDefaultHelpers();
    }

    registerDefaultHelpers() {
        // Register common template helpers
        this.helpers.set('if', this.ifHelper);
        this.helpers.set('unless', this.unlessHelper);
        this.helpers.set('each', this.eachHelper);
        this.helpers.set('formatDate', this.formatDateHelper);
        this.helpers.set('formatNumber', this.formatNumberHelper);
        this.helpers.set('statusColor', this.statusColorHelper);
    }

    render(template, data) {
        let rendered = template;

        // Handle simple variable interpolation {{variable}}
        rendered = rendered.replace(/\{\{(\w+)\}\}/g, (match, key) => {
            return data[key] !== undefined ? data[key] : '';
        });

        // Handle conditional blocks {{#if condition}}...{{/if}}
        rendered = this.handleConditionals(rendered, data);

        // Handle each loops {{#each items}}...{{/each}}
        rendered = this.handleEachLoops(rendered, data);

        return rendered;
    }

    handleConditionals(template, data) {
        // Handle {{#if condition}}...{{/if}} blocks
        const ifRegex = /\{\{#if\s+(\w+)\}\}([\s\S]*?)\{\{\/if\}\}/g;
        return template.replace(ifRegex, (match, condition, content) => {
            return data[condition] ? content : '';
        });
    }

    handleEachLoops(template, data) {
        // Handle {{#each items}}...{{/each}} blocks
        const eachRegex = /\{\{#each\s+(\w+)\}\}([\s\S]*?)\{\{\/each\}\}/g;
        return template.replace(eachRegex, (match, arrayName, itemTemplate) => {
            const array = data[arrayName];
            if (!Array.isArray(array)) return '';

            return array.map(item => this.render(itemTemplate, item)).join('');
        });
    }

    // Helper functions
    ifHelper(condition, options) {
        return condition ? options.fn(this) : options.inverse(this);
    }

    unlessHelper(condition, options) {
        return !condition ? options.fn(this) : options.inverse(this);
    }

    eachHelper(context, options) {
        let result = '';
        if (Array.isArray(context)) {
            context.forEach(item => {
                result += options.fn(item);
            });
        }
        return result;
    }

    formatDateHelper(date) {
        return new Date(date).toLocaleDateString();
    }

    formatNumberHelper(number) {
        return new Intl.NumberFormat().format(number);
    }

    statusColorHelper(status) {
        const colorMap = {
            'Active': 'success',
            'Pending': 'warning',
            'Suspended': 'danger',
            'Completed': 'success',
            'Ongoing': 'primary',
            'Cancelled': 'secondary',
            'Draft': 'secondary',
            'Published': 'success',
            'Approved': 'success',
            'Rejected': 'danger',
            'In Development': 'info',
            'Delivered': 'success',
            'Failed': 'danger',
            'Scheduled': 'info'
        };
        return colorMap[status] || 'secondary';
    }

    registerHelper(name, fn) {
        this.helpers.set(name, fn);
    }

    // Batch render multiple items with the same template
    renderList(template, items) {
        return items.map(item => this.render(template, item)).join('');
    }

    // Render template with enhanced data processing
    renderEnhanced(template, data) {
        // Add computed properties
        const enhancedData = this.enhanceData(data);
        return this.render(template, enhancedData);
    }

    enhanceData(data) {
        const enhanced = { ...data };

        // Add status color mappings
        if (enhanced.status) {
            enhanced.statusColor = this.statusColorHelper(enhanced.status);
        }

        // Add role color mappings
        if (enhanced.role) {
            enhanced.roleColor = enhanced.role === 'Leader' ? 'warning' : 'info';
        }

        // Add method color mappings
        if (enhanced.method) {
            const methodColors = {
                'M-Pesa': 'success',
                'Bank Transfer': 'primary',
                'Cash': 'warning',
                'Card': 'info'
            };
            enhanced.methodColor = methodColors[enhanced.method] || 'secondary';
        }

        // Add type color mappings
        if (enhanced.type) {
            const typeColors = {
                'Email': 'primary',
                'SMS': 'success',
                'Push': 'info',
                'In-App': 'warning'
            };
            enhanced.typeColor = typeColors[enhanced.type] || 'secondary';
        }

        // Add conditional flags
        enhanced.isPending = enhanced.status === 'Pending';
        enhanced.isActive = enhanced.status === 'Active';
        enhanced.canDelete = !['Completed', 'Ongoing'].includes(enhanced.status);
        enhanced.canRefund = enhanced.status === 'Completed';
        enhanced.canResend = enhanced.status === 'Failed';
        enhanced.canCancel = enhanced.status === 'Scheduled';

        return enhanced;
    }
}

// Global template renderer instance
window.templateRenderer = new TemplateRenderer();

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = TemplateRenderer;
}