# Payment Integration - Quick Start Guide

## 🚀 Get Started in 5 Steps

### 1️⃣ Sign Up for Lipana.dev (5 min)
- Visit: https://lipana.dev
- Create account
- Get API Key & Webhook Secret from Settings → API Keys

### 2️⃣ Configure Environment (2 min)
Add to `.env`:
```env
LIPANA_API_KEY=your_api_key_here
LIPANA_WEBHOOK_SECRET=your_webhook_secret_here
LIPANA_ENVIRONMENT=sandbox
LIPANA_CALLBACK_URL=https://yourdomain.com/api/payment-lipana/callback
```

### 3️⃣ Run Database Migrations (3 min)
- Open Supabase SQL Editor
- Copy & run: `DATABASE_MIGRATIONS.sql`

### 4️⃣ Setup ngrok (5 min)
```bash
# Terminal 1: Start server
npm start

# Terminal 2: Start ngrok
ngrok http 3000

# Copy HTTPS URL and update .env:
LIPANA_CALLBACK_URL=https://abc123.ngrok.io/api/payment-lipana/callback

# Restart server
```

### 5️⃣ Test Payment (5 min)
1. Go to: http://localhost:3000/payment
2. Select "Membership Fee"
3. Choose "Monthly Membership"
4. Phone: `254712345678`
5. Click "Send STK Push"
6. Watch console for success logs ✅

---

## ✅ Success Indicators

You'll see these in console:
```
💳 Initiating Lipana payment
✅ Payment record created
✅ Lipana STK Push initiated
📥 Lipana callback received
✅ Payment marked as completed
✅ Membership activated
✅ Notification created
✅ Receipt generated
```

---

## 📚 Full Documentation

- **Setup Guide**: `LIPANA_SETUP_GUIDE.md`
- **Testing Guide**: `PAYMENT_TESTING_CHECKLIST.md`
- **Database Migrations**: `DATABASE_MIGRATIONS.sql`
- **Complete Summary**: `PAYMENT_INTEGRATION_COMPLETE.md`

---

## 🆘 Troubleshooting

**Payment fails?**
- Check API key is correct
- Verify environment is `sandbox`
- Ensure server is running

**Callback not received?**
- Check ngrok is running
- Verify callback URL is public
- Check webhook registered in Lipana.dev

**Membership not activated?**
- Run database migrations
- Check server logs
- Verify payment completed

---

## 🎯 What's Included

✅ M-Pesa STK Push
✅ Auto-membership activation
✅ Payment notifications
✅ Receipt generation
✅ Event payments
✅ Real-time status tracking
✅ Webhook security
✅ Input validation

---

## 📞 Support

- Lipana.dev Docs: https://docs.lipana.dev
- Lipana.dev Support: support@lipana.dev

---

**Ready?** Start with Step 1: Sign up at https://lipana.dev 🚀
