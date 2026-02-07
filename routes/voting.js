const express = require('express');
const router = express.Router();
const { supabaseAdmin: supabase } = require('../lib/supabase');
const { authenticateToken, requireRole } = require('../middleware/auth');
const crypto = require('crypto');

// =============================================
// VOTING ROUTES
// =============================================

// Get all votes
router.get('/', async (req, res) => {
    try {
        const { 
            status = 'all', 
            type,
            page = 1, 
            limit = 10 
        } = req.query;

        let query = supabase
            .from('elections')
            .select(`
                *,
                users!elections_created_by_fkey(name, email),
                election_positions(count)
            `)
            .order('start_date', { ascending: false });

        // Apply filters
        if (status !== 'all') {
            query = query.eq('status', status);
        }

        if (type) {
            query = query.eq('election_type', type);
        }

        // Pagination
        const offset = (page - 1) * limit;
        query = query.range(offset, offset + limit - 1);

        const { data: elections, error, count } = await query;

        if (error) throw error;

        // Get position counts for each election
        for (let election of elections) {
            const { count: positionCount } = await supabase
                .from('election_positions')
                .select('*', { count: 'exact', head: true })
                .eq('election_id', election.id);
            
            election.position_count = positionCount || 0;
        }

        res.json({
            votes: elections,
            pagination: {
                current: parseInt(page),
                total: Math.ceil(count / limit),
                count: count
            }
        });
    } catch (error) {
        console.error('Error fetching elections:', error);
        res.status(500).json({ error: 'Failed to fetch elections' });
    }
});

// Get single election with full details
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const { data: election, error } = await supabase
            .from('elections')
            .select(`
                *,
                users!elections_created_by_fkey(name, email),
                election_positions(
                    *,
                    election_candidates(
                        *,
                        users(name, email, avatar_url)
                    )
                )
            `)
            .eq('id', id)
            .single();

        if (error) throw error;

        if (!election) {
            return res.status(404).json({ error: 'Election not found' });
        }

        res.json(election);
    } catch (error) {
        console.error('Error fetching election:', error);
        res.status(500).json({ error: 'Failed to fetch election' });
    }
});

// Create new election
router.post('/', authenticateToken, requireRole(['admin']), async (req, res) => {
    try {
        const {
            title,
            description,
            electionType,
            startDate,
            endDate,
            nominationStart,
            nominationEnd,
            campaignStart,
            campaignEnd,
            positions = []
        } = req.body;

        // Create election
        const { data: election, error: electionError } = await supabase
            .from('elections')
            .insert({
                title,
                description,
                election_type: electionType,
                start_date: startDate,
                end_date: endDate,
                nomination_start: nominationStart,
                nomination_end: nominationEnd,
                campaign_start: campaignStart,
                campaign_end: campaignEnd,
                created_by: req.user.id
            })
            .select()
            .single();

        if (electionError) throw electionError;

        // Create positions
        if (positions.length > 0) {
            const positionsData = positions.map((pos, index) => ({
                election_id: election.id,
                position_name: pos.name,
                description: pos.description,
                max_candidates: pos.maxCandidates || 10,
                max_winners: pos.maxWinners || 1,
                display_order: index
            }));

            const { error: positionsError } = await supabase
                .from('election_positions')
                .insert(positionsData);

            if (positionsError) throw positionsError;
        }

        res.status(201).json(election);
    } catch (error) {
        console.error('Error creating election:', error);
        res.status(500).json({ error: 'Failed to create election' });
    }
});

// Update election
router.put('/:id', authenticateToken, requireRole(['admin']), async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = { ...req.body, updated_at: new Date().toISOString() };

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

// =============================================
// CANDIDATE ROUTES
// =============================================

// Get candidates for an election
router.get('/:id/candidates', async (req, res) => {
    try {
        const { id } = req.params;
        const { position } = req.query;

        let query = supabase
            .from('election_candidates')
            .select(`
                *,
                users(name, email, avatar_url, student_id),
                election_positions(position_name, description)
            `)
            .eq('election_id', id)
            .eq('status', 'approved')
            .order('position_id');

        if (position) {
            query = query.eq('position_id', position);
        }

        const { data: candidates, error } = await query;

        if (error) throw error;

        res.json(candidates);
    } catch (error) {
        console.error('Error fetching candidates:', error);
        res.status(500).json({ error: 'Failed to fetch candidates' });
    }
});

// Submit nomination
router.post('/:id/nominate', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const {
            positionId,
            manifesto,
            qualifications,
            experience,
            photoUrl
        } = req.body;

        // Check if election is in nomination period
        const { data: election, error: electionError } = await supabase
            .from('elections')
            .select('nomination_start, nomination_end, status')
            .eq('id', id)
            .single();

        if (electionError) throw electionError;

        const now = new Date();
        const nominationStart = new Date(election.nomination_start);
        const nominationEnd = new Date(election.nomination_end);

        if (now < nominationStart || now > nominationEnd) {
            return res.status(400).json({ error: 'Nomination period is not active' });
        }

        // Check if user already nominated for this position
        const { data: existingNomination } = await supabase
            .from('election_candidates')
            .select('id')
            .eq('election_id', id)
            .eq('position_id', positionId)
            .eq('user_id', req.user.id)
            .single();

        if (existingNomination) {
            return res.status(400).json({ error: 'You have already nominated for this position' });
        }

        const { data: candidate, error } = await supabase
            .from('election_candidates')
            .insert({
                election_id: id,
                position_id: positionId,
                user_id: req.user.id,
                manifesto,
                qualifications,
                experience,
                photo_url: photoUrl
            })
            .select()
            .single();

        if (error) throw error;

        res.status(201).json(candidate);
    } catch (error) {
        console.error('Error submitting nomination:', error);
        res.status(500).json({ error: 'Failed to submit nomination' });
    }
});

// Approve/Reject candidate
router.put('/:electionId/candidates/:candidateId/status', authenticateToken, requireRole(['admin']), async (req, res) => {
    try {
        const { candidateId } = req.params;
        const { status } = req.body;

        const { data: candidate, error } = await supabase
            .from('election_candidates')
            .update({ status })
            .eq('id', candidateId)
            .select()
            .single();

        if (error) throw error;

        res.json(candidate);
    } catch (error) {
        console.error('Error updating candidate status:', error);
        res.status(500).json({ error: 'Failed to update candidate status' });
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

        // Check if election is in voting period
        const { data: election, error: electionError } = await supabase
            .from('elections')
            .select('start_date, end_date, status')
            .eq('id', id)
            .single();

        if (electionError) throw electionError;

        const now = new Date();
        const startDate = new Date(election.start_date);
        const endDate = new Date(election.end_date);

        if (now < startDate || now > endDate || election.status !== 'voting_open') {
            return res.status(400).json({ error: 'Voting is not currently open' });
        }

        // Check if user has already voted
        const { data: existingVotes } = await supabase
            .from('election_votes')
            .select('position_id')
            .eq('election_id', id)
            .eq('voter_id', req.user.id);

        if (existingVotes && existingVotes.length > 0) {
            return res.status(400).json({ error: 'You have already voted in this election' });
        }

        // Create vote records
        const voteRecords = votes.map(vote => {
            const voteHash = crypto.createHash('sha256')
                .update(`${id}-${vote.positionId}-${req.user.id}-${Date.now()}`)
                .digest('hex');

            return {
                election_id: id,
                position_id: vote.positionId,
                candidate_id: vote.candidateId,
                voter_id: req.user.id,
                vote_hash: voteHash
            };
        });

        const { data: voteResults, error: voteError } = await supabase
            .from('election_votes')
            .insert(voteRecords)
            .select();

        if (voteError) throw voteError;

        res.json({ message: 'Votes cast successfully', voteCount: voteResults.length });
    } catch (error) {
        console.error('Error casting vote:', error);
        res.status(500).json({ error: 'Failed to cast vote' });
    }
});

// Check if user has voted
router.get('/:id/vote-status', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;

        const { data: votes, error } = await supabase
            .from('election_votes')
            .select('position_id')
            .eq('election_id', id)
            .eq('voter_id', req.user.id);

        if (error) throw error;

        res.json({ hasVoted: votes && votes.length > 0, votedPositions: votes || [] });
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

        // Check if results are published
        const { data: election, error: electionError } = await supabase
            .from('elections')
            .select('results_published, status')
            .eq('id', id)
            .single();

        if (electionError) throw electionError;

        if (!election.results_published && election.status !== 'completed') {
            return res.status(403).json({ error: 'Results not yet published' });
        }

        const { data: results, error } = await supabase
            .from('election_results')
            .select(`
                *,
                election_positions(position_name),
                election_candidates(
                    *,
                    users(name, avatar_url)
                )
            `)
            .eq('election_id', id)
            .order('position_id')
            .order('votes_count', { ascending: false });

        if (error) throw error;

        // Group results by position
        const resultsByPosition = results.reduce((acc, result) => {
            const positionId = result.position_id;
            if (!acc[positionId]) {
                acc[positionId] = {
                    position: result.election_positions,
                    candidates: []
                };
            }
            acc[positionId].candidates.push(result);
            return acc;
        }, {});

        res.json(resultsByPosition);
    } catch (error) {
        console.error('Error fetching results:', error);
        res.status(500).json({ error: 'Failed to fetch results' });
    }
});

// Calculate and publish results
router.post('/:id/calculate-results', authenticateToken, requireRole(['admin']), async (req, res) => {
    try {
        const { id } = req.params;

        // Calculate results using stored procedure
        const { error: calcError } = await supabase
            .rpc('calculate_election_results', { election_id_param: parseInt(id) });

        if (calcError) throw calcError;

        // Mark results as published
        const { data: election, error: updateError } = await supabase
            .from('elections')
            .update({ 
                results_published: true,
                status: 'completed'
            })
            .eq('id', id)
            .select()
            .single();

        if (updateError) throw updateError;

        res.json({ message: 'Results calculated and published successfully', election });
    } catch (error) {
        console.error('Error calculating results:', error);
        res.status(500).json({ error: 'Failed to calculate results' });
    }
});

// Get live voting statistics (for admins during voting)
router.get('/:id/live-stats', authenticateToken, requireRole(['admin']), async (req, res) => {
    try {
        const { id } = req.params;

        // Get total eligible voters (all active members)
        const { count: eligibleVoters } = await supabase
            .from('users')
            .select('*', { count: 'exact', head: true })
            .eq('status', 'active');

        // Get total votes cast
        const { data: voteStats } = await supabase
            .from('election_votes')
            .select('voter_id')
            .eq('election_id', id);

        const uniqueVoters = new Set(voteStats?.map(v => v.voter_id) || []).size;

        // Get votes by position
        const { data: positionStats, error } = await supabase
            .from('election_votes')
            .select(`
                position_id,
                election_positions(position_name),
                candidate_id,
                election_candidates(users(name))
            `)
            .eq('election_id', id);

        if (error) throw error;

        // Group by position
        const statsByPosition = positionStats?.reduce((acc, vote) => {
            const positionId = vote.position_id;
            if (!acc[positionId]) {
                acc[positionId] = {
                    position: vote.election_positions,
                    totalVotes: 0,
                    candidates: {}
                };
            }
            acc[positionId].totalVotes++;
            
            const candidateId = vote.candidate_id;
            if (!acc[positionId].candidates[candidateId]) {
                acc[positionId].candidates[candidateId] = {
                    candidate: vote.election_candidates,
                    votes: 0
                };
            }
            acc[positionId].candidates[candidateId].votes++;
            
            return acc;
        }, {}) || {};

        res.json({
            eligibleVoters,
            totalVoters: uniqueVoters,
            turnoutPercentage: eligibleVoters > 0 ? ((uniqueVoters / eligibleVoters) * 100).toFixed(2) : 0,
            positionStats: statsByPosition
        });
    } catch (error) {
        console.error('Error fetching live stats:', error);
        res.status(500).json({ error: 'Failed to fetch live stats' });
    }
});

module.exports = router;