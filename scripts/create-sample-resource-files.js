/**
 * Create Sample Resource Files
 * 
 * This script creates sample downloadable files and uploads them to Supabase Storage
 * Run this once to populate the storage bucket with sample files
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Sample file contents
const sampleFiles = [
  {
    path: 'constitution/constitution-2024.pdf',
    content: `JKUAT INNOVATION AND ENTREPRENEURSHIP CLUB
CONSTITUTION 2024

ARTICLE I: NAME AND PURPOSE
The name of this organization shall be the JKUAT Innovation and Entrepreneurship Club (JIEC).

ARTICLE II: MISSION
To foster innovation, entrepreneurship, and technological advancement among students.

ARTICLE III: MEMBERSHIP
Membership is open to all JKUAT students interested in innovation and entrepreneurship.

ARTICLE IV: GOVERNANCE
The club shall be governed by an elected executive committee.

ARTICLE V: MEETINGS
Regular meetings shall be held monthly, with special meetings as needed.

ARTICLE VI: AMENDMENTS
This constitution may be amended by a two-thirds vote of active members.

Adopted: January 2024`,
    filename: 'JIEC_Constitution_2024.pdf',
    contentType: 'text/plain' // Using text for demo
  },
  {
    path: 'guides/member-handbook-2024.pdf',
    content: `JKUAT INNOVATION AND ENTREPRENEURSHIP CLUB
MEMBER HANDBOOK 2024

WELCOME!
Welcome to the JKUAT Innovation and Entrepreneurship Club!

GETTING STARTED
1. Attend orientation sessions
2. Join our communication channels
3. Participate in club activities
4. Network with fellow members

OPPORTUNITIES
- Innovation workshops
- Hackathons and competitions
- Mentorship programs
- Project funding
- Networking events

EXPECTATIONS
- Active participation
- Respect for fellow members
- Commitment to innovation
- Ethical conduct

RESOURCES
- Access to club facilities
- Technical support
- Mentorship
- Funding opportunities

CONTACT
Email: info@jiec.ac.ke
Website: www.jiec.ac.ke`,
    filename: 'Member_Handbook_2024.pdf',
    contentType: 'text/plain'
  },
  {
    path: 'other/project-proposal-template.docx',
    content: `PROJECT PROPOSAL TEMPLATE

PROJECT TITLE:
[Enter your project title]

TEAM MEMBERS:
[List all team members and their roles]

PROBLEM STATEMENT:
[Describe the problem you're solving]

SOLUTION:
[Describe your proposed solution]

TARGET AUDIENCE:
[Who will benefit from this project?]

IMPLEMENTATION PLAN:
[How will you build and deploy this?]

TIMELINE:
[Project milestones and deadlines]

BUDGET:
[Estimated costs and resource needs]

EXPECTED IMPACT:
[What change will this project create?]

SUSTAINABILITY:
[How will the project continue after initial funding?]`,
    filename: 'Project_Proposal_Template.docx',
    contentType: 'text/plain'
  },
  {
    path: 'guides/innovation-toolkit.pdf',
    content: `INNOVATION TOOLKIT

DESIGN THINKING PROCESS
1. Empathize - Understand your users
2. Define - Frame the problem
3. Ideate - Generate solutions
4. Prototype - Build to think
5. Test - Learn and iterate

PROBLEM-SOLVING FRAMEWORKS
- 5 Whys Analysis
- SWOT Analysis
- Lean Canvas
- Business Model Canvas

INNOVATION METHODOLOGIES
- Agile Development
- Lean Startup
- Human-Centered Design
- Systems Thinking

TOOLS AND TECHNIQUES
- User interviews
- Brainstorming sessions
- Rapid prototyping
- A/B testing
- MVP development

RESOURCES
- Online courses
- Books and articles
- Mentorship programs
- Innovation labs`,
    filename: 'Innovation_Toolkit.pdf',
    contentType: 'text/plain'
  }
];

async function uploadSampleFiles() {
  console.log('Starting sample file upload...\n');

  for (const file of sampleFiles) {
    try {
      console.log(`Uploading: ${file.path}`);
      
      // Convert content to buffer
      const buffer = Buffer.from(file.content, 'utf-8');
      
      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from('resources')
        .upload(file.path, buffer, {
          contentType: file.contentType,
          upsert: true // Overwrite if exists
        });

      if (error) {
        console.error(`  ❌ Error uploading ${file.path}:`, error.message);
      } else {
        console.log(`  ✅ Successfully uploaded ${file.path}`);
        
        // Get public URL
        const { data: urlData } = supabase.storage
          .from('resources')
          .getPublicUrl(file.path);
        
        console.log(`     URL: ${urlData.publicUrl}\n`);
      }
    } catch (err) {
      console.error(`  ❌ Exception uploading ${file.path}:`, err.message);
    }
  }

  console.log('\n✅ Sample file upload complete!');
  console.log('\nNext steps:');
  console.log('1. Verify files in Supabase Dashboard > Storage > resources');
  console.log('2. Test downloads on the Resources page');
  console.log('3. Upload real files via CMS for production use');
}

// Run the upload
uploadSampleFiles().catch(console.error);
