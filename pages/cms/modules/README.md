# CMS Modules Directory Structure

This directory contains all the modular components of the Content Management System (CMS).

## 📁 Directory Structure

```
pages/cms/modules/
├── core/                           # Core utilities and services
│   ├── cms-api.js                 # API communication layer
│   ├── cms-data.js                # Data access layer
│   ├── cms-supabase.js            # Supabase client wrapper
│   ├── cms-security.js            # Security utilities
│   ├── cms-notifications.js       # Notification system
│   ├── cms-ui.js                  # UI component builders
│   ├── cms-editors.js             # Rich text editors
│   └── cms-mock-data.js           # Mock data for development
│
├── managers/                       # Tab-specific managers
│   ├── cms-articles-manager.js    # Articles tab
│   ├── cms-events-manager.js      # Events tab
│   ├── cms-projects-manager.js    # Projects tab
│   ├── cms-opportunities-manager.js # Opportunities tab
│   ├── cms-innovation-manager.js  # Innovation Hub (ideas & challenges)
│   ├── cms-voting-manager.js      # Voting/Elections tab
│   ├── cms-communications-manager.js # Communications tab
│   ├── cms-resources-manager.js   # Resources tab
│   ├── cms-members-manager.js     # Members management
│   └── cms-media-manager.js       # Media library
│
├── cms-manager.js                  # Main CMS coordinator
├── cms-leadership.js               # Leadership-specific features
└── cms-voting.js                   # Legacy voting module (deprecated)
```

## 🎯 Module Responsibilities

### Core Modules (`core/`)

These modules provide foundational services used across the entire CMS:

- **cms-api.js**: Handles all HTTP requests to the backend API
- **cms-data.js**: Provides data access methods (CRUD operations)
- **cms-supabase.js**: Wraps Supabase client for database operations
- **cms-security.js**: Security utilities (XSS protection, sanitization)
- **cms-notifications.js**: Toast notifications and alerts
- **cms-ui.js**: Reusable UI components (cards, modals, buttons)
- **cms-editors.js**: Rich text editor initialization (Quill)
- **cms-mock-data.js**: Mock data for development and testing

### Manager Modules (`managers/`)

Each manager handles a specific CMS tab/feature:

| Manager | Tab | Responsibilities |
|---------|-----|------------------|
| **Articles** | Articles | Create, edit, delete, publish articles |
| **Events** | Events | Manage events, registrations, attendance |
| **Projects** | Projects | Project showcase, collaboration |
| **Opportunities** | Opportunities | Internships, jobs, competitions |
| **Innovation** | Innovation Hub | Ideas submission, challenges |
| **Voting** | Voting | Elections, polls, voting management |
| **Communications** | Communications | Announcements, messaging |
| **Resources** | Resources | Documents, files, downloads |
| **Members** | Members | User management, roles, permissions |
| **Media** | Media Library | File uploads, media management |

### Main Modules

- **cms-manager.js**: Orchestrates all managers, handles tab switching, shared utilities
- **cms-leadership.js**: Special features for leadership team
- **cms-voting.js**: ⚠️ Deprecated - Use `managers/cms-voting-manager.js` instead

## 🔧 Usage Pattern

### Creating a New Manager

```javascript
// managers/cms-example-manager.js
export class CMSExampleManager {
    constructor(cmsManager) {
        this.cms = cmsManager;  // Reference to main CMS manager
        this.apiBase = '/api/v1';
    }

    async load() {
        // Load and display data
    }

    render(items) {
        // Render UI
    }

    async edit(id) {
        // Edit functionality
    }

    async delete(id) {
        // Delete functionality
    }
}
```

### Integrating with Main Manager

```javascript
// cms-manager.js
import { CMSExampleManager } from './managers/cms-example-manager.js';

class SecureCMSManager {
    constructor() {
        this.exampleManager = new CMSExampleManager(this);
    }
    
    async loadTabContent(tabName) {
        if (tabName === 'example') {
            return this.exampleManager.load();
        }
    }
}
```

## 📊 File Size Comparison

| Metric | Before Refactoring | After Refactoring |
|--------|-------------------|-------------------|
| Main file size | 6,152 lines | ~1,000 lines |
| Number of files | 10 files | 21 files |
| Largest file | 6,152 lines | ~500 lines |
| Average file size | 615 lines | ~120 lines |

## ✅ Benefits

1. **Maintainability**: Each file has a single, clear responsibility
2. **Readability**: Easy to find and understand specific functionality
3. **Collaboration**: Multiple developers can work on different managers
4. **Testing**: Easier to unit test individual managers
5. **Performance**: Can lazy-load managers as needed
6. **Scalability**: Easy to add new features without bloating existing files

## 🚀 Next Steps

1. ✅ Organize files into `core/` and `managers/` folders
2. ✅ Create all 10 manager modules
3. ⏳ Refactor main `cms-manager.js` to use managers
4. ⏳ Update import paths in `cms.html`
5. ⏳ Test all functionality
6. ⏳ Remove deprecated `cms-voting.js`

## 📝 Notes

- All managers follow the same pattern for consistency
- Managers receive the main CMS manager instance for accessing shared utilities
- Core modules are stateless utilities
- Manager modules maintain state for their specific domain

## 🔗 Related Documentation

- [CMS Refactoring Summary](../../../CMS_REFACTORING_SUMMARY.md)
- [Voting Flow Documentation](../../../VOTING_FLOW_DOCUMENTATION.md)
