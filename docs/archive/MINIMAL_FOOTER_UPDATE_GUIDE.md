# Minimal Footer Update Guide

## Overview
All pages (except home page) now use a minimal footer component for consistency.

## Implementation

### Shared Component
**File:** `shared/minimal-footer.js`

**Features:**
- Auto-renders on page load
- Includes inline CSS
- Responsive design
- Dynamic year in copyright

### Usage

Add these two lines before `</body>` in any HTML page:

```html
<!-- Minimal Footer -->
<div id="footer-placeholder"></div>
<script src="/shared/minimal-footer.js"></script>
```

The script will automatically:
1. Inject the footer HTML
2. Add necessary CSS
3. Display current year in copyright

## Pages Updated

### ✅ Completed (20 pages)
- [x] `pages/privacy/privacy.html`
- [x] `pages/support/support-modern.html`
- [x] `pages/feedback/feedback.html`
- [x] `pages/terms/terms.html`
- [x] `pages/dashboard/dashboard.html`
- [x] `pages/events/events.html`
- [x] `pages/ideas/ideas.html`
- [x] `pages/leadership/leadership.html`
- [x] `pages/news/news.html`
- [x] `pages/opportunities/opportunities.html`
- [x] `pages/payment/payment.html`
- [x] `pages/projects/projects.html`
- [x] `pages/resources/resources.html`
- [x] `pages/voting/voting.html`
- [x] `pages/admin/admin.html`
- [x] `pages/cms/cms.html`
- [x] `pages/complete-profile/complete-profile.html`
- [x] `pages/complete-registration/complete-registration.html`
- [x] `pages/auth/signin.html`
- [x] `pages/auth/signup.html`

### ⏭️ Skipped (No Footer Needed)
- `pages/home/index.html` - Has custom footer
- `pages/settings/settings.html` - Already has minimal footer
- `pages/verify-email/*` - Minimal pages
- `pages/reset-password/*` - Minimal pages
- `pages/admin/test-charts.html` - Test page
- `pages/complete-registration/complete-registration-new.html` - Alternative version

## Footer Styling

The minimal footer includes:

```css
.minimal-footer {
    background: rgba(0, 0, 0, 0.5);
    border-top: 1px solid rgba(255, 255, 255, 0.1);
    padding: 2rem 0;
    margin-top: 4rem;
    text-align: center;
}

.minimal-footer p {
    color: rgba(255, 255, 255, 0.6);
    font-size: 0.875rem;
    margin: 0;
}
```

## Replacing Existing Footers

For pages with existing footers (like leadership.html):

1. Remove the old `<footer>` element
2. Remove any footer-specific CSS
3. Add the minimal footer placeholder and script

**Example:**

Before:
```html
<footer class="leadership-footer">
    <div class="container">
        <!-- Complex footer content -->
    </div>
</footer>
<script src="footer.js"></script>
</body>
```

After:
```html
<div id="footer-placeholder"></div>
<script src="/shared/minimal-footer.js"></script>
</body>
```

## Benefits

1. **Consistency** - All pages have the same footer style
2. **Maintainability** - Update footer in one place
3. **Performance** - Lightweight, no external dependencies
4. **Responsive** - Works on all screen sizes
5. **Dynamic** - Auto-updates year

## Testing Checklist

For each updated page:
- [ ] Footer appears at bottom
- [ ] Copyright text is visible
- [ ] Year is current
- [ ] Styling matches design
- [ ] Responsive on mobile
- [ ] No console errors

## Troubleshooting

### Footer not appearing
- Check if script is loaded: `<script src="/shared/minimal-footer.js"></script>`
- Check browser console for errors
- Verify placeholder exists: `<div id="footer-placeholder"></div>`

### Styling issues
- Check if other CSS is conflicting
- Verify no duplicate footer elements
- Clear browser cache

### Wrong year
- Check browser date/time settings
- Verify JavaScript is enabled

## Future Enhancements

Possible additions to minimal footer:
- Social media links
- Quick links (Privacy, Terms)
- Contact information
- Language selector
