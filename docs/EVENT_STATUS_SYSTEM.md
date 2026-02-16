# Event Status System

## Overview
Event status is now **automatically calculated** based on event dates, making it easier for executives to manage events without manually updating status.

## How It Works

### Automatic Status Calculation
The system automatically determines event status based on the current time and event dates:

- **Upcoming**: Current time is before the event start date
- **Live**: Current time is between start date and end date
- **Completed**: Current time is after the event end date

### Manual Status Options
Executives can still manually set these statuses when needed:

- **Draft**: Event is not ready to be published (hidden from public)
- **Cancelled**: Event has been cancelled

### Event Type (Always Manual)
Event type describes the nature of the event and must be set manually:
- Workshop
- Seminar
- Competition
- Hackathon
- Meeting
- Social Event

## For Executives

When creating or editing an event in the CMS:

1. **Set the dates** - Start date and end date
2. **Choose event type** - Workshop, seminar, etc.
3. **Set visibility** - Published (auto status) or Draft/Cancelled
4. **Status is automatic** - The system will show "Upcoming", "Live", or "Completed" based on your dates

## Technical Implementation

### Backend
- `utils/event-status.js` - Status calculation utility
- `routes/events.js` - Enriches events with calculated status
- `routes/admin.js` - Enriches admin event responses

### Frontend
- CMS edit modal simplified to show only Draft/Published/Cancelled
- Status badge automatically reflects calculated status
- Both CMS and public events page show the same calculated status

## Benefits

1. **No manual updates needed** - Status changes automatically as time passes
2. **Consistency** - Same status shown everywhere (CMS, public page, API)
3. **Less errors** - No forgetting to update status after event ends
4. **Simpler workflow** - Executives just set dates and event type
