# Complete Voting Flow Documentation

## Overview
This document explains the complete voting process from when a user clicks "Submit My Vote" to how votes are stored in the database.

---

## 1. FRONTEND: User Interaction (pages/voting/voting.js)

### Step 1: User Selects Candidates
- User navigates to the voting portal (`/pages/voting/voting.html`)
- System loads all active elections from API endpoint: `GET /api/v1/voting`
- User clicks on an election card to view the ballot
- System fetches election details: `GET /api/v1/voting/:id`
- User sees positions (e.g., President, Vice President) with candidates
- User clicks on candidate cards to select them (one per position)
- Each selection adds `.selected` class to the card
- Selection counter updates: "X of Y positions selected"
- "Submit My Vote" button becomes enabled when at least one selection is made

### Step 2: User Clicks "Submit My Vote"
```javascript
// Button click triggers confirmAndSubmitVote()
document.getElementById('submitVoteBtn')?.addEventListener('click', () => {
    this.confirmAndSubmitVote(election.id);
});
```

### Step 3: Confirmation Modal
- A confirmation modal appears asking: "Are you sure you want to submit your vote? This action cannot be undone."
- User has two options:
  - **Cancel**: Modal closes, no action taken
  - **Confirm**: Proceeds to vote submission

### Step 4: Vote Submission
```javascript
async submitVote(electionId) {
    // 1. Collect all selected candidates
    const selectedCandidates = [];
    document.querySelectorAll('.candidate-card.selected').forEach(card => {
        selectedCandidates.push({
            positionId: card.dataset.positionId,
            candidateId: card.dataset.candidateId
        });
    });

    // 2. Validate at least one selection
    if (selectedCandidates.length === 0) {
        this.showError('Please select at least one candidate');
        return;
    }

    // 3. Send POST request to backend
    const response = await fetch(`${this.apiBase}/voting/${electionId}/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ votes: selectedCandidates })
    });

    // 4. Handle response
    if (response.ok) {
        this.showSuccess('Vote submitted successfully!');
        setTimeout(() => this.showListView(), 2000);
    } else {
        const error = await response.json();
        this.showError(error.error);
    }
}
```

**Request Payload Example:**
```json
{
  "votes": [
    {
      "positionId": "uuid-of-president-position",
      "candidateId": "uuid-of-selected-candidate"
    },
    {
      "positionId": "uuid-of-vp-position",
      "candidateId": "uuid-of-selected-candidate"
    }
  ]
}
```

---

## 2. BACKEND: Vote Processing (routes/voting.js)

### Step 1: Authentication Check
```javascript
router.post('/:id/vote', authenticateToken, async (req, res) => {
```
- Middleware `authenticateToken` verifies the user's JWT token
- Extracts user information from token: `req.user.id`
- If token is invalid/expired, returns 401 Unauthorized

### Step 2: Election Validation
```javascript
// Check election status and timing
const { data: election, error: electionError } = await supabase
    .from('elections')
    .select('start_date, end_date, status')
    .eq('id', id)
    .single();

const now = new Date();
if (election.status !== 'active' || 
    now < new Date(election.start_date) || 
    now > new Date(election.end_date)) {
    return res.status(400).json({ error: 'Voting is not currently open' });
}
```
**Checks:**
- Election exists
- Election status is 'active'
- Current time is between start_date and end_date
- Returns 400 error if any check fails

### Step 3: Voter Eligibility Check
```javascript
const { data: eligibility } = await supabase
    .from('voter_eligibility')
    .select('is_eligible')
    .eq('election_id', id)
    .eq('user_id', req.user.id)
    .single();

if (!eligibility || !eligibility.is_eligible) {
    return res.status(403).json({ error: 'You are not eligible to vote in this election' });
}
```
**Checks:**
- User has a record in `voter_eligibility` table
- `is_eligible` flag is true
- Returns 403 Forbidden if not eligible

### Step 4: Duplicate Vote Prevention
```javascript
const { data: existingVotes } = await supabase
    .from('votes')
    .select('id')
    .eq('election_id', id)
    .eq('voter_id', req.user.id)
    .limit(1);

if (existingVotes && existingVotes.length > 0) {
    return res.status(400).json({ error: 'You have already voted' });
}
```
**Checks:**
- Queries votes table for any existing votes by this user in this election
- Returns 400 error if user has already voted
- Prevents double voting

### Step 5: Vote Recording
```javascript
// Create vote records
const voteRecords = votes.map(vote => ({
    election_id: id,
    position_id: vote.positionId,
    candidate_id: vote.candidateId,
    voter_id: req.user.id,
    vote_hash: crypto.createHash('sha256')
        .update(`${id}-${vote.positionId}-${req.user.id}-${Date.now()}`)
        .digest('hex'),
    ip_address: req.ip,
    user_agent: req.get('user-agent')
}));

// Insert into database
const { data: voteResults, error: voteError } = await supabase
    .from('votes')
    .insert(voteRecords)
    .select();

if (voteError) throw voteError;

res.json({ message: 'Vote cast successfully', voteCount: voteResults.length });
```

**What Gets Stored:**
- `election_id`: Which election this vote is for
- `position_id`: Which position (President, VP, etc.)
- `candidate_id`: Which candidate was selected
- `voter_id`: Who cast the vote (for tracking, not anonymity)
- `vote_hash`: Unique hash for vote verification
- `ip_address`: IP address of voter (for security)
- `user_agent`: Browser/device information (for security)
- `created_at`: Timestamp of when vote was cast

---

## 3. DATABASE: Vote Storage (supabase/36-create-voting-tables.sql)

### Votes Table Schema
```sql
CREATE TABLE votes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    election_id UUID NOT NULL REFERENCES elections(id) ON DELETE CASCADE,
    position_id UUID NOT NULL REFERENCES positions(id) ON DELETE CASCADE,
    candidate_id UUID NOT NULL REFERENCES candidates(id) ON DELETE CASCADE,
    voter_id UUID NOT NULL REFERENCES users(id),
    
    -- Vote Info
    vote_hash VARCHAR(255),
    ip_address VARCHAR(45),
    user_agent TEXT,
    
    -- Metadata
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Prevent duplicate votes
    UNIQUE(election_id, position_id, voter_id, candidate_id)
);
```

### Database Constraints
1. **Foreign Keys**: Ensure referential integrity
   - election_id must exist in elections table
   - position_id must exist in positions table
   - candidate_id must exist in candidates table
   - voter_id must exist in users table

2. **Unique Constraint**: Prevents duplicate votes
   - Combination of (election_id, position_id, voter_id, candidate_id) must be unique
   - Database-level protection against double voting

3. **Cascade Delete**: If election is deleted, all votes are deleted

---

## 4. ANONYMITY vs NON-ANONYMITY

### Current Implementation: NON-ANONYMOUS
The current system stores `voter_id` with each vote, making it **non-anonymous**. This means:

**Advantages:**
- ✅ Can verify who voted
- ✅ Can prevent duplicate voting
- ✅ Can audit votes if needed
- ✅ Can show "You voted for X" to users
- ✅ Can detect fraud or manipulation

**Disadvantages:**
- ❌ Votes can be traced back to individuals
- ❌ No ballot secrecy
- ❌ Potential for coercion or vote buying
- ❌ Privacy concerns

### How to Make It Anonymous

To implement anonymous voting, you would need to:

#### Option 1: Remove voter_id After Validation
```javascript
// 1. Check eligibility and duplicate voting
// 2. Insert vote WITHOUT voter_id
const voteRecords = votes.map(vote => ({
    election_id: id,
    position_id: vote.positionId,
    candidate_id: vote.candidateId,
    // voter_id: req.user.id,  // REMOVED for anonymity
    vote_hash: crypto.createHash('sha256')
        .update(`${id}-${vote.positionId}-${Date.now()}-${Math.random()}`)
        .digest('hex'),
    created_at: new Date()
}));

// 3. Mark user as "has voted" in separate table
await supabase.from('voter_participation').insert({
    election_id: id,
    user_id: req.user.id,
    voted_at: new Date()
});
```

#### Option 2: Use Cryptographic Techniques
- Implement blind signatures
- Use homomorphic encryption
- Implement zero-knowledge proofs
- More complex but provides mathematical anonymity guarantees

#### Recommended Approach: Hybrid System
```sql
-- Separate table to track who voted (not what they voted)
CREATE TABLE voter_participation (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    election_id UUID NOT NULL REFERENCES elections(id),
    user_id UUID NOT NULL REFERENCES users(id),
    voted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(election_id, user_id)
);

-- Votes table WITHOUT voter_id
CREATE TABLE votes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    election_id UUID NOT NULL REFERENCES elections(id),
    position_id UUID NOT NULL REFERENCES positions(id),
    candidate_id UUID NOT NULL REFERENCES candidates(id),
    -- NO voter_id field
    vote_hash VARCHAR(255) UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Benefits:**
- ✅ Can prevent duplicate voting (check voter_participation)
- ✅ Votes are anonymous (no voter_id in votes table)
- ✅ Can verify someone voted, but not what they voted for
- ✅ Maintains ballot secrecy

---

## 5. VOTE COUNTING & RESULTS

### Getting Results
```javascript
router.get('/:id/results', async (req, res) => {
    // Count votes per candidate
    const { data: results } = await supabase
        .from('votes')
        .select('candidate_id, candidates(name), COUNT(*)')
        .eq('election_id', id)
        .group('candidate_id');
    
    res.json({ results });
});
```

### Results View (election_results)
The database includes a helper view:
```sql
CREATE VIEW election_results AS
SELECT 
    e.id as election_id,
    e.title as election_title,
    p.id as position_id,
    p.title as position_title,
    c.id as candidate_id,
    c.name as candidate_name,
    COUNT(v.id) as vote_count,
    ROUND(COUNT(v.id) * 100.0 / NULLIF(SUM(COUNT(v.id)) OVER (PARTITION BY p.id), 0), 2) as vote_percentage
FROM elections e
JOIN positions p ON p.election_id = e.id
JOIN candidates c ON c.position_id = p.id
LEFT JOIN votes v ON v.candidate_id = c.id
GROUP BY e.id, e.title, p.id, p.title, c.id, c.name
ORDER BY e.id, p.display_order, vote_count DESC;
```

---

## 6. SECURITY MEASURES

### Current Security Features
1. **Authentication Required**: JWT token validation
2. **Eligibility Check**: Only eligible voters can vote
3. **Duplicate Prevention**: Database constraint + application logic
4. **Time Window Validation**: Only during election period
5. **Vote Hash**: Unique identifier for each vote
6. **IP & User Agent Logging**: For fraud detection
7. **HTTPS**: All communication encrypted (in production)

### Potential Security Enhancements
1. **Rate Limiting**: Prevent spam/DOS attacks
2. **CAPTCHA**: Prevent bot voting
3. **Two-Factor Authentication**: Extra verification
4. **Audit Logs**: Track all voting attempts
5. **Blockchain**: Immutable vote records
6. **End-to-End Encryption**: Encrypt votes in transit and at rest

---

## 7. COMPLETE FLOW DIAGRAM

```
USER CLICKS "SUBMIT MY VOTE"
         ↓
[Frontend] Collect selected candidates
         ↓
[Frontend] Show confirmation modal
         ↓
[Frontend] POST /api/v1/voting/:id/vote
         ↓
[Backend] Verify JWT token → req.user.id
         ↓
[Backend] Check election is active & within time window
         ↓
[Backend] Check user is eligible to vote
         ↓
[Backend] Check user hasn't already voted
         ↓
[Backend] Create vote records with:
         - election_id
         - position_id
         - candidate_id
         - voter_id (for non-anonymous)
         - vote_hash
         - ip_address
         - user_agent
         - timestamp
         ↓
[Database] Insert into votes table
         ↓
[Database] Enforce UNIQUE constraint
         ↓
[Backend] Return success response
         ↓
[Frontend] Show success message
         ↓
[Frontend] Redirect to elections list
```

---

## 8. ERROR HANDLING

### Possible Errors & Responses

| Error | HTTP Code | Message | Cause |
|-------|-----------|---------|-------|
| Invalid Token | 401 | Unauthorized | JWT token missing/invalid |
| Not Eligible | 403 | You are not eligible to vote | User not in voter_eligibility |
| Already Voted | 400 | You have already voted | Duplicate vote attempt |
| Election Closed | 400 | Voting is not currently open | Election not active or outside time window |
| No Selection | 400 | Please select at least one candidate | Frontend validation failed |
| Server Error | 500 | Failed to cast vote | Database error or server issue |

---

## 9. TESTING THE FLOW

### Manual Testing Steps
1. Login as a user
2. Navigate to voting portal
3. Click on an active election
4. Select candidates for each position
5. Click "Submit My Vote"
6. Confirm in modal
7. Verify success message
8. Try to vote again (should fail with "already voted")
9. Check database to see vote records

### Database Queries for Verification
```sql
-- Check if user voted
SELECT * FROM votes WHERE voter_id = 'user-uuid' AND election_id = 'election-uuid';

-- Count votes per candidate
SELECT c.name, COUNT(v.id) as votes
FROM candidates c
LEFT JOIN votes v ON v.candidate_id = c.id
WHERE c.position_id = 'position-uuid'
GROUP BY c.id, c.name;

-- Check voter participation
SELECT u.email, v.created_at
FROM votes v
JOIN users u ON u.id = v.voter_id
WHERE v.election_id = 'election-uuid';
```

---

## Summary

The voting system is a **non-anonymous** system that:
1. Authenticates users via JWT
2. Validates eligibility and prevents duplicate voting
3. Stores votes with voter_id for full traceability
4. Provides security through multiple validation layers
5. Can be converted to anonymous by separating voter tracking from vote content

For true anonymity, implement the hybrid approach with a separate `voter_participation` table and remove `voter_id` from the votes table.
