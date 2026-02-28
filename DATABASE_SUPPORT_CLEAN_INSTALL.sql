-- Clean Installation of Support Tables
-- This drops everything and recreates from scratch

-- Drop existing tables (CASCADE removes dependent objects)
DROP TABLE IF EXISTS support_ticket_replies CASCADE;
DROP TABLE IF EXISTS support_tickets CASCADE;

-- Drop existing function
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;

-- Now create everything fresh
-- Create support_tickets table
CREATE TABLE support_tickets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id),
    subject TEXT NOT NULL,
    description TEXT NOT NULL,
    category TEXT DEFAULT 'GENERAL',
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'resolved', 'closed')),
    priority TEXT DEFAULT 'MEDIUM' CHECK (priority IN ('LOW', 'MEDIUM', 'HIGH', 'URGENT')),
    assigned_to UUID REFERENCES users(id),
    read_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Create support_ticket_replies table
CREATE TABLE support_ticket_replies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ticket_id UUID REFERENCES support_tickets(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id),
    content TEXT NOT NULL,
    is_admin BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_support_tickets_user_id ON support_tickets(user_id);
CREATE INDEX idx_support_tickets_status ON support_tickets(status);
CREATE INDEX idx_support_tickets_created_at ON support_tickets(created_at DESC);
CREATE INDEX idx_support_ticket_replies_ticket_id ON support_ticket_replies(ticket_id);
CREATE INDEX idx_support_ticket_replies_created_at ON support_ticket_replies(created_at);

-- Add updated_at trigger
CREATE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_support_tickets_updated_at BEFORE UPDATE ON support_tickets
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS)
ALTER TABLE support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_ticket_replies ENABLE ROW LEVEL SECURITY;

-- RLS Policies for support_tickets

-- Users can view their own tickets
CREATE POLICY "Users can view own tickets"
    ON support_tickets FOR SELECT
    USING (auth.uid() = user_id);

-- Users can create tickets
CREATE POLICY "Users can create tickets"
    ON support_tickets FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Admins can view all tickets
CREATE POLICY "Admins can view all tickets"
    ON support_tickets FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE users.id = auth.uid()
            AND users.role IN ('admin', 'executive', 'super_admin')
        )
    );

-- Admins can update tickets
CREATE POLICY "Admins can update tickets"
    ON support_tickets FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE users.id = auth.uid()
            AND users.role IN ('admin', 'executive', 'super_admin')
        )
    );

-- RLS Policies for support_ticket_replies

-- Users can view replies to their tickets
CREATE POLICY "Users can view replies to own tickets"
    ON support_ticket_replies FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM support_tickets
            WHERE support_tickets.id = support_ticket_replies.ticket_id
            AND support_tickets.user_id = auth.uid()
        )
    );

-- Admins can view all replies
CREATE POLICY "Admins can view all replies"
    ON support_ticket_replies FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE users.id = auth.uid()
            AND users.role IN ('admin', 'executive', 'super_admin')
        )
    );

-- Admins can create replies
CREATE POLICY "Admins can create replies"
    ON support_ticket_replies FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM users
            WHERE users.id = auth.uid()
            AND users.role IN ('admin', 'executive', 'super_admin')
        )
    );

-- Grant permissions
GRANT ALL ON support_tickets TO authenticated;
GRANT ALL ON support_ticket_replies TO authenticated;

-- Notify PostgREST to reload schema
NOTIFY pgrst, 'reload schema';

-- Verify tables were created
SELECT 'support_tickets' as table_name, COUNT(*) as row_count FROM support_tickets
UNION ALL
SELECT 'support_ticket_replies' as table_name, COUNT(*) as row_count FROM support_ticket_replies;

-- Show table structure
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_name IN ('support_tickets', 'support_ticket_replies')
ORDER BY table_name, ordinal_position;
