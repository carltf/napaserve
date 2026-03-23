-- ============================================================
-- NapaServe — NVF Polls Schema
-- Table, indexes, RLS policies, and dashboard views
-- Run in Supabase SQL Editor (https://supabase.com/dashboard)
-- ============================================================

-- 1. Table
-- ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS nvf_polls (
    poll_id       BIGINT PRIMARY KEY,
    post_id       BIGINT NOT NULL,
    post_title    TEXT,
    post_tags     TEXT[],
    theme         TEXT,
    question      TEXT NOT NULL,
    options_json  JSONB NOT NULL DEFAULT '[]',
    total_votes   INTEGER NOT NULL DEFAULT 0,
    published_at  TIMESTAMPTZ,
    fetched_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE  nvf_polls IS 'Substack poll results extracted from NVF HTML exports';
COMMENT ON COLUMN nvf_polls.poll_id      IS 'Substack poll ID from data-attrs';
COMMENT ON COLUMN nvf_polls.post_id      IS 'Substack post ID (numeric filename prefix)';
COMMENT ON COLUMN nvf_polls.post_title   IS 'Article title from posts.csv (fallback: humanized filename slug)';
COMMENT ON COLUMN nvf_polls.post_tags    IS 'Tags array — reserved for future use (Substack export has no tags)';
COMMENT ON COLUMN nvf_polls.theme        IS 'Thematic category — reserved for future classification';
COMMENT ON COLUMN nvf_polls.options_json IS 'Array of {id, text, votes} objects';
COMMENT ON COLUMN nvf_polls.total_votes  IS 'Sum of all option vote counts';
COMMENT ON COLUMN nvf_polls.fetched_at   IS 'When the pipeline last fetched this poll';

-- If the table already exists, add the new columns idempotently
ALTER TABLE nvf_polls ADD COLUMN IF NOT EXISTS post_title TEXT;
ALTER TABLE nvf_polls ADD COLUMN IF NOT EXISTS post_tags  TEXT[];
ALTER TABLE nvf_polls ADD COLUMN IF NOT EXISTS theme      TEXT;


-- 2. Indexes
-- ------------------------------------------------------------

CREATE INDEX IF NOT EXISTS idx_nvf_polls_post_id
    ON nvf_polls (post_id);

CREATE INDEX IF NOT EXISTS idx_nvf_polls_published_at
    ON nvf_polls (published_at DESC);

CREATE INDEX IF NOT EXISTS idx_nvf_polls_total_votes
    ON nvf_polls (total_votes DESC);


-- 3. Row-Level Security
-- ------------------------------------------------------------

ALTER TABLE nvf_polls ENABLE ROW LEVEL SECURITY;

-- Public read access (anon + authenticated)
CREATE POLICY "nvf_polls_select_public"
    ON nvf_polls FOR SELECT
    USING (true);

-- Service-role only for writes (pipeline upserts)
CREATE POLICY "nvf_polls_insert_service"
    ON nvf_polls FOR INSERT
    WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "nvf_polls_update_service"
    ON nvf_polls FOR UPDATE
    USING (auth.role() = 'service_role');


-- 4. Views — Reader Pulse Dashboard
-- ------------------------------------------------------------

-- 4a. Flattened options view (one row per option)
CREATE OR REPLACE VIEW nvf_poll_options AS
SELECT
    p.poll_id,
    p.post_id,
    p.post_title,
    p.theme,
    p.question,
    p.total_votes,
    p.published_at,
    opt->>'id'                       AS option_id,
    opt->>'text'                     AS option_text,
    (opt->>'votes')::INTEGER         AS option_votes,
    CASE
        WHEN p.total_votes > 0
        THEN ROUND(((opt->>'votes')::NUMERIC / p.total_votes) * 100, 1)
        ELSE 0
    END                              AS vote_pct
FROM nvf_polls p,
     jsonb_array_elements(p.options_json) AS opt;

COMMENT ON VIEW nvf_poll_options IS 'Flattened poll options with vote percentages — for bar charts';


-- 4b. Poll summary for dashboard cards
CREATE OR REPLACE VIEW nvf_poll_summary AS
SELECT
    poll_id,
    post_id,
    post_title,
    post_tags,
    theme,
    question,
    total_votes,
    published_at,
    fetched_at,
    -- Winning option
    (SELECT opt->>'text'
     FROM jsonb_array_elements(options_json) AS opt
     ORDER BY (opt->>'votes')::INTEGER DESC
     LIMIT 1)                        AS top_answer,
    (SELECT (opt->>'votes')::INTEGER
     FROM jsonb_array_elements(options_json) AS opt
     ORDER BY (opt->>'votes')::INTEGER DESC
     LIMIT 1)                        AS top_answer_votes,
    -- Option count
    jsonb_array_length(options_json)  AS option_count
FROM nvf_polls
ORDER BY published_at DESC;

COMMENT ON VIEW nvf_poll_summary IS 'One row per poll with winning answer — for dashboard cards';


-- 4c. Engagement stats (aggregate for Reader Pulse header)
CREATE OR REPLACE VIEW nvf_poll_engagement AS
SELECT
    COUNT(*)                          AS total_polls,
    SUM(total_votes)                  AS total_votes_all,
    ROUND(AVG(total_votes), 1)        AS avg_votes_per_poll,
    MAX(total_votes)                  AS max_votes_single_poll,
    MIN(published_at)                 AS earliest_poll,
    MAX(published_at)                 AS latest_poll,
    COUNT(*) FILTER (
        WHERE published_at >= now() - INTERVAL '90 days'
    )                                 AS polls_last_90d
FROM nvf_polls;

COMMENT ON VIEW nvf_poll_engagement IS 'Aggregate engagement stats for Reader Pulse dashboard header';
