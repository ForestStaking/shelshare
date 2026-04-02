# ShelShare

**Decentralised file sharing with on-chain access control.**

ShelShare is a production application built on [Shelby Protocol](https://shelby.xyz) and Aptos, developed by [Forest Infra](https://forestinfra.com). Upload files to Shelby's decentralised storage, generate shareable links, and optionally seal them behind cryptographic on-chain conditions — pay to unlock, time-lock, or one-time burn.

Part of the **Shelby Suite** by Forest Infra alongside [ShelPin](https://forestinfra.com/shelby-suite) and [ShelKit](https://forestinfra.com/shelby-suite).

🔗 **Live at [shelshare.forestinfra.com](https://shelshare.forestinfra.com)**

---

## Features

### 🔒 Sealed Files
The flagship feature. Files are encrypted client-side with **AES-256-GCM** before upload. The decryption key is stored in a Move smart contract on Shelby Protocol testnet, locked behind a verifiable on-chain condition:

| Condition | Description |
|-----------|-------------|
| **Pay to Unlock** | Recipient pays an APT amount set by the uploader. Payment and key release happen atomically in one transaction. |
| **Time Lock** | File is unreadable until a specific date/time passes. Enforced by the contract, not by ShelShare. |
| **Burn (One-Time)** | First person to claim gets the key. After that it's gone forever — perfect for exclusive drops. |

ShelShare's servers never see plaintext content. Encryption and decryption happen entirely in the browser via the Web Crypto API.

### ⛓ Decentralised Storage
File bytes are stored on **Shelby Protocol's** network — not AWS, not GCP. No central authority can remove content.

### 🔑 Password Protection
Protect any share link with a password, stored as a bcrypt hash. Server-side verification only — plaintext is never stored or logged.

### ⏳ Link Expiry
Set links to expire after 1, 7, 30, or 90 days. Expired links return `410 Gone`.

### 🛡 Built-in Safety
Multi-layer safety check on every upload:
1. **File size** — 500 MB maximum
2. **Extension blocklist** — 50+ blocked types (exe, dll, sh, php, jar, apk, dmg, etc.)
3. **Magic bytes detection** — detects disguised executables regardless of file extension (PE/EXE, ELF, Mach-O, JAR, shebang, RAR, 7-Zip, MSI, Python bytecode)
4. **SHA-256 blocklist** — hash of every file checked against a curated blocklist
5. **Rate limiting** — 50 uploads / 2 GB per wallet per hour

---

## Architecture

### Storage split

| Concern | Layer | Details |
|---------|-------|---------|
| File bytes | Shelby Protocol | Content-addressed, decentralised storage |
| Metadata (links, passwords, expiry) | Supabase (Postgres) | Lightweight metadata index only |
| Access control (sealed files) | Move smart contract | On-chain, tamper-proof, atomic |
| Encryption / decryption | Browser (Web Crypto API) | Plaintext never leaves the client |

### Sealed Files data flow

```
Client     →  Generate AES-256 key → encrypt file → upload ciphertext to Shelby
Client     →  Call create_seal() on Move contract → lock key + condition on-chain
Recipient  →  Visit share link → connect Petra wallet
Recipient  →  Sign unlock transaction → contract verifies condition
Contract   →  Emit SealUnlockedEvent containing the AES key
Client     →  Read key from tx receipt → decrypt ciphertext → trigger download
```

### Encryption wire format

```
[ 12 bytes: IV ][ N bytes: GCM ciphertext + 16-byte auth tag ]
```

IV is randomly generated per file using `crypto.getRandomValues()`. AES key is 256-bit, exported as raw bytes and stored in the Move contract.

### Move contract

Deployed on Shelby Protocol testnet:

```
0xad132d7bd18c6370f756e0edc3408696f007fe43b987f027e6f9bc866ab3a283::sealed_files
```

| Condition | Entry function |
|-----------|---------------|
| Pay to Unlock | `unlock_pay(short_id)` |
| Time Lock | `unlock_time(short_id)` |
| Burn (One-Time) | `unlock_burn(short_id)` |

Source: [`contracts/sealed/sources/sealed.move`](contracts/sealed/sources/sealed.move)

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14 (App Router) |
| Styling | Tailwind CSS |
| Auth | Petra Wallet (Aptos) |
| File storage | Shelby Protocol (`@shelby-protocol/sdk`) |
| Metadata | Supabase (Postgres) |
| Access control | Move smart contract on Shelby Protocol testnet |
| Client-side crypto | Web Crypto API (AES-256-GCM) |
| Deployment | Vercel |

---

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

```bash
cp .env.local.example .env.local
```

```env
# Supabase — metadata index
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# Shelby Protocol — decentralised file storage
SHELBY_MOCK=false               # true for local dev without a live Shelby node
SHELBY_NETWORK=shelbynet
SHELBY_API_KEY=your-api-key
SHELBY_ACCOUNT_PRIVATE_KEY=ed25519-priv-0x...

# App
NEXT_PUBLIC_BASE_URL=https://your-domain.com
```

> **Important:** Never set env vars using shell heredocs (`<<<`) — they append a trailing newline that breaks string comparisons. Use `printf` or set values directly in your hosting dashboard.

### 3. Set up Supabase

Run migrations in order in the Supabase SQL Editor:

```
supabase/migrations/001_initial.sql     — users + files tables
supabase/migrations/002_petra_auth.sql  — wallet_address auth
supabase/migrations/003_sealed.sql      — sealed file columns
supabase/migrations/004_safety.sql      — reports + blocklist + sha256
```

### 4. Run dev server

```bash
npm run dev
```

---

## Project Structure

```
app/
  page.tsx                          — Landing page
  upload/page.tsx                   — Upload page (wallet required)
  dashboard/page.tsx                — File manager
  docs/page.tsx                     — Documentation
  f/[shortId]/page.tsx              — Public share/download page
  api/
    upload/route.ts                 — POST: safety check → Shelby → Supabase
    download/[shortId]/route.ts     — GET: blocklist → auth → stream from Shelby
    files/route.ts                  — GET: list wallet's files
    files/[id]/delete/route.ts      — POST: soft delete
    report/route.ts                 — POST: abuse/DMCA report

components/
  UploadZone.tsx                    — Drag-and-drop with encryption + sealing flow
  SealToggle.tsx                    — Condition selector UI (Pay / Time / Burn)
  SealedUnlock.tsx                  — Two-step wallet connect + unlock flow
  FileList.tsx                      — Dashboard file table
  NavBar.tsx                        — Navigation with Petra wallet connect
  LandingCTA.tsx                    — Hero CTA button

lib/
  storage.ts                        — StorageAdapter interface + Shelby/Mock impls
  crypto.ts                         — AES-256-GCM encrypt/decrypt (Web Crypto API)
  sealed.ts                         — Move contract interaction + payload builders
  safety.ts                         — inspectFile() + checkRateLimit()
  supabase.ts                       — Server/client Supabase helpers

contracts/
  sealed/sources/sealed.move        — Move smart contract source

scripts/
  deploy-contract.mjs               — Contract deployment script (shelbynet)

supabase/migrations/                — Ordered SQL migrations
```

---

## Vercel Deployment Notes

Shelby Protocol uses a WebAssembly binary (`clay.wasm`) that Vercel's file tracer doesn't auto-detect. `next.config.js` includes `outputFileTracingIncludes` to bundle it with the upload and download serverless functions:

```js
experimental: {
  outputFileTracingIncludes: {
    '/api/upload': ['./node_modules/@shelby-protocol/clay-codes/dist/**'],
    '/api/download/[shortId]': ['./node_modules/@shelby-protocol/clay-codes/dist/**'],
  },
}
```

---

## Content Moderation

- Every share page has a **Report** link. Reports are stored in the `reports` Supabase table.
- To block a file: add its `sha256` or `shelby_address` to the `blocklist` table in Supabase. The download route immediately returns `HTTP 451 Unavailable For Legal Reasons` — no redeploy needed.

---

## Known Limitations (Testnet)

- **Unpin not supported** — Shelby SDK does not yet expose blob deletion. File delete is a soft delete in Supabase only.
- **Testnet storage** — Files may be cleared across protocol upgrades.
- **Mock mode** — `SHELBY_MOCK=true` enables local development without Shelby credentials. Uploads succeed with mock addresses; downloads return a 503.

---

## License

Proprietary — Forest Infra. All rights reserved.
