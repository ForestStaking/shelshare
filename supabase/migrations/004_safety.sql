-- 004_safety.sql
-- Safety layer: reports table + sha256 column on files

-- Store the SHA-256 of each uploaded file for blocklist matching
ALTER TABLE files
  ADD COLUMN IF NOT EXISTS file_sha256 TEXT;

-- Abuse / DMCA reports
CREATE TABLE IF NOT EXISTS reports (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  file_id       UUID        REFERENCES files(id) ON DELETE SET NULL,
  short_id      TEXT        NOT NULL,
  shelby_address TEXT       NOT NULL,
  report_type   TEXT        NOT NULL CHECK (report_type IN ('dmca','malware','illegal','spam','other')),
  description   TEXT        NOT NULL,
  reporter_email TEXT,
  status        TEXT        NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','reviewed','actioned','dismissed')),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  resolved_at   TIMESTAMPTZ
);

-- Blocklist table — manually curated hashes + shelby addresses to deny
CREATE TABLE IF NOT EXISTS blocklist (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  sha256        TEXT        UNIQUE,
  shelby_address TEXT       UNIQUE,
  reason        TEXT        NOT NULL,
  added_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE reports  IS 'Abuse and DMCA reports submitted via /api/report';
COMMENT ON TABLE blocklist IS 'SHA-256 hashes and Shelby addresses of blocked content';
