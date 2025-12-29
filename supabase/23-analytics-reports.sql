-- =============================================
-- JKUAT Innovation Club - Analytics & Reports System
-- =============================================

-- Analytics Views Table (for tracking page views and user interactions)
CREATE TABLE IF NOT EXISTS analytics_views (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    page_path VARCHAR(255) NOT NULL,
    page_title VARCHAR(255),
    session_id VARCHAR(255),
    ip_address INET,
    user_agent TEXT,
    referrer VARCHAR(500),
    duration_seconds INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- User Sessions Table (for tracking user engagement)
CREATE TABLE IF NOT EXISTS user_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    session_id VARCHAR(255) NOT NULL,
    start_time TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    end_time TIMESTAMP WITH TIME ZONE,
    duration_minutes INTEGER,
    pages_visited INTEGER DEFAULT 0,
    actions_performed INTEGER DEFAULT 0,
    device_type VARCHAR(50),
    browser VARCHAR(100),
    os VARCHAR(100),
    ip_address INET,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- System Metrics Table (for storing daily/weekly/monthly aggregated metrics)
CREATE TABLE IF NOT EXISTS system_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    metric_date DATE NOT NULL,
    metric_type VARCHAR(50) NOT NULL, -- 'daily', 'weekly', 'monthly'
    total_users INTEGER DEFAULT 0,
    active_users INTEGER DEFAULT 0,
    new_registrations INTEGER DEFAULT 0,
    total_events INTEGER DEFAULT 0,
    events_attended INTEGER DEFAULT 0,
    total_payments DECIMAL(15,2) DEFAULT 0,
    payment_count INTEGER DEFAULT 0,
    ideas_submitted INTEGER DEFAULT 0,
    feedback_received INTEGER DEFAULT 0,
    messages_sent INTEGER DEFAULT 0,
    page_views INTEGER DEFAULT 0,
    unique_visitors INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(metric_date, metric_type)
);

-- Report Templates Table (for saving custom report configurations)
CREATE TABLE IF NOT EXISTS report_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    report_type VARCHAR(100) NOT NULL, -- 'membership', 'events', 'financial', 'engagement', 'feedback', 'ideas'
    filters JSONB DEFAULT '{}',
    chart_config JSONB DEFAULT '{}',
    created_by UUID REFERENCES users(id),
    is_public BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Scheduled Reports Table (for automated report generation)
CREATE TABLE IF NOT EXISTS scheduled_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    template_id UUID REFERENCES report_templates(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    schedule_type VARCHAR(20) NOT NULL, -- 'daily', 'weekly', 'monthly'
    schedule_day INTEGER, -- Day of week (1-7) for weekly, day of month (1-31) for monthly
    recipients TEXT[], -- Email addresses
    is_active BOOLEAN DEFAULT TRUE,
    last_sent_at TIMESTAMP WITH TIME ZONE,
    next_send_at TIMESTAMP WITH TIME ZONE,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_analytics_views_user_id ON analytics_views(user_id);
CREATE INDEX IF NOT EXISTS idx_analytics_views_page_path ON analytics_views(page_path);
CREATE INDEX IF NOT EXISTS idx_analytics_views_created_at ON analytics_views(created_at);

CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_start_time ON user_sessions(start_time);
CREATE INDEX IF NOT EXISTS idx_user_sessions_session_id ON user_sessions(session_id);

CREATE INDEX IF NOT EXISTS idx_system_metrics_date ON system_metrics(metric_date);
CREATE INDEX IF NOT EXISTS idx_system_metrics_type ON system_metrics(metric_type);

-- =============================================
-- ANALYTICS FUNCTIONS
-- =============================================

-- Function to get membership statistics
CREATE OR REPLACE FUNCTION get_membership_statistics(
    start_date DATE DEFAULT CURRENT_DATE - INTERVAL '30 days',
    end_date DATE DEFAULT CURRENT_DATE
)
RETURNS TABLE (
    total_members BIGINT,
    active_members BIGINT,
    new_registrations BIGINT,
    pending_members BIGINT,
    suspended_members BIGINT,
    members_by_year JSONB,
    members_by_college JSONB,
    growth_rate DECIMAL
) AS $$
BEGIN
    RETURN QUERY
    WITH membership_stats AS (
        SELECT 
            COUNT(*) as total,
            COUNT(*) FILTER (WHERE membership_status = 'active') as active,
            COUNT(*) FILTER (WHERE created_at::date BETWEEN start_date AND end_date) as new_regs,
            COUNT(*) FILTER (WHERE membership_status = 'pending') as pending,
            COUNT(*) FILTER (WHERE membership_status = 'suspended') as suspended
        FROM users
    ),
    year_stats AS (
        SELECT jsonb_object_agg(year_of_study::text, count) as by_year
        FROM (
            SELECT year_of_study, COUNT(*) as count
            FROM users 
            WHERE membership_status = 'active'
            GROUP BY year_of_study
            ORDER BY year_of_study
        ) t
    ),
    college_stats AS (
        SELECT jsonb_object_agg(college, count) as by_college
        FROM (
            SELECT college, COUNT(*) as count
            FROM users 
            WHERE membership_status = 'active'
            GROUP BY college
            ORDER BY count DESC
        ) t
    ),
    growth AS (
        SELECT 
            CASE 
                WHEN prev_count > 0 THEN 
                    ROUND(((current_count - prev_count)::DECIMAL / prev_count * 100), 2)
                ELSE 0 
            END as growth_rate
        FROM (
            SELECT 
                COUNT(*) FILTER (WHERE created_at::date BETWEEN start_date AND end_date) as current_count,
                COUNT(*) FILTER (WHERE created_at::date BETWEEN start_date - (end_date - start_date) AND start_date) as prev_count
            FROM users
        ) t
    )
    SELECT 
        ms.total,
        ms.active,
        ms.new_regs,
        ms.pending,
        ms.suspended,
        ys.by_year,
        cs.by_college,
        g.growth_rate
    FROM membership_stats ms
    CROSS JOIN year_stats ys
    CROSS JOIN college_stats cs
    CROSS JOIN growth g;
END;
$$ LANGUAGE plpgsql;

-- Function to get event attendance analytics
CREATE OR REPLACE FUNCTION get_event_analytics(
    start_date DATE DEFAULT CURRENT_DATE - INTERVAL '30 days',
    end_date DATE DEFAULT CURRENT_DATE
)
RETURNS TABLE (
    total_events BIGINT,
    completed_events BIGINT,
    total_registrations BIGINT,
    total_attendance BIGINT,
    attendance_rate DECIMAL,
    avg_event_size DECIMAL,
    events_by_status JSONB,
    attendance_by_month JSONB,
    top_events JSONB
) AS $$
BEGIN
    RETURN QUERY
    WITH event_stats AS (
        SELECT 
            COUNT(*) as total,
            COUNT(*) FILTER (WHERE status = 'completed') as completed,
            COALESCE(SUM(
                (SELECT COUNT(*) FROM event_attendees ea WHERE ea.event_id = e.id)
            ), 0) as registrations,
            COALESCE(SUM(
                (SELECT COUNT(*) FROM event_attendees ea WHERE ea.event_id = e.id AND ea.attendance_status = 'attended')
            ), 0) as attendance
        FROM events e
        WHERE e.start_date::date BETWEEN start_date AND end_date
    ),
    status_stats AS (
        SELECT jsonb_object_agg(status, count) as by_status
        FROM (
            SELECT status, COUNT(*) as count
            FROM events
            WHERE start_date::date BETWEEN start_date AND end_date
            GROUP BY status
        ) t
    ),
    monthly_attendance AS (
        SELECT jsonb_object_agg(month_year, attendance_count) as by_month
        FROM (
            SELECT 
                TO_CHAR(e.start_date, 'YYYY-MM') as month_year,
                COUNT(ea.id) FILTER (WHERE ea.attendance_status = 'attended') as attendance_count
            FROM events e
            LEFT JOIN event_attendees ea ON e.id = ea.event_id
            WHERE e.start_date::date BETWEEN start_date AND end_date
            GROUP BY TO_CHAR(e.start_date, 'YYYY-MM')
            ORDER BY month_year
        ) t
    ),
    top_events_data AS (
        SELECT jsonb_agg(
            jsonb_build_object(
                'title', e.title,
                'attendance', COUNT(ea.id) FILTER (WHERE ea.attendance_status = 'attended'),
                'registrations', COUNT(ea.id),
                'date', e.start_date::date
            )
        ) as top_events
        FROM events e
        LEFT JOIN event_attendees ea ON e.id = ea.event_id
        WHERE e.start_date::date BETWEEN start_date AND end_date
        GROUP BY e.id, e.title, e.start_date
        ORDER BY COUNT(ea.id) FILTER (WHERE ea.attendance_status = 'attended') DESC
        LIMIT 10
    )
    SELECT 
        es.total,
        es.completed,
        es.registrations,
        es.attendance,
        CASE WHEN es.registrations > 0 THEN ROUND((es.attendance::DECIMAL / es.registrations * 100), 2) ELSE 0 END,
        CASE WHEN es.total > 0 THEN ROUND((es.registrations::DECIMAL / es.total), 2) ELSE 0 END,
        ss.by_status,
        ma.by_month,
        ted.top_events
    FROM event_stats es
    CROSS JOIN status_stats ss
    CROSS JOIN monthly_attendance ma
    CROSS JOIN top_events_data ted;
END;
$$ LANGUAGE plpgsql;

-- Function to get payment collection reports
CREATE OR REPLACE FUNCTION get_payment_analytics(
    start_date DATE DEFAULT CURRENT_DATE - INTERVAL '30 days',
    end_date DATE DEFAULT CURRENT_DATE
)
RETURNS TABLE (
    total_revenue DECIMAL,
    total_transactions BIGINT,
    successful_payments BIGINT,
    failed_payments BIGINT,
    success_rate DECIMAL,
    avg_transaction_amount DECIMAL,
    revenue_by_type JSONB,
    revenue_by_month JSONB,
    top_payers JSONB
) AS $$
BEGIN
    RETURN QUERY
    WITH payment_stats AS (
        SELECT 
            COALESCE(SUM(amount) FILTER (WHERE status = 'completed'), 0) as revenue,
            COUNT(*) as total_txns,
            COUNT(*) FILTER (WHERE status = 'completed') as successful,
            COUNT(*) FILTER (WHERE status = 'failed') as failed
        FROM payments
        WHERE created_at::date BETWEEN start_date AND end_date
    ),
    type_revenue AS (
        SELECT jsonb_object_agg(payment_type, revenue) as by_type
        FROM (
            SELECT 
                payment_type,
                COALESCE(SUM(amount) FILTER (WHERE status = 'completed'), 0) as revenue
            FROM payments
            WHERE created_at::date BETWEEN start_date AND end_date
            GROUP BY payment_type
        ) t
    ),
    monthly_revenue AS (
        SELECT jsonb_object_agg(month_year, revenue) as by_month
        FROM (
            SELECT 
                TO_CHAR(created_at, 'YYYY-MM') as month_year,
                COALESCE(SUM(amount) FILTER (WHERE status = 'completed'), 0) as revenue
            FROM payments
            WHERE created_at::date BETWEEN start_date AND end_date
            GROUP BY TO_CHAR(created_at, 'YYYY-MM')
            ORDER BY month_year
        ) t
    ),
    top_payers_data AS (
        SELECT jsonb_agg(
            jsonb_build_object(
                'user_name', u.name,
                'user_email', u.email,
                'total_paid', total_amount,
                'transaction_count', txn_count
            )
        ) as top_payers
        FROM (
            SELECT 
                p.user_id,
                SUM(p.amount) FILTER (WHERE p.status = 'completed') as total_amount,
                COUNT(*) as txn_count
            FROM payments p
            WHERE p.created_at::date BETWEEN start_date AND end_date
            GROUP BY p.user_id
            ORDER BY total_amount DESC
            LIMIT 10
        ) t
        JOIN users u ON t.user_id = u.id
    )
    SELECT 
        ps.revenue,
        ps.total_txns,
        ps.successful,
        ps.failed,
        CASE WHEN ps.total_txns > 0 THEN ROUND((ps.successful::DECIMAL / ps.total_txns * 100), 2) ELSE 0 END,
        CASE WHEN ps.successful > 0 THEN ROUND((ps.revenue / ps.successful), 2) ELSE 0 END,
        tr.by_type,
        mr.by_month,
        tpd.top_payers
    FROM payment_stats ps
    CROSS JOIN type_revenue tr
    CROSS JOIN monthly_revenue mr
    CROSS JOIN top_payers_data tpd;
END;
$$ LANGUAGE plpgsql;

-- Function to get engagement metrics
CREATE OR REPLACE FUNCTION get_engagement_analytics(
    start_date DATE DEFAULT CURRENT_DATE - INTERVAL '30 days',
    end_date DATE DEFAULT CURRENT_DATE
)
RETURNS TABLE (
    total_page_views BIGINT,
    unique_visitors BIGINT,
    avg_session_duration DECIMAL,
    bounce_rate DECIMAL,
    most_visited_pages JSONB,
    user_activity_by_day JSONB,
    device_breakdown JSONB,
    new_vs_returning JSONB
) AS $$
BEGIN
    RETURN QUERY
    WITH view_stats AS (
        SELECT 
            COUNT(*) as total_views,
            COUNT(DISTINCT COALESCE(user_id::text, ip_address::text)) as unique_users
        FROM analytics_views
        WHERE created_at::date BETWEEN start_date AND end_date
    ),
    session_stats AS (
        SELECT 
            AVG(duration_minutes) as avg_duration,
            COUNT(*) FILTER (WHERE pages_visited <= 1)::DECIMAL / COUNT(*) * 100 as bounce_rate
        FROM user_sessions
        WHERE start_time::date BETWEEN start_date AND end_date
    ),
    popular_pages AS (
        SELECT jsonb_agg(
            jsonb_build_object(
                'page', page_path,
                'views', view_count,
                'unique_visitors', unique_count
            )
        ) as pages
        FROM (
            SELECT 
                page_path,
                COUNT(*) as view_count,
                COUNT(DISTINCT COALESCE(user_id::text, ip_address::text)) as unique_count
            FROM analytics_views
            WHERE created_at::date BETWEEN start_date AND end_date
            GROUP BY page_path
            ORDER BY view_count DESC
            LIMIT 10
        ) t
    ),
    daily_activity AS (
        SELECT jsonb_object_agg(activity_date, view_count) as by_day
        FROM (
            SELECT 
                created_at::date as activity_date,
                COUNT(*) as view_count
            FROM analytics_views
            WHERE created_at::date BETWEEN start_date AND end_date
            GROUP BY created_at::date
            ORDER BY activity_date
        ) t
    ),
    device_stats AS (
        SELECT jsonb_object_agg(device_type, count) as by_device
        FROM (
            SELECT 
                COALESCE(device_type, 'Unknown') as device_type,
                COUNT(*) as count
            FROM user_sessions
            WHERE start_time::date BETWEEN start_date AND end_date
            GROUP BY device_type
        ) t
    ),
    user_type_stats AS (
        SELECT jsonb_build_object(
            'new_users', new_users,
            'returning_users', returning_users
        ) as user_types
        FROM (
            SELECT 
                COUNT(DISTINCT user_id) FILTER (WHERE first_session) as new_users,
                COUNT(DISTINCT user_id) FILTER (WHERE NOT first_session) as returning_users
            FROM (
                SELECT 
                    user_id,
                    MIN(start_time)::date BETWEEN start_date AND end_date as first_session
                FROM user_sessions
                WHERE user_id IS NOT NULL
                GROUP BY user_id
            ) t
        ) t2
    )
    SELECT 
        vs.total_views,
        vs.unique_users,
        COALESCE(ss.avg_duration, 0),
        COALESCE(ss.bounce_rate, 0),
        pp.pages,
        da.by_day,
        ds.by_device,
        uts.user_types
    FROM view_stats vs
    CROSS JOIN session_stats ss
    CROSS JOIN popular_pages pp
    CROSS JOIN daily_activity da
    CROSS JOIN device_stats ds
    CROSS JOIN user_type_stats uts;
END;
$$ LANGUAGE plpgsql;

-- Function to get feedback summary reports
CREATE OR REPLACE FUNCTION get_feedback_analytics(
    start_date DATE DEFAULT CURRENT_DATE - INTERVAL '30 days',
    end_date DATE DEFAULT CURRENT_DATE
)
RETURNS TABLE (
    total_feedback BIGINT,
    avg_rating DECIMAL,
    feedback_by_rating JSONB,
    feedback_by_category JSONB,
    sentiment_analysis JSONB,
    recent_feedback JSONB
) AS $$
BEGIN
    RETURN QUERY
    WITH feedback_stats AS (
        SELECT 
            COUNT(*) as total,
            AVG(rating) as avg_rating
        FROM event_feedback
        WHERE created_at::date BETWEEN start_date AND end_date
    ),
    rating_breakdown AS (
        SELECT jsonb_object_agg(rating::text, count) as by_rating
        FROM (
            SELECT 
                rating,
                COUNT(*) as count
            FROM event_feedback
            WHERE created_at::date BETWEEN start_date AND end_date
            GROUP BY rating
            ORDER BY rating
        ) t
    ),
    category_breakdown AS (
        SELECT jsonb_object_agg(category_name, count) as by_category
        FROM (
            SELECT 
                fc.name as category_name,
                COUNT(ef.id) as count
            FROM feedback_categories fc
            LEFT JOIN event_feedback ef ON fc.id = ef.category_id
            WHERE ef.created_at::date BETWEEN start_date AND end_date
            GROUP BY fc.name
            ORDER BY count DESC
        ) t
    ),
    sentiment_stats AS (
        SELECT jsonb_build_object(
            'positive', positive_count,
            'neutral', neutral_count,
            'negative', negative_count
        ) as sentiment
        FROM (
            SELECT 
                COUNT(*) FILTER (WHERE rating >= 4) as positive_count,
                COUNT(*) FILTER (WHERE rating = 3) as neutral_count,
                COUNT(*) FILTER (WHERE rating <= 2) as negative_count
            FROM event_feedback
            WHERE created_at::date BETWEEN start_date AND end_date
        ) t
    ),
    recent_feedback_data AS (
        SELECT jsonb_agg(
            jsonb_build_object(
                'event_title', e.title,
                'rating', ef.rating,
                'comment', LEFT(ef.comments, 100),
                'created_at', ef.created_at,
                'is_anonymous', ef.is_anonymous
            )
        ) as recent
        FROM event_feedback ef
        JOIN events e ON ef.event_id = e.id
        WHERE ef.created_at::date BETWEEN start_date AND end_date
        ORDER BY ef.created_at DESC
        LIMIT 20
    )
    SELECT 
        fs.total,
        ROUND(fs.avg_rating, 2),
        rb.by_rating,
        cb.by_category,
        ss.sentiment,
        rfd.recent
    FROM feedback_stats fs
    CROSS JOIN rating_breakdown rb
    CROSS JOIN category_breakdown cb
    CROSS JOIN sentiment_stats ss
    CROSS JOIN recent_feedback_data rfd;
END;
$$ LANGUAGE plpgsql;

-- Function to get idea submission trends
CREATE OR REPLACE FUNCTION get_ideas_analytics(
    start_date DATE DEFAULT CURRENT_DATE - INTERVAL '30 days',
    end_date DATE DEFAULT CURRENT_DATE
)
RETURNS TABLE (
    total_ideas BIGINT,
    approved_ideas BIGINT,
    pending_ideas BIGINT,
    ideas_by_category JSONB,
    ideas_by_month JSONB,
    top_contributors JSONB,
    collaboration_stats JSONB
) AS $$
BEGIN
    RETURN QUERY
    WITH idea_stats AS (
        SELECT 
            COUNT(*) as total,
            COUNT(*) FILTER (WHERE status = 'approved') as approved,
            COUNT(*) FILTER (WHERE status = 'pending') as pending
        FROM ideas
        WHERE created_at::date BETWEEN start_date AND end_date
    ),
    category_breakdown AS (
        SELECT jsonb_object_agg(category, count) as by_category
        FROM (
            SELECT 
                COALESCE(category, 'Uncategorized') as category,
                COUNT(*) as count
            FROM ideas
            WHERE created_at::date BETWEEN start_date AND end_date
            GROUP BY category
            ORDER BY count DESC
        ) t
    ),
    monthly_trends AS (
        SELECT jsonb_object_agg(month_year, idea_count) as by_month
        FROM (
            SELECT 
                TO_CHAR(created_at, 'YYYY-MM') as month_year,
                COUNT(*) as idea_count
            FROM ideas
            WHERE created_at::date BETWEEN start_date AND end_date
            GROUP BY TO_CHAR(created_at, 'YYYY-MM')
            ORDER BY month_year
        ) t
    ),
    top_contributors_data AS (
        SELECT jsonb_agg(
            jsonb_build_object(
                'user_name', u.name,
                'user_email', u.email,
                'ideas_count', idea_count,
                'avg_upvotes', avg_upvotes
            )
        ) as contributors
        FROM (
            SELECT 
                i.user_id,
                COUNT(*) as idea_count,
                AVG(i.upvotes) as avg_upvotes
            FROM ideas i
            WHERE i.created_at::date BETWEEN start_date AND end_date
            GROUP BY i.user_id
            ORDER BY idea_count DESC, avg_upvotes DESC
            LIMIT 10
        ) t
        JOIN users u ON t.user_id = u.id
    ),
    collaboration_data AS (
        SELECT jsonb_build_object(
            'looking_for_collaborators', collab_count,
            'avg_upvotes', avg_upvotes,
            'avg_downvotes', avg_downvotes,
            'engagement_rate', engagement_rate
        ) as collab_stats
        FROM (
            SELECT 
                COUNT(*) FILTER (WHERE looking_for_collaborators = true) as collab_count,
                AVG(upvotes) as avg_upvotes,
                AVG(downvotes) as avg_downvotes,
                AVG(upvotes + downvotes) as engagement_rate
            FROM ideas
            WHERE created_at::date BETWEEN start_date AND end_date
        ) t
    )
    SELECT 
        is_data.total,
        is_data.approved,
        is_data.pending,
        cb.by_category,
        mt.by_month,
        tcd.contributors,
        cd.collab_stats
    FROM idea_stats is_data
    CROSS JOIN category_breakdown cb
    CROSS JOIN monthly_trends mt
    CROSS JOIN top_contributors_data tcd
    CROSS JOIN collaboration_data cd;
END;
$$ LANGUAGE plpgsql;

-- Function to generate comprehensive dashboard data
CREATE OR REPLACE FUNCTION get_admin_dashboard_analytics(
    start_date DATE DEFAULT CURRENT_DATE - INTERVAL '30 days',
    end_date DATE DEFAULT CURRENT_DATE
)
RETURNS JSONB AS $$
DECLARE
    result JSONB;
    membership_data RECORD;
    event_data RECORD;
    payment_data RECORD;
    engagement_data RECORD;
    feedback_data RECORD;
    ideas_data RECORD;
BEGIN
    -- Get all analytics data
    SELECT * INTO membership_data FROM get_membership_statistics(start_date, end_date) LIMIT 1;
    SELECT * INTO event_data FROM get_event_analytics(start_date, end_date) LIMIT 1;
    SELECT * INTO payment_data FROM get_payment_analytics(start_date, end_date) LIMIT 1;
    SELECT * INTO engagement_data FROM get_engagement_analytics(start_date, end_date) LIMIT 1;
    SELECT * INTO feedback_data FROM get_feedback_analytics(start_date, end_date) LIMIT 1;
    SELECT * INTO ideas_data FROM get_ideas_analytics(start_date, end_date) LIMIT 1;
    
    -- Build comprehensive result
    result := jsonb_build_object(
        'period', jsonb_build_object(
            'start_date', start_date,
            'end_date', end_date,
            'days', end_date - start_date + 1
        ),
        'membership', jsonb_build_object(
            'total_members', membership_data.total_members,
            'active_members', membership_data.active_members,
            'new_registrations', membership_data.new_registrations,
            'pending_members', membership_data.pending_members,
            'suspended_members', membership_data.suspended_members,
            'members_by_year', membership_data.members_by_year,
            'members_by_college', membership_data.members_by_college,
            'growth_rate', membership_data.growth_rate
        ),
        'events', jsonb_build_object(
            'total_events', event_data.total_events,
            'completed_events', event_data.completed_events,
            'total_registrations', event_data.total_registrations,
            'total_attendance', event_data.total_attendance,
            'attendance_rate', event_data.attendance_rate,
            'avg_event_size', event_data.avg_event_size,
            'events_by_status', event_data.events_by_status,
            'attendance_by_month', event_data.attendance_by_month,
            'top_events', event_data.top_events
        ),
        'payments', jsonb_build_object(
            'total_revenue', payment_data.total_revenue,
            'total_transactions', payment_data.total_transactions,
            'successful_payments', payment_data.successful_payments,
            'failed_payments', payment_data.failed_payments,
            'success_rate', payment_data.success_rate,
            'avg_transaction_amount', payment_data.avg_transaction_amount,
            'revenue_by_type', payment_data.revenue_by_type,
            'revenue_by_month', payment_data.revenue_by_month,
            'top_payers', payment_data.top_payers
        ),
        'engagement', jsonb_build_object(
            'total_page_views', engagement_data.total_page_views,
            'unique_visitors', engagement_data.unique_visitors,
            'avg_session_duration', engagement_data.avg_session_duration,
            'bounce_rate', engagement_data.bounce_rate,
            'most_visited_pages', engagement_data.most_visited_pages,
            'user_activity_by_day', engagement_data.user_activity_by_day,
            'device_breakdown', engagement_data.device_breakdown,
            'new_vs_returning', engagement_data.new_vs_returning
        ),
        'feedback', jsonb_build_object(
            'total_feedback', feedback_data.total_feedback,
            'avg_rating', feedback_data.avg_rating,
            'feedback_by_rating', feedback_data.feedback_by_rating,
            'feedback_by_category', feedback_data.feedback_by_category,
            'sentiment_analysis', feedback_data.sentiment_analysis,
            'recent_feedback', feedback_data.recent_feedback
        ),
        'ideas', jsonb_build_object(
            'total_ideas', ideas_data.total_ideas,
            'approved_ideas', ideas_data.approved_ideas,
            'pending_ideas', ideas_data.pending_ideas,
            'ideas_by_category', ideas_data.ideas_by_category,
            'ideas_by_month', ideas_data.ideas_by_month,
            'top_contributors', ideas_data.top_contributors,
            'collaboration_stats', ideas_data.collaboration_stats
        ),
        'generated_at', CURRENT_TIMESTAMP
    );
    
    RETURN result;
END;
$$ LANGUAGE plpgsql;

COMMIT;