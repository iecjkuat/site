// JKUAT Innovation Club - Opportunities Page Mock Data

// Opportunities Mock Data
class OpportunitiesMockData {
    static getOpportunities() {
        return [
            {
                id: 1,
                title: "Software Engineering Internship",
                company: "Safaricom PLC",
                type: "internship",
                location: "Nairobi, Kenya",
                description: "Join our software engineering team to work on cutting-edge mobile applications and backend systems. Perfect for students looking to gain real-world experience in software development.",
                requirements: [
                    "Computer Science, IT, or related field",
                    "Knowledge of Java, Python, or JavaScript",
                    "Strong problem-solving skills",
                    "Good communication skills"
                ],
                deadline: "2025-02-15",
                duration: "3 months",
                stipend: "KES 30,000/month",
                posted_date: "2025-01-01",
                status: "active"
            },
            {
                id: 2,
                title: "Data Science Research Assistant",
                company: "JKUAT Research Center",
                type: "research",
                location: "JKUAT Campus",
                description: "Assist in data analysis and machine learning research projects. Great opportunity to work with faculty on cutting-edge research in AI and data science.",
                requirements: [
                    "Statistics, Mathematics, or Computer Science",
                    "Python programming experience",
                    "Knowledge of pandas, numpy, scikit-learn",
                    "Research experience preferred"
                ],
                deadline: "2025-01-30",
                duration: "6 months",
                stipend: "KES 20,000/month",
                posted_date: "2025-01-05",
                status: "active"
            },
            {
                id: 3,
                title: "UI/UX Design Internship",
                company: "Craft Silicon",
                type: "internship",
                location: "Nairobi, Kenya",
                description: "Work with our design team to create intuitive user interfaces for fintech applications. Learn industry-standard design tools and methodologies.",
                requirements: [
                    "Design, IT, or related field",
                    "Proficiency in Figma or Adobe XD",
                    "Understanding of user-centered design",
                    "Portfolio of design work"
                ],
                deadline: "2025-02-28",
                duration: "4 months",
                stipend: "KES 25,000/month",
                posted_date: "2025-01-08",
                status: "active"
            },
            {
                id: 4,
                title: "Innovation Challenge 2025",
                company: "Kenya Innovation Agency",
                type: "competition",
                location: "Nationwide",
                description: "National innovation competition for students. Present your innovative solution to real-world problems and win funding to develop your idea further.",
                requirements: [
                    "Currently enrolled student",
                    "Innovative project or idea",
                    "Team of 2-4 members",
                    "Business plan required"
                ],
                deadline: "2025-03-15",
                duration: "Competition period",
                stipend: "Up to KES 500,000 prize",
                posted_date: "2025-01-10",
                status: "active"
            },
            {
                id: 5,
                title: "Mobile App Development Bootcamp",
                company: "Andela",
                type: "training",
                location: "Online/Nairobi",
                description: "Intensive bootcamp covering mobile app development for Android and iOS. Includes mentorship and potential job placement opportunities.",
                requirements: [
                    "Basic programming knowledge",
                    "Commitment to full-time learning",
                    "Strong motivation to learn",
                    "Access to computer and internet"
                ],
                deadline: "2025-02-10",
                duration: "3 months",
                stipend: "Free training + job placement",
                posted_date: "2025-01-12",
                status: "active"
            },
            {
                id: 6,
                title: "Cybersecurity Analyst Internship",
                company: "Serianu Limited",
                type: "internship",
                location: "Nairobi, Kenya",
                description: "Learn cybersecurity fundamentals while working on real security assessments and incident response. Gain hands-on experience in information security.",
                requirements: [
                    "Computer Science, IT, or Cybersecurity",
                    "Basic networking knowledge",
                    "Interest in cybersecurity",
                    "Analytical thinking skills"
                ],
                deadline: "2025-02-20",
                duration: "4 months",
                stipend: "KES 28,000/month",
                posted_date: "2025-01-15",
                status: "active"
            },
            {
                id: 7,
                title: "Startup Accelerator Program",
                company: "iHub Nairobi",
                type: "accelerator",
                location: "Nairobi, Kenya",
                description: "6-month accelerator program for early-stage startups. Includes mentorship, funding opportunities, and access to investor networks.",
                requirements: [
                    "Early-stage startup",
                    "Scalable business model",
                    "Committed founding team",
                    "MVP or prototype ready"
                ],
                deadline: "2025-03-01",
                duration: "6 months",
                stipend: "Equity investment + mentorship",
                posted_date: "2025-01-18",
                status: "active"
            },
            {
                id: 8,
                title: "Digital Marketing Internship",
                company: "Wunderman Thompson",
                type: "internship",
                location: "Nairobi, Kenya",
                description: "Join our digital marketing team to work on campaigns for major brands. Learn social media marketing, content creation, and digital analytics.",
                requirements: [
                    "Marketing, Communications, or related field",
                    "Social media savvy",
                    "Creative thinking",
                    "Basic knowledge of digital marketing tools"
                ],
                deadline: "2025-02-25",
                duration: "3 months",
                stipend: "KES 22,000/month",
                posted_date: "2025-01-20",
                status: "active"
            }
        ];
    }

    static getOpportunityTypes() {
        return [
            { value: 'all', label: 'All Opportunities' },
            { value: 'internship', label: 'Internships' },
            { value: 'research', label: 'Research' },
            { value: 'competition', label: 'Competitions' },
            { value: 'training', label: 'Training Programs' },
            { value: 'accelerator', label: 'Accelerators' }
        ];
    }

    static getStats() {
        return {
            totalOpportunities: 8,
            activeOpportunities: 8,
            totalApplications: 156,
            successfulPlacements: 23
        };
    }
}

// Make class available globally for opportunities page
window.OpportunitiesMockData = OpportunitiesMockData;

console.log('📊 Opportunities page mock data loaded successfully');