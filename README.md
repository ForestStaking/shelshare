# ShelShare

**Store it. Share it. No one can take it down.**

ShelShare is a decentralised file-sharing platform built on [Shelby Protocol](https://shelbyprotocol.com), developed by [Forest Infra](https://forestinfra.com). Upload files to Shelby's hot storage layer, generate shareable links, and manage your files via a dashboard.

Part of the Shelby tool suite by Forest Infra, alongside **ShelPin** (pinning API) and **ShelKit** (frontend deployment).

> **Testnet Release** — This is a free testnet release. Files may be cleared periodically. No storage limits are enforced. Pricing and monetisation will be added post-mainnet.

---

## Architecture

### Why Supabase Exists Alongside Shelby

Shelby Protocol stores the actual file bytes on its decentralised hot storage layer. It does not provide a queryable metadata layer. Supabase is used **purely as a lightweight metadata index** to power features Shelby cannot:

| Concern | Owner | What it stores |
|---------|-------|----------------|
| **File bytes** | Shelby Protocol | Raw file data on decentralised storage |
| **Shareable links** | Supabase | `short_id` → `shelbyAddress` mappings |
| **Password protection** | Supabase | bcrypt password hashes |
| **Expiry dates** | Supabase | Timestamps checked at access time |
| **Download counts** | Supabase | Integer counters |
| **User file listings** | Supabase | Dashboard queries |

**Shelby owns the bytes. Supabase owns the metadata.** This is a deliberate architectural decision that will be revisited once Shelby mainnet matures and provides its own queryable metadata layer.

### Storage Abstraction

`lib/storage.ts` defines a `StorageAdapter` interface with two implementations:

- **ShelbyAdapter** — Real implementation using `@shelby-protocol/sdk/node` and `@aptos-labs/ts-sdk`. Uses the exact integration pattern from Forest Infra's ShelPin codebase.
- **MockAdapter** — Development implementation using SHA-256 hashes for mock addresses. Enables full local development without a live Shelby node.

Toggle via `SHELBY_MOCK=true|false`.

---

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS
- **Auth**: Privy (wallet connect — EVM + Aptos — and email magic link)
- **Storage**: Shelby Protocol via `@shelby-protocol/sdk/node`
- **Metadata**: Supabase (Postgres)
- **Deployment**: Vercel

---

## Getting Started

### 1. Install dependencies

```bash
cd shelshare
npm install
```

### 2. Configure environment

```bash
cp .env.local.example .env.local
```

Fill in your Privy app ID, Supabase credentials, and (optionally) Shelby Protocol keys. For local development, `SHELBY_MOCK=true` is the default — no Shelby node required.

### 3. Set up Supabase

Run the migration in `supabase/migrations/001_initial.sql` against your Supabase project to create the `users` and `files` tables.

### 4. Run the dev server

```bash
npm run dev
```

---

## Project Structure

```
app/
  layout.tsx          — Root layout, Privy provider, testnet banner
  page.tsx            — Landing page with upload zone
  login/page.tsx      — Auth entry point
  dashboard/page.tsx  — Authenticated file manager
  f/[shortId]/page.tsx — Public share/download page
  api/
    upload/route.ts         — POST: file → Shelby + Supabase
    download/[shortId]/route.ts — GET: resolve → stream from Shelby
    files/[id]/delete/route.ts  — POST: soft delete

components/
  UploadZone.tsx      — Drag-and-drop with progress
  FileList.tsx        — Dashboard file table
  StorageInfo.tsx     — Storage usage display
  PasswordGate.tsx    — Password prompt for protected links
  NavBar.tsx          — Navigation
  TestnetBanner.tsx   — Testnet warning banner

lib/
  storage.ts          — StorageAdapter interface + implementations
  supabase.ts         — Server/client Supabase helpers
  auth.ts             — Privy server-side token verification
  utils.ts            — nanoid, byte formatting, MIME types

middleware.ts         — Route protection for /dashboard
```

---

## Infrastructure

ShelShare runs on Forest Infra's **Cavalier** node infrastructure, which underpins Shelby Protocol storage. Forest Infra operates validator and storage nodes that provide the decentralised backend for all Shelby tools.

---

## Known Limitations (Testnet)

- **Unpin not supported**: The Shelby SDK does not yet support blob deletion. File "delete" performs a soft delete in Supabase only. Tracked as a TODO.
- **No storage limits**: All uploads are free and unlimited on testnet.
- **Files may be cleared**: Testnet storage is not persistent across protocol upgrades.
- **Mock mode downloads**: When `SHELBY_MOCK=true`, uploads work (with mock addresses) but downloads will fail — set `SHELBY_MOCK=false` with real credentials for full functionality.

---

## License

Proprietary — Forest Infra. All rights reserved.
