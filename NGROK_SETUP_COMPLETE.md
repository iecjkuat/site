# ✅ ngrok Setup Complete!

## 🎉 Your Payment System is Ready for Testing

### Current Configuration

**ngrok Public URL:**
```
https://2b22-102-205-238-248.ngrok-free.app
```

**Callback URL (Updated in .env):**
```
https://2b22-102-205-238-248.ngrok-free.app/api/payment-lipana/callback
```

**Server Status:**
- ✅ Server running on port 3000
- ✅ ngrok tunnel active
- ✅ Callback URL updated in .env
- ✅ Server restarted with new configuration

---

## 🔗 Important URLs

### Local Access (Your Computer)
- **Payment Page**: http://localhost:3000/payment
- **Dashboard**: http://localhost:3000/dashboard
- **Admin Panel**: http://localhost:3000/admin

### Public Access (via ngrok)
- **Payment Page**: https://2b22-102-205-238-248.ngrok-free.app/payment
- **Callback Endpoint**: https://2b22-102-205-238-248.ngrok-free.app/api/payment-lipana/callback

### ngrok Dashboard
- **Web Interface**: http://127.0.0.1:4040
- View real-time requests, inspect webhooks, replay requests

---

## 📋 Next Step: Register Webhook in Lipana.dev

You need to register your callback URL in the Lipana.dev dashboard:

### Steps:

1. **Go to Lipana.dev Dashboard**
   - Visit: https://dashboard.lipana.dev
   - Log in with your account

2. **Navigate to Webhooks**
   - Click on "Settings" or "Webhooks" in the sidebar

3. **Add Webhook URL**
   - Click "Add Webhook" or "New Webhook"
   - Enter URL: `https://2b22-102-205-238-248.ngrok-free.app/api/payment-lipana/callback`
   - Select events: "Payment Success", "Payment Failed" (or all payment events)
   - Save

4. **Verify Webhook**
   - Lipana.dev may send a test request to verify the URL
   - Check your ngrok dashboard (http://127.0.0.1:4040) to see if the request was received

---

## 🧪 Test Your Payment Integration

### Test Payment Flow:

1. **Open Payment Page**
   ```
   http://localhost:3000/payment
   ```

2. **Select Service**
   - Click "Select" on "Membership Fee"

3. **Choose Option**
   - Select "Monthly Membership" (KSh 500)

4. **Enter Details**
   - Phone Number: `254712345678` (Lipana sandbox test number)
   - Amount should auto-fill to 500

5. **Submit Payment**
   - Click "Send STK Push"

6. **Watch Console Logs**
   You should see:
   ```
   💳 Initiating Lipana payment: { userId, amount: 500, paymentType: 'membership' }
   ✅ Payment record created: <payment_id>
   ✅ Lipana STK Push initiated: <response>
   ```

7. **Wait for Callback** (5-10 seconds)
   ```
   📥 Lipana callback received: <callback_data>
   ✅ Payment found: <payment_id>
   ✅ Payment marked as completed
   ✅ Membership activated for user <user_id>
   ✅ Notification created
   ✅ Receipt generated: RCP-xxxxx
   ```

8. **Check ngrok Dashboard**
   - Open: http://127.0.0.1:4040
   - You'll see the webhook POST request from Lipana.dev
   - Inspect the payload and response

---

## 🔍 Monitoring & Debugging

### Server Console
Watch your server terminal for logs showing:
- Payment initiation
- Lipana API responses
- Webhook callbacks
- Membership activation
- Notification creation
- Receipt generation

### ngrok Web Interface
- **URL**: http://127.0.0.1:4040
- **Features**:
  - See all HTTP requests in real-time
  - Inspect webhook payloads
  - Replay requests for testing
  - View response codes and timing

### Database Verification
After a successful payment, check Supabase:

```sql
-- Check payment record
SELECT * FROM payments 
WHERE payment_type = 'membership' 
ORDER BY created_at DESC LIMIT 1;

-- Check user membership status
SELECT id, name, membership_status, membership_type, membership_valid_until 
FROM users 
WHERE membership_status = 'active'
ORDER BY last_payment_date DESC LIMIT 1;

-- Check notification
SELECT * FROM notifications 
WHERE type = 'payment' 
ORDER BY created_at DESC LIMIT 1;

-- Check receipt
SELECT * FROM payment_receipts 
ORDER BY created_at DESC LIMIT 1;
```

---

## ⚠️ Important Notes

### ngrok URL Changes
- **Free ngrok URLs change every time you restart ngrok**
- If you restart ngrok, you'll get a new URL
- You'll need to:
  1. Update `.env` with the new URL
  2. Restart your server
  3. Update the webhook URL in Lipana.dev dashboard

### Keep ngrok Running
- Don't close the ngrok terminal
- ngrok must be running for webhooks to work
- If ngrok stops, payments will initiate but callbacks won't be received

### Paid ngrok Plan (Optional)
- Get a permanent URL that doesn't change
- Custom subdomain (e.g., `yourapp.ngrok.io`)
- More concurrent connections
- Visit: https://ngrok.com/pricing

---

## 🐛 Troubleshooting

### Payment Initiates but No Callback Received

**Check:**
1. ngrok is still running
2. Webhook URL is registered in Lipana.dev
3. Check ngrok dashboard (http://127.0.0.1:4040) for incoming requests
4. Server logs for any errors

**Solution:**
- Verify webhook URL in Lipana.dev matches your current ngrok URL
- Check ngrok dashboard to see if request was received
- Look for errors in server console

### "Invalid Webhook Signature" Error

**Check:**
- `LIPANA_WEBHOOK_SECRET` in .env matches Lipana.dev dashboard
- Server was restarted after updating .env

**Solution:**
- Copy webhook secret from Lipana.dev
- Update .env
- Restart server

### Payment Status Stuck on "Pending"

**Check:**
- Callback URL is accessible
- ngrok is running
- Webhook is registered

**Solution:**
- Check ngrok dashboard for webhook delivery
- Manually check payment status in Lipana.dev dashboard
- Check server logs for callback processing errors

---

## 📊 Current System Status

| Component | Status | Details |
|-----------|--------|---------|
| Server | ✅ Running | Port 3000 |
| ngrok | ✅ Active | https://2b22-102-205-238-248.ngrok-free.app |
| Callback URL | ✅ Updated | In .env file |
| Lipana.dev API | ✅ Configured | Sandbox mode |
| Database | ✅ Connected | Supabase |
| Webhook Registration | ⏳ Pending | Register in Lipana.dev dashboard |

---

## 🎯 Next Actions

1. ✅ ngrok installed and authenticated
2. ✅ ngrok tunnel started
3. ✅ Callback URL updated in .env
4. ✅ Server restarted
5. ⏳ **Register webhook in Lipana.dev dashboard** ← DO THIS NOW
6. ⏳ Test payment flow
7. ⏳ Verify database updates
8. ⏳ Check receipt generation

---

## 📞 Support Resources

- **ngrok Dashboard**: http://127.0.0.1:4040
- **ngrok Docs**: https://ngrok.com/docs
- **Lipana.dev Dashboard**: https://dashboard.lipana.dev
- **Lipana.dev Docs**: https://docs.lipana.dev
- **Testing Guide**: See `PAYMENT_TESTING_CHECKLIST.md`

---

## 🚀 You're Ready!

Your payment system is now fully configured and ready for testing. 

**Next step:** Register the webhook URL in Lipana.dev dashboard, then test a payment!

**Webhook URL to register:**
```
https://2b22-102-205-238-248.ngrok-free.app/api/payment-lipana/callback
```
