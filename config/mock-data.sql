-- ============================================================
-- JKUAT IEC Mock Data
-- Run this in Supabase SQL Editor (Dashboard → SQL Editor)
-- ============================================================

-- ── EVENTS ───────────────────────────────────────────────────────────────────

INSERT INTO events (title, description, event_type, status, start_date, end_date, location, fee, tags) VALUES

(
    'JKUAT Innovation Hackathon 2026',
    'A 48-hour hackathon where students build real-world solutions to pressing challenges in agriculture, health, and fintech. Teams of 3–5 compete for prizes worth KES 150,000. Open to all JKUAT students.',
    'hackathon',
    'upcoming',
    '2026-05-15 08:00:00+03',
    '2026-05-17 18:00:00+03',
    'JKUAT Main Campus, Innovation Hub',
    0,
    ARRAY['hackathon', 'innovation', 'tech', 'prizes']
),

(
    'Entrepreneurship Bootcamp — Lean Startup',
    'A two-day intensive workshop on the Lean Startup methodology. Learn how to validate your business idea, build an MVP, and pitch to investors. Facilitated by industry mentors and JKUAT alumni.',
    'workshop',
    'upcoming',
    '2026-04-25 09:00:00+03',
    '2026-04-26 17:00:00+03',
    'JKUAT Business School, Room 204',
    500,
    ARRAY['startup', 'entrepreneurship', 'workshop', 'lean']
),

(
    'Tech Networking Night — April Edition',
    'Monthly networking event connecting JKUAT students with tech professionals, startup founders, and recruiters. Light refreshments provided. Bring your CV and business cards.',
    'networking',
    'upcoming',
    '2026-04-30 18:00:00+03',
    '2026-04-30 21:00:00+03',
    'JKUAT Innovation Hub, Ground Floor',
    0,
    ARRAY['networking', 'careers', 'tech', 'monthly']
),

(
    'AI & Machine Learning Seminar',
    'A seminar exploring the latest developments in artificial intelligence and machine learning, with a focus on practical applications in the Kenyan context. Guest speakers from Safaricom and Andela.',
    'seminar',
    'upcoming',
    '2026-05-08 14:00:00+03',
    '2026-05-08 17:00:00+03',
    'JKUAT Main Auditorium',
    0,
    ARRAY['AI', 'machine learning', 'seminar', 'tech']
),

(
    'IEC Annual Hackathon 2025',
    'Our flagship annual hackathon brought together over 200 students across 45 teams. This year''s theme was FinTech for the Unbanked. The winning team built a mobile savings platform for informal traders.',
    'hackathon',
    'completed',
    '2025-11-10 08:00:00+03',
    '2025-11-12 18:00:00+03',
    'JKUAT Main Campus',
    0,
    ARRAY['hackathon', 'fintech', 'annual', '2025']
);

-- ── ARTICLES (BLOG) ───────────────────────────────────────────────────────────

INSERT INTO articles (title, excerpt, content, category, status, tags, author_name, published_at) VALUES

(
    'How Our Students Are Building the Future of AgriTech in Kenya',
    'Three JKUAT IEC members have developed a soil monitoring system that helps smallholder farmers optimise irrigation and reduce water waste by up to 40%.',
    'Three members of the JKUAT Innovation & Entrepreneurship Club have developed a low-cost soil monitoring system that is already being piloted by 12 smallholder farmers in Kiambu County.

The system, called SoilSense, uses affordable sensors connected to a mobile app to measure soil moisture, pH, and temperature in real time. Farmers receive SMS alerts when irrigation is needed, reducing water usage by an average of 40% in early trials.

"We started this as a final year project, but after seeing the impact it had on the pilot farms, we knew we had to take it further," said team lead James Mwangi, a final year student in Agricultural Engineering.

The team is currently seeking seed funding to scale the solution to 100 farms by the end of 2026. They were recently shortlisted for the Africa Innovation Prize.',
    'article',
    'published',
    ARRAY['agritech', 'innovation', 'sustainability', 'startup'],
    'JKUAT IEC Editorial',
    NOW() - INTERVAL '5 days'
),

(
    'IEC Wins Best University Club at the Kenya Innovation Awards 2025',
    'The JKUAT Innovation & Entrepreneurship Club was recognised as the Best University Innovation Club at the Kenya Innovation Awards held in Nairobi last month.',
    'The JKUAT Innovation & Entrepreneurship Club was honoured with the Best University Innovation Club award at the Kenya Innovation Awards 2025, held at the Kenyatta International Convention Centre in Nairobi.

The award recognises clubs and organisations that have made outstanding contributions to fostering innovation and entrepreneurship among young Kenyans.

IEC was recognised for its hackathon programme, which has produced over 12 startups in the past three years, and its mentorship initiative that connects students with industry professionals.

"This award belongs to every member who has stayed late to build something, every mentor who gave their time, and every student who dared to try," said IEC Chairperson Diana Ochieng at the ceremony.',
    'news',
    'published',
    ARRAY['award', 'recognition', 'IEC', 'Kenya'],
    'JKUAT IEC',
    NOW() - INTERVAL '12 days'
),

(
    'Semester 1 2026 Membership Registration Now Open',
    'Registration for Semester 1 2026 membership is now open. Pay your KES 200 membership fee to access all IEC events, workshops, and resources for the semester.',
    'We are pleased to announce that membership registration for Semester 1 2026 is now officially open.

To register:
1. Visit our website at iecjkuat.com
2. Click "Become a Member" on the home page
3. Fill in your details and pay the KES 200 semester fee via M-Pesa

Benefits of membership include:
- Priority access to all IEC events and hackathons
- Access to our mentorship network
- Collaboration opportunities on club projects
- Certificate of membership

Registration closes on 30th April 2026. Do not miss out.',
    'announcement',
    'published',
    ARRAY['membership', 'registration', 'semester', '2026'],
    'JKUAT IEC',
    NOW() - INTERVAL '2 days'
),

(
    'Meet the Team Behind Kenya''s First Student-Built Fintech App',
    'A team of four IEC members built a peer-to-peer lending platform that has processed over KES 2 million in loans among JKUAT students since its launch in January.',
    'What started as a hackathon project in November 2024 has grown into a fully functional peer-to-peer lending platform used by over 300 JKUAT students.

PesaLink, built by a team of four IEC members, allows students to lend and borrow small amounts from each other at transparent interest rates, with repayment tracked automatically.

"Banks don''t serve students well. We wanted to build something that actually works for us," said co-founder Amina Hassan, a third-year Computer Science student.

The platform has processed over KES 2 million in loans with a repayment rate of 94%, significantly higher than traditional microfinance institutions.',
    'article',
    'published',
    ARRAY['fintech', 'startup', 'students', 'lending'],
    'JKUAT IEC Editorial',
    NOW() - INTERVAL '20 days'
);

-- ── PROJECTS ─────────────────────────────────────────────────────────────────

INSERT INTO projects (title, description, category, status, tech_stack, github_url, demo_url, team_size) VALUES

(
    'SoilSense — Smart Irrigation System',
    'A low-cost IoT soil monitoring system that helps smallholder farmers optimise irrigation. Uses affordable sensors connected to a mobile app to measure soil moisture, pH, and temperature in real time. Currently in pilot with 12 farms in Kiambu County.',
    'innovation',
    'active',
    ARRAY['Arduino', 'React Native', 'Node.js', 'Supabase', 'IoT'],
    'https://github.com/iecjkuat/soilsense',
    NULL,
    4
),

(
    'PesaLink — Student P2P Lending',
    'A peer-to-peer lending platform for JKUAT students. Allows students to lend and borrow small amounts with transparent interest rates and automated repayment tracking. Over KES 2M processed since launch.',
    'startup',
    'active',
    ARRAY['React', 'Node.js', 'PostgreSQL', 'M-Pesa API', 'Supabase'],
    NULL,
    'https://pesalink.co.ke',
    4
),

(
    'CampusMap — JKUAT Indoor Navigation',
    'An indoor navigation app for JKUAT Main Campus that helps new students and visitors find lecture halls, offices, and facilities. Uses QR codes and Bluetooth beacons for positioning.',
    'innovation',
    'planning',
    ARRAY['Flutter', 'Firebase', 'Bluetooth LE', 'QR Code'],
    'https://github.com/iecjkuat/campusmap',
    NULL,
    3
),

(
    'MediTrack — Community Health Records',
    'A lightweight electronic health records system designed for community health workers in rural Kenya. Works offline and syncs when connectivity is available.',
    'research',
    'active',
    ARRAY['React', 'IndexedDB', 'Node.js', 'PostgreSQL', 'PWA'],
    'https://github.com/iecjkuat/meditrack',
    NULL,
    5
),

(
    'HackBot — AI Hackathon Assistant',
    'An AI-powered chatbot that helps hackathon participants brainstorm ideas, find teammates, and access resources. Built during the IEC Annual Hackathon 2025 and won first place.',
    'hackathon',
    'completed',
    ARRAY['Python', 'FastAPI', 'OpenAI API', 'React', 'Supabase'],
    'https://github.com/iecjkuat/hackbot',
    'https://hackbot.iecjkuat.com',
    3
),

(
    'GreenCampus — Energy Monitoring Dashboard',
    'A real-time energy consumption monitoring dashboard for JKUAT campus buildings. Identifies energy waste patterns and suggests optimisations. Research project in collaboration with the Engineering department.',
    'research',
    'active',
    ARRAY['Python', 'Grafana', 'InfluxDB', 'Raspberry Pi', 'MQTT'],
    'https://github.com/iecjkuat/greencampus',
    NULL,
    6
);
