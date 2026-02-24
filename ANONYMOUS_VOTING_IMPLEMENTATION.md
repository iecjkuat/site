# Anonymous Voting Implementation

## Status: ✅ FULLY IMPLEMENTED

The "Anonymous voting" checkbox in the vote creator is now **fully functional**.

---

## What Was Fixed

### 1. **Database Schema** (`supabase/43-add-anonymous-voting-support.sql`)
- ✅ Added `anonymous_voting` column to `elections` table
- ✅ Created `voter_participation` table to track who voted (not what they voted)
- ✅ Made `voter_id` nullable in `votes` table
- ✅ Updated constraints and indexes to support anonymous votes
- ✅ Updated views (`election_results`, `voter_participation`) to work with both modes

### 2. **Frontend** (`pages/cms/modules/cms-manager.js`)
- ✅ Added `anonymousVoting` field to election data sent to backend
- ✅ Checkbox value is now properly captured and transmitted

### 3. **Backend API** (`routes/voting.js`)
- ✅ Election creation endpoint accepts `anonymousVoting` parameter
- ✅ Stores `anonymous_voting` flag in database
- ✅ Vote casting logic checks if election is anonymous
- ✅ For anonymous votes: stores votes WITHOUT `voter_id`, `ip_address`, `user_agent`
- ✅ For anonymous votes: records participation in separate table
- ✅ Duplicate vote prevention works for both modes

---

## How It Works

### Creating an Anonymous Election

**Admin Action:**
1. Opens vote creator modal
2. Checks "Anonymous voting" checkbox
3. Fills in other details and creates vote

**What Happens:**
```javascript
// Frontend sends:
{
  "anonymousVoting": true,
  "title": "Best Project Vote",
  // ... other fields
}

// Backend stores in elections table:
{
  "anonymous_voting": true,
  // ... other fields
}
```

### Casting an Anonymous Vote

**User Action:**
1. Selects candidates
2. Clicks "Submit My Vote"
3. Confirms submission

**Backend Logic:**
```javascript
// 1. Check if election is anonymous
const election = await getElection(id);

if (election.anonymous_voting) {
    // 2. Check voter_participation table for duplicates
    const hasVoted = await checkParticipation(election_id, user_id);
    
    if (hasVoted) {
        return error('You have already voted');
    }
    
    // 3. Store votes WITHOUT voter_id
    await insertVotes({
        election_id,
        position_id,
        candidate_id,
        voter_id: null,        // ← NULL for anonymity
        ip_address: null,      // ← NULL for anonymity
        user_agent: null       // ← NULL for anonymity
    });
    
    // 4. Record participation separately
    await insertParticipation({
        election_id,
        user_id,
        voted_at: now()
    });
} else {
    // Non-anonymous: store with voter_id
    await insertVotes({
        election_id,
        position_id,
        candidate_id,
        voter_id: user_id,     // ← Stored for traceability
        ip_address,
        user_agent
    });
}
```

---

## Database Structure

### Anonymous Voting Tables

#### `elections` table
```sql
CREATE TABLE elections (
    id UUID PRIMARY KEY,
    title VARCHAR(255),
    anonymous_voting BOOLEAN DEFAULT false,  -- ← NEW FIELD
    -- ... other fields
);
```

#### `votes` table (modified)
```sql
CREATE TABLE votes (
    id UUID PRIMARY KEY,
    election_id UUID,
    position_id UUID,
    candidate_id UUID,
    voter_id UUID,  -- ← NOW NULLABLE (NULL for anonymous votes)
    vote_hash VARCHAR(255),
    ip_address VARCHAR(45),  -- ← NULL for anonymous votes
    user_agent TEXT,         -- ← NULL for anonymous votes
    created_at TIMESTAMP
);
```

#### `voter_participation` table (new)
```sql
CREATE TABLE voter_participation (
    id UUID PRIMARY KEY,
    election_id UUID,
    user_id UUID,
    voted_at TIMESTAMP,
    ip_address VARCHAR(45),
    user_agent TEXT,
    UNIQUE(election_id, user_id)  -- ← Prevents duplicate voting
);
```

---

## Comparison: Anonymous vs Non-Anonymous

### Non-Anonymous Voting (anonymous_voting = false)

**Votes Table:**
```
| id   | election_id | position_id | candidate_id | voter_id | ip_address  |
|------|-------------|-------------|--------------|----------|-------------|
| v1   | e1          | p1          | c1           | user123  | 192.168.1.1 |
| v2   | e1          | p2          | c3           | user123  | 192.168.1.1 |
```

**Characteristics:**
- ✅ Can see who voted for whom
- ✅ Full audit trail
- ✅ Can verify individual votes
- ❌ No ballot secrecy
- ❌ Potential for coercion

### Anonymous Voting (anonymous_voting = true)

**Votes Table:**
```
| id   | election_id | position_id | candidate_id | voter_id | ip_address |
|------|-------------|-------------|--------------|----------|------------|
| v1   | e1          | p1          | c1           | NULL     | NULL       |
| v2   | e1          | p2          | c3           | NULL     | NULL       |
```

**Voter Participation Table:**
```
| id   | election_id | user_id | voted_at            |
|------|-------------|---------|---------------------|
| vp1  | e1          | user123 | 2026-02-24 10:30:00 |
```

**Characteristics:**
- ✅ Ballot secrecy maintained
- ✅ Cannot trace votes to individuals
- ✅ Can verify someone voted (but not what they voted)
- ✅ Prevents duplicate voting
- ❌ Cannot audit individual votes
- ❌ Cannot show "You voted for X" to users

---

## Security Features

### Duplicate Vote Prevention

**Anonymous Elections:**
1. Check `voter_participation` table for `(election_id, user_id)` record
2. If exists → reject vote
3. If not exists → allow vote and create participation record

**Non-Anonymous Elections:**
1. Check `votes` table for any vote with `(election_id, voter_id)`
2. If exists → reject vote
3. If not exists → allow vote

### Data Stored for Security

**Anonymous Elections:**
- Participation tracking: `user_id`, `ip_address`, `user_agent` in `voter_participation`
- Vote records: NO identifying information

**Non-Anonymous Elections:**
- Everything: `voter_id`, `ip_address`, `user_agent` in `votes` table

---

## Testing the Feature

### 1. Create Anonymous Election
```bash
# In CMS, create a vote with:
- Title: "Test Anonymous Vote"
- ✅ Check "Anonymous voting"
- Add options
- Set to "Active"
```

### 2. Cast Vote as User
```bash
# Login as regular user
# Navigate to voting portal
# Select candidates
# Submit vote
```

### 3. Verify in Database
```sql
-- Check election is anonymous
SELECT id, title, anonymous_voting FROM elections WHERE title = 'Test Anonymous Vote';

-- Check votes have NULL voter_id
SELECT * FROM votes WHERE election_id = 'election-uuid';
-- Should show: voter_id = NULL, ip_address = NULL, user_agent = NULL

-- Check participation was recorded
SELECT * FROM voter_participation WHERE election_id = 'election-uuid';
-- Should show: user_id, voted_at

-- Try to vote again (should fail)
-- Error: "You have already voted"
```

### 4. View Results
```sql
-- Results should show vote counts without revealing voters
SELECT * FROM election_results WHERE election_id = 'election-uuid';
```

---

## Migration Steps

To enable this feature in your database:

1. **Run the SQL migration:**
   ```bash
   # In Supabase SQL Editor, run:
   supabase/43-add-anonymous-voting-support.sql
   ```

2. **Restart your backend server** (if needed)

3. **Test the feature:**
   - Create a new vote with anonymous voting enabled
   - Cast a vote as a user
   - Verify votes are anonymous in database

---

## API Changes

### Create Election Endpoint
**Before:**
```json
POST /api/v1/voting
{
  "title": "Election",
  "electionType": "general",
  // ... other fields
}
```

**After:**
```json
POST /api/v1/voting
{
  "title": "Election",
  "electionType": "general",
  "anonymousVoting": true,  // ← NEW FIELD
  // ... other fields
}
```

### Vote Casting Response
**Before:**
```json
{
  "message": "Vote cast successfully",
  "voteCount": 2
}
```

**After:**
```json
{
  "message": "Vote cast successfully",
  "voteCount": 2,
  "anonymous": true  // ← NEW FIELD
}
```

---

## Summary

✅ **The anonymous voting checkbox now works!**

When checked:
- Votes are stored WITHOUT `voter_id`
- Participation is tracked separately
- Ballot secrecy is maintained
- Duplicate voting is still prevented
- Results show vote counts without revealing voters

When unchecked:
- Traditional voting with full traceability
- All voter information is stored
- Can audit individual votes
