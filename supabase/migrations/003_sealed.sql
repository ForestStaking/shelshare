-- 003_sealed.sql
-- Adds sealed-file columns to the files table.
-- Sealed files are AES-256 encrypted client-side; the key lives in the
-- on-chain sealed_files Move contract and is only released when the
-- unlock condition (pay / time / burn) is satisfied.

ALTER TABLE files
  ADD COLUMN IF NOT EXISTS is_sealed        BOOLEAN   NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS condition_type   SMALLINT,          -- 1=pay 2=time 3=burn
  ADD COLUMN IF NOT EXISTS price_octas      BIGINT,            -- APT in octas (1 APT = 1e8)
  ADD COLUMN IF NOT EXISTS unlock_timestamp BIGINT;            -- Unix seconds for TIME condition

COMMENT ON COLUMN files.is_sealed        IS 'True when file is AES-256 encrypted and key is on-chain';
COMMENT ON COLUMN files.condition_type   IS '1=PAY 2=TIME 3=BURN';
COMMENT ON COLUMN files.price_octas      IS 'Price in APT octas for CONDITION_PAY files';
COMMENT ON COLUMN files.unlock_timestamp IS 'Unix timestamp (seconds) for CONDITION_TIME files';
