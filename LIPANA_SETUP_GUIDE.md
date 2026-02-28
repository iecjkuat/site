# Lipana.dev Payment Integration Setup Guide

## Current Status ✅

The payment integration with Lipana.dev has been implemented and is ready for testing. Here's what's been done:

### Completed Tasks:
1. ✅ Created `routes/payment-lipana.js` with complete Lipana.dev integration
2. ✅ Registered route in `server.js` (both versioned and compatibility routes)
3. ✅ Updated frontend `pages/payment/payment.js` to use new Lipana endpoint
4. ✅ Added environment variables to `.env.example`

### Features Implemented:
- **STK Push Integration**: Initiate M-Pesa payments via Lipana.dev
- **Webhook Callback Handler**: Process payment confirmations
- **Payment Status Polling**: Check payment status in real-time
- **Auto-Activation**: Membership automatically activates on successful payment
- **Notifications**: Payment success notifications appear in dashboard
- **Receipt Generation**: Receipts stored in database with unique numbers
- **Event Registration**: Auto-update event attendance on payment

---

## Next Steps 🚀

### 1. Sign Up for Lipana.dev Account

Visit [https://lipana.dev](https://lipana.dev) and create an account.

### 2. Get API Credentials

Once logged in to Lipana.dev dashboard:
- Navigate to **Settings** → **API Keys**
- Copy your **API Key**
- Copy your **Webhook Secret**
- Note: Start with **Sandbox** environment for testing

### 3. Configure Environment Variables

Add these to your `.env` file (copy from `.env.example`):

```env
# Lipana.dev Configuration
LIPANA_API_KEY=your_actual_api_key_here
LIPANA_WEBHOOK_SECRET=your_actual_webhook_secret_here
LIPANA_ENVIRONMENT=sandbox
LIPANA_CALLBACK_URL=https://yourdomain.com/api/payment-lipana/callback
```

**Important Notes:**
- Use `sandbox` for testing, `production` for live payments
- The callback URL must be publicly accessible (see step 4)

### 4. Setup Webhook URL (For Local Testing)

Since Lipana.dev needs to send callbacks to your server, you need a public URL:

#### Option A: Using ngrok (Recommended for local testing)

1. Install ngrok: [https://ngrok.com/download](https://ngrok.com/download)

2. Start your server:
   ```bash
   npm start
   ```

3. In a new terminal, start ngrok:
   ```bash
   ngrok http 3000
   ```

4. Copy the HTTPS URL (e.g., `https://abc123.ngrok.io`)

5. Update your `.env`:
   ```env
   LIPANA_CALLBACK_URL=https://abc123.ngrok.io/api/payment-lipana/callback
   ```

6. Configure this URL in Lipana.dev dashboard under **Webhooks**

#### Option B: Deploy to Production

Deploy your app to a hosting service (Heroku, Railway, Render, etc.) and use that URL.

### 5. Run Database Migrations

The payment integration requires additional database columns. Run these SQL commands in your Supabase SQL Editor:

```sql
-- Add membership tracking columns to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS membership_status VARCHAR(20) DEFAULT 'inactive';
ALTER TABLE users ADD COLUMN IF NOT EXISTS membership_type VARCHAR(50);
ALTER TABLE users ADD COLUMN IF NOT EXISTS membership_valid_until DATE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_payment_date TIMESTAMP;

-- Add check constraint
ALTER TABLE users ADD CONSTRAINT check_membership_status 
  CHECK (membership_status IN ('active', 'inactive', 'expired', 'suspended'));

-- Add receipt and notification tracking to payments table
ALTER TABLE payments ADD COLUMN IF NOT EXISTS receipt_url TEXT;
ALTER TABLE payments ADD COLUMN IF NOT EXISTS receipt_number VARCHAR(50) UNIQUE;
ALTER TABLE payments ADD COLUMN IF NOT EXISTS notification_sent BOOLEAN DEFAULT FALSE;
ALTER TABLE payments ADD COLUMN IF NOT EXISTS auto_activated BOOLEAN DEFAULT FALSE;

-- Create payment_receipts table
CREATE TABLE IF NOT EXISTS payment_receipts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  payment_id UUID NOT NULL REFERENCES payments(id) ON DELETE CASCADE,
  receipt_number VARCHAR(50) UNIQUE NOT NULL,
  receipt_data JSONB NOT NULL,
  pdf_url TEXT,
  viewed_at TIMESTAMP,
  downloaded_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  
  UNIQUE(payment_id)
);

CREATE INDEX IF NOT EXISTS idx_payment_receipts_payment_id ON payment_receipts(payment_id);
CREATE INDEX IF NOT EXISTS idx_payment_receipts_receipt_number ON payment_receipts(receipt_number);
```

### 6. Restart Your Server

After adding environment variables:

```bash
# Stop the server (Ctrl+C)
# Start it again
npm start
```

### 7. Test the Payment Flow

1. Navigate to: `http://localhost:3000/payment`
2. Select **Membership Fee** service
3. Choose a membership option (e.g., Monthly - KSh 500)
4. Enter a test phone number: `254712345678` (Sandbox mode)
5. Click **Send STK Push**
6. Check the console logs for payment processing

#### Expected Flow:
1. ✅ Payment record created in database
2. ✅ STK Push sent via Lipana.dev
3. ✅ User receives M-Pesa prompt (in sandbox, this is simulated)
4. ✅ Webhook callback received
5. ✅ Payment marked as completed
6. ✅ Membership activated (if membership payment)
7. ✅ Notification created
8. ✅ Receipt generated

### 8. Monitor Logs

Watch your server console for these log messages:

```
💳 Initiating Lipana payment: { userId, amount, paymentType }
✅ Payment record created: <payment_id>
✅ Lipana STK Push initiated: <response>
📥 Lipana callback received: <callback_data>
✅ Payment found: <payment_id>
✅ Payment marked as completed
✅ Membership activated for user <user_id> until <date>
✅ Notification created for payment <payment_id>
✅ Receipt generated: <receipt_number>
```

---

## Testing in Sandbox Mode

Lipana.dev sandbox provides test phone numbers and simulated M-Pesa responses:

### Test Phone Numbers:
- `254712345678` - Success scenario
- `254712345679` - Failure scenario
- `254712345680` - Timeout scenario

### Sandbox Features:
- No real money is charged
- Instant callback responses
- Test all payment scenarios
- Debug webhook payloads

---

## Troubleshooting

### Issue: "Payment initiation failed"
**Solution:** Check that:
- `LIPANA_API_KEY` is correct
- `LIPANA_ENVIRONMENT` is set to `sandbox`
- Server is running and accessible

### Issue: "Callback not received"
**Solution:** Check that:
- Webhook URL is publicly accessible (use ngrok for local testing)
- `LIPANA_CALLBACK_URL` is correctly configured
- Webhook is registered in Lipana.dev dashboard
- `LIPANA_WEBHOOK_SECRET` matches the one in Lipana.dev

### Issue: "Payment stuck in pending"
**Solution:**
- Check server logs for callback errors
- Verify webhook signature validation
- Check Lipana.dev dashboard for callback delivery status

### Issue: "Membership not activated"
**Solution:**
- Check that `payment_type` is set to `'membership'`
- Verify database columns exist (run migrations)
- Check server logs for activation errors

---

## Production Deployment Checklist

Before going live:

- [ ] Change `LIPANA_ENVIRONMENT` to `production`
- [ ] Update `LIPANA_API_KEY` with production key
- [ ] Update `LIPANA_CALLBACK_URL` with production domain
- [ ] Test with real phone numbers (small amounts first)
- [ ] Monitor logs for any errors
- [ ] Set up error alerting (email/Slack notifications)
- [ ] Configure rate limiting for payment endpoints
- [ ] Enable HTTPS (required for production)
- [ ] Test webhook delivery in production
- [ ] Verify receipt generation works
- [ ] Test membership activation flow
- [ ] Check notification delivery

---

## API Endpoints

### Initiate Payment
```
POST /api/payment-lipana/initiate
Authorization: Bearer <token>

Body:
{
  "phoneNumber": "254712345678",
  "amount": 500,
  "paymentType": "membership",
  "eventId": null,
  "description": "Monthly Membership",
  "serviceData": {
    "option": "monthly"
  }
}

Response:
{
  "success": true,
  "message": "STK Push sent successfully",
  "data": {
    "paymentId": "uuid",
    "transactionRef": "PAY-xxx",
    "checkoutRequestId": "ws_xxx",
    "amount": 500
  }
}
```

### Check Payment Status
```
GET /api/payment-lipana/status/:paymentId
Authorization: Bearer <token>

Response:
{
  "id": "uuid",
  "status": "completed",
  "amount": 500,
  "currency": "KES",
  "payment_type": "membership",
  "transactionReference": "xxx",
  "receiptNumber": "RCP-xxx",
  "createdAt": "2024-01-01T00:00:00Z",
  "updatedAt": "2024-01-01T00:05:00Z"
}
```

### Webhook Callback (Lipana.dev calls this)
```
POST /api/payment-lipana/callback
X-Lipana-Signature: <signature>

Body:
{
  "checkout_request_id": "ws_xxx",
  "transaction_id": "xxx",
  "result_code": 0,
  "result_desc": "Success",
  "amount": 500,
  "phone_number": "254712345678",
  "mpesa_receipt_number": "xxx",
  "transaction_date": "2024-01-01T00:00:00Z",
  "metadata": {
    "payment_id": "uuid",
    "user_id": "uuid",
    "payment_type": "membership"
  }
}
```

---

## Support

- **Lipana.dev Documentation**: [https://docs.lipana.dev](https://docs.lipana.dev)
- **Lipana.dev Support**: support@lipana.dev
- **Integration Issues**: Check server logs and Lipana.dev dashboard

---

## Summary

You now have a complete payment integration with:
- ✅ M-Pesa STK Push via Lipana.dev
- ✅ Automatic membership activation
- ✅ Payment notifications
- ✅ Receipt generation
- ✅ Event registration payments
- ✅ Real-time payment status tracking

**Next Action:** Sign up at [https://lipana.dev](https://lipana.dev) and get your API credentials!
