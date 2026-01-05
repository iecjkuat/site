// JKUAT Innovation Club - Analytics Page Mock Data

class AnalyticsMockData {
    constructor() {
        this.init();
    }

    init() {
        console.log('📊 Analytics Mock Data initialized');
    }

    // Analytics Overview Data
    getOverviewStats() {
        return {
            totalMembers: 156,
            activeMembers: 89,
            totalEvents: 24,
            upcomingEvents: 8,
            totalProjects: 12,
            activeProjects: 7,
            totalOpportunities: 15,
            applicationsSent: 67
        };
    }

    // Member Growth Data
    getMemberGrowthData() {
        return {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
            datasets: [{
                label: 'New Members',
                data: [12, 19, 15, 25, 22, 30],
                borderColor: '#10b981',
                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                tension: 0.4
            }]
        };
    }

    // Event Attendance Data
    getEventAttendanceData() {
        return {
            labels: ['Workshop 1', 'Hackathon', 'Seminar', 'Networking', 'Competition'],
            datasets: [{
                label: 'Attendance',
                data: [45, 78, 32, 56, 89],
                backgroundColor: [
                    '#10b981',
                    '#3b82f6',
                    '#f59e0b',
                    '#8b5cf6',
                    '#ef4444'
                ]
            }]
        };
    }

    // Project Categories Data
    getProjectCategoriesData() {
        return {
            labels: ['Tech Innovation', 'Social Impact', 'Business', 'Research', 'Other'],
            datasets: [{
                data: [35, 25, 20, 15, 5],
                backgroundColor: [
                    '#10b981',
                    '#3b82f6',
                    '#f59e0b',
                    '#8b5cf6',
                    '#ef4444'
                ]
            }]
        };
    }

    // Recent Activities
    getRecentActivities() {
        return [
            {
                id: 1,
                type: 'member_joined',
                message: 'John Doe joined the club',
                timestamp: '2 hours ago',
                icon: 'fa-user-plus',
                color: '#10b981'
            },
            {
                id: 2,
                type: 'event_created',
                message: 'New workshop "AI Fundamentals" created',
                timestamp: '4 hours ago',
                icon: 'fa-calendar-plus',
                color: '#3b82f6'
            },
            {
                id: 3,
                type: 'project_submitted',
                message: 'Project "Smart Campus" submitted',
                timestamp: '6 hours ago',
                icon: 'fa-lightbulb',
                color: '#f59e0b'
            },
            {
                id: 4,
                type: 'opportunity_applied',
                message: '5 members applied to Google Internship',
                timestamp: '8 hours ago',
                icon: 'fa-briefcase',
                color: '#8b5cf6'
            },
            {
                id: 5,
                type: 'event_completed',
                message: 'Hackathon 2024 completed successfully',
                timestamp: '1 day ago',
                icon: 'fa-check-circle',
                color: '#10b981'
            }
        ];
    }

    // Top Performing Content
    getTopContent() {
        return [
            {
                id: 1,
                title: 'Introduction to Machine Learning',
                type: 'Workshop',
                views: 234,
                engagement: 89,
                date: '2024-01-15'
            },
            {
                id: 2,
                title: 'Startup Pitch Competition',
                type: 'Event',
                views: 189,
                engagement: 76,
                date: '2024-01-10'
            },
            {
                id: 3,
                title: 'Tech Career Opportunities',
                type: 'Article',
                views: 156,
                engagement: 65,
                date: '2024-01-08'
            },
            {
                id: 4,
                title: 'Innovation Project Showcase',
                type: 'Project',
                views: 134,
                engagement: 58,
                date: '2024-01-05'
            }
        ];
    }

    // Member Demographics
    getMemberDemographics() {
        return {
            byYear: {
                'Year 1': 45,
                'Year 2': 38,
                'Year 3': 32,
                'Year 4': 28,
                'Graduate': 13
            },
            bySchool: {
                'Engineering': 67,
                'ICT': 45,
                'Business': 23,
                'Agriculture': 12,
                'Other': 9
            },
            byGender: {
                'Male': 89,
                'Female': 67
            }
        };
    }

    // Performance Metrics
    getPerformanceMetrics() {
        return {
            memberRetention: 78,
            eventAttendanceRate: 65,
            projectCompletionRate: 82,
            opportunitySuccessRate: 45,
            memberSatisfaction: 4.2,
            clubGrowthRate: 23
        };
    }
}

// Initialize and make available globally
document.addEventListener('DOMContentLoaded', () => {
    window.analyticsMockData = new AnalyticsMockData();
    console.log('📊 Analytics Mock Data ready');
});

// Export for use in other modules
window.AnalyticsMockData = AnalyticsMockData;