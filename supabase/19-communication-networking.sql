-- =============================================
-- JKUAT Innovation Club - Communication & Networking System
-- =============================================

-- Chat Groups Table (for cohorts, project teams, departments)
CREATE TABLE IF NOT EXISTS chat_groups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    group_type VARCHAR(50) NOT NULL, -- 'cohort', 'project', 'department', 'executive', 'general'
    avatar_url VARCHAR(500),
    is_private BOOLEAN DEFAULT FALSE,
    max_members INTEGER DEFAULT 100,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Chat Group Members Table
CREATE TABLE IF NOT EXISTS chat_group_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    group_id UUID REFERENCES chat_groups(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(50) DEFAULT 'member', -- 'admin', 'moderator', 'member'
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_read_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    is_muted BOOLEAN DEFAULT FALSE,
    UNIQUE(group_id, user_id)
);

-- Message Recipients Table (for tracking read status, delivery, etc.)
CREATE TABLE IF NOT EXISTS message_recipients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    message_id UUID REFERENCES messages(id) ON DELETE CASCADE,
    recipient_id UUID REFERENCES users(id) ON DELETE CASCADE,
    delivery_status VARCHAR(50) DEFAULT 'sent', -- 'sent', 'delivered', 'read', 'failed'
    read_at TIMESTAMP WITH TIME ZONE,
    delivered_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    is_starred BOOLEAN DEFAULT FALSE,
    is_archived BOOLEAN DEFAULT FALSE,
    UNIQUE(message_id, recipient_id)
);

-- Message Reactions Table
CREATE TABLE IF NOT EXISTS message_reactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    message_id UUID REFERENCES messages(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    emoji VARCHAR(10) NOT NULL, -- Unicode emoji
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(message_id, user_id, emoji)
);

-- Announcements Table (for broadcast system)
CREATE TABLE IF NOT EXISTS announcements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    announcement_type VARCHAR(50) NOT NULL, -- 'general', 'event', 'urgent', 'policy', 'achievement'
    priority_level VARCHAR(20) DEFAULT 'normal', -- 'low', 'normal', 'high', 'urgent'
    target_audience VARCHAR(50) DEFAULT 'all', -- 'all', 'members', 'executives', 'department', 'cohort'
    target_groups UUID[], -- Array of group IDs for targeted announcements
    target_departments VARCHAR(100)[], -- Array of department names
    target_cohorts VARCHAR(100)[], -- Array of cohort names
    is_emergency BOOLEAN DEFAULT FALSE,
    send_email BOOLEAN DEFAULT FALSE,
    send_sms BOOLEAN DEFAULT FALSE,
    send_push BOOLEAN DEFAULT TRUE,
    scheduled_send_at TIMESTAMP WITH TIME ZONE,
    expires_at TIMESTAMP WITH TIME ZONE,
    created_by UUID REFERENCES users(id),
    published_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Announcement Recipients Table (tracking who received/read announcements)
CREATE TABLE IF NOT EXISTS announcement_recipients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    announcement_id UUID REFERENCES announcements(id) ON DELETE CASCADE,
    recipient_id UUID REFERENCES users(id) ON DELETE CASCADE,
    delivery_method VARCHAR(50) NOT NULL, -- 'in_app', 'email', 'sms', 'push'
    delivery_status VARCHAR(50) DEFAULT 'sent', -- 'sent', 'delivered', 'read', 'failed'
    sent_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    delivered_at TIMESTAMP WITH TIME ZONE,
    read_at TIMESTAMP WITH TIME ZONE,
    UNIQUE(announcement_id, recipient_id, delivery_method)
);

-- Emergency Contacts Table (for EC members and emergency situations)
CREATE TABLE IF NOT EXISTS emergency_contacts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    contact_type VARCHAR(50) NOT NULL, -- 'primary', 'secondary', 'parent', 'guardian', 'next_of_kin'
    name VARCHAR(255) NOT NULL,
    relationship VARCHAR(100),
    phone_number VARCHAR(20) NOT NULL,
    email VARCHAR(255),
    address TEXT,
    is_primary BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Communication Preferences Table
CREATE TABLE IF NOT EXISTS communication_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE,
    email_notifications BOOLEAN DEFAULT TRUE,
    sms_notifications BOOLEAN DEFAULT FALSE,
    push_notifications BOOLEAN DEFAULT TRUE,
    direct_messages BOOLEAN DEFAULT TRUE,
    group_messages BOOLEAN DEFAULT TRUE,
    announcements BOOLEAN DEFAULT TRUE,
    emergency_alerts BOOLEAN DEFAULT TRUE,
    event_reminders BOOLEAN DEFAULT TRUE,
    marketing_emails BOOLEAN DEFAULT FALSE,
    digest_frequency VARCHAR(20) DEFAULT 'daily', -- 'none', 'daily', 'weekly', 'monthly'
    quiet_hours_start TIME DEFAULT '22:00',
    quiet_hours_end TIME DEFAULT '07:00',
    timezone VARCHAR(50) DEFAULT 'Africa/Nairobi',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Email Templates Table (for official communications)
CREATE TABLE IF NOT EXISTS email_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL UNIQUE,
    subject VARCHAR(255) NOT NULL,
    html_content TEXT NOT NULL,
    text_content TEXT,
    template_type VARCHAR(50) NOT NULL, -- 'welcome', 'announcement', 'reminder', 'emergency', 'newsletter'
    variables JSONB DEFAULT '{}', -- Template variables like {{name}}, {{event_name}}
    is_active BOOLEAN DEFAULT TRUE,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Email Queue Table (for managing email sending)
CREATE TABLE IF NOT EXISTS email_queue (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    recipient_email VARCHAR(255) NOT NULL,
    recipient_name VARCHAR(255),
    subject VARCHAR(255) NOT NULL,
    html_content TEXT NOT NULL,
    text_content TEXT,
    template_id UUID REFERENCES email_templates(id),
    priority_level VARCHAR(20) DEFAULT 'normal', -- 'low', 'normal', 'high', 'urgent'
    scheduled_send_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    sent_at TIMESTAMP WITH TIME ZONE,
    delivery_status VARCHAR(50) DEFAULT 'queued', -- 'queued', 'sending', 'sent', 'delivered', 'failed', 'bounced'
    error_message TEXT,
    retry_count INTEGER DEFAULT 0,
    max_retries INTEGER DEFAULT 3,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Communication Logs Table (for audit trail)
CREATE TABLE IF NOT EXISTS communication_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    communication_type VARCHAR(50) NOT NULL, -- 'message', 'announcement', 'email', 'sms', 'push'
    sender_id UUID REFERENCES users(id),
    recipient_id UUID REFERENCES users(id),
    group_id UUID REFERENCES chat_groups(id),
    announcement_id UUID REFERENCES announcements(id),
    subject VARCHAR(255),
    content_preview TEXT, -- First 200 characters
    delivery_method VARCHAR(50), -- 'in_app', 'email', 'sms', 'push'
    delivery_status VARCHAR(50),
    sent_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    delivered_at TIMESTAMP WITH TIME ZONE,
    read_at TIMESTAMP WITH TIME ZONE,
    ip_address INET,
    user_agent TEXT
);

-- Migrate existing messages table to support new communication features
DO $$
BEGIN
    -- Add columns one by one with proper error handling
    BEGIN
        ALTER TABLE messages ADD COLUMN IF NOT EXISTS message_type VARCHAR(50) DEFAULT 'direct';
        RAISE NOTICE 'Added message_type column';
    EXCEPTION WHEN duplicate_column THEN
        RAISE NOTICE 'message_type column already exists';
    END;
    
    BEGIN
        ALTER TABLE messages ADD COLUMN IF NOT EXISTS group_id UUID;
        RAISE NOTICE 'Added group_id column';
    EXCEPTION WHEN duplicate_column THEN
        RAISE NOTICE 'group_id column already exists';
    END;
    
    BEGIN
        ALTER TABLE messages ADD COLUMN IF NOT EXISTS parent_message_id UUID;
        RAISE NOTICE 'Added parent_message_id column';
    EXCEPTION WHEN duplicate_column THEN
        RAISE NOTICE 'parent_message_id column already exists';
    END;
    
    BEGIN
        ALTER TABLE messages ADD COLUMN IF NOT EXISTS attachment_url VARCHAR(500);
        RAISE NOTICE 'Added attachment_url column';
    EXCEPTION WHEN duplicate_column THEN
        RAISE NOTICE 'attachment_url column already exists';
    END;
    
    BEGIN
        ALTER TABLE messages ADD COLUMN IF NOT EXISTS attachment_type VARCHAR(50);
        RAISE NOTICE 'Added attachment_type column';
    EXCEPTION WHEN duplicate_column THEN
        RAISE NOTICE 'attachment_type column already exists';
    END;
    
    BEGIN
        ALTER TABLE messages ADD COLUMN IF NOT EXISTS attachment_size BIGINT;
        RAISE NOTICE 'Added attachment_size column';
    EXCEPTION WHEN duplicate_column THEN
        RAISE NOTICE 'attachment_size column already exists';
    END;
    
    BEGIN
        ALTER TABLE messages ADD COLUMN IF NOT EXISTS is_pinned BOOLEAN DEFAULT FALSE;
        RAISE NOTICE 'Added is_pinned column';
    EXCEPTION WHEN duplicate_column THEN
        RAISE NOTICE 'is_pinned column already exists';
    END;
    
    BEGIN
        ALTER TABLE messages ADD COLUMN IF NOT EXISTS is_announcement BOOLEAN DEFAULT FALSE;
        RAISE NOTICE 'Added is_announcement column';
    EXCEPTION WHEN duplicate_column THEN
        RAISE NOTICE 'is_announcement column already exists';
    END;
    
    BEGIN
        ALTER TABLE messages ADD COLUMN IF NOT EXISTS is_emergency BOOLEAN DEFAULT FALSE;
        RAISE NOTICE 'Added is_emergency column';
    EXCEPTION WHEN duplicate_column THEN
        RAISE NOTICE 'is_emergency column already exists';
    END;
    
    BEGIN
        ALTER TABLE messages ADD COLUMN IF NOT EXISTS priority_level VARCHAR(20) DEFAULT 'normal';
        RAISE NOTICE 'Added priority_level column';
    EXCEPTION WHEN duplicate_column THEN
        RAISE NOTICE 'priority_level column already exists';
    END;
    
    BEGIN
        ALTER TABLE messages ADD COLUMN IF NOT EXISTS scheduled_send_at TIMESTAMP WITH TIME ZONE;
        RAISE NOTICE 'Added scheduled_send_at column';
    EXCEPTION WHEN duplicate_column THEN
        RAISE NOTICE 'scheduled_send_at column already exists';
    END;
    
    BEGIN
        ALTER TABLE messages ADD COLUMN IF NOT EXISTS expires_at TIMESTAMP WITH TIME ZONE;
        RAISE NOTICE 'Added expires_at column';
    EXCEPTION WHEN duplicate_column THEN
        RAISE NOTICE 'expires_at column already exists';
    END;
    
    BEGIN
        ALTER TABLE messages ADD COLUMN IF NOT EXISTS read_count INTEGER DEFAULT 0;
        RAISE NOTICE 'Added read_count column';
    EXCEPTION WHEN duplicate_column THEN
        RAISE NOTICE 'read_count column already exists';
    END;
    
    BEGIN
        ALTER TABLE messages ADD COLUMN IF NOT EXISTS reaction_counts JSONB DEFAULT '{}';
        RAISE NOTICE 'Added reaction_counts column';
    EXCEPTION WHEN duplicate_column THEN
        RAISE NOTICE 'reaction_counts column already exists';
    END;
    
    BEGIN
        ALTER TABLE messages ADD COLUMN IF NOT EXISTS edited_at TIMESTAMP WITH TIME ZONE;
        RAISE NOTICE 'Added edited_at column';
    EXCEPTION WHEN duplicate_column THEN
        RAISE NOTICE 'edited_at column already exists';
    END;
    
    BEGIN
        ALTER TABLE messages ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE;
        RAISE NOTICE 'Added deleted_at column';
    EXCEPTION WHEN duplicate_column THEN
        RAISE NOTICE 'deleted_at column already exists';
    END;
    
    -- Add foreign key constraints if they don't exist
    BEGIN
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.table_constraints 
            WHERE constraint_name = 'fk_messages_group_id' 
            AND table_name = 'messages'
        ) THEN
            ALTER TABLE messages 
            ADD CONSTRAINT fk_messages_group_id 
            FOREIGN KEY (group_id) REFERENCES chat_groups(id) ON DELETE CASCADE;
            RAISE NOTICE 'Added group_id foreign key constraint';
        END IF;
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'Could not add group_id foreign key constraint: %', SQLERRM;
    END;
    
    BEGIN
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.table_constraints 
            WHERE constraint_name = 'fk_messages_parent_message_id' 
            AND table_name = 'messages'
        ) THEN
            ALTER TABLE messages 
            ADD CONSTRAINT fk_messages_parent_message_id 
            FOREIGN KEY (parent_message_id) REFERENCES messages(id) ON DELETE SET NULL;
            RAISE NOTICE 'Added parent_message_id foreign key constraint';
        END IF;
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'Could not add parent_message_id foreign key constraint: %', SQLERRM;
    END;
    
    -- Update message_type constraint to allow new values
    BEGIN
        -- Drop existing constraint if it exists
        IF EXISTS (
            SELECT 1 FROM information_schema.table_constraints 
            WHERE constraint_name = 'messages_message_type_check' 
            AND table_name = 'messages'
        ) THEN
            ALTER TABLE messages DROP CONSTRAINT messages_message_type_check;
            RAISE NOTICE 'Dropped old message_type constraint';
        END IF;
        
        -- Add new constraint with expanded values
        ALTER TABLE messages ADD CONSTRAINT messages_message_type_check 
        CHECK (message_type IN ('direct', 'group', 'announcement', 'notification', 'system'));
        RAISE NOTICE 'Added updated message_type constraint';
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'Could not update message_type constraint: %', SQLERRM;
    END;
    
    -- Update priority constraint to match new column name and values
    BEGIN
        -- Check if old priority column exists and new priority_level doesn't
        IF EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'messages' AND column_name = 'priority'
        ) AND NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'messages' AND column_name = 'priority_level'
        ) THEN
            -- Rename priority to priority_level
            ALTER TABLE messages RENAME COLUMN priority TO priority_level;
            RAISE NOTICE 'Renamed priority column to priority_level';
        END IF;
        
        -- Drop existing priority constraint if it exists
        IF EXISTS (
            SELECT 1 FROM information_schema.table_constraints 
            WHERE constraint_name = 'messages_priority_check' 
            AND table_name = 'messages'
        ) THEN
            ALTER TABLE messages DROP CONSTRAINT messages_priority_check;
            RAISE NOTICE 'Dropped old priority constraint';
        END IF;
        
        -- Add new priority_level constraint
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.table_constraints 
            WHERE constraint_name = 'messages_priority_level_check' 
            AND table_name = 'messages'
        ) THEN
            ALTER TABLE messages ADD CONSTRAINT messages_priority_level_check 
            CHECK (priority_level IN ('low', 'normal', 'high', 'urgent'));
            RAISE NOTICE 'Added priority_level constraint';
        END IF;
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'Could not update priority constraint: %', SQLERRM;
    END;
    
    RAISE NOTICE 'Messages table migration completed';
END $$;

-- =============================================
-- INDEXES FOR PERFORMANCE
-- =============================================

-- Messages indexes
CREATE INDEX IF NOT EXISTS idx_messages_sender ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_recipient ON messages(recipient_id);
CREATE INDEX IF NOT EXISTS idx_messages_group ON messages(group_id);
CREATE INDEX IF NOT EXISTS idx_messages_type ON messages(message_type);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at);
CREATE INDEX IF NOT EXISTS idx_messages_is_announcement ON messages(is_announcement);
CREATE INDEX IF NOT EXISTS idx_messages_is_emergency ON messages(is_emergency);

-- Chat groups indexes
CREATE INDEX IF NOT EXISTS idx_chat_groups_type ON chat_groups(group_type);
CREATE INDEX IF NOT EXISTS idx_chat_groups_created_by ON chat_groups(created_by);
CREATE INDEX IF NOT EXISTS idx_chat_group_members_group ON chat_group_members(group_id);
CREATE INDEX IF NOT EXISTS idx_chat_group_members_user ON chat_group_members(user_id);

-- Message recipients indexes
CREATE INDEX IF NOT EXISTS idx_message_recipients_message ON message_recipients(message_id);
CREATE INDEX IF NOT EXISTS idx_message_recipients_recipient ON message_recipients(recipient_id);
CREATE INDEX IF NOT EXISTS idx_message_recipients_status ON message_recipients(delivery_status);

-- Announcements indexes
CREATE INDEX IF NOT EXISTS idx_announcements_type ON announcements(announcement_type);
CREATE INDEX IF NOT EXISTS idx_announcements_priority ON announcements(priority_level);
CREATE INDEX IF NOT EXISTS idx_announcements_created_by ON announcements(created_by);
CREATE INDEX IF NOT EXISTS idx_announcements_published_at ON announcements(published_at);

-- Email queue indexes
CREATE INDEX IF NOT EXISTS idx_email_queue_status ON email_queue(delivery_status);
CREATE INDEX IF NOT EXISTS idx_email_queue_scheduled ON email_queue(scheduled_send_at);
CREATE INDEX IF NOT EXISTS idx_email_queue_priority ON email_queue(priority_level);

-- Communication logs indexes
CREATE INDEX IF NOT EXISTS idx_communication_logs_type ON communication_logs(communication_type);
CREATE INDEX IF NOT EXISTS idx_communication_logs_sender ON communication_logs(sender_id);
CREATE INDEX IF NOT EXISTS idx_communication_logs_recipient ON communication_logs(recipient_id);
CREATE INDEX IF NOT EXISTS idx_communication_logs_sent_at ON communication_logs(sent_at);

-- =============================================
-- FUNCTIONS AND TRIGGERS
-- =============================================

-- Function to update message read count
CREATE OR REPLACE FUNCTION update_message_read_count()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.read_at IS NOT NULL AND OLD.read_at IS NULL THEN
        UPDATE messages 
        SET read_count = read_count + 1
        WHERE id = NEW.message_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update read count
DROP TRIGGER IF EXISTS trigger_update_message_read_count ON message_recipients;
CREATE TRIGGER trigger_update_message_read_count
    AFTER UPDATE ON message_recipients
    FOR EACH ROW
    EXECUTE FUNCTION update_message_read_count();

-- Function to update group member last read timestamp
CREATE OR REPLACE FUNCTION update_group_member_last_read()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.group_id IS NOT NULL THEN
        UPDATE chat_group_members 
        SET last_read_at = CURRENT_TIMESTAMP
        WHERE group_id = NEW.group_id AND user_id = NEW.sender_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update last read timestamp
DROP TRIGGER IF EXISTS trigger_update_group_member_last_read ON messages;
CREATE TRIGGER trigger_update_group_member_last_read
    AFTER INSERT ON messages
    FOR EACH ROW
    EXECUTE FUNCTION update_group_member_last_read();

-- Function to create message recipients for group messages
CREATE OR REPLACE FUNCTION create_group_message_recipients()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.message_type = 'group' AND NEW.group_id IS NOT NULL THEN
        INSERT INTO message_recipients (message_id, recipient_id)
        SELECT NEW.id, cgm.user_id
        FROM chat_group_members cgm
        WHERE cgm.group_id = NEW.group_id AND cgm.user_id != NEW.sender_id;
    ELSIF NEW.message_type = 'direct' AND NEW.recipient_id IS NOT NULL THEN
        INSERT INTO message_recipients (message_id, recipient_id)
        VALUES (NEW.id, NEW.recipient_id);
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to create recipients
DROP TRIGGER IF EXISTS trigger_create_message_recipients ON messages;
CREATE TRIGGER trigger_create_message_recipients
    AFTER INSERT ON messages
    FOR EACH ROW
    EXECUTE FUNCTION create_group_message_recipients();

-- Function to get unread message count for user
CREATE OR REPLACE FUNCTION get_unread_message_count(user_uuid UUID)
RETURNS TABLE (
    direct_messages BIGINT,
    group_messages BIGINT,
    announcements BIGINT,
    total_unread BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COALESCE(direct_count.count, 0) as direct_messages,
        COALESCE(group_count.count, 0) as group_messages,
        COALESCE(announcement_count.count, 0) as announcements,
        COALESCE(direct_count.count, 0) + COALESCE(group_count.count, 0) + COALESCE(announcement_count.count, 0) as total_unread
    FROM (
        SELECT COUNT(*) as count
        FROM message_recipients mr
        JOIN messages m ON mr.message_id = m.id
        WHERE mr.recipient_id = user_uuid 
        AND mr.read_at IS NULL 
        AND (m.message_type = 'direct' OR m.message_type IS NULL)
        AND (m.deleted_at IS NULL OR m.deleted_at IS NULL)
    ) direct_count
    CROSS JOIN (
        SELECT COUNT(*) as count
        FROM message_recipients mr
        JOIN messages m ON mr.message_id = m.id
        WHERE mr.recipient_id = user_uuid 
        AND mr.read_at IS NULL 
        AND m.message_type = 'group'
        AND (m.deleted_at IS NULL OR m.deleted_at IS NULL)
    ) group_count
    CROSS JOIN (
        SELECT COUNT(*) as count
        FROM announcement_recipients ar
        WHERE ar.recipient_id = user_uuid 
        AND ar.read_at IS NULL
    ) announcement_count;
END;
$$ LANGUAGE plpgsql;

-- Function to get user's chat groups with unread counts
CREATE OR REPLACE FUNCTION get_user_chat_groups(user_uuid UUID)
RETURNS TABLE (
    group_id UUID,
    group_name VARCHAR(255),
    group_type VARCHAR(50),
    avatar_url VARCHAR(500),
    member_count BIGINT,
    unread_count BIGINT,
    last_message_content TEXT,
    last_message_at TIMESTAMP WITH TIME ZONE,
    last_message_sender VARCHAR(255)
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        cg.id as group_id,
        cg.name as group_name,
        cg.group_type,
        cg.avatar_url,
        member_stats.member_count,
        COALESCE(unread_stats.unread_count, 0) as unread_count,
        last_msg.content as last_message_content,
        last_msg.created_at as last_message_at,
        last_sender.name as last_message_sender
    FROM chat_groups cg
    JOIN chat_group_members cgm ON cg.id = cgm.group_id
    LEFT JOIN (
        SELECT 
            group_id,
            COUNT(*) as member_count
        FROM chat_group_members
        GROUP BY group_id
    ) member_stats ON cg.id = member_stats.group_id
    LEFT JOIN (
        SELECT 
            m.group_id,
            COUNT(*) as unread_count
        FROM messages m
        JOIN message_recipients mr ON m.id = mr.message_id
        WHERE mr.recipient_id = user_uuid 
        AND mr.read_at IS NULL 
        AND m.message_type = 'group'
        AND (m.deleted_at IS NULL OR m.deleted_at IS NULL)
        GROUP BY m.group_id
    ) unread_stats ON cg.id = unread_stats.group_id
    LEFT JOIN LATERAL (
        SELECT m.content, m.created_at, m.sender_id
        FROM messages m
        WHERE m.group_id = cg.id AND (m.deleted_at IS NULL OR m.deleted_at IS NULL)
        ORDER BY m.created_at DESC
        LIMIT 1
    ) last_msg ON true
    LEFT JOIN users last_sender ON last_msg.sender_id = last_sender.id
    WHERE cgm.user_id = user_uuid
    ORDER BY last_msg.created_at DESC NULLS LAST, cg.name;
END;
$$ LANGUAGE plpgsql;

-- Function to send announcement to target audience
CREATE OR REPLACE FUNCTION send_announcement(
    announcement_uuid UUID,
    send_immediately BOOLEAN DEFAULT TRUE
)
RETURNS INTEGER AS $$
DECLARE
    announcement_record announcements%ROWTYPE;
    recipient_count INTEGER := 0;
    user_record RECORD;
BEGIN
    -- Get announcement details
    SELECT * INTO announcement_record FROM announcements WHERE id = announcement_uuid;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Announcement not found';
    END IF;
    
    -- Create recipients based on target audience
    FOR user_record IN
        SELECT DISTINCT u.id, u.email, u.name
        FROM users u
        LEFT JOIN user_profiles up ON u.id = up.user_id
        WHERE u.status = 'active'
        AND (
            announcement_record.target_audience = 'all'
            OR (announcement_record.target_audience = 'members' AND u.role IN ('member', 'executive', 'admin'))
            OR (announcement_record.target_audience = 'executives' AND u.role IN ('executive', 'admin'))
            OR (announcement_record.target_audience = 'department' AND up.department = ANY(announcement_record.target_departments))
            OR (announcement_record.target_audience = 'cohort' AND up.cohort = ANY(announcement_record.target_cohorts))
        )
    LOOP
        -- Create in-app notification
        INSERT INTO announcement_recipients (
            announcement_id, recipient_id, delivery_method, delivery_status
        ) VALUES (
            announcement_uuid, user_record.id, 'in_app', 'delivered'
        );
        
        -- Queue email if enabled
        IF announcement_record.send_email THEN
            INSERT INTO announcement_recipients (
                announcement_id, recipient_id, delivery_method, delivery_status
            ) VALUES (
                announcement_uuid, user_record.id, 'email', 'queued'
            );
            
            -- Add to email queue
            INSERT INTO email_queue (
                recipient_email, recipient_name, subject, html_content, 
                priority_level, scheduled_send_at
            ) VALUES (
                user_record.email, user_record.name, 
                announcement_record.title, announcement_record.content,
                announcement_record.priority_level,
                CASE WHEN send_immediately THEN CURRENT_TIMESTAMP ELSE announcement_record.scheduled_send_at END
            );
        END IF;
        
        recipient_count := recipient_count + 1;
    END LOOP;
    
    -- Update announcement as published
    UPDATE announcements 
    SET published_at = CURRENT_TIMESTAMP 
    WHERE id = announcement_uuid AND published_at IS NULL;
    
    RETURN recipient_count;
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================

-- Enable RLS
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_recipients ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE emergency_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE communication_preferences ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist, then create new ones
DROP POLICY IF EXISTS "Users can view their own messages" ON messages;
DROP POLICY IF EXISTS "Users can send messages" ON messages;
DROP POLICY IF EXISTS "Users can edit their own messages" ON messages;

-- RLS Policies for messages
CREATE POLICY "Users can view their own messages" ON messages
    FOR SELECT USING (
        auth.uid() = sender_id OR 
        auth.uid() = recipient_id OR
        (group_id IS NOT NULL AND EXISTS (
            SELECT 1 FROM chat_group_members 
            WHERE group_id = messages.group_id AND user_id = auth.uid()
        ))
    );

CREATE POLICY "Users can send messages" ON messages
    FOR INSERT WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Users can edit their own messages" ON messages
    FOR UPDATE USING (auth.uid() = sender_id);

-- Drop existing policies for chat groups if they exist
DROP POLICY IF EXISTS "Users can view groups they belong to" ON chat_groups;
DROP POLICY IF EXISTS "Group admins can manage groups" ON chat_groups;

-- RLS Policies for chat groups
CREATE POLICY "Users can view groups they belong to" ON chat_groups
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM chat_group_members 
            WHERE group_id = chat_groups.id AND user_id = auth.uid()
        ) OR 
        (is_private = FALSE)
    );

CREATE POLICY "Group admins can manage groups" ON chat_groups
    FOR ALL USING (
        auth.uid() = created_by OR
        EXISTS (
            SELECT 1 FROM chat_group_members 
            WHERE group_id = chat_groups.id AND user_id = auth.uid() AND role = 'admin'
        )
    );

-- Drop existing policies for emergency contacts if they exist
DROP POLICY IF EXISTS "Users can manage their own emergency contacts" ON emergency_contacts;
DROP POLICY IF EXISTS "Executives can view emergency contacts" ON emergency_contacts;

-- RLS Policies for emergency contacts
CREATE POLICY "Users can manage their own emergency contacts" ON emergency_contacts
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Executives can view emergency contacts" ON emergency_contacts
    FOR SELECT USING (auth.jwt() ->> 'role' IN ('admin', 'executive'));

-- Drop existing policies for communication preferences if they exist
DROP POLICY IF EXISTS "Users can manage their own preferences" ON communication_preferences;

-- RLS Policies for communication preferences
CREATE POLICY "Users can manage their own preferences" ON communication_preferences
    FOR ALL USING (auth.uid() = user_id);

COMMIT;