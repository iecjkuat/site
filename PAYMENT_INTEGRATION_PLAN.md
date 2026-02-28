# Payment Integration with Dashboard & Auto-Activation

## Overview
Comprehensive payment integration that:
- Shows transaction notifications in dashboard
- Auto-activates membership on payment
- Stores receipts accessible from dashboard
- Tracks payment history with full details

---

## 1. Database Schema Updates

### Update `users` table
```sql
-- Add membership tracking columns
ALTER TABLE users ADD COLUMN IF NOT EXISTS membership_status VARCHAR(20) DEFAULT 'inactive';
ALTER TABLE users ADD COLUMN IF NOT EXISTS membership_type VARCHAR(50);
ALTER TABLE users ADD COLUMN IF NOT EXISTS membership_valid_until DATE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_payment_date TIMESTAMP;

-- Add check constraint
ALTER TABLE users ADD CONSTRAINT check_membership_status 
  CHECK (membership_status IN ('active', 'inactive', 'expired', 'suspended'));
```

### Update `payments` table
```sql
-- Add receipt and notification tracking
ALTER TABLE payments ADD COLUMN IF NOT EXISTS receipt_url TEXT;
ALTER TABLE payments ADD COLUMN IF NOT EXISTS receipt_number VARCHAR(50) UNIQUE;
ALTER TABLE payments ADD COLUMN IF NOT EXISTS notification_sent BOOLEAN DEFAULT FALSE;
ALTER TABLE payments ADD COLUMN IF NOT EXISTS auto_activated BOOLEAN DEFAULT FALSE;

-- Generate receipt number automatically
CREATE OR REPLACE FUNCTION generate_receipt_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'completed' AND NEW.receipt_number IS NULL THEN
    NEW.receipt_number := 'RCP-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || 
                          LPAD(NEXTVAL('receipt_sequence')::TEXT, 6, '0');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create sequence for receipt numbers
CREATE SEQUENCE IF NOT EXISTS receipt_sequence START 1;

-- Create trigger
DROP TRIGGER IF EXISTS generate_receipt_number_trigger ON payments;
CREATE TRIGGER generate_receipt_number_trigger
  BEFORE UPDATE ON payments
  FOR EACH ROW
  WHEN (NEW.status = 'completed' AND OLD.status != 'completed')
  EXECUTE FUNCTION generate_receipt_number();
```

### Create `payment_receipts` table (optional, for detailed receipts)
```sql
CREATE TABLE IF NOT EXISTS payment_receipts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  payment_id UUID NOT NULL REFERENCES payments(id) ON DELETE CASCADE,
  receipt_number VARCHAR(50) UNIQUE NOT NULL,
  receipt_data JSONB NOT NULL, -- Full receipt details
  pdf_url TEXT, -- If generating PDFs
  viewed_at TIMESTAMP,
  downloaded_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  
  UNIQUE(payment_id)
);

CREATE INDEX idx_payment_receipts_payment_id ON payment_receipts(payment_id);
CREATE INDEX idx_payment_receipts_receipt_number ON payment_receipts(receipt_number);
```

---

## 2. Backend: Payment Callback Enhancement

### Update `routes/payment-service.js` callback handler

```javascript
// After successful payment, trigger membership activation
router.post('/lipana/callback', async (req, res) => {
  try {
    const callbackData = req.body;
    
    // ... existing payment verification code ...
    
    if (resultCode === 0) {
      // Payment successful
      const { data: updatedPayment, error: updateError } = await supabase
        .from('payments')
        .update({
          status: 'completed',
          transaction_id: transactionId,
          receipt_number: `RCP-${Date.now()}`, // Will be replaced by trigger
          metadata: {
            ...payment.metadata,
            mpesaReceiptNumber: mpesaReceiptNumber,
            transactionDate: transactionDate,
            phoneNumber: phone
          },
          updated_at: new Date().toISOString()
        })
        .eq('id', payment.id)
        .select()
        .single();

      // AUTO-ACTIVATE MEMBERSHIP if payment is for membership
      if (payment.payment_type === 'membership') {
        await activateMembership(payment.user_id, payment.metadata);
      }

      // CREATE NOTIFICATION for user
      await createPaymentNotification(payment.user_id, updatedPayment);

      // GENERATE RECEIPT
      await generateReceipt(updatedPayment);

      // Update event attendance if applicable
      if (payment.event_id) {
        await supabase
          .from('event_attendees')
          .update({ payment_status: 'paid' })
          .eq('event_id', payment.event_id)
          .eq('user_id', payment.user_id);
      }

      res.json({ success: true, message: 'Payment processed successfully' });
    }
  } catch (error) {
    console.error('Callback error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Helper function: Activate membership
async function activateMembership(userId, paymentMetadata) {
  try {
    const membershipType = paymentMetadata.membershipType || 'annual';
    let validUntil = new Date();

    // Calculate expiry based on membership type
    switch (membershipType) {
      case 'monthly':
        validUntil.setMonth(validUntil.getMonth() + 1);
        break;
      case 'semester':
        validUntil.setMonth(validUntil.getMonth() + 6);
        break;
      case 'annual':
      default:
        validUntil.setFullYear(validUntil.getFullYear() + 1);
        break;
    }

    // Update user membership status
    const { data, error } = await supabase
      .from('users')
      .update({
        membership_status: 'active',
        membership_type: membershipType,
        membership_valid_until: validUntil.toISOString().split('T')[0],
        last_payment_date: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;

    console.log(`✅ Membership activated for user ${userId} until ${validUntil}`);

    // Mark payment as auto-activated
    await supabase
      .from('payments')
      .update({ auto_activated: true })
      .eq('user_id', userId)
      .eq('payment_type', 'membership')
      .eq('status', 'completed')
      .is('auto_activated', null);

    return data;
  } catch (error) {
    console.error('Error activating membership:', error);
    throw error;
  }
}

// Helper function: Create notification
async function createPaymentNotification(userId, payment) {
  try {
    const notificationData = {
      user_id: userId,
      type: 'payment',
      priority: 'high',
      title: 'Payment Successful',
      message: `Your payment of KSh ${payment.amount.toLocaleString()} for ${payment.payment_type} has been processed successfully.`,
      action_url: `/dashboard/receipts/${payment.id}`,
      action_text: 'View Receipt',
      metadata: {
        payment_id: payment.id,
        amount: payment.amount,
        payment_type: payment.payment_type,
        transaction_id: payment.transaction_id,
        receipt_number: payment.receipt_number
      },
      related_entity_type: 'payment',
      related_entity_id: payment.id
    };

    const { data, error } = await supabase
      .from('notifications')
      .insert([notificationData])
      .select()
      .single();

    if (error) throw error;

    // Mark payment as notification sent
    await supabase
      .from('payments')
      .update({ notification_sent: true })
      .eq('id', payment.id);

    console.log(`✅ Notification created for payment ${payment.id}`);
    return data;
  } catch (error) {
    console.error('Error creating notification:', error);
    throw error;
  }
}

// Helper function: Generate receipt
async function generateReceipt(payment) {
  try {
    // Get user details
    const { data: user } = await supabase
      .from('users')
      .select('name, email, phone, registration_number')
      .eq('id', payment.user_id)
      .single();

    const receiptData = {
      receipt_number: payment.receipt_number,
      payment_id: payment.id,
      transaction_id: payment.transaction_id,
      date: payment.updated_at,
      payer: {
        name: user?.name,
        email: user?.email,
        phone: user?.phone,
        registration_number: user?.registration_number
      },
      payment_details: {
        amount: payment.amount,
        currency: payment.currency,
        payment_type: payment.payment_type,
        payment_method: payment.payment_method,
        description: payment.description
      },
      organization: {
        name: 'JKUAT Innovation and Entrepreneurship Club',
        email: 'info@jkuatinnovation.ac.ke',
        phone: '+254 XXX XXX XXX'
      },
      mpesa_details: payment.metadata?.mpesaReceiptNumber ? {
        receipt_number: payment.metadata.mpesaReceiptNumber,
        phone_number: payment.metadata.phoneNumber
      } : null
    };

    // Store receipt
    const { data, error } = await supabase
      .from('payment_receipts')
      .insert([{
        payment_id: payment.id,
        receipt_number: payment.receipt_number,
        receipt_data: receiptData
      }])
      .select()
      .single();

    if (error && error.code !== '23505') { // Ignore duplicate key error
      throw error;
    }

    console.log(`✅ Receipt generated: ${payment.receipt_number}`);
    return data;
  } catch (error) {
    console.error('Error generating receipt:', error);
    throw error;
  }
}
```

---

## 3. Backend: Dashboard API Enhancement

### Update `routes/dashboard.js`

```javascript
/**
 * GET /api/dashboard/overview
 * Enhanced with payment notifications and receipts
 */
router.get('/overview', authenticateToken, async (req, res) => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    // ... existing code for projects, ideas ...

    // Fetch user's recent payments with receipts
    const { data: payments, error: paymentsError } = await supabase
      .from('payments')
      .select(`
        id, amount, currency, payment_type, payment_method, status, 
        created_at, description, receipt_number, transaction_id,
        auto_activated, notification_sent
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(10);

    if (paymentsError) {
      console.error('Error fetching payments:', paymentsError);
    }

    // Fetch payment notifications (unread)
    const { data: paymentNotifications, error: paymentNotifsError } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .eq('type', 'payment')
      .is('read_at', null)
      .order('created_at', { ascending: false })
      .limit(5);

    if (paymentNotifsError) {
      console.error('Error fetching payment notifications:', paymentNotifsError);
    }

    // Get membership status
    const { data: membershipStatus } = await supabase
      .from('users')
      .select('membership_status, membership_type, membership_valid_until, last_payment_date')
      .eq('id', userId)
      .single();

    res.json({
      projects: projects || [],
      ideas: ideas || [],
      payments: payments || [],
      notifications: notifications || [],
      paymentNotifications: paymentNotifications || [],
      membershipStatus: membershipStatus || {},
      counts: {
        projects: projectsCount || 0,
        ideas: ideasCount || 0,
        unreadNotifications: unreadNotificationsCount || 0,
        recentPayments: payments?.length || 0
      }
    });

  } catch (error) {
    console.error('Error in GET /dashboard/overview:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

/**
 * GET /api/dashboard/receipts
 * Get all receipts for user
 */
router.get('/receipts', authenticateToken, async (req, res) => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const { data: receipts, error } = await supabase
      .from('payment_receipts')
      .select(`
        *,
        payment:payments!inner(
          id, user_id, amount, currency, payment_type, 
          payment_method, status, created_at, description
        )
      `)
      .eq('payment.user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching receipts:', error);
      return res.status(500).json({ message: 'Failed to fetch receipts' });
    }

    res.json({
      receipts: receipts || [],
      count: receipts?.length || 0
    });

  } catch (error) {
    console.error('Error in GET /dashboard/receipts:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

/**
 * GET /api/dashboard/receipts/:receiptId
 * Get single receipt details
 */
router.get('/receipts/:receiptId', authenticateToken, async (req, res) => {
  try {
    const userId = req.user?.id;
    const { receiptId } = req.params;
    
    if (!userId) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const { data: receipt, error } = await supabase
      .from('payment_receipts')
      .select(`
        *,
        payment:payments!inner(
          id, user_id, amount, currency, payment_type, 
          payment_method, status, created_at, description, transaction_id
        )
      `)
      .eq('id', receiptId)
      .eq('payment.user_id', userId)
      .single();

    if (error || !receipt) {
      return res.status(404).json({ message: 'Receipt not found' });
    }

    // Mark as viewed
    await supabase
      .from('payment_receipts')
      .update({ viewed_at: new Date().toISOString() })
      .eq('id', receiptId)
      .is('viewed_at', null);

    res.json(receipt);

  } catch (error) {
    console.error('Error in GET /dashboard/receipts/:receiptId:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

/**
 * GET /api/dashboard/membership
 * Get detailed membership information
 */
router.get('/membership', authenticateToken, async (req, res) => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    // Get user membership details
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('membership_status, membership_type, membership_valid_until, last_payment_date')
      .eq('id', userId)
      .single();

    if (userError) {
      console.error('Error fetching membership:', userError);
      return res.status(500).json({ message: 'Failed to fetch membership details' });
    }

    // Get membership payment history
    const { data: membershipPayments, error: paymentsError } = await supabase
      .from('payments')
      .select('id, amount, status, created_at, receipt_number, auto_activated')
      .eq('user_id', userId)
      .eq('payment_type', 'membership')
      .order('created_at', { ascending: false });

    if (paymentsError) {
      console.error('Error fetching membership payments:', paymentsError);
    }

    // Calculate days remaining
    let daysRemaining = null;
    if (user.membership_valid_until) {
      const validUntil = new Date(user.membership_valid_until);
      const today = new Date();
      daysRemaining = Math.ceil((validUntil - today) / (1000 * 60 * 60 * 24));
    }

    res.json({
      status: user.membership_status,
      type: user.membership_type,
      validUntil: user.membership_valid_until,
      lastPaymentDate: user.last_payment_date,
      daysRemaining,
      isExpired: daysRemaining !== null && daysRemaining < 0,
      isExpiringSoon: daysRemaining !== null && daysRemaining > 0 && daysRemaining <= 30,
      paymentHistory: membershipPayments || []
    });

  } catch (error) {
    console.error('Error in GET /dashboard/membership:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;
```

---

## 4. Frontend: Dashboard Updates

### Add Payment History Section to Dashboard HTML

```html
<!-- Add after Payment History card in dashboard.html -->

<!-- Recent Transactions -->
<div class="glass-card">
  <div class="flex justify-between items-center mb-4">
    <h2 class="text-white flex items-center gap-2">
      <i class="fas fa-receipt text-green-400"></i>
      Recent Transactions
      <span class="px-2 py-0.5 bg-green-500/20 text-green-300 text-xs rounded-full"
        id="transactionsCount">0</span>
    </h2>
    <a href="/dashboard/receipts" class="btn btn-outline btn-sm">
      <i class="fas fa-file-invoice"></i> All Receipts
    </a>
  </div>
  <div id="recentTransactions" class="space-y-2">
    <!-- JS Loaded -->
    <div class="text-center py-8 text-gray-400">
      <i class="fas fa-receipt text-3xl mb-2 opacity-50"></i>
      <p>No transactions yet</p>
    </div>
  </div>
</div>

<!-- Membership Status (if active) -->
<div class="glass-card" id="membershipCard" style="display: none;">
  <h3 class="text-white mb-4 flex items-center gap-2">
    <i class="fas fa-id-badge text-blue-400"></i>
    Membership Status
  </h3>
  <div class="space-y-3">
    <div class="flex justify-between items-center">
      <span class="text-gray-300 text-sm">Status</span>
      <span id="membershipStatusBadge" class="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-sm font-semibold">
        <i class="fas fa-check-circle mr-1"></i> Active
      </span>
    </div>
    <div class="flex justify-between items-center">
      <span class="text-gray-300 text-sm">Type</span>
      <span id="membershipType" class="text-white text-sm font-semibold">-</span>
    </div>
    <div class="flex justify-between items-center">
      <span class="text-gray-300 text-sm">Valid Until</span>
      <span id="membershipValidUntil" class="text-white text-sm font-semibold">-</span>
    </div>
    <div id="membershipWarning" class="hidden p-2 bg-yellow-500/20 border border-yellow-500/30 rounded text-yellow-300 text-xs">
      <i class="fas fa-exclamation-triangle mr-1"></i>
      <span id="membershipWarningText"></span>
    </div>
    <div class="pt-3 border-t border-white/10">
      <a href="/payment" class="btn btn-primary btn-full btn-sm">
        <i class="fas fa-credit-card"></i> Renew Membership
      </a>
    </div>
  </div>
</div>
```

### Update Dashboard JavaScript

```javascript
// Add to dashboard.js

async loadRecentTransactions() {
  const container = document.getElementById('recentTransactions');
  if (!container) return;

  try {
    const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
    
    if (!token) {
      console.warn('⚠️ No auth token');
      return;
    }

    const response = await fetch('/api/dashboard/overview', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch dashboard data');
    }

    const data = await response.json();
    const transactions = (data.payments || []).slice(0, 5);

    console.log('✅ Transactions loaded:', transactions.length);

    container.innerHTML = '';

    if (transactions.length === 0) {
      container.innerHTML = `
        <div class="text-center py-8 text-gray-400">
          <i class="fas fa-receipt text-3xl mb-2 opacity-50"></i>
          <p>No transactions yet</p>
        </div>
      `;
      return;
    }

    // Update count
    const countEl = document.getElementById('transactionsCount');
    if (countEl) countEl.textContent = transactions.length;

    transactions.forEach(transaction => {
      const txDate = new Date(transaction.created_at);
      const statusColor = transaction.status === 'completed' ? 'green' : 
                         transaction.status === 'pending' ? 'yellow' : 'red';
      
      const txItem = document.createElement('div');
      txItem.className = 'p-3 bg-white/5 rounded-lg border border-white/10 hover:bg-white/10 transition-all cursor-pointer';
      
      txItem.innerHTML = `
        <div class="flex justify-between items-start mb-2">
          <div class="flex-1">
            <div class="flex items-center gap-2 mb-1">
              <span class="text-white text-sm font-medium">${this.escapeHtml(transaction.payment_type || 'Payment')}</span>
              ${transaction.auto_activated ? '<span class="px-2 py-0.5 bg-blue-500/20 text-blue-400 text-xs rounded-full"><i class="fas fa-check-circle"></i> Auto-activated</span>' : ''}
            </div>
            <p class="text-gray-400 text-xs">${this.escapeHtml(transaction.description || '')}</p>
          </div>
          <span class="text-${statusColor}-400 font-semibold text-sm">${transaction.currency || 'KSh'} ${parseFloat(transaction.amount || 0).toLocaleString()}</span>
        </div>
        <div class="flex justify-between items-center text-xs text-gray-400">
          <span>${txDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
          <div class="flex items-center gap-2">
            <span class="flex items-center gap-1">
              <i class="fas ${transaction.status === 'completed' ? 'fa-check-circle text-green-500' : 'fa-clock text-yellow-500'}"></i>
              ${this.escapeHtml(transaction.status)}
            </span>
            ${transaction.receipt_number ? `
              <button class="text-blue-400 hover:text-blue-300" onclick="window.location.href='/dashboard/receipts/${transaction.id}'">
                <i class="fas fa-file-invoice"></i> Receipt
              </button>
            ` : ''}
          </div>
        </div>
      `;
      
      container.appendChild(txItem);
    });

    // Load membership status
    this.loadMembershipStatus(data.membershipStatus);

  } catch (error) {
    console.error('❌ Error loading transactions:', error);
    container.innerHTML = `
      <div class="text-center py-8 text-gray-400">
        <i class="fas fa-exclamation-triangle text-3xl mb-2 opacity-50"></i>
        <p>Failed to load transactions</p>
      </div>
    `;
  }
}

loadMembershipStatus(membershipData) {
  if (!membershipData || !membershipData.membership_status) return;

  const card = document.getElementById('membershipCard');
  if (!card) return;

  // Only show if membership is active or expiring soon
  if (membershipData.membership_status === 'active') {
    card.style.display = 'block';

    // Update status badge
    const statusBadge = document.getElementById('membershipStatusBadge');
    if (statusBadge) {
      statusBadge.innerHTML = '<i class="fas fa-check-circle mr-1"></i> Active';
      statusBadge.className = 'px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-sm font-semibold';
    }

    // Update type
    const typeEl = document.getElementById('membershipType');
    if (typeEl) {
      const typeMap = {
        'monthly': 'Monthly',
        'semester': 'Semester',
        'annual': 'Annual'
      };
      typeEl.textContent = typeMap[membershipData.membership_type] || membershipData.membership_type || 'Regular';
    }

    // Update valid until
    const validUntilEl = document.getElementById('membershipValidUntil');
    if (validUntilEl && membershipData.membership_valid_until) {
      const validDate = new Date(membershipData.membership_valid_until);
      validUntilEl.textContent = validDate.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric', 
        year: 'numeric' 
      });

      // Check if expiring soon (within 30 days)
      const daysRemaining = Math.ceil((validDate - new Date()) / (1000 * 60 * 60 * 24));
      if (daysRemaining <= 30 && daysRemaining > 0) {
        const warningEl = document.getElementById('membershipWarning');
        const warningText = document.getElementById('membershipWarningText');
        if (warningEl && warningText) {
          warningEl.classList.remove('hidden');
          warningText.textContent = `Your membership expires in ${daysRemaining} days`;
        }
      }
    }
  } else if (membershipData.membership_status === 'expired') {
    card.style.display = 'block';
    const statusBadge = document.getElementById('membershipStatusBadge');
    if (statusBadge) {
      statusBadge.innerHTML = '<i class="fas fa-times-circle mr-1"></i> Expired';
      statusBadge.className = 'px-3 py-1 bg-red-500/20 text-red-400 rounded-full text-sm font-semibold';
    }
  }
}

// Update the loadMockData method to include transactions
async loadMockData() {
  console.log('📊 Loading dashboard data from API...');
  await Promise.all([
    this.loadMyProjects(),
    this.loadMyIdeas(),
    this.loadPaymentHistory(),
    this.loadNotificationsList(),
    this.loadRecentTransactions() // Add this
  ]);
}
```

---

## 5. Create Receipts Page

### Create `pages/dashboard/receipts.html`

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Payment Receipts - JKUAT Innovation Club</title>
  <!-- Same head content as dashboard -->
</head>
<body class="receipts-page">
  <div id="navbar-placeholder"></div>

  <main class="receipts-main">
    <div class="container">
      <h1 class="page-title">Payment Receipts</h1>
      
      <div id="receiptsGrid" class="receipts-grid">
        <!-- Loaded by JS -->
      </div>
    </div>
  </main>

  <script src="/dashboard/receipts.js"></script>
</body>
</html>
```

---

## Summary

This integration provides:

✅ **Auto-Activation**: Membership automatically activated when payment completes
✅ **Notifications**: Payment success notifications appear in dashboard
✅ **Receipts**: All receipts stored and accessible from dashboard
✅ **Membership Tracking**: Shows membership status, expiry, and renewal reminders
✅ **Transaction History**: Complete payment history with details
✅ **Receipt Numbers**: Auto-generated unique receipt numbers
✅ **Payment Types**: Tracks what each payment was for

**Next Steps:**
1. Run the database migration scripts
2. Update the payment callback handler
3. Add the dashboard sections
4. Test the complete flow
