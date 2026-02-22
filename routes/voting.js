const express = require('express');
const router = express.Router();
const { supabaseAdmin: supabase } = require('../lib/supabase');
const { authenticateToken, requireRole } = require('../middleware/auth');
const crypto = require('crypto');

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
        const { status = 'all', page = 1, limit = 10 } = req.query;

        // Simple direct query
        let query = supabase
            .from('elections')
            .select('*')
            .order('start_date', { ascending: false });

        if (status !== 'all') {
            query = query.eq('status', status);
        }

        const offset = (page - 1) * limit;
        const { data: elections, error } = await query.range(offset, offset + limit - 1);

        if (error) {
            console.error('❌ Supabase error:', error);
            return res.status(500).json({ error: 'Database query failed', details: error });
        }

        // Get total count separately
        const { count, error: countError } = await supabase
            .from('elections')
            .select('*', { count: 'exact', head: true });

        console.log('✅ Elections fetched:', elections?.length || 0, 'Total:', count);

        res.json({
            elections: elections || [],
            pagination: {
                current: parseInt(page),
                total: count ? Math.ceil(count / limit) : 0,
                count: count || 0
            }
        });
    } catch (error) {
        console.error('❌ Error in GET /voting:', error);
        res.status(500).json({ error: 'Failed to fetch elections', details: error.message });
    }
});

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
            positions = []
        } = req.body;

        console.log('📝 Creating election:', { title, electionType, positions: positions.length });

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

        // Check election status and timing
        const { data: election, error: electionError } = await supabase
            .from('elections')
            .select('start_date, end_date, status')
            .eq('id', id)
            .single();

        if (electionError) throw electionError;

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
        const { data: existingVotes } = await supabase
            .from('votes')
            .select('id')
            .eq('election_id', id)
            .eq('voter_id', req.user.id)
            .limit(1);

        if (existingVotes && existingVotes.length > 0) {
            return res.status(400).json({ error: 'You have already voted' });
        }

        // Cast votes
        const voteRecords = votes.map(vote => ({
            election_id: id,
            position_id: vote.positionId,
            candidate_id: vote.candidateId,
            voter_id: req.user.id,
            vote_hash: crypto.createHash('sha256').update(`${id}-${vote.positionId}-${req.user.id}-${Date.now()}`).digest('hex'),
            ip_address: req.ip,
            user_agent: req.get('user-agent')
        }));

        const { data: voteResults, error: voteError } = await supabase
            .from('votes')
            .insert(voteRecords)
            .select();

        if (voteError) throw voteError;

        res.json({ message: 'Vote cast successfully', voteCount: voteResults.length });
    } catch (error) {
        console.error('Error casting vote:', error);
        res.status(500).json({ error: 'Failed to cast vote' });
    }
});

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

// =============================================
// RESULTS ROUTES
// =============================================

// Get election results
router.get('/:id/results', async (req, res) => {
    try {
        const { id } = req.params;

        const { data: election, error: electionError } = await supabase
            .from('elections')
            .select('results_visible, status')
            .eq('id', id)
            .single();

        if (electionError) throw electionError;

        if (!election.results_visible && election.status !== 'completed') {
            return res.status(403).json({ error: 'Results not yet available' });
        }

        // Use the election_results view
        const { data: results, error } = await supabase
            .from('election_results')
            .select('*')
            .eq('election_id', id)
            .order('position_id')
            .order('rank');

        if (error) throw error;

        res.json(results);
    } catch (error) {
        console.error('Error fetching results:', error);
        res.status(500).json({ error: 'Failed to fetch results' });
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
