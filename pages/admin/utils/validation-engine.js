/**
 * Validation Engine
 * Comprehensive data validation and error handling system
 */

class ValidationEngine {
    constructor() {
        this.rules = new Map();
        this.customValidators = new Map();
        this.errorMessages = new Map();
        
        this.initializeDefaultRules();
        this.initializeErrorMessages();
    }

    initializeDefaultRules() {
        // User validation rules
        this.rules.set('user', {
            name: ['required', 'string', 'min:2', 'max:100'],
            email: ['required', 'email', 'unique:users'],
            phone: ['required', 'phone', 'unique:users'],
            studentId: ['required', 'alphanumeric', 'unique:users'],
            college: ['required', 'string', 'in:Engineering,Business,Agriculture,Health Sciences'],
            program: ['required', 'string', 'max:100'],
            role: ['required', 'in:Member,Leader,Admin'],
            status: ['required', 'in:Active,Pending,Suspended,Inactive']
        });

        // Event validation rules
        this.rules.set('event', {
            title: ['required', 'string', 'min:5', 'max:200'],
            description: ['required', 'string', 'min:20', 'max:2000'],
            type: ['required', 'in:Workshop,Seminar,Competition,Networking,Exhibition'],
            category: ['required', 'string', 'max:50'],
            date: ['required', 'date', 'future'],
            time: ['required', 'time'],
            location: ['required', 'string', 'max:200'],
            capacity: ['required', 'integer', 'min:1', 'max:1000'],
            fee: ['numeric', 'min:0'],
            organizer: ['required', 'string', 'max:100'],
            status: ['required', 'in:Draft,Published,Ongoing,Completed,Cancelled']
        });

        // Payment validation rules
        this.rules.set('payment', {
            amount: ['required', 'numeric', 'min:1'],
            method: ['required', 'in:M-Pesa,Bank Transfer,Cash,Card'],
            transactionId: ['required', 'string', 'unique:payments'],
            reference: ['string', 'max:100'],
            description: ['string', 'max:500'],
            userId: ['required', 'exists:users'],
            status: ['required', 'in:Completed,Pending,Failed,Refunded']
        });

        // Idea validation rules
        this.rules.set('idea', {
            title: ['required', 'string', 'min:5', 'max:200'],
            description: ['required', 'string', 'min:50', 'max:5000'],
            category: ['required', 'in:Technology,Business,Social Impact,Environment,Education'],
            submitterId: ['required', 'exists:users'],
            tags: ['array', 'max:10'],
            status: ['required', 'in:Pending,Approved,Rejected,In Development,Implemented']
        });

        // Message validation rules
        this.rules.set('message', {
            subject: ['required', 'string', 'min:5', 'max:200'],
            content: ['required', 'string', 'min:10', 'max:10000'],
            type: ['required', 'in:Email,SMS,Push,In-App'],
            recipients: ['required', 'array', 'min:1'],
            scheduledDate: ['date', 'future'],
            priority: ['in:Low,Normal,High,Urgent']
        });
    }

    initializeErrorMessages() {
        this.errorMessages.set('required', 'This field is required');
        this.errorMessages.set('string', 'This field must be a string');
        this.errorMessages.set('numeric', 'This field must be a number');
        this.errorMessages.set('integer', 'This field must be an integer');
        this.errorMessages.set('email', 'Please enter a valid email address');
        this.errorMessages.set('phone', 'Please enter a valid phone number');
        this.errorMessages.set('date', 'Please enter a valid date');
        this.errorMessages.set('time', 'Please enter a valid time');
        this.errorMessages.set('future', 'Date must be in the future');
        this.errorMessages.set('alphanumeric', 'This field must contain only letters and numbers');
        this.errorMessages.set('array', 'This field must be an array');
        this.errorMessages.set('min', 'This field must be at least {min} characters/items');
        this.errorMessages.set('max', 'This field must not exceed {max} characters/items');
        this.errorMessages.set('in', 'This field must be one of: {values}');
        this.errorMessages.set('unique', 'This value already exists');
        this.errorMessages.set('exists', 'This reference does not exist');
    }

    // Main validation method
    validate(type, data, customRules = null) {
        const rules = customRules || this.rules.get(type);
        if (!rules) {
            throw new Error(`No validation rules found for type: ${type}`);
        }

        const errors = {};
        let isValid = true;

        for (const [field, fieldRules] of Object.entries(rules)) {
            const fieldErrors = this.validateField(field, data[field], fieldRules, data);
            
            if (fieldErrors.length > 0) {
                errors[field] = fieldErrors;
                isValid = false;
            }
        }

        return {
            isValid,
            errors,
            data: isValid ? this.sanitizeData(type, data) : data
        };
    }

    validateField(fieldName, value, rules, allData = {}) {
        const errors = [];

        for (const rule of rules) {
            const ruleResult = this.applyRule(fieldName, value, rule, allData);
            
            if (!ruleResult.isValid) {
                errors.push(ruleResult.message);
            }
        }

        return errors;
    }

    applyRule(fieldName, value, rule, allData) {
        // Parse rule (e.g., "min:5" -> {name: "min", params: ["5"]})
        const [ruleName, ...params] = rule.split(':');
        const ruleParams = params.length > 0 ? params[0].split(',') : [];

        switch (ruleName) {
            case 'required':
                return this.validateRequired(value);
            
            case 'string':
                return this.validateString(value);
            
            case 'numeric':
                return this.validateNumeric(value);
            
            case 'integer':
                return this.validateInteger(value);
            
            case 'email':
                return this.validateEmail(value);
            
            case 'phone':
                return this.validatePhone(value);
            
            case 'date':
                return this.validateDate(value);
            
            case 'time':
                return this.validateTime(value);
            
            case 'future':
                return this.validateFuture(value);
            
            case 'alphanumeric':
                return this.validateAlphanumeric(value);
            
            case 'array':
                return this.validateArray(value);
            
            case 'min':
                return this.validateMin(value, parseInt(ruleParams[0]));
            
            case 'max':
                return this.validateMax(value, parseInt(ruleParams[0]));
            
            case 'in':
                return this.validateIn(value, ruleParams);
            
            case 'unique':
                return this.validateUnique(value, ruleParams[0], fieldName);
            
            case 'exists':
                return this.validateExists(value, ruleParams[0]);
            
            default:
                // Check for custom validators
                if (this.customValidators.has(ruleName)) {
                    return this.customValidators.get(ruleName)(value, ruleParams, allData);
                }
                
                return { isValid: true };
        }
    }

    // Individual validation methods
    validateRequired(value) {
        const isValid = value !== null && value !== undefined && value !== '';
        return {
            isValid,
            message: isValid ? '' : this.errorMessages.get('required')
        };
    }

    validateString(value) {
        const isValid = typeof value === 'string';
        return {
            isValid,
            message: isValid ? '' : this.errorMessages.get('string')
        };
    }

    validateNumeric(value) {
        const isValid = !isNaN(parseFloat(value)) && isFinite(value);
        return {
            isValid,
            message: isValid ? '' : this.errorMessages.get('numeric')
        };
    }

    validateInteger(value) {
        const isValid = Number.isInteger(Number(value));
        return {
            isValid,
            message: isValid ? '' : this.errorMessages.get('integer')
        };
    }

    validateEmail(value) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const isValid = emailRegex.test(value);
        return {
            isValid,
            message: isValid ? '' : this.errorMessages.get('email')
        };
    }

    validatePhone(value) {
        // Kenyan phone number format
        const phoneRegex = /^(\+254|0)[17]\d{8}$/;
        const isValid = phoneRegex.test(value.replace(/\s/g, ''));
        return {
            isValid,
            message: isValid ? '' : this.errorMessages.get('phone')
        };
    }

    validateDate(value) {
        const date = new Date(value);
        const isValid = !isNaN(date.getTime());
        return {
            isValid,
            message: isValid ? '' : this.errorMessages.get('date')
        };
    }

    validateTime(value) {
        const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
        const isValid = timeRegex.test(value);
        return {
            isValid,
            message: isValid ? '' : this.errorMessages.get('time')
        };
    }

    validateFuture(value) {
        const date = new Date(value);
        const now = new Date();
        const isValid = date > now;
        return {
            isValid,
            message: isValid ? '' : this.errorMessages.get('future')
        };
    }

    validateAlphanumeric(value) {
        const alphanumericRegex = /^[a-zA-Z0-9]+$/;
        const isValid = alphanumericRegex.test(value);
        return {
            isValid,
            message: isValid ? '' : this.errorMessages.get('alphanumeric')
        };
    }

    validateArray(value) {
        const isValid = Array.isArray(value);
        return {
            isValid,
            message: isValid ? '' : this.errorMessages.get('array')
        };
    }

    validateMin(value, min) {
        let isValid = false;
        
        if (typeof value === 'string' || Array.isArray(value)) {
            isValid = value.length >= min;
        } else if (typeof value === 'number') {
            isValid = value >= min;
        }
        
        return {
            isValid,
            message: isValid ? '' : this.errorMessages.get('min').replace('{min}', min)
        };
    }

    validateMax(value, max) {
        let isValid = false;
        
        if (typeof value === 'string' || Array.isArray(value)) {
            isValid = value.length <= max;
        } else if (typeof value === 'number') {
            isValid = value <= max;
        }
        
        return {
            isValid,
            message: isValid ? '' : this.errorMessages.get('max').replace('{max}', max)
        };
    }

    validateIn(value, allowedValues) {
        const isValid = allowedValues.includes(value);
        return {
            isValid,
            message: isValid ? '' : this.errorMessages.get('in').replace('{values}', allowedValues.join(', '))
        };
    }

    validateUnique(value, table, field) {
        // This would typically check against a database
        // For now, return true (implement with actual data source)
        const isValid = true;
        return {
            isValid,
            message: isValid ? '' : this.errorMessages.get('unique')
        };
    }

    validateExists(value, table) {
        // This would typically check if reference exists in database
        // For now, return true (implement with actual data source)
        const isValid = true;
        return {
            isValid,
            message: isValid ? '' : this.errorMessages.get('exists')
        };
    }

    // Data sanitization
    sanitizeData(type, data) {
        const sanitized = { ...data };

        // Apply type-specific sanitization
        switch (type) {
            case 'user':
                sanitized.name = this.sanitizeString(sanitized.name);
                sanitized.email = this.sanitizeEmail(sanitized.email);
                sanitized.phone = this.sanitizePhone(sanitized.phone);
                break;
            
            case 'event':
                sanitized.title = this.sanitizeString(sanitized.title);
                sanitized.description = this.sanitizeHtml(sanitized.description);
                sanitized.location = this.sanitizeString(sanitized.location);
                break;
            
            case 'payment':
                sanitized.amount = parseFloat(sanitized.amount);
                sanitized.description = this.sanitizeString(sanitized.description);
                break;
            
            case 'idea':
                sanitized.title = this.sanitizeString(sanitized.title);
                sanitized.description = this.sanitizeHtml(sanitized.description);
                break;
            
            case 'message':
                sanitized.subject = this.sanitizeString(sanitized.subject);
                sanitized.content = this.sanitizeHtml(sanitized.content);
                break;
        }

        return sanitized;
    }

    sanitizeString(str) {
        if (typeof str !== 'string') return str;
        
        return str
            .trim()
            .replace(/\s+/g, ' ') // Replace multiple spaces with single space
            .replace(/[<>]/g, ''); // Remove potential HTML tags
    }

    sanitizeEmail(email) {
        if (typeof email !== 'string') return email;
        
        return email.toLowerCase().trim();
    }

    sanitizePhone(phone) {
        if (typeof phone !== 'string') return phone;
        
        // Normalize Kenyan phone numbers
        let cleaned = phone.replace(/\s/g, '');
        
        if (cleaned.startsWith('0')) {
            cleaned = '+254' + cleaned.slice(1);
        }
        
        return cleaned;
    }

    sanitizeHtml(html) {
        if (typeof html !== 'string') return html;
        
        // Basic HTML sanitization (use a proper library in production)
        return html
            .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
            .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
            .replace(/javascript:/gi, '')
            .replace(/on\w+\s*=/gi, '');
    }

    // Custom validator registration
    addCustomValidator(name, validator) {
        this.customValidators.set(name, validator);
    }

    // Custom error message registration
    setErrorMessage(rule, message) {
        this.errorMessages.set(rule, message);
    }

    // Batch validation
    validateBatch(type, dataArray) {
        const results = [];
        
        for (const data of dataArray) {
            results.push(this.validate(type, data));
        }
        
        return {
            results,
            allValid: results.every(result => result.isValid),
            validCount: results.filter(result => result.isValid).length,
            invalidCount: results.filter(result => !result.isValid).length
        };
    }

    // Form validation helper
    validateForm(formElement, type) {
        const formData = new FormData(formElement);
        const data = Object.fromEntries(formData.entries());
        
        // Handle checkboxes and multiple selects
        const checkboxes = formElement.querySelectorAll('input[type="checkbox"]:checked');
        const multiSelects = formElement.querySelectorAll('select[multiple]');
        
        checkboxes.forEach(checkbox => {
            if (!data[checkbox.name]) {
                data[checkbox.name] = [];
            }
            if (Array.isArray(data[checkbox.name])) {
                data[checkbox.name].push(checkbox.value);
            } else {
                data[checkbox.name] = [data[checkbox.name], checkbox.value];
            }
        });
        
        multiSelects.forEach(select => {
            data[select.name] = Array.from(select.selectedOptions).map(option => option.value);
        });
        
        const result = this.validate(type, data);
        
        // Display errors in the form
        this.displayFormErrors(formElement, result.errors);
        
        return result;
    }

    displayFormErrors(formElement, errors) {
        // Clear previous errors
        formElement.querySelectorAll('.validation-error').forEach(error => error.remove());
        formElement.querySelectorAll('.is-invalid').forEach(field => field.classList.remove('is-invalid'));
        
        // Display new errors
        for (const [fieldName, fieldErrors] of Object.entries(errors)) {
            const field = formElement.querySelector(`[name="${fieldName}"]`);
            
            if (field) {
                field.classList.add('is-invalid');
                
                const errorDiv = document.createElement('div');
                errorDiv.className = 'validation-error invalid-feedback';
                errorDiv.textContent = fieldErrors[0]; // Show first error
                
                field.parentNode.appendChild(errorDiv);
            }
        }
    }

    // Real-time validation
    setupRealTimeValidation(formElement, type) {
        const fields = formElement.querySelectorAll('input, select, textarea');
        
        fields.forEach(field => {
            field.addEventListener('blur', () => {
                const rules = this.rules.get(type);
                if (rules && rules[field.name]) {
                    const fieldErrors = this.validateField(field.name, field.value, rules[field.name]);
                    
                    // Clear previous errors
                    const existingError = field.parentNode.querySelector('.validation-error');
                    if (existingError) {
                        existingError.remove();
                    }
                    field.classList.remove('is-invalid', 'is-valid');
                    
                    // Display new errors or success
                    if (fieldErrors.length > 0) {
                        field.classList.add('is-invalid');
                        
                        const errorDiv = document.createElement('div');
                        errorDiv.className = 'validation-error invalid-feedback';
                        errorDiv.textContent = fieldErrors[0];
                        
                        field.parentNode.appendChild(errorDiv);
                    } else {
                        field.classList.add('is-valid');
                    }
                }
            });
        });
    }
}

// Global validation engine instance
window.validationEngine = new ValidationEngine();

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ValidationEngine;
}