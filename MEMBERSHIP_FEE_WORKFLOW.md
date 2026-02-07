# Membership Fee Activation Workflow

## Your Requirement
After signup, members must pay membership fee before their account is activated.

## Why Custom Auth is Better for This

### Current System (Custom Auth) ✅ RECOMMENDED

**Flow:**
```
1. User signs up
   ↓
2. Account created with status: 'pending'
   ↓
3. User can login but has limited access
   ↓
4. User redirected to payment page
   ↓
5. User pays membership fee (M-Pesa/Card)
   ↓
6. Payment verified
   ↓
7. Status updated to 'active'
   ↓
8. User gets full access
```

**Advantages:**
- ✅ Full control over activation logic
- ✅ Can let users login before payment (better UX)
- ✅ Easy to track payment status
- ✅ Can show "pending payment" dashboard
- ✅ Can send payment reminders
- ✅ Can have grace periods
- ✅ Can handle partial payments
- ✅ Can integrate with M-Pesa easily

### Hybrid System (Supabase Auth)

**Flow:**
```
1. User signs up
   ↓
2. Supabase sends verification email
   ↓
3. User verifies email
   ↓
4. User can login but status is 'pending'
   ↓
5. User pays membership fee
   ↓
6. Status updated to 'active'
```

**Disadvantages:**
- ⚠️ User must verify email first (extra step)
- ⚠️ Can't login until email verified
- ⚠️ Less control over the flow
- ⚠️ Harder to customize

## Recommended Implementation (Current System)

### Database Schema (Already in place!)

```sql
-- users table
CREATE TABLE users (
    id UUID PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    registration_number VARCHAR(50),
    phone VARCHAR(20),
    course VARCHAR(255),
    year_of_study INTEGER,
    college VARCHAR(255),
    role VARCHAR(50) DEFAULT 'member',
    membership_status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'active', 'expired', 'suspended'
    membership_paid_at TIMESTAMP,
    membership_expires_at TIMESTAMP,
    payment_reference VARCHAR(255),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

### Membership Statuses

1. **pending** - Registered but not paid
2. **active** - Paid and active
3. **expired** - Membership expired (needs renewal)
4. **suspended** - Account suspended by admin

### User Journey

#### Step 1: Registration
```javascript
// User signs up
POST /api/auth/register
{
    "email": "user@students.jkuat.ac.ke",
    "password": "password123",
    "name": "John Doe",
    // ... other fields
}

// Response
{
    "user": {
        "id": "uuid",
        "email": "user@students.jkuat.ac.ke",
        "membership_status": "pending" // ← Key field
    },
    "token": "jwt-token"
}
```

#### Step 2: Login (Allowed even if pending)
```javascript
// User can login
POST /api/auth/login
{
    "email": "user@students.jkuat.ac.ke",
    "password": "password123"
}

// Response includes status
{
    "user": {
        "membership_status": "pending"
    },
    "token": "jwt-token"
}
```

#### Step 3: Dashboard Check
```javascript
// Dashboard checks status
if (user.membership_status === 'pending') {
    // Show payment banner
    // Redirect to payment page
    // Limit access to certain features
}
```

#### Step 4: Payment Page
```javascript
// User goes to /payment
// Sees membership fee: KES 500
// Chooses payment method (M-Pesa/Card)
// Initiates payment

POST /api/payments/membership/initiate
{
    "user_id": "uuid",
    "amount": 500,
    "payment_method": "mpesa",
    "phone": "+254700000000"
}
```

#### Step 5: Payment Verification
```javascript
// M-Pesa callback or manual verification
POST /api/payments/membership/verify
{
    "user_id": "uuid",
    "payment_reference": "ABC123XYZ",
    "amount": 500
}

// Backend updates user
UPDATE users 
SET 
    membership_status = 'active',
    membership_paid_at = NOW(),
    membership_expires_at = NOW() + INTERVAL '1 year',
    payment_reference = 'ABC123XYZ',
    updated_at = NOW()
WHERE id = 'uuid';
```

#### Step 6: Full Access
```javascript
// User refreshes or logs in again
// Status is now 'active'
// Full access granted
```

## Access Control Based on Status

### Frontend (Dashboard)
```javascript
// pages/dashboard/dashboard.js
async function checkMembershipStatus() {
    const user = window.authManager.getUser();
    
    if (user.membership_status === 'pending') {
        // Show payment banner
        showPaymentBanner();
        
        // Limit features
        disableFeatures(['events', 'projects', 'resources']);
        
        // Show only payment and profile
        enableFeatures(['payment', 'profile']);
    } else if (user.membership_status === 'active') {
        // Full access
        enableAllFeatures();
    } else if (user.membership_status === 'expired') {
        // Show renewal banner
        showRenewalBanner();
    }
}
```

### Backend (API Routes)
```javascript
// middleware/checkMembership.js
function requireActiveMembership(req, res, next) {
    const user = req.user; // From authenticateToken middleware
    
    if (user.membership_status !== 'active') {
        return res.status(403).json({
            error: 'Active membership required',
            membership_status: user.membership_status,
            message: 'Please complete your membership payment to access this feature'
        });
    }
    
    next();
}

// Usage in routes
router.post('/events/:id/register', 
    authenticateToken, 
    requireActiveMembership, // ← Check membership
    async (req, res) => {
        // Only active members can register for events
    }
);
```

## Payment Integration

### M-Pesa STK Push
```javascript
// routes/payments.js
router.post('/membership/initiate', authenticateToken, async (req, res) => {
    const { phone, amount } = req.body;
    const userId = req.user.id;
    
    // Initiate M-Pesa STK Push
    const mpesaResponse = await initiateMpesaPayment({
        phone,
        amount,
        accountReference: `MEMBERSHIP-${userId}`,
        description: 'JKUAT Innovation Club Membership Fee'
    });
    
    // Store payment record
    await supabaseAdmin.from('payments').insert({
        user_id: userId,
        amount,
        payment_method: 'mpesa',
        payment_reference: mpesaResponse.CheckoutRequestID,
        status: 'pending',
        type: 'membership',
        created_at: new Date().toISOString()
    });
    
    res.json({
        success: true,
        message: 'Payment initiated. Please enter your M-Pesa PIN',
        checkout_request_id: mpesaResponse.CheckoutRequestID
    });
});
```

### M-Pesa Callback
```javascript
// routes/payments.js
router.post('/mpesa/callback', async (req, res) => {
    const { Body } = req.body;
    const { stkCallback } = Body;
    
    if (stkCallback.ResultCode === 0) {
        // Payment successful
        const checkoutRequestID = stkCallback.CheckoutRequestID;
        
        // Find payment record
        const { data: payment } = await supabaseAdmin
            .from('payments')
            .select('user_id')
            .eq('payment_reference', checkoutRequestID)
            .single();
        
        // Update payment status
        await supabaseAdmin
            .from('payments')
            .update({ status: 'completed' })
            .eq('payment_reference', checkoutRequestID);
        
        // Activate membership
        await supabaseAdmin
            .from('users')
            .update({
                membership_status: 'active',
                membership_paid_at: new Date().toISOString(),
                membership_expires_at: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
                payment_reference: checkoutRequestID
            })
            .eq('id', payment.user_id);
        
        // Send confirmation email
        await sendMembershipConfirmationEmail(payment.user_id);
    }
    
    res.json({ success: true });
});
```

## UI Components

### Payment Banner (Pending Status)
```html
<!-- Show on dashboard when status is 'pending' -->
<div class="membership-banner warning">
    <i class="fas fa-exclamation-triangle"></i>
    <div>
        <h3>Complete Your Membership</h3>
        <p>Pay KES 500 to activate your account and access all features</p>
    </div>
    <button onclick="window.location.href='/payment'">
        Pay Now
    </button>
</div>
```

### Feature Lock (Pending Status)
```html
<!-- Show on locked features -->
<div class="feature-locked">
    <i class="fas fa-lock"></i>
    <h3>Membership Required</h3>
    <p>This feature is available to active members only</p>
    <button onclick="window.location.href='/payment'">
        Activate Membership
    </button>
</div>
```

### Success Message (After Payment)
```html
<!-- Show after successful payment -->
<div class="membership-banner success">
    <i class="fas fa-check-circle"></i>
    <div>
        <h3>Membership Activated!</h3>
        <p>Welcome to JKUAT Innovation Club. You now have full access.</p>
    </div>
</div>
```

## Membership Renewal

### Auto-Check Expiration
```javascript
// Run daily or on login
async function checkMembershipExpiration() {
    const { data: expiredUsers } = await supabaseAdmin
        .from('users')
        .select('id, email, name')
        .eq('membership_status', 'active')
        .lt('membership_expires_at', new Date().toISOString());
    
    // Update status to expired
    for (const user of expiredUsers) {
        await supabaseAdmin
            .from('users')
            .update({ membership_status: 'expired' })
            .eq('id', user.id);
        
        // Send renewal reminder
        await sendRenewalReminderEmail(user);
    }
}
```

## Comparison: Custom vs Hybrid for Your Use Case

| Feature | Custom Auth | Hybrid (Supabase) |
|---------|-------------|-------------------|
| Login before payment | ✅ Easy | ⚠️ Requires email verification first |
| Payment flow control | ✅ Full control | ⚠️ Less flexible |
| Status management | ✅ Simple | ⚠️ More complex |
| M-Pesa integration | ✅ Direct | ✅ Same |
| Grace periods | ✅ Easy | ⚠️ Harder |
| Partial payments | ✅ Easy | ⚠️ Harder |
| Payment reminders | ✅ Easy | ⚠️ Harder |
| Email verification | ❌ Manual | ✅ Automatic |
| Password reset | ❌ Manual | ✅ Automatic |
| OAuth | ❌ No | ✅ Yes |

## My Recommendation

**Keep your current custom auth system!** ✅

**Why:**
1. ✅ Perfect for your membership fee workflow
2. ✅ Users can login before paying (better UX)
3. ✅ Full control over activation logic
4. ✅ Easy to integrate with M-Pesa
5. ✅ Already working
6. ✅ Simpler for your specific use case

**What to add:**
1. Email verification (manual implementation)
2. Password reset (manual implementation)
3. JWT token expiration
4. Membership payment flow
5. Status-based access control

**Don't need:**
- OAuth (students use JKUAT email anyway)
- Complex auth features
- Supabase Auth overhead

## Next Steps

Would you like me to:
1. ✅ Keep current custom auth
2. ✅ Add email verification
3. ✅ Add password reset
4. ✅ Implement membership payment flow
5. ✅ Add status-based access control

This is the best approach for your specific requirements! 🚀
