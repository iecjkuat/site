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
            pointsToNext: 50
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
                icon: 'fas fa-graduation-cap'
            },
            {
                id: 2,
                type: 'project_joined',
                title: 'Joined Smart Campus App',
                description: 'Became a frontend developer for the campus navigation project',
                date: '2024-12-28T14:30:00Z',
                points: 30,
                icon: 'fas fa-project-diagram'
            },
            {
                id: 3,
                type: 'achievement_unlocked',
                title: 'First Event Badge',
                description: 'Unlocked for attending your first innovation workshop',
                date: '2024-12-25T16:00:00Z',
                points: 15,
                icon: 'fas fa-trophy'
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
                registered: true
            },
            {
                id: 2,
                title: 'Startup Pitch Competition',
                date: '2025-01-20T14:00:00Z',
                location: 'Main Auditorium',
                type: 'competition',
                registered: false
            },
            {
                id: 3,
                title: 'Tech Talk: Future of AI',
                date: '2025-01-25T16:00:00Z',
                location: 'Innovation Hub',
                type: 'seminar',
                registered: true
            }
        ];
    }

    static getActiveProjects() {
        return [
            {
                id: 1,
                title: 'Smart Campus Navigation',
                description: 'Mobile app to help students navigate the campus',
                role: 'Frontend Developer',
                progress: 65,
                team_size: 5,
                deadline: '2025-02-15T23:59:59Z'
            },
            {
                id: 2,
                title: 'Student Portal Enhancement',
                description: 'Improving the existing student portal with new features',
                role: 'UI/UX Designer',
                progress: 30,
                team_size: 3,
                deadline: '2025-03-01T23:59:59Z'
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
                date: '2024-12-20T10:00:00Z'
            },
            {
                id: 2,
                title: 'Event Enthusiast',
                description: 'Attended 5 events',
                icon: 'fas fa-calendar-check',
                unlocked: true,
                date: '2025-01-01T10:00:00Z'
            },
            {
                id: 3,
                title: 'Team Player',
                description: 'Join your first project team',
                icon: 'fas fa-users',
                unlocked: true,
                date: '2024-12-28T14:30:00Z'
            },
            {
                id: 4,
                title: 'Innovation Master',
                description: 'Complete 10 projects',
                icon: 'fas fa-trophy',
                unlocked: false,
                progress: 2,
                target: 10
            }
        ];
    }
}

// Make available globally
window.DashboardMockData = DashboardMockData;

console.log('📊 Dashboard mock data loaded successfully');