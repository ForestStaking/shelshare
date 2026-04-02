-- ShelShare — Initial Schema
-- Supabase is used ONLY as a metadata index. File bytes are stored on Shelby Protocol.
-- This separation is deliberate: Shelby owns the bytes, Supabase owns the metadata.
-- See README.md for full architectural rationale.

-- Users table — tracks authenticated users from Privy
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  privy_user_id TEXT UNIQUE NOT NULL,
  email TEXT,
  wallet_address TEXT,
  storage_used_bytes BIGINT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_users_privy_id ON users(privy_user_id);

-- Files table — metadata index for files stored on Shelby Protocol
-- shelby_address: the Shelby Protocol URI where file bytes live (shelby://{account}/{blobName})
-- shelby_proof: on-chain proof of storage (equals shelby_address on testnet)
-- short_id: nanoid for shareable URLs (shelshare.io/f/{short_id})
-- password_hash: bcrypt hash if link is password-protected (checked at access time)
-- expires_at: optional expiry (checked at access time, returns 410 Gone when expired)
-- deleted_at: soft delete (unpin not yet supported by Shelby SDK — TODO)
CREATE TABLE files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  short_id TEXT UNIQUE NOT NULL,
  owner_user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  original_filename TEXT NOT NULL,
  size_bytes BIGINT NOT NULL,
  mime_type TEXT NOT NULL,
  shelby_address TEXT NOT NULL,
  shelby_proof TEXT NOT NULL,
  password_hash TEXT,
  expires_at TIMESTAMPTZ,
  download_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  deleted_at TIMESTAMPTZ
);

CREATE INDEX idx_files_short_id ON files(short_id);
CREATE INDEX idx_files_owner ON files(owner_user_id) WHERE deleted_at IS NULL;
