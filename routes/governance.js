const express = require('express');
const router = express.Router();
const { supabase } = require('../lib/supabase');
const { authenticateToken, requireRole } = require('../middleware/auth');

// =============================================
// GOVERNANCE PROPOSALS ROUTES
// =============================================

// Get all proposals
router.get('/proposals', async (req, res) => {
    try {
        const { 
            type, 
            status = 'all',
            page = 1, 
            limit = 10 
        } = req.query;

        let query = supabase
            .from('governance_proposals')
            .select(`
                *,
                users!governance_proposals_proposed_by_fkey(name, email),
                users!governance_proposals_seconded_by_fkey(name, email),
                meetings(title, meeting_date)
            `)
            .order('created_at', { ascending: false });

        // Apply filters
        if (type) {
            query = query.eq('proposal_type', type);
        }

        if (status !== 'all') {
            query = query.eq('status', status);
        }

        // Pagination
        const offset = (page - 1) * limit;
        query = query.range(offset, offset + limit - 1);

        const { data: proposals, error, count } = await query;

        if (error) throw error;

        // Get vote counts for each proposal
        for (let proposal of proposals) {
            const { data: voteStats } = await supabase
                .from('proposal_votes')
                .select('vote')
                .eq('proposal_id', proposal.id);

            const voteCounts = voteStats?.reduce((acc, vote) => {
                acc[vote.vote] = (acc[vote.vote] || 0) + 1;
                return acc;
            }, { for: 0, against: 0, abstain: 0 }) || { for: 0, against: 0, abstain: 0 };

            proposal.vote_counts = voteCounts;
            proposal.total_votes = Object.values(voteCounts).reduce((sum, count) => sum + count, 0);
        }

        res.json({
            proposals,
            pagination: {
                current: parseInt(page),
                total: Math.ceil(count / limit),
                count: count
            }
        });
    } catch (error) {
        console.error('Error fetching proposals:', error);
        res.status(500).json({ error: 'Failed to fetch proposals' });
    }
});

// Get single proposal with full details
router.get('/proposals/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const { data: proposal, error } = await supabase
            .from('governance_proposals')
            .select(`
                *,
                users!governance_proposals_proposed_by_fkey(name, email, avatar_url),
                users!governance_proposals_seconded_by_fkey(name, email, avatar_url),
                meetings(title, meeting_date, venue),
                proposal_votes(
                    *,
                    users(name, email, avatar_url)
                )
            `)
            .eq('id', id)
            .single();

        if (error) throw error;

        if (!proposal) {
            return res.status(404).json({ error: 'Proposal not found' });
        }

        // Calculate vote statistics
        const voteStats = proposal.proposal_votes?.reduce((acc, vote) => {
            acc[vote.vote] = (acc[vote.vote] || 0) + 1;
            return acc;
        }, { for: 0, against: 0, abstain: 0 }) || { for: 0, against: 0, abstain: 0 };

        proposal.vote_statistics = {
            ...voteStats,
            total: Object.values(voteStats).reduce((sum, count) => sum + count, 0),
            for_percentage: voteStats.for > 0 ? ((voteStats.for / (voteStats.for + voteStats.against + voteStats.abstain)) * 100).toFixed(1) : 0,
            against_percentage: voteStats.against > 0 ? ((voteStats.against / (voteStats.for + voteStats.against + voteStats.abstain)) * 100).toFixed(1) : 0,
            abstain_percentage: voteStats.abstain > 0 ? ((voteStats.abstain / (voteStats.for + voteStats.against + voteStats.abstain)) * 100).toFixed(1) : 0
        };

        res.json(proposal);
    } catch (error) {
        console.error('Error fetching proposal:', error);
        res.status(500).json({ error: 'Failed to fetch proposal' });
    }
});

// Create new proposal
router.post('/proposals', authenticateToken, async (req, res) => {
    try {
        const {
            title,
            description,
            proposalType,
            content,
            meetingId,
            votingStart,
            votingEnd
        } = req.body;

        const { data: proposal, error } = await supabase
            .from('governance_proposals')
            .insert({
                title,
                description,
                proposal_type: proposalType,
                content,
                proposed_by: req.user.id,
                meeting_id: meetingId,
                voting_start: votingStart,
                voting_end: votingEnd
            })
            .select()
            .single();

        if (error) throw error;

        res.status(201).json(proposal);
    } catch (error) {
        console.error('Error creating proposal:', error);
        res.status(500).json({ error: 'Failed to create proposal' });
    }
});

// Second a proposal
router.post('/proposals/:id/second', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;

        // Check if proposal exists and is not already seconded
        const { data: proposal, error: fetchError } = await supabase
            .from('governance_proposals')
            .select('seconded_by, proposed_by')
            .eq('id', id)
            .single();

        if (fetchError) throw fetchError;

        if (!proposal) {
            return res.status(404).json({ error: 'Proposal not found' });
        }

        if (proposal.seconded_by) {
            return res.status(400).json({ error: 'Proposal already seconded' });
        }

        if (proposal.proposed_by === req.user.id) {
            return res.status(400).json({ error: 'Cannot second your own proposal' });
        }

        const { data: updatedProposal, error } = await supabase
            .from('governance_proposals')
            .update({ 
                seconded_by: req.user.id,
                status: 'submitted'
            })
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;

        res.json(updatedProposal);
    } catch (error) {
        console.error('Error seconding proposal:', error);
        res.status(500).json({ error: 'Failed to second proposal' });
    }
});

// Update proposal status
router.put('/proposals/:id/status', authenticateToken, requireRole(['admin', 'executive']), async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const { data: proposal, error } = await supabase
            .from('governance_proposals')
            .update({ 
                status,
                updated_at: new Date().toISOString()
            })
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;

        res.json(proposal);
    } catch (error) {
        console.error('Error updating proposal status:', error);
        res.status(500).json({ error: 'Failed to update proposal status' });
    }
});

// Vote on proposal
router.post('/proposals/:id/vote', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const { vote, comment } = req.body;

        // Validate vote
        if (!['for', 'against', 'abstain'].includes(vote)) {
            return res.status(400).json({ error: 'Invalid vote option' });
        }

        // Check if proposal is in voting status
        const { data: proposal, error: proposalError } = await supabase
            .from('governance_proposals')
            .select('status, voting_start, voting_end')
            .eq('id', id)
            .single();

        if (proposalError) throw proposalError;

        if (proposal.status !== 'voting') {
            return res.status(400).json({ error: 'Proposal is not open for voting' });
        }

        // Check voting period
        const now = new Date();
        if (proposal.voting_start && new Date(proposal.voting_start) > now) {
            return res.status(400).json({ error: 'Voting has not started yet' });
        }

        if (proposal.voting_end && new Date(proposal.voting_end) < now) {
            return res.status(400).json({ error: 'Voting period has ended' });
        }

        // Check if user has already voted
        const { data: existingVote } = await supabase
            .from('proposal_votes')
            .select('id')
            .eq('proposal_id', id)
            .eq('voter_id', req.user.id)
            .single();

        if (existingVote) {
            return res.status(400).json({ error: 'You have already voted on this proposal' });
        }

        // Cast vote
        const { data: voteRecord, error: voteError } = await supabase
            .from('proposal_votes')
            .insert({
                proposal_id: id,
                voter_id: req.user.id,
                vote,
                comment
            })
            .select()
            .single();

        if (voteError) throw voteError;

        // Update proposal vote counts
        const { data: allVotes } = await supabase
            .from('proposal_votes')
            .select('vote')
            .eq('proposal_id', id);

        const voteCounts = allVotes?.reduce((acc, v) => {
            acc[v.vote] = (acc[v.vote] || 0) + 1;
            return acc;
        }, { for: 0, against: 0, abstain: 0 }) || { for: 0, against: 0, abstain: 0 };

        await supabase
            .from('governance_proposals')
            .update({
                votes_for: voteCounts.for,
                votes_against: voteCounts.against,
                votes_abstain: voteCounts.abstain
            })
            .eq('id', id);

        res.json({ message: 'Vote cast successfully', vote: voteRecord });
    } catch (error) {
        console.error('Error casting vote:', error);
        res.status(500).json({ error: 'Failed to cast vote' });
    }
});

// Get user's vote on a proposal
router.get('/proposals/:id/my-vote', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;

        const { data: vote, error } = await supabase
            .from('proposal_votes')
            .select('vote, comment, cast_at')
            .eq('proposal_id', id)
            .eq('voter_id', req.user.id)
            .single();

        if (error && error.code !== 'PGRST116') { // PGRST116 is "not found"
            throw error;
        }

        res.json({ vote: vote || null });
    } catch (error) {
        console.error('Error fetching user vote:', error);
        res.status(500).json({ error: 'Failed to fetch vote' });
    }
});

// =============================================
// GOVERNANCE STATISTICS ROUTES
// =============================================

// Get governance dashboard statistics
router.get('/stats', authenticateToken, requireRole(['admin', 'executive']), async (req, res) => {
    try {
        // Get proposal statistics
        const { data: proposalStats } = await supabase
            .from('governance_proposals')
            .select('status, proposal_type');

        const proposalsByStatus = proposalStats?.reduce((acc, proposal) => {
            acc[proposal.status] = (acc[proposal.status] || 0) + 1;
            return acc;
        }, {}) || {};

        const proposalsByType = proposalStats?.reduce((acc, proposal) => {
            acc[proposal.proposal_type] = (acc[proposal.proposal_type] || 0) + 1;
            return acc;
        }, {}) || {};

        // Get recent voting activity
        const { data: recentVotes } = await supabase
            .from('proposal_votes')
            .select(`
                *,
                governance_proposals(title),
                users(name)
            `)
            .order('cast_at', { ascending: false })
            .limit(10);

        // Get active proposals
        const { data: activeProposals } = await supabase
            .from('governance_proposals')
            .select('id, title, status, voting_end')
            .in('status', ['voting', 'under_review'])
            .order('created_at', { ascending: false });

        // Get upcoming meetings
        const { data: upcomingMeetings } = await supabase
            .from('meetings')
            .select(`
                id, 
                title, 
                meeting_date, 
                venue,
                meeting_types(name)
            `)
            .gte('meeting_date', new Date().toISOString())
            .order('meeting_date')
            .limit(5);

        res.json({
            proposalStats: {
                byStatus: proposalsByStatus,
                byType: proposalsByType,
                total: proposalStats?.length || 0
            },
            recentVotes: recentVotes || [],
            activeProposals: activeProposals || [],
            upcomingMeetings: upcomingMeetings || []
        });
    } catch (error) {
        console.error('Error fetching governance stats:', error);
        res.status(500).json({ error: 'Failed to fetch governance statistics' });
    }
});

// Get proposal voting history
router.get('/proposals/:id/voting-history', authenticateToken, requireRole(['admin', 'executive']), async (req, res) => {
    try {
        const { id } = req.params;

        const { data: votes, error } = await supabase
            .from('proposal_votes')
            .select(`
                *,
                users(name, email, avatar_url)
            `)
            .eq('proposal_id', id)
            .order('cast_at', { ascending: false });

        if (error) throw error;

        // Group votes by option
        const votesByOption = votes?.reduce((acc, vote) => {
            if (!acc[vote.vote]) {
                acc[vote.vote] = [];
            }
            acc[vote.vote].push(vote);
            return acc;
        }, {}) || {};

        res.json({
            votes: votes || [],
            votesByOption,
            summary: {
                total: votes?.length || 0,
                for: votesByOption.for?.length || 0,
                against: votesByOption.against?.length || 0,
                abstain: votesByOption.abstain?.length || 0
            }
        });
    } catch (error) {
        console.error('Error fetching voting history:', error);
        res.status(500).json({ error: 'Failed to fetch voting history' });
    }
});

module.exports = router;