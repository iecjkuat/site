# Compliance & Security Report

## 1. Data Encryption
- **Transit**: All API communications are performed over HTTPS (when deployed). AWS/Supabase SSL is used.
- **At Rest**: 
  - Database is hosted on Supabase (PostgreSQL), which provides Encryption at Rest by default.
  - User passwords are **hashed** using `bcrypt` (salt rounds: 12) before storage. `auth.js` verifies this.
  - Sensitive configuration (API Keys) is loaded via environment variables (`.env`).

## 2. GDPR & Data Protection
- **Right to Access**: Users can export all their personal data via the Data Export feature in settings (`GET /api/auth/export-data`).
- **Right to be Forgotten**: Users can delete their account permanently via Settings (`DELETE /api/auth/delete-account`).
- **Terms & Privacy**: Dedicated pages (`/terms.html`, `/privacy.html`) outline data usage policies.

## 3. Secure Payment Processing
- **No Card Storage**: The application does **not** store credit card numbers or sensitive banking details.
- **Gateway Integration**: 
  - M-Pesa interactions use the secure STK Push API with OAuth authentication.
  - Transaction integrity is verified by comparing `amount` against database event fees before initiation.
  - Callbacks are verified using request IDs.

## 4. Role-Based Access Control (RBAC)
- **Middleware**: `middleware/auth.js` enforces roles.
  - `authenticateToken`: Verifies JWT validity.
  - `requireRole(['admin', 'executive'])`: Restricts sensitive endpoints.
- **Hierarchy**:
  - `Member`: Basic access.
  - `Executive`: Can manage events/projects.
  - `Admin`: Full system access including analytics and governance.

## 5. Activity Audit Logs
- **Implementation**: `activity_logs` table (SQL Migration `99-audit-logs.sql` provided).
- **Tracking**:
  - Critical actions like Login are logged via `lib/audit.js`.
  - Structure includes `user_id`, `action`, `ip_address`, `user_agent`, and `timestamp`.
  - Admins can view logs via future dashboard integrations (RLS policies configured).

## 6. Backup & Recovery
- **Database**: Relies on Supabase Point-in-Time Recovery (PITR).
- **Disaster Recovery**:
  - Codebase is version controlled (Git).
  - Environment variables are documented in `.env.example`.
  - "Export Data" feature serves as a user-level backup mechanism.

## Recommendations
- **Cookie Consent**: Consider adding a frontend banner if tracking cookies are added (currently mainly using LocalStorage/JWT which is essential for function).
- **Rotation**: Regularly rotate `JWT_SECRET` and M-Pesa keys.
