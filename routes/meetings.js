const express = require('express');
const router = express.Router();
const { supabaseAdmin: supabase } = require('../lib/supabase');
const { authenticateToken, requireRole } = require('../middleware/auth');

// =============================================
// MEETINGS ROUTES
// =============================================

// Get all meetings with filters
router.get('/', async (req, res) => {
    try {
        const { 
            type, 
            status = 'scheduled', 
            upcoming = 'true',
            page = 1, 
            limit = 10 
        } = req.query;

        let query = supabase
            .from('meetings')
            .select(`
                *,
                meeting_types(name, description),
                users!meetings_created_by_fkey(name, email),
                meeting_attendees(count)
            `)
            .order('meeting_date', { ascending: true });

        // Apply filters
        if (type) {
            query = query.eq('type_id', type);
        }

        if (status !== 'all') {
            query = query.eq('status', status);
        }

        if (upcoming === 'true') {
            query = query.gte('meeting_date', new Date().toISOString());
        }

        // Pagination
        const offset = (page - 1) * limit;
        query = query.range(offset, offset + limit - 1);

        const { data: meetings, error, count } = await query;

        if (error) throw error;

        // Get attendee counts for each meeting
        for (let meeting of meetings) {
            const { count: attendeeCount } = await supabase
                .from('meeting_attendees')
                .select('*', { count: 'exact', head: true })
                .eq('meeting_id', meeting.id);
            
            meeting.attendee_count = attendeeCount || 0;
        }

        res.json({
            meetings,
            pagination: {
                current: parseInt(page),
                total: Math.ceil(count / limit),
                count: count
            }
        });
    } catch (error) {
        console.error('Error fetching meetings:', error);
        res.status(500).json({ error: 'Failed to fetch meetings' });
    }
});

// Get meeting types
router.get('/types', async (req, res) => {
    try {
        const { data: types, error } = await supabase
            .from('meeting_types')
            .select('*')
            .order('name');

        if (error) throw error;

        res.json(types);
    } catch (error) {
        console.error('Error fetching meeting types:', error);
        res.status(500).json({ error: 'Failed to fetch meeting types' });
    }
});

// Get single meeting with full details
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const { data: meeting, error } = await supabase
            .from('meetings')
            .select(`
                *,
                meeting_types(name, description),
                users!meetings_created_by_fkey(name, email),
                meeting_attendees(
                    *,
                    users(name, email, avatar_url)
                ),
                meeting_minutes(
                    *,
                    users!meeting_minutes_recorded_by_fkey(name),
                    users!meeting_minutes_approved_by_fkey(name)
                )
            `)
            .eq('id', id)
            .single();

        if (error) throw error;

        if (!meeting) {
            return res.status(404).json({ error: 'Meeting not found' });
        }

        res.json(meeting);
    } catch (error) {
        console.error('Error fetching meeting:', error);
        res.status(500).json({ error: 'Failed to fetch meeting' });
    }
});

// Create new meeting
router.post('/', authenticateToken, requireRole(['admin', 'executive']), async (req, res) => {
    try {
        const {
            title,
            typeId,
            description,
            meetingDate,
            venue,
            virtualLink,
            agenda,
            quorumRequired = 0
        } = req.body;

        const { data: meeting, error } = await supabase
            .from('meetings')
            .insert({
                title,
                type_id: typeId,
                description,
                meeting_date: meetingDate,
                venue,
                virtual_link: virtualLink,
                agenda,
                quorum_required: quorumRequired,
                created_by: req.user.id
            })
            .select()
            .single();

        if (error) throw error;

        res.status(201).json(meeting);
    } catch (error) {
        console.error('Error creating meeting:', error);
        res.status(500).json({ error: 'Failed to create meeting' });
    }
});

// Update meeting
router.put('/:id', authenticateToken, requireRole(['admin', 'executive']), async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = { ...req.body, updated_at: new Date().toISOString() };

        const { data: meeting, error } = await supabase
            .from('meetings')
            .update(updateData)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;

        res.json(meeting);
    } catch (error) {
        console.error('Error updating meeting:', error);
        res.status(500).json({ error: 'Failed to update meeting' });
    }
});

// RSVP to meeting
router.post('/:id/rsvp', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const { status = 'confirmed' } = req.body;

        const { data: rsvp, error } = await supabase
            .from('meeting_attendees')
            .upsert({
                meeting_id: id,
                user_id: req.user.id,
                attendance_status: status,
                rsvp_date: new Date().toISOString()
            })
            .select()
            .single();

        if (error) throw error;

        res.json(rsvp);
    } catch (error) {
        console.error('Error updating RSVP:', error);
        res.status(500).json({ error: 'Failed to update RSVP' });
    }
});

// Check in to meeting
router.post('/:id/checkin', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;

        const { data: checkin, error } = await supabase
            .from('meeting_attendees')
            .upsert({
                meeting_id: id,
                user_id: req.user.id,
                attendance_status: 'attended',
                check_in_time: new Date().toISOString()
            })
            .select()
            .single();

        if (error) throw error;

        // Check if quorum is now met
        const { data: quorumMet } = await supabase
            .rpc('check_meeting_quorum', { meeting_id_param: id });

        res.json({ checkin, quorumMet });
    } catch (error) {
        console.error('Error checking in:', error);
        res.status(500).json({ error: 'Failed to check in' });
    }
});

// =============================================
// MEETING MINUTES ROUTES
// =============================================

// Get meeting minutes
router.get('/:id/minutes', async (req, res) => {
    try {
        const { id } = req.params;

        const { data: minutes, error } = await supabase
            .from('meeting_minutes')
            .select(`
                *,
                users!meeting_minutes_recorded_by_fkey(name),
                users!meeting_minutes_approved_by_fkey(name)
            `)
            .eq('meeting_id', id)
            .order('created_at', { ascending: false });

        if (error) throw error;

        res.json(minutes);
    } catch (error) {
        console.error('Error fetching minutes:', error);
        res.status(500).json({ error: 'Failed to fetch minutes' });
    }
});

// Create/Update meeting minutes
router.post('/:id/minutes', authenticateToken, requireRole(['admin', 'executive']), async (req, res) => {
    try {
        const { id } = req.params;
        const {
            content,
            actionItems,
            decisionsMade,
            nextMeetingDate
        } = req.body;

        const { data: minutes, error } = await supabase
            .from('meeting_minutes')
            .upsert({
                meeting_id: id,
                content,
                action_items: actionItems,
                decisions_made: decisionsMade,
                next_meeting_date: nextMeetingDate,
                recorded_by: req.user.id,
                updated_at: new Date().toISOString()
            })
            .select()
            .single();

        if (error) throw error;

        res.json(minutes);
    } catch (error) {
        console.error('Error saving minutes:', error);
        res.status(500).json({ error: 'Failed to save minutes' });
    }
});

// Approve meeting minutes
router.post('/:meetingId/minutes/:minutesId/approve', authenticateToken, requireRole(['admin', 'executive']), async (req, res) => {
    try {
        const { minutesId } = req.params;

        const { data: minutes, error } = await supabase
            .from('meeting_minutes')
            .update({
                status: 'approved',
                approved_by: req.user.id,
                approval_date: new Date().toISOString()
            })
            .eq('id', minutesId)
            .select()
            .single();

        if (error) throw error;

        res.json(minutes);
    } catch (error) {
        console.error('Error approving minutes:', error);
        res.status(500).json({ error: 'Failed to approve minutes' });
    }
});

// =============================================
// CONSTITUTIONAL DOCUMENTS ROUTES
// =============================================

// Get constitutional documents
router.get('/documents', async (req, res) => {
    try {
        const { type, status = 'active' } = req.query;

        let query = supabase
            .from('constitutional_documents')
            .select(`
                *,
                users!constitutional_documents_created_by_fkey(name),
                users!constitutional_documents_approved_by_fkey(name)
            `)
            .order('effective_date', { ascending: false });

        if (type) {
            query = query.eq('document_type', type);
        }

        if (status !== 'all') {
            query = query.eq('status', status);
        }

        const { data: documents, error } = await query;

        if (error) throw error;

        res.json(documents);
    } catch (error) {
        console.error('Error fetching documents:', error);
        res.status(500).json({ error: 'Failed to fetch documents' });
    }
});

// Get single document
router.get('/documents/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const { data: document, error } = await supabase
            .from('constitutional_documents')
            .select(`
                *,
                users!constitutional_documents_created_by_fkey(name, email),
                users!constitutional_documents_approved_by_fkey(name, email)
            `)
            .eq('id', id)
            .single();

        if (error) throw error;

        if (!document) {
            return res.status(404).json({ error: 'Document not found' });
        }

        res.json(document);
    } catch (error) {
        console.error('Error fetching document:', error);
        res.status(500).json({ error: 'Failed to fetch document' });
    }
});

// Create constitutional document
router.post('/documents', authenticateToken, requireRole(['admin']), async (req, res) => {
    try {
        const {
            title,
            documentType,
            content,
            fileUrl,
            version,
            effectiveDate,
            expiryDate
        } = req.body;

        const { data: document, error } = await supabase
            .from('constitutional_documents')
            .insert({
                title,
                document_type: documentType,
                content,
                file_url: fileUrl,
                version,
                effective_date: effectiveDate,
                expiry_date: expiryDate,
                created_by: req.user.id
            })
            .select()
            .single();

        if (error) throw error;

        res.status(201).json(document);
    } catch (error) {
        console.error('Error creating document:', error);
        res.status(500).json({ error: 'Failed to create document' });
    }
});

module.exports = router;