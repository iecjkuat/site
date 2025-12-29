#!/usr/bin/env node

/**
 * Add Partnerships & Opportunities Mock Data
 * This script adds sample opportunities using the existing table structure
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

async function addOpportunitiesData() {
  console.log('🚀 Adding Partnerships & Opportunities mock data...');

  try {
    // Get admin user ID for posting opportunities
    const { data: adminUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', 'admin@jkuatinnovation.ac.ke')
      .single();

    const { data: execUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', 'executive@jkuatinnovation.ac.ke')
      .single();

    const { data: memberUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', 'member@jkuatinnovation.ac.ke')
      .single();

    if (!adminUser || !execUser || !memberUser) {
      console.error('❌ Required users not found. Please run seed script first.');
      return;
    }

    console.log('✅ Found required users');

    // Sample opportunities data
    const opportunities = [
      {
        title: 'Safaricom Hook Innovation Challenge 2025',
        description: 'Annual innovation challenge seeking groundbreaking solutions in fintech, agritech, healthtech, and edtech. Winners receive funding, mentorship, and market access opportunities. Open to students and young entrepreneurs across Kenya with innovative tech solutions.',
        company: 'Safaricom PLC',
        location: 'Nairobi, Kenya (Hybrid)',
        opportunity_type: 'competition',
        application_deadline: '2025-03-15',
        requirements: [
          'Kenyan citizens aged 18-35',
          'Students or recent graduates',
          'Innovative tech solutions',
          'Team of 1-5 members',
          'Working prototype preferred'
        ],
        benefits: [
          'Cash prizes up to KES 5,000,000',
          'Mentorship from industry experts',
          'Market access opportunities',
          'Media coverage and recognition',
          'Networking with investors'
        ],
        application_url: 'https://hook.safaricom.co.ke/apply',
        contact_email: 'innovation@safaricom.co.ke',
        status: 'active',
        tags: ['fintech', 'innovation', 'startup', 'technology', 'competition'],
        posted_by: adminUser.id
      },
      {
        title: 'Microsoft Imagine Cup 2025 - Kenya Regional',
        description: 'Global student technology competition where teams compete to create innovative solutions using Microsoft technologies. Regional winners advance to world finals with $100,000 prize pool. Perfect opportunity for computer science students.',
        company: 'Microsoft Kenya',
        location: 'Virtual/Global (Remote)',
        opportunity_type: 'competition',
        application_deadline: '2025-02-28',
        requirements: [
          'Currently enrolled students',
          'Teams of 1-4 members',
          'Use Microsoft Azure technologies',
          'Original innovative solution',
          'English proficiency required'
        ],
        benefits: [
          'Prize pool up to $100,000 USD',
          'Global recognition',
          'Microsoft mentorship',
          'Azure credits worth $5,000',
          'Career opportunities at Microsoft'
        ],
        application_url: 'https://imaginecup.microsoft.com',
        contact_email: 'students@microsoft.com',
        status: 'active',
        tags: ['microsoft', 'azure', 'global', 'students', 'technology'],
        posted_by: adminUser.id
      },
      {
        title: 'Mastercard Foundation Scholars Program 2025',
        description: 'Comprehensive scholarship program providing financial support, leadership development, and career guidance for academically talented young people from disadvantaged backgrounds across Africa. Covers full tuition, accommodation, and living expenses.',
        company: 'Mastercard Foundation',
        location: 'Various African Universities',
        opportunity_type: 'funding',
        application_deadline: '2025-01-31',
        requirements: [
          'African citizens from disadvantaged backgrounds',
          'Demonstrated financial need',
          'Academic excellence (minimum 3.5 GPA)',
          'Leadership potential and community service',
          'Commitment to giving back to Africa'
        ],
        benefits: [
          'Full tuition coverage up to KES 2,000,000',
          'Accommodation and living expenses',
          'Leadership development programs',
          'Mentorship and career guidance',
          'Alumni network access'
        ],
        application_url: 'https://mastercardfdn.org/scholars',
        contact_email: 'scholars@mastercardfdn.org',
        status: 'active',
        tags: ['scholarship', 'leadership', 'africa', 'education', 'funding'],
        posted_by: adminUser.id
      },
      {
        title: 'Safaricom Graduate Trainee Program 2025',
        description: 'Comprehensive 18-month graduate development program offering rotational assignments across different business units including Technology, Finance, Marketing, and Operations. Includes mentorship, professional training, and potential for permanent employment.',
        company: 'Safaricom PLC',
        location: 'Nairobi, Kenya',
        opportunity_type: 'internship',
        application_deadline: '2025-01-20',
        requirements: [
          'Recent graduates (2023-2024)',
          'Degree in Engineering, IT, Business, or related field',
          'Kenyan citizen',
          'Strong analytical and communication skills',
          'Willingness to work in different departments'
        ],
        benefits: [
          'Monthly stipend of KES 80,000',
          'Comprehensive training program',
          'Mentorship from senior executives',
          'Potential for permanent employment',
          'Professional certification opportunities'
        ],
        application_url: 'https://careers.safaricom.co.ke/graduates',
        contact_email: 'graduates@safaricom.co.ke',
        status: 'active',
        tags: ['graduate', 'telecom', 'training', 'career', 'internship'],
        posted_by: adminUser.id
      },
      {
        title: 'Junior Software Developer - KCB Bank',
        description: 'Entry-level software developer position focusing on digital banking solutions. Work with modern technologies including React, Node.js, and cloud platforms to build customer-facing applications. Join our dynamic team and contribute to Kenya\'s digital banking transformation.',
        company: 'Kenya Commercial Bank (KCB)',
        location: 'Nairobi, Kenya (Hybrid)',
        opportunity_type: 'job',
        application_deadline: '2025-01-25',
        requirements: [
          'Computer Science degree or equivalent',
          '0-2 years of programming experience',
          'JavaScript/React knowledge required',
          'Understanding of databases (SQL/NoSQL)',
          'Team collaboration skills'
        ],
        benefits: [
          'Competitive salary KES 150,000+',
          'Health insurance coverage',
          'Professional development opportunities',
          'Flexible working arrangements',
          'Career growth within banking sector'
        ],
        application_url: 'https://careers.kcbgroup.com',
        contact_email: 'careers@kcb.co.ke',
        status: 'active',
        tags: ['software', 'banking', 'react', 'entry-level', 'javascript'],
        posted_by: execUser.id
      },
      {
        title: 'KCB Foundation Innovation Grant 2025',
        description: 'Seed funding for innovative projects addressing social challenges in Kenya. Focus areas include financial inclusion, education technology, healthcare solutions, and sustainable agriculture. Perfect for student entrepreneurs with social impact ideas.',
        company: 'KCB Foundation',
        location: 'Kenya (Multiple Locations)',
        opportunity_type: 'grant',
        application_deadline: '2025-02-15',
        requirements: [
          'Kenyan innovators and entrepreneurs',
          'Social impact focus required',
          'Prototype or pilot project ready',
          'Clear implementation plan',
          'Measurable impact metrics'
        ],
        benefits: [
          'Grant funding up to KES 1,500,000',
          'Business mentorship and coaching',
          'Access to KCB business network',
          'Marketing and publicity support',
          'Potential for follow-up funding'
        ],
        application_url: 'https://kcbfoundation.org/grants',
        contact_email: 'grants@kcbfoundation.org',
        status: 'active',
        tags: ['social-impact', 'innovation', 'kenya', 'grant', 'entrepreneurship'],
        posted_by: execUser.id
      },
      {
        title: 'Google Developer Student Clubs Lead Application - JKUAT',
        description: 'Leadership opportunity to establish and lead a Google Developer Student Club at JKUAT. Includes training, resources, and support from Google to organize tech events, workshops, and study groups. Build a community of student developers on campus.',
        company: 'Google for Education',
        location: 'JKUAT Campus (Hybrid)',
        opportunity_type: 'partnership',
        application_deadline: '2025-01-30',
        requirements: [
          'Current JKUAT students (2nd year and above)',
          'Leadership and organizational experience',
          'Passion for technology and community building',
          'Good communication skills',
          'Commitment for full academic year'
        ],
        benefits: [
          'Google training and certification',
          'Access to Google Cloud credits',
          'Event organization support',
          'Global GDSC network access',
          'Resume enhancement opportunity'
        ],
        application_url: 'https://developers.google.com/community/gdsc',
        contact_email: 'gdsc@google.com',
        status: 'active',
        tags: ['google', 'leadership', 'community', 'technology', 'students'],
        posted_by: execUser.id
      }
    ];

    // Insert opportunities one by one
    let successCount = 0;
    let errorCount = 0;

    for (const opportunity of opportunities) {
      try {
        const { data, error } = await supabase
          .from('opportunities')
          .insert(opportunity)
          .select();

        if (error) {
          console.error(`❌ Failed to insert ${opportunity.title}:`, error.message);
          errorCount++;
        } else {
          console.log(`✅ Inserted: ${opportunity.title}`);
          successCount++;
        }
      } catch (err) {
        console.error(`❌ Exception inserting ${opportunity.title}:`, err.message);
        errorCount++;
      }
    }

    console.log(`\n📊 Summary:`);
    console.log(`✅ Successfully inserted: ${successCount} opportunities`);
    console.log(`❌ Failed to insert: ${errorCount} opportunities`);

    if (successCount > 0) {
      console.log('\n🎉 Partnerships & Opportunities mock data added successfully!');
      console.log('\n📋 Added opportunity types:');
      console.log('- Competitions (Safaricom Hook, Microsoft Imagine Cup)');
      console.log('- Funding (Mastercard Foundation Scholars)');
      console.log('- Internships (Safaricom Graduate Trainee)');
      console.log('- Jobs (KCB Software Developer)');
      console.log('- Grants (KCB Innovation Grant)');
      console.log('- Partnerships (Google Developer Student Clubs)');
      
      console.log('\n🌐 Visit /opportunities to see the new data!');
    }

  } catch (error) {
    console.error('❌ Failed to add opportunities data:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  addOpportunitiesData();
}

module.exports = addOpportunitiesData;