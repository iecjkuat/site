# Images & Assets Directory

This directory contains all images, icons, and visual assets used throughout the JKUAT Innovation & Entrepreneurship Club website.

## Folder Structure

```
pages/shared/assets/images/
├── backgrounds/     # Background images for pages and sections
├── icons/          # Icon files (SVG, PNG) for UI elements
├── logos/          # Club logos and branding assets
└── README.md       # This file
```

## Directory Details

### 📁 backgrounds/
Contains background images used across the website.

**Usage Examples:**
- Hero section backgrounds
- Auth page backgrounds (signin/signup)
- Section dividers
- Banner images
- Pattern overlays

**Recommended Formats:**
- JPG for photos (optimized, max 500KB)
- PNG for graphics with transparency
- WebP for modern browsers (best compression)
- SVG for patterns and illustrations

**Naming Convention:**
- `hero-[page-name].jpg` - Hero section backgrounds
- `auth-[type].jpg` - Authentication page backgrounds
- `pattern-[name].svg` - Repeating patterns
- `banner-[section].jpg` - Section banners

**Examples:**
```
backgrounds/
├── hero-home.jpg
├── auth-ocean.jpg
├── auth-innovation.jpg
├── pattern-dots.svg
├── banner-events.jpg
└── banner-projects.jpg
```

### 📁 icons/
Contains icon files for UI elements and features.

**Usage Examples:**
- Navigation icons
- Feature icons
- Social media icons
- Status indicators
- Action buttons

**Recommended Formats:**
- SVG (preferred - scalable, small file size)
- PNG (for complex icons, multiple sizes: 16x16, 32x32, 64x64)

**Naming Convention:**
- `icon-[name].svg` - General icons
- `social-[platform].svg` - Social media icons
- `feature-[name].svg` - Feature/service icons

**Examples:**
```
icons/
├── icon-rocket.svg
├── icon-lightbulb.svg
├── icon-users.svg
├── social-facebook.svg
├── social-twitter.svg
├── social-linkedin.svg
├── feature-innovation.svg
└── feature-collaboration.svg
```

### 📁 logos/
Contains club logos and branding assets.

**Usage Examples:**
- Main club logo
- Logo variations (light/dark)
- Partner logos
- Sponsor logos
- Event logos

**Recommended Formats:**
- SVG (preferred for logos)
- PNG with transparency (multiple sizes)

**Naming Convention:**
- `logo-[variant].svg` - Main logos
- `logo-[partner-name].png` - Partner/sponsor logos

**Examples:**
```
logos/
├── logo-main.svg
├── logo-white.svg
├── logo-dark.svg
├── logo-icon-only.svg
├── logo-jkuat.png
└── logo-partner-[name].png
```

## Usage in Code

### HTML
```html
<!-- Background Image -->
<div style="background-image: url('/shared/assets/images/backgrounds/hero-home.jpg')">
  ...
</div>

<!-- Icon -->
<img src="/shared/assets/images/icons/icon-rocket.svg" alt="Innovation">

<!-- Logo -->
<img src="/shared/assets/images/logos/logo-main.svg" alt="JKUAT Innovation Club">
```

### CSS
```css
/* Background Image */
.hero-section {
  background-image: url('/shared/assets/images/backgrounds/hero-home.jpg');
  background-size: cover;
  background-position: center;
}

/* Icon as background */
.feature-icon {
  background-image: url('/shared/assets/images/icons/feature-innovation.svg');
  background-size: contain;
  background-repeat: no-repeat;
}
```

### JavaScript
```javascript
// Dynamic image loading
const bgImage = '/shared/assets/images/backgrounds/auth-ocean.jpg';
element.style.backgroundImage = `url('${bgImage}')`;
```

## Image Optimization Guidelines

### File Size Limits
- **Backgrounds**: Max 500KB (compress using TinyPNG or similar)
- **Icons**: Max 50KB
- **Logos**: Max 100KB

### Dimensions
- **Hero backgrounds**: 1920x1080px (Full HD)
- **Auth backgrounds**: 1200x800px
- **Icons**: 64x64px, 128x128px, 256x256px
- **Logos**: Variable (maintain aspect ratio)

### Optimization Tools
- [TinyPNG](https://tinypng.com/) - PNG/JPG compression
- [SVGOMG](https://jakearchibald.github.io/svgomg/) - SVG optimization
- [Squoosh](https://squoosh.app/) - Modern image compression

## Best Practices

1. **Always optimize images** before uploading
2. **Use descriptive filenames** (no spaces, use hyphens)
3. **Provide alt text** for accessibility
4. **Use WebP format** when possible for better compression
5. **Lazy load** large background images
6. **Use SVG** for icons and logos when possible
7. **Maintain aspect ratios** to avoid distortion
8. **Test on different screen sizes** and resolutions

## Current Assets

### Backgrounds
- [ ] Hero home page background
- [ ] Auth page ocean/kayak background (turquoise theme)
- [ ] Events section banner
- [ ] Projects section banner

### Icons
- [ ] Rocket icon (innovation)
- [ ] Lightbulb icon (ideas)
- [ ] Users icon (community)
- [ ] Social media icons (Facebook, Twitter, LinkedIn)

### Logos
- [ ] Main club logo
- [ ] White variant (for dark backgrounds)
- [ ] Icon-only version (favicon)
- [ ] JKUAT university logo

## Adding New Images

1. Optimize the image using recommended tools
2. Place in appropriate folder (backgrounds/icons/logos)
3. Use proper naming convention
4. Update this README if adding new categories
5. Test the image loads correctly in the browser
6. Commit with descriptive message: "Add [image-name] to [folder]"

## Server Configuration

The images are served statically through Express.js:

```javascript
// In server.js
app.use('/shared', express.static('pages/shared'));
```

This means images are accessible at:
- `/shared/assets/images/backgrounds/[filename]`
- `/shared/assets/images/icons/[filename]`
- `/shared/assets/images/logos/[filename]`

## Notes

- All images should be web-optimized before upload
- Consider using a CDN for production deployment
- Keep original high-resolution files in a separate backup location
- Update this README when adding new image categories
