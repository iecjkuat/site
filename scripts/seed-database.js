#!/usr/bin/env node

/**
 * Database Seeding Script for Supabase
 * Creates sample data for JKUAT Innovation and Entrepreneurship Club
 */

const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

async function seedDatabase() {
  console.log('🌱 Seeding JKUAT Innovation and Entrepreneurship Club database...');

  try {
    // Create admin user
    const adminPassword = await bcrypt.hash('admin123', 12);
    const { data: adminUser, error: adminError } = await supabase
      .from('users')
      .insert({
        name: 'System Administrator',
        email: 'admin@jkuatinnovation.ac.ke',
        phone: '+254700000001',
        password_hash: adminPassword,
        registration_number: 'EN111-0001/2020',
        course: 'Computer Science',
        year_of_study: 4,
        college: 'Engineering',
        role: 'admin',
        membership_status: 'active',
        email_verified: true,
        skills: ['Leadership', 'Project Management', 'Software Development'],
        interests: ['Innovation', 'Technology', 'Entrepreneurship']
      })
      .select()
      .single();

    if (adminError) {
      console.error('❌ Admin user creation failed:', adminError);
      return;
    }

    console.log('✅ Created admin user');

    // Create sample users
    const userPassword = await bcrypt.hash('password123', 12);
    const sampleUsers = [
      {
        name: 'John Doe',
        email: 'john.doe@student.jkuat.ac.ke',
        phone: '+254700000002',
        password_hash: userPassword,
        registration_number: 'EN111-0002/2021',
        course: 'Software Engineering',
        year_of_study: 3,
        college: 'Engineering',
        role: 'executive',
        membership_status: 'active',
        email_verified: true,
        skills: ['Programming', 'Problem Solving'],
        interests: ['Technology', 'Innovation']
      },
      {
        name: 'Jane Smith',
        email: 'jane.smith@student.jkuat.ac.ke',
        phone: '+254700000003',
        password_hash: userPassword,
        registration_number: 'EN111-0003/2021',
        course: 'Computer Science',
        year_of_study: 3,
        college: 'Engineering',
        role: 'member',
        membership_status: 'active',
        email_verified: true,
        skills: ['Programming', 'Team Work'],
        interests: ['Technology', 'Learning']
      }
    ];

    const { data: users, error: usersError } = await supabase
      .from('users')
      .insert(sampleUsers)
      .select();

    if (usersError) {
      console.error('❌ Sample users creation failed:', usersError);
      return;
    }

    console.log('✅ Created sample users');

    // Create sample events
    const sampleEvents = [
      {
        title: 'Innovation Workshop 2024',
        description: 'Learn about the latest innovation trends and methodologies.',
        location: 'JKUAT Main Campus',
        venue_details: 'Engineering Auditorium',
        start_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        end_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000 + 4 * 60 * 60 * 1000).toISOString(),
        registration_deadline: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
        max_attendees: 100,
        fee: 200,
        status: 'upcoming',
        tags: ['innovation', 'workshop', 'technology'],
        created_by: adminUser.id
      },
      {
        title: 'Entrepreneurship Bootcamp',
        description: 'Intensive 3-day bootcamp on starting and running a successful business.',
        location: 'JKUAT Innovation Hub',
        venue_details: 'Conference Room A',
        start_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
        end_date: new Date(Date.now() + 16 * 24 * 60 * 60 * 1000).toISOString(),
        registration_deadline: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
        max_attendees: 50,
        fee: 500,
        status: 'upcoming',
        tags: ['entrepreneurship', 'bootcamp', 'business'],
        created_by: adminUser.id
      }
    ];

    const { error: eventsError } = await supabase
      .from('events')
      .insert(sampleEvents);

    if (eventsError) {
      console.error('❌ Sample events creation failed:', eventsError);
      return;
    }

    console.log('✅ Created sample events');

    // Create sample ideas
    const sampleIdeas = [
      {
        user_id: users[0].id,
        title: 'Smart Campus Navigation App',
        description: 'A mobile app that helps students navigate the JKUAT campus using AR and GPS technology.',
        category: 'Technology',
        tags: ['mobile app', 'AR', 'navigation', 'campus'],
        status: 'approved',
        upvotes: 15,
        downvotes: 2
      },
      {
        user_id: users[1].id,
        title: 'Student Marketplace Platform',
        description: 'An online platform where students can buy, sell, and exchange textbooks, electronics, and other items.',
        category: 'Business',
        tags: ['marketplace', 'e-commerce', 'students'],
        status: 'pending',
        upvotes: 12,
        downvotes: 1
      }
    ];

    const { error: ideasError } = await supabase
      .from('ideas')
      .insert(sampleIdeas);

    if (ideasError) {
      console.error('❌ Sample ideas creation failed:', ideasError);
      return;
    }

    console.log('✅ Created sample ideas');

    // Create sample resources
    const sampleResources = [
      {
        uploaded_by: adminUser.id,
        title: 'Club Handbook 2024',
        description: 'Complete guide for new members including club rules, activities, and opportunities.',
        category: 'Documentation',
        tags: ['handbook', 'guide', 'rules'],
        access_level: 'members',
        file_type: 'PDF',
        file_name: 'club-handbook-2024.pdf',
        file_size: 2048000
      },
      {
        uploaded_by: adminUser.id,
        title: 'Innovation Methodology Guide',
        description: 'Step-by-step guide to innovation processes and methodologies.',
        category: 'Education',
        tags: ['innovation', 'methodology', 'guide'],
        access_level: 'members',
        file_type: 'PDF',
        file_name: 'innovation-guide.pdf',
        file_size: 1536000
      }
    ];

    const { error: resourcesError } = await supabase
      .from('resources')
      .insert(sampleResources);

    if (resourcesError) {
      console.error('❌ Sample resources creation failed:', resourcesError);
      return;
    }

    console.log('✅ Created sample resources');

    // Create sample opportunities
    const sampleOpportunities = [
      {
        posted_by: adminUser.id,
        title: 'Software Development Internship',
        description: 'Join our team as a software development intern and gain hands-on experience with modern web technologies.',
        company: 'TechCorp Kenya',
        location: 'Nairobi, Kenya',
        opportunity_type: 'internship',
        application_deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        requirements: ['Programming skills', 'Team collaboration', 'Problem solving'],
        benefits: ['Mentorship', 'Certificate', 'Networking opportunities'],
        status: 'active'
      },
      {
        posted_by: adminUser.id,
        title: 'Innovation Challenge 2024',
        description: 'National innovation challenge with cash prizes for the best innovative solutions.',
        company: 'Kenya Innovation Agency',
        location: 'Nationwide',
        opportunity_type: 'competition',
        application_deadline: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        requirements: ['Innovative idea', 'Team of 3-5 members', 'Prototype (optional)'],
        benefits: ['Cash prizes up to KES 500,000', 'Mentorship', 'Media coverage'],
        status: 'active'
      }
    ];

    const { error: opportunitiesError } = await supabase
      .from('opportunities')
      .insert(sampleOpportunities);

    if (opportunitiesError) {
      console.error('❌ Sample opportunities creation failed:', opportunitiesError);
      return;
    }

    console.log('✅ Created sample opportunities');

    console.log('\n🎉 Database seeding completed successfully!');
    console.log('\n📊 Summary:');
    console.log('- JKUAT Innovation and Entrepreneurship Club database ready');
    console.log('- 3 Users created (1 admin, 2 members)');
    console.log('- 2 Events created');
    console.log('- 2 Ideas created');
    console.log('- 2 Resources created');
    console.log('- 2 Opportunities created');
    
    console.log('\n🔐 Test Credentials:');
    console.log('Admin: admin@jkuatinnovation.ac.ke / admin123');
    console.log('User: john.doe@student.jkuat.ac.ke / password123');
    console.log('User: jane.smith@student.jkuat.ac.ke / password123');

  } catch (error) {
    console.error('❌ Seeding failed:', error.message);
    process.exit(1);
  }
}

// Run seeding if called directly
if (require.main === module) {
  seedDatabase();
}

module.exports = seedDatabase;