-- =============================================================
-- NapaServe Email Digests — Supabase Table
-- Run in Supabase SQL Editor
-- =============================================================

-- 1. Create email_digests table
CREATE TABLE IF NOT EXISTS email_digests (
    id                BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    status            TEXT NOT NULL DEFAULT 'draft',   -- draft, sent
    ai_intro          TEXT,
    event_ids         BIGINT[] DEFAULT '{}',
    date_range_start  DATE,
    date_range_end    DATE,
    sent_at           TIMESTAMPTZ,
    resend_message_id TEXT,
    created_at        TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ed_status ON email_digests (status);
CREATE INDEX IF NOT EXISTS idx_ed_created ON email_digests (created_at DESC);

-- RLS — service role only (admin operations)
ALTER TABLE email_digests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "service_full" ON email_digests
    FOR ALL USING (true) WITH CHECK (true);

GRANT ALL ON email_digests TO service_role;

-- 2. Add include_in_email column to community_events (optional per-event flag)
ALTER TABLE community_events
    ADD COLUMN IF NOT EXISTS include_in_email BOOLEAN DEFAULT true;
