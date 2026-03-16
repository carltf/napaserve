-- ============================================================
-- NapaServe — Poll Semantic Search Schema
-- Embeddings table, index, RLS, and search function
-- Requires pgvector extension (already enabled for nvf_search)
-- Run in Supabase SQL Editor
-- ============================================================

-- 1. Embeddings table
-- ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS nvf_poll_embeddings (
    poll_id    BIGINT PRIMARY KEY REFERENCES nvf_polls(poll_id) ON DELETE CASCADE,
    embedding  vector(1024) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE  nvf_poll_embeddings IS 'Voyage-3 embeddings of poll question + post_title for semantic search';
COMMENT ON COLUMN nvf_poll_embeddings.embedding IS '1024-dim voyage-3 vector of concatenated question and post_title';

-- 2. HNSW index for fast cosine similarity
-- ------------------------------------------------------------

CREATE INDEX IF NOT EXISTS idx_nvf_poll_embeddings_cosine
    ON nvf_poll_embeddings
    USING ivfflat (embedding vector_cosine_ops)
    WITH (lists = 10);

-- 3. Row-Level Security
-- ------------------------------------------------------------

ALTER TABLE nvf_poll_embeddings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "nvf_poll_embeddings_select_public"
    ON nvf_poll_embeddings FOR SELECT
    USING (true);

CREATE POLICY "nvf_poll_embeddings_insert_service"
    ON nvf_poll_embeddings FOR INSERT
    WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "nvf_poll_embeddings_update_service"
    ON nvf_poll_embeddings FOR UPDATE
    USING (auth.role() = 'service_role');

-- 4. Search function — returns top N polls by cosine similarity
-- ------------------------------------------------------------

CREATE OR REPLACE FUNCTION nvf_poll_search(
    query_embedding vector(1024),
    match_count     int DEFAULT 5
)
RETURNS TABLE (
    poll_id       BIGINT,
    question      TEXT,
    options_json  JSONB,
    total_votes   INTEGER,
    post_title    TEXT,
    theme         TEXT,
    published_at  TIMESTAMPTZ,
    substack_url  TEXT,
    similarity    FLOAT
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT
        p.poll_id,
        p.question,
        p.options_json,
        p.total_votes,
        p.post_title,
        p.theme,
        p.published_at,
        p.substack_url,
        1 - (e.embedding <=> query_embedding) AS similarity
    FROM nvf_poll_embeddings e
    JOIN nvf_polls p ON p.poll_id = e.poll_id
    ORDER BY e.embedding <=> query_embedding
    LIMIT match_count;
END;
$$;

COMMENT ON FUNCTION nvf_poll_search IS 'Semantic search over poll questions using cosine similarity';
