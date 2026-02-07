# User Roles Setup Guide

## User Roles in the System

The system supports three main user roles:

### 1. **Admin** 
- Full system access
- Can manage all users, content, and settings
- Access to admin dashboard
- Can approve/reject content
- Can manage executive committee

### 2. **Executive**
- Leadership team member
- Can manage events, projects, and content
- Can view analytics and reports
- Cannot manage other users or system settings
- Listed in executive committee

### 3. **Member** (Default)
- Regular club member
- Can view content, register for events
- Can submit ideas and feedback
- Can participate in projects
- Limited administrative access

## Step 1: Update Existing Users

Run this SQL in your Supabase SQL Editor:

```sql
-- Update admin@jkuat.ac.ke to admin role
UPDATE users 
SET role = 'admin',
    updated_at = NOW()
WHERE email = 'admin@jkuat.ac.ke';

-- Update test.user@students.jkuat.ac.ke to executive role
UPDATE users 
SET role = 'executive',
    updated_at = NOW()
WHERE email = 'test.user@students.jkuat.ac.ke';

-- Verify the changes
SELECT name, email, role, membership_status 
FROM users 
WHERE email IN ('admin@jkuat.ac.ke', 'test.user@students.jkuat.ac.ke')
ORDER BY role;
```

## Step 2: Create a Regular Member

### Option A: Via Signup Page
1. Go to http://localhost:3000/signup
2. Fill in the form with member details:
   - **Name**: John Member
   - **Email**: john.member@students.jkuat.ac.ke
   - **Registration Number**: EN111-0003/2024
   - **Phone**: +254700000003
   - **Course**: Computer Science
   - **Year of Study**: 2
   - **College**: COETEC
   - **Password**: member123
3. Click "SIGN UP"
4. User will be created with default role: **member**

### Option B: Via SQL
```sql
-- Create a regular member user
INSERT INTO users (
    id,
    name,
    email,
    registration_number,
    phone,
    course,
    year_of_study,
    college,
    password_hash,
    role,
    membership_status,
    email_verified,
    created_at,
    updated_at
) VALUES (
    gen_random_uuid(),
    'John Member',
    'john.member@students.jkuat.ac.ke',
    'EN111-0003/2024',
    '+254700000003',
    'Computer Science',
    2,
    'COETEC',
    '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5NU7qXqXqXqXq', -- password: member123
    'member',
    'active',
    true,
    NOW(),
    NOW()
);
```

## Step 3: Verify User Roles

Run this query to see all users and their roles:

```sql
SELECT 
    name,
    email,
    role,
    membership_status,
    created_at
FROM users 
ORDER BY 
    CASE role
        WHEN 'admin' THEN 1
        WHEN 'executive' THEN 2
        WHEN 'member' THEN 3
        ELSE 4
    END,
    created_at DESC;
```

Expected output:
```
name          | email                              | role      | membership_status
--------------|------------------------------------|-----------|------------------
Denis Mugo    | admin@jkuat.ac.ke                  | admin     | active
Test User     | test.user@students.jkuat.ac.ke     | executive | active
John Member   | john.member@students.jkuat.ac.ke   | member    | active
```

## Step 4: Test User Roles

### Test Admin Access
1. **Login** as admin@jkuat.ac.ke
2. **Navigate** to http://localhost:3000/admin
3. **Verify** you can access:
   - User management
   - Content management
   - System settings
   - Analytics dashboard
   - All admin features

### Test Executive Access
1. **Login** as test.user@students.jkuat.ac.ke
2. **Navigate** to http://localhost:3000/dashboard
3. **Verify** you can:
   - Manage events
   - Manage projects
   - View reports
   - Access executive features
4. **Verify** you CANNOT:
   - Access /admin page
   - Manage users
   - Change system settings

### Test Member Access
1. **Login** as john.member@students.jkuat.ac.ke
2. **Navigate** to http://localhost:3000/dashboard
3. **Verify** you can:
   - View events
   - Register for events
   - Submit ideas
   - View projects
   - Access member features
4. **Verify** you CANNOT:
   - Access /admin page
   - Manage events
   - Approve content
   - Access executive features

## Role-Based Access Control (RBAC)

### Admin Routes (Requires admin role)
- `/admin` - Admin dashboard
- `/admin/*` - All admin pages
- `POST /api/admin/*` - Admin API endpoints

### Executive Routes (Requires executive or admin role)
- `/leadership` - Leadership dashboard
- `POST /api/events` - Create events
- `PUT /api/events/:id` - Update events
- `POST /api/projects` - Create projects

### Member Routes (All authenticated users)
- `/dashboard` - User dashboard
- `/events` - View events
- `/projects` - View projects
- `/ideas` - Submit ideas
- `POST /api/events/:id/register` - Register for events

### Public Routes (No authentication required)
- `/` - Home page
- `/signin` - Login page
- `/signup` - Registration page
- `/about` - About page

## Checking User Role in Code

### Frontend (JavaScript)
```javascript
// Get current user
const user = window.authManager?.getUser();

// Check role
if (user.role === 'admin') {
    // Show admin features
}

if (user.role === 'executive' || user.role === 'admin') {
    // Show executive features
}

if (user.role === 'member') {
    // Show member features
}
```

### Backend (Node.js)
```javascript
// In route middleware
const { authenticateToken, requireAdmin, requireExecutive } = require('./middleware/auth');

// Admin only route
router.get('/admin/users', requireAdmin, async (req, res) => {
    // Only admins can access
});

// Executive or admin route
router.post('/events', requireExecutive, async (req, res) => {
    // Executives and admins can access
});

// Any authenticated user
router.get('/dashboard', authenticateToken, async (req, res) => {
    // All logged in users can access
});
```

## Quick Reference

### Test Credentials

| Role      | Email                              | Password   |
|-----------|------------------------------------|-----------| 
| Admin     | admin@jkuat.ac.ke                  | (your pwd) |
| Executive | test.user@students.jkuat.ac.ke     | password123|
| Member    | john.member@students.jkuat.ac.ke   | member123  |

### Role Hierarchy
```
Admin > Executive > Member
```

### Permission Matrix

| Feature                  | Admin | Executive | Member |
|--------------------------|-------|-----------|--------|
| View Dashboard           | ✅    | ✅        | ✅     |
| View Events              | ✅    | ✅        | ✅     |
| Register for Events      | ✅    | ✅        | ✅     |
| Create Events            | ✅    | ✅        | ❌     |
| Delete Events            | ✅    | ✅        | ❌     |
| Manage Users             | ✅    | ❌        | ❌     |
| Access Admin Panel       | ✅    | ❌        | ❌     |
| View Analytics           | ✅    | ✅        | ❌     |
| Approve Content          | ✅    | ✅        | ❌     |
| Submit Ideas             | ✅    | ✅        | ✅     |
| Vote on Ideas            | ✅    | ✅        | ✅     |
| Access Leadership Page   | ✅    | ✅        | ❌     |

## Troubleshooting

### Issue: User role not updating in UI
**Solution**: Logout and login again to refresh the session

### Issue: Cannot access admin page
**Solution**: Check user role in database:
```sql
SELECT email, role FROM users WHERE email = 'your-email@jkuat.ac.ke';
```

### Issue: Role changes not taking effect
**Solution**: Clear localStorage and login again:
```javascript
localStorage.clear();
sessionStorage.clear();
window.location.href = '/signin';
```

## Next Steps

After setting up roles:
1. ✅ Test each role's access
2. ✅ Verify permissions work correctly
3. ✅ Test role-based UI elements
4. ✅ Test role-based API endpoints
5. ✅ Document any role-specific features
