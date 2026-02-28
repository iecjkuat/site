# Payment Page Review

## Overview
The payment page is well-structured with a multi-step payment flow supporting M-Pesa, Card, and Bank Transfer methods.

---

## ✅ Routes Status

### 1. Payment Service Routes (`/api/payment-service/`)
**File:** `routes/payment-service.js`

#### Available Endpoints:
- ✅ `POST /lipana/initiate` - Initiate M-Pesa STK Push
- ✅ `POST /lipana/callback` - Handle M-Pesa callback
- ✅ `GET /status/:paymentId` - Check payment status
- ✅ `GET /history/:userId` - Get user payment history

**Status:** All routes exist and are properly configured

---

### 2. General Payment Routes (`/api/payments/`)
**File:** `routes/payments.js`

#### Available Endpoints:
- ✅ `GET /` - Get all payments (with filters)
- ✅ `GET /:id` - Get single payment
- ✅ `POST /mpesa/initiate` - Initiate M-Pesa payment
- ✅ `POST /card/process` - Process card payment
- ✅ `GET /mpesa/status/:paymentId` - Check M-Pesa status
- ✅ `GET /:id/receipt` - Get payment receipt
- ✅ `POST /:id/refund` - Refund payment (admin)
- ✅ `GET /stats` - Get payment statistics

**Status:** All routes exist and are properly configured

---

## 📊 Database Tables & Columns

### Required Table: `payments`

#### Expected Columns (from routes analysis):
```sql
CREATE TABLE payments (
  -- Primary identifiers
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id),
  
  -- Payment details
  amount DECIMAL(10, 2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'KES',
  payment_type VARCHAR(50) NOT NULL, -- 'membership', 'event', 'donation', etc.
  payment_method VARCHAR(20) NOT NULL, -- 'mpesa', 'card', 'bank'
  
  -- Status tracking
  status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'completed', 'failed', 'refunded'
  reference_number VARCHAR(100) UNIQUE,
  transaction_id VARCHAR(100),
  
  -- Additional data
  description TEXT,
  event_id UUID REFERENCES events(id), -- Optional, for event payments
  metadata JSONB, -- Stores additional payment info
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### Indexes Needed:
```sql
CREATE INDEX idx_payments_user_id ON payments(user_id);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_payments_payment_type ON payments(payment_type);
CREATE INDEX idx_payments_created_at ON payments(created_at DESC);
CREATE INDEX idx_payments_transaction_id ON payments(transaction_id);
```

---

### Supporting Table: `event_attendees`

#### Expected Columns:
```sql
CREATE TABLE event_attendees (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID NOT NULL REFERENCES events(id),
  user_id UUID NOT NULL REFERENCES users(id),
  payment_status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'paid'
  created_at TIMESTAMP DEFAULT NOW(),
  
  UNIQUE(event_id, user_id)
);
```

---

## 🔍 Frontend-Backend Integration Points

### 1. Service Selection
**Frontend sends:**
```javascript
{
  service: 'membership' | 'events' | 'donation' | 'merchandise' | 'projects' | 'custom',
  serviceData: {
    option: string,
    amount: number,
    eventId?: string,
    merchId?: string,
    title: string,
    description: string
  },
  method: 'mpesa' | 'card' | 'bank',
  amount: number,
  phoneNumber: string, // For M-Pesa
  userId: string,
  description: string
}
```

**Backend expects (M-Pesa):**
```javascript
{
  phoneNumber: string, // Format: 254XXXXXXXXX
  amount: number,
  userId: string,
  paymentType: string,
  eventId?: string,
  description?: string
}
```

---

### 2. Payment Status Polling
**Frontend calls:** `GET /api/payment-service/status/:paymentId`

**Backend returns:**
```javascript
{
  id: string,
  status: 'pending' | 'completed' | 'failed',
  amount: number,
  transactionReference: string,
  // ... other payment details
}
```

---

## ⚠️ Issues Found

### 1. Missing Merchandise API
**Issue:** Frontend tries to load merchandise from `/api/merchandise?available=true`
**Status:** ❌ Route does not exist
**Impact:** Merchandise service option will use fallback data

**Recommendation:** Create `routes/merchandise.js` with:
```javascript
router.get('/', async (req, res) => {
  const { available } = req.query;
  // Fetch from merchandise table
});
```

---

### 2. Payment Method Mismatch
**Issue:** Frontend sends to `/api/payment-service/lipana/initiate` but also has `/api/payments/mpesa/initiate`
**Status:** ⚠️ Two different endpoints for M-Pesa
**Impact:** Confusion about which endpoint to use

**Recommendation:** Standardize on one endpoint (prefer `/api/payment-service/lipana/initiate`)

---

### 3. Missing Validation
**Issue:** No server-side validation for payment amounts in some routes
**Status:** ⚠️ Security concern
**Impact:** Could allow invalid payment amounts

**Recommendation:** Add validation middleware:
```javascript
body('amount')
  .isFloat({ min: 1, max: 1000000 })
  .withMessage('Amount must be between 1 and 1,000,000')
```

---

## ✅ What's Working Well

1. **Security Features:**
   - Phone number sanitization
   - Amount validation
   - Rate limiting (client-side)
   - XSS prevention with `escapeHtml()`
   - CSRF token placeholder

2. **User Experience:**
   - Multi-step progress indicator
   - Real-time form validation
   - Payment status polling
   - Clear error messages
   - Fallback data for offline mode

3. **Payment Methods:**
   - M-Pesa STK Push integration
   - Card payment support
   - Bank transfer instructions

4. **Database Design:**
   - Proper foreign keys
   - Status tracking
   - Metadata field for flexibility
   - Transaction references

---

## 🔧 Recommendations

### High Priority:
1. ✅ Create merchandise API route
2. ✅ Standardize M-Pesa endpoints
3. ✅ Add server-side amount validation
4. ✅ Implement CSRF protection (server-side)
5. ✅ Add payment webhook verification

### Medium Priority:
1. Add payment receipt generation
2. Implement refund workflow UI
3. Add payment history page
4. Create admin payment dashboard

### Low Priority:
1. Add payment analytics
2. Implement recurring payments
3. Add payment reminders
4. Create payment export feature

---

## 📝 Database Migration Script

```sql
-- Create payments table if not exists
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  amount DECIMAL(10, 2) NOT NULL CHECK (amount > 0),
  currency VARCHAR(3) DEFAULT 'KES',
  payment_type VARCHAR(50) NOT NULL,
  payment_method VARCHAR(20) NOT NULL,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'refunded', 'cancelled')),
  reference_number VARCHAR(100) UNIQUE,
  transaction_id VARCHAR(100),
  description TEXT,
  event_id UUID REFERENCES events(id) ON DELETE SET NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_payments_user_id ON payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_payment_type ON payments(payment_type);
CREATE INDEX IF NOT EXISTS idx_payments_created_at ON payments(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_payments_transaction_id ON payments(transaction_id);

-- Create event_attendees table if not exists
CREATE TABLE IF NOT EXISTS event_attendees (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  payment_status VARCHAR(20) DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'refunded')),
  registration_date TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(event_id, user_id)
);

-- Create indexes for event_attendees
CREATE INDEX IF NOT EXISTS idx_event_attendees_event_id ON event_attendees(event_id);
CREATE INDEX IF NOT EXISTS idx_event_attendees_user_id ON event_attendees(user_id);
CREATE INDEX IF NOT EXISTS idx_event_attendees_payment_status ON event_attendees(payment_status);

-- Add updated_at trigger for payments
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON payments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_event_attendees_updated_at BEFORE UPDATE ON event_attendees
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

---

## ✅ Summary

**Overall Status:** 🟢 Good - Ready for backend integration

**Routes:** ✅ All exist and properly configured
**Database Schema:** ✅ Well-designed, needs creation
**Frontend:** ✅ Well-structured with good UX
**Security:** ⚠️ Needs server-side CSRF and webhook verification

**Next Steps:**
1. Run the database migration script
2. Configure M-Pesa credentials in `.env`
3. Test payment flow end-to-end
4. Implement missing merchandise API
5. Add webhook verification for M-Pesa callbacks
