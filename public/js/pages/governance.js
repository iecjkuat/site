// =============================================
// JKUAT Innovation Club - Governance Page JavaScript
// =============================================

let currentSection = 'meetings';
let currentPage = {
    meetings: 1,
    elections: 1,
    proposals: 1,
    documents: 1
};

let currentFilters = {
    meetings: { type: '', status: 'scheduled' },
    elections: { status: 'all' },
    proposals: { type: '', status: 'all' },
    documents: { type: '' }
};

let data = {
    meetings: [],
    elections: [],
    proposals: [],
    documents: [],
    meetingTypes: []
};

// Mock data for fallback when APIs fail
const mockData = {
    stats: {
        upcomingMeetings: 3,
        activeElections: 1,
        activeProposals: 2
    },
    
    meetingTypes: [
        { id: 1, name: 'Annual General Meeting', description: 'Yearly general assembly' },
        { id: 2, name: 'Special General Meeting', description: 'Special purpose meeting' },
        { id: 3, name: 'Executive Committee Meeting', description: 'Leadership team meeting' },
        { id: 4, name: 'Department Meeting', description: 'Departmental coordination' },
        { id: 5, name: 'Project Review Meeting', description: 'Project progress review' }
    ],
    
    meetings: [
        {
            id: '1',
            title: 'Annual General Meeting 2024',
            description: 'Our yearly AGM to review club performance, elect new leadership, and plan for the upcoming year.',
            meeting_date: '2024-12-30T14:00:00Z',
            venue: 'JKUAT Main Auditorium',
            virtual_link: 'https://meet.google.com/agm-2024',
            status: 'scheduled',
            agenda: `1. Opening and Welcome
2. Review of 2024 Activities
3. Financial Report
4. Elections for 2025 Leadership
5. Strategic Planning for 2025
6. Q&A Session
7. Closing Remarks`,
            quorum_required: 50,
            quorum_achieved: 0,
            attendee_count: 127,
            meeting_types: { name: 'Annual General Meeting', description: 'Yearly general assembly' }
        },
        {
            id: '2',
            title: 'Innovation Showcase Planning',
            description: 'Planning meeting for the upcoming innovation showcase event in February 2025.',
            meeting_date: '2024-12-28T10:00:00Z',
            venue: 'Innovation Lab, Room 204',
            status: 'scheduled',
            agenda: `1. Event Theme Selection
2. Budget Allocation
3. Venue Booking
4. Marketing Strategy
5. Judging Panel Selection
6. Timeline and Milestones`,
            quorum_required: 15,
            quorum_achieved: 0,
            attendee_count: 23,
            meeting_types: { name: 'Project Review Meeting', description: 'Project progress review' }
        },
        {
            id: '3',
            title: 'Executive Committee Meeting',
            description: 'Monthly executive committee meeting to discuss ongoing projects and strategic decisions.',
            meeting_date: '2025-01-05T16:00:00Z',
            venue: 'Executive Boardroom',
            virtual_link: 'https://zoom.us/j/exec-meeting',
            status: 'scheduled',
            agenda: `1. Review of December Activities
2. Budget Review and Approval
3. New Project Proposals
4. Partnership Opportunities
5. Member Feedback Review
6. Next Steps`,
            quorum_required: 7,
            quorum_achieved: 0,
            attendee_count: 12,
            meeting_types: { name: 'Executive Committee Meeting', description: 'Leadership team meeting' }
        },
        {
            id: '4',
            title: 'Tech Department Coordination',
            description: 'Coordination meeting for the technology department to align on current projects.',
            meeting_date: '2024-12-15T14:00:00Z',
            venue: 'Computer Lab 3',
            status: 'completed',
            agenda: `1. Project Status Updates
2. Resource Allocation
3. Technical Challenges Discussion
4. Collaboration Opportunities
5. Skills Development Planning`,
            quorum_required: 10,
            quorum_achieved: 12,
            attendee_count: 18,
            meeting_types: { name: 'Department Meeting', description: 'Departmental coordination' }
        },
        {
            id: '5',
            title: 'Constitution Review SGM',
            description: 'Special General Meeting to review and vote on proposed constitutional amendments.',
            meeting_date: '2024-11-20T15:00:00Z',
            venue: 'JKUAT Main Auditorium',
            status: 'completed',
            agenda: `1. Opening Remarks
2. Presentation of Proposed Amendments
3. Discussion and Debate
4. Voting on Amendments
5. Results Announcement
6. Closing`,
            quorum_required: 40,
            quorum_achieved: 67,
            attendee_count: 89,
            meeting_types: { name: 'Special General Meeting', description: 'Special purpose meeting' }
        }
    ],
    
    elections: [
        {
            id: '1',
            title: 'JKUAT Innovation Club Leadership Elections 2025',
            description: 'Annual elections for club leadership positions including President, Vice President, Secretary, Treasurer, and department heads.',
            election_type: 'annual_leadership',
            status: 'voting_open',
            start_date: '2024-12-20T00:00:00Z',
            end_date: '2024-12-31T23:59:59Z',
            nomination_start: '2024-12-01T00:00:00Z',
            nomination_end: '2024-12-15T23:59:59Z',
            campaign_start: '2024-12-16T00:00:00Z',
            campaign_end: '2024-12-19T23:59:59Z',
            position_count: 8,
            total_votes_cast: 156,
            eligible_voters_count: 234,
            results_published: false
        },
        {
            id: '2',
            title: 'Student Representative Elections',
            description: 'Elections for student representatives to the university innovation committee.',
            election_type: 'representative',
            status: 'completed',
            start_date: '2024-10-15T00:00:00Z',
            end_date: '2024-10-25T23:59:59Z',
            nomination_start: '2024-10-01T00:00:00Z',
            nomination_end: '2024-10-10T23:59:59Z',
            campaign_start: '2024-10-11T00:00:00Z',
            campaign_end: '2024-10-14T23:59:59Z',
            position_count: 3,
            total_votes_cast: 198,
            eligible_voters_count: 234,
            results_published: true
        },
        {
            id: '3',
            title: 'Project Lead Elections - Spring 2025',
            description: 'Elections for project leads for major innovation projects in the spring semester.',
            election_type: 'project_lead',
            status: 'upcoming',
            start_date: '2025-02-01T00:00:00Z',
            end_date: '2025-02-10T23:59:59Z',
            nomination_start: '2025-01-15T00:00:00Z',
            nomination_end: '2025-01-25T23:59:59Z',
            campaign_start: '2025-01-26T00:00:00Z',
            campaign_end: '2025-01-31T23:59:59Z',
            position_count: 5,
            total_votes_cast: 0,
            eligible_voters_count: 234,
            results_published: false
        }
    ],
    
    proposals: [
        {
            id: '1',
            title: 'Constitutional Amendment: Digital Voting System',
            description: 'Proposal to amend the constitution to allow for digital voting in club elections and major decisions.',
            proposal_type: 'constitutional_amendment',
            status: 'voting',
            content: `WHEREAS the current constitution requires physical presence for voting,
WHEREAS digital voting would increase participation and accessibility,
WHEREAS secure digital voting systems are now available,

BE IT RESOLVED that Article 12 of the club constitution be amended to include:
"Digital voting shall be permitted for all club elections and major decisions, provided that:
1. The voting system ensures voter anonymity
2. The system provides verifiable results
3. A backup physical voting option is available
4. The system is approved by the executive committee"`,
            created_at: '2024-12-10T10:00:00Z',
            voting_start: '2024-12-20T00:00:00Z',
            voting_end: '2024-12-30T23:59:59Z',
            votes_for: 45,
            votes_against: 12,
            votes_abstain: 8,
            vote_counts: { for: 45, against: 12, abstain: 8 },
            users: { name: 'Sarah Kimani', email: 'sarah.kimani@student.jkuat.ac.ke' },
            seconded_by: '2'
        },
        {
            id: '2',
            title: 'Budget Allocation: Innovation Lab Equipment',
            description: 'Proposal to allocate KES 500,000 for new equipment in the innovation lab including 3D printers and development boards.',
            proposal_type: 'budget_approval',
            status: 'under_review',
            content: `BUDGET REQUEST: Innovation Lab Equipment Upgrade

Total Amount: KES 500,000

Equipment List:
1. 3D Printer (Prusa i3 MK3S+) - KES 180,000
2. Arduino Development Kits (20 units) - KES 60,000
3. Raspberry Pi 4 Kits (15 units) - KES 90,000
4. Electronic Components Kit - KES 50,000
5. Soldering Station and Tools - KES 40,000
6. Multimeters and Testing Equipment - KES 45,000
7. Installation and Setup - KES 35,000

Justification:
- Current equipment is outdated and insufficient
- High demand from members for hands-on projects
- Will enable more advanced innovation projects
- Expected to increase member engagement by 40%`,
            created_at: '2024-12-15T14:30:00Z',
            votes_for: 0,
            votes_against: 0,
            votes_abstain: 0,
            vote_counts: { for: 0, against: 0, abstain: 0 },
            users: { name: 'Michael Ochieng', email: 'michael.ochieng@student.jkuat.ac.ke' },
            seconded_by: '3'
        },
        {
            id: '3',
            title: 'Policy Change: Meeting Attendance Requirements',
            description: 'Proposal to modify attendance requirements for executive committee members.',
            proposal_type: 'policy_change',
            status: 'passed',
            content: `POLICY AMENDMENT: Executive Committee Attendance

Current Policy: Executive members must attend 100% of meetings
Proposed Policy: Executive members must attend minimum 80% of meetings

Rationale:
- Current policy is too rigid and doesn't account for legitimate absences
- 80% attendance still ensures commitment while allowing flexibility
- Aligns with best practices from other student organizations
- Includes provision for advance notice of absence

Implementation:
- Takes effect from January 2025
- Attendance tracking system to be implemented
- Monthly attendance reports to be published`,
            created_at: '2024-11-25T09:15:00Z',
            votes_for: 67,
            votes_against: 15,
            votes_abstain: 3,
            vote_counts: { for: 67, against: 15, abstain: 3 },
            users: { name: 'Grace Wanjiku', email: 'grace.wanjiku@student.jkuat.ac.ke' },
            seconded_by: '4'
        },
        {
            id: '4',
            title: 'Special Resolution: Partnership with Tech Companies',
            description: 'Resolution to establish formal partnerships with local tech companies for internships and mentorship.',
            proposal_type: 'special_resolution',
            status: 'draft',
            content: `SPECIAL RESOLUTION: Industry Partnership Program

Objective: Establish formal partnerships with technology companies to provide:
1. Internship opportunities for club members
2. Mentorship programs
3. Guest speaker sessions
4. Project collaboration opportunities
5. Career guidance and networking

Target Partners:
- Safaricom PLC
- Equity Bank (Fintech Division)
- iHub Nairobi
- Microsoft Kenya
- Google Developer Groups Kenya

Benefits:
- Enhanced career prospects for members
- Real-world project experience
- Industry insights and trends
- Potential job placements
- Club reputation enhancement

Implementation Timeline:
- Phase 1: Initial outreach (January 2025)
- Phase 2: MOU negotiations (February 2025)
- Phase 3: Program launch (March 2025)`,
            created_at: '2024-12-18T16:45:00Z',
            votes_for: 0,
            votes_against: 0,
            votes_abstain: 0,
            vote_counts: { for: 0, against: 0, abstain: 0 },
            users: { name: 'David Mutua', email: 'david.mutua@student.jkuat.ac.ke' },
            seconded_by: null
        }
    ],
    
    documents: [
        {
            id: '1',
            title: 'JKUAT Innovation Club Constitution',
            document_type: 'constitution',
            version: '2.1',
            status: 'active',
            effective_date: '2024-01-15T00:00:00Z',
            content: `CONSTITUTION OF JKUAT INNOVATION AND ENTREPRENEURSHIP CLUB

ARTICLE I: NAME AND PURPOSE
1.1 The name of this organization shall be "JKUAT Innovation and Entrepreneurship Club"
1.2 The purpose is to foster innovation, entrepreneurship, and technological advancement among students

ARTICLE II: MEMBERSHIP
2.1 Membership is open to all JKUAT students in good academic standing
2.2 Members must pay annual dues as determined by the executive committee
2.3 Members have voting rights in club elections and major decisions

ARTICLE III: LEADERSHIP STRUCTURE
3.1 The club shall be led by an Executive Committee consisting of:
    - President
    - Vice President
    - Secretary
    - Treasurer
    - Department Heads (Technology, Business, Marketing, Events)

ARTICLE IV: ELECTIONS
4.1 Elections shall be held annually in December
4.2 All positions are elected by simple majority vote
4.3 Candidates must be nominated and seconded by club members

ARTICLE V: MEETINGS
5.1 General meetings shall be held monthly
5.2 Special meetings may be called by the President or by petition of 25% of members
5.3 Quorum for general meetings is 30% of active membership

ARTICLE VI: AMENDMENTS
6.1 This constitution may be amended by a two-thirds majority vote
6.2 Proposed amendments must be presented at least one week before voting
6.3 All members must be notified of proposed amendments`,
            users: { name: 'System Administrator' },
            file_url: '/documents/constitution-v2.1.pdf'
        },
        {
            id: '2',
            title: 'Club Bylaws and Operating Procedures',
            document_type: 'bylaws',
            version: '1.3',
            status: 'active',
            effective_date: '2024-03-01T00:00:00Z',
            content: `BYLAWS OF JKUAT INNOVATION AND ENTREPRENEURSHIP CLUB

SECTION 1: MEMBERSHIP PROCEDURES
1.1 New Member Registration
    - Complete membership form
    - Pay annual dues (KES 500)
    - Attend orientation session
    - Sign code of conduct

1.2 Member Benefits
    - Access to innovation lab
    - Participation in projects
    - Networking opportunities
    - Skill development workshops

SECTION 2: MEETING PROCEDURES
2.1 Meeting Schedule
    - General meetings: First Friday of each month
    - Executive meetings: Weekly on Wednesdays
    - Special meetings: As needed

2.2 Meeting Conduct
    - Follow Robert's Rules of Order
    - Maintain respectful discourse
    - Record minutes for all meetings

SECTION 3: FINANCIAL PROCEDURES
3.1 Budget Management
    - Annual budget approved by general meeting
    - Monthly financial reports
    - Treasurer oversight of all expenditures

3.2 Fundraising
    - Executive committee approval required
    - Transparent reporting of funds raised
    - Proper documentation of all transactions

SECTION 4: PROJECT MANAGEMENT
4.1 Project Approval Process
    - Submit project proposal
    - Executive committee review
    - Resource allocation approval
    - Progress monitoring

SECTION 5: DISCIPLINARY PROCEDURES
5.1 Code of Conduct Violations
    - Warning for minor violations
    - Suspension for serious violations
    - Expulsion for severe violations
    - Appeal process available`,
            users: { name: 'Executive Committee' },
            file_url: '/documents/bylaws-v1.3.pdf'
        },
        {
            id: '3',
            title: 'Innovation Lab Usage Policy',
            document_type: 'policy',
            version: '1.0',
            status: 'active',
            effective_date: '2024-09-01T00:00:00Z',
            content: `INNOVATION LAB USAGE POLICY

PURPOSE
This policy governs the use of the JKUAT Innovation Club laboratory facilities to ensure safe, productive, and equitable access for all members.

ELIGIBILITY
- Current club members in good standing
- Completed lab safety training
- Signed equipment usage agreement

OPERATING HOURS
- Monday-Friday: 8:00 AM - 8:00 PM
- Saturday: 9:00 AM - 5:00 PM
- Sunday: Closed (except for special projects)

BOOKING SYSTEM
- Reserve equipment through online booking system
- Maximum 4-hour sessions during peak hours
- 24-hour advance booking required for specialized equipment

SAFETY REQUIREMENTS
- Safety glasses required at all times
- Closed-toe shoes mandatory
- No food or drinks in lab areas
- Report all accidents immediately

EQUIPMENT USAGE
- Training required before using any equipment
- Clean and return equipment after use
- Report damage or malfunctions immediately
- No personal projects without approval

VIOLATIONS
- First violation: Verbal warning
- Second violation: Written warning and mandatory retraining
- Third violation: Lab access suspension (30 days)
- Serious violations: Immediate suspension and disciplinary action`,
            users: { name: 'Lab Committee' },
            file_url: '/documents/lab-policy-v1.0.pdf'
        },
        {
            id: '4',
            title: 'Event Organization Procedures',
            document_type: 'procedure',
            version: '1.2',
            status: 'active',
            effective_date: '2024-06-15T00:00:00Z',
            content: `EVENT ORGANIZATION PROCEDURES

PLANNING PHASE (8-12 weeks before event)
1. Event Proposal
   - Submit detailed event proposal to executive committee
   - Include objectives, target audience, budget estimate
   - Obtain approval before proceeding

2. Budget Planning
   - Prepare detailed budget breakdown
   - Identify funding sources
   - Get treasurer approval for expenditures

3. Venue and Date
   - Book venue well in advance
   - Consider academic calendar conflicts
   - Ensure accessibility requirements

PREPARATION PHASE (4-8 weeks before event)
1. Marketing and Promotion
   - Create marketing materials
   - Social media campaign
   - Campus-wide announcements

2. Logistics
   - Arrange catering if applicable
   - Set up registration system
   - Prepare materials and equipment

3. Speakers and Guests
   - Confirm speaker availability
   - Arrange travel and accommodation
   - Prepare speaker briefing materials

EXECUTION PHASE (Event day)
1. Setup
   - Arrive 2 hours early for setup
   - Test all equipment
   - Brief all volunteers

2. Event Management
   - Registration and check-in
   - Time management
   - Handle unexpected issues

3. Documentation
   - Take photos and videos
   - Collect feedback forms
   - Record attendance

POST-EVENT PHASE (1-2 weeks after event)
1. Evaluation
   - Analyze feedback
   - Financial reconciliation
   - Lessons learned documentation

2. Follow-up
   - Thank speakers and sponsors
   - Share event highlights
   - Plan improvements for future events`,
            users: { name: 'Events Committee' },
            file_url: '/documents/event-procedures-v1.2.pdf'
        }
    ]
};

// Initialize page
document.addEventListener('DOMContentLoaded', async function() {
    try {
        // Load navigation
        const navResponse = await fetch('/templates/components/navigation.html');
        const navHTML = await navResponse.text();
        document.getElementById('navigation-placeholder').innerHTML = navHTML;
        
        console.log('✅ Navigation loaded successfully');
        
        // Initialize governance page
        await initializeGovernance();
        
    } catch (error) {
        console.error('❌ Error loading templates:', error);
    }
});

async function initializeGovernance() {
    console.log('🚀 Initializing Governance page...');
    
    try {
        await loadMeetingTypes();
        await loadStats();
        setupEventListeners();
        await showSection('meetings'); // Default section
        
        console.log('✅ Governance page initialized successfully');
        
    } catch (error) {
        console.error('❌ Error initializing governance:', error);
        showNotification('Failed to load governance data', 'error');
    }
}

// =============================================
// SECTION MANAGEMENT
// =============================================

async function showSection(section) {
    currentSection = section;
    
    // Hide all sections
    document.querySelectorAll('.content-section').forEach(sec => {
        sec.style.display = 'none';
    });
    
    // Show selected section
    document.getElementById(`${section}Section`).style.display = 'block';
    
    // Load data for the section
    switch(section) {
        case 'meetings':
            await loadMeetings();
            break;
        case 'elections':
            await loadElections();
            break;
        case 'proposals':
            await loadProposals();
            break;
        case 'documents':
            await loadDocuments();
            break;
    }
}

// =============================================
// DATA LOADING FUNCTIONS
// =============================================

async function loadStats() {
    try {
        // Try to load from API first
        const [meetingsRes, electionsRes, proposalsRes] = await Promise.all([
            fetch('/api/meetings?status=scheduled&limit=100'),
            fetch('/api/elections?status=voting_open,nomination_open&limit=100'),
            fetch('/api/governance/proposals?status=voting,under_review&limit=100')
        ]);
        
        if (meetingsRes.ok && electionsRes.ok && proposalsRes.ok) {
            const meetingsData = await meetingsRes.json();
            const electionsData = await electionsRes.json();
            const proposalsData = await proposalsRes.json();
            
            document.getElementById('upcomingMeetingsCount').textContent = meetingsData.meetings?.length || 0;
            document.getElementById('activeElectionsCount').textContent = electionsData.elections?.length || 0;
            document.getElementById('activeProposalsCount').textContent = proposalsData.proposals?.length || 0;
        } else {
            throw new Error('API failed, using mock data');
        }
        
    } catch (error) {
        console.log('📊 Using mock stats data');
        // Use mock data as fallback
        document.getElementById('upcomingMeetingsCount').textContent = mockData.stats.upcomingMeetings;
        document.getElementById('activeElectionsCount').textContent = mockData.stats.activeElections;
        document.getElementById('activeProposalsCount').textContent = mockData.stats.activeProposals;
    }
}

async function loadMeetingTypes() {
    try {
        const response = await fetch('/api/meetings/types');
        if (response.ok) {
            data.meetingTypes = await response.json();
            renderMeetingTypeFilter();
        } else {
            throw new Error('API failed');
        }
    } catch (error) {
        console.log('📊 Using mock meeting types data');
        data.meetingTypes = mockData.meetingTypes;
        renderMeetingTypeFilter();
    }
}

async function loadMeetings() {
    try {
        const params = new URLSearchParams({
            page: currentPage.meetings,
            limit: 6,
            type: currentFilters.meetings.type,
            status: currentFilters.meetings.status
        });
        
        const response = await fetch(`/api/meetings?${params}`);
        if (response.ok) {
            const result = await response.json();
            
            if (currentPage.meetings === 1) {
                data.meetings = result.meetings;
            } else {
                data.meetings = [...data.meetings, ...result.meetings];
            }
            
            renderMeetings();
            
            // Show/hide load more button
            const loadMoreBtn = document.getElementById('loadMoreMeetings');
            if (result.pagination && result.pagination.current < result.pagination.total) {
                loadMoreBtn.style.display = 'block';
            } else {
                loadMoreBtn.style.display = 'none';
            }
        } else {
            throw new Error('API failed');
        }
    } catch (error) {
        console.log('📊 Using mock meetings data');
        // Use mock data as fallback
        let filteredMeetings = mockData.meetings;
        
        // Apply filters to mock data
        if (currentFilters.meetings.status !== 'all') {
            filteredMeetings = filteredMeetings.filter(meeting => meeting.status === currentFilters.meetings.status);
        }
        
        if (currentFilters.meetings.type) {
            filteredMeetings = filteredMeetings.filter(meeting => 
                meeting.meeting_types?.name?.toLowerCase().includes(currentFilters.meetings.type.toLowerCase())
            );
        }
        
        data.meetings = filteredMeetings;
        renderMeetings();
        
        // Hide load more button for mock data
        document.getElementById('loadMoreMeetings').style.display = 'none';
    }
}

async function loadElections() {
    try {
        const params = new URLSearchParams({
            page: currentPage.elections,
            limit: 6,
            status: currentFilters.elections.status
        });
        
        const response = await fetch(`/api/elections?${params}`);
        if (response.ok) {
            const result = await response.json();
            
            if (currentPage.elections === 1) {
                data.elections = result.elections;
            } else {
                data.elections = [...data.elections, ...result.elections];
            }
            
            renderElections();
        } else {
            throw new Error('API failed');
        }
    } catch (error) {
        console.log('📊 Using mock elections data');
        // Use mock data as fallback
        let filteredElections = mockData.elections;
        
        // Apply filters to mock data
        if (currentFilters.elections.status !== 'all') {
            filteredElections = filteredElections.filter(election => election.status === currentFilters.elections.status);
        }
        
        data.elections = filteredElections;
        renderElections();
    }
}

async function loadProposals() {
    try {
        const params = new URLSearchParams({
            page: currentPage.proposals,
            limit: 6,
            type: currentFilters.proposals.type,
            status: currentFilters.proposals.status
        });
        
        const response = await fetch(`/api/governance/proposals?${params}`);
        if (response.ok) {
            const result = await response.json();
            
            if (currentPage.proposals === 1) {
                data.proposals = result.proposals;
            } else {
                data.proposals = [...data.proposals, ...result.proposals];
            }
            
            renderProposals();
        } else {
            throw new Error('API failed');
        }
    } catch (error) {
        console.log('📊 Using mock proposals data');
        // Use mock data as fallback
        let filteredProposals = mockData.proposals;
        
        // Apply filters to mock data
        if (currentFilters.proposals.status !== 'all') {
            filteredProposals = filteredProposals.filter(proposal => proposal.status === currentFilters.proposals.status);
        }
        
        if (currentFilters.proposals.type) {
            filteredProposals = filteredProposals.filter(proposal => proposal.proposal_type === currentFilters.proposals.type);
        }
        
        data.proposals = filteredProposals;
        renderProposals();
    }
}

async function loadDocuments() {
    try {
        const params = new URLSearchParams({
            type: currentFilters.documents.type,
            status: 'active'
        });
        
        const response = await fetch(`/api/meetings/documents?${params}`);
        if (response.ok) {
            data.documents = await response.json();
            renderDocuments();
        } else {
            throw new Error('API failed');
        }
    } catch (error) {
        console.log('📊 Using mock documents data');
        // Use mock data as fallback
        let filteredDocuments = mockData.documents;
        
        // Apply filters to mock data
        if (currentFilters.documents.type) {
            filteredDocuments = filteredDocuments.filter(doc => doc.document_type === currentFilters.documents.type);
        }
        
        data.documents = filteredDocuments;
        renderDocuments();
    }
}

// =============================================
// RENDERING FUNCTIONS
// =============================================

function renderMeetingTypeFilter() {
    const select = document.getElementById('meetingTypeFilter');
    data.meetingTypes.forEach(type => {
        const option = document.createElement('option');
        option.value = type.id;
        option.textContent = type.name;
        select.appendChild(option);
    });
}

function renderMeetings() {
    const container = document.getElementById('meetingsGrid');
    
    if (data.meetings.length === 0) {
        container.innerHTML = `
            <div class="glass-card" style="padding: 3rem; text-align: center; grid-column: 1 / -1;">
                <i class="fas fa-calendar-times" style="font-size: 3rem; color: #64748b; margin-bottom: 1rem;"></i>
                <h3 style="color: white; margin-bottom: 1rem;">No Meetings Found</h3>
                <p style="color: rgba(255, 255, 255, 0.8);">No meetings match your current filters.</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = data.meetings.map(meeting => createMeetingCard(meeting)).join('');
}

function createMeetingCard(meeting) {
    const meetingDate = new Date(meeting.meeting_date);
    const isUpcoming = meetingDate > new Date();
    const statusColors = {
        'scheduled': '#3b82f6',
        'ongoing': '#10b981',
        'completed': '#6b7280',
        'cancelled': '#ef4444',
        'postponed': '#f59e0b'
    };
    
    return `
        <div class="glass-card meeting-card" style="padding: 2rem; cursor: pointer; position: relative;" onclick="openMeetingModal('${meeting.id}')">
            <div style="position: absolute; top: 0; left: 0; width: 100%; height: 4px; background: ${statusColors[meeting.status] || '#6b7280'};"></div>
            
            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1rem;">
                <span style="background: ${statusColors[meeting.status]}20; color: ${statusColors[meeting.status]}; padding: 0.5rem 1rem; border-radius: 20px; font-size: 0.875rem; font-weight: 600; text-transform: capitalize;">
                    ${meeting.status}
                </span>
                <span style="color: rgba(255, 255, 255, 0.6); font-size: 0.875rem;">
                    ${meeting.meeting_types?.name || 'Meeting'}
                </span>
            </div>
            
            <h3 style="font-size: 1.25rem; font-weight: 700; color: white; margin-bottom: 0.75rem; line-height: 1.3;">
                ${meeting.title}
            </h3>
            
            <p style="color: rgba(255, 255, 255, 0.8); line-height: 1.6; font-size: 0.875rem; margin-bottom: 1.5rem;">
                ${meeting.description ? (meeting.description.length > 120 ? meeting.description.substring(0, 120) + '...' : meeting.description) : 'No description available'}
            </p>
            
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1.5rem; font-size: 0.875rem;">
                <div style="display: flex; align-items: center; color: rgba(255, 255, 255, 0.8);">
                    <i class="fas fa-calendar" style="margin-right: 0.5rem; color: #3b82f6; width: 16px;"></i>
                    <span>${meetingDate.toLocaleDateString()}</span>
                </div>
                <div style="display: flex; align-items: center; color: rgba(255, 255, 255, 0.8);">
                    <i class="fas fa-clock" style="margin-right: 0.5rem; color: #10b981; width: 16px;"></i>
                    <span>${meetingDate.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                </div>
                <div style="display: flex; align-items: center; color: rgba(255, 255, 255, 0.8);">
                    <i class="fas fa-map-marker-alt" style="margin-right: 0.5rem; color: #f59e0b; width: 16px;"></i>
                    <span>${meeting.venue || 'TBD'}</span>
                </div>
                <div style="display: flex; align-items: center; color: rgba(255, 255, 255, 0.8);">
                    <i class="fas fa-users" style="margin-right: 0.5rem; color: #f472b6; width: 16px;"></i>
                    <span>${meeting.attendee_count || 0} attending</span>
                </div>
            </div>
            
            <div style="display: flex; gap: 0.75rem; flex-wrap: wrap;">
                <button class="btn btn-outline btn-sm" onclick="event.stopPropagation(); openMeetingModal('${meeting.id}')">
                    <i class="fas fa-info-circle"></i>Details
                </button>
                ${isUpcoming ? `
                    <button class="btn btn-primary btn-sm" onclick="event.stopPropagation(); rsvpToMeeting('${meeting.id}')">
                        <i class="fas fa-check"></i>RSVP
                    </button>
                ` : ''}
                ${meeting.virtual_link ? `
                    <button class="btn btn-secondary btn-sm" onclick="event.stopPropagation(); window.open('${meeting.virtual_link}', '_blank')">
                        <i class="fas fa-video"></i>Join
                    </button>
                ` : ''}
            </div>
        </div>
    `;
}

function renderElections() {
    const container = document.getElementById('electionsGrid');
    
    if (data.elections.length === 0) {
        container.innerHTML = `
            <div class="glass-card" style="padding: 3rem; text-align: center; grid-column: 1 / -1;">
                <i class="fas fa-vote-yea" style="font-size: 3rem; color: #64748b; margin-bottom: 1rem;"></i>
                <h3 style="color: white; margin-bottom: 1rem;">No Elections Found</h3>
                <p style="color: rgba(255, 255, 255, 0.8);">No elections match your current filters.</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = data.elections.map(election => createElectionCard(election)).join('');
}

function createElectionCard(election) {
    const startDate = new Date(election.start_date);
    const endDate = new Date(election.end_date);
    const statusColors = {
        'upcoming': '#6b7280',
        'nomination_open': '#f59e0b',
        'campaign_period': '#8b5cf6',
        'voting_open': '#10b981',
        'completed': '#3b82f6',
        'cancelled': '#ef4444'
    };
    
    return `
        <div class="glass-card election-card" style="padding: 2rem; cursor: pointer; position: relative;" onclick="openElectionModal('${election.id}')">
            <div style="position: absolute; top: 0; left: 0; width: 100%; height: 4px; background: ${statusColors[election.status] || '#6b7280'};"></div>
            
            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1rem;">
                <span style="background: ${statusColors[election.status]}20; color: ${statusColors[election.status]}; padding: 0.5rem 1rem; border-radius: 20px; font-size: 0.875rem; font-weight: 600; text-transform: capitalize;">
                    ${election.status.replace('_', ' ')}
                </span>
                <span style="color: rgba(255, 255, 255, 0.6); font-size: 0.875rem; text-transform: capitalize;">
                    ${election.election_type}
                </span>
            </div>
            
            <h3 style="font-size: 1.25rem; font-weight: 700; color: white; margin-bottom: 0.75rem; line-height: 1.3;">
                ${election.title}
            </h3>
            
            <p style="color: rgba(255, 255, 255, 0.8); line-height: 1.6; font-size: 0.875rem; margin-bottom: 1.5rem;">
                ${election.description ? (election.description.length > 120 ? election.description.substring(0, 120) + '...' : election.description) : 'No description available'}
            </p>
            
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1.5rem; font-size: 0.875rem;">
                <div style="display: flex; align-items: center; color: rgba(255, 255, 255, 0.8);">
                    <i class="fas fa-calendar-check" style="margin-right: 0.5rem; color: #10b981; width: 16px;"></i>
                    <span>${startDate.toLocaleDateString()}</span>
                </div>
                <div style="display: flex; align-items: center; color: rgba(255, 255, 255, 0.8);">
                    <i class="fas fa-calendar-times" style="margin-right: 0.5rem; color: #ef4444; width: 16px;"></i>
                    <span>${endDate.toLocaleDateString()}</span>
                </div>
                <div style="display: flex; align-items: center; color: rgba(255, 255, 255, 0.8);">
                    <i class="fas fa-users" style="margin-right: 0.5rem; color: #3b82f6; width: 16px;"></i>
                    <span>${election.position_count || 0} positions</span>
                </div>
                <div style="display: flex; align-items: center; color: rgba(255, 255, 255, 0.8);">
                    <i class="fas fa-chart-bar" style="margin-right: 0.5rem; color: #f472b6; width: 16px;"></i>
                    <span>${election.total_votes_cast || 0} votes</span>
                </div>
            </div>
            
            <div style="display: flex; gap: 0.75rem; flex-wrap: wrap;">
                <button class="btn btn-outline btn-sm" onclick="event.stopPropagation(); openElectionModal('${election.id}')">
                    <i class="fas fa-info-circle"></i>Details
                </button>
                ${election.status === 'voting_open' ? `
                    <button class="btn btn-primary btn-sm" onclick="event.stopPropagation(); voteInElection('${election.id}')">
                        <i class="fas fa-vote-yea"></i>Vote
                    </button>
                ` : ''}
                ${election.status === 'nomination_open' ? `
                    <button class="btn btn-secondary btn-sm" onclick="event.stopPropagation(); nominateForElection('${election.id}')">
                        <i class="fas fa-hand-paper"></i>Nominate
                    </button>
                ` : ''}
            </div>
        </div>
    `;
}

function renderProposals() {
    const container = document.getElementById('proposalsGrid');
    
    if (data.proposals.length === 0) {
        container.innerHTML = `
            <div class="glass-card" style="padding: 3rem; text-align: center; grid-column: 1 / -1;">
                <i class="fas fa-file-alt" style="font-size: 3rem; color: #64748b; margin-bottom: 1rem;"></i>
                <h3 style="color: white; margin-bottom: 1rem;">No Proposals Found</h3>
                <p style="color: rgba(255, 255, 255, 0.8);">No proposals match your current filters.</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = data.proposals.map(proposal => createProposalCard(proposal)).join('');
}

function createProposalCard(proposal) {
    const statusColors = {
        'draft': '#6b7280',
        'submitted': '#f59e0b',
        'under_review': '#8b5cf6',
        'voting': '#10b981',
        'passed': '#3b82f6',
        'rejected': '#ef4444',
        'withdrawn': '#64748b'
    };
    
    const totalVotes = (proposal.vote_counts?.for || 0) + (proposal.vote_counts?.against || 0) + (proposal.vote_counts?.abstain || 0);
    
    return `
        <div class="glass-card proposal-card" style="padding: 2rem; cursor: pointer; position: relative;" onclick="openProposalModal('${proposal.id}')">
            <div style="position: absolute; top: 0; left: 0; width: 100%; height: 4px; background: ${statusColors[proposal.status] || '#6b7280'};"></div>
            
            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1rem;">
                <span style="background: ${statusColors[proposal.status]}20; color: ${statusColors[proposal.status]}; padding: 0.5rem 1rem; border-radius: 20px; font-size: 0.875rem; font-weight: 600; text-transform: capitalize;">
                    ${proposal.status.replace('_', ' ')}
                </span>
                <span style="color: rgba(255, 255, 255, 0.6); font-size: 0.875rem; text-transform: capitalize;">
                    ${proposal.proposal_type.replace('_', ' ')}
                </span>
            </div>
            
            <h3 style="font-size: 1.25rem; font-weight: 700; color: white; margin-bottom: 0.75rem; line-height: 1.3;">
                ${proposal.title}
            </h3>
            
            <p style="color: rgba(255, 255, 255, 0.8); line-height: 1.6; font-size: 0.875rem; margin-bottom: 1.5rem;">
                ${proposal.description ? (proposal.description.length > 120 ? proposal.description.substring(0, 120) + '...' : proposal.description) : 'No description available'}
            </p>
            
            ${totalVotes > 0 ? `
                <div style="margin-bottom: 1.5rem;">
                    <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem; font-size: 0.875rem;">
                        <span style="color: rgba(255, 255, 255, 0.8);">Voting Progress</span>
                        <span style="color: white; font-weight: 600;">${totalVotes} votes</span>
                    </div>
                    <div style="background: rgba(255, 255, 255, 0.1); border-radius: 10px; height: 8px; overflow: hidden;">
                        <div style="display: flex; height: 100%;">
                            <div style="background: #10b981; width: ${totalVotes > 0 ? ((proposal.vote_counts?.for || 0) / totalVotes) * 100 : 0}%;"></div>
                            <div style="background: #ef4444; width: ${totalVotes > 0 ? ((proposal.vote_counts?.against || 0) / totalVotes) * 100 : 0}%;"></div>
                            <div style="background: #6b7280; width: ${totalVotes > 0 ? ((proposal.vote_counts?.abstain || 0) / totalVotes) * 100 : 0}%;"></div>
                        </div>
                    </div>
                    <div style="display: flex; gap: 1rem; margin-top: 0.5rem; font-size: 0.75rem;">
                        <span style="color: #10b981;">For: ${proposal.vote_counts?.for || 0}</span>
                        <span style="color: #ef4444;">Against: ${proposal.vote_counts?.against || 0}</span>
                        <span style="color: #6b7280;">Abstain: ${proposal.vote_counts?.abstain || 0}</span>
                    </div>
                </div>
            ` : ''}
            
            <div style="display: flex; gap: 0.75rem; flex-wrap: wrap;">
                <button class="btn btn-outline btn-sm" onclick="event.stopPropagation(); openProposalModal('${proposal.id}')">
                    <i class="fas fa-info-circle"></i>Details
                </button>
                ${proposal.status === 'voting' ? `
                    <button class="btn btn-primary btn-sm" onclick="event.stopPropagation(); voteOnProposal('${proposal.id}')">
                        <i class="fas fa-vote-yea"></i>Vote
                    </button>
                ` : ''}
                ${proposal.status === 'draft' && !proposal.seconded_by ? `
                    <button class="btn btn-secondary btn-sm" onclick="event.stopPropagation(); secondProposal('${proposal.id}')">
                        <i class="fas fa-handshake"></i>Second
                    </button>
                ` : ''}
            </div>
        </div>
    `;
}

function renderDocuments() {
    const container = document.getElementById('documentsGrid');
    
    if (data.documents.length === 0) {
        container.innerHTML = `
            <div class="glass-card" style="padding: 3rem; text-align: center; grid-column: 1 / -1;">
                <i class="fas fa-file-contract" style="font-size: 3rem; color: #64748b; margin-bottom: 1rem;"></i>
                <h3 style="color: white; margin-bottom: 1rem;">No Documents Found</h3>
                <p style="color: rgba(255, 255, 255, 0.8);">No documents match your current filters.</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = data.documents.map(document => createDocumentCard(document)).join('');
}

function createDocumentCard(document) {
    const typeColors = {
        'constitution': '#3b82f6',
        'bylaws': '#10b981',
        'policy': '#f59e0b',
        'procedure': '#8b5cf6'
    };
    
    const effectiveDate = new Date(document.effective_date);
    
    return `
        <div class="glass-card document-card" style="padding: 2rem; cursor: pointer; position: relative;" onclick="openDocumentModal('${document.id}')">
            <div style="position: absolute; top: 0; left: 0; width: 100%; height: 4px; background: ${typeColors[document.document_type] || '#6b7280'};"></div>
            
            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1rem;">
                <span style="background: ${typeColors[document.document_type]}20; color: ${typeColors[document.document_type]}; padding: 0.5rem 1rem; border-radius: 20px; font-size: 0.875rem; font-weight: 600; text-transform: capitalize;">
                    ${document.document_type}
                </span>
                <span style="color: rgba(255, 255, 255, 0.6); font-size: 0.875rem;">
                    v${document.version}
                </span>
            </div>
            
            <h3 style="font-size: 1.25rem; font-weight: 700; color: white; margin-bottom: 0.75rem; line-height: 1.3;">
                ${document.title}
            </h3>
            
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1.5rem; font-size: 0.875rem;">
                <div style="display: flex; align-items: center; color: rgba(255, 255, 255, 0.8);">
                    <i class="fas fa-calendar-check" style="margin-right: 0.5rem; color: #10b981; width: 16px;"></i>
                    <span>${effectiveDate.toLocaleDateString()}</span>
                </div>
                <div style="display: flex; align-items: center; color: rgba(255, 255, 255, 0.8);">
                    <i class="fas fa-user" style="margin-right: 0.5rem; color: #3b82f6; width: 16px;"></i>
                    <span>${document.users?.name || 'System'}</span>
                </div>
            </div>
            
            <div style="display: flex; gap: 0.75rem; flex-wrap: wrap;">
                <button class="btn btn-outline btn-sm" onclick="event.stopPropagation(); openDocumentModal('${document.id}')">
                    <i class="fas fa-eye"></i>View
                </button>
                ${document.file_url ? `
                    <button class="btn btn-secondary btn-sm" onclick="event.stopPropagation(); window.open('${document.file_url}', '_blank')">
                        <i class="fas fa-download"></i>Download
                    </button>
                ` : ''}
            </div>
        </div>
    `;
}

// =============================================
// EVENT LISTENERS
// =============================================

function setupEventListeners() {
    // Section navigation buttons
    document.querySelectorAll('.section-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const section = e.target.closest('button').dataset.section;
            if (section) {
                showSection(section);
            }
        });
    });
    // Meeting filters
    document.getElementById('meetingTypeFilter').addEventListener('change', (e) => {
        currentFilters.meetings.type = e.target.value;
        currentPage.meetings = 1;
        loadMeetings();
    });
    
    document.getElementById('meetingStatusFilter').addEventListener('change', (e) => {
        currentFilters.meetings.status = e.target.value;
        currentPage.meetings = 1;
        loadMeetings();
    });
    
    // Election filters
    document.getElementById('electionStatusFilter').addEventListener('change', (e) => {
        currentFilters.elections.status = e.target.value;
        currentPage.elections = 1;
        loadElections();
    });
    
    // Proposal filters
    document.getElementById('proposalTypeFilter').addEventListener('change', (e) => {
        currentFilters.proposals.type = e.target.value;
        currentPage.proposals = 1;
        loadProposals();
    });
    
    document.getElementById('proposalStatusFilter').addEventListener('change', (e) => {
        currentFilters.proposals.status = e.target.value;
        currentPage.proposals = 1;
        loadProposals();
    });
    
    // Document filters
    document.getElementById('documentTypeFilter').addEventListener('change', (e) => {
        currentFilters.documents.type = e.target.value;
        loadDocuments();
    });
    
    // Load more buttons
    document.getElementById('loadMoreMeetings').addEventListener('click', () => {
        currentPage.meetings++;
        loadMeetings();
    });
    
    // Close modals when clicking outside
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal-backdrop')) {
            e.target.style.display = 'none';
        }
    });
}

// =============================================
// MODAL FUNCTIONS
// =============================================

async function openMeetingModal(meetingId) {
    try {
        const response = await fetch(`/api/meetings/${meetingId}`);
        if (response.ok) {
            const meeting = await response.json();
            renderMeetingModal(meeting);
            document.getElementById('meetingModal').style.display = 'flex';
        } else {
            throw new Error('API failed');
        }
    } catch (error) {
        console.log('📊 Using mock meeting data for modal');
        // Use mock data as fallback
        const meeting = mockData.meetings.find(m => m.id === meetingId);
        if (meeting) {
            renderMeetingModal(meeting);
            document.getElementById('meetingModal').style.display = 'flex';
        } else {
            showNotification('Meeting not found', 'error');
        }
    }
}

function renderMeetingModal(meeting) {
    const modalContent = document.getElementById('meetingModalContent');
    const meetingDate = new Date(meeting.meeting_date);
    
    modalContent.innerHTML = `
        <div style="margin-bottom: 2rem;">
            <div style="display: flex; gap: 1rem; margin-bottom: 1rem;">
                <span style="background: rgba(59, 130, 246, 0.2); color: #3b82f6; padding: 0.5rem 1rem; border-radius: 20px; font-size: 0.875rem; font-weight: 600;">
                    ${meeting.meeting_types?.name || 'Meeting'}
                </span>
                <span style="background: rgba(16, 185, 129, 0.2); color: #10b981; padding: 0.5rem 1rem; border-radius: 20px; font-size: 0.875rem; font-weight: 600; text-transform: capitalize;">
                    ${meeting.status}
                </span>
            </div>
            
            <h2 style="color: white; margin-bottom: 1rem; font-size: 1.5rem; font-weight: 700;">${meeting.title}</h2>
            
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; margin-bottom: 2rem; font-size: 0.875rem;">
                <div style="color: rgba(255, 255, 255, 0.8);">
                    <strong style="color: white;">Date & Time:</strong><br>
                    ${meetingDate.toLocaleDateString()} at ${meetingDate.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                </div>
                <div style="color: rgba(255, 255, 255, 0.8);">
                    <strong style="color: white;">Venue:</strong><br>
                    ${meeting.venue || 'To be announced'}
                </div>
                <div style="color: rgba(255, 255, 255, 0.8);">
                    <strong style="color: white;">Quorum:</strong><br>
                    ${meeting.quorum_achieved || 0} / ${meeting.quorum_required || 0}
                </div>
                <div style="color: rgba(255, 255, 255, 0.8);">
                    <strong style="color: white;">Attendees:</strong><br>
                    ${meeting.meeting_attendees?.length || 0} registered
                </div>
            </div>
            
            ${meeting.description ? `
                <div style="margin-bottom: 2rem;">
                    <h4 style="color: white; margin-bottom: 0.5rem; font-weight: 600;">Description</h4>
                    <p style="color: rgba(255, 255, 255, 0.8); line-height: 1.6;">${meeting.description}</p>
                </div>
            ` : ''}
            
            ${meeting.agenda ? `
                <div style="margin-bottom: 2rem;">
                    <h4 style="color: white; margin-bottom: 0.5rem; font-weight: 600;">Agenda</h4>
                    <pre style="color: rgba(255, 255, 255, 0.8); line-height: 1.6; white-space: pre-wrap; font-family: inherit;">${meeting.agenda}</pre>
                </div>
            ` : ''}
            
            ${meeting.virtual_link ? `
                <div style="margin-bottom: 2rem;">
                    <h4 style="color: white; margin-bottom: 0.5rem; font-weight: 600;">Virtual Meeting</h4>
                    <a href="${meeting.virtual_link}" target="_blank" style="color: #3b82f6; text-decoration: none;">
                        <i class="fas fa-video"></i> Join Virtual Meeting
                    </a>
                </div>
            ` : ''}
            
            <div style="display: flex; gap: 1rem; margin-top: 2rem; flex-wrap: wrap;">
                ${meetingDate > new Date() ? `
                    <button class="btn btn-primary" onclick="rsvpToMeeting('${meeting.id}')">
                        <i class="fas fa-check"></i> RSVP
                    </button>
                ` : ''}
                ${meeting.virtual_link ? `
                    <button class="btn btn-secondary" onclick="window.open('${meeting.virtual_link}', '_blank')">
                        <i class="fas fa-video"></i> Join Meeting
                    </button>
                ` : ''}
                <button class="btn btn-outline" onclick="closeMeetingModal()">
                    <i class="fas fa-times"></i> Close
                </button>
            </div>
        </div>
    `;
}

function closeMeetingModal() {
    document.getElementById('meetingModal').style.display = 'none';
}

async function openElectionModal(electionId) {
    try {
        const response = await fetch(`/api/elections/${electionId}`);
        if (response.ok) {
            const election = await response.json();
            renderElectionModal(election);
            document.getElementById('electionModal').style.display = 'flex';
        } else {
            throw new Error('API failed');
        }
    } catch (error) {
        console.log('📊 Using mock election data for modal');
        // Use mock data as fallback
        const election = mockData.elections.find(e => e.id === electionId);
        if (election) {
            renderElectionModal(election);
            document.getElementById('electionModal').style.display = 'flex';
        } else {
            showNotification('Election not found', 'error');
        }
    }
}

function renderElectionModal(election) {
    const modalContent = document.getElementById('electionModalContent');
    const startDate = new Date(election.start_date);
    const endDate = new Date(election.end_date);
    
    modalContent.innerHTML = `
        <div style="margin-bottom: 2rem;">
            <div style="display: flex; gap: 1rem; margin-bottom: 1rem;">
                <span style="background: rgba(59, 130, 246, 0.2); color: #3b82f6; padding: 0.5rem 1rem; border-radius: 20px; font-size: 0.875rem; font-weight: 600; text-transform: capitalize;">
                    ${election.election_type}
                </span>
                <span style="background: rgba(16, 185, 129, 0.2); color: #10b981; padding: 0.5rem 1rem; border-radius: 20px; font-size: 0.875rem; font-weight: 600; text-transform: capitalize;">
                    ${election.status.replace('_', ' ')}
                </span>
            </div>
            
            <h2 style="color: white; margin-bottom: 1rem; font-size: 1.5rem; font-weight: 700;">${election.title}</h2>
            
            ${election.description ? `
                <p style="color: rgba(255, 255, 255, 0.8); line-height: 1.6; margin-bottom: 2rem;">${election.description}</p>
            ` : ''}
            
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; margin-bottom: 2rem; font-size: 0.875rem;">
                <div style="color: rgba(255, 255, 255, 0.8);">
                    <strong style="color: white;">Voting Period:</strong><br>
                    ${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}
                </div>
                <div style="color: rgba(255, 255, 255, 0.8);">
                    <strong style="color: white;">Positions:</strong><br>
                    ${election.election_positions?.length || 0} available
                </div>
                <div style="color: rgba(255, 255, 255, 0.8);">
                    <strong style="color: white;">Total Votes:</strong><br>
                    ${election.total_votes_cast || 0} cast
                </div>
                <div style="color: rgba(255, 255, 255, 0.8);">
                    <strong style="color: white;">Eligible Voters:</strong><br>
                    ${election.eligible_voters_count || 0} members
                </div>
            </div>
            
            ${election.election_positions && election.election_positions.length > 0 ? `
                <div style="margin-bottom: 2rem;">
                    <h4 style="color: white; margin-bottom: 1rem; font-weight: 600;">Positions & Candidates</h4>
                    ${election.election_positions.map(position => `
                        <div style="background: rgba(255, 255, 255, 0.05); border-radius: 12px; padding: 1.5rem; margin-bottom: 1rem;">
                            <h5 style="color: white; margin-bottom: 0.5rem; font-weight: 600;">${position.position_name}</h5>
                            <p style="color: rgba(255, 255, 255, 0.8); font-size: 0.875rem; margin-bottom: 1rem;">${position.description || ''}</p>
                            
                            ${position.election_candidates && position.election_candidates.length > 0 ? `
                                <div style="display: grid; gap: 1rem;">
                                    ${position.election_candidates.map(candidate => `
                                        <div style="display: flex; align-items: center; gap: 1rem; background: rgba(255, 255, 255, 0.05); border-radius: 8px; padding: 1rem;">
                                            <div style="width: 40px; height: 40px; border-radius: 50%; background: linear-gradient(135deg, #3b82f6, #1d4ed8); display: flex; align-items: center; justify-content: center; color: white; font-weight: 600;">
                                                ${candidate.users?.name?.charAt(0) || 'C'}
                                            </div>
                                            <div style="flex: 1;">
                                                <div style="color: white; font-weight: 600;">${candidate.users?.name || 'Candidate'}</div>
                                                <div style="color: rgba(255, 255, 255, 0.6); font-size: 0.875rem;">${candidate.users?.email || ''}</div>
                                            </div>
                                            <div style="color: rgba(255, 255, 255, 0.8); font-size: 0.875rem;">
                                                ${candidate.votes_received || 0} votes
                                            </div>
                                        </div>
                                    `).join('')}
                                </div>
                            ` : `
                                <p style="color: rgba(255, 255, 255, 0.6); font-style: italic;">No candidates yet</p>
                            `}
                        </div>
                    `).join('')}
                </div>
            ` : ''}
            
            <div style="display: flex; gap: 1rem; margin-top: 2rem; flex-wrap: wrap;">
                ${election.status === 'voting_open' ? `
                    <button class="btn btn-primary" onclick="voteInElection('${election.id}')">
                        <i class="fas fa-vote-yea"></i> Cast Vote
                    </button>
                ` : ''}
                ${election.status === 'nomination_open' ? `
                    <button class="btn btn-secondary" onclick="nominateForElection('${election.id}')">
                        <i class="fas fa-hand-paper"></i> Submit Nomination
                    </button>
                ` : ''}
                ${election.results_published ? `
                    <button class="btn btn-outline" onclick="viewElectionResults('${election.id}')">
                        <i class="fas fa-chart-bar"></i> View Results
                    </button>
                ` : ''}
                <button class="btn btn-outline" onclick="closeElectionModal()">
                    <i class="fas fa-times"></i> Close
                </button>
            </div>
        </div>
    `;
}

function closeElectionModal() {
    document.getElementById('electionModal').style.display = 'none';
}

async function openProposalModal(proposalId) {
    try {
        const response = await fetch(`/api/governance/proposals/${proposalId}`);
        if (response.ok) {
            const proposal = await response.json();
            renderProposalModal(proposal);
            document.getElementById('proposalModal').style.display = 'flex';
        } else {
            throw new Error('API failed');
        }
    } catch (error) {
        console.log('📊 Using mock proposal data for modal');
        // Use mock data as fallback
        const proposal = mockData.proposals.find(p => p.id === proposalId);
        if (proposal) {
            renderProposalModal(proposal);
            document.getElementById('proposalModal').style.display = 'flex';
        } else {
            showNotification('Proposal not found', 'error');
        }
    }
}

function renderProposalModal(proposal) {
    const modalContent = document.getElementById('proposalModalContent');
    const createdDate = new Date(proposal.created_at);
    
    modalContent.innerHTML = `
        <div style="margin-bottom: 2rem;">
            <div style="display: flex; gap: 1rem; margin-bottom: 1rem;">
                <span style="background: rgba(59, 130, 246, 0.2); color: #3b82f6; padding: 0.5rem 1rem; border-radius: 20px; font-size: 0.875rem; font-weight: 600; text-transform: capitalize;">
                    ${proposal.proposal_type.replace('_', ' ')}
                </span>
                <span style="background: rgba(16, 185, 129, 0.2); color: #10b981; padding: 0.5rem 1rem; border-radius: 20px; font-size: 0.875rem; font-weight: 600; text-transform: capitalize;">
                    ${proposal.status.replace('_', ' ')}
                </span>
            </div>
            
            <h2 style="color: white; margin-bottom: 1rem; font-size: 1.5rem; font-weight: 700;">${proposal.title}</h2>
            
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; margin-bottom: 2rem; font-size: 0.875rem;">
                <div style="color: rgba(255, 255, 255, 0.8);">
                    <strong style="color: white;">Proposed by:</strong><br>
                    ${proposal.users?.name || 'Unknown'}
                </div>
                <div style="color: rgba(255, 255, 255, 0.8);">
                    <strong style="color: white;">Date:</strong><br>
                    ${createdDate.toLocaleDateString()}
                </div>
                ${proposal.vote_statistics ? `
                    <div style="color: rgba(255, 255, 255, 0.8);">
                        <strong style="color: white;">Total Votes:</strong><br>
                        ${proposal.vote_statistics.total}
                    </div>
                    <div style="color: rgba(255, 255, 255, 0.8);">
                        <strong style="color: white;">Support:</strong><br>
                        ${proposal.vote_statistics.for_percentage}% for
                    </div>
                ` : ''}
            </div>
            
            <div style="margin-bottom: 2rem;">
                <h4 style="color: white; margin-bottom: 0.5rem; font-weight: 600;">Description</h4>
                <p style="color: rgba(255, 255, 255, 0.8); line-height: 1.6;">${proposal.description}</p>
            </div>
            
            ${proposal.content ? `
                <div style="margin-bottom: 2rem;">
                    <h4 style="color: white; margin-bottom: 0.5rem; font-weight: 600;">Full Proposal</h4>
                    <div style="background: rgba(255, 255, 255, 0.05); border-radius: 8px; padding: 1.5rem; max-height: 300px; overflow-y: auto;">
                        <pre style="color: rgba(255, 255, 255, 0.8); line-height: 1.6; white-space: pre-wrap; font-family: inherit; margin: 0;">${proposal.content}</pre>
                    </div>
                </div>
            ` : ''}
            
            ${proposal.vote_statistics && proposal.vote_statistics.total > 0 ? `
                <div style="margin-bottom: 2rem;">
                    <h4 style="color: white; margin-bottom: 1rem; font-weight: 600;">Voting Results</h4>
                    <div style="background: rgba(255, 255, 255, 0.1); border-radius: 10px; height: 12px; overflow: hidden; margin-bottom: 1rem;">
                        <div style="display: flex; height: 100%;">
                            <div style="background: #10b981; width: ${proposal.vote_statistics.for_percentage}%;"></div>
                            <div style="background: #ef4444; width: ${proposal.vote_statistics.against_percentage}%;"></div>
                            <div style="background: #6b7280; width: ${proposal.vote_statistics.abstain_percentage}%;"></div>
                        </div>
                    </div>
                    <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; font-size: 0.875rem;">
                        <div style="text-align: center;">
                            <div style="color: #10b981; font-weight: 600; font-size: 1.25rem;">${proposal.vote_statistics.for}</div>
                            <div style="color: rgba(255, 255, 255, 0.8);">For (${proposal.vote_statistics.for_percentage}%)</div>
                        </div>
                        <div style="text-align: center;">
                            <div style="color: #ef4444; font-weight: 600; font-size: 1.25rem;">${proposal.vote_statistics.against}</div>
                            <div style="color: rgba(255, 255, 255, 0.8);">Against (${proposal.vote_statistics.against_percentage}%)</div>
                        </div>
                        <div style="text-align: center;">
                            <div style="color: #6b7280; font-weight: 600; font-size: 1.25rem;">${proposal.vote_statistics.abstain}</div>
                            <div style="color: rgba(255, 255, 255, 0.8);">Abstain (${proposal.vote_statistics.abstain_percentage}%)</div>
                        </div>
                    </div>
                </div>
            ` : ''}
            
            <div style="display: flex; gap: 1rem; margin-top: 2rem; flex-wrap: wrap;">
                ${proposal.status === 'voting' ? `
                    <button class="btn btn-primary" onclick="voteOnProposal('${proposal.id}')">
                        <i class="fas fa-vote-yea"></i> Cast Vote
                    </button>
                ` : ''}
                ${proposal.status === 'draft' && !proposal.seconded_by ? `
                    <button class="btn btn-secondary" onclick="secondProposal('${proposal.id}')">
                        <i class="fas fa-handshake"></i> Second Proposal
                    </button>
                ` : ''}
                <button class="btn btn-outline" onclick="closeProposalModal()">
                    <i class="fas fa-times"></i> Close
                </button>
            </div>
        </div>
    `;
}

function closeProposalModal() {
    document.getElementById('proposalModal').style.display = 'none';
}

async function openDocumentModal(documentId) {
    try {
        const response = await fetch(`/api/meetings/documents/${documentId}`);
        if (response.ok) {
            const document = await response.json();
            renderDocumentModal(document);
            document.getElementById('documentModal').style.display = 'flex';
        } else {
            throw new Error('API failed');
        }
    } catch (error) {
        console.log('📊 Using mock document data for modal');
        // Use mock data as fallback
        const document = mockData.documents.find(d => d.id === documentId);
        if (document) {
            renderDocumentModal(document);
            document.getElementById('documentModal').style.display = 'flex';
        } else {
            showNotification('Document not found', 'error');
        }
    }
}

function renderDocumentModal(document) {
    const modalContent = document.getElementById('documentModalContent');
    const effectiveDate = new Date(document.effective_date);
    
    modalContent.innerHTML = `
        <div style="margin-bottom: 2rem;">
            <div style="display: flex; gap: 1rem; margin-bottom: 1rem;">
                <span style="background: rgba(59, 130, 246, 0.2); color: #3b82f6; padding: 0.5rem 1rem; border-radius: 20px; font-size: 0.875rem; font-weight: 600; text-transform: capitalize;">
                    ${document.document_type}
                </span>
                <span style="background: rgba(16, 185, 129, 0.2); color: #10b981; padding: 0.5rem 1rem; border-radius: 20px; font-size: 0.875rem; font-weight: 600;">
                    Version ${document.version}
                </span>
            </div>
            
            <h2 style="color: white; margin-bottom: 1rem; font-size: 1.5rem; font-weight: 700;">${document.title}</h2>
            
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; margin-bottom: 2rem; font-size: 0.875rem;">
                <div style="color: rgba(255, 255, 255, 0.8);">
                    <strong style="color: white;">Effective Date:</strong><br>
                    ${effectiveDate.toLocaleDateString()}
                </div>
                <div style="color: rgba(255, 255, 255, 0.8);">
                    <strong style="color: white;">Created by:</strong><br>
                    ${document.users?.name || 'System'}
                </div>
                <div style="color: rgba(255, 255, 255, 0.8);">
                    <strong style="color: white;">Status:</strong><br>
                    <span style="text-transform: capitalize;">${document.status}</span>
                </div>
            </div>
            
            ${document.content ? `
                <div style="margin-bottom: 2rem;">
                    <h4 style="color: white; margin-bottom: 1rem; font-weight: 600;">Document Content</h4>
                    <div style="background: rgba(255, 255, 255, 0.05); border-radius: 8px; padding: 1.5rem; max-height: 400px; overflow-y: auto;">
                        <pre style="color: rgba(255, 255, 255, 0.8); line-height: 1.6; white-space: pre-wrap; font-family: inherit; margin: 0;">${document.content}</pre>
                    </div>
                </div>
            ` : ''}
            
            <div style="display: flex; gap: 1rem; margin-top: 2rem; flex-wrap: wrap;">
                ${document.file_url ? `
                    <button class="btn btn-primary" onclick="window.open('${document.file_url}', '_blank')">
                        <i class="fas fa-download"></i> Download PDF
                    </button>
                ` : ''}
                <button class="btn btn-outline" onclick="closeDocumentModal()">
                    <i class="fas fa-times"></i> Close
                </button>
            </div>
        </div>
    `;
}

function closeDocumentModal() {
    document.getElementById('documentModal').style.display = 'none';
}

// =============================================
// ACTION FUNCTIONS
// =============================================

async function rsvpToMeeting(meetingId) {
    try {
        const user = JSON.parse(localStorage.getItem('user') || 'null');
        if (!user) {
            showNotification('Please login to RSVP to meetings', 'error');
            return;
        }
        
        const response = await fetch(`/api/meetings/${meetingId}/rsvp`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({ status: 'confirmed' })
        });
        
        if (response.ok) {
            showNotification('RSVP confirmed successfully!', 'success');
            loadMeetings(); // Refresh meetings
        } else {
            const error = await response.json();
            showNotification(error.message || 'Failed to RSVP', 'error');
        }
    } catch (error) {
        console.error('Error RSVPing to meeting:', error);
        showNotification('Failed to RSVP to meeting', 'error');
    }
}

function voteInElection(electionId) {
    showNotification('Voting interface coming soon!', 'info');
}

function nominateForElection(electionId) {
    showNotification('Nomination interface coming soon!', 'info');
}

function voteOnProposal(proposalId) {
    showNotification('Proposal voting interface coming soon!', 'info');
}

async function secondProposal(proposalId) {
    try {
        const user = JSON.parse(localStorage.getItem('user') || 'null');
        if (!user) {
            showNotification('Please login to second proposals', 'error');
            return;
        }
        
        const response = await fetch(`/api/governance/proposals/${proposalId}/second`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        
        if (response.ok) {
            showNotification('Proposal seconded successfully!', 'success');
            loadProposals(); // Refresh proposals
        } else {
            const error = await response.json();
            showNotification(error.message || 'Failed to second proposal', 'error');
        }
    } catch (error) {
        console.error('Error seconding proposal:', error);
        showNotification('Failed to second proposal', 'error');
    }
}

// =============================================
// UTILITY FUNCTIONS
// =============================================

function showNotification(message, type = 'success') {
    const toast = document.getElementById('notificationToast');
    const icon = document.getElementById('toastIcon');
    const title = document.getElementById('toastTitle');
    const messageEl = document.getElementById('toastMessage');
    
    // Set icon and colors based on type
    if (type === 'success') {
        icon.className = 'fas fa-check-circle';
        icon.style.color = '#10b981';
        toast.querySelector('.glass-card').style.borderLeftColor = '#10b981';
        title.textContent = 'Success';
    } else if (type === 'error') {
        icon.className = 'fas fa-exclamation-triangle';
        icon.style.color = '#ef4444';
        toast.querySelector('.glass-card').style.borderLeftColor = '#ef4444';
        title.textContent = 'Error';
    } else if (type === 'info') {
        icon.className = 'fas fa-info-circle';
        icon.style.color = '#3b82f6';
        toast.querySelector('.glass-card').style.borderLeftColor = '#3b82f6';
        title.textContent = 'Info';
    }
    
    messageEl.textContent = message;
    toast.style.display = 'block';
    
    // Auto hide after 4 seconds
    setTimeout(() => {
        toast.style.display = 'none';
    }, 4000);
}