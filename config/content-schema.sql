-- ============================================================
-- JKUAT IEC Content Schema
-- Run this in Supabase SQL Editor (Dashboard → SQL Editor)
-- ============================================================

-- ── Events table ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS events (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title         TEXT NOT NULL,
    description   TEXT,
    event_type    TEXT NOT NULL DEFAULT 'general'
                      CHECK (event_type IN ('hackathon','workshop','networking','seminar','general')),
    status        TEXT NOT NULL DEFAULT 'upcoming'
                      CHECK (status IN ('upcoming','ongoing','completed','cancelled')),
    start_date    TIMESTAMPTZ NOT NULL,
    end_date      TIMESTAMPTZ,
    location      TEXT,
    fee           INTEGER NOT NULL DEFAULT 0,
    banner_image  TEXT,                        -- Supabase Storage public URL
    video_url     TEXT,                        -- YouTube / Google Drive embed URL
    tags          TEXT[] DEFAULT '{}',
    created_by    UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at    TIMESTAMPTZ DEFAULT NOW(),
    updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ── Articles (blog) table ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS articles (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title           TEXT NOT NULL,
    excerpt         TEXT,
    content         TEXT,
    category        TEXT NOT NULL DEFAULT 'news'
                        CHECK (category IN ('news','article','announcement')),
    status          TEXT NOT NULL DEFAULT 'draft'
                        CHECK (status IN ('draft','published')),
    featured_image  TEXT,                      -- Supabase Storage public URL
    tags            TEXT[] DEFAULT '{}',
    author_name     TEXT NOT NULL DEFAULT 'JKUAT IEC',
    published_at    TIMESTAMPTZ,
    created_by      UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ── Projects table ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS projects (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title        TEXT NOT NULL,
    description  TEXT,
    category     TEXT NOT NULL DEFAULT 'innovation'
                     CHECK (category IN ('innovation','research','startup','hackathon')),
    status       TEXT NOT NULL DEFAULT 'active'
                     CHECK (status IN ('active','completed','planning')),
    tech_stack   TEXT[] DEFAULT '{}',
    image        TEXT,                         -- Supabase Storage public URL
    github_url   TEXT,
    demo_url     TEXT,
    team_size    SMALLINT DEFAULT 1,
    created_by   UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at   TIMESTAMPTZ DEFAULT NOW(),
    updated_at   TIMESTAMPTZ DEFAULT NOW()
);

-- ── Indexes ───────────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_events_status     ON events(status);
CREATE INDEX IF NOT EXISTS idx_events_start_date ON events(start_date);
CREATE INDEX IF NOT EXISTS idx_articles_status   ON articles(status);
CREATE INDEX IF NOT EXISTS idx_articles_category ON articles(category);
CREATE INDEX IF NOT EXISTS idx_projects_status   ON projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_category ON projects(category);

-- ── Auto-update updated_at ────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS events_updated_at   ON events;
DROP TRIGGER IF EXISTS articles_updated_at ON articles;
DROP TRIGGER IF EXISTS projects_updated_at ON projects;

CREATE TRIGGER events_updated_at   BEFORE UPDATE ON events   FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER articles_updated_at BEFORE UPDATE ON articles FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER projects_updated_at BEFORE UPDATE ON projects FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ── Row Level Security ────────────────────────────────────────────────────────
ALTER TABLE events   ENABLE ROW LEVEL SECURITY;
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

-- Public can read published/upcoming content (anon key)
CREATE POLICY "public_read_events"
    ON events FOR SELECT TO anon
    USING (status != 'cancelled');

CREATE POLICY "public_read_articles"
    ON articles FOR SELECT TO anon
    USING (status = 'published');

CREATE POLICY "public_read_projects"
    ON projects FOR SELECT TO anon
    USING (true);

-- Authenticated admins can do everything (service role bypasses RLS anyway,
-- but these policies cover direct Supabase client calls from the admin dashboard)
CREATE POLICY "admin_all_events"
    ON events FOR ALL TO authenticated
    USING (true) WITH CHECK (true);

CREATE POLICY "admin_all_articles"
    ON articles FOR ALL TO authenticated
    USING (true) WITH CHECK (true);

CREATE POLICY "admin_all_projects"
    ON projects FOR ALL TO authenticated
    USING (true) WITH CHECK (true);

-- ── Storage buckets ───────────────────────────────────────────────────────────
-- Run these separately in the SQL editor:
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
    ('event-media',   'event-media',   true, 5242880,  ARRAY['image/jpeg','image/png','image/webp','image/gif']),
    ('article-media', 'article-media', true, 5242880,  ARRAY['image/jpeg','image/png','image/webp','image/gif']),
    ('project-media', 'project-media', true, 5242880,  ARRAY['image/jpeg','image/png','image/webp','image/gif'])
ON CONFLICT (id) DO NOTHING;

-- Public read on all media buckets
CREATE POLICY "public_read_event_media"
    ON storage.objects FOR SELECT TO anon
    USING (bucket_id = 'event-media');

CREATE POLICY "public_read_article_media"
    ON storage.objects FOR SELECT TO anon
    USING (bucket_id = 'article-media');

CREATE POLICY "public_read_project_media"
    ON storage.objects FOR SELECT TO anon
    USING (bucket_id = 'project-media');

-- Only authenticated users can upload
CREATE POLICY "auth_upload_event_media"
    ON storage.objects FOR INSERT TO authenticated
    WITH CHECK (bucket_id = 'event-media');

CREATE POLICY "auth_upload_article_media"
    ON storage.objects FOR INSERT TO authenticated
    WITH CHECK (bucket_id = 'article-media');

CREATE POLICY "auth_upload_project_media"
    ON storage.objects FOR INSERT TO authenticated
    WITH CHECK (bucket_id = 'project-media');

-- Only authenticated users can delete
CREATE POLICY "auth_delete_event_media"
    ON storage.objects FOR DELETE TO authenticated
    USING (bucket_id = 'event-media');

CREATE POLICY "auth_delete_article_media"
    ON storage.objects FOR DELETE TO authenticated
    USING (bucket_id = 'article-media');

CREATE POLICY "auth_delete_project_media"
    ON storage.objects FOR DELETE TO authenticated
    USING (bucket_id = 'project-media');
