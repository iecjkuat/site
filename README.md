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

### 🏛️ Leadership & Governance
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
- **Frontend**: HTML5, CSS3 (Tailwind CSS), JavaScript
- **Authentication**: JWT (JSON Web Tokens)
- **Email**: Nodemailer
- **Payments**: M-Pesa API integration
- **Security**: Helmet, CORS, Rate limiting

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd jkuat-innovation-club
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env` file in the root directory:
   ```env
   PORT=3000
   MONGODB_URI=mongodb://localhost:27017/jkuat-innovation-club
   JWT_SECRET=your_jwt_secret_key_here
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USER=your_email@gmail.com
   EMAIL_PASS=your_email_password
   MPESA_CONSUMER_KEY=your_mpesa_consumer_key
   MPESA_CONSUMER_SECRET=your_mpesa_consumer_secret
   MPESA_SHORTCODE=your_mpesa_shortcode
   MPESA_PASSKEY=your_mpesa_passkey
   ```

4. **Start MongoDB**
   Make sure MongoDB is running on your system.

5. **Run the application**
   ```bash
   # Development mode
   npm run dev
   
   # Production mode
   npm start
   ```

6. **Access the application**
   Open your browser and navigate to `http://localhost:3000`

## Project Structure

```
jkuat-innovation-club/
├── models/              # Database models
│   ├── User.js         # User/Member model
│   ├── Event.js        # Events model
│   ├── Idea.js         # Ideas model
│   ├── Payment.js      # Payments model
│   ├── Leadership.js   # Leadership positions
│   └── Notification.js # Notifications model
├── routes/             # API routes
│   ├── auth.js         # Authentication routes
│   ├── members.js      # Member management
│   ├── events.js       # Event management
│   ├── ideas.js        # Ideas management
│   ├── payments.js     # Payment processing
│   ├── leadership.js   # Leadership management
│   └── notifications.js # Notification system
├── middleware/         # Custom middleware
│   └── auth.js         # Authentication middleware
├── utils/              # Utility functions
│   └── email.js        # Email utilities
├── public/             # Static files
│   ├── css/           # Stylesheets
│   ├── js/            # Client-side JavaScript
│   ├── images/        # Images and assets
│   ├── index.html     # Landing page
│   └── dashboard.html # Dashboard page
├── server.js          # Main server file
├── package.json       # Dependencies and scripts
└── README.md          # This file
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/verify-email/:token` - Verify email
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password/:token` - Reset password

### Members
- `GET /api/members/profile` - Get user profile
- `PUT /api/members/profile` - Update profile
- `GET /api/members/directory` - Get member directory
- `GET /api/members/:id` - Get member by ID

### Events
- `GET /api/events` - Get all events
- `POST /api/events` - Create new event
- `GET /api/events/:id` - Get event details
- `POST /api/events/:id/register` - Register for event
- `POST /api/events/:id/attendance` - Mark attendance

### Ideas
- `GET /api/ideas` - Get all ideas
- `POST /api/ideas` - Submit new idea
- `GET /api/ideas/:id` - Get idea details
- `POST /api/ideas/:id/like` - Like/unlike idea
- `POST /api/ideas/:id/comments` - Add comment

### Payments
- `POST /api/payments/mpesa/initiate` - Initiate M-Pesa payment
- `GET /api/payments/status/:paymentId` - Check payment status
- `GET /api/payments/history` - Get payment history

## Features Implementation Status

### ✅ Completed
- User authentication and registration
- Basic member management
- Event creation and management
- Ideas submission and management
- Payment processing framework
- Leadership directory
- Notification system
- Dashboard interface

### 🚧 In Progress
- M-Pesa API integration
- Email notification system
- File upload functionality
- Advanced search and filtering

### 📋 Planned
- Mobile app development
- Advanced analytics
- Integration with external APIs
- Automated testing suite

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/new-feature`)
3. Commit your changes (`git commit -am 'Add new feature'`)
4. Push to the branch (`git push origin feature/new-feature`)
5. Create a Pull Request

## Security Considerations

- All passwords are hashed using bcrypt
- JWT tokens for secure authentication
- Input validation and sanitization
- Rate limiting to prevent abuse
- CORS configuration for cross-origin requests
- Helmet for security headers

## Deployment

### Environment Setup
1. Set up MongoDB database
2. Configure email service (Gmail/SendGrid)
3. Set up M-Pesa developer account
4. Configure environment variables
5. Set up SSL certificates for HTTPS

### Production Deployment
```bash
# Build for production
npm run build

# Start production server
npm start
```

## Support

For support and questions:
- Email: info@jkuatinnovation.club
- Phone: +254 700 000 000
- GitHub Issues: Create an issue in this repository

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- JKUAT Innovation Club members and leadership
- Contributors and developers
- Open source libraries and frameworks used

---

**JKUAT Innovation Club** - Empowering students to innovate, create, and transform ideas into reality.