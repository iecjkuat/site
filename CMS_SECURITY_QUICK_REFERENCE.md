# CMS Security Quick Reference

**For Developers**: Quick lookup for secure coding patterns in the CMS

---

## ✅ DO THIS

### Rendering User Content
```javascript
// ✅ CORRECT: Use renderSafeHtml for HTML content
CMSSecurity.renderSafeHtml(userHtml, container);

// ✅ CORRECT: Use renderDeltaInto for Quill content (preferred)
CMSSecurity.renderDeltaInto(container, deltaData);

// ✅ CORRECT: Use renderContent (auto-detects format)
CMSSecurity.renderContent(container, data);

// ✅ CORRECT: Use textContent for plain text
element.textContent = userInput;
```

### Setting Attributes
```javascript
// ✅ CORRECT: Validate URLs before use
const url = CMSSecurity.toSafeHttpUrl(userUrl);
if (url) link.href = url;

// ✅ CORRECT: Use setAttribute for safe values
element.setAttribute('title', userTitle);
element.setAttribute('alt', userAlt);
```

### Validating Input
```javascript
// ✅ CORRECT: Use validateInput with rules
const errors = CMSSecurity.validateInput(data, {
  title: { required: true, minLength: 3, maxLength: 100 },
  email: { required: true, type: 'email' },
  url: { type: 'url' },
  fee: { type: 'number', min: 0, max: 10000, integer: true }
});
```

### Checking Roles
```javascript
// ✅ CORRECT: Use validateRole (case-insensitive)
if (CMSSecurity.validateRole(user)) {
  // Allow CMS access
}
```

### Generating IDs
```javascript
// ✅ CORRECT: Use generateSecureId
const id = CMSSecurity.generateSecureId();
```

---

## ❌ DON'T DO THIS

### Rendering User Content
```javascript
// ❌ WRONG: Never use innerHTML with user content
element.innerHTML = userInput; // XSS vulnerability!

// ❌ WRONG: Don't use escapeHtml for textContent
element.textContent = CMSSecurity.escapeHtml(userInput); // Double-escaping!

// ❌ WRONG: Don't use deprecated sanitizer
element.innerHTML = CMSSecurity.sanitizeHtmlFallbackUnsafe(userInput); // Unsafe!
```

### Setting Attributes
```javascript
// ❌ WRONG: Don't set URLs without validation
link.href = userUrl; // Can be javascript:, data:, etc.

// ❌ WRONG: Don't use innerHTML for attributes
element.innerHTML = `<a href="${userUrl}">Link</a>`; // XSS!
```

### Validating Input
```javascript
// ❌ WRONG: Don't skip validation
if (data.title) { ... } // No length/format checks!

// ❌ WRONG: Don't use regex without validation helper
if (/^[a-z]+$/.test(userInput)) { ... } // Incomplete validation
```

### Checking Roles
```javascript
// ❌ WRONG: Don't compare roles directly
if (user.role === 'admin') { ... } // Case-sensitive, unsafe!

// ❌ WRONG: Don't skip null checks
if (user.role === 'admin' || user.role === 'executive') { ... } // Crashes if user is null!
```

---

## Common Patterns

### Pattern 1: Render Article Card
```javascript
// ✅ CORRECT
const card = document.createElement('div');
card.className = 'article-card';

const title = document.createElement('h3');
title.textContent = article.title; // Safe: textContent
card.appendChild(title);

const content = document.createElement('div');
CMSSecurity.renderContent(content, article); // Safe: Delta or sanitized HTML
card.appendChild(content);
```

### Pattern 2: Create Link
```javascript
// ✅ CORRECT
const link = document.createElement('a');
link.textContent = linkText; // Safe: textContent

const url = CMSSecurity.toSafeHttpUrl(linkUrl);
if (url) {
  link.href = url; // Safe: validated URL
  if (link.target === '_blank') {
    link.rel = 'noopener noreferrer'; // Safe: prevent tabnabbing
  }
}
```

### Pattern 3: Validate Form
```javascript
// ✅ CORRECT
const errors = CMSSecurity.validateInput(formData, {
  title: { required: true, minLength: 3, maxLength: 100 },
  description: { required: true, minLength: 10 },
  url: { type: 'url' },
  email: { type: 'email' }
});

if (errors.length > 0) {
  showErrors(errors);
  return;
}

// Proceed with validated data
```

### Pattern 4: Check Access
```javascript
// ✅ CORRECT
async function initCMS() {
  const user = await authManager.getCurrentUser();
  
  if (!CMSSecurity.validateRole(user)) {
    showError('Access denied. CMS is for executives and admins only.');
    return;
  }
  
  // Initialize CMS
}
```

---

## Security Helpers Reference

### CMSSecurity Methods

| Method | Purpose | Returns |
|--------|---------|---------|
| `renderSafeHtml(html, container)` | Render HTML with DOMPurify | void |
| `renderDeltaInto(container, delta)` | Render Quill Delta (preferred) | void |
| `renderContent(container, data)` | Auto-detect format and render | void |
| `validateInput(data, rules)` | Validate form data | string[] (errors) |
| `validateRole(user)` | Check if user can access CMS | boolean |
| `isSafeHttpUrl(url)` | Check if URL is http/https | boolean |
| `isSameOriginHttpUrl(url)` | Check if URL is same-origin | boolean |
| `toSafeHttpUrl(url)` | Convert to safe URL or empty | string |
| `isValidEmail(email)` | Check email format | boolean |
| `sanitizeFileName(name)` | Clean filename for upload | string |
| `generateSecureId()` | Generate crypto-secure ID | string |
| `escapeHtml(str)` | Escape HTML entities | string |
| `deltaToPlainText(delta)` | Extract plain text from Delta | string |

### Validation Rules

| Rule | Type | Description |
|------|------|-------------|
| `required` | boolean | Field must have value |
| `minLength` | number | Min string length (after trim) |
| `maxLength` | number | Max string length (after trim) |
| `pattern` | RegExp | Custom regex pattern |
| `type` | string | 'email', 'url', 'number', 'string' |
| `min` | number | Min value (for numbers) |
| `max` | number | Max value (for numbers) |
| `integer` | boolean | Must be integer (for numbers) |

---

## CSP Quick Reference

### Minimal CSP (Copy-Paste Ready)
```http
Content-Security-Policy: default-src 'self'; script-src 'self' https://cdn.jsdelivr.net https://cdn.quilljs.com; style-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net https://cdn.quilljs.com; img-src 'self' data: https:; font-src 'self' https://cdn.jsdelivr.net; connect-src 'self' https://*.supabase.co; object-src 'none'; base-uri 'self'; frame-ancestors 'none'; form-action 'self'; upgrade-insecure-requests;
```

### Additional Security Headers
```http
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: geolocation=(), microphone=(), camera=()
```

---

## Testing Checklist

### Before Committing Code
- [ ] No `innerHTML` with user content
- [ ] All URLs validated with `isSafeHttpUrl()`
- [ ] All user text uses `textContent` (not `innerHTML`)
- [ ] All forms use `validateInput()`
- [ ] All role checks use `validateRole()`
- [ ] All IDs use `generateSecureId()`
- [ ] No memory leaks (event listeners cleaned up)

### Before Deploying
- [ ] DOMPurify loaded in HTML
- [ ] CSP headers configured
- [ ] Debug mode disabled
- [ ] Security headers added
- [ ] XSS testing passed
- [ ] Role-based access tested

---

## Emergency Contacts

### If You Find a Security Issue
1. **Don't commit it** to version control
2. **Report immediately** to security team
3. **Document** the issue privately
4. **Wait** for security team response

### Security Resources
- **Full Guide**: `CMS_PRODUCTION_SECURITY_GUIDE.md`
- **Summary**: `CMS_FINAL_PRODUCTION_SUMMARY.md`
- **OWASP**: https://owasp.org/www-project-top-ten/
- **DOMPurify**: https://github.com/cure53/DOMPurify

---

**Last Updated**: February 7, 2026  
**Version**: 1.0.0
