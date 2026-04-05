import type { Metadata } from 'next';
import dynamic from 'next/dynamic';

const DocsNav = dynamic(() => import('@/components/DocsNav'), { ssr: false });

export const metadata: Metadata = {
  title: 'Docs — ShelShare',
  description: 'Documentation for ShelShare — decentralised file sharing on Shelby Protocol.',
};

function Section({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <section id={id} className="scroll-mt-[96px] mb-14">
      <h2 className="text-txt-primary font-semibold text-[22px] mb-5 pb-3 border-b border-[#1a1a1a]">
        {title}
      </h2>
      <div className="prose-docs">{children}</div>
    </section>
  );
}

function SubSection({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <div id={id} className="scroll-mt-[96px] mb-8">
      <h3 className="text-txt-primary font-semibold text-[16px] mb-3">{title}</h3>
      {children}
    </div>
  );
}

function P({ children }: { children: React.ReactNode }) {
  return <p className="text-txt-muted text-[15px] leading-relaxed mb-4">{children}</p>;
}

function Code({ children }: { children: React.ReactNode }) {
  return (
    <code className="bg-shl-surface border border-[#1a1a1a] text-shelgreen font-mono text-[13px] px-[6px] py-[2px] rounded-[4px]">
      {children}
    </code>
  );
}

function CodeBlock({ children, label }: { children: string; label?: string }) {
  return (
    <div className="mb-4">
      {label && (
        <p className="text-txt-dim text-[11px] font-semibold uppercase tracking-[0.4px] mb-1">{label}</p>
      )}
      <pre className="bg-shl-surface border border-[#1a1a1a] rounded-[8px] px-5 py-4 overflow-x-auto text-[13px] font-mono text-txt-muted leading-relaxed whitespace-pre">
        {children}
      </pre>
    </div>
  );
}

function Callout({ type = 'info', children }: { type?: 'info' | 'warn' | 'tip'; children: React.ReactNode }) {
  const styles = {
    info: 'bg-blue-500/5  border-blue-500/20  text-blue-300',
    warn: 'bg-amber-500/5 border-amber-500/20 text-amber-300',
    tip:  'bg-shelgreen/5 border-shelgreen/20 text-shelgreen',
  };
  const icons = { info: 'i', warn: '!', tip: '→' };
  return (
    <div className={`border rounded-[8px] px-4 py-3 mb-4 flex gap-3 items-start ${styles[type]}`}>
      <span className="text-[14px] mt-[1px] shrink-0">{icons[type]}</span>
      <p className="text-[14px] leading-relaxed">{children}</p>
    </div>
  );
}

function StepList({ steps }: { steps: { n: number; title: string; desc: string }[] }) {
  return (
    <ol className="space-y-4 mb-4">
      {steps.map(({ n, title, desc }) => (
        <li key={n} className="flex gap-4">
          <span className="flex-shrink-0 w-7 h-7 rounded-full bg-shelgreen/10 border border-shelgreen/30 text-shelgreen text-[13px] font-semibold flex items-center justify-center">
            {n}
          </span>
          <div>
            <p className="text-txt-primary text-[14px] font-medium">{title}</p>
            <p className="text-txt-muted text-[13px] leading-relaxed mt-[2px]">{desc}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}

function Table({ headers, rows }: { headers: string[]; rows: string[][] }) {
  return (
    <div className="overflow-x-auto mb-4">
      <table className="w-full text-[13px] border-collapse">
        <thead>
          <tr className="border-b border-[#1a1a1a]">
            {headers.map((h) => (
              <th key={h} className="text-left text-txt-dim font-semibold uppercase tracking-[0.4px] text-[11px] py-2 pr-6">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className="border-b border-[#111]">
              {row.map((cell, j) => (
                <td key={j} className="text-txt-muted py-[10px] pr-6 leading-relaxed align-top">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Badge({ color, children }: { color: string; children: React.ReactNode }) {
  return (
    <span className={`inline-block text-[11px] font-semibold font-mono px-2 py-[2px] rounded-[4px] border ${color}`}>
      {children}
    </span>
  );
}

export default function DocsPage() {
  return (
    <div className="mx-auto max-w-[1100px] px-8 py-[60px]">
      {/* Page header */}
      <div className="mb-12">
        <span className="text-shelgreen text-[13px] font-semibold font-mono">S/ Documentation</span>
        <h1 className="text-txt-primary font-semibold text-[34px] mt-2 mb-3">ShelShare Docs</h1>
        <p className="text-txt-muted text-[16px] max-w-[600px] leading-relaxed">
          Everything you need to know about ShelShare — decentralised file sharing built on
          Shelby Protocol and Aptos.
        </p>
      </div>

      <div className="flex gap-16">
        {/* Sidebar */}
        <DocsNav />

        {/* Content */}
        <div className="flex-1 min-w-0">

          {/* ------------------------------------------------------------------ */}
          <Section id="introduction" title="Introduction">
            <P>
              ShelShare is a decentralised file sharing platform. Files are stored permanently on
              <strong className="text-txt-primary"> Shelby Protocol</strong> — a distributed storage
              network with no central point of failure. Metadata (share links, passwords, expiry) lives
              in Supabase. Neither layer stores your file on a traditional server.
            </P>
            <P>
              Authentication uses the <strong className="text-txt-primary">Petra wallet</strong> (Aptos).
              No email address or password is required — your wallet address is your identity.
            </P>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 my-6">
              {[
                { icon: null, title: 'Decentralised Storage', desc: 'File bytes live on Shelby Protocol nodes, not a cloud bucket.' },
                { icon: null, title: 'Sealed Files', desc: 'Encrypt files with on-chain access conditions — pay, time-lock, or burn.' },
                { icon: null, title: 'Built-in Safety', desc: 'Extension blocklist, magic bytes detection, and SHA-256 hash blocklist.' },
              ].map(({ title, desc }) => (
                <div key={title} className="bg-shl-surface border border-[#1a1a1a] rounded-[10px] p-4">
                  <p className="text-txt-primary font-semibold text-[14px] mb-1">{title}</p>
                  <p className="text-txt-dim text-[13px] leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>

            <Callout type="warn">
              ShelShare is currently running on <strong>Shelby Protocol Testnet</strong>. Files may be
              cleared periodically. Do not use for production data.
            </Callout>
          </Section>

          {/* ------------------------------------------------------------------ */}
          <Section id="getting-started" title="Getting Started">
            <P>
              To upload or manage files you need a Petra wallet connected to the Aptos/Shelby network.
              Visiting share links (<Code>/f/[shortId]</Code>) and downloading files requires no wallet.
            </P>
            <StepList steps={[
              { n: 1, title: 'Install Petra Wallet', desc: 'Download the Petra browser extension from petra.app. Create or import an Aptos wallet.' },
              { n: 2, title: 'Connect on ShelShare', desc: 'Click "Connect Petra" in the top navigation bar. Approve the connection request in the Petra popup.' },
              { n: 3, title: 'Upload a file', desc: 'Drag and drop a file onto the upload zone, or click to browse. Files up to 500 MB are supported.' },
              { n: 4, title: 'Share the link', desc: 'Copy the generated share URL and send it to anyone. No account required to download.' },
            ]} />
            <Callout type="tip">
              You need APT tokens in your wallet to interact with sealed files (pay-to-unlock, time-lock,
              and burn conditions all require submitting an Aptos transaction). The Shelby testnet faucet
              can be used to get test APT.
            </Callout>
          </Section>

          {/* ------------------------------------------------------------------ */}
          <Section id="uploading" title="Uploading Files">
            <P>
              Files are uploaded via the home page or <Code>/upload</Code>. The upload zone accepts
              drag-and-drop or click-to-browse. Progress is shown in real time.
            </P>

            <h3 className="text-txt-primary font-semibold text-[15px] mb-3">Upload options</h3>
            <Table
              headers={['Option', 'Description']}
              rows={[
                ['Password', 'Protect the share link with a password. Recipients must enter it before downloading. Stored as a bcrypt hash — ShelShare never sees the plaintext.'],
                ['Expiry', 'Set the link to expire after 1, 7, 30, or 90 days. After expiry the link returns HTTP 410 Gone.'],
                ['Sealed File', 'Encrypt the file client-side with AES-256-GCM and lock the key on-chain with an access condition. See Sealed Files.'],
              ]}
            />

            <h3 className="text-txt-primary font-semibold text-[15px] mb-3 mt-6">File size &amp; type limits</h3>
            <P>
              The maximum file size is <strong className="text-txt-primary">500 MB</strong>. Executable
              and script file types are blocked regardless of content (see Safety). The following
              categories are always rejected:
            </P>
            <div className="flex flex-wrap gap-2 mb-4">
              {['Windows executables', 'Shell scripts', 'macOS bundles', 'Android/iOS apps', 'Server-side scripts', 'Office macros', 'Linux packages'].map(t => (
                <span key={t} className="bg-red-500/5 border border-red-500/15 text-red-400 text-[12px] px-3 py-[4px] rounded-full">{t}</span>
              ))}
            </div>

            <h3 className="text-txt-primary font-semibold text-[15px] mb-3 mt-6">Rate limits</h3>
            <Table
              headers={['Limit', 'Value']}
              rows={[
                ['Max uploads per wallet per hour', '50 files'],
                ['Max bytes uploaded per wallet per hour', '2 GB'],
                ['Max file size', '500 MB'],
              ]}
            />
          </Section>

          {/* ------------------------------------------------------------------ */}
          <Section id="sharing" title="Sharing">
            <P>
              Every uploaded file gets a unique short URL: <Code>shelshare.forestinfra.com/f/[shortId]</Code>.
              The 10-character short ID is generated server-side using nanoid and is cryptographically random.
            </P>
            <P>
              Share pages are server-rendered and show the filename, size, and (if set) expiry date.
              The actual file bytes are fetched from Shelby Protocol via the download proxy — the page
              itself contains no file data.
            </P>
            <Callout type="info">
              Password-protected files require the password to be entered on the share page before the
              download button appears. The password is sent to <Code>/api/download</Code> as a query
              parameter and verified server-side against the bcrypt hash.
            </Callout>
          </Section>

          {/* ------------------------------------------------------------------ */}
          <Section id="sealed-files" title="Sealed Files">
            <P>
              Sealed Files are ShelShare's flagship feature. When a file is sealed, it is encrypted
              client-side with AES-256-GCM before upload. The AES key is stored on-chain inside a
              Move smart contract on Shelby Protocol, locked behind a condition. The key is only
              released when the condition is met — ShelShare's servers never have access to it.
            </P>

            <div className="bg-shl-surface border border-[#1a1a1a] rounded-[10px] p-5 mb-6">
              <p className="text-txt-dim text-[11px] font-semibold uppercase tracking-[0.4px] mb-4">Sealed file data flow</p>
              <div className="flex flex-col gap-2 text-[13px] font-mono">
                {[
                  ['Client', 'Generate AES-256 key → encrypt file → upload ciphertext to Shelby'],
                  ['Client', 'Call create_seal() on Move contract → lock key + condition on-chain'],
                  ['Recipient', 'Visit share link → connect Petra wallet'],
                  ['Recipient', 'Sign unlock transaction → contract verifies condition'],
                  ['Contract', 'Emit SealUnlockedEvent containing the AES key'],
                  ['Client', 'Read key from tx receipt → decrypt ciphertext → trigger download'],
                ].map(([who, action], i) => (
                  <div key={i} className="flex gap-3 items-start">
                    <span className={`shrink-0 text-[11px] px-2 py-[2px] rounded font-semibold ${
                      who === 'Contract' ? 'bg-amber-500/10 text-amber-400' :
                      who === 'Recipient' ? 'bg-blue-500/10 text-blue-400' :
                      'bg-shelgreen/10 text-shelgreen'
                    }`}>{who}</span>
                    <span className="text-txt-muted leading-relaxed">{action}</span>
                  </div>
                ))}
              </div>
            </div>

            <Callout type="tip">
              Because encryption and decryption happen entirely in the browser, ShelShare cannot
              read sealed files — even with database access. The only way to decrypt is to satisfy
              the on-chain condition.
            </Callout>

            <SubSection id="condition-pay" title="Pay to Unlock">
              <P>
                The uploader sets an APT price. Anyone who wants the file must submit an Aptos
                transaction that transfers exactly that amount of APT to the creator's wallet.
                The Move contract verifies the payment atomically and emits the AES key in the
                same transaction.
              </P>
              <Table
                headers={['Field', 'Description']}
                rows={[
                  ['Price', 'Amount in APT (converted to octas internally — 1 APT = 100,000,000 octas)'],
                  ['Recipient', "Creator's Petra wallet address, set at seal creation time"],
                  ['Reusable', 'Yes — each payer gets the key. Multiple buyers are supported.'],
                ]}
              />
              <Callout type="info">
                The APT transfer and key release happen in a single atomic transaction. There is no
                risk of paying without receiving the key.
              </Callout>
            </SubSection>

            <SubSection id="condition-time" title="Time Lock">
              <P>
                The file becomes available after a specific date and time. Before the unlock
                timestamp, the share page shows a countdown. After it, anyone can claim the key
                by submitting a zero-value unlock transaction.
              </P>
              <Table
                headers={['Field', 'Description']}
                rows={[
                  ['Unlock date', 'Unix timestamp stored on-chain. The contract rejects unlock calls before this time.'],
                  ['Reusable', 'Yes — once the time has passed anyone can call unlock_time() and get the key.'],
                  ['Cost', 'Only the Aptos gas fee (~0.001 APT) — no APT payment to creator.'],
                ]}
              />
            </SubSection>

            <SubSection id="condition-burn" title="Burn (One-Time Claim)">
              <P>
                The most exclusive condition — only the <em>first</em> person to submit an unlock
                transaction receives the key. After that, the seal is marked as claimed and the
                key is permanently inaccessible. The file on Shelby still exists, but it cannot
                be decrypted by anyone.
              </P>
              <Table
                headers={['Field', 'Description']}
                rows={[
                  ['Claimable', 'Once — the first caller gets the key'],
                  ['After claim', 'Share page shows "Already claimed — this file is gone"'],
                  ['Cost', 'Only gas fee'],
                ]}
              />
              <Callout type="warn">
                Burn-condition files cannot be recovered after the first claim. The AES key is
                consumed. Use this condition for one-time secrets, NFT unlockables, or exclusive drops.
              </Callout>
            </SubSection>
          </Section>

          {/* ------------------------------------------------------------------ */}
          <Section id="password" title="Password Protection">
            <P>
              Any file can be protected with a password at upload time. Password-protected files
              show a password input form on the share page instead of a download button.
            </P>
            <P>
              Passwords are hashed with <strong className="text-txt-primary">bcrypt (cost 10)</strong> and
              stored in Supabase. The plaintext password is never stored or logged. When a recipient
              submits the password, it is verified server-side before the download is streamed.
            </P>
            <Callout type="warn">
              Password protection and Sealed Files can be used independently but not combined on
              the same file — sealed files use on-chain access control instead.
            </Callout>
          </Section>

          {/* ------------------------------------------------------------------ */}
          <Section id="expiry" title="Link Expiry">
            <P>
              Upload an optional expiry duration: 1, 7, 30, or 90 days. The exact expiry timestamp
              is calculated at upload time and stored in Supabase.
            </P>
            <P>
              After expiry, the share page shows a "Link Expired" message and the download API
              returns <Badge color="bg-amber-500/10 border-amber-500/20 text-amber-400">410 Gone</Badge>.
              The file record is soft-deleted (the <Code>deleted_at</Code> column is set) — file bytes
              on Shelby are not automatically removed on testnet.
            </P>
          </Section>

          {/* ------------------------------------------------------------------ */}
          <Section id="safety" title="Safety & Content Policy">
            <P>
              ShelShare runs a multi-layer safety check on every upload before bytes reach
              Shelby Protocol. If any check fails the upload is rejected with HTTP 422.
            </P>

            <Table
              headers={['Layer', 'What it checks', 'Limit']}
              rows={[
                ['1 — File size', 'Rejects empty files and files over the size ceiling', '500 MB max'],
                ['2 — Extension blocklist', 'Rejects 50+ dangerous extension types', 'exe, dll, sh, php, jar, apk, dmg, …'],
                ['3 — Magic bytes', 'Reads the first 16 bytes to detect disguised executables regardless of extension', 'PE/EXE, ELF, Mach-O, JAR, shebang, RAR, 7-Zip, MSI, Python bytecode'],
                ['4 — SHA-256 blocklist', 'Computes the hash of every file and checks it against the curated blocklist table', 'Add hashes via Supabase → blocklist'],
                ['5 — Rate limiting', 'Limits uploads per wallet per hour to prevent abuse', '50 files / 2 GB per hour'],
              ]}
            />

            <h3 className="text-txt-primary font-semibold text-[15px] mb-3 mt-6">Reporting content</h3>
            <P>
              Every share page has a "Report" link at the bottom. Clicking it opens a report modal
              where anyone can flag content as DMCA, malware, illegal, spam, or other. Reports are
              stored in the <Code>reports</Code> Supabase table with <Code>status = pending</Code>.
            </P>

            <h3 className="text-txt-primary font-semibold text-[15px] mb-3 mt-6">Actioning a report</h3>
            <StepList steps={[
              { n: 1, title: 'Review the report', desc: 'Go to Supabase → Table Editor → reports. Locate the report and review the description.' },
              { n: 2, title: 'Add to blocklist', desc: 'Insert the file\'s sha256 and/or shelby_address into the blocklist table with a reason.' },
              { n: 3, title: 'Mark report resolved', desc: 'Set the report\'s status to "actioned" and resolved_at to now().' },
            ]} />
            <Callout type="info">
              Once a hash or Shelby address is in the blocklist, the download route returns HTTP 451
              (Unavailable For Legal Reasons) for that file instantly — no redeploy needed.
            </Callout>
          </Section>

          {/* ------------------------------------------------------------------ */}
          <Section id="architecture" title="Architecture">
            <P>
              ShelShare uses a deliberate separation of concerns: file bytes and file metadata
              are stored in different systems, and access control is handled on-chain.
            </P>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              {[
                { name: 'Shelby Protocol', color: 'border-shelgreen/30 bg-shelgreen/5', badge: 'text-shelgreen', desc: 'Stores actual file bytes. Files are content-addressed and stored on Shelby Protocol\'s network. ShelShare uploads via the Shelby SDK and downloads via the same adapter.' },
                { name: 'Supabase (Postgres)', color: 'border-blue-500/30 bg-blue-500/5', badge: 'text-blue-400', desc: 'Stores metadata only: short_id → shelbyAddress mapping, passwords (bcrypt), expiry, download counts, sealed file condition parameters, reports, and blocklist.' },
                { name: 'Move Contract', color: 'border-amber-500/30 bg-amber-500/5', badge: 'text-amber-400', desc: 'Deployed on Shelby Protocol (Aptos-compatible). Holds AES keys for sealed files behind verifiable on-chain conditions. Key is released atomically with condition satisfaction.' },
                { name: 'Client (Browser)', color: 'border-purple-500/30 bg-purple-500/5', badge: 'text-purple-400', desc: 'All encryption and decryption happens here using the Web Crypto API (AES-256-GCM). Wallet signing (Petra) happens here. The server never sees plaintext sealed-file content.' },
              ].map(({ name, color, badge, desc }) => (
                <div key={name} className={`border rounded-[10px] p-4 ${color}`}>
                  <p className={`font-semibold text-[14px] mb-2 ${badge}`}>{name}</p>
                  <p className="text-txt-muted text-[13px] leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>

            <h3 className="text-txt-primary font-semibold text-[15px] mb-3">Move contract</h3>
            <P>
              The sealed files contract is deployed on Shelby Protocol testnet:
            </P>
            <CodeBlock label="Contract address">
{`0xad132d7bd18c6370f756e0edc3408696f007fe43b987f027e6f9bc866ab3a283::sealed_files`}
            </CodeBlock>
            <Table
              headers={['Condition', 'Constant', 'Entry Function']}
              rows={[
                ['Pay to Unlock', 'CONDITION_PAY = 1', 'unlock_pay(short_id)'],
                ['Time Lock', 'CONDITION_TIME = 2', 'unlock_time(short_id)'],
                ['Burn (One-Time)', 'CONDITION_BURN = 3', 'unlock_burn(short_id)'],
              ]}
            />

            <h3 className="text-txt-primary font-semibold text-[15px] mb-3 mt-6">Encryption wire format</h3>
            <P>
              Sealed files use AES-256-GCM. The encrypted payload uploaded to Shelby is:
            </P>
            <CodeBlock>
{`[ 12 bytes: IV ] [ N bytes: GCM ciphertext + 16-byte auth tag ]`}
            </CodeBlock>
            <P>
              The IV is randomly generated per file using <Code>crypto.getRandomValues()</Code>.
              The AES key is 256 bits (32 bytes), exported as raw bytes and stored in the Move contract.
            </P>
          </Section>

          {/* ------------------------------------------------------------------ */}
          <Section id="api" title="API Reference">
            <P>
              All API routes are Next.js Route Handlers under <Code>/app/api/</Code>. Authentication
              uses the <Code>X-Wallet-Address</Code> header (set automatically by the Petra client hook).
            </P>

            <SubSection id="api-upload" title="POST /api/upload">
              <P>Uploads a file to Shelby Protocol and writes metadata to Supabase.</P>
              <Table
                headers={['Header', 'Required', 'Description']}
                rows={[
                  ['X-Wallet-Address', 'Yes', 'Aptos wallet address of the uploader'],
                  ['Content-Type', 'Yes', 'multipart/form-data'],
                ]}
              />
              <Table
                headers={['Form field', 'Type', 'Description']}
                rows={[
                  ['file', 'File', 'The file to upload (max 500 MB)'],
                  ['password', 'string?', 'Optional password to protect the link'],
                  ['expiryDays', 'string?', 'Optional expiry in days (1, 7, 30, 90)'],
                  ['isSealed', 'string?', '"true" if this is a sealed (encrypted) file'],
                  ['conditionType', 'string?', '1 = Pay, 2 = Time, 3 = Burn'],
                  ['priceOctas', 'string?', 'APT price in octas for CONDITION_PAY'],
                  ['unlockTimestamp', 'string?', 'Unix timestamp (seconds) for CONDITION_TIME'],
                ]}
              />
              <CodeBlock label="Response (200)">
{`{
  "shortId":      "abc1234xyz",
  "shareUrl":     "https://shelshare.forestinfra.com/f/abc1234xyz",
  "shelbyAddress":"shelby://0x.../filename.pdf",
  "filename":     "filename.pdf",
  "size":         1048576
}`}
              </CodeBlock>
            </SubSection>

            <SubSection id="api-download" title="GET /api/download/[shortId]">
              <P>Resolves a short ID, checks blocklist/expiry/password, and streams the file from Shelby.</P>
              <Table
                headers={['Query param', 'Required', 'Description']}
                rows={[
                  ['password', 'Conditional', 'Required if the file is password-protected'],
                ]}
              />
              <Table
                headers={['Status', 'Meaning']}
                rows={[
                  ['200', 'File streamed successfully'],
                  ['403', 'Password missing or incorrect'],
                  ['404', 'File not found or deleted'],
                  ['410', 'Link has expired'],
                  ['451', 'File removed (blocklist match — legal/DMCA)'],
                  ['500', 'Internal error (Shelby unreachable, etc.)'],
                ]}
              />
            </SubSection>

            <SubSection id="api-files" title="GET /api/files">
              <P>Returns the authenticated wallet's uploaded files.</P>
              <Table
                headers={['Header', 'Required', 'Description']}
                rows={[
                  ['X-Wallet-Address', 'Yes', 'Aptos wallet address'],
                ]}
              />
            </SubSection>

            <SubSection id="api-delete" title="POST /api/files/[id]/delete">
              <P>Soft-deletes a file record (sets <Code>deleted_at</Code>). Owner only.</P>
              <Table
                headers={['Header', 'Required', 'Description']}
                rows={[
                  ['X-Wallet-Address', 'Yes', 'Must match the file owner'],
                ]}
              />
            </SubSection>

            <SubSection id="api-report" title="POST /api/report">
              <P>Submits an abuse or DMCA report. No authentication required.</P>
              <CodeBlock label="Request body (JSON)">
{`{
  "shortId":       "abc1234xyz",
  "reportType":    "dmca",        // dmca | malware | illegal | spam | other
  "description":   "...",
  "reporterEmail": "you@example.com"  // optional
}`}
              </CodeBlock>
            </SubSection>
          </Section>

          {/* ------------------------------------------------------------------ */}
          <Section id="self-hosting" title="Self-Hosting">
            <P>
              ShelShare is a standard Next.js 14 application. You can deploy it to Vercel, Netlify,
              or any Node.js host.
            </P>

            <h3 className="text-txt-primary font-semibold text-[15px] mb-3">Environment variables</h3>
            <CodeBlock label=".env.local">
{`# Supabase — metadata index (file bytes go to Shelby, not here)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# Shelby Protocol — decentralised file storage
SHELBY_MOCK=false               # set to true for local dev without real Shelby
SHELBY_NETWORK=shelbynet
SHELBY_API_KEY=your-api-key
SHELBY_ACCOUNT_PRIVATE_KEY=ed25519-priv-0x...

# App
NEXT_PUBLIC_BASE_URL=https://your-domain.com`}
            </CodeBlock>

            <Callout type="warn">
              Never set env vars using shell heredocs (<Code>{'<<<'}</Code>) — they append a trailing
              newline that breaks string comparisons. Use <Code>printf</Code> or set values directly in
              your hosting dashboard.
            </Callout>

            <h3 className="text-txt-primary font-semibold text-[15px] mb-3 mt-6">Supabase setup</h3>
            <P>
              Run the migration files in order in the Supabase SQL Editor:
            </P>
            <CodeBlock>
{`supabase/migrations/001_initial.sql    — users + files tables
supabase/migrations/002_petra_auth.sql  — wallet_address auth
supabase/migrations/003_sealed.sql      — sealed file columns
supabase/migrations/004_safety.sql      — reports + blocklist + sha256`}
            </CodeBlock>

            <h3 className="text-txt-primary font-semibold text-[15px] mb-3 mt-6">Vercel-specific config</h3>
            <P>
              Shelby Protocol uses a WebAssembly binary (<Code>clay.wasm</Code>) that Vercel's file
              tracer doesn't auto-detect. <Code>next.config.js</Code> includes
              <Code> outputFileTracingIncludes</Code> to bundle it with the upload and download
              serverless functions automatically.
            </P>

            <h3 className="text-txt-primary font-semibold text-[15px] mb-3 mt-6">Move contract</h3>
            <P>
              The sealed files contract is already deployed on Shelby Protocol testnet. For a
              production deployment you would deploy your own instance using the Move source in
              <Code> contracts/sealed/sources/sealed.move</Code> and update the contract address
              constant in <Code>lib/sealed.ts</Code>.
            </P>
          </Section>

        </div>
      </div>
    </div>
  );
}
