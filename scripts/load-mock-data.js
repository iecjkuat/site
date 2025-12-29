/**
 * Load Mock Data Script
 * Loads sample events data into the database
 */

require('dotenv').config();
const { supabase } = require('../lib/supabase');
const fs = require('fs');
const path = require('path');

async function loadMockData() {
    try {
        console.log('🔄 Loading events mock data...');
        
        // Use fallback method directly since exec_sql function doesn't exist
        await loadBasicMockData();
        
    } catch (error) {
        console.error('❌ Error loading mock data:', error.message);
    }
}

async function loadBasicMockData() {
    try {
        console.log('🔄 Loading comprehensive mock events...');
        
        const mockEvents = [
            {
                title: 'Innovation Workshop 2024',
                description: 'Join us for an intensive workshop on innovation methodologies, design thinking, and startup fundamentals. Learn from industry experts and network with fellow innovators. This hands-on workshop will cover ideation techniques, market validation, prototyping, and pitch development.',
                event_type: 'workshop',
                start_date: '2024-12-28T10:25:00Z',
                end_date: '2024-12-29T16:30:00Z',
                location: 'JKUAT Main Campus',
                venue_details: 'Engineering Block, Room E101. Please bring your laptop and notebook.',
                max_attendees: 50,
                registration_required: true,
                registration_deadline: '2024-12-27T23:59:59Z',
                fee: 200,
                status: 'upcoming',
                tags: ['innovation', 'workshop', 'design thinking', 'startup']
            },
            {
                title: 'AI & Machine Learning in Agriculture',
                description: 'Explore the applications of artificial intelligence and machine learning in modern agriculture. Discover how technology is revolutionizing farming practices, crop monitoring, and food security. Guest speakers from leading agritech companies will share real-world case studies.',
                event_type: 'seminar',
                start_date: '2025-01-15T14:00:00Z',
                end_date: '2025-01-15T17:00:00Z',
                location: 'JKUAT Main Campus',
                venue_details: 'Main Auditorium, Ground Floor',
                max_attendees: 200,
                registration_required: true,
                registration_deadline: '2025-01-12T23:59:59Z',
                fee: 0,
                status: 'upcoming',
                tags: ['AI', 'machine learning', 'agriculture', 'technology']
            },
            {
                title: 'JKUAT Innovation Challenge 2025',
                description: 'Annual 48-hour hackathon focusing on solutions for sustainable development and climate change. Teams will compete to develop innovative tech solutions addressing real-world problems. Prizes worth over KES 500,000 to be won!',
                event_type: 'competition',
                start_date: '2025-03-15T09:00:00Z',
                end_date: '2025-03-17T18:00:00Z',
                location: 'JKUAT Main Campus',
                venue_details: 'Innovation Hub, Multiple Labs',
                max_attendees: 150,
                registration_required: true,
                registration_deadline: '2025-03-10T23:59:59Z',
                fee: 500,
                status: 'upcoming',
                tags: ['hackathon', 'competition', 'climate tech', 'sustainability']
            },
            {
                title: 'Tech Entrepreneurs Meetup',
                description: 'Monthly networking event bringing together tech entrepreneurs, investors, and innovators. Share ideas, find co-founders, and build valuable connections in the Kenyan tech ecosystem. Light refreshments will be provided.',
                event_type: 'social',
                start_date: '2025-01-25T18:00:00Z',
                end_date: '2025-01-25T21:00:00Z',
                location: 'JKUAT Innovation Hub',
                venue_details: 'Main Hall, 2nd Floor',
                max_attendees: 80,
                registration_required: true,
                registration_deadline: '2025-01-23T23:59:59Z',
                fee: 300,
                status: 'upcoming',
                tags: ['networking', 'entrepreneurs', 'tech', 'startups']
            },
            {
                title: 'Business Plan Competition 2025',
                description: 'Present your business idea to a panel of experienced judges including venture capitalists and successful entrepreneurs. Winners receive seed funding and mentorship opportunities. Open to all students with innovative business concepts.',
                event_type: 'competition',
                start_date: '2025-02-20T09:00:00Z',
                end_date: '2025-02-20T17:00:00Z',
                location: 'JKUAT Business School',
                venue_details: 'Conference Hall A',
                max_attendees: 30,
                registration_required: true,
                registration_deadline: '2025-02-15T23:59:59Z',
                fee: 1000,
                status: 'upcoming',
                tags: ['business plan', 'competition', 'funding', 'entrepreneurship']
            },
            {
                title: 'Digital Marketing for Startups',
                description: 'Comprehensive training on digital marketing strategies specifically tailored for startups and small businesses. Learn about social media marketing, content creation, SEO, and online advertising on a budget.',
                event_type: 'workshop',
                start_date: '2025-01-30T13:00:00Z',
                end_date: '2025-01-30T17:00:00Z',
                location: 'JKUAT Computer Lab',
                venue_details: 'ICT Building, Lab 3',
                max_attendees: 40,
                registration_required: true,
                registration_deadline: '2025-01-28T23:59:59Z',
                fee: 150,
                status: 'upcoming',
                tags: ['digital marketing', 'training', 'startups', 'social media']
            },
            {
                title: 'Blockchain Technology Workshop',
                description: 'Introduction to blockchain technology, cryptocurrencies, and decentralized applications. Hands-on session building simple smart contracts and understanding the fundamentals of distributed ledger technology.',
                event_type: 'workshop',
                start_date: '2024-11-15T10:00:00Z',
                end_date: '2024-11-15T16:00:00Z',
                location: 'JKUAT Main Campus',
                venue_details: 'Engineering Block, Room E205',
                max_attendees: 35,
                registration_required: true,
                registration_deadline: '2024-11-12T23:59:59Z',
                fee: 250,
                status: 'completed',
                tags: ['blockchain', 'cryptocurrency', 'smart contracts', 'technology']
            },
            {
                title: 'Women in Tech Leadership Summit',
                description: 'Empowering women in technology through leadership development, mentorship, and networking. Featured keynote speakers, panel discussions, and breakout sessions focused on career advancement in tech.',
                event_type: 'seminar',
                start_date: '2024-10-08T09:00:00Z',
                end_date: '2024-10-08T17:00:00Z',
                location: 'JKUAT Conference Center',
                venue_details: 'Main Conference Hall',
                max_attendees: 120,
                registration_required: true,
                registration_deadline: '2024-10-05T23:59:59Z',
                fee: 0,
                status: 'completed',
                tags: ['women in tech', 'leadership', 'career development', 'networking']
            },
            {
                title: 'Open Source Contribution Workshop',
                description: 'Learn how to contribute to open source projects and build your developer portfolio. We will cover Git/GitHub workflows, finding projects to contribute to, and making your first pull request.',
                event_type: 'workshop',
                start_date: '2025-02-05T14:00:00Z',
                end_date: '2025-02-05T18:00:00Z',
                location: 'JKUAT Computer Lab',
                venue_details: 'ICT Building, Lab 1 & 2',
                max_attendees: 60,
                registration_required: true,
                registration_deadline: '2025-02-03T23:59:59Z',
                fee: 0,
                status: 'upcoming',
                tags: ['open source', 'git', 'github', 'programming']
            },
            {
                title: 'Startup Bootcamp Weekend',
                description: 'Intensive 3-day bootcamp covering all aspects of starting a tech company. From idea validation to product development, fundraising, and scaling. Includes mentorship sessions, workshops, and pitch practice.',
                event_type: 'workshop',
                start_date: '2025-04-04T09:00:00Z',
                end_date: '2025-04-06T18:00:00Z',
                location: 'JKUAT Innovation Hub',
                venue_details: 'Multiple Rooms - Full Facility',
                max_attendees: 25,
                registration_required: true,
                registration_deadline: '2025-03-30T23:59:59Z',
                fee: 2500,
                status: 'upcoming',
                tags: ['bootcamp', 'startup', 'intensive', 'mentorship']
            },
            {
                title: 'Annual Innovation Expo 2025',
                description: 'The biggest innovation showcase of the year! Students, startups, and companies will exhibit their latest innovations. Includes product demonstrations, investor meetings, and technology showcases from various industries.',
                event_type: 'social',
                start_date: '2025-05-15T08:00:00Z',
                end_date: '2025-05-17T20:00:00Z',
                location: 'JKUAT Main Campus',
                venue_details: 'Multiple Venues - Campus Wide',
                max_attendees: 500,
                registration_required: true,
                registration_deadline: '2025-05-10T23:59:59Z',
                fee: 500,
                status: 'upcoming',
                tags: ['expo', 'innovation', 'showcase', 'networking', 'investors']
            }
        ];
        
        // Clear existing events first
        const { error: deleteError } = await supabase
            .from('events')
            .delete()
            .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all events
            
        if (deleteError) {
            console.warn('⚠️  Warning clearing existing events:', deleteError.message);
        }
        
        // Insert new events
        const { data, error } = await supabase
            .from('events')
            .insert(mockEvents)
            .select();
            
        if (error) {
            console.error('❌ Failed to insert mock events:', error);
            throw error;
        } else {
            console.log('✅ Comprehensive mock data loaded successfully!');
            console.log(`📊 Events created: ${data.length}`);
            
            // Show sample of created events
            data.slice(0, 5).forEach(event => {
                console.log(`   • ${event.title} (${event.event_type}) - ${event.status}`);
            });
            
            if (data.length > 5) {
                console.log(`   ... and ${data.length - 5} more events`);
            }
        }
        
    } catch (error) {
        console.error('❌ Comprehensive mock data loading failed:', error.message);
        throw error;
    }
}

// Run the script
if (require.main === module) {
    loadMockData()
        .then(() => {
            console.log('🎉 Mock data loading complete!');
            process.exit(0);
        })
        .catch((error) => {
            console.error('💥 Script failed:', error);
            process.exit(1);
        });
}

module.exports = { loadMockData, loadBasicMockData };