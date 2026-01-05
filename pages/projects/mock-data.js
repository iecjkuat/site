// Projects Page - Mock Data

class ProjectsMockData {
    constructor() {
        this.init();
    }

    init() {
        console.log('📊 Initializing ProjectsMockData...');
        console.log('✅ ProjectsMockData initialized');
    }

    // Mock user data
    getMockUser() {
        return {
            id: 'user_123',
            name: 'John Doe',
            email: 'john.doe@jkuat.ac.ke',
            role: 'student',
            department: 'Computer Science',
            year: '3rd Year',
            avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
            joinedDate: '2024-01-15',
            skills: ['JavaScript', 'React', 'Node.js', 'Python'],
            interests: ['Web Development', 'AI/ML', 'Entrepreneurship']
        };
    }

    // Mock notification data
    getMockNotifications() {
        return [
            {
                id: 'notif_1',
                type: 'project_invitation',
                title: 'Project Collaboration Request',
                message: 'Sarah Wilson invited you to collaborate on "Smart Campus Navigation App"',
                timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
                read: false,
                actionUrl: '/projects#1'
            },
            {
                id: 'notif_2',
                type: 'hackathon_reminder',
                title: 'Hackathon Registration Reminder',
                message: 'Registration for JKUAT Innovation Challenge 2025 closes in 3 days',
                timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
                read: false,
                actionUrl: '/projects#hackathons'
            },
            {
                id: 'notif_3',
                type: 'project_update',
                title: 'Project Status Update',
                message: 'Digital Library Management System has reached 60% completion',
                timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
                read: true,
                actionUrl: '/projects#4'
            }
        ];
    }

    // Mock project statistics
    getProjectStats() {
        return {
            totalProjects: 24,
            activeProjects: 12,
            completedProjects: 8,
            incubationProjects: 4,
            totalMembers: 156,
            hackathonsHosted: 6,
            successfulStartups: 3
        };
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('📊 Projects Mock Data DOM loaded');
    window.projectsMockData = new ProjectsMockData();
});

// Make available globally
window.ProjectsMockData = ProjectsMockData;