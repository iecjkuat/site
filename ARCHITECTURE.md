# JKUAT Innovation Club - Frontend Architecture

## Folder Structure

```
public/
├── assets/                     # Static assets
│   ├── images/                # Images, logos, icons
│   ├── fonts/                 # Custom fonts
│   └── icons/                 # SVG icons, favicons
│
├── css/                       # Stylesheets
│   ├── base/                  # Base styles
│   │   ├── reset.css         # CSS reset
│   │   ├── variables.css     # CSS custom properties
│   │   └── typography.css    # Font definitions
│   ├── components/           # Reusable component styles
│   │   ├── buttons.css       # Button variants
│   │   ├── cards.css         # Card components
│   │   ├── forms.css         # Form elements
│   │   ├── modals.css        # Modal dialogs
│   │   └── navigation.css    # Navigation components
│   ├── layouts/              # Layout-specific styles
│   │   ├── header.css        # Site header
│   │   ├── footer.css        # Site footer
│   │   └── sidebar.css       # Sidebar layouts
│   ├── pages/                # Page-specific styles
│   │   ├── home.css          # Homepage specific
│   │   ├── events.css        # Events page specific
│   │   ├── dashboard.css     # Dashboard specific
│   │   └── admin.css         # Admin panel specific
│   ├── themes/               # Theme variations
│   │   ├── glassmorphism.css # Current glassmorphism theme
│   │   ├── dark.css          # Dark theme variant
│   │   └── light.css         # Light theme variant
│   └── utilities/            # Utility classes
│       ├── spacing.css       # Margin, padding utilities
│       ├── colors.css        # Color utilities
│       └── responsive.css    # Responsive utilities
│
├── js/                       # JavaScript modules
│   ├── core/                 # Core functionality
│   │   ├── app.js           # Main app initialization
│   │   ├── config.js        # App configuration
│   │   ├── router.js        # Client-side routing (if needed)
│   │   └── utils.js         # Utility functions
│   ├── components/          # Reusable JS components
│   │   ├── auth.js          # Authentication module
│   │   ├── modal.js         # Modal component
│   │   ├── navigation.js    # Navigation component
│   │   ├── form-validator.js # Form validation
│   │   └── toast.js         # Toast notifications
│   ├── services/            # API and data services
│   │   ├── api.js           # Base API client
│   │   ├── auth-service.js  # Authentication API
│   │   ├── events-service.js # Events API
│   │   ├── users-service.js # Users API
│   │   └── clubs-service.js # Clubs API
│   ├── pages/               # Page-specific JavaScript
│   │   ├── home.js          # Homepage functionality
│   │   ├── events.js        # Events page functionality
│   │   ├── dashboard.js     # Dashboard functionality
│   │   └── admin.js         # Admin panel functionality
│   └── vendor/              # Third-party libraries (if not using CDN)
│       ├── chart.min.js     # Charts library
│       └── datepicker.min.js # Date picker
│
├── templates/               # HTML templates/partials
│   ├── components/          # Reusable HTML components
│   │   ├── header.html      # Site header template
│   │   ├── footer.html      # Site footer template
│   │   ├── navigation.html  # Navigation template
│   │   └── modals.html      # Modal templates
│   └── layouts/             # Page layout templates
│       ├── base.html        # Base layout template
│       ├── dashboard.html   # Dashboard layout
│       └── admin.html       # Admin layout
│
└── pages/                   # Individual page files
    ├── index.html           # Homepage
    ├── events.html          # Events page
    ├── dashboard.html       # Dashboard
    ├── admin.html           # Admin panel
    ├── clubs.html           # Clubs page
    ├── resources.html       # Resources page
    ├── opportunities.html   # Opportunities page
    ├── messages.html        # Messages page
    ├── payment.html         # Payment page
    ├── settings.html        # Settings page
    └── support.html         # Support page
```

## Architecture Principles

### 1. Modular Design
- Each component is self-contained
- Easy to add, remove, or modify components
- Clear separation of concerns

### 2. Scalability
- Easy to add new pages
- Reusable components across pages
- Consistent naming conventions

### 3. Maintainability
- Clear folder structure
- Documented code
- Version control friendly

### 4. Performance
- Lazy loading for page-specific assets
- Minified production builds
- Optimized asset delivery

### 5. Developer Experience
- Hot reloading in development
- Clear build process
- Easy debugging

## Implementation Strategy

### Phase 1: Core Infrastructure
1. Set up base CSS architecture
2. Create core JavaScript modules
3. Build reusable components

### Phase 2: Page Migration
1. Refactor existing pages to use new architecture
2. Extract common components
3. Implement consistent styling

### Phase 3: Advanced Features
1. Add build process (optional)
2. Implement lazy loading
3. Add PWA features (if needed)

## File Naming Conventions

### CSS Files
- Use kebab-case: `event-card.css`
- Prefix with component type: `btn-primary.css`
- Use descriptive names: `glassmorphism-theme.css`

### JavaScript Files
- Use kebab-case for files: `auth-service.js`
- Use camelCase for variables/functions
- Use PascalCase for classes: `EventManager`

### HTML Files
- Use kebab-case: `event-details.html`
- Keep names short but descriptive
- Use consistent naming across related files

## Build Process (Future)

```bash
# Development
npm run dev          # Start development server
npm run watch        # Watch for changes

# Production
npm run build        # Build for production
npm run minify       # Minify assets
npm run deploy       # Deploy to server
```

## Benefits

1. **Maintainability**: Easy to find and modify code
2. **Scalability**: Simple to add new features/pages
3. **Collaboration**: Clear structure for team development
4. **Performance**: Optimized loading and caching
5. **Future-proof**: Easy to migrate to frameworks if needed