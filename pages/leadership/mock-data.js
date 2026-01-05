// Leadership Page - Mock Data
// Provides fallback data when API is unavailable

const MOCK_LEADERSHIP_DATA = {
    stats: {
        executiveMembers: 7,
        clubPatrons: 2,
        totalLeadership: 9,
        positionBreakdown: {
            "Chairperson": 1,
            "Vice-Chairperson (Membership)": 1,
            "Vice-Chairperson (Projects)": 1,
            "Vice-Chairperson (Education)": 1,
            "Secretary-General": 1,
            "Treasurer": 1,
            "Communications & PR Officer": 1
        }
    },

    executives: [
        {
            id: "mock-chair-001",
            position: "Chairperson",
            positionOrder: 1,
            bio: "Visionary leader driving innovation and entrepreneurship initiatives at JKUAT. Passionate about fostering a culture of creativity and business development among students.",
            profilePhoto: null,
            officeHours: {
                "monday": "2:00 PM - 4:00 PM",
                "wednesday": "10:00 AM - 12:00 PM",
                "friday": "3:00 PM - 5:00 PM"
            },
            contactInfo: {
                email: "chairperson@jkuatinnovation.ac.ke",
                phone: "+254700000001",
                office: "Innovation Hub, Room 101"
            },
            socialMedia: {
                twitter: "@JKUATChair",
                linkedin: "https://linkedin.com/in/chairperson"
            },
            achievements: [
                "Led 15+ successful innovation projects",
                "Established partnerships with 10+ industry leaders",
                "Increased club membership by 200%"
            ],
            responsibilities: [
                "Strategic planning and vision setting",
                "External partnerships and stakeholder relations",
                "Overall club governance and leadership"
            ],
            user: {
                id: "mock-user-001",
                name: "Alex Mwangi",
                email: "chairperson@jkuatinnovation.ac.ke",
                phone: "+254700000001",
                course: "Computer Science",
                college: "Engineering",
                year_of_study: 4
            }
        },
        {
            id: "mock-vice-mem-001",
            position: "Vice-Chairperson (Membership)",
            positionOrder: 2,
            bio: "Dedicated to building and nurturing our vibrant community of innovators. Focuses on member engagement, retention, and creating meaningful networking opportunities.",
            profilePhoto: null,
            officeHours: {
                "tuesday": "1:00 PM - 3:00 PM",
                "thursday": "11:00 AM - 1:00 PM",
                "saturday": "10:00 AM - 12:00 PM"
            },
            contactInfo: {
                email: "membership@jkuatinnovation.ac.ke",
                phone: "+254700000002",
                office: "Innovation Hub, Room 102"
            },
            socialMedia: {
                linkedin: "https://linkedin.com/in/membership-vp",
                instagram: "@jkuat_membership"
            },
            achievements: [
                "Organized 20+ networking events",
                "Implemented digital membership system",
                "Achieved 95% member satisfaction rate"
            ],
            responsibilities: [
                "Membership recruitment and onboarding",
                "Member engagement programs",
                "Community building initiatives"
            ],
            user: {
                id: "mock-user-002",
                name: "Sarah Wanjiku",
                email: "membership@jkuatinnovation.ac.ke",
                phone: "+254700000002",
                course: "Business Information Technology",
                college: "Engineering",
                year_of_study: 3
            }
        },
        {
            id: "mock-vice-proj-001",
            position: "Vice-Chairperson (Projects)",
            positionOrder: 3,
            bio: "Project management expert leading our technical initiatives. Coordinates innovation projects and ensures successful delivery of club objectives.",
            profilePhoto: null,
            officeHours: {
                "monday": "10:00 AM - 12:00 PM",
                "wednesday": "2:00 PM - 4:00 PM",
                "friday": "1:00 PM - 3:00 PM"
            },
            contactInfo: {
                email: "projects@jkuatinnovation.ac.ke",
                phone: "+254700000003",
                office: "Innovation Hub, Room 103"
            },
            socialMedia: {
                github: "https://github.com/jkuat-projects",
                linkedin: "https://linkedin.com/in/projects-vp"
            },
            achievements: [
                "Managed 25+ innovation projects",
                "Secured KSh 2M in project funding",
                "Mentored 100+ student entrepreneurs"
            ],
            responsibilities: [
                "Project planning and execution",
                "Technical mentorship",
                "Innovation challenge coordination"
            ],
            user: {
                id: "mock-user-003",
                name: "David Kiprotich",
                email: "projects@jkuatinnovation.ac.ke",
                phone: "+254700000003",
                course: "Software Engineering",
                college: "Engineering",
                year_of_study: 2
            }
        },
        {
            id: "mock-vice-edu-001",
            position: "Vice-Chairperson (Education)",
            positionOrder: 4,
            bio: "Educational program coordinator focused on skill development and knowledge sharing. Organizes workshops, seminars, and training sessions for members.",
            profilePhoto: null,
            officeHours: {
                "tuesday": "9:00 AM - 11:00 AM",
                "thursday": "2:00 PM - 4:00 PM"
            },
            contactInfo: {
                email: "education@jkuatinnovation.ac.ke",
                phone: "+254700000004",
                office: "Innovation Hub, Room 104"
            },
            socialMedia: {
                linkedin: "https://linkedin.com/in/education-vp"
            },
            achievements: [
                "Organized 30+ educational workshops",
                "Established learning partnerships",
                "Developed curriculum for innovation courses"
            ],
            responsibilities: [
                "Educational program development",
                "Workshop and seminar coordination",
                "Skills development initiatives"
            ],
            user: {
                id: "mock-user-004",
                name: "Grace Nyambura",
                email: "education@jkuatinnovation.ac.ke",
                phone: "+254700000004",
                course: "Information Technology",
                college: "Engineering",
                year_of_study: 3
            }
        },
        {
            id: "mock-sec-001",
            position: "Secretary-General",
            positionOrder: 5,
            bio: "Administrative backbone of the club, ensuring smooth operations and effective communication. Maintains records and coordinates meetings.",
            profilePhoto: null,
            officeHours: {
                "monday": "1:00 PM - 3:00 PM",
                "wednesday": "9:00 AM - 11:00 AM",
                "friday": "2:00 PM - 4:00 PM"
            },
            contactInfo: {
                email: "secretary@jkuatinnovation.ac.ke",
                phone: "+254700000005",
                office: "Innovation Hub, Room 105"
            },
            socialMedia: {
                linkedin: "https://linkedin.com/in/secretary-general"
            },
            achievements: [
                "Streamlined club operations",
                "Implemented digital record keeping",
                "Coordinated 50+ meetings"
            ],
            responsibilities: [
                "Meeting coordination and minutes",
                "Record keeping and documentation",
                "Internal communication management"
            ],
            user: {
                id: "mock-user-005",
                name: "Michael Ochieng",
                email: "secretary@jkuatinnovation.ac.ke",
                phone: "+254700000005",
                course: "Business Administration",
                college: "Human Resource Development",
                year_of_study: 4
            }
        },
        {
            id: "mock-treas-001",
            position: "Treasurer",
            positionOrder: 6,
            bio: "Financial steward ensuring responsible management of club resources. Oversees budgeting, financial planning, and transparency in all monetary matters.",
            profilePhoto: null,
            officeHours: {
                "tuesday": "10:00 AM - 12:00 PM",
                "thursday": "1:00 PM - 3:00 PM"
            },
            contactInfo: {
                email: "treasurer@jkuatinnovation.ac.ke",
                phone: "+254700000006",
                office: "Innovation Hub, Room 106"
            },
            socialMedia: {
                linkedin: "https://linkedin.com/in/treasurer"
            },
            achievements: [
                "Managed KSh 5M+ in club funds",
                "Implemented transparent financial systems",
                "Secured multiple funding sources"
            ],
            responsibilities: [
                "Financial planning and budgeting",
                "Fund management and oversight",
                "Financial reporting and transparency"
            ],
            user: {
                id: "mock-user-006",
                name: "Faith Wanjiru",
                email: "treasurer@jkuatinnovation.ac.ke",
                phone: "+254700000006",
                course: "Actuarial Science",
                college: "Pure and Applied Sciences",
                year_of_study: 3
            }
        },
        {
            id: "mock-comm-001",
            position: "Communications & PR Officer",
            positionOrder: 7,
            bio: "Brand ambassador and communication strategist. Manages club's public image, social media presence, and external communications.",
            profilePhoto: null,
            officeHours: {
                "monday": "11:00 AM - 1:00 PM",
                "wednesday": "3:00 PM - 5:00 PM"
            },
            contactInfo: {
                email: "communications@jkuatinnovation.ac.ke",
                phone: "+254700000007",
                office: "Innovation Hub, Room 107"
            },
            socialMedia: {
                twitter: "@JKUATComms",
                linkedin: "https://linkedin.com/in/communications-pr",
                instagram: "@jkuat_innovation"
            },
            achievements: [
                "Grew social media following by 300%",
                "Secured media coverage for 20+ events",
                "Developed comprehensive brand guidelines"
            ],
            responsibilities: [
                "Public relations and media management",
                "Social media strategy and content",
                "Brand development and marketing"
            ],
            user: {
                id: "mock-user-007",
                name: "Brian Mutua",
                email: "communications@jkuatinnovation.ac.ke",
                phone: "+254700000007",
                course: "Communication and Media Technology",
                college: "Human Resource Development",
                year_of_study: 2
            }
        }
    ],

    patrons: [
        {
            id: "mock-patron-001",
            name: "Prof. Dr. Jane Wanjiku",
            title: "Professor of Innovation Management",
            department: "School of Business",
            email: "j.wanjiku@jkuat.ac.ke",
            phone: "+254722000001",
            office_location: "Business School, Office B201",
            office_hours: {
                "monday": "9:00 AM - 11:00 AM",
                "wednesday": "2:00 PM - 4:00 PM",
                "friday": "10:00 AM - 12:00 PM"
            },
            bio: "Renowned expert in innovation management and entrepreneurship with over 15 years of experience in academia and industry. Published author of 3 books on African entrepreneurship and innovation ecosystems.",
            social_media: {
                linkedin: "https://linkedin.com/in/prof-wanjiku",
                researchgate: "https://researchgate.net/profile/Jane-Wanjiku"
            },
            specialization: [
                "Innovation Management",
                "Entrepreneurship",
                "Business Strategy",
                "African Business Ecosystems",
                "Startup Incubation",
                "Policy Development"
            ]
        },
        {
            id: "mock-patron-002",
            name: "Dr. Michael Kiprotich",
            title: "Senior Lecturer & Innovation Consultant",
            department: "School of Engineering",
            email: "m.kiprotich@jkuat.ac.ke",
            phone: "+254733000002",
            office_location: "Engineering Block, Office E305",
            office_hours: {
                "tuesday": "1:00 PM - 3:00 PM",
                "thursday": "10:00 AM - 12:00 PM",
                "friday": "3:00 PM - 5:00 PM"
            },
            bio: "Technology innovation specialist with expertise in engineering solutions for African challenges. Former industry executive with 20+ years in technology development and commercialization.",
            social_media: {
                twitter: "@DrKiprotich",
                linkedin: "https://linkedin.com/in/dr-kiprotich"
            },
            specialization: [
                "Technology Innovation",
                "Engineering Solutions",
                "Product Development",
                "Tech Commercialization",
                "Renewable Energy",
                "Patent Strategy"
            ]
        }
    ]
};

window.MOCK_LEADERSHIP_DATA = MOCK_LEADERSHIP_DATA;