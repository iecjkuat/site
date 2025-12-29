# Deployment Security Guide

## 🔒 Security Checklist Before Deployment

### 1. Environment Variables
- [ ] Copy `.env.example` to `.env` and fill with your actual credentials
- [ ] Generate a strong JWT secret (minimum 32 characters)
- [ ] Use production database credentials
- [ ] Configure production email settings
- [ ] Set up production M-Pesa credentials
- [ ] Set `NODE_ENV=production`

### 2. Database Security
- [ ] Change default sample user passwords
- [ ] Remove or disable test endpoints in production
- [ ] Enable Row Level Security (RLS) policies
- [ ] Use connection pooling for production
- [ ] Regular database backups

### 3. API Security
- [ ] Enable rate limiting
- [ ] Use HTTPS in production
- [ ] Configure CORS for production domains only
- [ ] Remove debug endpoints
- [ ] Enable request logging

### 4. File Security
- [ ] Ensure `.env` is in `.gitignore`
- [ ] Remove any hardcoded credentials from code
- [ ] Secure file upload directories
- [ ] Set proper file permissions

## 🚀 Production Environment Setup

### Required Environment Variables

```bash
# Database
DATABASE_URL="your_production_database_url"
SUPABASE_URL="your_production_supabase_url"
SUPABASE_ANON_KEY="your_production_anon_key"
SUPABASE_SERVICE_KEY="your_production_service_key"

# Security
JWT_SECRET="your_secure_jwt_secret_minimum_32_chars"
NODE_ENV="production"

# Email
EMAIL_HOST="your_smtp_host"
EMAIL_PORT=587
EMAIL_USER="your_production_email"
EMAIL_PASS="your_production_email_password"

# Payments
MPESA_CONSUMER_KEY="your_production_mpesa_key"
MPESA_CONSUMER_SECRET="your_production_mpesa_secret"
MPESA_SHORTCODE="your_production_shortcode"
MPESA_PASSKEY="your_production_passkey"

# Frontend
FRONTEND_URL="https://your-production-domain.com"
```

### Security Headers
The application includes security headers via Helmet.js:
- Content Security Policy
- X-Frame-Options
- X-Content-Type-Options
- Referrer Policy

### Authentication Security
- JWT tokens with expiration
- Password hashing with bcrypt (12 rounds)
- Email verification required
- Role-based access control

## ⚠️ Important Notes

1. **Never commit `.env` files** - They are already in `.gitignore`
2. **Change default passwords** - Sample data uses `admin123` for testing
3. **Use HTTPS in production** - Required for secure authentication
4. **Regular security updates** - Keep dependencies updated
5. **Monitor logs** - Set up proper logging and monitoring

## 🔧 Production Deployment Steps

1. Clone repository
2. Copy `.env.example` to `.env`
3. Fill in production credentials
4. Run database migrations
5. Change default user passwords
6. Configure reverse proxy (nginx)
7. Set up SSL certificates
8. Configure monitoring and logging

## 📞 Support

For security concerns or questions, contact the development team.