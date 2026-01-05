// Admin Page Mock Data

// Admin Panel Mock Data
class AdminMockData {
    static getSystemStats() {
        return {
            totalUsers: 1247,
            activeUsers: 892,
            totalEvents: 45,
            upcomingEvents: 8,
            totalProjects: 23,
            activeProjects: 12,
            totalClubs: 15,
            pendingApprovals: 7
        };
    }

    static getRecentActivities() {
        return [
            {
                id: 1,
                type: 'user_registration',
                title: 'New User Registration',
                description: 'John Doe registered for the Innovation Club',
                date: '2025-01-01T10:00:00Z',
                user: 'John Doe',
                action: 'registered'
            },
            {
                id: 2,
                type: 'event_created',
                title: 'Event Created',
                description: 'AI Workshop scheduled for January 15th',
                date: '2025-01-01T09:30:00Z',
                user: 'Admin',
                action: 'created event'
            },
            {
                id: 3,
                type: 'project_submitted',
                title: 'Project Submission',
                description: 'Smart Campus App project submitted for review',
                date: '2024-12-31T16:00:00Z',
                user: 'Jane Smith',
                action: 'submitted project'
            }
        ];
    }

    static getPendingApprovals() {
        return [
            {
                id: 1,
                type: 'event',
                title: 'Blockchain Workshop',
                submitter: 'Tech Committee',
                date: '2025-01-10T14:00:00Z',
                status: 'pending',
                priority: 'high'
            },
            {
                id: 2,
                type: 'project',
                title: 'Student Portal Enhancement',
                submitter: 'Development Team',
                date: '2025-01-08T10:00:00Z',
                status: 'pending',
                priority: 'medium'
            },
            {
                id: 3,
                type: 'user',
                title: 'Leadership Role Request',
                submitter: 'Alice Johnson',
                date: '2025-01-05T12:00:00Z',
                status: 'pending',
                priority: 'low'
            }
        ];
    }

    static getUserManagement() {
        return [
            {
                id: 1,
                name: 'John Doe',
                email: 'john.doe@student.jkuat.ac.ke',
                role: 'member',
                joinDate: '2024-12-20T10:00:00Z',
                status: 'active',
                eventsAttended: 5,
                projectsJoined: 2
            },
            {
                id: 2,
                name: 'Jane Smith',
                email: 'jane.smith@student.jkuat.ac.ke',
                role: 'leader',
                joinDate: '2024-11-15T10:00:00Z',
                status: 'active',
                eventsAttended: 12,
                projectsJoined: 4
            },
            {
                id: 3,
                name: 'Bob Wilson',
                email: 'bob.wilson@student.jkuat.ac.ke',
                role: 'member',
                joinDate: '2024-12-01T10:00:00Z',
                status: 'inactive',
                eventsAttended: 1,
                projectsJoined: 0
            }
        ];
    }

    static getEventManagement() {
        return [
            {
                id: 1,
                title: 'AI Workshop',
                date: '2025-01-15T09:00:00Z',
                location: 'Computer Lab 1',
                type: 'workshop',
                status: 'approved',
                registrations: 45,
                capacity: 50
            },
            {
                id: 2,
                title: 'Startup Pitch Competition',
                date: '2025-01-20T14:00:00Z',
                location: 'Main Auditorium',
                type: 'competition',
                status: 'pending',
                registrations: 23,
                capacity: 100
            },
            {
                id: 3,
                title: 'Tech Talk: Future of AI',
                date: '2025-01-25T16:00:00Z',
                location: 'Innovation Hub',
                type: 'seminar',
                status: 'approved',
                registrations: 67,
                capacity: 80
            }
        ];
    }

    static getProjectManagement() {
        return [
            {
                id: 1,
                title: 'Smart Campus Navigation',
                description: 'Mobile app to help students navigate the campus',
                leader: 'Jane Smith',
                teamSize: 5,
                status: 'active',
                progress: 65,
                deadline: '2025-02-15T23:59:59Z'
            },
            {
                id: 2,
                title: 'Student Portal Enhancement',
                description: 'Improving the existing student portal with new features',
                leader: 'John Doe',
                teamSize: 3,
                status: 'pending_approval',
                progress: 0,
                deadline: '2025-03-01T23:59:59Z'
            },
            {
                id: 3,
                title: 'IoT Weather Station',
                description: 'Building a weather monitoring system for the campus',
                leader: 'Alice Johnson',
                teamSize: 4,
                status: 'completed',
                progress: 100,
                deadline: '2024-12-31T23:59:59Z'
            }
        ];
    }

    static getSystemSettings() {
        return {
            clubName: 'JKUAT Innovation and Entrepreneurship Club',
            maxEventCapacity: 200,
            maxProjectTeamSize: 10,
            pointsPerEvent: 25,
            pointsPerProject: 50,
            emailNotifications: true,
            autoApproveEvents: false,
            autoApproveProjects: false,
            maintenanceMode: false
        };
    }
}

// Make available globally
window.AdminMockData = AdminMockData;

console.log('👑 Admin mock data loaded successfully');