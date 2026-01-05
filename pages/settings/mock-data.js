// JKUAT Innovation Club - Settings Page Mock Data

class SettingsMockData {
    constructor() {
        this.init();
    }

    init() {
        console.log('⚙️ Settings Mock Data initialized');
    }

    // User Profile Data
    getUserProfile() {
        return {
            id: 1,
            name: 'John Doe',
            email: 'john.doe@student.jkuat.ac.ke',
            phone: '+254 700 123 456',
            studentId: 'EN01-0001/2023',
            school: 'School of Engineering',
            course: 'Computer Science',
            year: 3,
            avatar: null,
            bio: 'Passionate about technology and innovation. Love building solutions that make a difference.',
            joinDate: '2023-09-15',
            membershipStatus: 'active',
            role: 'member',
            skills: ['JavaScript', 'Python', 'React', 'Node.js', 'Machine Learning'],
            interests: ['Web Development', 'AI/ML', 'Entrepreneurship', 'Mobile Apps'],
            socialLinks: {
                linkedin: 'https://linkedin.com/in/johndoe',
                github: 'https://github.com/johndoe',
                twitter: 'https://twitter.com/johndoe'
            }
        };
    }

    // Notification Preferences
    getNotificationPreferences() {
        return {
            email: {
                events: true,
                opportunities: true,
                projects: false,
                newsletter: true,
                reminders: true,
                announcements: true
            },
            push: {
                events: true,
                opportunities: true,
                projects: true,
                reminders: false,
                announcements: true
            },
            sms: {
                events: false,
                opportunities: false,
                reminders: true,
                announcements: false
            }
        };
    }

    // Privacy Settings
    getPrivacySettings() {
        return {
            profileVisibility: 'members', // public, members, private
            showEmail: false,
            showPhone: false,
            showSocialLinks: true,
            allowMessages: true,
            allowProjectInvites: true,
            allowEventInvites: true,
            showOnlineStatus: true,
            allowSearchEngineIndexing: false
        };
    }

    // Account Security Settings
    getSecuritySettings() {
        return {
            twoFactorEnabled: false,
            loginNotifications: true,
            sessionTimeout: 30, // minutes
            allowMultipleSessions: true,
            lastPasswordChange: '2024-01-01',
            loginHistory: [
                {
                    date: '2024-01-15 14:30',
                    device: 'Chrome on Windows',
                    location: 'Nairobi, Kenya',
                    ip: '192.168.1.1'
                },
                {
                    date: '2024-01-14 09:15',
                    device: 'Safari on iPhone',
                    location: 'Kiambu, Kenya',
                    ip: '192.168.1.2'
                },
                {
                    date: '2024-01-13 16:45',
                    device: 'Chrome on Android',
                    location: 'Nairobi, Kenya',
                    ip: '192.168.1.3'
                }
            ]
        };
    }

    // App Preferences
    getAppPreferences() {
        return {
            theme: 'dark', // light, dark, auto
            language: 'en',
            timezone: 'Africa/Nairobi',
            dateFormat: 'DD/MM/YYYY',
            timeFormat: '24h',
            currency: 'KES',
            itemsPerPage: 20,
            autoSave: true,
            compactMode: false,
            animations: true,
            soundEffects: false
        };
    }

    // Connected Apps/Services
    getConnectedApps() {
        return [
            {
                id: 1,
                name: 'GitHub',
                icon: 'fab fa-github',
                connected: true,
                permissions: ['Read repositories', 'Read profile'],
                connectedDate: '2024-01-10'
            },
            {
                id: 2,
                name: 'LinkedIn',
                icon: 'fab fa-linkedin',
                connected: true,
                permissions: ['Read profile', 'Read connections'],
                connectedDate: '2024-01-08'
            },
            {
                id: 3,
                name: 'Google Drive',
                icon: 'fab fa-google-drive',
                connected: false,
                permissions: ['Read files', 'Write files'],
                connectedDate: null
            },
            {
                id: 4,
                name: 'Slack',
                icon: 'fab fa-slack',
                connected: false,
                permissions: ['Send messages', 'Read channels'],
                connectedDate: null
            }
        ];
    }

    // Subscription/Membership Info
    getMembershipInfo() {
        return {
            type: 'basic', // basic, premium, lifetime
            status: 'active',
            joinDate: '2023-09-15',
            expiryDate: null, // null for basic membership
            benefits: [
                'Access to all events',
                'Project collaboration',
                'Networking opportunities',
                'Resource library access'
            ],
            paymentHistory: [
                {
                    date: '2023-09-15',
                    amount: 0,
                    type: 'Registration Fee',
                    status: 'completed'
                }
            ]
        };
    }

    // Data Export Options
    getDataExportOptions() {
        return [
            {
                type: 'profile',
                name: 'Profile Data',
                description: 'Your personal information, bio, and preferences',
                format: 'JSON',
                size: '2.3 KB'
            },
            {
                type: 'activities',
                name: 'Activity History',
                description: 'Your event attendance, project participation, and interactions',
                format: 'CSV',
                size: '15.7 KB'
            },
            {
                type: 'messages',
                name: 'Messages',
                description: 'All your messages and conversations',
                format: 'JSON',
                size: '8.2 KB'
            },
            {
                type: 'files',
                name: 'Uploaded Files',
                description: 'Documents and images you\'ve uploaded',
                format: 'ZIP',
                size: '45.1 MB'
            }
        ];
    }

    // Available Themes
    getAvailableThemes() {
        return [
            {
                id: 'light',
                name: 'Light',
                description: 'Clean and bright interface',
                preview: '#ffffff'
            },
            {
                id: 'dark',
                name: 'Dark',
                description: 'Easy on the eyes for night use',
                preview: '#1a1a1a'
            },
            {
                id: 'auto',
                name: 'Auto',
                description: 'Follows your system preference',
                preview: 'linear-gradient(45deg, #ffffff 50%, #1a1a1a 50%)'
            }
        ];
    }

    // Support Categories
    getSupportCategories() {
        return [
            {
                id: 'account',
                name: 'Account Issues',
                icon: 'fas fa-user-cog',
                description: 'Login, password, profile problems'
            },
            {
                id: 'technical',
                name: 'Technical Support',
                icon: 'fas fa-tools',
                description: 'App bugs, performance issues'
            },
            {
                id: 'events',
                name: 'Events & Activities',
                icon: 'fas fa-calendar',
                description: 'Event registration, attendance issues'
            },
            {
                id: 'projects',
                name: 'Projects',
                icon: 'fas fa-lightbulb',
                description: 'Project collaboration, submission issues'
            },
            {
                id: 'other',
                name: 'Other',
                icon: 'fas fa-question-circle',
                description: 'General questions and feedback'
            }
        ];
    }
}

// Initialize and make available globally
document.addEventListener('DOMContentLoaded', () => {
    window.settingsMockData = new SettingsMockData();
    console.log('⚙️ Settings Mock Data ready');
});

// Export for use in other modules
window.SettingsMockData = SettingsMockData;