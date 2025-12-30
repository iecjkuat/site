// Script to add upcoming events for launch
require('dotenv').config();
const { supabase } = require('../lib/supabase');
const fs = require('fs');
const path = require('path');

async function addUpcomingEvents() {
    try {
        console.log('📅 Adding upcoming events for launch...');
        
        // Read the SQL file
        const sqlPath = path.join(__dirname, '../supabase/26-upcoming-events-for-launch.sql');
        const sql = fs.readFileSync(sqlPath, 'utf8');
        
        // For Supabase, we'll use individual insert operations
        const upcomingEvents = [
            {
                title: 'AI & Machine Learning Workshop 2025',
                description: 'Comprehensive hands-on workshop covering the fundamentals of artificial intelligence and machine learning. Learn to build your first ML models using Python, TensorFlow, and real-world datasets. Perfect for beginners and intermediate developers.',
                event_type: 'workshop',
                start_date: '2025-01-08T14:00:00Z',
                end_date: '2025-01-08T18:00:00Z',
                location: 'JKUAT Main Campus',
                venue_details: 'Engineering Block, Computer Lab 1 & 2. Please bring your laptop with Python installed.',
                max_attendees: 50,
                registration_required: true,
                registration_deadline: '2025-01-06T23:59:59Z',
                fee: 500,
                status: 'upcoming',
                tags: ['AI', 'machine learning', 'python', 'tensorflow', 'workshop', 'hands-on']
            },
            {
                title: 'Innovation Startup Pitch Competition 2025',
                description: 'Present your startup idea to a panel of experienced judges including venture capitalists, successful entrepreneurs, and industry experts. Winners receive seed funding, mentorship, and incubation support.',
                event_type: 'competition',
                start_date: '2025-02-15T09:00:00Z',
                end_date: '2025-02-15T17:00:00Z',
                location: 'JKUAT Business School',
                venue_details: 'Main Auditorium. Participants should prepare a 5-minute pitch and demo.',
                max_attendees: 30,
                registration_required: true,
                registration_deadline: '2025-02-10T23:59:59Z',
                fee: 1000,
                status: 'upcoming',
                tags: ['startup', 'pitch', 'competition', 'funding', 'entrepreneurship', 'business']
            },
            {
                title: 'Tech Industry Networking Night',
                description: 'Connect with JKUAT alumni working in top tech companies, startup founders, and industry professionals. Great opportunity for internships, job opportunities, and mentorship connections.',
                event_type: 'social',
                start_date: '2025-01-25T18:00:00Z',
                end_date: '2025-01-25T21:00:00Z',
                location: 'JKUAT Innovation Hub',
                venue_details: 'Main Hall, 2nd Floor. Business casual dress code recommended.',
                max_attendees: 80,
                registration_required: true,
                registration_deadline: '2025-01-23T23:59:59Z',
                fee: 300,
                status: 'upcoming',
                tags: ['networking', 'alumni', 'tech industry', 'careers', 'mentorship']
            },
            {
                title: 'Blockchain Technology & Web3 Development Seminar',
                description: 'Explore the future of decentralized technology with blockchain and Web3 development. Learn about smart contracts, DeFi, NFTs, and how to build decentralized applications.',
                event_type: 'seminar',
                start_date: '2025-02-08T10:00:00Z',
                end_date: '2025-02-08T16:00:00Z',
                location: 'JKUAT Main Campus',
                venue_details: 'Conference Hall A, ICT Building. Lunch will be provided.',
                max_attendees: 100,
                registration_required: true,
                registration_deadline: '2025-02-05T23:59:59Z',
                fee: 0,
                status: 'upcoming',
                tags: ['blockchain', 'web3', 'cryptocurrency', 'smart contracts', 'defi', 'nft']
            },
            {
                title: 'Mobile App Development Bootcamp',
                description: 'Intensive 2-day bootcamp covering iOS and Android app development using React Native and Flutter. Build and deploy your first mobile app by the end of the bootcamp.',
                event_type: 'workshop',
                start_date: '2025-01-11T09:00:00Z',
                end_date: '2025-01-12T17:00:00Z',
                location: 'JKUAT Computer Lab',
                venue_details: 'ICT Building, Labs 1-3. Laptops will be provided, but bring your own if preferred.',
                max_attendees: 40,
                registration_required: true,
                registration_deadline: '2025-01-09T23:59:59Z',
                fee: 1500,
                status: 'upcoming',
                tags: ['mobile development', 'react native', 'flutter', 'ios', 'android', 'bootcamp']
            },
            {
                title: 'JKUAT Innovation Challenge Hackathon 2025',
                description: '48-hour hackathon focusing on solutions for climate change, healthcare, and education. Teams will compete to develop innovative tech solutions with mentorship from industry experts.',
                event_type: 'competition',
                start_date: '2025-03-07T18:00:00Z',
                end_date: '2025-03-09T18:00:00Z',
                location: 'JKUAT Innovation Hub',
                venue_details: 'Multiple labs and meeting rooms. Meals and accommodation provided.',
                max_attendees: 120,
                registration_required: true,
                registration_deadline: '2025-03-01T23:59:59Z',
                fee: 800,
                status: 'upcoming',
                tags: ['hackathon', 'innovation', 'climate tech', 'healthcare', 'education', 'competition']
            },
            {
                title: 'Digital Marketing Strategies for Tech Startups',
                description: 'Learn effective digital marketing strategies specifically tailored for tech startups and small businesses. Covers social media marketing, SEO, content marketing, and growth hacking.',
                event_type: 'workshop',
                start_date: '2025-01-30T13:00:00Z',
                end_date: '2025-01-30T17:00:00Z',
                location: 'JKUAT Business School',
                venue_details: 'Seminar Room B. Materials and resources will be provided.',
                max_attendees: 35,
                registration_required: true,
                registration_deadline: '2025-01-28T23:59:59Z',
                fee: 400,
                status: 'upcoming',
                tags: ['digital marketing', 'startups', 'social media', 'seo', 'growth hacking']
            },
            {
                title: 'Women in Tech Leadership Summit 2025',
                description: 'Empowering women in technology through leadership development, mentorship, and networking. Featured keynote speakers, panel discussions, and breakout sessions on career advancement.',
                event_type: 'seminar',
                start_date: '2025-02-22T09:00:00Z',
                end_date: '2025-02-22T17:00:00Z',
                location: 'JKUAT Conference Center',
                venue_details: 'Main Conference Hall. Professional attire recommended.',
                max_attendees: 150,
                registration_required: true,
                registration_deadline: '2025-02-18T23:59:59Z',
                fee: 0,
                status: 'upcoming',
                tags: ['women in tech', 'leadership', 'career development', 'networking', 'mentorship']
            }
        ];
        
        console.log(`📝 Inserting ${upcomingEvents.length} upcoming events...`);
        
        const { data, error } = await supabase
            .from('events')
            .insert(upcomingEvents)
            .select();
            
        if (error) {
            console.error('❌ Error inserting events:', error);
            return;
        }
        
        console.log(`✅ Successfully added ${data?.length || 0} upcoming events!`);
        
        // Update current attendees for realistic numbers
        console.log('📊 Updating attendee counts...');
        
        for (const event of data || []) {
            const randomAttendees = Math.floor(Math.random() * (event.max_attendees * 0.6)) + 1;
            
            const { error: updateError } = await supabase
                .from('events')
                .update({ current_attendees: randomAttendees })
                .eq('id', event.id);
                
            if (updateError) {
                console.error(`❌ Error updating attendees for ${event.title}:`, updateError);
            } else {
                console.log(`✅ Updated ${event.title}: ${randomAttendees}/${event.max_attendees} attendees`);
            }
        }
        
        // Test the events API
        console.log('🧪 Testing events API...');
        const { data: testEvents, error: testError } = await supabase
            .from('events')
            .select('*')
            .eq('status', 'upcoming')
            .gte('start_date', new Date().toISOString())
            .order('start_date', { ascending: true })
            .limit(5);
            
        if (testError) {
            console.error('❌ Error testing events API:', testError);
        } else {
            console.log(`✅ Events API working! Found ${testEvents?.length || 0} upcoming events`);
            testEvents?.forEach(event => {
                console.log(`  📅 ${event.title} - ${new Date(event.start_date).toLocaleDateString()}`);
            });
        }
        
    } catch (error) {
        console.error('❌ Error adding upcoming events:', error);
    }
}

// Run the script
addUpcomingEvents();