-- =============================================
-- JKUAT Innovation Club - Meetings & Governance Mock Data
-- =============================================

-- Insert Sample Meetings
INSERT INTO meetings (title, type_id, description, meeting_date, venue, virtual_link, agenda, status, quorum_required, created_by) VALUES
('Annual General Meeting 2024', 1, 'Annual review of club activities, financial reports, and leadership elections', '2024-12-28 14:00:00', 'Main Auditorium, JKUAT', 'https://meet.google.com/agm-2024', 
'1. Opening and Welcome
2. Minutes of Previous AGM
3. Chairperson''s Report
4. Treasurer''s Report
5. Election of New Leadership
6. Constitutional Amendments
7. Any Other Business
8. Closing Remarks', 'scheduled', 50, (SELECT id FROM users WHERE email = 'admin@jkuatinnovation.ac.ke' LIMIT 1)),

('Emergency SGM - Budget Approval', 2, 'Special meeting to approve emergency budget allocation for upcoming tech conference', '2024-12-25 16:00:00', 'Conference Room B', 'https://meet.google.com/sgm-budget', 
'1. Call to Order
2. Budget Presentation
3. Discussion and Questions
4. Voting on Budget Approval
5. Next Steps
6. Adjournment', 'scheduled', 30, (SELECT id FROM users WHERE email = 'admin@jkuatinnovation.ac.ke' LIMIT 1)),

('Executive Committee Meeting', 3, 'Monthly executive committee meeting to review ongoing projects and plan upcoming events', '2024-12-23 18:00:00', 'Executive Boardroom', 'https://meet.google.com/exec-dec', 
'1. Review of Previous Minutes
2. Project Status Updates
3. Event Planning Discussion
4. Budget Review
5. Member Concerns
6. Action Items', 'completed', 8, (SELECT id FROM users WHERE email = 'executive@jkuatinnovation.ac.ke' LIMIT 1)),

('Innovation Workshop Planning', 4, 'Planning session for the upcoming innovation workshop series', '2024-12-30 15:00:00', 'Innovation Lab', NULL, 
'1. Workshop Objectives
2. Speaker Arrangements
3. Resource Requirements
4. Marketing Strategy
5. Registration Process
6. Timeline Finalization', 'scheduled', 15, (SELECT id FROM users WHERE email = 'member@jkuatinnovation.ac.ke' LIMIT 1)),

('Project Review - Smart Campus Initiative', 5, 'Review meeting for the Smart Campus project progress and next milestones', '2024-12-26 10:00:00', 'Tech Hub', 'https://meet.google.com/smart-campus', 
'1. Project Progress Report
2. Technical Challenges Discussion
3. Budget Status
4. Timeline Adjustments
5. Resource Allocation
6. Next Phase Planning', 'scheduled', 10, (SELECT id FROM users WHERE email = 'admin@jkuatinnovation.ac.ke' LIMIT 1));

-- Insert Meeting Attendees
INSERT INTO meeting_attendees (meeting_id, user_id, attendance_status, rsvp_date) VALUES
-- AGM Attendees
(1, (SELECT id FROM users WHERE email = 'admin@jkuatinnovation.ac.ke' LIMIT 1), 'confirmed', '2024-12-20 10:00:00'),
(1, (SELECT id FROM users WHERE email = 'executive@jkuatinnovation.ac.ke' LIMIT 1), 'confirmed', '2024-12-20 11:30:00'),
(1, (SELECT id FROM users WHERE email = 'member@jkuatinnovation.ac.ke' LIMIT 1), 'confirmed', '2024-12-20 14:15:00'),

-- SGM Attendees
(2, (SELECT id FROM users WHERE email = 'admin@jkuatinnovation.ac.ke' LIMIT 1), 'confirmed', '2024-12-22 16:00:00'),
(2, (SELECT id FROM users WHERE email = 'executive@jkuatinnovation.ac.ke' LIMIT 1), 'confirmed', '2024-12-22 16:30:00'),
(2, (SELECT id FROM users WHERE email = 'member@jkuatinnovation.ac.ke' LIMIT 1), 'confirmed', '2024-12-22 17:00:00'),

-- Executive Meeting Attendees
(3, (SELECT id FROM users WHERE email = 'admin@jkuatinnovation.ac.ke' LIMIT 1), 'attended', '2024-12-20 18:00:00'),
(3, (SELECT id FROM users WHERE email = 'executive@jkuatinnovation.ac.ke' LIMIT 1), 'attended', '2024-12-20 18:00:00'),
(3, (SELECT id FROM users WHERE email = 'member@jkuatinnovation.ac.ke' LIMIT 1), 'attended', '2024-12-20 18:00:00');

-- Insert Meeting Minutes
INSERT INTO meeting_minutes (meeting_id, content, action_items, decisions_made, recorded_by, status) VALUES
(3, 'Executive Committee Meeting - December 2024

ATTENDEES:
- John Doe (Chairperson)
- Jane Smith (Vice Chairperson) 
- Mike Johnson (Secretary)

AGENDA ITEMS DISCUSSED:

1. PREVIOUS MINUTES REVIEW
   - Minutes from November meeting approved unanimously
   - All action items from previous meeting completed

2. PROJECT STATUS UPDATES
   - Smart Campus Initiative: 60% complete, on track for Q1 2025 launch
   - Innovation Workshop Series: Speakers confirmed, venue booked
   - Mentorship Program: 25 mentor-mentee pairs established

3. UPCOMING EVENTS
   - Annual General Meeting scheduled for December 28, 2024
   - Tech Conference planning in progress for February 2025
   - Hackathon event proposed for March 2025

4. BUDGET REVIEW
   - Current budget utilization at 75%
   - Emergency allocation needed for tech conference
   - Fundraising initiatives showing positive results

5. MEMBER CONCERNS
   - Request for more technical workshops
   - Need for better communication channels
   - Suggestion for alumni networking events

6. STRATEGIC PLANNING
   - 2025 roadmap discussion initiated
   - Partnership opportunities with industry explored
   - Expansion of innovation lab facilities proposed',

'1. Prepare detailed budget proposal for tech conference (Due: Dec 24)
2. Schedule SGM for budget approval (Due: Dec 25)
3. Finalize AGM agenda and send invitations (Due: Dec 26)
4. Research hackathon sponsorship opportunities (Due: Jan 15)
5. Draft 2025 strategic plan outline (Due: Jan 30)',

'1. APPROVED: Emergency budget allocation of KES 500,000 for tech conference
2. APPROVED: Scheduling of Special General Meeting for December 25
3. APPROVED: Proposal to expand innovation lab facilities
4. APPROVED: Implementation of monthly technical workshops
5. DEFERRED: Alumni networking event planning to next meeting',

(SELECT id FROM users WHERE email = 'executive@jkuatinnovation.ac.ke' LIMIT 1), 'approved');

-- Insert Constitutional Documents
INSERT INTO constitutional_documents (title, document_type, content, version, effective_date, status, created_by) VALUES
('JKUAT Innovation Club Constitution', 'constitution', 
'CONSTITUTION OF JKUAT INNOVATION AND ENTREPRENEURSHIP CLUB

PREAMBLE
We, the members of the Jomo Kenyatta University of Agriculture and Technology Innovation and Entrepreneurship Club, in order to foster innovation, promote entrepreneurship, and create a collaborative environment for technological advancement, do hereby establish this Constitution.

ARTICLE I - NAME AND PURPOSE
Section 1: The name of this organization shall be "JKUAT Innovation and Entrepreneurship Club" (hereinafter referred to as "the Club").

Section 2: The purpose of the Club shall be to:
a) Promote innovation and entrepreneurship among students
b) Provide platforms for skill development and knowledge sharing
c) Foster collaboration between students, faculty, and industry
d) Support startup initiatives and business development
e) Organize events, workshops, and competitions

ARTICLE II - MEMBERSHIP
Section 1: Membership is open to all registered students of JKUAT who share the Club''s vision and mission.

Section 2: Types of membership:
a) Active Members: Students who participate regularly in Club activities
b) Associate Members: Faculty and staff who support Club activities
c) Honorary Members: Distinguished individuals who have contributed significantly to the Club

Section 3: Rights and Responsibilities:
a) All active members have voting rights
b) Members must attend at least 60% of general meetings
c) Members must pay annual membership fees as determined by the Executive Committee

ARTICLE III - LEADERSHIP STRUCTURE
Section 1: The Club shall be governed by an Executive Committee consisting of:
a) Chairperson
b) Vice Chairperson
c) Secretary
d) Treasurer
e) Technical Lead
f) Marketing and Communications Lead
g) Events Coordinator

Section 2: Election Process:
a) Elections shall be held annually during the AGM
b) Nominations must be seconded by at least two active members
c) Voting shall be by secret ballot
d) Simple majority determines the winner

ARTICLE IV - MEETINGS
Section 1: The Club shall hold:
a) Annual General Meeting (AGM) - once per year
b) Special General Meetings (SGM) - as needed
c) Executive Committee meetings - monthly
d) General meetings - bi-weekly

Section 2: Quorum:
a) AGM: 60% of active members
b) SGM: 50% of active members
c) Executive meetings: 60% of executive members

ARTICLE V - AMENDMENTS
This Constitution may be amended by a two-thirds majority vote at an AGM or SGM, provided that:
a) Notice of proposed amendments is given at least 14 days in advance
b) The proposed amendment is seconded by at least 5 active members

ARTICLE VI - DISSOLUTION
The Club may be dissolved by a three-fourths majority vote of active members at a properly convened meeting.

Adopted: December 15, 2023
Effective: January 1, 2024', 

'2.0', '2024-01-01', 'active', (SELECT id FROM users WHERE email = 'admin@jkuatinnovation.ac.ke' LIMIT 1)),

('Club Bylaws and Procedures', 'bylaws',
'BYLAWS OF JKUAT INNOVATION AND ENTREPRENEURSHIP CLUB

CHAPTER 1 - MEMBERSHIP PROCEDURES
1.1 Application Process
- Complete membership application form
- Pay annual membership fee
- Attend orientation session
- Sign code of conduct agreement

1.2 Membership Benefits
- Access to innovation lab facilities
- Participation in workshops and events
- Networking opportunities
- Mentorship programs
- Project funding opportunities

CHAPTER 2 - MEETING PROCEDURES
2.1 Notice Requirements
- AGM: 21 days advance notice
- SGM: 14 days advance notice
- General meetings: 7 days advance notice

2.2 Agenda Setting
- Executive Committee sets AGM/SGM agendas
- Members may propose agenda items 7 days before meeting
- Emergency items may be added with majority consent

CHAPTER 3 - FINANCIAL PROCEDURES
3.1 Budget Management
- Annual budget approved at AGM
- Expenditures over KES 50,000 require executive approval
- Monthly financial reports to be presented

3.2 Audit Requirements
- Annual external audit required
- Financial records open to member inspection
- Treasurer presents quarterly reports

CHAPTER 4 - PROJECT MANAGEMENT
4.1 Project Approval Process
- Project proposals submitted to Technical Committee
- Feasibility assessment required
- Budget allocation based on available funds
- Progress reports required monthly

4.2 Intellectual Property
- Club retains rights to projects funded by Club resources
- Individual projects remain with creators
- Collaboration agreements required for joint projects

CHAPTER 5 - DISCIPLINARY PROCEDURES
5.1 Code of Conduct Violations
- Warning for minor infractions
- Suspension for serious violations
- Expulsion for severe misconduct

5.2 Appeals Process
- Written appeal within 14 days
- Review by Executive Committee
- Final decision by general membership vote

Effective: January 1, 2024
Last Updated: December 1, 2024',

'1.1', '2024-01-01', 'active', (SELECT id FROM users WHERE email = 'admin@jkuatinnovation.ac.ke' LIMIT 1));

-- Insert Sample Elections
INSERT INTO elections (title, description, election_type, start_date, end_date, nomination_start, nomination_end, campaign_start, campaign_end, status, created_by) VALUES
('Annual Leadership Elections 2025', 'Election of new executive committee members for the 2025 academic year', 'annual', 
'2025-01-15 08:00:00', '2025-01-17 18:00:00', 
'2024-12-20 00:00:00', '2025-01-05 23:59:59',
'2025-01-06 00:00:00', '2025-01-14 23:59:59', 
'nomination_open', (SELECT id FROM users WHERE email = 'admin@jkuatinnovation.ac.ke' LIMIT 1)),

('Constitutional Amendment Referendum', 'Referendum on proposed amendments to club constitution regarding membership structure', 'referendum',
'2025-02-10 08:00:00', '2025-02-12 18:00:00',
'2025-01-20 00:00:00', '2025-01-25 23:59:59',
'2025-01-26 00:00:00', '2025-02-09 23:59:59',
'upcoming', (SELECT id FROM users WHERE email = 'admin@jkuatinnovation.ac.ke' LIMIT 1));

-- Insert Election Positions
INSERT INTO election_positions (election_id, position_name, description, max_candidates, max_winners, display_order) VALUES
(1, 'Chairperson', 'Chief executive officer of the club, responsible for overall leadership and strategic direction', 5, 1, 1),
(1, 'Vice Chairperson', 'Deputy leader, assists chairperson and leads in their absence', 5, 1, 2),
(1, 'Secretary', 'Responsible for record keeping, communications, and administrative duties', 5, 1, 3),
(1, 'Treasurer', 'Manages club finances, budgets, and financial reporting', 5, 1, 4),
(1, 'Technical Lead', 'Oversees technical projects, innovation lab, and technology initiatives', 5, 1, 5),
(1, 'Marketing Lead', 'Manages club marketing, communications, and public relations', 5, 1, 6),
(1, 'Events Coordinator', 'Plans and coordinates club events, workshops, and activities', 5, 1, 7);

-- Insert Sample Candidates
INSERT INTO election_candidates (election_id, position_id, user_id, manifesto, qualifications, experience, status) VALUES
(1, 1, (SELECT id FROM users WHERE email = 'executive@jkuatinnovation.ac.ke' LIMIT 1), 
'VISION FOR INNOVATION EXCELLENCE

As your next Chairperson, I envision a club that leads in technological innovation and entrepreneurship development. My manifesto focuses on three key pillars:

1. INNOVATION ECOSYSTEM
- Establish partnerships with leading tech companies
- Create incubation programs for student startups
- Develop state-of-the-art innovation labs
- Launch annual innovation challenges with substantial prizes

2. SKILL DEVELOPMENT
- Implement comprehensive mentorship programs
- Organize monthly technical workshops
- Establish certification programs in emerging technologies
- Create industry internship opportunities

3. COMMUNITY IMPACT
- Launch community outreach programs
- Develop solutions for local challenges
- Establish alumni network for continued support
- Create scholarship programs for underprivileged students

Together, we will transform JKUAT into a hub of innovation that produces world-class entrepreneurs and technologists.',

'Bachelor of Science in Computer Science (Current)
President, Computer Science Students Association (2023-2024)
Google Developer Student Club Lead (2023)
Winner, National Hackathon Competition (2023)
Certified Project Management Professional (PMP)',

'Leadership Experience:
- Led team of 50+ students in organizing tech conference
- Managed budget of KES 2M for student activities
- Coordinated with industry partners for internship placements

Technical Experience:
- Developed 5+ mobile applications with 10K+ downloads
- Led development of campus management system
- Mentored 20+ junior students in programming

Entrepreneurship:
- Co-founded successful e-commerce startup
- Generated KES 500K+ in revenue within first year
- Secured seed funding from local investors',

'approved'),

(1, 1, (SELECT id FROM users WHERE email = 'member@jkuatinnovation.ac.ke' LIMIT 1),
'BUILDING BRIDGES TO SUCCESS

My candidacy for Chairperson is built on a foundation of inclusive leadership and sustainable growth. I propose:

1. INCLUSIVE INNOVATION
- Ensure equal opportunities for all members regardless of background
- Create specialized tracks for different skill levels
- Establish women in tech initiatives
- Develop programs for students with disabilities

2. SUSTAINABLE GROWTH
- Focus on long-term strategic planning
- Build endowment fund for club sustainability
- Establish revenue-generating projects
- Create alumni engagement programs

3. GLOBAL CONNECTIONS
- Partner with international innovation clubs
- Organize student exchange programs
- Participate in global competitions
- Establish international mentorship networks

My leadership style emphasizes collaboration, transparency, and results-driven action.',

'Bachelor of Engineering in Electrical Engineering (Current)
Vice President, Engineering Students Association (2023-2024)
IEEE Student Branch Chairperson (2022-2023)
Dean''s List for Academic Excellence (2022, 2023)
Certified Scrum Master (CSM)',

'Leadership Roles:
- Organized international engineering conference with 500+ participants
- Led cross-functional teams in multiple engineering projects
- Represented university in national engineering competitions

Innovation Projects:
- Developed IoT-based smart farming solution
- Created renewable energy system for rural communities
- Published 3 research papers in international journals

Community Service:
- Volunteer teacher in rural schools
- Organized STEM camps for high school students
- Led disaster relief technology initiatives',

'approved');

-- Insert Sample Governance Proposals
INSERT INTO governance_proposals (title, description, proposal_type, content, proposed_by, status, votes_for, votes_against, votes_abstain) VALUES
('Amendment to Membership Structure', 
'Proposal to modify the club constitution to include graduate students and alumni as voting members',
'constitutional_amendment',
'PROPOSED CONSTITUTIONAL AMENDMENT

Current Article II, Section 1 states:
"Membership is open to all registered students of JKUAT who share the Club''s vision and mission."

Proposed Amendment:
"Membership is open to:
a) All registered undergraduate students of JKUAT
b) All registered graduate students of JKUAT  
c) JKUAT alumni who have graduated within the past 5 years
d) Faculty and staff of JKUAT (associate membership)

All categories (a), (b), and (c) shall have full voting rights. Category (d) shall have advisory rights without voting privileges."

RATIONALE:
1. Graduate students bring advanced technical expertise
2. Recent alumni provide industry connections and mentorship
3. Faculty involvement ensures academic alignment
4. Expanded membership increases club resources and opportunities

IMPLEMENTATION:
- Amendment takes effect immediately upon approval
- Current members retain all existing rights
- New membership categories require separate application process
- Membership fees may be adjusted for different categories',

(SELECT id FROM users WHERE email = 'executive@jkuatinnovation.ac.ke' LIMIT 1), 'voting', 15, 3, 2),

('Innovation Lab Equipment Procurement',
'Proposal to allocate KES 1,500,000 for new equipment in the innovation lab including 3D printers, VR headsets, and development boards',
'budget_approval',
'EQUIPMENT PROCUREMENT PROPOSAL

BUDGET BREAKDOWN:
1. 3D Printing Equipment - KES 600,000
   - 2x Professional 3D Printers
   - Filament materials and maintenance supplies
   - Training and setup costs

2. Virtual Reality Setup - KES 400,000
   - 4x VR Headsets (Oculus Quest 3)
   - Development computers
   - VR development software licenses

3. Electronics and IoT - KES 300,000
   - Arduino and Raspberry Pi kits
   - Sensors and actuators
   - Breadboards and components

4. Software and Licenses - KES 200,000
   - Professional development software
   - Cloud computing credits
   - Design and simulation tools

FUNDING SOURCES:
- Club reserves: KES 800,000
- University grant: KES 500,000
- Industry sponsorship: KES 200,000

EXPECTED OUTCOMES:
- Enhanced project development capabilities
- Increased member engagement
- Better preparation for industry careers
- Potential for revenue generation through services',

(SELECT id FROM users WHERE email = 'admin@jkuatinnovation.ac.ke' LIMIT 1), 'under_review', 0, 0, 0);

-- Insert Sample Proposal Votes
INSERT INTO proposal_votes (proposal_id, voter_id, vote, comment) VALUES
(1, (SELECT id FROM users WHERE email = 'admin@jkuatinnovation.ac.ke' LIMIT 1), 'for', 'This amendment will significantly strengthen our club by bringing in experienced alumni and graduate students.'),
(1, (SELECT id FROM users WHERE email = 'member@jkuatinnovation.ac.ke' LIMIT 1), 'for', 'Graduate students and alumni can provide valuable mentorship and industry connections.'),
(1, (SELECT id FROM users WHERE email = 'executive@jkuatinnovation.ac.ke' LIMIT 1), 'abstain', 'Need more information about implementation details before making a decision.');

-- Update meeting quorum status
UPDATE meetings SET quorum_achieved = 8 WHERE id = 3;

-- Success message
DO $$
BEGIN
    RAISE NOTICE '✅ Meetings & Governance mock data inserted successfully!';
    RAISE NOTICE '📅 Created 5 sample meetings with attendees and minutes';
    RAISE NOTICE '🗳️ Created 2 elections with positions and candidates';
    RAISE NOTICE '📜 Created constitutional documents and governance proposals';
    RAISE NOTICE '👥 Added sample attendees, votes, and meeting records';
END $$;