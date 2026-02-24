const express = require('express');
const router = express.Router();
const { supabaseAdmin: supabase } = require('../lib/supabase');
const { authenticateToken, requireRole } = require('../middleware/auth');
const crypto = require('crypto');

// Helper function to retry database queries
async function retryQuery(queryFn, maxRetries = 3, delay = 1000) {
    for (let i = 0; i < maxRetries; i++) {
        try {
            return await queryFn();
        } catch (error) {
            console.error(`❌ Query attempt ${i + 1} failed:`, error.message);
            if (i === maxRetries - 1) throw error;
            await new Promise(resolve => setTimeout(resolve, delay * (i + 1)));
        }
    }
}

// =============================================
// ELECTION ROUTES
// =============================================

// Test endpoint to verify database connection
router.get('/test', async (req, res) => {
    try {
        console.log('🧪 Testing database connection...');
        const { data, error } = await supabase
            .from('elections')
            .select('id, title')
            .limit(1);
        
        if (error) {
            console.error('❌ Database test failed:', error);
            return res.status(500).json({ error: 'Database connection failed', details: error });
        }
        
        console.log('✅ Database test successful:', data);
        res.json({ success: true, data, message: 'Database connection working' });
    } catch (error) {
        console.error('❌ Test endpoint error:', error);
        res.status(500).json({ error: 'Test failed', details: error.message });
    }
});

// Get all elections
router.get('/', async (req, res) => {
    try {
        console.log('📡 GET /voting - Fetching elections...');
        
        // Validate and sanitize pagination parameters
        let page = parseInt(req.query.page) || 1;
        let limit = parseInt(req.query.limit) || 10;
        const { status = 'all' } = req.query;
        
        // Enforce limits
        page = Math.max(1, page);
        limit = Math.min(100, Math.max(1, limit));
        
        // Validate status parameter
        const validStatuses = ['all', 'active', 'upcoming', 'completed', 'draft'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ error: 'Invalid status parameter' });
        }

        // Use retry mechanism for database query
        const result = await retryQuery(async () => {
            let query = supabase
                .from('elections')
                .select('*')
                .order('start_date', { ascending: false });

            if (status !== 'all') {
                query = query.eq('status', status);
            }

            const offset = (page - 1) * limit;
            const { data: elections, error } = await query.range(offset, offset + limit - 1);

            if (error) throw error;
            
            // Get vote counts and eligible voters for each election
            const electionsWithStats = await Promise.all(elections.map(async (election) => {
                // Count votes for this election
                const { count: votesCount, error: votesError } = await supabase
                    .from('votes')
                    .select('*', { count: 'exact', head: true })
                    .eq('election_id', election.id);
                
                // Count eligible voters for this election
                const { count: eligibleCount, error: eligibleError } = await supabase
                    .from('voter_eligibility')
                    .select('*', { count: 'exact', head: true })
                    .eq('election_id', election.id)
                    .eq('is_eligible', true);
                
                if (votesError) console.error('Error counting votes:', votesError);
                if (eligibleError) console.error('Error counting eligible voters:', eligibleError);
                
                return {
                    ...election,
                    votes_cast: votesCount || 0,
                    total_voters: eligibleCount || 0
                };
            }));
            
            return electionsWithStats;
        });

        // Get total count separately
        const count = await retryQuery(async () => {
            const { count, error } = await supabase
                .from('elections')
                .select('*', { count: 'exact', head: true });
            if (error) throw error;
            return count;
        });

        console.log('✅ Elections fetched:', result?.length || 0, 'Total:', count);
        console.log('📊 Sample election stats:', result?.[0] ? {
            title: result[0].title,
            votes_cast: result[0].votes_cast,
            total_voters: result[0].total_voters
        } : 'No elections');

        res.json({
            elections: result || [],
            pagination: {
                current: parseInt(page),
                total: count ? Math.ceil(count / limit) : 0,
                count: count || 0
            }
        });
    } catch (error) {
        console.error('❌ Error in GET /voting:', {
            message: error.message,
            stack: error.stack,
            timestamp: new Date().toISOString()
        });
        
        res.status(500).json({ 
            error: 'Failed to fetch elections. Please try again later.'
        });
    }
});

// =============================================
// SPECIFIC ID ROUTES (must come before generic /:id route)
// =============================================

// Check vote status
router.get('/:id/vote-status', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;

        const { data: votes, error } = await supabase
            .from('votes')
            .select('position_id')
            .eq('election_id', id)
            .eq('voter_id', req.user.id);

        if (error) throw error;

        res.json({ 
            hasVoted: votes && votes.length > 0, 
            votedPositions: votes?.map(v => v.position_id) || [] 
        });
    } catch (error) {
        console.error('Error checking vote status:', error);
        res.status(500).json({ error: 'Failed to check vote status' });
    }
});

// Get election results
router.get('/:id/results', async (req, res) => {
    console.log(`\n📊 ========== RESULTS REQUEST START ==========`);
    console.log(`📊 Election ID: ${req.params.id}`);
    console.log(`📊 Timestamp: ${new Date().toISOString()}`);
    
    try {
        const { id } = req.params;

        console.log(`📊 Step 1: Fetching election metadata...`);
        const { data: election, error: electionError } = await supabase
            .from('elections')
            .select('results_visible, status, end_date, title, anonymous_voting')
            .eq('id', id)
            .single();

        if (electionError) {
            console.error('❌ Election fetch error:', electionError);
            return res.status(404).json({ error: 'Election not found' });
        }

        console.log(`✅ Election found: ${election.title}`);
        console.log(`   Status: ${election.status}`);
        console.log(`   End Date: ${election.end_date}`);
        console.log(`   Results Visible: ${election.results_visible}`);

        // Allow results if election is completed OR results are explicitly visible
        const now = new Date();
        const isCompleted = election.status === 'completed' || now > new Date(election.end_date);
        
        console.log(`   Is Completed: ${isCompleted}`);
        
        if (!election.results_visible && !isCompleted) {
            console.log('❌ Results not available yet');
            return res.status(403).json({ error: 'Results are not yet available' });
        }

        console.log(`📊 Step 2: Fetching positions...`);
        const { data: positions, error: positionsError } = await supabase
            .from('positions')
            .select('id, title, display_order')
            .eq('election_id', id)
            .order('display_order');

        if (positionsError) {
            console.error('❌ Positions fetch error:', positionsError);
            return res.status(500).json({ error: 'Failed to load positions' });
        }

        console.log(`✅ Found ${positions?.length || 0} positions for election ${id}`);

        // Get candidates with vote counts for each position
        const results = [];
        
        // Handle case where positions is null or empty
        if (!positions || positions.length === 0) {
            console.log('⚠️ No positions found for this election');
            return res.json([]);
        }
        
        console.log(`📊 Step 3: Processing ${positions.length} positions...`);
        for (const position of positions) {
            console.log(`\n  📊 Position: ${position.title} (${position.id})`);
            
            const { data: candidates, error: candidatesError } = await supabase
                .from('candidates')
                .select('id, name')
                .eq('position_id', position.id)
                .eq('is_active', true);

            if (candidatesError) {
                console.error('  ❌ Candidates fetch error:', candidatesError);
                continue;
            }

            console.log(`  ✅ Found ${candidates?.length || 0} candidates`);

            // Handle case where candidates is null or empty
            if (!candidates || candidates.length === 0) {
                console.log(`  ⚠️ No candidates found for position "${position.title}"`);
                continue;
            }

            // Get vote count for each candidate
            for (const candidate of candidates) {
                console.log(`    📊 Counting votes for: ${candidate.name}`);
                
                const { count: voteCount, error: voteError } = await supabase
                    .from('votes')
                    .select('*', { count: 'exact', head: true })
                    .eq('candidate_id', candidate.id);

                if (voteError) {
                    console.error('    ❌ Vote count error for candidate', candidate.name, ':', voteError);
                }

                console.log(`    ✅ ${candidate.name}: ${voteCount || 0} votes`);

                results.push({
                    election_id: id,
                    election_title: election.title,
                    anonymous_voting: election.anonymous_voting,
                    position_id: position.id,
                    position_title: position.title,
                    candidate_id: candidate.id,
                    candidate_name: candidate.name,
                    vote_count: voteCount || 0
                });
            }
        }

        console.log(`\n📊 Step 4: Calculating percentages and sorting...`);
        // Calculate percentages and sort
        const resultsByPosition = {};
        results.forEach(result => {
            if (!resultsByPosition[result.position_id]) {
                resultsByPosition[result.position_id] = [];
            }
            resultsByPosition[result.position_id].push(result);
        });

        // Calculate percentages for each position
        Object.keys(resultsByPosition).forEach(positionId => {
            const positionResults = resultsByPosition[positionId];
            const totalVotes = positionResults.reduce((sum, r) => sum + r.vote_count, 0);
            
            positionResults.forEach(result => {
                result.vote_percentage = totalVotes > 0 
                    ? Math.round((result.vote_count / totalVotes) * 100 * 100) / 100 
                    : 0;
            });

            // Sort by vote count descending
            positionResults.sort((a, b) => b.vote_count - a.vote_count);
        });

        // Flatten back to array
        const finalResults = Object.values(resultsByPosition).flat();

        console.log(`\n✅ Results fetched successfully: ${finalResults.length} records`);
        console.log('📊 Sample results:', JSON.stringify(finalResults.slice(0, 3), null, 2));
        console.log(`📊 ========== RESULTS REQUEST END ==========\n`);
        
        res.json(finalResults);
    } catch (error) {
        console.error('\n❌ ========== RESULTS REQUEST FAILED ==========');
        console.error('❌ Error fetching results:', {
            message: error.message,
            stack: error.stack,
            timestamp: new Date().toISOString()
        });
        console.error('❌ ========================================\n');
        res.status(500).json({ error: 'Failed to fetch results. Please try again later.' });
    }
});

// Get voter participation stats
router.get('/:id/participation', authenticateToken, requireRole(['admin', 'super_admin']), async (req, res) => {
    try {
        const { id } = req.params;

        const { data: stats, error } = await supabase
            .from('voter_participation')
            .select('*')
            .eq('election_id', id)
            .single();

        if (error) throw error;

        res.json(stats);
    } catch (error) {
        console.error('Error fetching participation:', error);
        res.status(500).json({ error: 'Failed to fetch participation stats' });
    }
});

// =============================================
// GENERIC ID ROUTE (must come after specific routes)
// =============================================

// Get single election with positions and candidates
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const { data: election, error: electionError } = await supabase
            .from('elections')
            .select('*')
            .eq('id', id)
            .single();

        if (electionError) throw electionError;
        if (!election) return res.status(404).json({ error: 'Election not found' });

        // Get positions with candidates
        const { data: positions, error: positionsError } = await supabase
            .from('positions')
            .select('*')
            .eq('election_id', id)
            .order('display_order');

        if (positionsError) throw positionsError;

        // Get candidates for each position
        for (let position of positions || []) {
            const { data: candidates, error: candidatesError } = await supabase
                .from('candidates')
                .select('*')
                .eq('position_id', position.id)
                .eq('is_approved', true)
                .eq('is_active', true)
                .order('display_order');

            if (candidatesError) throw candidatesError;
            position.candidates = candidates || [];
        }

        election.positions = positions || [];
        res.json(election);
    } catch (error) {
        console.error('Error fetching election:', error);
        res.status(500).json({ error: 'Failed to fetch election' });
    }
});

// Create new election
router.post('/', authenticateToken, requireRole(['admin', 'super_admin']), async (req, res) => {
    try {
        const {
            title,
            description,
            electionType,
            startDate,
            endDate,
            status = 'draft',
            requireVerification = true,
            anonymousVoting = false,
            positions = []
        } = req.body;

        console.log('📝 Creating election:', { title, electionType, anonymousVoting, positions: positions.length });

        const { data: election, error: electionError } = await supabase
            .from('elections')
            .insert({
                title,
                description,
                election_type: electionType,
                start_date: startDate,
                end_date: endDate,
                status: status,
                require_verification: requireVerification,
                anonymous_voting: anonymousVoting,
                created_by: req.user.id
            })
            .select()
            .single();

        if (electionError) {
            console.error('❌ Election creation error:', electionError);
            throw electionError;
        }

        console.log('✅ Election created:', election.id);

        // Create positions with candidates
        if (positions.length > 0) {
            for (let i = 0; i < positions.length; i++) {
                const pos = positions[i];
                
                // Create position
                const { data: position, error: positionError } = await supabase
                    .from('positions')
                    .insert({
                        election_id: election.id,
                        title: pos.title,
                        description: pos.description || '',
                        max_votes: pos.maxVotes || 1,
                        min_votes: pos.minVotes || 1,
                        display_order: i
                    })
                    .select()
                    .single();

                if (positionError) {
                    console.error('❌ Position creation error:', positionError);
                    throw positionError;
                }

                console.log('✅ Position created:', position.id);

                // Create candidates for this position
                if (pos.candidates && pos.candidates.length > 0) {
                    const candidatesData = pos.candidates.map((cand, idx) => ({
                        position_id: position.id,
                        name: cand.name,
                        bio: cand.bio || '',
                        media_type: cand.media_type || 'text',
                        media_url: cand.media_url || null,
                        thumbnail_url: cand.thumbnail_url || null,
                        display_order: cand.display_order !== undefined ? cand.display_order : idx,
                        is_approved: cand.is_approved !== undefined ? cand.is_approved : true,
                        is_active: cand.is_active !== undefined ? cand.is_active : true
                    }));

                    const { error: candidatesError } = await supabase
                        .from('candidates')
                        .insert(candidatesData);

                    if (candidatesError) {
                        console.error('❌ Candidates creation error:', candidatesError);
                        throw candidatesError;
                    }

                    console.log('✅ Candidates created:', candidatesData.length);
                }
            }
        }

        res.status(201).json(election);
    } catch (error) {
        console.error('❌ Error creating election:', error);
        res.status(500).json({ error: 'Failed to create election', details: error.message });
    }
});

// Update election
router.put('/:id', authenticateToken, requireRole(['admin', 'super_admin']), async (req, res) => {
    try {
        const { id } = req.params;
        const { title, description, startDate, endDate, status, resultsVisible } = req.body;

        const updateData = {};
        if (title) updateData.title = title;
        if (description) updateData.description = description;
        if (startDate) updateData.start_date = startDate;
        if (endDate) updateData.end_date = endDate;
        if (status) updateData.status = status;
        if (resultsVisible !== undefined) updateData.results_visible = resultsVisible;

        const { data: election, error } = await supabase
            .from('elections')
            .update(updateData)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        res.json(election);
    } catch (error) {
        console.error('Error updating election:', error);
        res.status(500).json({ error: 'Failed to update election' });
    }
});

// Delete election
router.delete('/:id', authenticateToken, requireRole(['admin', 'super_admin']), async (req, res) => {
    try {
        const { id } = req.params;

        const { error } = await supabase
            .from('elections')
            .delete()
            .eq('id', id);

        if (error) throw error;
        res.json({ message: 'Election deleted successfully' });
    } catch (error) {
        console.error('Error deleting election:', error);
        res.status(500).json({ error: 'Failed to delete election' });
    }
});

// =============================================
// POSITION ROUTES
// =============================================

// Add position to election
router.post('/:id/positions', authenticateToken, requireRole(['admin', 'super_admin']), async (req, res) => {
    try {
        const { id } = req.params;
        const { title, description, maxVotes = 1, minVotes = 1 } = req.body;

        const { data: position, error } = await supabase
            .from('positions')
            .insert({
                election_id: id,
                title,
                description,
                max_votes: maxVotes,
                min_votes: minVotes
            })
            .select()
            .single();

        if (error) throw error;
        res.status(201).json(position);
    } catch (error) {
        console.error('Error creating position:', error);
        res.status(500).json({ error: 'Failed to create position' });
    }
});

// =============================================
// CANDIDATE ROUTES
// =============================================

// Get candidates for a position
router.get('/:electionId/positions/:positionId/candidates', async (req, res) => {
    try {
        const { positionId } = req.params;

        const { data: candidates, error } = await supabase
            .from('candidates')
            .select('*, users(name, email, avatar_url)')
            .eq('position_id', positionId)
            .eq('is_approved', true)
            .eq('is_active', true)
            .order('display_order');

        if (error) throw error;
        res.json(candidates);
    } catch (error) {
        console.error('Error fetching candidates:', error);
        res.status(500).json({ error: 'Failed to fetch candidates' });
    }
});

// Register as candidate
router.post('/:electionId/positions/:positionId/register', authenticateToken, async (req, res) => {
    try {
        const { electionId, positionId } = req.params;
        const { name, email, bio, manifesto, imageUrl } = req.body;

        // Check if already registered
        const { data: existing } = await supabase
            .from('candidates')
            .select('id')
            .eq('position_id', positionId)
            .eq('user_id', req.user.id)
            .single();

        if (existing) {
            return res.status(400).json({ error: 'Already registered for this position' });
        }

        const { data: candidate, error } = await supabase
            .from('candidates')
            .insert({
                position_id: positionId,
                user_id: req.user.id,
                name: name || req.user.name,
                email: email || req.user.email,
                bio,
                manifesto,
                image_url: imageUrl
            })
            .select()
            .single();

        if (error) throw error;
        res.status(201).json(candidate);
    } catch (error) {
        console.error('Error registering candidate:', error);
        res.status(500).json({ error: 'Failed to register as candidate' });
    }
});

// Approve/reject candidate
router.put('/:electionId/candidates/:candidateId/approve', authenticateToken, requireRole(['admin', 'super_admin']), async (req, res) => {
    try {
        const { candidateId } = req.params;
        const { approved } = req.body;

        const { data: candidate, error } = await supabase
            .from('candidates')
            .update({ is_approved: approved })
            .eq('id', candidateId)
            .select()
            .single();

        if (error) throw error;
        res.json(candidate);
    } catch (error) {
        console.error('Error updating candidate:', error);
        res.status(500).json({ error: 'Failed to update candidate' });
    }
});

// =============================================
// VOTING ROUTES
// =============================================

// Cast vote
router.post('/:id/vote', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const { votes } = req.body; // Array of { positionId, candidateId }

        // Input validation
        if (!Array.isArray(votes) || votes.length === 0) {
            return res.status(400).json({ error: 'Votes must be a non-empty array' });
        }

        // Validate vote structure
        for (const vote of votes) {
            if (!vote.positionId || !vote.candidateId) {
                return res.status(400).json({ 
                    error: 'Each vote must have positionId and candidateId' 
                });
            }
        }

        // Check election status, timing, and anonymity setting
        const { data: election, error: electionError } = await supabase
            .from('elections')
            .select('start_date, end_date, status, anonymous_voting')
            .eq('id', id)
            .single();

        if (electionError) {
            console.error('Election fetch error:', electionError);
            return res.status(404).json({ error: 'Election not found' });
        }

        const now = new Date();
        if (election.status !== 'active' || now < new Date(election.start_date) || now > new Date(election.end_date)) {
            return res.status(400).json({ error: 'Voting is not currently open' });
        }

        // Check eligibility
        const { data: eligibility } = await supabase
            .from('voter_eligibility')
            .select('is_eligible')
            .eq('election_id', id)
            .eq('user_id', req.user.id)
            .single();

        if (!eligibility || !eligibility.is_eligible) {
            return res.status(403).json({ error: 'You are not eligible to vote in this election' });
        }

        // Check if already voted
        if (election.anonymous_voting) {
            // For anonymous voting, check voter_participation table
            const { data: participation } = await supabase
                .from('voter_participation')
                .select('id')
                .eq('election_id', id)
                .eq('user_id', req.user.id)
                .limit(1);

            if (participation && participation.length > 0) {
                return res.status(400).json({ error: 'You have already voted' });
            }
        } else {
            // For non-anonymous voting, check votes table
            const { data: existingVotes } = await supabase
                .from('votes')
                .select('id')
                .eq('election_id', id)
                .eq('voter_id', req.user.id)
                .limit(1);

            if (existingVotes && existingVotes.length > 0) {
                return res.status(400).json({ error: 'You have already voted' });
            }
        }

        // Generate random salt for vote hash
        const salt = crypto.randomBytes(16).toString('hex');
        
        // Cast votes
        const voteRecords = votes.map(vote => ({
            election_id: id,
            position_id: vote.positionId,
            candidate_id: vote.candidateId,
            voter_id: election.anonymous_voting ? null : req.user.id, // NULL for anonymous
            vote_hash: crypto.createHash('sha256')
                .update(`${id}-${vote.positionId}-${req.user.id}-${Date.now()}-${salt}`)
                .digest('hex'),
            ip_address: election.anonymous_voting ? null : req.ip, // NULL for anonymous
            user_agent: election.anonymous_voting ? null : req.get('user-agent') // NULL for anonymous
        }));

        const { data: voteResults, error: voteError } = await supabase
            .from('votes')
            .insert(voteRecords)
            .select();

        if (voteError) {
            console.error('Vote insertion error:', voteError);
            
            // Check for unique constraint violation (duplicate vote)
            if (voteError.code === '23505') {
                return res.status(400).json({ error: 'You have already voted' });
            }
            
            return res.status(500).json({ error: 'Failed to record vote. Please try again.' });
        }

        // If anonymous voting, record participation separately
        if (election.anonymous_voting) {
            const { error: participationError } = await supabase
                .from('voter_participation')
                .insert({
                    election_id: id,
                    user_id: req.user.id,
                    ip_address: req.ip,
                    user_agent: req.get('user-agent')
                });

            if (participationError) {
                console.error('Error recording participation:', participationError);
                // Don't fail the vote if participation recording fails
            }
        }

        console.log(`✅ Vote cast successfully by user ${req.user.id} (anonymous: ${election.anonymous_voting})`);
        res.json({ 
            message: 'Vote cast successfully', 
            voteCount: voteResults.length,
            anonymous: election.anonymous_voting 
        });
    } catch (error) {
        console.error('Error casting vote:', {
            message: error.message,
            stack: error.stack,
            userId: req.user?.id,
            timestamp: new Date().toISOString()
        });
        res.status(500).json({ error: 'Failed to cast vote. Please try again later.' });
    }
});

// =============================================
// VOTER ELIGIBILITY ROUTES
// =============================================

// Add eligible voters
router.post('/:id/eligibility', authenticateToken, requireRole(['admin', 'super_admin']), async (req, res) => {
    try {
        const { id } = req.params;
        const { userIds } = req.body; // Array of user IDs

        const eligibilityRecords = userIds.map(userId => ({
            election_id: id,
            user_id: userId,
            is_eligible: true
        }));

        const { data, error } = await supabase
            .from('voter_eligibility')
            .insert(eligibilityRecords)
            .select();

        if (error) throw error;

        res.status(201).json({ message: 'Voters added', count: data.length });
    } catch (error) {
        console.error('Error adding eligible voters:', error);
        res.status(500).json({ error: 'Failed to add eligible voters' });
    }
});

module.exports = router;
