-- Migration 002: Switch from Privy to Petra wallet auth
-- wallet_address is now the primary user identifier (was privy_user_id)

-- Drop old Privy index
DROP INDEX IF EXISTS idx_users_privy_id;

-- Make privy_user_id nullable and wallet_address required + unique
ALTER TABLE users
  ALTER COLUMN privy_user_id DROP NOT NULL,
  ALTER COLUMN wallet_address TYPE TEXT,
  ALTER COLUMN wallet_address SET NOT NULL;

-- Ensure wallet_address is unique (may already be, but explicit)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes
    WHERE tablename = 'users' AND indexname = 'idx_users_wallet_address'
  ) THEN
    CREATE UNIQUE INDEX idx_users_wallet_address ON users(wallet_address);
  END IF;
END $$;
