const express = require('express');
const { supabaseAdmin: supabase } = require('../lib/supabase');
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const { enrichEventsWithStatus, enrichEventWithStatus } = require('../utils/event-status');
const router = express.Router();

// Use the proper authentication middleware from middleware/auth.js
// This handles JWT tokens correctly and checks admin role

// --- System Alerts ---
router.get('/alerts', authenticateToken, requireAdmin, async (req, res) => {
    try {
        // Parallel queries for efficiency
        const [
            { count: pendingUsers, error: userError },
            { count: pendingEvents, error: eventError },
            { count: pendingIdeas, error: ideaError }
        ] = await Promise.all([
            supabase.from('users').select('*', { count: 'exact', head: true }).eq('membership_status', 'pending_invitation'),
            supabase.from('events').select('*', { count: 'exact', head: true }).in('status', ['draft']),
            supabase.from('ideas').select('*', { count: 'exact', head: true }).in('status', ['pending', 'submitted'])
        ]);

        // Log any individual errors but don't fail the whole request
        if (userError) console.warn('User count error:', userError);
        if (eventError) console.warn('Event count error:', eventError);
        if (ideaError) console.warn('Idea count error:', ideaError);

        res.json({
            pendingUsers: pendingUsers || 0,
            pendingEvents: pendingEvents || 0,
            pendingIdeas: pendingIdeas || 0
        });
    } catch (error) {
        console.error('Error fetching system alerts:', error);
        res.status(500).json({
            message: 'Failed to fetch system alerts',
            error: error.message
        });
    }
});

// --- Dashboard Stats ---
router.get('/dashboard/stats', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const now = new Date();
        const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

        // Uses Promise.all for parallel execution
        const [
            { count: totalUsers },
            { count: newUsersWeek },
            { count: activeUsers },
            { count: totalEvents },
            { count: upcomingEvents },
            { data: payments }, // Need data for sum
            { count: totalIdeas },
            { count: monthlyIdeas }
        ] = await Promise.all([
            supabase.from('users').select('*', { count: 'exact', head: true }),
            supabase.from('users').select('*', { count: 'exact', head: true }).gt('created_at', oneWeekAgo.toISOString()),
            supabase.from('users').select('*', { count: 'exact', head: true }).eq('status', 'active'),
            supabase.from('events').select('*', { count: 'exact', head: true }),
            supabase.from('events').select('*', { count: 'exact', head: true }).gt('start_date', now.toISOString()),
            supabase.from('payments').select('amount, created_at, status'), // Fetch all checks status
            supabase.from('ideas').select('*', { count: 'exact', head: true }),
            supabase.from('ideas').select('*', { count: 'exact', head: true }).gt('created_at', startOfMonth.toISOString())
        ]);

        // Calculate Revenue
        let totalRevenue = 0;
        let monthlyRevenue = 0;
        if (payments) {
            payments.forEach(p => {
                if (p.status === 'completed' || p.status === 'COMPLETED') {
                    totalRevenue += (p.amount || 0);
                    if (new Date(p.created_at) >= startOfMonth) {
                        monthlyRevenue += (p.amount || 0);
                    }
                }
            });
        }

        const responseData = {
            users: {
                total: totalUsers || 0,
                newThisWeek: newUsersWeek || 0,
                activeUsers: activeUsers || 0
            },
            events: {
                total: totalEvents || 0,
                upcoming: upcomingEvents || 0,
                thisMonth: 0 // placeholder
            },
            payments: {
                totalRevenue,
                monthlyRevenue,
                totalPayments: payments ? payments.length : 0
            },
            ideas: {
                total: totalIdeas || 0,
                monthlyIdeas: monthlyIdeas || 0,
                pendingReview: 0 // handled by alerts mostly
            }
        };

        res.json(responseData);

    } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// --- User Management ---
router.get('/users/export', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('users')
            .select('id, name, email, phone, registration_number, course, year_of_study, role, college, membership_status, created_at')
            .order('created_at', { ascending: false });

        if (error) throw error;

        // Convert to CSV
        const csvHeader = ['ID', 'Name', 'Email', 'Phone', 'Reg Number', 'Course', 'Year', 'Role', 'College', 'Status', 'Join Date'].join(',') + '\n';
        const csvRows = data.map(u => {
            return [
                u.id,
                `"${u.name || 'N/A'}"`,
                `"${u.email || 'N/A'}"`,
                `"${u.phone || 'N/A'}"`,
                `"${u.registration_number || 'N/A'}"`,
                `"${u.course || 'N/A'}"`,
                u.year_of_study || 'N/A',
                u.role || 'member',
                u.college || 'N/A',
                u.membership_status || 'active',
                u.created_at
            ].join(',');
        }).join('\n');

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename=users_export.csv');
        res.send(csvHeader + csvRows);
    } catch (error) {
        console.error('Error exporting users:', error);
        res.status(500).json({ message: 'Failed to export data', error: error.message });
    }
});

router.get('/users', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const { college } = req.query;
        let query = supabase.from('users').select('*').order('created_at', { ascending: false });

        if (college) {
            query = query.eq('college', college);
        }

        const { data, error } = await query;
        if (error) throw error;

        // Never log sensitive fields
        if (data?.[0]) {
            const { password_hash, verification_token, ...safeUser } = data[0];
            console.log('📊 Sample user data (first user):', safeUser);
        }

        // Return all user fields for CMS
        const users = data.map(u => ({
            id: u.id,
            name: u.name || 'Unknown',
            email: u.email,
            phone: u.phone || u.phone_number || null,
            registration_number: u.registration_number || u.student_id || null,
            student_id: u.student_id || u.registration_number || null,
            course: u.course || null,
            year_of_study: u.year_of_study || null,
            college: u.college || null,
            role: u.role || 'member',
            membership_status: u.membership_status || 'pending',
            created_at: u.created_at,
            updated_at: u.updated_at,
            last_active: u.last_active || u.last_login || null,
            profile_picture: u.profile_picture || null,
            bio: u.bio || null
        }));

        console.log('📤 Mapped user data (first user):', users[0]);

        res.json({ users });
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

router.get('/users/analytics', authenticateToken, requireAdmin, async (req, res) => {
    try {
        // Fetch all users to aggregate in memory (efficient enough for <1000 users)
        const { data: users, error } = await supabase
            .from('users')
            .select('id, college, membership_status, created_at, profile_picture, bio');

        if (error) throw error;

        // 1. Active Users
        const activeUsers = users.filter(u => u.membership_status === 'active').length;

        // 2. New Registrations (last 30 days)
        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        const newRegistrations = users.filter(u => new Date(u.created_at) > thirtyDaysAgo).length;

        // 3. Profile Completion Rate (simple heuristic: has photo & bio)
        const completedProfiles = users.filter(u => u.profile_picture && u.bio).length;
        const profileCompletionRate = users.length > 0 ? Math.round((completedProfiles / users.length) * 100) : 0;

        // 4. Users by College
        const collegeMap = {};
        users.forEach(u => {
            const col = u.college || 'Unknown';
            collegeMap[col] = (collegeMap[col] || 0) + 1;
        });

        const usersByCollege = Object.entries(collegeMap).map(([name, count]) => ({
            name,
            count
        })).sort((a, b) => b.count - a.count); // desc

        res.json({
            activeUsers,
            newRegistrations,
            profileCompletionRate,
            usersByCollege
        });

    } catch (error) {
        console.error('Error fetching user analytics:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

router.post('/users/:id/approve', authenticateToken, requireAdmin, async (req, res) => {
    try {
        // Implement logic to approve user (e.g., set status to 'active')
        const { error } = await supabase
            .from('users')
            .update({ membership_status: 'active' })
            .eq('id', req.params.id);

        if (error) throw error;
        res.json({ message: 'User approved' });
    } catch (error) {
        console.error('Error approving user:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

router.post('/users/:id/reject', authenticateToken, requireAdmin, async (req, res) => {
    try {
        // Implement logic to reject user
        const { error } = await supabase
            .from('users')
            .update({ membership_status: 'rejected' })
            .eq('id', req.params.id);

        if (error) throw error;
        res.json({ message: 'User rejected' });
    } catch (error) {
        console.error('Error rejecting user:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

router.post('/users', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const {
            name,
            email,
            phone,
            registration_number,
            course,
            year_of_study,
            role,
            college,
            send_invitation
        } = req.body;

        // Basic validation
        if (!name || !email) {
            return res.status(400).json({ message: 'Name and Email are required' });
        }

        // Check if user already exists
        const { data: existingUser } = await supabase
            .from('users')
            .select('id, email')
            .eq('email', email)
            .single();

        if (existingUser) {
            return res.status(400).json({ message: 'User with this email already exists' });
        }

        // Generate invitation token
        const invitationToken = require('crypto').randomBytes(32).toString('hex');
        const invitationExpires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

        // Create user in database
        const { data: newUser, error } = await supabase
            .from('users')
            .insert([{
                name,
                email,
                phone: phone || null,
                registration_number: registration_number || null,
                course: course || null,
                year_of_study: year_of_study ? parseInt(year_of_study) : null,
                role: role || 'member',
                college: college || 'COETEC',
                membership_status: 'pending', // Use 'pending' instead of 'pending_invitation'
                email_verified: false,
                phone_verified: false,
                profile_completed: false,
                invitation_token: invitationToken,
                invitation_expires: invitationExpires.toISOString(),
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            }])
            .select()
            .single();

        if (error) throw error;

        // Send invitation email if requested
        if (send_invitation) {
            try {
                const invitationUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/complete-registration?token=${invitationToken}`;

                // You can implement email sending here
                // For now, we'll log the invitation URL
                console.log(`📧 Invitation URL for ${email}: ${invitationUrl}`);

                // TODO: Implement actual email sending
                // await sendInvitationEmail(email, name, invitationUrl);
            } catch (emailError) {
                console.error('Failed to send invitation email:', emailError);
                // Don't fail the user creation if email fails
            }
        }

        res.status(201).json({
            message: 'User created successfully',
            user: {
                id: newUser.id,
                name: newUser.name,
                email: newUser.email,
                role: newUser.role,
                college: newUser.college,
                membership_status: newUser.membership_status
            },
            invitation_sent: send_invitation,
            invitation_url: send_invitation ? `${process.env.FRONTEND_URL || 'http://localhost:3000'}/complete-registration?token=${invitationToken}` : null
        });

    } catch (error) {
        console.error('Error creating user:', error);
        res.status(500).json({
            message: 'Server error',
            details: error.message,
            hint: error.code === '23505' ? 'Email already exists' : undefined
        });
    }
});

router.delete('/users/:id', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const { error } = await supabase
            .from('users')
            .delete()
            .eq('id', req.params.id);

        if (error) throw error;
        res.json({ message: 'User deleted successfully' });
    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

router.put('/users/:id', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const { 
            name, 
            email, 
            phone, 
            registration_number, 
            course, 
            year_of_study, 
            college, 
            role, 
            membership_status 
        } = req.body;

        const updates = {};
        if (name !== undefined) updates.name = name;
        if (email !== undefined) updates.email = email;
        if (phone !== undefined) updates.phone = phone;
        if (registration_number !== undefined) updates.registration_number = registration_number;
        if (course !== undefined) updates.course = course;
        if (year_of_study !== undefined) updates.year_of_study = year_of_study;
        if (college !== undefined) updates.college = college;
        if (role !== undefined) updates.role = role;
        if (membership_status !== undefined) updates.membership_status = membership_status;
        
        updates.updated_at = new Date().toISOString();

        const { data, error } = await supabase
            .from('users')
            .update(updates)
            .eq('id', req.params.id)
            .select()
            .single();

        if (error) throw error;
        res.json({ message: 'User updated successfully', user: data });
    } catch (error) {
        console.error('Error updating user:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Update user membership status (simpler endpoint for status changes)
router.patch('/users/:id/status', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const { membership_status } = req.body;

        if (!membership_status) {
            return res.status(400).json({ message: 'membership_status is required' });
        }

        // Validate status
        const validStatuses = ['active', 'inactive', 'suspended', 'pending'];
        if (!validStatuses.includes(membership_status)) {
            return res.status(400).json({ message: 'Invalid membership status' });
        }

        const { data, error } = await supabase
            .from('users')
            .update({ 
                membership_status,
                updated_at: new Date().toISOString()
            })
            .eq('id', req.params.id)
            .select()
            .single();

        if (error) throw error;

        console.log(`✅ User ${req.params.id} status updated to: ${membership_status}`);
        res.json({ 
            message: 'Membership status updated successfully', 
            user: data 
        });
    } catch (error) {
        console.error('Error updating membership status:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// --- Event Management ---
router.get('/events/export', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('events')
            .select('id, title, start_date, event_type, status, location, description, created_at')
            .order('start_date', { ascending: false });

        if (error) throw error;

        // Convert to CSV
        const csvHeader = ['ID', 'Title', 'Date', 'Type', 'Status', 'Location', 'Description', 'Created At'].join(',') + '\n';
        const csvRows = data.map(e => {
            const safeDesc = (e.description || '').replace(/"/g, '""').replace(/\n/g, ' ');
            return [
                e.id,
                `"${e.title || 'N/A'}"`,
                e.start_date,
                e.event_type || 'General',
                e.status || 'upcoming',
                `"${e.location || 'N/A'}"`,
                `"${safeDesc}"`,
                e.created_at
            ].join(',');
        }).join('\n');

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename=events_export.csv');
        res.send(csvHeader + csvRows);
    } catch (error) {
        console.error('Error exporting events:', error);
        res.status(500).json({ message: 'Failed to export data', error: error.message });
    }
});

router.get('/events', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const { data: events, error } = await supabase
            .from('events')
            .select('*')
            .order('start_date', { ascending: true });

        if (error) throw error;
        
        // Enrich events with calculated status
        const enrichedEvents = enrichEventsWithStatus(events);
        
        res.json({ events: enrichedEvents });
    } catch (error) {
        console.error('Error fetching events:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

router.post('/events', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const { title, date, type, description, location } = req.body;

        // Basic validation
        if (!title || !date) {
            return res.status(400).json({ message: 'Title and Date are required' });
        }

        const { data, error } = await supabase
            .from('events')
            .insert([{
                title,
                start_date: date,
                event_type: type || 'meeting', // Map 'type' to 'event_type'
                description: description || '',
                location: location || '',
                status: 'published', // Default to published, actual status calculated from dates
                created_at: new Date()
            }])
            .select()
            .single();

        if (error) throw error;
        
        // Enrich with calculated status before returning
        const enrichedEvent = enrichEventWithStatus(data);
        
        res.status(201).json({ message: 'Event created successfully', event: enrichedEvent });
    } catch (error) {
        console.error('Error creating event:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

router.put('/events/:id', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const { 
            title, date, type, description, status, location,
            start_date, end_date, event_type, max_attendees, fee,
            gallery, banner_image, tags, requirements, agenda
        } = req.body;

        console.log('📝 Updating event:', req.params.id);
        console.log('📦 Gallery data received:', gallery ? `Array with ${gallery.length} items` : 'No gallery data');
        if (gallery && gallery.length > 0) {
            console.log('📸 First gallery item:', {
                type: gallery[0].type,
                name: gallery[0].name,
                urlLength: gallery[0].url ? gallery[0].url.length : 0
            });
        }

        const updates = {};
        if (title !== undefined) updates.title = title;
        if (start_date !== undefined) updates.start_date = start_date;
        if (date !== undefined) updates.start_date = date; // Backward compatibility
        if (end_date !== undefined) updates.end_date = end_date;
        if (event_type !== undefined) updates.event_type = event_type;
        if (type !== undefined) updates.event_type = type; // Backward compatibility
        if (description !== undefined) updates.description = description;
        if (status !== undefined) updates.status = status;
        if (location !== undefined) updates.location = location;
        if (max_attendees !== undefined) updates.max_attendees = max_attendees;
        if (fee !== undefined) updates.fee = fee;
        if (gallery !== undefined) updates.gallery = gallery;
        if (banner_image !== undefined) updates.banner_image = banner_image;
        if (tags !== undefined) updates.tags = tags;
        if (requirements !== undefined) updates.requirements = requirements;
        if (agenda !== undefined) updates.agenda = agenda;
        updates.updated_at = new Date();

        console.log('📝 Updates object keys:', Object.keys(updates));

        const { data, error } = await supabase
            .from('events')
            .update(updates)
            .eq('id', req.params.id)
            .select()
            .single();

        if (error) {
            console.error('❌ Supabase error:', error);
            throw error;
        }

        console.log('✅ Event updated successfully');
        console.log('📦 Returned gallery:', data.gallery ? `Array with ${data.gallery.length} items` : 'No gallery');

        // Enrich with calculated status before returning
        const enrichedEvent = enrichEventWithStatus(data);

        res.json({ message: 'Event updated successfully', event: enrichedEvent });
    } catch (error) {
        console.error('Error updating event:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

router.delete('/events/:id', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const { error } = await supabase
            .from('events')
            .delete()
            .eq('id', req.params.id);

        if (error) throw error;
        res.json({ message: 'Event deleted successfully' });
    } catch (error) {
        console.error('Error deleting event:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// --- Project Management ---
router.get('/projects', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const { data: projects, error } = await supabase
            .from('projects')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;
        
        // Enrich projects with any additional data if needed
        res.json({ projects });
    } catch (error) {
        console.error('Error fetching projects:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

router.post('/projects', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const { 
            title, description, category, status, project_type,
            github_url, demo_url, tech_stack, team_members,
            start_date, end_date, banner_image, gallery
        } = req.body;

        // Basic validation
        if (!title) {
            return res.status(400).json({ message: 'Title is required' });
        }

        const { data, error } = await supabase
            .from('projects')
            .insert([{
                title,
                description: description || '',
                category: category || 'innovation',
                status: status || 'planning',
                project_type: project_type || 'club',
                github_url,
                demo_url,
                tech_stack,
                team_members,
                start_date,
                end_date,
                banner_image,
                gallery,
                created_at: new Date()
            }])
            .select()
            .single();

        if (error) throw error;
        res.status(201).json({ message: 'Project created successfully', project: data });
    } catch (error) {
        console.error('Error creating project:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

router.put('/projects/:id', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const { 
            title, description, category, status, project_type,
            github_url, demo_url, tech_stack, team_members,
            start_date, end_date, banner_image, gallery
        } = req.body;

        const updates = {};
        if (title !== undefined) updates.title = title;
        if (description !== undefined) updates.description = description;
        if (category !== undefined) updates.category = category;
        if (status !== undefined) updates.status = status;
        if (project_type !== undefined) updates.project_type = project_type;
        if (github_url !== undefined) updates.github_url = github_url;
        if (demo_url !== undefined) updates.demo_url = demo_url;
        if (tech_stack !== undefined) updates.tech_stack = tech_stack;
        if (team_members !== undefined) updates.team_members = team_members;
        if (start_date !== undefined) updates.start_date = start_date;
        if (end_date !== undefined) updates.end_date = end_date;
        if (banner_image !== undefined) updates.banner_image = banner_image;
        if (gallery !== undefined) updates.gallery = gallery;
        updates.updated_at = new Date();

        const { data, error } = await supabase
            .from('projects')
            .update(updates)
            .eq('id', req.params.id)
            .select()
            .single();

        if (error) throw error;
        res.json({ message: 'Project updated successfully', project: data });
    } catch (error) {
        console.error('Error updating project:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

router.delete('/projects/:id', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const { error } = await supabase
            .from('projects')
            .delete()
            .eq('id', req.params.id);

        if (error) throw error;
        res.json({ message: 'Project deleted successfully' });
    } catch (error) {
        console.error('Error deleting project:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

router.get('/events/analytics', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const { data: events, error } = await supabase
            .from('events')
            .select('id, title, start_date, status, tags, created_by, event_type');

        if (error) throw error;

        // Stats
        const now = new Date();
        const totalEvents = events.length;
        const upcomingEvents = events.filter(e => new Date(e.start_date) > now).length;
        const averageAttendance = 0; // Not tracked in basic events table yet

        // Events by Type
        const typeMap = {};
        events.forEach(e => {
            const type = e.event_type || 'General';
            typeMap[type] = (typeMap[type] || 0) + 1;
        });

        const eventsByType = Object.entries(typeMap).map(([type, count]) => ({ type, count }));

        // Recent Events
        const recentEvents = events
            .sort((a, b) => new Date(b.start_date) - new Date(a.start_date))
            .slice(0, 5)
            .map(e => ({
                name: e.title,
                date: new Date(e.start_date).toLocaleDateString(),
                attendees: 0 // placeholder
            }));

        res.json({
            totalEvents,
            upcomingEvents,
            averageAttendance,
            eventsByType,
            recentEvents
        });
    } catch (error) {
        console.error('Error fetching event analytics:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// --- Financial Management ---


router.post('/payments', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const { user_email, amount, method, description } = req.body;

        // 1. Find user by email
        const { data: user, error: userError } = await supabase
            .from('users')
            .select('id')
            .eq('email', user_email)
            .single();

        if (userError || !user) {
            return res.status(404).json({ message: 'User with that email not found' });
        }

        // 2. Insert payment
        const { data, error } = await supabase
            .from('payments')
            .insert([{
                user_id: user.id,
                amount,
                payment_method: method || 'manual',
                status: 'completed', // Admin manual payments are usually completed
                description: description || 'Manual entry by Admin',
                created_at: new Date()
            }])
            .select()
            .single();

        if (error) throw error;
        res.status(201).json({ message: 'Payment added successfully', payment: data });
    } catch (error) {
        console.error('Error adding payment:', error);
        res.status(500).json({ message: 'Server error' });
    }
});



// --- Innovation Management ---
router.get('/ideas/export', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('ideas')
            .select('id, title, category, status, description, created_at, users(name, email)')
            .order('created_at', { ascending: false });

        if (error) throw error;

        // Convert to CSV
        const csvHeader = ['ID', 'Title', 'Category', 'Status', 'Author', 'Author Email', 'Created At', 'Description'].join(',') + '\n';
        const csvRows = data.map(i => {
            const author = i.users ? i.users.name : 'Unknown';
            const email = i.users ? i.users.email : 'N/A';
            const safeDesc = (i.description || '').replace(/"/g, '""').replace(/\n/g, ' ');
            return [
                i.id,
                `"${i.title || 'N/A'}"`,
                i.category || 'General',
                i.status || 'pending',
                `"${author}"`,
                `"${email}"`,
                i.created_at,
                `"${safeDesc}"`
            ].join(',');
        }).join('\n');

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename=ideas_export.csv');
        res.send(csvHeader + csvRows);
    } catch (error) {
        console.error('Error exporting ideas:', error);
        res.status(500).json({ message: 'Failed to export data', error: error.message });
    }
});

// Get all ideas with optional filtering
router.get('/ideas', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const { status, category } = req.query;
        let query = supabase
            .from('ideas')
            .select('*, users(name, email)')
            .order('created_at', { ascending: false });

        if (status) query = query.eq('status', status);
        if (category) query = query.eq('category', category);

        const { data, error } = await query;
        if (error) throw error;

        // Flatten user data
        const ideas = data.map(idea => ({
            ...idea,
            author_name: idea.users ? idea.users.name : 'Anonymous',
            author_email: idea.users ? idea.users.email : 'N/A'
        }));

        res.json({ ideas });
    } catch (error) {
        console.error('Error fetching ideas:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Update idea status (Approve/Reject)
router.put('/ideas/:id/status', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const { status } = req.body; // 'approved', 'rejected', 'implemented'
        const { error } = await supabase
            .from('ideas')
            .update({ status, updated_at: new Date() })
            .eq('id', req.params.id);

        if (error) throw error;
        res.json({ message: `Idea marked as ${status}` });
    } catch (error) {
        console.error('Error updating idea status:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

router.get('/innovation/analytics', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const { data: ideas, error } = await supabase
            .from('ideas')
            .select('id, title, category, status, created_at, user_id');

        if (error) throw error;

        // Fetch user names for top ideas
        const userIds = [...new Set(ideas.map(i => i.user_id))];
        const { data: users } = await supabase.from('users').select('id, name').in('id', userIds);
        const userMap = {};
        if (users) users.forEach(u => userMap[u.id] = u.name);

        const totalIdeas = ideas.length;

        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const monthlyIdeas = ideas.filter(i => new Date(i.created_at) >= startOfMonth).length;

        const implemented = ideas.filter(i => i.status === 'implemented' || i.status === 'IMPLEMENTED').length;
        const implementationRate = totalIdeas > 0 ? Math.round((implemented / totalIdeas) * 100) : 0;

        const pendingReview = ideas.filter(i => i.status === 'submitted' || i.status === 'SUBMITTED' || i.status === 'under_review').length;

        // Ideas by Category
        const catMap = {};
        ideas.forEach(i => {
            const cat = i.category || 'Uncategorized';
            catMap[cat] = (catMap[cat] || 0) + 1;
        });

        const ideasByCategory = Object.entries(catMap).map(([category, count]) => ({
            category,
            count
        })).sort((a, b) => b.count - a.count);

        // Top Ideas (mock votes since query doesn't track votes yet, or simulate)
        const topIdeas = ideas.slice(0, 5).map(i => ({
            title: i.title,
            author: userMap[i.user_id] || 'Anonymous',
            votes: Math.floor(Math.random() * 50), // Mock votes
            status: i.status
        }));

        res.json({
            totalIdeas,
            monthlyIdeas,
            implementationRate,
            pendingReview,
            ideasByCategory,
            topIdeas
        });
    } catch (error) {
        console.error('Error fetching innovation analytics:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// --- Communication Management ---

// Send Bulk Message
router.post('/messages/bulk', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const { recipients, type, subject, message } = req.body;
        // recipients: 'all', 'members', 'executives', or array of IDs

        // 1. Resolve recipients
        let targetUserIds = [];
        if (recipients === 'all') {
            const { data } = await supabase.from('users').select('id');
            targetUserIds = data.map(u => u.id);
        } else if (recipients === 'members' || recipients === 'executives') {
            const { data } = await supabase.from('users').select('id').eq('role', recipients === 'executives' ? 'executive' : 'member');
            targetUserIds = data.map(u => u.id);
        } else if (Array.isArray(recipients)) {
            targetUserIds = recipients;
        }

        // 2. Log message in database (for history)
        const { error } = await supabase.from('messages').insert({
            sender_id: req.user.id, // Admin
            subject,
            content: message,
            message_type: type, // 'email', 'sms', 'notification'
            recipient_count: targetUserIds.length,
            status: 'sent',
            created_at: new Date()
        });

        if (error) throw error;

        // 3. (Mock) Send via Email/SMS Provider
        console.log(`🚀 Sending ${type} to ${targetUserIds.length} users: "${subject}"`);

        res.json({ message: `Message sent to ${targetUserIds.length} users` });
    } catch (error) {
        console.error('Error sending bulk message:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

router.get('/communication/analytics', authenticateToken, requireAdmin, async (req, res) => {
    try {
        // Assuming we have a get_communication_analytics RPC, or defaulting to basic
        // If no RPC exists, we might need to mock or query tables directly.
        // Let's query tables directly for now if RPC is uncertain, or assume generic structure.
        // Based on analytics.js, looking for: { totalMessages, readRate, activeConversations, emailsSent, ... }

        const { count: totalMessages } = await supabase.from('messages').select('*', { count: 'exact', head: true });

        res.json({
            totalMessages: totalMessages || 0,
            readRate: 0, // Placeholder if not tracked
            activeConversations: 0,
            emailsSent: 0,
            smsNotifications: 0,
            pushNotifications: 0,
            recentMessages: []
        });
    } catch (error) {
        console.error('Error fetching communication analytics:', error);
        res.status(500).json({ message: 'Server error' });
    }
});


// --- Financial Management ---

// Get all payments with optional filtering
router.get('/payments', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const { status, limit = 50 } = req.query;
        let query = supabase
            .from('payments')
            .select(`
                *,
                users (
                    full_name,
                    email
                )
            `)
            .order('created_at', { ascending: false })
            .limit(limit);

        if (status) {
            query = query.eq('status', status);
        }

        const { data, error } = await query;

        if (error) throw error;

        // Transform data to flatten user info
        const payments = data.map(p => ({
            ...p,
            user_name: p.users ? p.users.full_name : 'Unknown User',
            email: p.users ? p.users.email : 'No Email'
        }));

        res.json({ payments });
    } catch (error) {
        console.error('Error fetching payments:', error);
        res.status(500).json({ message: 'Failed to fetch payments', error: error.message });
    }
});

// Approve a payment
router.post('/payments/:id/approve', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const { error } = await supabase
            .from('payments')
            .update({ status: 'completed', updated_at: new Date() })
            .eq('id', id);

        if (error) throw error;

        res.json({ message: 'Payment approved successfully' });
    } catch (error) {
        console.error('Error approving payment:', error);
        res.status(500).json({ message: 'Failed to approve payment', error: error.message });
    }
});

// Reject a payment
router.post('/payments/:id/reject', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const { error } = await supabase
            .from('payments')
            .update({ status: 'failed', updated_at: new Date() }) // Using 'failed' as reject status
            .eq('id', id);

        if (error) throw error;

        res.json({ message: 'Payment rejected successfully' });
    } catch (error) {
        console.error('Error rejecting payment:', error);
        res.status(500).json({ message: 'Failed to reject payment', error: error.message });
    }
});

// Export Financial Data (CSV)
router.get('/finance/export', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('payments')
            .select(`
                id,
                amount,
                currency,
                status,
                payment_method,
                reference_id,
                description,
                created_at,
                users ( full_name, email )
            `)
            .order('created_at', { ascending: false });

        if (error) throw error;

        // Convert to CSV
        const csvHeader = ['ID', 'User', 'Email', 'Amount', 'Currency', 'Status', 'Method', 'Reference', 'Description', 'Date'].join(',') + '\n';
        const csvRows = data.map(p => {
            const user = p.users ? p.users.full_name : 'N/A';
            const email = p.users ? p.users.email : 'N/A';
            const safeDesc = (p.description || '').replace(/,/g, ' '); // simple escape
            return [
                p.id,
                `"${user}"`,
                `"${email}"`,
                p.amount,
                p.currency,
                p.status,
                p.payment_method,
                p.reference_id,
                `"${safeDesc}"`,
                p.created_at
            ].join(',');
        }).join('\n');

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename=financial_export.csv');
        res.send(csvHeader + csvRows);

    } catch (error) {
        console.error('Error exporting finance data:', error);
        res.status(500).json({ message: 'Failed to export data', error: error.message });
    }
});


// Aggregated Financial Analytics
router.get('/financial/analytics', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

        // Run queries in parallel
        const [
            { data: allPayments, error: paymentError },
            { data: recentPayments, error: recentError }
        ] = await Promise.all([
            // Fetch all COMPLETED payments for aggregation
            supabase
                .from('payments')
                .select('amount, payment_method, created_at, status')
                .in('status', ['completed', 'COMPLETED']),

            // Fetch 5 most recent payments (any status)
            supabase
                .from('payments')
                .select('*, users(full_name)')
                .order('created_at', { ascending: false })
                .limit(5)
        ]);

        if (paymentError) throw paymentError;
        if (recentError) throw recentError;

        // 1. Calculate Revenue Stats
        let totalRevenue = 0;
        let monthlyRevenue = 0;
        let methodStats = {};

        allPayments.forEach(p => {
            const amount = p.amount || 0;
            totalRevenue += amount;

            if (p.created_at >= startOfMonth) {
                monthlyRevenue += amount;
            }

            // Group by Method
            const method = p.payment_method || 'Unknown';
            if (!methodStats[method]) {
                methodStats[method] = { count: 0, amount: 0 };
            }
            methodStats[method].count++;
            methodStats[method].amount += amount;
        });

        // Format Payment Methods for Chart
        const paymentMethods = Object.entries(methodStats).map(([method, stats]) => ({
            method,
            count: stats.count,
            amount: stats.amount
        })).sort((a, b) => b.amount - a.amount); // Sort by highest amount

        // Format Recent Payments
        const formattedRecent = recentPayments.map(p => ({
            user: p.users ? p.users.full_name : 'Unknown',
            amount: p.amount,
            method: p.payment_method,
            date: new Date(p.created_at).toLocaleDateString(),
            status: p.status
        }));

        res.json({
            totalRevenue,
            monthlyRevenue,
            totalPayments: allPayments.length,
            averagePayment: allPayments.length > 0 ? Math.round(totalRevenue / allPayments.length) : 0,
            paymentMethods,
            recentPayments: formattedRecent
        });

    } catch (error) {
        console.error('Error fetching financial analytics:', error);
        res.status(500).json({ message: 'Failed to fetch financial analytics' });
    }
});

// List available financial reports (Generated dynamically)
router.get('/reports', authenticateToken, requireAdmin, async (req, res) => {
    try {
        // In a real system, these might be stored files or cached summaries.
        // Here we generate a list of "available" reports based on recent activity.
        const reports = [
            {
                id: 'rev_current',
                name: 'Current Month Revenue',
                description: 'Real-time revenue breakdown for this month',
                type: 'revenue',
                period: new Date().toLocaleString('default', { month: 'long', year: 'numeric' }),
                generated: new Date().toISOString(),
                size: 'Live'
            },
            {
                id: 'pay_methods',
                name: 'Payment Methods Analysis',
                description: 'Usage frequnecy of M-Pesa vs Bank vs Cash',
                type: 'analysis',
                period: 'All Time',
                generated: new Date().toISOString(),
                size: 'Live'
            }
        ];

        res.json(reports);
    } catch (error) {
        console.error('Error fetching reports:', error);
        res.status(500).json({ message: 'Failed to fetch reports', error: error.message });
    }
});

module.exports = router;
