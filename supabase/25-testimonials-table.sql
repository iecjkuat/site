-- JKUAT Innovation Club - Testimonials System
-- Create testimonials table for dynamic success stories

-- Create testimonials table
CREATE TABLE IF NOT EXISTS testimonials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    name VARCHAR(255) NOT NULL,
    course VARCHAR(255),
    year VARCHAR(50),
    title VARCHAR(255), -- Job title or position
    content TEXT NOT NULL,
    rating INTEGER DEFAULT 5 CHECK (rating >= 1 AND rating <= 5),
    photo_url TEXT,
    is_featured BOOLEAN DEFAULT false,
    is_approved BOOLEAN DEFAULT true, -- Auto-approve for launch
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_testimonials_approved ON testimonials(is_approved);
CREATE INDEX IF NOT EXISTS idx_testimonials_featured ON testimonials(is_featured);
CREATE INDEX IF NOT EXISTS idx_testimonials_display_order ON testimonials(display_order);

-- Insert sample testimonials for launch
INSERT INTO testimonials (name, course, year, content, rating, is_featured, is_approved, display_order) VALUES
('Mary Kamau', 'Computer Science', '4th Year', 'The Innovation Club helped me turn my mobile app idea into reality. Through their mentorship program, I connected with industry experts who guided me through the development process.', 5, true, true, 1),
('John Ochieng', 'Mechanical Engineering', '3rd Year', 'I joined as a shy first-year student. Now I''m leading a team of 8 developers on an IoT project that''s getting attention from tech companies. The growth has been incredible!', 5, true, true, 2),
('Alice Mwangi', 'Business IT', '2nd Year', 'The networking opportunities are amazing! I''ve connected with alumni who are now my business partners. We''re launching our fintech startup next month.', 5, true, true, 3),
('David Kiprotich', 'Software Engineering', '3rd Year', 'The hackathons organized by the club pushed me to learn new technologies. I won first place in the AI challenge and got an internship offer from a top tech company.', 5, false, true, 4),
('Grace Wanjiku', 'Information Technology', '4th Year', 'Being part of the leadership team taught me project management and communication skills. I''m now leading a team of 15 students in developing solutions for local businesses.', 5, false, true, 5),
('Samuel Mutua', 'Computer Engineering', '2nd Year', 'The mentorship program connected me with industry professionals who helped me understand the real-world applications of what we learn in class. It''s been transformative.', 5, false, true, 6)
ON CONFLICT (id) DO NOTHING;

-- Create RLS policies for testimonials
ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can read approved testimonials
CREATE POLICY "Anyone can read approved testimonials" ON testimonials
    FOR SELECT USING (is_approved = true);

-- Policy: Authenticated users can insert testimonials
CREATE POLICY "Authenticated users can insert testimonials" ON testimonials
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Policy: Users can update their own testimonials
CREATE POLICY "Users can update own testimonials" ON testimonials
    FOR UPDATE USING (auth.uid() = user_id);

-- Policy: Admins can manage all testimonials
CREATE POLICY "Admins can manage testimonials" ON testimonials
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.role IN ('admin', 'super_admin')
        )
    );

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_testimonials_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
DROP TRIGGER IF EXISTS trigger_update_testimonials_updated_at ON testimonials;
CREATE TRIGGER trigger_update_testimonials_updated_at
    BEFORE UPDATE ON testimonials
    FOR EACH ROW
    EXECUTE FUNCTION update_testimonials_updated_at();

-- Grant permissions
GRANT SELECT ON testimonials TO anon;
GRANT ALL ON testimonials TO authenticated;
GRANT ALL ON testimonials TO service_role;