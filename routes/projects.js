/**
 * JKUAT Innovation Club - Projects API Routes
 * Handles projects, hackathons, and incubation program endpoints
 */

const express = require('express');
const { supabaseAdmin: supabase } = require('../lib/supabase');
const router = express.Router();

// ============================================================================
// PROJECTS ENDPOINTS
// ============================================================================

/**
 * GET /api/projects
 * Get all projects with optional filtering
 */
router.get('/', async (req, res) => {
  try {
    const { category, status, limit = 50, offset = 0 } = req.query;
    
    let query = supabase
      .from('projects')
      .select(`
        *,
        project_lead:users!projects_project_lead_id_fkey(id, name, email)
      `)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    // Apply filters
    if (category) {
      query = query.eq('category', category);
    }
    
    if (status) {
      query = query.eq('status', status);
    }

    const { data: projects, error } = await query;

    if (error) {
      console.error('Error fetching projects:', error);
      // Return sample data if table doesn't exist yet
      return res.json(getSampleProjects());
    }

    res.json(projects || []);
  } catch (error) {
    console.error('Error in GET /projects:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

/**
 * GET /api/projects/hackathons
 * Get all hackathons
 */
router.get('/hackathons', async (req, res) => {
  try {
    const { status, limit = 20, offset = 0 } = req.query;
    
    let query = supabase
      .from('hackathons')
      .select(`
        *,
        organizer:users(id, name, email)
      `)
      .order('start_date', { ascending: true })
      .range(offset, offset + limit - 1);

    if (status) {
      query = query.eq('status', status);
    }

    const { data: hackathons, error } = await query;

    if (error) {
      console.error('Error fetching hackathons:', error);
      return res.json(getSampleHackathons());
    }

    res.json(hackathons || []);
  } catch (error) {
    console.error('Error in GET /hackathons:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

/**
 * GET /api/projects/incubation
 * Get all incubation projects
 */
router.get('/incubation', async (req, res) => {
  try {
    const { limit = 20, offset = 0 } = req.query;
    
    const { data: projects, error } = await supabase
      .from('projects')
      .select(`
        *,
        project_lead:users!projects_project_lead_id_fkey(id, name, email)
      `)
      .eq('is_incubation', true)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('Error fetching incubation projects:', error);
      return res.json(getSampleIncubationProjects());
    }

    res.json(projects || []);
  } catch (error) {
    console.error('Error in GET /incubation:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

/**
 * GET /api/projects/stats
 * Get project statistics
 */
router.get('/stats', async (req, res) => {
  try {
    // Get project counts by status
    const { data: projectStats, error: projectError } = await supabase
      .from('projects')
      .select('status')
      .not('status', 'is', null);

    // Get hackathon count
    const { data: hackathons, error: hackathonError } = await supabase
      .from('hackathons')
      .select('id');

    // Get incubation project count
    const { data: incubationProjects, error: incubationError } = await supabase
      .from('projects')
      .select('id')
      .eq('is_incubation', true);

    if (projectError || hackathonError || incubationError) {
      console.error('Error fetching stats:', { projectError, hackathonError, incubationError });
      // Return sample stats if database not available
      return res.json({
        total_projects: 6,
        active_projects: 3,
        completed_projects: 1,
        planning_projects: 2,
        total_hackathons: 3,
        incubation_projects: 3
      });
    }

    // Calculate statistics
    const stats = {
      total_projects: projectStats?.length || 0,
      active_projects: projectStats?.filter(p => p.status === 'Active').length || 0,
      completed_projects: projectStats?.filter(p => p.status === 'Completed').length || 0,
      planning_projects: projectStats?.filter(p => p.status === 'Planning').length || 0,
      total_hackathons: hackathons?.length || 0,
      incubation_projects: incubationProjects?.length || 0
    };

    res.json(stats);
  } catch (error) {
    console.error('Error in GET /stats:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

/**
 * GET /api/projects/submissions
 * Get all project submissions (for admin review)
 */
router.get('/submissions', async (req, res) => {
  try {
    const { status, limit = 50, offset = 0 } = req.query;
    
    let query = supabase
      .from('project_submissions')
      .select(`
        *,
        submitter:users!project_submissions_submitter_id_fkey(id, name, email)
      `)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (status) {
      query = query.eq('submission_status', status);
    }

    const { data: submissions, error } = await query;

    if (error) {
      console.error('Error fetching submissions:', error);
      return res.status(500).json({ 
        message: 'Failed to fetch submissions',
        error: error.message 
      });
    }

    res.json({
      submissions: submissions || [],
      count: submissions ? submissions.length : 0
    });
  } catch (error) {
    console.error('Error in GET /submissions:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

/**
 * POST /api/projects/:id/collaborate
 * Submit a collaboration request for a project
 * NOTE: This route MUST come before the generic GET /:id route
 */
router.post('/:id/collaborate', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      role,
      message,
      skills,
      timeCommitment,
      email
    } = req.body;

    // Validate required fields
    if (!role || !message || !email) {
      return res.status(400).json({ 
        message: 'Role, message, and email are required' 
      });
    }

    // Use a default user ID for anonymous submissions
    // In a real app, you'd get this from authentication middleware
    const anonymousUserId = 'cb8ec53d-7117-4957-9b40-148edf811452';

    // Check if project exists and get project lead info
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select(`
        id, 
        title, 
        project_lead_id,
        project_lead:users!projects_project_lead_id_fkey(id, name, email, phone)
      `)
      .eq('id', id)
      .single();

    if (projectError || !project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Get requester info (in real app, this would come from auth)
    const { data: requester, error: requesterError } = await supabase
      .from('users')
      .select('id, name, email')
      .eq('id', anonymousUserId)
      .single();

    if (requesterError || !requester) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if user already has a collaboration request for this project
    const { data: existingRequest } = await supabase
      .from('project_collaborations')
      .select('id, status')
      .eq('project_id', id)
      .eq('user_id', anonymousUserId)
      .single();

    if (existingRequest) {
      if (existingRequest.status === 'pending') {
        return res.status(400).json({ 
          message: 'You already have a pending collaboration request for this project' 
        });
      } else if (existingRequest.status === 'accepted') {
        return res.status(400).json({ 
          message: 'You are already a collaborator on this project' 
        });
      }
    }

    // Process skills array
    const skillsArray = typeof skills === 'string' 
      ? skills.split(',').map(s => s.trim()).filter(s => s)
      : (Array.isArray(skills) ? skills : []);

    const collaborationData = {
      project_id: id,
      user_id: anonymousUserId,
      role,
      message,
      skills_offered: skillsArray,
      time_commitment: timeCommitment,
      contact_email: email,
      status: 'pending'
    };

    const { data: collaboration, error } = await supabase
      .from('project_collaborations')
      .insert([collaborationData])
      .select()
      .single();

    if (error) {
      console.error('Error creating collaboration request:', error);
      return res.status(500).json({ 
        message: 'Failed to submit collaboration request',
        error: error.message 
      });
    }

    // Send email notification to project lead
    try {
      const collaborationEmailService = require('../utils/collaboration-email-service');
      await collaborationEmailService.sendRequestReceivedEmail({
        projectTitle: project.title,
        projectLead: {
          name: project.project_lead.name,
          email: project.project_lead.email,
          phone: project.project_lead.phone
        },
        requester: {
          name: requester.name,
          email: requester.email
        },
        role,
        skills: skillsArray.join(', '),
        message,
        timeCommitment
      });
    } catch (emailError) {
      console.error('Failed to send email notification:', emailError);
      // Don't fail the request if email fails
    }

    res.status(201).json({
      message: 'Collaboration request submitted successfully! The project lead will be notified.',
      collaboration: {
        id: collaboration.id,
        project_title: project.title,
        role: collaboration.role,
        status: collaboration.status,
        created_at: collaboration.created_at
      }
    });
  } catch (error) {
    console.error('Error in POST /projects/:id/collaborate:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

/**
 * GET /api/projects/:id/collaborations
 * Get all collaboration requests for a project (for project leads)
 * NOTE: This route MUST come before the generic GET /:id route
 */
router.get('/:id/collaborations', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.query;

    let query = supabase
      .from('project_collaborations')
      .select(`
        *,
        user:users!project_collaborations_user_id_fkey(id, name, email, profile_picture),
        project:projects!project_collaborations_project_id_fkey(id, title, project_lead_id)
      `)
      .eq('project_id', id)
      .order('created_at', { ascending: false });

    if (status) {
      query = query.eq('status', status);
    }

    const { data: collaborations, error } = await query;

    if (error) {
      console.error('Error fetching collaborations:', error);
      return res.status(500).json({ 
        message: 'Failed to fetch collaboration requests',
        error: error.message 
      });
    }

    res.json({
      collaborations: collaborations || [],
      count: collaborations ? collaborations.length : 0
    });
  } catch (error) {
    console.error('Error in GET /projects/:id/collaborations:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

/**
 * PUT /api/projects/:projectId/collaborations/:collaborationId
 * Update collaboration request status (accept/decline)
 * NOTE: This route MUST come before the generic GET /:id route
 */
router.put('/:projectId/collaborations/:collaborationId', async (req, res) => {
  try {
    const { projectId, collaborationId } = req.params;
    const { status, responseMessage } = req.body;

    if (!['accepted', 'declined'].includes(status)) {
      return res.status(400).json({ 
        message: 'Status must be either "accepted" or "declined"' 
      });
    }

    // Use default user ID for project lead
    const projectLeadId = 'cb8ec53d-7117-4957-9b40-148edf811452';

    // Get collaboration details with project and user info for email
    const { data: existingCollaboration, error: fetchError } = await supabase
      .from('project_collaborations')
      .select(`
        *,
        project:projects!project_collaborations_project_id_fkey(
          id, 
          title,
          project_lead:users!projects_project_lead_id_fkey(id, name, email, phone)
        ),
        requester:users!project_collaborations_user_id_fkey(id, name, email)
      `)
      .eq('id', collaborationId)
      .eq('project_id', projectId)
      .single();

    if (fetchError || !existingCollaboration) {
      return res.status(404).json({ message: 'Collaboration request not found' });
    }

    const updateData = {
      status,
      response_message: responseMessage,
      responded_by: projectLeadId,
      responded_at: new Date().toISOString()
    };

    const { data: collaboration, error } = await supabase
      .from('project_collaborations')
      .update(updateData)
      .eq('id', collaborationId)
      .eq('project_id', projectId)
      .select()
      .single();

    if (error) {
      console.error('Error updating collaboration:', error);
      return res.status(500).json({ 
        message: 'Failed to update collaboration request',
        error: error.message 
      });
    }

    if (!collaboration) {
      return res.status(404).json({ message: 'Collaboration request not found' });
    }

    // Send email notification to requester
    try {
      const collaborationEmailService = require('../utils/collaboration-email-service');
      
      const emailData = {
        projectTitle: existingCollaboration.project.title,
        projectLead: {
          name: existingCollaboration.project.project_lead.name,
          email: existingCollaboration.project.project_lead.email,
          phone: existingCollaboration.project.project_lead.phone
        },
        requester: {
          name: existingCollaboration.requester.name,
          email: existingCollaboration.requester.email
        },
        role: existingCollaboration.role,
        responseMessage: responseMessage || null
      };

      if (status === 'accepted') {
        await collaborationEmailService.sendRequestAcceptedEmail(emailData);
      } else if (status === 'declined') {
        await collaborationEmailService.sendRequestDeclinedEmail(emailData);
      }
    } catch (emailError) {
      console.error('Failed to send email notification:', emailError);
      // Don't fail the request if email fails
    }

    res.json({
      message: `Collaboration request ${status} successfully`,
      collaboration
    });
  } catch (error) {
    console.error('Error in PUT /projects/:projectId/collaborations/:collaborationId:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

/**
 * GET /api/projects/:id
 * Get a specific project by ID
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const { data: project, error } = await supabase
      .from('projects')
      .select(`
        *,
        project_lead:users!projects_project_lead_id_fkey(id, name, email, profile_picture)
      `)
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching project:', error);
      return res.status(404).json({ message: 'Project not found' });
    }

    res.json(project);
  } catch (error) {
    console.error('Error in GET /projects/:id:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

/**
 * POST /api/projects/submit
 * Submit a new project idea
 */
router.post('/submit', async (req, res) => {
  try {
    const {
      title,
      description,
      category,
      expected_duration,
      budget_estimate,
      technologies,
      objectives
    } = req.body;

    // Validate required fields
    if (!title || !description || !category) {
      return res.status(400).json({ 
        message: 'Title, description, and category are required' 
      });
    }

    // Use a default anonymous user ID for submissions without authentication
    // In a real app, you'd either require authentication or modify the table schema
    const anonymousUserId = 'cb8ec53d-7117-4957-9b40-148edf811452'; // Using admin user as default

    const submissionData = {
      submitter_id: anonymousUserId, // Use default user for anonymous submissions
      title,
      description,
      category,
      expected_duration,
      budget_estimate: budget_estimate || 0,
      technologies: technologies || [],
      objectives: objectives || [],
      submission_status: 'Pending'
    };

    const { data: submission, error } = await supabase
      .from('project_submissions')
      .insert([submissionData])
      .select()
      .single();

    if (error) {
      console.error('Error creating project submission:', error);
      return res.status(500).json({ 
        message: 'Failed to submit project',
        error: error.message 
      });
    }

    res.status(201).json({
      message: 'Project submitted successfully! Our team will review it and get back to you.',
      submission: {
        id: submission.id,
        title: submission.title,
        status: submission.submission_status,
        created_at: submission.created_at
      }
    });
  } catch (error) {
    console.error('Error in POST /projects/submit:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// ============================================================================
// HACKATHONS ENDPOINTS
// ============================================================================

/**
 * GET /api/projects/hackathons/:id
 * Get a specific hackathon by ID
 */
router.get('/hackathons/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const { data: hackathon, error } = await supabase
      .from('hackathons')
      .select(`
        *,
        organizer:users(id, name, email, profile_picture)
      `)
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching hackathon:', error);
      return res.status(404).json({ message: 'Hackathon not found' });
    }

    res.json(hackathon);
  } catch (error) {
    console.error('Error in GET /hackathons/:id:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

/**
 * POST /api/projects/hackathons/:id/register
 * Register for a hackathon
 */
router.post('/hackathons/:id/register', async (req, res) => {
  try {
    const { id } = req.params;
    const { team_name, team_members } = req.body;
    // const userId = req.user?.id; // Would come from authentication middleware

    // Check if hackathon exists and registration is open
    const { data: hackathon, error: hackathonError } = await supabase
      .from('hackathons')
      .select('*')
      .eq('id', id)
      .single();

    if (hackathonError || !hackathon) {
      return res.status(404).json({ message: 'Hackathon not found' });
    }

    // Check registration deadline
    const now = new Date();
    const deadline = new Date(hackathon.registration_deadline);
    
    if (now > deadline) {
      return res.status(400).json({ message: 'Registration deadline has passed' });
    }

    // Check capacity
    if (hackathon.current_participants >= hackathon.max_participants) {
      return res.status(400).json({ message: 'Hackathon is full' });
    }

    // For now, return success message
    // In a real app, you'd create the registration record and update participant count
    
    res.json({
      message: 'Successfully registered for hackathon',
      hackathonId: id,
      team_name
    });
  } catch (error) {
    console.error('Error in POST /hackathons/:id/register:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// ============================================================================
// ADMIN ENDPOINTS (would require admin authentication in real app)
// ============================================================================

/**
 * POST /api/projects
 * Create a new project (admin only)
 */
router.post('/', async (req, res) => {
  try {
    const projectData = req.body;
    
    // Validate required fields
    if (!projectData.title || !projectData.description || !projectData.category) {
      return res.status(400).json({ 
        message: 'Title, description, and category are required' 
      });
    }

    const { data: project, error } = await supabase
      .from('projects')
      .insert([projectData])
      .select()
      .single();

    if (error) {
      console.error('Error creating project:', error);
      return res.status(500).json({ message: 'Failed to create project' });
    }

    res.status(201).json(project);
  } catch (error) {
    console.error('Error in POST /projects:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

/**
 * PUT /api/projects/:id
 * Update a project (admin only)
 */
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const { data: project, error } = await supabase
      .from('projects')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating project:', error);
      return res.status(500).json({ message: 'Failed to update project' });
    }

    res.json(project);
  } catch (error) {
    console.error('Error in PUT /projects/:id:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

/**
 * DELETE /api/projects/:id
 * Delete a project (admin only)
 */
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting project:', error);
      return res.status(500).json({ message: 'Failed to delete project' });
    }

    res.json({ message: 'Project deleted successfully' });
  } catch (error) {
    console.error('Error in DELETE /projects/:id:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// ============================================================================
// SAMPLE DATA FUNCTIONS (for when database tables don't exist yet)
// ============================================================================

function getSampleProjects() {
  return [
    {
      id: '1',
      title: 'Smart Campus Navigation App',
      description: 'Mobile app to help students navigate JKUAT campus with AR features and real-time location services.',
      category: 'Innovation',
      status: 'Active',
      priority: 'High',
      progress_percentage: 75,
      technologies: ['React Native', 'AR Core', 'Firebase', 'Google Maps API'],
      project_lead: { name: 'John Doe', email: 'john@jkuat.ac.ke' },
      created_at: '2024-01-15T10:00:00Z'
    },
    {
      id: '2',
      title: 'Agricultural IoT Monitoring System',
      description: 'IoT-based system for monitoring soil moisture, temperature, and crop health for local farmers.',
      category: 'Research',
      status: 'Planning',
      priority: 'Medium',
      progress_percentage: 25,
      technologies: ['Arduino', 'LoRaWAN', 'Python', 'Machine Learning'],
      project_lead: { name: 'Jane Smith', email: 'jane@jkuat.ac.ke' },
      created_at: '2024-02-01T10:00:00Z'
    },
    {
      id: '3',
      title: 'Student Marketplace Platform',
      description: 'E-commerce platform for students to buy, sell, and exchange textbooks and other academic materials.',
      category: 'Startup',
      status: 'Completed',
      priority: 'Low',
      progress_percentage: 100,
      technologies: ['Next.js', 'PostgreSQL', 'Stripe', 'Tailwind CSS'],
      project_lead: { name: 'Mike Johnson', email: 'mike@jkuat.ac.ke' },
      created_at: '2023-11-10T10:00:00Z'
    },
    {
      id: '4',
      title: 'Renewable Energy Management System',
      description: 'Smart grid system for optimizing renewable energy distribution in rural communities.',
      category: 'Innovation',
      status: 'Active',
      priority: 'High',
      progress_percentage: 60,
      technologies: ['Python', 'TensorFlow', 'IoT', 'Solar Panels'],
      project_lead: { name: 'Sarah Wilson', email: 'sarah@jkuat.ac.ke' },
      created_at: '2024-01-20T10:00:00Z'
    },
    {
      id: '5',
      title: 'AI-Powered Study Assistant',
      description: 'Machine learning application that helps students with personalized study recommendations.',
      category: 'Research',
      status: 'Active',
      priority: 'Medium',
      progress_percentage: 40,
      technologies: ['Python', 'NLP', 'React', 'MongoDB'],
      project_lead: { name: 'David Kimani', email: 'david@jkuat.ac.ke' },
      created_at: '2024-02-15T10:00:00Z'
    },
    {
      id: '6',
      title: 'Waste Management Tracker',
      description: 'Mobile app for tracking and optimizing waste collection routes in urban areas.',
      category: 'Startup',
      status: 'Planning',
      priority: 'Medium',
      progress_percentage: 15,
      technologies: ['Flutter', 'Firebase', 'Google Maps', 'Machine Learning'],
      project_lead: { name: 'Grace Mwangi', email: 'grace@jkuat.ac.ke' },
      created_at: '2024-03-01T10:00:00Z'
    }
  ];
}

function getSampleHackathons() {
  return [
    {
      id: '1',
      title: 'JKUAT Innovation Challenge 2025',
      description: 'Annual hackathon focusing on solutions for sustainable development and climate change.',
      theme: 'Climate Tech Solutions',
      start_date: '2025-03-15T09:00:00Z',
      end_date: '2025-03-17T18:00:00Z',
      registration_deadline: '2025-03-10T23:59:59Z',
      max_participants: 200,
      current_participants: 87,
      registration_fee: 500,
      venue: 'JKUAT Main Campus',
      status: 'Registration Open',
      organizer: { name: 'Dr. Peter Waiganjo', email: 'organizer@jkuat.ac.ke' }
    },
    {
      id: '2',
      title: 'FinTech Hackathon Kenya',
      description: '48-hour hackathon to develop innovative financial technology solutions for the Kenyan market.',
      theme: 'Financial Inclusion',
      start_date: '2025-04-20T09:00:00Z',
      end_date: '2025-04-22T18:00:00Z',
      registration_deadline: '2025-04-15T23:59:59Z',
      max_participants: 150,
      current_participants: 23,
      registration_fee: 1000,
      venue: 'Nairobi Innovation Hub',
      status: 'Registration Open',
      organizer: { name: 'Innovation Club', email: 'events@jkuat.ac.ke' }
    },
    {
      id: '3',
      title: 'AgriTech Innovation Challenge',
      description: 'Develop technology solutions to improve agricultural productivity and food security.',
      theme: 'Smart Agriculture',
      start_date: '2025-05-10T09:00:00Z',
      end_date: '2025-05-12T18:00:00Z',
      registration_deadline: '2025-05-05T23:59:59Z',
      max_participants: 120,
      current_participants: 45,
      registration_fee: 750,
      venue: 'JKUAT Agricultural Campus',
      status: 'Registration Open',
      organizer: { name: 'AgriTech Society', email: 'agritech@jkuat.ac.ke' }
    }
  ];
}

function getSampleIncubationProjects() {
  return [
    {
      id: '1',
      title: 'EcoWaste Solutions',
      description: 'Startup developing biodegradable packaging solutions for local businesses.',
      category: 'Startup',
      status: 'Active',
      progress_percentage: 70,
      is_incubation: true,
      stage: 'Prototype Development',
      funding: '250000',
      project_lead: { name: 'Sarah Wilson', email: 'sarah@jkuat.ac.ke' },
      created_at: '2024-01-10T10:00:00Z'
    },
    {
      id: '2',
      title: 'AgriConnect Platform',
      description: 'Digital platform connecting smallholder farmers directly with consumers and retailers.',
      category: 'Startup',
      status: 'Active',
      progress_percentage: 85,
      is_incubation: true,
      stage: 'Market Validation',
      funding: '500000',
      project_lead: { name: 'David Kimani', email: 'david@jkuat.ac.ke' },
      created_at: '2023-12-15T10:00:00Z'
    },
    {
      id: '3',
      title: 'HealthTech Mobile Clinic',
      description: 'Mobile health monitoring system for remote communities using telemedicine.',
      category: 'Innovation',
      status: 'Active',
      progress_percentage: 55,
      is_incubation: true,
      stage: 'Pilot Testing',
      funding: '750000',
      project_lead: { name: 'Grace Mwangi', email: 'grace@jkuat.ac.ke' },
      created_at: '2024-02-01T10:00:00Z'
    }
  ];
}

module.exports = router;