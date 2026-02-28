# Payment Integration Testing Checklist

## Pre-Testing Setup ✅

- [ ] Lipana.dev account created
- [ ] API credentials obtained (API Key & Webhook Secret)
- [ ] Environment variables added to `.env` file
- [ ] Database migrations executed successfully
- [ ] Server restarted after configuration
- [ ] ngrok running (for local testing) or production URL configured

---

## Test 1: Membership Payment Flow

### Test Case: Monthly Membership Payment
**Expected Amount:** KSh 500

#### Steps:
1. [ ] Navigate to `/payment` page
2. [ ] Click "Select" on "Membership Fee" card
3. [ ] Select "Monthly Membership" option
4. [ ] Verify amount shows KSh 500
5. [ ] Enter test phone number: `254712345678`
6. [ ] Click "Send STK Push"

#### Expected Results:
- [ ] Success message: "STK Push sent successfully"
- [ ] Processing screen appears with transaction reference
- [ ] Console logs show:
  - `💳 Initiating Lipana payment`
  - `✅ Payment record created`
  - `✅ Lipana STK Push initiated`
- [ ] After ~5-10 seconds, callback received:
  - `📥 Lipana callback received`
  - `✅ Payment found`
  - `✅ Payment marked as completed`
  - `✅ Membership activated for user`
  - `✅ Notification created`
  - `✅ Receipt generated`
- [ ] Success screen shows with transaction ID
- [ ] User's membership status updated to "active"

#### Database Verification:
```sql
-- Check payment record
SELECT * FROM payments 
WHERE payment_type = 'membership' 
ORDER BY created_at DESC LIMIT 1;

-- Check user membership status
SELECT id, name, membership_status, membership_type, membership_valid_until 
FROM users 
WHERE id = '<user_id>';

-- Check notification created
SELECT * FROM notifications 
WHERE type = 'payment' 
ORDER BY created_at DESC LIMIT 1;

-- Check receipt generated
SELECT * FROM payment_receipts 
ORDER BY created_at DESC LIMIT 1;
```

---

## Test 2: Event Registration Payment

### Test Case: Workshop Registration
**Expected Amount:** KSh 500 (or event-specific amount)

#### Steps:
1. [ ] Navigate to `/payment` page
2. [ ] Click "Select" on "Event Registration" card
3. [ ] Select an available event
4. [ ] Verify amount matches event fee
5. [ ] Enter test phone number: `254712345678`
6. [ ] Click "Send STK Push"

#### Expected Results:
- [ ] Payment processed successfully
- [ ] Event attendance record updated
- [ ] Notification created
- [ ] Receipt generated

#### Database Verification:
```sql
-- Check payment with event_id
SELECT * FROM payments 
WHERE payment_type = 'events' 
AND event_id IS NOT NULL
ORDER BY created_at DESC LIMIT 1;

-- Check event attendance updated
SELECT * FROM event_attendees 
WHERE payment_status = 'paid' 
ORDER BY created_at DESC LIMIT 1;
```

---

## Test 3: Payment Status Polling

### Test Case: Real-time Status Updates

#### Steps:
1. [ ] Initiate a payment
2. [ ] Watch the processing screen
3. [ ] Observe status updates every 10 seconds

#### Expected Results:
- [ ] Status checks start after 5 seconds
- [ ] Console shows: `Checking payment status...`
- [ ] Status updates from `pending` → `completed`
- [ ] Success screen appears automatically
- [ ] No manual refresh needed

---

## Test 4: Failed Payment Scenario

### Test Case: Payment Cancellation
**Test Phone:** `254712345679` (if supported by Lipana sandbox)

#### Steps:
1. [ ] Initiate payment with failure test number
2. [ ] Cancel M-Pesa prompt (or wait for timeout)

#### Expected Results:
- [ ] Payment status updates to `failed`
- [ ] Error message displayed
- [ ] User can retry payment
- [ ] No membership activation
- [ ] No notification sent

---

## Test 5: Webhook Security

### Test Case: Webhook Signature Verification

#### Steps:
1. [ ] Send a test webhook with invalid signature
2. [ ] Check server logs

#### Expected Results:
- [ ] Request rejected with 401 status
- [ ] Log shows: `❌ Invalid webhook signature`
- [ ] Payment not processed

---

## Test 6: Rate Limiting

### Test Case: Multiple Payment Attempts

#### Steps:
1. [ ] Attempt 6 payments in quick succession
2. [ ] Observe behavior on 6th attempt

#### Expected Results:
- [ ] First 5 attempts processed normally
- [ ] 6th attempt shows error: "Too many payment attempts"
- [ ] Rate limit resets after page reload

---

## Test 7: Input Validation

### Test Case: Phone Number Validation

#### Test Inputs:
- [ ] `0712345678` → Should convert to `254712345678`
- [ ] `712345678` → Should convert to `254712345678`
- [ ] `254712345678` → Should remain `254712345678`
- [ ] `+254712345678` → Should convert to `254712345678`
- [ ] `invalid` → Should show error

#### Expected Results:
- [ ] Valid formats accepted and normalized
- [ ] Invalid formats rejected with clear error message
- [ ] Input field shows validation feedback (green/red border)

---

## Test 8: Amount Validation

### Test Case: Amount Limits

#### Test Inputs:
- [ ] `0` → Should show error
- [ ] `-100` → Should show error
- [ ] `1000001` → Should show error (max 1,000,000)
- [ ] `500` → Should be accepted

#### Expected Results:
- [ ] Invalid amounts rejected
- [ ] Clear error messages shown
- [ ] Valid amounts processed

---

## Test 9: Receipt Generation

### Test Case: Receipt Details

#### Steps:
1. [ ] Complete a successful payment
2. [ ] Check database for receipt record

#### Expected Results:
- [ ] Receipt number generated (format: `RCP-YYYYMMDD-XXXXXX`)
- [ ] Receipt data includes:
  - [ ] Payer information (name, email, phone)
  - [ ] Payment details (amount, type, method)
  - [ ] Organization details
  - [ ] M-Pesa receipt number (if available)
  - [ ] Transaction date

#### Database Query:
```sql
SELECT 
  receipt_number,
  receipt_data,
  created_at
FROM payment_receipts
ORDER BY created_at DESC LIMIT 1;
```

---

## Test 10: Dashboard Integration

### Test Case: Payment Notifications in Dashboard

#### Steps:
1. [ ] Complete a payment
2. [ ] Navigate to `/dashboard`
3. [ ] Check notifications section

#### Expected Results:
- [ ] Payment notification appears
- [ ] Shows correct amount and payment type
- [ ] Notification marked as unread
- [ ] Click notification to view details

---

## Test 11: Membership Auto-Activation

### Test Case: Membership Expiry Calculation

#### Test Scenarios:
- [ ] Monthly membership → Expires in 1 month
- [ ] Semester membership → Expires in 6 months
- [ ] Annual membership → Expires in 1 year

#### Verification:
```sql
SELECT 
  name,
  membership_type,
  membership_valid_until,
  EXTRACT(DAY FROM (membership_valid_until - CURRENT_DATE)) as days_remaining
FROM users
WHERE membership_status = 'active'
ORDER BY membership_valid_until DESC;
```

---

## Test 12: Error Handling

### Test Case: Network Failures

#### Scenarios to Test:
- [ ] Server timeout (disconnect internet briefly)
- [ ] Invalid API credentials
- [ ] Lipana.dev service unavailable

#### Expected Results:
- [ ] Graceful error messages
- [ ] No data corruption
- [ ] User can retry
- [ ] Errors logged to console

---

## Test 13: Concurrent Payments

### Test Case: Multiple Users Paying Simultaneously

#### Steps:
1. [ ] Open payment page in 2 different browsers
2. [ ] Initiate payments at the same time
3. [ ] Verify both process correctly

#### Expected Results:
- [ ] Both payments processed independently
- [ ] No race conditions
- [ ] Correct user associations
- [ ] Unique transaction references

---

## Test 14: Webhook Delivery

### Test Case: Callback URL Accessibility

#### Steps:
1. [ ] Check ngrok URL is active
2. [ ] Verify callback URL in Lipana.dev dashboard
3. [ ] Initiate test payment
4. [ ] Monitor ngrok web interface for incoming requests

#### Expected Results:
- [ ] Webhook POST request received
- [ ] Request includes signature header
- [ ] Payload contains payment data
- [ ] Server responds with 200 OK

---

## Production Readiness Checklist

Before deploying to production:

### Configuration
- [ ] `LIPANA_ENVIRONMENT` set to `production`
- [ ] Production API key configured
- [ ] Production callback URL configured
- [ ] HTTPS enabled on production domain
- [ ] Webhook registered in Lipana.dev production dashboard

### Security
- [ ] Rate limiting configured
- [ ] Input validation working
- [ ] Webhook signature verification enabled
- [ ] CSRF protection active
- [ ] SQL injection prevention verified

### Monitoring
- [ ] Error logging configured
- [ ] Payment success/failure alerts set up
- [ ] Database backup enabled
- [ ] Performance monitoring active

### Testing
- [ ] All test cases passed in sandbox
- [ ] Small real payment tested (KSh 10)
- [ ] Receipt generation verified
- [ ] Membership activation verified
- [ ] Notification delivery verified

### Documentation
- [ ] API endpoints documented
- [ ] Error codes documented
- [ ] Support contact information added
- [ ] User guide created

---

## Common Issues & Solutions

### Issue: "Payment initiation failed"
**Check:**
- API key is correct
- Environment is set to `sandbox`
- Server has internet connection
- Lipana.dev service is operational

### Issue: "Callback not received"
**Check:**
- ngrok is running
- Callback URL is publicly accessible
- Webhook is registered in Lipana.dev
- Webhook secret matches

### Issue: "Membership not activated"
**Check:**
- Database migrations completed
- `payment_type` is `'membership'`
- Callback was successful
- Check server logs for errors

### Issue: "Receipt not generated"
**Check:**
- `payment_receipts` table exists
- Payment status is `'completed'`
- User details are available
- Check server logs for errors

---

## Test Summary Template

After completing all tests, fill this out:

```
Test Date: _______________
Tester: _______________
Environment: [ ] Sandbox [ ] Production

Results:
- Total Tests: ___
- Passed: ___
- Failed: ___
- Blocked: ___

Critical Issues Found:
1. _______________
2. _______________

Notes:
_______________
_______________
```

---

## Next Steps After Testing

1. [ ] Document any issues found
2. [ ] Fix critical bugs
3. [ ] Re-test failed scenarios
4. [ ] Get approval for production deployment
5. [ ] Schedule production deployment
6. [ ] Monitor production payments closely
7. [ ] Gather user feedback
