# Auth Flow Testing Guide

## Current Setup

### Frontend Pages
- ✅ `/signup` - Comprehensive signup form with all fields
- ✅ `/signin` - Login form with email/password

### Backend API Endpoints
- ✅ `POST /api/auth/register` - User registration
- ✅ `POST /api/auth/login` - User login
- ✅ `GET /api/auth/verify` - Token verification
- ✅ `POST /api/auth/logout` - User logout

## Registration Flow

### Step 1: User Fills Signup Form
**URL**: http://localhost:3000/signup

**Required Fields**:
1. Full Name
2. Email (must be @students.jkuat.ac.ke or @jkuat.ac.ke)
3. Registration Number (e.g., EN111-0001/2024)
4. Phone Number (e.g., +254700000000)
5. Course (e.g., Computer Science)
6. Year of Study (dropdown: 1-5)
7. College (dropdown: COETEC, COHES, etc.)
8. Password (min 6 characters)
9. Confirm Password (must match)
10. Terms Agreement (checkbox)

### Step 2: Frontend Validation
- All fields required
- Email must be JKUAT domain
- Password minimum 6 characters
- Passwords must match
- Terms must be agreed

### Step 3: API Call
```javascript
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john.doe@students.jkuat.ac.ke",
  "registrationNumber": "EN111-0001/2024",
  "phone": "+254700000000",
  "course": "Computer Science",
  "yearOfStudy": "3",
  "college": "COETEC",
  "password": "password123"
}
```

### Step 4: Backend Processing
1. Validates email format and JKUAT domain
2. Checks if user already exists
3. Generates UUID for user ID
4. Hashes password with bcrypt (12 rounds)
5. Creates user record in `users` table with all fields
6. Returns success response

### Step 5: Success Response
```json
{
  "message": "Registration successful! You can now log in.",
  "user": {
    "id": "uuid",
    "name": "John Doe",
    "email": "john.doe@students.jkuat.ac.ke",
    "role": "member",
    "membershipStatus": "active"
  },
  "canLoginImmediately": true
}
```

### Step 6: Redirect
- Success message shown for 2 seconds
- Redirects to `/signin`

## Login Flow

### Step 1: User Fills Signin Form
**URL**: http://localhost:3000/signin

**Required Fields**:
1. Email (or registration number)
2. Password
3. Remember Me (optional checkbox)

### Step 2: Frontend Validation
- Email/identifier required
- Password required

### Step 3: API Call
```javascript
POST /api/auth/login
Content-Type: application/json

{
  "identifier": "john.doe@students.jkuat.ac.ke",
  "password": "password123"
}
```

### Step 4: Backend Processing
1. Determines if identifier is email or registration number
2. Queries `users` table by email or registration_number
3. Verifies password using bcrypt.compare()
4. Updates last_login and login_count
5. Generates JWT token with user ID and role
6. Logs activity to audit log

### Step 5: Success Response
```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid",
    "name": "John Doe",
    "email": "john.doe@students.jkuat.ac.ke",
    "role": "member",
    "membershipStatus": "active",
    "profileCompleted": false
  }
}
```

### Step 6: Token Storage
- If "Remember Me" checked: Store in `localStorage`
- If not checked: Store in `sessionStorage`
- User data stored in `localStorage`

### Step 7: Redirect
- Success message shown for 1 second
- Redirects to `/dashboard`

## Testing Checklist

### Manual Testing

#### Registration Test
- [ ] Go to http://localhost:3000/signup
- [ ] Fill all fields with valid data
- [ ] Use JKUAT email (@students.jkuat.ac.ke)
- [ ] Click "SIGN UP"
- [ ] Check for success message
- [ ] Verify redirect to signin page
- [ ] Check browser console for errors
- [ ] Check server logs for user creation

#### Login Test
- [ ] Go to http://localhost:3000/signin
- [ ] Enter registered email
- [ ] Enter correct password
- [ ] Click "SIGN IN"
- [ ] Check for success message
- [ ] Verify redirect to dashboard
- [ ] Check localStorage for token and user data
- [ ] Check browser console for errors

#### Validation Tests
- [ ] Try signup with non-JKUAT email (should fail)
- [ ] Try signup with password < 6 chars (should fail)
- [ ] Try signup with mismatched passwords (should fail)
- [ ] Try signup without agreeing to terms (should fail)
- [ ] Try login with wrong password (should fail)
- [ ] Try login with non-existent email (should fail)

### Database Verification

After successful registration, check the database:

```sql
-- Check if user was created
SELECT id, name, email, registration_number, phone, course, 
       year_of_study, college, role, membership_status, 
       email_verified, created_at
FROM users
WHERE email = 'john.doe@students.jkuat.ac.ke';

-- Check password hash exists
SELECT id, email, password_hash IS NOT NULL as has_password
FROM users
WHERE email = 'john.doe@students.jkuat.ac.ke';
```

## Known Issues & Solutions

### Issue 1: JKUAT Email Validation
**Problem**: Users might not have JKUAT email
**Solution**: Validation enforces @students.jkuat.ac.ke or @jkuat.ac.ke

### Issue 2: Password Storage
**Current**: Passwords hashed with bcrypt (12 rounds)
**Security**: ✅ Secure

### Issue 3: Email Verification
**Current**: No email verification implemented
**Status**: Users can login immediately after registration
**Future**: Add email verification flow

### Issue 4: Token Expiration
**Current**: JWT tokens don't expire
**Recommendation**: Add expiration (e.g., 7 days)

## API Testing with cURL

### Test Registration
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test.user@students.jkuat.ac.ke",
    "registrationNumber": "EN111-0001/2024",
    "phone": "+254700000000",
    "course": "Computer Science",
    "yearOfStudy": "3",
    "college": "COETEC",
    "password": "password123"
  }'
```

### Test Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "identifier": "test.user@students.jkuat.ac.ke",
    "password": "password123"
  }'
```

### Test Token Verification
```bash
curl -X GET http://localhost:3000/api/auth/verify \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## Security Considerations

### ✅ Implemented
- Password hashing with bcrypt
- JWT token authentication
- JKUAT email validation
- SQL injection protection (Supabase parameterized queries)
- Input validation with express-validator
- CORS configuration
- Rate limiting on auth endpoints

### ⚠️ Recommended Improvements
1. Add email verification
2. Add password reset flow
3. Add JWT token expiration
4. Add refresh token mechanism
5. Add account lockout after failed attempts
6. Add 2FA option
7. Add password strength requirements
8. Add CAPTCHA for bot protection

## Conclusion

**Current Status**: ✅ Auth flow is functional

The registration and login flow should work end-to-end:
1. User signs up with comprehensive form
2. Backend creates user with hashed password
3. User can immediately login
4. JWT token issued and stored
5. User redirected to dashboard

**Next Steps**:
1. Test the flow manually
2. Check for any errors in console/logs
3. Verify database records are created
4. Test validation rules
5. Consider adding email verification
