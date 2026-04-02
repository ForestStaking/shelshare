import LandingCTA from '@/components/LandingCTA';

/**
 * Landing page — marketing/hero.
 * Upload lives at /upload (requires wallet connection).
 */
export default function HomePage() {
  return (
    <div className="relative">
      {/* Hero glow */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[500px] pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse at center, rgba(139, 197, 63, 0.07) 0%, transparent 70%)',
        }}
      />

      {/* Hero */}
      <div className="relative mx-auto max-w-[860px] px-8 pt-[80px] pb-[60px] text-center">
        <h1 className="text-[60px] font-extrabold text-txt-primary tracking-[-2px] leading-[1.05] mb-6">
          Share files with
          <br />
          <span className="font-serif italic font-normal text-shelgreen">
            on-chain access control.
          </span>
        </h1>

        <p className="text-txt-muted text-[17px] max-w-[540px] mx-auto leading-relaxed mb-10">
          Upload to Shelby Protocol. Encrypt with AES-256. Lock the key behind
          a Move smart contract — pay to unlock, time-released, or one-time burn.
          Your files, your rules.
        </p>

        <LandingCTA />
      </div>

      {/* Built With logos */}
      <div className="border-t border-[#1a1a1a]">
        <div className="mx-auto max-w-[1100px] px-8 py-[36px] text-center">
          <p className="text-txt-muted text-[14px] font-semibold mb-8 opacity-70">
            Built With
          </p>
          <div className="flex justify-center items-start gap-16 flex-wrap">
            {/* Shelby */}
            <div className="flex flex-col items-center gap-[10px]">
              <div className="h-[55px] flex items-center justify-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/shelby-logo.svg"
                  alt="Shelby"
                  style={{ height: 44, objectFit: 'contain', filter: 'brightness(2)' }}
                />
              </div>
              <span className="text-[11px] font-normal text-txt-muted opacity-70">
                Decentralised Hot Storage
              </span>
            </div>

            {/* Aptos */}
            <div className="flex flex-col items-center gap-[10px]">
              <div className="h-[55px] flex items-center justify-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/aptos-logo.png"
                  alt="Aptos"
                  style={{ height: 44, objectFit: 'contain', filter: 'invert(1) brightness(1.5)' }}
                />
              </div>
              <span className="text-[11px] font-normal text-txt-muted opacity-70">
                Layer 1 Blockchain
              </span>
            </div>

            {/* Forest */}
            <div className="flex flex-col items-center gap-[10px]">
              <div className="h-[55px] flex items-center justify-center gap-[3px]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/forest-icon.png"
                  alt="Forest"
                  style={{ height: 44, objectFit: 'contain' }}
                />
                <span className="text-[3rem] font-bold text-white leading-none">
                  Forest
                </span>
              </div>
              <span className="text-[11px] font-normal text-txt-muted opacity-70">
                Infrastructure
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Sealed Files feature spotlight */}
      <div className="relative border-t border-[#1a1a1a] bg-[#070707]">
        <div className="mx-auto max-w-[1100px] px-8 py-[80px]">
          <div className="flex flex-col md:flex-row gap-12 items-center">

            {/* Left — copy */}
            <div className="flex-1">
              <span className="inline-block text-shelgreen text-[11px] font-semibold font-mono uppercase tracking-[0.6px] mb-4">
                Sealed Files
              </span>
              <h2 className="text-txt-primary font-bold text-[30px] tracking-[-0.8px] leading-[1.2] mb-5">
                Encrypt once.<br />Unlock on your terms.
              </h2>
              <p className="text-txt-muted text-[15px] leading-relaxed mb-6">
                Files are encrypted with AES-256-GCM in the browser before they
                ever leave your machine. The decryption key is stored inside a Move
                smart contract on Shelby Protocol — released only when your chosen
                condition is satisfied on-chain.
              </p>
              <p className="text-txt-dim text-[14px] leading-relaxed">
                ShelShare's servers never see plaintext content. Even with full
                database access, encrypted files cannot be read without the
                on-chain key.
              </p>
            </div>

            {/* Right — condition cards */}
            <div className="flex-1 grid grid-cols-1 gap-3 w-full max-w-[380px]">
              {[
                {
                  icon: '💸',
                  label: 'Pay to Unlock',
                  color: 'border-amber-500/20 bg-amber-500/5',
                  badge: 'text-amber-400',
                  desc: 'Set an APT price. The smart contract transfers payment to you atomically with the key release — no trust required.',
                },
                {
                  icon: '⏱',
                  label: 'Time Lock',
                  color: 'border-blue-500/20 bg-blue-500/5',
                  badge: 'text-blue-400',
                  desc: 'Schedule a future date. The file is unreadable until the block timestamp passes — enforced on-chain, not by ShelShare.',
                },
                {
                  icon: '🔥',
                  label: 'Burn — One-Time',
                  color: 'border-orange-500/20 bg-orange-500/5',
                  badge: 'text-orange-400',
                  desc: 'First person to claim gets the key. After that it\'s gone forever. Perfect for exclusive drops and one-time secrets.',
                },
              ].map(({ icon, label, color, badge, desc }) => (
                <div key={label} className={`border rounded-[10px] p-4 ${color}`}>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-[16px]">{icon}</span>
                    <span className={`font-semibold text-[14px] ${badge}`}>{label}</span>
                  </div>
                  <p className="text-txt-dim text-[13px] leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* How it works */}
      <div className="relative border-t border-[#1a1a1a]">
        <div className="mx-auto max-w-[1100px] px-8 py-[80px]">
          <p className="text-txt-dim text-[12px] font-semibold uppercase tracking-[0.8px] mb-10 text-center">
            How it works
          </p>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
            {[
              {
                step: '01',
                title: 'Connect',
                desc: 'Sign in with your Petra wallet. No email. No password. Your wallet address is your identity.',
              },
              {
                step: '02',
                title: 'Upload',
                desc: 'Drop your file. Bytes go to Shelby Protocol — no central server touches them. Up to 500 MB.',
              },
              {
                step: '03',
                title: 'Seal (optional)',
                desc: 'Encrypt the file client-side and choose an unlock condition — pay, time-lock, or one-time burn.',
              },
              {
                step: '04',
                title: 'Share',
                desc: 'Send the link. Recipients connect Petra, satisfy the condition on-chain, and decrypt locally.',
              },
            ].map((item) => (
              <div
                key={item.step}
                className="bg-shl-card border border-[#1a1a1a] rounded-[12px] p-7 hover:border-shelgreen/30 hover:shadow-[0_8px_32px_rgba(139,197,63,0.06)] transition-all duration-200"
              >
                <span className="text-shelgreen font-mono text-[13px] font-semibold">
                  {item.step}
                </span>
                <h3 className="text-txt-primary font-semibold text-[16px] mt-3 mb-2">
                  {item.title}
                </h3>
                <p className="text-txt-muted text-[14px] leading-relaxed">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Feature grid */}
      <div className="border-t border-[#1a1a1a] bg-[#070707]">
        <div className="mx-auto max-w-[1100px] px-8 py-[80px]">
          <p className="text-txt-dim text-[12px] font-semibold uppercase tracking-[0.8px] mb-10 text-center">
            Everything included
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
            {[
              {
                icon: '⛓',
                title: 'Decentralised Storage',
                desc: 'Files live on Shelby Protocol nodes — no AWS, no GCP, no single point of failure or takedown.',
              },
              {
                icon: '🔒',
                title: 'Client-Side Encryption',
                desc: 'AES-256-GCM in the browser. Plaintext never leaves your device. Sealed files are unreadable server-side.',
              },
              {
                icon: '🧾',
                title: 'On-Chain Access Control',
                desc: 'Move smart contract on Shelby Protocol manages keys. Conditions are verifiable and tamper-proof.',
              },
              {
                icon: '🔑',
                title: 'Password Protection',
                desc: 'Protect any link with a password. Stored as a bcrypt hash — ShelShare never sees the plaintext.',
              },
              {
                icon: '⏳',
                title: 'Link Expiry',
                desc: 'Set links to expire after 1, 7, 30, or 90 days. Expired links return 410 Gone automatically.',
              },
              {
                icon: '🛡',
                title: 'Built-in Safety',
                desc: 'Extension blocklist, magic-bytes detection, SHA-256 hash blocklist, and per-wallet rate limiting on every upload.',
              },
            ].map(({ icon, title, desc }) => (
              <div
                key={title}
                className="bg-shl-card border border-[#1a1a1a] rounded-[12px] p-6 hover:border-[#2a2a2a] transition-all duration-150"
              >
                <div className="text-[26px] mb-3">{icon}</div>
                <h3 className="text-txt-primary font-semibold text-[15px] mb-2">{title}</h3>
                <p className="text-txt-dim text-[13px] leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Trust signals */}
      <div className="border-t border-[#1a1a1a]">
        <div className="mx-auto max-w-[1100px] px-8 py-[80px]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

            <div className="bg-shl-card border border-[#1a1a1a] rounded-[12px] p-8">
              <p className="text-txt-dim text-[11px] font-semibold uppercase tracking-[0.6px] mb-4">
                Storage Layer
              </p>
              <h3 className="text-txt-primary font-bold text-[20px] mb-2 tracking-[-0.4px]">
                Shelby Protocol
              </h3>
              <p className="text-txt-muted text-[14px] leading-relaxed">
                Decentralised hot storage built on Aptos. Files are replicated across
                Forest Infra Cavalier nodes — no central authority, no entity that can
                unilaterally remove content.
              </p>
            </div>

            <div className="bg-shl-card border border-[#1a1a1a] rounded-[12px] p-8">
              <p className="text-txt-dim text-[11px] font-semibold uppercase tracking-[0.6px] mb-4">
                Access Control Layer
              </p>
              <h3 className="text-txt-primary font-bold text-[20px] mb-2 tracking-[-0.4px]">
                Move Smart Contract
              </h3>
              <p className="text-txt-muted text-[14px] leading-relaxed">
                The <code className="text-shelgreen font-mono text-[13px]">sealed_files</code> contract
                is deployed on Shelby Protocol testnet. It stores AES keys, verifies conditions,
                and emits unlock events — all atomically and on-chain.
              </p>
            </div>

          </div>
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="border-t border-[#1a1a1a]">
        <div className="mx-auto max-w-[860px] px-8 py-[100px] text-center">
          <h2 className="text-[36px] font-bold text-txt-primary tracking-[-1px] mb-4">
            Ready to seal your first file?
          </h2>
          <p className="text-txt-muted text-[15px] mb-8 max-w-[460px] mx-auto leading-relaxed">
            Connect Petra, upload a file, and choose an unlock condition.
            The whole flow takes under a minute.
          </p>
          <LandingCTA />
        </div>
      </div>
    </div>
  );
}
