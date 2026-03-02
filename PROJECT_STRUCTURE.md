# JKUAT Innovation Club - Project Structure

## Root Directory

### Configuration Files
- `.env` - Environment variables (not in git)
- `.env.example` - Example environment variables template
- `.gitignore` - Git ignore rules
- `jsconfig.json` - JavaScript configuration
- `package.json` - Node.js dependencies
- `package-lock.json` - Locked dependency versions
- `server.js` - Main Express server

### Database Files
- `DATABASE_MIGRATIONS.sql` - Main database schema and migrations
- `DATABASE_SUPPORT_TABLES.sql` - Support system tables
- `DATABASE_SUPPORT_CLEAN_INSTALL.sql` - Clean install script for support system

### Documentation
- `README.md` - Main project documentation
- `QUICK_START.md` - Quick start guide
- `LIPANA_SETUP_GUIDE.md` - M-Pesa Lipana payment setup
- `NGROK_SETUP_COMPLETE.md` - Ngrok tunnel setup
- `PAYMENT_INTEGRATION_PLAN.md` - Payment integration documentation
- `PAYMENT_PAGE_REVIEW.md` - Payment page review notes

## Directory Structure

### `/api`
Health check and API utilities

### `/docs`
Comprehensive documentation for all features:
- Authentication improvements
- CMS features and security
- Email system
- Event management
- Ideas/Innovation system
- News articles
- Projects and collaboration
- Resources management
- Support chat system
- Performance guides

### `/lib`
Core libraries:
- `audit.js` - Audit logging
- `supabase.js` - Supabase client configuration

### `/middleware`
Express middleware:
- `auth.js` - Authentication middleware
- `csrf.js` - CSRF protection
- `validation.js` - Input validation

### `/pages`
Frontend pages organized by feature:

#### `/pages/admin`
Admin dashboard with modules for:
- User management
- Event management
- Ideas management
- Financial management
- Communication management
- Charts and analytics

#### `/pages/auth`
Authentication pages:
- Sign in
- Sign up

#### `/pages/cms`
Content Management System:
- Articles manager
- Events manager
- Projects manager
- Opportunities manager
- Resources manager
- Members manager
- Leadership manager
- Voting manager
- Feedback manager
- **Messages manager** (support chat)

#### `/pages/dashboard`
User dashboard with:
- Notifications
- Projects
- Activity feed

#### `/pages/events`
Events listing and details

#### `/pages/feedback`
User feedback submission

#### `/pages/home`
Landing page with:
- Activity feed
- Animations
- Components

#### `/pages/ideas`
Innovation ideas submission and voting

#### `/pages/payment`
M-Pesa payment integration

#### `/pages/support`
**Support chat system** for user-admin communication

### `/routes`
Backend API routes:
- Authentication
- Events
- Ideas
- Members
- News
- Opportunities
- Payment (Lipana)
- Projects
- Resources
- **Support** (chat/tickets)
- Voting

### `/shared`
Shared frontend utilities:
- Authentication
- Global navbar
- Supabase client
- Lightbox
- Core CSS (base, theme)

### `/scripts`
Utility scripts

### `/supabase`
Supabase configuration and migrations

### `/utils`
Backend utilities

## Key Features

### 1. Support Chat System
- **User Side**: `/support` - Chat interface for users to send messages
- **Admin Side**: CMS Messages tab - WhatsApp-style interface for admins to reply
- **Backend**: `/routes/support.js` - API for tickets and replies
- **Database**: `support_tickets` and `support_ticket_replies` tables

### 2. Payment Integration
- M-Pesa Lipana integration
- STK Push for payments
- Callback handling
- Payment verification

### 3. Content Management
- Articles/News
- Events with registration
- Projects with collaboration
- Opportunities (jobs, internships)
- Resources (documents, guides)
- Member management
- Leadership profiles
- Voting system

### 4. Innovation Hub
- Idea submission
- Voting and comments
- Challenges
- Collaboration

### 5. User Features
- Dashboard with personalized content
- Event registration
- Project participation
- Feedback submission
- Support chat

## Technology Stack

### Frontend
- Vanilla JavaScript (ES6+)
- HTML5 & CSS3
- Font Awesome icons
- Quill.js (rich text editor)
- DOMPurify (sanitization)

### Backend
- Node.js
- Express.js
- Supabase (PostgreSQL)
- JWT authentication

### External Services
- M-Pesa Daraja API
- Ngrok (for local development)
- Supabase (database & auth)

## Development Workflow

1. **Local Development**
   ```bash
   npm install
   npm start
   ```

2. **Database Setup**
   - Run `DATABASE_MIGRATIONS.sql` for main schema
   - Run `DATABASE_SUPPORT_CLEAN_INSTALL.sql` for support system

3. **Environment Variables**
   - Copy `.env.example` to `.env`
   - Fill in required credentials

4. **Testing**
   - Use ngrok for webhook testing
   - Test payment flows in sandbox mode

## File Naming Conventions

- **Pages**: `feature-name.html`, `feature-name.js`, `feature-name.css`
- **Managers**: `cms-feature-manager.js`
- **Routes**: `feature.js`
- **Documentation**: `FEATURE_NAME.md`
- **Database**: `DATABASE_FEATURE.sql`

## Code Organization

### Frontend Modules
Each feature has its own manager class:
```javascript
export class FeatureManager {
    constructor(cmsManager) {
        this.cms = cmsManager;
    }
    
    async load() {
        // Load feature data
    }
    
    cleanup() {
        // Cleanup on tab switch
    }
}
```

### Backend Routes
RESTful API structure:
```javascript
router.get('/', async (req, res) => {
    // List items
});

router.get('/:id', async (req, res) => {
    // Get single item
});

router.post('/', async (req, res) => {
    // Create item
});

router.put('/:id', async (req, res) => {
    // Update item
});

router.delete('/:id', async (req, res) => {
    // Delete item
});
```

## Security Features

- CSRF protection
- Input validation
- SQL injection prevention (parameterized queries)
- XSS prevention (DOMPurify)
- Authentication middleware
- Role-based access control
- Audit logging

## Performance Optimizations

- Batch DOM operations
- RequestAnimationFrame for animations
- Lazy loading
- Code splitting
- Efficient database queries
- Caching strategies

## Maintenance

### Regular Tasks
- Update dependencies
- Review audit logs
- Monitor error logs
- Backup database
- Test payment integration
- Review user feedback

### Code Quality
- Follow naming conventions
- Document complex logic
- Write meaningful commit messages
- Keep functions small and focused
- Use async/await consistently
- Handle errors gracefully

## Future Enhancements

- WebSocket for real-time updates
- Progressive Web App (PWA)
- Mobile app
- Advanced analytics
- Email notifications
- File attachments in support chat
- Multi-language support
- Dark mode
