# JKUAT Clubs Platform - Supabase Setup Guide

## 🚀 Quick Setup

### Prerequisites
- Node.js (v16 or higher)
- Supabase account (free tier works)
- Git

### Step 1: Get Supabase Credentials

1. Go to [supabase.com](https://supabase.com) and create a project
2. In your Supabase dashboard:
   - **Settings → Database**: Copy the connection string
   - **Settings → API**: Copy the Project URL, anon key, and service_role key

### Step 2: Configure Environment

1. Update the `.env` file with your Supabase credentials:

```env
# Database (from Supabase Settings → Database)
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@db.YOUR_PROJECT_REF.supabase.co:5432/postgres"

# Supabase (from Supabase Settings → API)
SUPABASE_URL="https://YOUR_PROJECT_REF.supabase.co"
SUPABASE_ANON_KEY="your_anon_key_here"
SUPABASE_SERVICE_KEY="your_service_role_key_here"

# Server
PORT=3000
NODE_ENV=development

# JWT Secret (generate a random string)
JWT_SECRET="your-super-secure-random-string-here"
```

### Step 3: Install Dependencies

```bash
npm install
```

### Step 4: Set Up Database

```bash
# Create database tables
npm run db:setup

# Seed database with sample data
npm run db:seed
```

### Step 5: Set Up Row Level Security (Optional but Recommended)

In your Supabase SQL Editor, you can run additional RLS policies from `scripts/init-postgresql.sql` for enhanced security.

### Step 6: Start the Server

```bash
npm start
# or for development with auto-reload
npm run dev
```

### Step 7: Test the Setup

Visit: http://localhost:3000

**Test Credentials** (from seed data):
- Admin: `admin@jkuatinnovation.ac.ke` / `admin123`
- User: `john.doe@student.jkuat.ac.ke` / `password123`

## 📁 Project Structure

```
├── lib/
│   └── supabase.js        # Supabase client
├── scripts/
│   ├── setup-database.js  # Database setup
│   └── seed-database.js   # Sample data
├── routes/
│   ├── auth.js            # Authentication
│   ├── clubs.js           # Club management
│   ├── events.js          # Event management
│   ├── payments.js        # Payment processing
│   ├── ideas.js           # Ideas hub
│   ├── messages.js        # Messaging system
│   ├── resources.js       # Resource sharing
│   ├── opportunities.js   # Opportunities board
│   └── support.js         # Support tickets
├── public/                # Frontend files
├── scripts/
│   └── init-postgresql.sql # RLS policies
├── utils/
│   └── jkuatPortal.js     # JKUAT portal integration
├── .env                   # Environment variables
├── server.js              # Main server
└── package.json           # Dependencies

```

## 🔧 Available Scripts

```bash
npm start              # Start production server
npm run dev            # Start development server with auto-reload
npm run db:setup       # Set up database tables
npm run db:seed        # Seed database with sample data
```

## 🌐 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/validate-student` - Validate JKUAT student
- `GET /api/auth/verify` - Verify session
- `POST /api/auth/logout` - Logout user

### Clubs
- `GET /api/clubs` - Get all clubs
- `GET /api/clubs/:id` - Get club details
- `POST /api/clubs/register` - Register new club
- `GET /api/clubs/:id/members` - Get club members
- `GET /api/clubs/:id/stats` - Get club statistics

### Events
- `GET /api/events` - Get all events
- `GET /api/events/:id` - Get event details
- `POST /api/events` - Create event
- `POST /api/events/:id/register` - Register for event
- `GET /api/events/:id/attendees` - Get attendees

### Payments
- `GET /api/payments` - Get payments
- `POST /api/payments/mpesa/initiate` - Initiate M-Pesa payment
- `POST /api/payments/card/process` - Process card payment
- `GET /api/payments/:id/receipt` - Get receipt

### Ideas
- `GET /api/ideas` - Get all ideas
- `POST /api/ideas` - Submit idea
- `POST /api/ideas/:id/vote` - Vote on idea
- `PUT /api/ideas/:id/status` - Update idea status

### Messages
- `GET /api/messages/inbox/:userId` - Get inbox
- `GET /api/messages/sent/:userId` - Get sent messages
- `POST /api/messages` - Send message
- `PUT /api/messages/:id/read` - Mark as read

### Resources
- `GET /api/resources` - Get resources
- `POST /api/resources` - Upload resource
- `POST /api/resources/:id/download` - Download resource
- `GET /api/resources/search/:query` - Search resources

### Opportunities
- `GET /api/opportunities` - Get opportunities
- `POST /api/opportunities` - Post opportunity
- `GET /api/opportunities/search/:query` - Search opportunities
- `GET /api/opportunities/urgent/:clubId` - Get urgent opportunities

### Support
- `GET /api/support` - Get support tickets
- `POST /api/support` - Create ticket
- `PUT /api/support/:id/status` - Update ticket status
- `PUT /api/support/:id/assign` - Assign ticket

## 🔐 Security Features

- **Supabase Auth** - Built-in authentication
- **Row Level Security** - Database-level access control
- **JWT Tokens** - Secure session management
- **Password Hashing** - bcrypt with salt rounds
- **Rate Limiting** - API request throttling
- **CORS Protection** - Cross-origin security
- **Helmet.js** - Security headers

## 📊 Features

✅ Multi-club architecture
✅ JKUAT portal integration
✅ User authentication & authorization
✅ Event management with registration
✅ Payment processing (M-Pesa & Card)
✅ Ideas hub with voting
✅ Real-time messaging
✅ Resource sharing with access control
✅ Opportunities board
✅ Support ticket system
✅ Comprehensive analytics

## 🐛 Troubleshooting

### Database Connection Issues
```bash
# Test connection
node -e "require('./lib/prisma').$queryRaw\`SELECT 1\`.then(() => console.log('✅ Connected')).catch(e => console.error('❌ Error:', e.message))"
```

### Prisma Issues
```bash
# Reset Prisma client
rm -rf node_modules/.prisma
npx prisma generate
```

### Port Already in Use
```bash
# Change PORT in .env file
PORT=3001
```

## 📚 Documentation

- [Supabase Docs](https://supabase.com/docs)
- [Prisma Docs](https://www.prisma.io/docs)
- [Express.js Docs](https://expressjs.com/)

## 🆘 Support

For issues or questions:
1. Check the troubleshooting section
2. Review Supabase dashboard for errors
3. Check application logs
4. Verify environment variables

## 🚀 Deployment

### Vercel/Netlify
1. Connect your Git repository
2. Add environment variables
3. Deploy

### Traditional Hosting
1. Set `NODE_ENV=production`
2. Run `npm install --production`
3. Run `npm start`

### Docker
```dockerfile
FROM node:16
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY . .
RUN npx prisma generate
EXPOSE 3000
CMD ["npm", "start"]
```

## 📝 License

MIT License - See LICENSE file for details

---

**Built for JKUAT Innovation and Entrepreneurship Club** 🚀