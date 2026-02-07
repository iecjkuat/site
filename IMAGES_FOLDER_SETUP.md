# Images Folder Setup - Complete

## Folder Structure Created

```
pages/shared/assets/images/
├── backgrounds/          # Background images for pages
│   └── .gitkeep
├── icons/               # UI icons and symbols
│   └── .gitkeep
├── logos/               # Club and partner logos
│   └── .gitkeep
└── README.md            # Comprehensive documentation
```

## Access URLs

All images are accessible via these URL patterns:

### Backgrounds
```
/shared/assets/images/backgrounds/[filename]
```
Example: `/shared/assets/images/backgrounds/hero-home.jpg`

### Icons
```
/shared/assets/images/icons/[filename]
```
Example: `/shared/assets/images/icons/icon-rocket.svg`

### Logos
```
/shared/assets/images/logos/[filename]
```
Example: `/shared/assets/images/logos/logo-main.svg`

## Quick Usage Examples

### In HTML
```html
<!-- Background -->
<div style="background-image: url('/shared/assets/images/backgrounds/auth-ocean.jpg')">
  Content here
</div>

<!-- Icon -->
<img src="/shared/assets/images/icons/icon-innovation.svg" alt="Innovation">

<!-- Logo -->
<img src="/shared/assets/images/logos/logo-main.svg" alt="JKUAT Innovation Club">
```

### In CSS
```css
/* Background */
.auth-page .image-side {
  background-image: url('/shared/assets/images/backgrounds/auth-ocean.jpg');
  background-size: cover;
  background-position: center;
}

/* Icon */
.feature-icon {
  background-image: url('/shared/assets/images/icons/feature-innovation.svg');
}
```

### In JavaScript
```javascript
// Dynamic background
const bgImage = '/shared/assets/images/backgrounds/hero-home.jpg';
element.style.backgroundImage = `url('${bgImage}')`;
```

## Recommended Images to Add

### For Auth Pages (Priority)
1. **auth-ocean.jpg** - Turquoise ocean/kayak background for signin/signup
   - Dimensions: 1200x800px
   - Format: JPG (optimized)
   - Max size: 300KB

### For Home Page
2. **hero-home.jpg** - Main hero section background
   - Dimensions: 1920x1080px
   - Format: JPG (optimized)
   - Max size: 500KB

### Logos
3. **logo-main.svg** - Main club logo
4. **logo-white.svg** - White variant for dark backgrounds
5. **logo-icon.svg** - Icon-only version (for favicon)

### Icons
6. **icon-rocket.svg** - Innovation/launch icon
7. **icon-lightbulb.svg** - Ideas icon
8. **icon-users.svg** - Community icon
9. **icon-calendar.svg** - Events icon
10. **icon-project.svg** - Projects icon

## Image Optimization

Before adding images, optimize them:

### Online Tools
- [TinyPNG](https://tinypng.com/) - Compress PNG/JPG
- [SVGOMG](https://jakearchibald.github.io/svgomg/) - Optimize SVG
- [Squoosh](https://squoosh.app/) - Modern compression

### File Size Guidelines
- Backgrounds: Max 500KB
- Icons: Max 50KB
- Logos: Max 100KB

## Next Steps

1. **Add auth background image**
   - Find/create turquoise ocean/kayak image
   - Optimize to ~300KB
   - Save as `auth-ocean.jpg` in `backgrounds/` folder

2. **Update auth pages CSS**
   ```css
   .image-side {
     background-image: url('/shared/assets/images/backgrounds/auth-ocean.jpg');
     background-size: cover;
     background-position: center;
   }
   ```

3. **Add club logo**
   - Create/obtain SVG logo
   - Save as `logo-main.svg` in `logos/` folder
   - Update navbar and auth pages

4. **Add icons**
   - Download/create SVG icons
   - Save in `icons/` folder
   - Use in feature sections

## Testing

After adding images, test:
1. Image loads correctly in browser
2. File size is optimized
3. Image displays properly on different screen sizes
4. No 404 errors in console
5. Alt text is provided for accessibility

## Documentation

Full documentation available in:
`pages/shared/assets/images/README.md`

Includes:
- Detailed folder structure
- Naming conventions
- Usage examples
- Optimization guidelines
- Best practices
