// Dashboard Page Mock Data

// Dashboard Stats Mock Data
class DashboardMockData {
    static getStats() {
        return {
            totalEvents: 12,
            upcomingEvents: 3,
            completedProjects: 8,
            activeProjects: 2,
            totalPoints: 450,
            currentLevel: 'Innovator',
            nextLevel: 'Expert',
            pointsToNext: 50,
            eventsAttended: 8,
            contributions: 12,
            streak: 7,
            balance: 2500
        };
    }

    static getRecentActivities() {
        return [
            {
                id: 1,
                type: 'event_attended',
                title: 'Attended AI Workshop',
                description: 'Participated in Machine Learning fundamentals workshop',
                date: '2025-01-01T10:00:00Z',
                points: 25,
                icon: 'fas fa-graduation-cap',
                color: 'blue'
            },
            {
                id: 2,
                type: 'project_joined',
                title: 'Joined Smart Campus App',
                description: 'Became a frontend developer for the campus navigation project',
                date: '2024-12-28T14:30:00Z',
                points: 30,
                icon: 'fas fa-project-diagram',
                color: 'green'
            },
            {
                id: 3,
                type: 'achievement_unlocked',
                title: 'First Event Badge',
                description: 'Unlocked for attending your first innovation workshop',
                date: '2024-12-25T16:00:00Z',
                points: 15,
                icon: 'fas fa-trophy',
                color: 'yellow'
            },
            {
                id: 4,
                type: 'contribution',
                title: 'Code Review Completed',
                description: 'Reviewed pull request for Student Portal project',
                date: '2024-12-24T11:20:00Z',
                points: 10,
                icon: 'fas fa-code-branch',
                color: 'purple'
            },
            {
                id: 5,
                type: 'idea_submitted',
                title: 'Submitted Innovation Idea',
                description: 'Proposed a new campus sustainability initiative',
                date: '2024-12-22T09:15:00Z',
                points: 20,
                icon: 'fas fa-lightbulb',
                color: 'orange'
            }
        ];
    }

    static getUpcomingEvents() {
        return [
            {
                id: 1,
                title: 'Web Development Bootcamp',
                date: '2025-01-15T09:00:00Z',
                location: 'Computer Lab 1',
                type: 'workshop',
                registered: true,
                attendees: 45,
                capacity: 50,
                image: null
            },
            {
                id: 2,
                title: 'Startup Pitch Competition',
                date: '2025-01-20T14:00:00Z',
                location: 'Main Auditorium',
                type: 'competition',
                registered: false,
                attendees: 120,
                capacity: 200,
                prize: 'KSh 50,000',
                image: null
            },
            {
                id: 3,
                title: 'Tech Talk: Future of AI',
                date: '2025-01-25T16:00:00Z',
                location: 'Innovation Hub',
                type: 'seminar',
                registered: true,
                attendees: 30,
                capacity: 40,
                speaker: 'Dr. Jane Mwangi',
                image: null
            }
        ];
    }

    static getActiveProjects() {
        return [
            {
                id: 1,
                title: 'Smart Campus Navigation',
                description: 'Mobile app to help students navigate the campus efficiently',
                role: 'Frontend Developer',
                progress: 65,
                team_size: 5,
                deadline: '2025-02-15T23:59:59Z',
                status: 'active',
                technologies: ['React Native', 'Firebase', 'Google Maps API']
            },
            {
                id: 2,
                title: 'Student Portal Enhancement',
                description: 'Improving the existing student portal with new features',
                role: 'UI/UX Designer',
                progress: 30,
                team_size: 3,
                deadline: '2025-03-01T23:59:59Z',
                status: 'active',
                technologies: ['Figma', 'React', 'TailwindCSS']
            },
            {
                id: 3,
                title: 'IoT Weather Station',
                description: 'Building a campus-wide weather monitoring system',
                role: 'Hardware Lead',
                progress: 45,
                team_size: 4,
                deadline: '2025-02-28T23:59:59Z',
                status: 'active',
                technologies: ['Arduino', 'Python', 'MQTT']
            }
        ];
    }

    static getNotifications() {
        return [
            {
                id: 1,
                title: 'Event Reminder',
                message: 'Web Development Bootcamp starts in 2 days',
                type: 'event',
                read: false,
                date: '2025-01-13T08:00:00Z',
                icon: 'fas fa-calendar-alt',
                color: 'blue'
            },
            {
                id: 2,
                title: 'Project Update',
                message: 'New task assigned in Smart Campus Navigation',
                type: 'project',
                read: false,
                date: '2025-01-12T15:30:00Z',
                icon: 'fas fa-tasks',
                color: 'green'
            },
            {
                id: 3,
                title: 'Achievement Unlocked',
                message: 'You earned the "Team Player" badge!',
                type: 'achievement',
                read: false,
                date: '2025-01-11T10:20:00Z',
                icon: 'fas fa-trophy',
                color: 'yellow'
            },
            {
                id: 4,
                title: 'Payment Received',
                message: 'Membership fee payment confirmed',
                type: 'payment',
                read: true,
                date: '2025-01-10T09:00:00Z',
                icon: 'fas fa-check-circle',
                color: 'green'
            },
            {
                id: 5,
                title: 'New Opportunity',
                message: 'Internship opportunity at Tech Startup',
                type: 'opportunity',
                read: true,
                date: '2025-01-09T14:00:00Z',
                icon: 'fas fa-briefcase',
                color: 'purple'
            }
        ];
    }

    static getPaymentHistory() {
        return [
            {
                id: 1,
                description: 'Membership Fee - Spring 2025',
                amount: 1500,
                date: '2025-01-10T09:00:00Z',
                status: 'completed',
                method: 'M-Pesa',
                reference: 'MPX123456789'
            },
            {
                id: 2,
                description: 'Event Registration - AI Workshop',
                amount: 500,
                date: '2024-12-20T14:30:00Z',
                status: 'completed',
                method: 'M-Pesa',
                reference: 'MPX987654321'
            },
            {
                id: 3,
                description: 'Project Materials - IoT Kit',
                amount: 2500,
                date: '2024-12-15T11:00:00Z',
                status: 'completed',
                method: 'Bank Transfer',
                reference: 'BNK456789123'
            },
            {
                id: 4,
                description: 'Membership Fee - Fall 2024',
                amount: 1500,
                date: '2024-09-05T10:00:00Z',
                status: 'completed',
                method: 'M-Pesa',
                reference: 'MPX111222333'
            }
        ];
    }

    static getAchievements() {
        return [
            {
                id: 1,
                title: 'First Steps',
                description: 'Joined the Innovation Club',
                icon: 'fas fa-star',
                unlocked: true,
                date: '2024-12-20T10:00:00Z',
                color: 'yellow'
            },
            {
                id: 2,
                title: 'Event Enthusiast',
                description: 'Attended 5 events',
                icon: 'fas fa-calendar-check',
                unlocked: true,
                date: '2025-01-01T10:00:00Z',
                color: 'blue'
            },
            {
                id: 3,
                title: 'Team Player',
                description: 'Join your first project team',
                icon: 'fas fa-users',
                unlocked: true,
                date: '2024-12-28T14:30:00Z',
                color: 'green'
            },
            {
                id: 4,
                title: 'Innovation Master',
                description: 'Complete 10 projects',
                icon: 'fas fa-trophy',
                unlocked: false,
                progress: 2,
                target: 10,
                color: 'gray'
            },
            {
                id: 5,
                title: 'Code Warrior',
                description: 'Make 50 contributions',
                icon: 'fas fa-code',
                unlocked: false,
                progress: 12,
                target: 50,
                color: 'gray'
            },
            {
                id: 6,
                title: 'Streak Master',
                description: 'Maintain a 30-day activity streak',
                icon: 'fas fa-fire',
                unlocked: false,
                progress: 7,
                target: 30,
                color: 'gray'
            }
        ];
    }

    static getCalendarEvents() {
        const today = new Date();
        return [
            {
                date: new Date(today.getFullYear(), today.getMonth(), 15),
                title: 'Web Dev Bootcamp',
                type: 'workshop'
            },
            {
                date: new Date(today.getFullYear(), today.getMonth(), 20),
                title: 'Pitch Competition',
                type: 'competition'
            },
            {
                date: new Date(today.getFullYear(), today.getMonth(), 25),
                title: 'AI Tech Talk',
                type: 'seminar'
            }
        ];
    }
}

// Make available globally
window.DashboardMockData = DashboardMockData;

console.log('📊 Dashboard mock data loaded successfully');