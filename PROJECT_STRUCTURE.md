# JKUAT Innovation Club Platform - Project Structure

## Overview
A comprehensive web platform for the JKUAT Innovation Club built with Node.js, Express.js, and Supabase (PostgreSQL). The platform manages memberships, events, ideas, projects, and fosters innovation among students.

## Technology Stack
- **Backend**: Node.js, Express.js
- **Database**: PostgreSQL via Supabase
- **Frontend**: HTML5, CSS3 (Tailwind CSS), JavaScript
- **Authentication**: JWT + Supabase Auth
- **Real-time**: WebSocket
- **Email**: Nodemailer
- **Payments**: M-Pesa API, Card processing
- **Security**: Helmet, CORS, Rate limiting

## Project Architecture

```
jkuat-clubs-platform/
├── 📁 api/                          # API utilities
│   └── health.js                    # Health check endpoint
│
├── 📁 docs/                         # Documentation
│   ├── JKUAT_PORTAL_INTEGRATION.md  # Portal integration guide
│   ├── MEETINGS_GOVERNANCE_SYSTEM.md # Governance documentation
│   ├── MONGODB_COMPASS_SETUP.md     # Database setup guide
│   ├── NOTIFICATIONS_SYSTEM.md      # Notification system docs
│   └── POSTGRESQL_MIGRATION_GUIDE.md # Migration guide
│
├── 📁 lib/                          # Core libraries
│   ├── audit.js                     # Audit logging
│   └── supabase.js                  # Supabase client configuration
│
├── 📁 middleware/                   # Express middleware
│   ├── auth.js                      # Authentication middleware
│   └── validation.js                # Input validation & rate limiting
│
├── 📁 pages/                        # Frontend pages (21 total)
│   ├── 📁 admin/                    # Admin dashboard
│   ├── 📁 analytics/                # Analytics & reporting
│   ├── 📁 cms/                      # Content management
│   ├── 📁 complete-profile/         # User onboarding
│   ├── 📁 dashboard/                # User dashboard
│   ├── 📁 events/                   # Event management
│   ├── 📁 financial/                # Financial transparency
│   ├── 📁 home/                     # Landing page
│   ├── 📁 ideas/                    # Innovation hub
│   ├── 📁 messages/                 # Internal messaging
│   ├── 📁 offline/                  # Offline mode
│   ├── 📁 opportunities/            # Career opportunities
│   ├── 📁 payment/                  # Payment processing
│   ├── 📁 privacy/                  # Privacy policy
│   ├── 📁 projects/                 # Project showcase
│   ├── 📁 reset-password/           # Password recovery
│   ├── 📁 resources/                # Learning resources
│   ├── 📁 settings/                 # User settings
│   ├── 📁 support/                  # Help & support
│   ├── 📁 terms/                    # Terms & conditions
│   └── 📁 verify-email/             # Email verification
│
├── 📁 routes/                       # API routes
│   ├── analytics.js                 # Analytics endpoints
│   ├── auth.js                      # Authentication
│   ├── clubs.js                     # Club management
│   ├── communication.js             # Communication tools
│   ├── content.js                   # Content management
│   ├── elections.js                 # Election system
│   ├── email-service.js             # Email services
│   ├── events.js                    # Event management
│   ├── feedback.js                  # Feedback system
│   ├── financial.js                 # Financial management
│   ├── governance.js                # Governance system
│   ├── ideas.js                     # Ideas management
│   ├── leadership.js                # Leadership directory
│   ├── meetings.js                  # Meeting management
│   ├── membership.js                # Membership management
│   ├── messages.js                  # Messaging system
│   ├── notifications.js             # Notification system
│   ├── opportunities.js             # Opportunities board
│   ├── payment-service.js           # Payment processing
│   ├── payments.js                  # Payment endpoints
│   ├── projects.js                  # Project management
│   ├── resources.js                 # Resource sharing
│   ├── stats.js                     # Statistics
│   ├── support.js                   # Support system
│   ├── testimonials.js              # Testimonials
│   └── websocket-service.js         # WebSocket service
│
├── 📁 scripts/                      # Utility scripts
│   ├── seed-database.js             # Database seeding
│   └── setup-database.js            # Database setup
│
├── 📁 supabase/                     # Supabase configuration
│   ├── migrations/                  # Database migrations
│   └── config.toml                  # Supabase config
│
├── 📁 utils/                        # Utility functions
│   ├── email.js                     # Email utilities
│   ├── payment.js                   # Payment utilities
│   └── validation.js                # Validation helpers
│
├── 📄 .env                          # Environment variables
├── 📄 .env.example                  # Environment template
├── 📄 .gitignore                    # Git ignore rules
├── 📄 package.json                  # Dependencies & scripts
├── 📄 server.js                     # Main server file
├── 📄 README.md                     # Project documentation
├── 📄 PAGES_SUMMARY.md              # Pages overview
├── 📄 vercel.json                   # Vercel deployment config
└── 📄 vercel-node.json              # Vercel Node.js config
```

## Core Features

### 🔐 Authentication & User Management
- Student registration with JKUAT credentials
- Email/Phone verification
- JWT-based authentication
- Profile completion wizard
- Password recovery system

### 👥 Membership Management
- Digital membership registration
- M-Pesa payment integration
- Membership status tracking
- Digital membership cards
- Member directory

### 📅 Event Management
- Event creation and registration
- QR code attendance tracking
- Event feedback system
- Real-time updates via WebSocket
- Email notifications and reminders

### 💡 Innovation Hub
- Idea submission portal
- Collaboration requests
- Voting and discussion system
- Project tracking and showcase
- Hackathon management

### 💰 Financial Management
- Payment processing (M-Pesa, Cards)
- Financial transparency dashboard
- Receipt generation
- Budget tracking
- Donation management

### 🔔 Communication System
- Real-time messaging
- Push notifications
- Email integration
- Announcement system
- WebSocket for live updates

### 🏛️ Governance & Leadership
- Executive Committee directory
- Meeting management (AGM/SGM)
- Voting portal for elections
- Constitutional documents access
- Leadership statistics

### 📊 Analytics & Reporting
- Membership analytics
- Event participation metrics
- Financial reports
- User engagement tracking
- Administrative dashboards

## API Endpoints Structure

### Authentication (`/api/auth/`)
- Registration, login, logout
- Profile management
- Email verification
- Password recovery
- Academic information updates

### Club Management (`/api/clubs/`)
- Club registration and management
- Member management
- Club statistics
- Multi-club architecture support

### Event Management (`/api/events/`)
- Event CRUD operations
- Registration and attendance
- Event analytics
- QR code generation

### Payment Processing (`/api/payments/`)
- M-Pesa integration
- Card payment processing
- Payment history
- Receipt generation

### Ideas & Innovation (`/api/ideas/`)
- Idea submission and management
- Voting system
- Collaboration features
- Status tracking

### Communication (`/api/messages/`)
- Internal messaging
- Group conversations
- Message status tracking
- Real-time delivery

### Resources (`/api/resources/`)
- File upload and management
- Resource categorization
- Download tracking
- Search functionality

### Opportunities (`/api/opportunities/`)
- Job/internship postings
- Scholarship information
- Competition announcements
- Application tracking

## Database Schema (PostgreSQL via Supabase)

### Core Tables
- `users` - User accounts and profiles
- `clubs` - Club information and settings
- `events` - Event management
- `payments` - Payment transactions
- `ideas` - Innovation ideas and voting
- `messages` - Internal messaging
- `resources` - File and resource management
- `opportunities` - Career opportunities
- `leadership` - Leadership positions
- `notifications` - Notification system

### Security Features
- Row Level Security (RLS)
- JWT token validation
- Input sanitization
- Rate limiting
- CORS protection
- Helmet security headers

## Development Scripts

```bash
# Development
npm run dev          # Start with nodemon
npm start           # Production start

# Database
npm run db:setup    # Setup database
npm run db:seed     # Seed with sample data
npm run db:migrate  # Run migrations
npm run db:analyze  # Analyze database

# Security
npm run security:setup  # Setup security
npm run security:test   # Security tests

# Testing
npm test            # Run tests
```

## Environment Configuration

### Required Environment Variables
```env
# Server
PORT=3000
NODE_ENV=development

# Database (Supabase)
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Authentication
JWT_SECRET=your_jwt_secret

# Email Service
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_email_password

# Payment (M-Pesa)
MPESA_CONSUMER_KEY=your_mpesa_consumer_key
MPESA_CONSUMER_SECRET=your_mpesa_consumer_secret
MPESA_SHORTCODE=your_mpesa_shortcode
MPESA_PASSKEY=your_mpesa_passkey

# Security
ALLOWED_ORIGINS=http://localhost:3000,https://yourdomain.com
```

## Deployment Architecture

### Production Stack
- **Hosting**: Vercel (Node.js runtime)
- **Database**: Supabase (PostgreSQL)
- **CDN**: Vercel Edge Network
- **SSL**: Automatic HTTPS
- **Monitoring**: Built-in health checks

### Development Workflow
1. Local development with nodemon
2. Database migrations via Supabase CLI
3. Environment-specific configurations
4. Automated testing pipeline
5. Vercel deployment integration

## Security Implementation

### Authentication Security
- JWT token-based authentication
- Secure password hashing (bcrypt)
- Email verification required
- Session management
- Password recovery with tokens

### API Security
- Rate limiting per endpoint
- Input validation and sanitization
- CORS configuration
- Helmet security headers
- SQL injection prevention

### Data Protection
- Row Level Security (RLS)
- Encrypted sensitive data
- Audit logging
- GDPR compliance features
- Data retention policies

## Performance Optimizations

### Frontend
- Static asset optimization
- CSS/JS minification
- Image optimization
- Progressive Web App (PWA)
- Offline functionality

### Backend
- Database query optimization
- Connection pooling
- Caching strategies
- WebSocket for real-time updates
- Efficient API design

### Monitoring
- Health check endpoints
- Performance metrics
- Error tracking
- Database monitoring
- User analytics

---

**Version**: 2.0.0 (Supabase Edition)  
**Last Updated**: January 2026  
**Architecture**: Multi-tenant, Multi-club Platform