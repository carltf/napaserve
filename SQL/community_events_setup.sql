-- =============================================================
-- NapaServe Community Events — Supabase Table
-- Run in Supabase SQL Editor
-- =============================================================

CREATE TABLE IF NOT EXISTS community_events (
    id              BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    
    -- Required fields
    title           TEXT NOT NULL,
    description     TEXT NOT NULL,
    event_date      DATE NOT NULL,
    town            TEXT NOT NULL,
    category        TEXT NOT NULL DEFAULT 'community',
    
    -- Date & time (optional)
    end_date        DATE,
    start_time      TEXT,
    end_time        TEXT,
    
    -- Location (optional)
    venue_name      TEXT,
    address         TEXT,
    
    -- Pricing (optional)
    price_info      TEXT,
    is_free         BOOLEAN DEFAULT false,
    
    -- Age & setting (optional)
    age_restriction TEXT DEFAULT 'all_ages',   -- all_ages, 21_plus, 18_plus
    indoor_outdoor  TEXT DEFAULT 'indoor',     -- indoor, outdoor, both
    
    -- Recurring (optional)
    is_recurring    BOOLEAN DEFAULT false,
    recurrence_desc TEXT,                      -- e.g. "Every Tuesday", "First Saturday of the month"
    
    -- Links (optional)
    website_url     TEXT,
    ticket_url      TEXT,
    
    -- Organizer (optional)
    organizer_contact TEXT,
    
    -- Accessibility (optional)
    accessibility_info TEXT,
    
    -- Submitter (optional)
    submitted_by    TEXT,
    
    -- Moderation
    status          TEXT DEFAULT 'pending',    -- pending, approved, rejected
    approved_at     TIMESTAMPTZ,
    admin_notes     TEXT,
    
    -- Source tracking
    source          TEXT DEFAULT 'community',  -- community, google_sheet, scraped
    source_url      TEXT,

    -- Timestamps
    submitted_at    TIMESTAMPTZ DEFAULT NOW(),
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_ce_date ON community_events (event_date DESC);
CREATE INDEX IF NOT EXISTS idx_ce_town ON community_events (town);
CREATE INDEX IF NOT EXISTS idx_ce_category ON community_events (category);
CREATE INDEX IF NOT EXISTS idx_ce_status ON community_events (status);

-- RLS
ALTER TABLE community_events ENABLE ROW LEVEL SECURITY;

-- Public can read approved events
CREATE POLICY "read_approved" ON community_events
    FOR SELECT USING (status = 'approved');

-- Public can submit events
CREATE POLICY "submit_events" ON community_events
    FOR INSERT WITH CHECK (true);

-- Service role has full access
CREATE POLICY "service_full" ON community_events
    FOR ALL USING (true) WITH CHECK (true);

-- Grants
GRANT SELECT, INSERT ON community_events TO anon;
GRANT ALL ON community_events TO service_role;
