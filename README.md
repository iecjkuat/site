# JKUAT Innovation Club Website

A comprehensive web platform for the JKUAT Innovation Club, designed to manage memberships, events, ideas, and foster innovation among students.

## Features

### 🔐 Authentication & Onboarding
- Student registration with JKUAT credentials
- Email/Phone verification
- Password recovery
- Profile completion wizard

### 👥 Membership Management
- Digital membership registration
- M-Pesa payment integration
- Membership status tracking
- Digital membership cards
- Member directory

### 👤 User Profiles
- Personal information management
- Academic details display
- Activity participation logs
- Notification preferences

### 🏛️ Leadership & Meetings
- Executive Committee directory
- Meeting management (AGM/SGM)
- Voting portal for elections
- Constitutional documents access

### 📅 Events Management
- Event calendar and registration
- QR code attendance tracking
- Event feedback system
- Real-time updates

### 💡 Ideas & Innovation Hub
- Idea submission portal
- Collaboration requests
- Voting and discussion system
- Project tracking

### 🔔 Notifications & Communication
- Push notifications
- In-app messaging
- Email integration
- Announcement system

### 💰 Financial Management
- Payment processing (M-Pesa, Cards)
- Financial transparency
- Receipt generation
- Donation tracking

## Technology Stack

- **Backend**: Node.js, Express.js
- **Database**: PostgreSQL (via Supabase)
- **Frontend**: HTML5, CSS3, JavaScript (served via `pages` directory)
- **Authentication**: JWT (JSON Web Tokens), Supabase Auth
- **Email**: NodeMailer (or other, via `utils/email.js`)
- **Payments**: M-Pesa API integration (placeholder)
- **Security**: Helmet, CORS, Rate limiting

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd IEC
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env` file in the root directory by copying `.env.example`:
   ```env
   # Supabase credentials
   SUPABASE_URL=your_supabase_url
   SUPABASE_KEY=your_supabase_service_role_key

   # JWT Secret for signing tokens
   JWT_SECRET=your_jwt_secret_key_here
   
   # Server port
   PORT=3000

   # Other credentials for email, payments, etc.
   EMAIL_HOST=smtp.example.com
   EMAIL_PORT=587
   EMAIL_USER=your_email@example.com
   EMAIL_PASS=your_email_password
   ```

4. **Set up Supabase**
   - Create a new project on [Supabase](https://supabase.com/).
   - In the SQL Editor, run the schema files located in the `supabase/` directory in numerical order.
   - Get the Project URL and the `service_role` key from your Supabase project's API settings and add them to your `.env` file.

5. **Run the application**
   ```bash
   # Development mode (if a script is configured, e.g., using nodemon)
   npm run dev
   
   # Production mode
   npm start
   ```
   If no `dev` script is available, use `npm start`.

6. **Access the application**
   Open your browser and navigate to `http://localhost:3000`

## Project Structure

```
IEC/
├── api/                  # Serverless functions for Vercel
├── docs/                 # Project documentation
├── lib/                  # Core libraries (e.g., supabase client)
├── middleware/           # Express middleware (auth, validation)
├── pages/                # Frontend HTML, CSS, and JS files
│   ├── admin/
│   ├── dashboard/
│   └── ...
├── routes/               # Backend API routes for Express
│   ├── auth.js
│   ├── events.js
│   └── ...
├── scripts/              # Utility and migration scripts
├── supabase/             # SQL files for database schema
├── utils/                # Utility functions (email, etc.)
├── server.js             # Main Express server entry point
├── package.json          # Dependencies and scripts
└── README.md             # This file
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `POST /api/auth/verify-email` - Verify email
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password

### Events
- `GET /api/events` - Get all events
- `POST /api/events` - Create new event (Admin)
- `GET /api/events/:id` - Get event details
- `POST /api/events/:id/register` - Register for event

### Ideas
- `GET /api/ideas` - Get all ideas
- `POST /api/ideas` - Submit new idea
- `GET /api/ideas/:id` - Get idea details

## Features Implementation Status

### ✅ Completed
- User authentication and registration
- Basic member management
- Event creation and management
- Ideas submission and management
- Leadership directory
- Notification system
- Dashboard interface

### 🚧 In Progress
- M-Pesa API integration
- Email notification system
- File upload functionality
- Advanced search and filtering
- JKUAT Portal Integration (currently mocked)

### 📋 Planned
- Mobile app development
- Advanced analytics
- Automated testing suite

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/new-feature`)
3. Commit your changes (`git commit -am 'Add new feature'`)
4. Push to the branch (`git push origin feature/new-feature`)
5. Create a Pull Request

## Security Considerations

- All passwords are managed by Supabase Auth.
- JWT tokens for secure session management.
- Input validation and sanitization.
- Rate limiting to prevent abuse.
- CORS configuration for cross-origin requests.
- Helmet for security headers.
- RLS (Row Level Security) in Supabase should be enabled for production.

## Deployment

### Environment Setup
1. Set up a Supabase project and run the SQL schema scripts.
2. Configure environment variables for Supabase, JWT, email, etc.
3. Ensure all services (like email) are configured for production use.

### Production Deployment
The project is configured for deployment on Vercel.
```bash
# Deploy to Vercel
vercel
```
The `vercel.json` file configures the build to use the Node.js runtime for the Express server.

## Support

For support and questions:
- Email: info@jkuatinnovation.club
- GitHub Issues: Create an issue in this repository

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- JKUAT Innovation Club members and leadership
- Contributors and developers
- Open source libraries and frameworks used

---

**JKUAT Innovation Club** - Empowering students to innovate, create, and transform ideas into reality.