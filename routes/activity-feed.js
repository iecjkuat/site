// JKUAT Innovation Club - Activity Feed API Routes

const express = require('express');
const router = express.Router();
const { supabaseAdmin: supabase } = require('../lib/supabase');

/**
 * GET /api/activity-feed
 * Get activity feed items for home page display
 */
router.get('/', async (req, res) => {
    try {
        const { limit = 6, offset = 0, type } = req.query;
        
        console.log('📰 Fetching activity feed...');
        
        // Create a unified activity feed from multiple sources
        const activities = [];
        
        // Get recent events
        const { data: events, error: eventsError } = await supabase
            .from('events')
            .select('id, title, description, start_date, location, event_type, created_at')
            .gte('start_date', new Date().toISOString())
            .order('start_date', { ascending: true })
            .limit(3);
        
        if (!eventsError && events) {
            events.forEach(event => {
                activities.push({
                    id: `event-${event.id}`,
                    type: 'events',
                    title: event.title,
                    description: event.description,
                    author: {
                        name: 'JKUAT Innovation Club',
                        avatar: null,
                        color: 'linear-gradient(135deg, #3b82f6, #1d4ed8)'
                    },
                    timestamp: event.created_at,
                    likes: Math.floor(Math.random() * 50) + 10,
                    comments: Math.floor(Math.random() * 20) + 2,
                    isLiked: false,
                    tags: [event.event_type, 'event'],
                    cta: {
                        text: 'Register Now',
                        icon: 'calendar-plus',
                        action: 'register'
                    },
                    media: {
                        type: 'image',
                        url: 'https://images.unsplash.com/photo-1552664730-d307ca884978?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
                        alt: event.title
                    }
                });
            });
        }
        
        // Get recent ideas
        const { data: ideas, error: ideasError } = await supabase
            .from('ideas')
            .select('id, title, description, created_at, status, category')
            .order('created_at', { ascending: false })
            .limit(2);
        
        if (!ideasError && ideas) {
            ideas.forEach(idea => {
                activities.push({
                    id: `idea-${idea.id}`,
                    type: 'projects',
                    title: `New Innovation: ${idea.title}`,
                    description: idea.description,
                    author: {
                        name: 'Innovation Team',
                        avatar: null,
                        color: 'linear-gradient(135deg, #10b981, #059669)'
                    },
                    timestamp: idea.created_at,
                    likes: Math.floor(Math.random() * 30) + 5,
                    comments: Math.floor(Math.random() * 15) + 1,
                    isLiked: false,
                    tags: [idea.category, 'innovation', 'idea'],
                    media: {
                        type: 'image',
                        url: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
                        alt: idea.title
                    }
                });
            });
        }
        
        // Get recent testimonials as achievements
        const { data: testimonials, error: testimonialsError } = await supabase
            .from('testimonials')
            .select('id, name, content, created_at, title, course')
            .eq('is_approved', true)
            .order('created_at', { ascending: false })
            .limit(2);
        
        if (!testimonialsError && testimonials) {
            testimonials.forEach(testimonial => {
                activities.push({
                    id: `testimonial-${testimonial.id}`,
                    type: 'achievements',
                    title: `Success Story: ${testimonial.name}`,
                    description: testimonial.content,
                    author: {
                        name: testimonial.name,
                        avatar: null,
                        color: 'linear-gradient(135deg, #f59e0b, #d97706)'
                    },
                    timestamp: testimonial.created_at,
                    likes: Math.floor(Math.random() * 80) + 20,
                    comments: Math.floor(Math.random() * 25) + 5,
                    isLiked: false,
                    tags: ['success', 'achievement', 'testimonial'],
                    cta: {
                        text: 'Read More',
                        icon: 'external-link-alt',
                        action: 'learn-more'
                    },
                    media: {
                        type: 'image',
                        url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
                        alt: 'Success Story'
                    }
                });
            });
        }
        
        // Add some general news/announcements
        const newsItems = [
            {
                id: 'news-1',
                type: 'news',
                title: 'Partnership with Google Developer Groups',
                description: 'Exciting news! We\'ve partnered with Google Developer Groups Kenya to bring exclusive workshops, mentorship programs, and internship opportunities to our members.',
                author: {
                    name: 'JKUAT Innovation Club',
                    avatar: null,
                    color: 'linear-gradient(135deg, #ef4444, #dc2626)'
                },
                timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
                likes: 89,
                comments: 23,
                isLiked: true,
                tags: ['partnership', 'google', 'opportunities', 'mentorship'],
                cta: {
                    text: 'Join Program',
                    icon: 'user-plus',
                    action: 'join'
                },
                media: {
                    type: 'image',
                    url: 'https://images.unsplash.com/photo-1573164713714-d95e436ab8d6?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
                    alt: 'Partnership Announcement'
                }
            },
            {
                id: 'news-2',
                type: 'achievements',
                title: 'Club Reaches 500 Members Milestone',
                description: 'We\'re thrilled to announce that our innovation community has grown to 500+ active members! Thank you to everyone who makes this community amazing.',
                author: {
                    name: 'JKUAT Innovation Club',
                    avatar: null,
                    color: 'linear-gradient(135deg, #06b6d4, #0891b2)'
                },
                timestamp: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
                likes: 234,
                comments: 67,
                isLiked: true,
                tags: ['milestone', 'community', 'growth', 'celebration']
            }
        ];
        
        activities.push(...newsItems);
        
        // Sort by timestamp (most recent first)
        activities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        
        // Filter by type if specified
        let filteredActivities = activities;
        if (type && type !== 'all') {
            filteredActivities = activities.filter(item => item.type === type);
        }
        
        // Apply pagination
        const startIndex = parseInt(offset);
        const endIndex = startIndex + parseInt(limit);
        const paginatedActivities = filteredActivities.slice(startIndex, endIndex);
        
        console.log(`✅ Fetched ${paginatedActivities.length} activity feed items`);
        
        res.json({
            success: true,
            items: paginatedActivities,
            total: filteredActivities.length,
            hasMore: endIndex < filteredActivities.length,
            message: 'Activity feed retrieved successfully'
        });
        
    } catch (error) {
        console.error('❌ Error in activity feed route:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching activity feed',
            error: error.message
        });
    }
});

module.exports = router;