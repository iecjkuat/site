# Event Registration & QR Code System

## Overview
Complete event registration system with QR code generation for check-in at events.

## Features

### For Members
1. **Register for Events** - One-click registration from events page
2. **QR Code Generation** - Automatic QR code created upon registration
3. **Registration Status** - View registration status (Confirmed, Pending, Waitlisted)
4. **Payment Integration** - Support for paid events with payment tracking
5. **Waitlist Management** - Automatic waitlist when event is full
6. **Cancel Registration** - Cancel before event starts

### For Admins
1. **QR Code Scanning** - Check-in attendees by scanning QR codes
2. **Manual Check-in** - Check-in attendees manually if needed
3. **Registration Stats** - View registration statistics per event
4. **Attendee Management** - View and manage all registrations

## API Endpoints

### Registration
- `POST /api/v1/events/:eventId/register` - Register for an event
- `GET /api/v1/events/:eventId/registration` - Get user's registration
- `GET /api/v1/events/registrations/my` - Get all user's registrations
- `DELETE /api/v1/events/:eventId/registration` - Cancel registration

### Check-in
- `POST /api/v1/events/check-in` - Check-in with QR code
- `POST /api/v1/events/:eventId/check-in/:userId` - Manual check-in by admin

## Database Functions

### Automatic Attendee Count Management
- `increment_event_attendees(event_id)` - Increment count on registration
- `decrement_event_attendees(event_id)` - Decrement count on cancellation
- Trigger automatically updates counts on INSERT/UPDATE/DELETE

### Statistics
- `get_event_registration_stats(event_id)` - Get detailed registration statistics
  - Total registered
  - Confirmed, pending, waitlisted, cancelled
  - Checked in, attended, no-show
  - Payment pending, completed

### Waitlist Processing
- `process_event_waitlist(event_id)` - Move waitlisted to pending when spots open

## Frontend Components

### EventRegistration Class (`shared/event-registration.js`)
- `register(eventId, notes)` - Register for event
- `getRegistration(eventId)` - Get registration status
- `getMyRegistrations(status)` - Get all registrations
- `cancelRegistration(eventId)` - Cancel registration
- `generateQRCodeImage(qrData, size)` - Generate QR code image
- `showRegistrationModal(registration)` - Display registration with QR code
- `createRegistrationButton(event, registration)` - Create smart registration button

## QR Code System

### QR Code Data Structure
```json
{
  "event_id": "uuid",
  "user_id": "uuid",
  "registration_id": "uuid",
  "timestamp": 1234567890,
  "hash": "secure-hash"
}
```

### Security
- SHA-256 hash verification
- Base64 encoding
- Timestamp validation
- Registration ID verification

## Registration Flow

### 1. User Registers
1. Click "Register for Event" button
2. System checks:
   - User is logged in
   - Event is not full
   - Registration deadline not passed
3. Create registration record
4. Generate QR code
5. Update attendee count
6. Show registration modal with QR code

### 2. Payment (if required)
1. Registration status: `pending`
2. Payment status: `pending`
3. After payment:
   - Payment status: `paid`
   - Registration status: `confirmed`
   - QR code activated

### 3. Event Day Check-in
1. User shows QR code
2. Admin scans QR code
3. System verifies:
   - QR code is valid
   - Registration is confirmed
   - Payment is completed (if required)
4. Update attendance status to `checked_in`
5. Record check-in time

## Registration Statuses

### Registration Status
- `pending` - Awaiting payment or confirmation
- `confirmed` - Registration confirmed, can check-in
- `waitlisted` - Event full, on waitlist
- `cancelled` - Registration cancelled

### Attendance Status
- `registered` - Registered but not checked in
- `checked_in` - Checked in at event
- `attended` - Attended full event
- `no_show` - Registered but didn't attend
- `cancelled` - Registration cancelled

### Payment Status
- `pending` - Payment not completed
- `paid` - Payment completed
- `waived` - Free event or payment waived
- `refunded` - Payment refunded

## Setup Instructions

### 1. Run Database Functions
Execute the SQL file in Supabase:
```bash
supabase/09-event-registration-functions.sql
```

### 2. Include Scripts in HTML
```html
<!-- QR Code Library -->
<script src="https://cdn.jsdelivr.net/npm/qrcode@1.5.3/build/qrcode.min.js"></script>

<!-- Event Registration Component -->
<script src="/shared/event-registration.js"></script>
```

### 3. Use in Your Page
```javascript
// Register for event
await window.eventRegistration.register(eventId);

// Get registration status
const registration = await window.eventRegistration.getRegistration(eventId);

// Show registration modal
await window.eventRegistration.showRegistrationModal(registration);

// Create registration button
const button = window.eventRegistration.createRegistrationButton(event, registration);
```

## Admin Check-in Interface

To be implemented:
1. QR code scanner interface
2. Manual check-in form
3. Attendee list with check-in status
4. Real-time attendance statistics

## Future Enhancements

1. **Email Notifications**
   - Registration confirmation
   - QR code delivery
   - Event reminders

2. **Mobile App**
   - Native QR code scanning
   - Offline check-in support
   - Push notifications

3. **Analytics**
   - Registration trends
   - Attendance rates
   - No-show patterns

4. **Certificates**
   - Automatic certificate generation
   - Digital badges
   - Attendance verification

## Testing

### Test Registration Flow
1. Go to Events page
2. Click "Register for Event"
3. Verify registration modal appears with QR code
4. Check database for registration record
5. Verify attendee count incremented

### Test Check-in Flow
1. Get QR code from registration
2. Use check-in endpoint with QR code
3. Verify attendance status updated
4. Check check-in time recorded

## Troubleshooting

### QR Code Not Generating
- Ensure QRCode.js library is loaded
- Check browser console for errors
- Verify registration has qr_code field

### Registration Failing
- Check user is authenticated
- Verify event exists and is open
- Check max_attendees not exceeded
- Review server logs for errors

### Check-in Not Working
- Verify QR code is valid
- Check registration status is confirmed
- Ensure payment completed (if required)
- Review attendance_status field
