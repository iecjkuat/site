# Project Fixes TODO - BLACKBOXAI Implementation

## Approved Plan Progress
✅ **Plan Approved** - User confirmed "approved"


✅ Dependencies installed: cookie-parser express-session connect-pg-simple
✅ Session table migration: supabase/47-create-session-table.sql
- [ ] 2. middleware/auth.js: Update to validate cookies
- [ ] 3. pages/shared/auth.js (NEW): Client cookie helpers
- [ ] 4. Global localStorage → getAuthCookie()
- [ ] 5. server.js: CSP nonce/hashes

**PHASE 2: Refactoring - 0/3 COMPLETE**
- [ ] server.js split
- [ ] dashboard.js extract modules
- [ ] utils/logger.js

**PHASE 3: Cleanup - 0/3 COMPLETE**
- [ ] Remove mock users
- [ ] Remove console.logs
- [ ] Add loading states

**POST-IMPLEMENTATION**
- [ ] npm i deps
- [ ] Test login flow
- [ ] Security audit

*Updated after each step*
