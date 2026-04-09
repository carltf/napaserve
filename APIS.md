# API Registry — Valley Works / NapaServe
# Safe to paste into Claude Code context. No secret values here.
# Actual keys live in .env only.
# Last verified: April 8, 2026

---

## Anthropic
- Env var: ANTHROPIC_API_KEY
- Key name: NapaServe-Dev
- Models: claude-opus-4-6 (Claude Code), claude-sonnet-4-20250514 (artifacts)
- Claude Code version: 2.1.1, 1M context

## Supabase (NapaServe)
- URL: https://csenpchwxxepdvjebsrt.supabase.co
- Env vars: SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_KEY
- Tables: all prefixed nvf_ (nvf_posts, nvf_chunks, etc.)
- Knowledge base: 997 posts, 10,033 chunks
- Embeddings: voyage-3, 1024 dimensions

## Supabase (Alongside)
- Env vars: SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_KEY, SUPABASE_PASSWORD
- Project ref: yourprojectref.supabase.co

## Voyage AI
- Model: voyage-3
- Env var: VOYAGE_API_KEY
- Use: embedding generation for RAG pipeline

## Cloudflare Worker
- Endpoint: misty-bush-fc93.tfcarl.workers.dev
- Routes: /api/rag-search, /api/rag-answer
- Env var: CF_TOKEN

## GitHub
- Repo: carltf/napaserve
- Env var: GITHUB_TOKEN
- Format: ghp_...

## Vercel
- Token name: napaserve-local
- Env var: VERCEL_TOKEN
- Auto-deploy on push from carltf/napaserve
- Env vars also stored in Vercel dashboard (prod source of truth)

## FRED API
- Base URL: https://api.stlouisfed.org/fred
- Env var: FRED_API_KEY
- Use: Federal Reserve Economic Data

## Substack (Napa Valley Features)
- Env var: SUBSTACK_SID
- Format: s%...
- Expires: Jun 13, 2026 — rotate monthly
- Export path: ~/Library/Mobile Documents/com~apple~CloudDocs/Valley Works Collaborative/NapaServe/Substack Data March 11 2026/9DDiMintS2Ksp84RxDH69g/posts
- Extraction command:
  python3 pipeline/poll_extraction.py --cookie "substack.sid=$SUBSTACK_SID" --skip-existing
- Run from: ~/Desktop/napaserve

## Slack
- Env var: SLACK_WEBHOOK_URL
- Format: https://hooks.slack.com/...
- Use: NapaServe notifications

## Resend (Email)
- Base URL: https://api.resend.com
- Env var: RESEND_API_KEY
- Key name: napaserve-worker

## BlueSky
- Account: Valley Works Collaborative
- Handle: valleyworkscollab.bsky.social
- Env var: BLUESKY_APP_PASSWORD
- Auth endpoint: https://bsky.social/xrpc/com.atproto.server.createSession

## Astronomy API
- Base URL: https://api.astronomyapi.com/api/v2
- Verified endpoint: /bodies
- Env vars: ASTRONOMY_APP_ID, ASTRONOMY_APP_SECRET
- Auth: Basic --user "$ASTRONOMY_APP_ID:$ASTRONOMY_APP_SECRET"

## NapaServe Admin
- Env vars: ADMIN_PASSWORD, ADMIN_SESSION_SECRET

---

## Stack Overview
- Frontend: React/Vite — ~/Desktop/napaserve/economic-pulse-app
- GitHub: carltf/napaserve
- Hosting: Vercel (auto-deploy)
- Database: Supabase
- Edge: Cloudflare Worker
- Embeddings: Voyage AI (voyage-3)
- AI: Anthropic Claude
- Design: dark wine-country — bg #0F0A06, gold #C4A050, text #F5E6C8
- Fonts: Playfair Display (headers), Source Sans 3 (body)

## Project Paths
- NapaServe: ~/Desktop/napaserve
- Alongside: ~/Documents/alongside
- Master keys reference: ~/Documents/ValleyWorks/MASTER_KEYS_REFERENCE.md

## Session Startup
cd ~/Desktop/napaserve
source .env
claude
