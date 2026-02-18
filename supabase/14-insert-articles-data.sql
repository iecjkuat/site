-- ============================================================================
-- Insert Sample Articles Data
-- ============================================================================

-- Get first user ID for author
DO $$
DECLARE
  first_user_id UUID;
BEGIN
  -- Get the first user ID
  SELECT id INTO first_user_id FROM users LIMIT 1;
  
  IF first_user_id IS NULL THEN
    RAISE EXCEPTION 'No users found. Please create users first.';
  END IF;

  -- Insert sample articles
  INSERT INTO articles (title, content, excerpt, category, tags, featured_image, author_id, status, views, likes, published_at) VALUES
  
  -- News items
  (
    'JKUAT Innovation Club Wins National Tech Competition',
    'We are thrilled to announce that our innovation team has won the prestigious National University Tech Innovation Challenge with their groundbreaking IoT solution for smart agriculture. The team, led by final-year engineering students, developed a low-cost sensor network that helps farmers monitor soil conditions, weather patterns, and crop health in real-time. The solution impressed judges with its practical application and potential for scaling across Kenya''s agricultural sector. The winning team will receive funding to further develop their prototype and mentorship from industry leaders.',
    'Our team secured first place in the National University Tech Innovation Challenge with their groundbreaking IoT solution for smart agriculture.',
    'news',
    ARRAY['competition', 'achievement', 'iot', 'agriculture', 'technology'],
    'https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=800',
    first_user_id,
    'published',
    892,
    67,
    NOW() - INTERVAL '1 day'
  ),
  
  (
    'New Partnership with Leading Tech Companies',
    'JKUAT Innovation Club is excited to announce strategic partnerships with several leading technology companies including Safaricom, Microsoft, and local tech startups. These partnerships will provide our members with exclusive access to internship opportunities, mentorship programs, and hands-on training workshops. Starting next month, we will host quarterly meetups where industry professionals will share insights on emerging technologies, career development, and entrepreneurship. This initiative aims to bridge the gap between academic learning and industry requirements, ensuring our members are well-prepared for the job market.',
    'Strategic partnerships announced with leading technology companies for internship and mentorship programs.',
    'news',
    ARRAY['partnership', 'internship', 'mentorship', 'industry', 'career'],
    'https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=800',
    first_user_id,
    'published',
    678,
    45,
    NOW() - INTERVAL '3 days'
  ),
  
  (
    'Innovation Lab Receives New Equipment Upgrade',
    'The Innovation Lab has been upgraded with state-of-the-art equipment to support student projects and research. New additions include three high-precision 3D printers, advanced Arduino and Raspberry Pi kits, VR headsets for immersive development, and a complete electronics workbench with oscilloscopes and soldering stations. The lab is now open to all club members from 8 AM to 8 PM on weekdays. Members can book equipment slots through our new online reservation system. Special training sessions will be conducted next week to familiarize members with the new equipment.',
    'Innovation Lab upgraded with 3D printers, Arduino kits, VR headsets, and advanced electronics equipment.',
    'news',
    ARRAY['lab', 'equipment', 'projects', '3d-printing', 'electronics'],
    'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=800',
    first_user_id,
    'published',
    543,
    41,
    NOW() - INTERVAL '5 days'
  ),
  
  (
    'Club Members Showcase Projects at Tech Expo',
    'Last weekend, fifteen members of JKUAT Innovation Club showcased their innovative projects at the Nairobi Tech Expo, attracting significant attention from investors and industry professionals. Projects ranged from mobile health applications to renewable energy solutions. Three projects received offers for seed funding, and several members secured job interviews with attending companies. The expo provided an excellent platform for our members to network, receive feedback, and gain visibility in the tech ecosystem. We are proud of our members'' achievements and look forward to supporting more such opportunities.',
    'Fifteen club members showcased innovative projects at Nairobi Tech Expo, attracting investor interest.',
    'news',
    ARRAY['expo', 'projects', 'showcase', 'networking', 'funding'],
    'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800',
    first_user_id,
    'published',
    456,
    38,
    NOW() - INTERVAL '7 days'
  ),
  
  (
    'Hackathon Winners Announced',
    'Congratulations to Team CodeCrafters for winning our annual 48-hour hackathon! Their project, a blockchain-based student credential verification system, impressed judges with its innovative approach to solving a real-world problem. The team will receive prize money, cloud credits, and mentorship to further develop their solution. Second place went to Team DataMinds for their AI-powered study assistant, and third place to Team GreenTech for their waste management optimization platform. Over 80 students participated in the hackathon, forming 20 teams and creating impressive solutions across various domains.',
    'Team CodeCrafters wins annual hackathon with blockchain-based credential verification system.',
    'news',
    ARRAY['hackathon', 'blockchain', 'competition', 'winners', 'innovation'],
    'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800',
    first_user_id,
    'published',
    721,
    59,
    NOW() - INTERVAL '10 days'
  ),
  
  -- Articles
  (
    'The Future of AI in Education: A Student Perspective',
    'Artificial Intelligence is revolutionizing every aspect of our lives, and education is no exception. As students at the forefront of technological change, we have a unique perspective on how AI is transforming learning experiences. From personalized learning paths to automated grading systems, AI tools are making education more accessible and efficient. However, we must also consider the challenges: ensuring AI systems are unbiased, maintaining the human element in education, and preparing students for an AI-driven job market. This article explores the opportunities and challenges of AI in education, drawing from our experiences as engineering students and insights from industry experts. We discuss practical applications like intelligent tutoring systems, adaptive learning platforms, and AI-powered research tools that are already making a difference in our academic journey.',
    'Exploring how artificial intelligence is transforming the educational landscape and what it means for students.',
    'article',
    ARRAY['ai', 'education', 'technology', 'future', 'learning'],
    'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800',
    first_user_id,
    'published',
    1234,
    89,
    NOW() - INTERVAL '2 days'
  ),
  
  (
    'Building Sustainable Tech Solutions: A Practical Guide',
    'In today''s world, sustainability is not just a buzzword - it''s a necessity. As future engineers and innovators, we have a responsibility to develop technology solutions that are environmentally sustainable and socially responsible. This comprehensive guide covers the principles of sustainable technology development, from choosing energy-efficient components to designing for longevity and recyclability. We explore case studies of successful sustainable tech projects, discuss the circular economy model in technology, and provide practical tips for incorporating sustainability into your projects. Topics include: reducing e-waste through modular design, optimizing power consumption in IoT devices, using renewable energy sources, and considering the full lifecycle impact of technology products. Whether you''re building a mobile app or a hardware prototype, this guide will help you make environmentally conscious decisions.',
    'Learn how to develop technology solutions that are innovative and environmentally sustainable.',
    'article',
    ARRAY['sustainability', 'technology', 'environment', 'guide', 'green-tech'],
    'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800',
    first_user_id,
    'published',
    987,
    72,
    NOW() - INTERVAL '4 days'
  ),
  
  (
    'Getting Started with Machine Learning: A Beginner''s Journey',
    'Machine Learning can seem intimidating at first, but with the right approach, anyone can start building ML models. This article chronicles my journey from complete beginner to building my first working ML model, sharing lessons learned and resources that helped along the way. We start with the fundamentals: understanding what machine learning is, the difference between supervised and unsupervised learning, and common algorithms like linear regression and decision trees. Then we dive into practical aspects: setting up your development environment with Python and popular libraries like scikit-learn and TensorFlow, finding and preparing datasets, training your first model, and evaluating its performance. I share common pitfalls to avoid, debugging strategies, and tips for improving model accuracy. The article includes code examples, recommended online courses, and a curated list of beginner-friendly projects to practice your skills.',
    'A beginner''s guide to machine learning, from basic concepts to building your first model.',
    'article',
    ARRAY['machine-learning', 'ai', 'tutorial', 'beginner', 'python'],
    'https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=800',
    first_user_id,
    'published',
    1456,
    103,
    NOW() - INTERVAL '6 days'
  ),
  
  (
    'The Rise of Web3: Understanding Blockchain and Decentralization',
    'Web3 represents a paradigm shift in how we think about the internet, moving from centralized platforms to decentralized networks powered by blockchain technology. This article provides a comprehensive introduction to Web3 concepts, explaining blockchain fundamentals, smart contracts, decentralized applications (dApps), and the potential impact on various industries. We explore real-world use cases beyond cryptocurrency: supply chain transparency, digital identity verification, decentralized finance (DeFi), and NFTs for digital ownership. The article also addresses common misconceptions about blockchain, discusses scalability challenges, and examines the environmental concerns around proof-of-work systems. For developers interested in Web3, we provide an overview of popular blockchain platforms like Ethereum, Solana, and Polygon, along with development tools and frameworks to get started.',
    'Understanding blockchain technology, decentralization, and the emerging Web3 ecosystem.',
    'article',
    ARRAY['web3', 'blockchain', 'cryptocurrency', 'decentralization', 'technology'],
    'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=800',
    first_user_id,
    'published',
    876,
    64,
    NOW() - INTERVAL '8 days'
  ),
  
  (
    'Cybersecurity Essentials for Developers',
    'As developers, we have a responsibility to build secure applications that protect user data and privacy. This article covers essential cybersecurity practices every developer should know, from secure coding principles to common vulnerabilities and how to prevent them. We discuss the OWASP Top 10 security risks, including SQL injection, cross-site scripting (XSS), and authentication failures, with practical examples of vulnerable code and secure alternatives. The article covers important topics like password hashing, secure session management, input validation, and API security. We also explore security tools and practices: using security linters, conducting code reviews, implementing automated security testing, and staying updated on security advisories. Whether you''re building web applications, mobile apps, or APIs, these cybersecurity fundamentals will help you create more secure software and protect your users.',
    'Essential cybersecurity practices and secure coding principles every developer should know.',
    'article',
    ARRAY['cybersecurity', 'security', 'development', 'best-practices', 'coding'],
    'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800',
    first_user_id,
    'published',
    1123,
    81,
    NOW() - INTERVAL '9 days'
  );

  RAISE NOTICE 'Successfully inserted 10 sample articles (5 news, 5 articles)';
  
END $$;
