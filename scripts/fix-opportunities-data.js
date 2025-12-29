#!/usr/bin/env node

/**
 * Fix Partnerships & Opportunities Data
 * Add the remaining opportunities using allowed types
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

async function fixOpportunitiesData() {
  console.log('🔧 Fixing Partnerships & Opportunities data...');

  try {
    // Get user IDs
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

    // Add the opportunities that failed, using allowed types
    const fixedOpportunities = [
      {
        title: 'Mastercard Foundation Scholars Program 2025',
        description: 'Comprehensive scholarship program providing financial support, leadership development, and career guidance for academically talented young people from disadvantaged backgrounds across Africa. Covers full tuition, accommodation, and living expenses.',
        company: 'Mastercard Foundation',
        location: 'Various African Universities',
        opportunity_type: 'scholarship', // Changed from 'funding' to 'scholarship'
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
        title: 'KCB Foundation Innovation Grant 2025',
        description: 'Seed funding for innovative projects addressing social challenges in Kenya. Focus areas include financial inclusion, education technology, healthcare solutions, and sustainable agriculture. Perfect for student entrepreneurs with social impact ideas.',
        company: 'KCB Foundation',
        location: 'Kenya (Multiple Locations)',
        opportunity_type: 'scholarship', // Changed from 'grant' to 'scholarship' (closest match)
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
        opportunity_type: 'internship', // Changed from 'partnership' to 'internship' (closest match)
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
      },
      // Add a few more opportunities for variety
      {
        title: 'iHub Tech Entrepreneurs Monthly Meetup',
        description: 'Monthly networking event bringing together tech entrepreneurs, investors, and innovators in Nairobi. Features keynote speakers, startup pitches, and networking sessions. Great opportunity to connect with the Kenyan tech ecosystem.',
        company: 'iHub Nairobi',
        location: 'iHub Nairobi, Senteu Plaza',
        opportunity_type: 'job', // Using 'job' as closest match for networking
        application_deadline: '2025-01-18',
        requirements: [
          'Tech entrepreneurs and students',
          'Professionals in tech industry',
          'Startup founders and team members',
          'Investors and mentors welcome',
          'Bring business cards for networking'
        ],
        benefits: [
          'Free attendance',
          'Networking with industry leaders',
          'Learning from keynote speakers',
          'Startup pitch opportunities',
          'Access to investor network'
        ],
        application_url: 'https://ihub.co.ke/events',
        contact_email: 'events@ihub.co.ke',
        status: 'active',
        tags: ['networking', 'entrepreneurs', 'tech', 'nairobi', 'startups'],
        posted_by: execUser.id
      },
      {
        title: 'Microsoft Student Accelerator Program Kenya',
        description: 'Intensive 6-month program for computer science students to work on real Microsoft products. Includes technical mentorship, career coaching, and potential full-time offer. Work with cutting-edge technologies and global teams.',
        company: 'Microsoft Kenya',
        location: 'Nairobi/Remote (Hybrid)',
        opportunity_type: 'internship',
        application_deadline: '2025-02-10',
        requirements: [
          'Computer Science/Engineering students',
          'Strong programming skills (C#, Python, JavaScript)',
          'GPA of 3.5 or higher',
          'Excellent English communication',
          'Available for 6-month commitment'
        ],
        benefits: [
          'Monthly stipend of KES 120,000',
          'Microsoft certification training',
          'Mentorship from Microsoft engineers',
          'Potential full-time job offer',
          'Global project exposure'
        ],
        application_url: 'https://careers.microsoft.com/students',
        contact_email: 'students@microsoft.com',
        status: 'active',
        tags: ['microsoft', 'software', 'mentorship', 'tech', 'accelerator'],
        posted_by: execUser.id
      }
    ];

    // Insert the fixed opportunities
    let successCount = 0;
    let errorCount = 0;

    for (const opportunity of fixedOpportunities) {
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
      console.log('\n🎉 Additional opportunities added successfully!');
      
      // Get total count
      const { count } = await supabase
        .from('opportunities')
        .select('*', { count: 'exact', head: true });
      
      console.log(`\n📊 Total opportunities in database: ${count}`);
      console.log('\n🌐 Visit /opportunities to see all the opportunities!');
    }

  } catch (error) {
    console.error('❌ Failed to fix opportunities data:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  fixOpportunitiesData();
}

module.exports = fixOpportunitiesData;