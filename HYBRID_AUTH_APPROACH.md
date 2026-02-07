# Hybrid Authentication Approach

## Overview

The hybrid approach combines **Supabase Auth** for authentication with a **custom users table** for additional user data.

## How It Works

### Two-Table System:

```
┌─────────────────────────────────────────────────────────────┐
│                    SUPABASE AUTH                            │
│  (Authentication → Users in Supabase Dashboard)             │
│                                                             │
│  Handles:                                                   │
│  - Email/Password authentication                            │
│  - Email verification                                       │
│  - Password reset                                           │
│  - OAuth (Google, Facebook, etc.)                           │
│  - Session management                                       │
│  - Security tokens                                          │
│                                                             │
│  Stores:                                                    │
│  - id (UUID)                                                │
│  - email                                                    │
│  - encrypted_password                                       │
│  - email_confirmed_at                                       │
│  - last_sign_in_at                                          │
│  - user_metadata (JSON - small data only)                   │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ Links via UUID
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                    CUSTOM USERS TABLE                        │
│  (Database → users table)                                    │
│                                                             │
│  Handles:                                                   │
│  - Extended user profile                                    │
│  - Application-specific data                                │
│  - User roles and permissions                               │
│  - Academic information                                     │
│  - Club membership data                                     │
│                                                             │
│  Stores:                                                    │
│  - id (UUID - same as Supabase Auth)                        │
│  - name                                                     │
│  - registration_number                                      │
│  - phone                                                    │
│  - course                                                   │
│  - year_of_study                                            │
│  - college                                                  │
│  - role (admin/executive/member)                            │
│  - membership_status                                        │
│  - profile_picture                                          │
│  - bio                                                      │
│  - skills, interests, etc.                                  │
└─────────────────────────────────────────────────────────────┘
```

## Registration Flow

### Step 1: User Signs Up
```javascript
// Frontend: pages/auth/signup.js
const { data, error } = await supabase.auth.signUp({
    email: 'user@students.jkuat.ac.ke',
    password: 'password123',
    options: {
        data: {
            name: 'John Doe',
            registration_number: 'EN111-0001/2024'
        }
    }
});
```

### Step 2: Supabase Auth Creates User
- Creates user in Supabase Auth system
- Sends verification email
- Returns user ID (UUID)

### Step 3: Database Trigger Creates Profile
```sql
-- Automatic trigger when Supabase Auth user is created
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.users (
        id,
        email,
        name,
        registration_number,
        role,
        membership_status,
        created_at,
        updated_at
    ) VALUES (
        NEW.id,
        NEW.email,
        NEW.raw_user_meta_data->>'name',
        NEW.raw_user_meta_data->>'registration_number',
        'member',
        'pending',
        NOW(),
        NOW()
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger fires on new auth user
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();
```

### Step 4: User Verifies Email
- User clicks link in email
- Supabase marks email as verified
- User can now login

## Login Flow

### Step 1: User Logs In
```javascript
// Frontend: pages/auth/signin.js
const { data, error } = await supabase.auth.signInWithPassword({
    email: 'user@students.jkuat.ac.ke',
    password: 'password123'
});

// data.user.id is the UUID
// data.session.access_token is the JWT
```

### Step 2: Fetch Extended Profile
```javascript
// Get additional user data from custom table
const { data: profile } = await supabase
    .from('users')
    .select('*')
    .eq('id', data.user.id)
    .single();

// Combine auth user + profile
const fullUser = {
    ...data.user,
    ...profile
};
```

### Step 3: Store Session
```javascript
// Supabase automatically manages the session
// Access token stored in localStorage
// Refresh token handled automatically
```

## Benefits of Hybrid Approach

### ✅ Best of Both Worlds

1. **From Supabase Auth:**
   - ✅ Email verification (automatic)
   - ✅ Password reset (automatic)
   - ✅ OAuth login (Google, Facebook, etc.)
   - ✅ Secure password hashing
   - ✅ Session management
   - ✅ Token refresh
   - ✅ Security best practices

2. **From Custom Table:**
   - ✅ Extended user profiles
   - ✅ Custom roles (admin/executive/member)
   - ✅ Academic information
   - ✅ Club-specific data
   - ✅ Easy to query and join with other tables
   - ✅ Full control over user data structure

### ✅ Clean Separation of Concerns

- **Supabase Auth**: "Who is this person?" (Authentication)
- **Custom Table**: "What can they do?" (Authorization & Profile)

### ✅ Scalability

- Can add any fields to custom table without affecting auth
- Can switch auth providers without losing user data
- Can implement complex role-based access control

## Implementation Steps

### 1. Update Users Table Schema
```sql
-- Remove password_hash (Supabase Auth handles this)
ALTER TABLE users DROP COLUMN IF EXISTS password_hash;

-- Ensure id matches Supabase Auth UUID
-- (Already done - both use UUID)

-- Add constraint to link to auth.users
ALTER TABLE users
ADD CONSTRAINT users_id_fkey
FOREIGN KEY (id)
REFERENCES auth.users(id)
ON DELETE CASCADE;
```

### 2. Create Database Trigger
```sql
-- Auto-create profile when auth user is created
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.users (
        id,
        email,
        name,
        registration_number,
        phone,
        course,
        year_of_study,
        college,
        role,
        membership_status,
        email_verified,
        created_at,
        updated_at
    ) VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
        NEW.raw_user_meta_data->>'registration_number',
        NEW.raw_user_meta_data->>'phone',
        NEW.raw_user_meta_data->>'course',
        (NEW.raw_user_meta_data->>'year_of_study')::INTEGER,
        NEW.raw_user_meta_data->>'college',
        'member',
        CASE WHEN NEW.email_confirmed_at IS NOT NULL THEN 'active' ELSE 'pending' END,
        NEW.email_confirmed_at IS NOT NULL,
        NOW(),
        NOW()
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();
```

### 3. Update Signup Page
```javascript
// pages/auth/signup.js
async function handleSignup(formData) {
    // Use Supabase Auth for signup
    const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
            data: {
                name: formData.name,
                registration_number: formData.registrationNumber,
                phone: formData.phone,
                course: formData.course,
                year_of_study: formData.yearOfStudy,
                college: formData.college
            },
            emailRedirectTo: `${window.location.origin}/dashboard`
        }
    });

    if (error) {
        showMessage(error.message, 'error');
        return;
    }

    // Profile automatically created by trigger
    showMessage('Please check your email to verify your account', 'success');
}
```

### 4. Update Signin Page
```javascript
// pages/auth/signin.js
async function handleSignin(email, password) {
    // Use Supabase Auth for signin
    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
    });

    if (error) {
        showMessage(error.message, 'error');
        return;
    }

    // Fetch extended profile
    const { data: profile } = await supabase
        .from('users')
        .select('*')
        .eq('id', data.user.id)
        .single();

    // Store combined user data
    const fullUser = {
        id: data.user.id,
        email: data.user.email,
        ...profile
    };

    localStorage.setItem('user', JSON.stringify(fullUser));
    
    // Redirect
    window.location.href = redirectTo;
}
```

### 5. Update Auth Manager
```javascript
// pages/shared/auth.js
async init() {
    // Get Supabase session
    const { data: { session } } = await supabase.auth.getSession();
    
    if (session) {
        // Fetch extended profile from custom table
        const { data: profile } = await supabase
            .from('users')
            .select('*')
            .eq('id', session.user.id)
            .single();
        
        // Combine auth + profile
        this.user = {
            ...session.user,
            ...profile
        };
        
        this.session = session;
    }
}
```

## Migration Plan for Existing Users

### Option 1: Manual Migration (3 users - Quick)
```sql
-- For each existing user, create Supabase Auth account
-- Then link to existing profile

-- Example for admin@jkuat.ac.ke
-- 1. Create auth user via Supabase dashboard or API
-- 2. Update users table with auth UUID:
UPDATE users 
SET id = 'new-supabase-auth-uuid'
WHERE email = 'admin@jkuat.ac.ke';
```

### Option 2: Keep Existing, New Users Use Hybrid
- Existing 3 users continue with current system
- New signups use Supabase Auth + trigger
- Gradually migrate old users

### Option 3: Fresh Start (Recommended for 3 users)
```sql
-- Delete existing users
DELETE FROM users;

-- Have all 3 users re-register via signup page
-- They'll automatically use the hybrid system
```

## Comparison

| Feature | Current System | Hybrid Approach |
|---------|---------------|-----------------|
| Email Verification | ❌ Manual | ✅ Automatic |
| Password Reset | ❌ Manual | ✅ Automatic |
| OAuth (Google, etc.) | ❌ Not supported | ✅ Built-in |
| Password Security | ✅ bcrypt | ✅ Supabase (better) |
| Session Management | ⚠️ Manual JWT | ✅ Automatic |
| Token Refresh | ❌ No | ✅ Automatic |
| Extended Profile | ✅ Full control | ✅ Full control |
| Custom Roles | ✅ Yes | ✅ Yes |
| Complexity | Medium | Low |
| Maintenance | High | Low |

## Recommendation

**Use the Hybrid Approach** because:
1. ✅ You only have 3 test users (easy to migrate)
2. ✅ Get professional auth features for free
3. ✅ Keep your custom user data structure
4. ✅ Less code to maintain
5. ✅ Better security
6. ✅ Future-proof (OAuth, MFA, etc.)

## Next Steps

If you want to implement this:
1. I'll create the database trigger
2. Update signup/signin pages
3. Migrate your 3 existing users
4. Test the new flow

Would you like me to implement this? 🚀
