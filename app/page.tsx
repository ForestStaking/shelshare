import LandingCTA from '@/components/LandingCTA';

/**
 * Landing page — marketing/hero. No upload zone.
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
      <div className="relative mx-auto max-w-[860px] px-8 pt-[120px] pb-[100px] text-center">
        <div className="inline-block mb-7">
          <span className="bg-shl-card border border-[#1a1a1a] text-txt-muted text-[12px] font-semibold uppercase tracking-[0.5px] px-[14px] py-[6px] rounded-full">
            Shelby Protocol Testnet
          </span>
        </div>

        <h1 className="text-[60px] font-extrabold text-txt-primary tracking-[-2px] leading-[1.05] mb-6">
          Store it. Share it.
          <br />
          <span className="font-serif italic font-normal text-shelgreen">
            No one can take it down.
          </span>
        </h1>

        <p className="text-txt-muted text-[17px] max-w-[520px] mx-auto leading-relaxed mb-10">
          Decentralised file sharing built on Shelby Protocol. Upload once,
          share forever. No servers, no takedowns, no middlemen.
        </p>

        <LandingCTA />
      </div>

      {/* Built With logos — mirrors ShelKit front page exactly */}
      <div className="border-t border-[#1a1a1a]">
        <div className="mx-auto max-w-[1100px] px-8 py-[48px] text-center">
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

      {/* How it works */}
      <div className="relative border-t border-[#1a1a1a]">
        <div className="mx-auto max-w-[1100px] px-8 py-[80px]">
          <p className="text-txt-dim text-[12px] font-semibold uppercase tracking-[0.8px] mb-10 text-center">
            How it works
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                step: '01',
                title: 'Connect',
                desc: 'Sign in with your Petra wallet. No email. No password. Your wallet address is your identity.',
              },
              {
                step: '02',
                title: 'Upload',
                desc: 'Drop your file. Bytes go straight to Shelby Protocol\'s hot storage layer — no central server ever touches them.',
              },
              {
                step: '03',
                title: 'Share',
                desc: 'Get a short link instantly. Optionally add a password or expiry. Share with anyone, anywhere.',
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

      {/* Trust signals */}
      <div className="border-t border-[#1a1a1a]">
        <div className="mx-auto max-w-[1100px] px-8 py-[80px]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

            <div className="bg-shl-card border border-[#1a1a1a] rounded-[12px] p-8">
              <p className="text-txt-dim text-[11px] font-semibold uppercase tracking-[0.6px] mb-4">
                Powered by
              </p>
              <h3 className="text-txt-primary font-bold text-[20px] mb-2 tracking-[-0.4px]">
                Shelby Protocol
              </h3>
              <p className="text-txt-muted text-[14px] leading-relaxed">
                Decentralised hot storage built on Aptos. Files are stored across
                Cavalier nodes — no single point of failure, no entity that can
                take content down.
              </p>
            </div>

            <div className="bg-shl-card border border-[#1a1a1a] rounded-[12px] p-8">
              <p className="text-txt-dim text-[11px] font-semibold uppercase tracking-[0.6px] mb-4">
                Built by
              </p>
              <h3 className="text-txt-primary font-bold text-[20px] mb-2 tracking-[-0.4px]">
                Forest
              </h3>
              <p className="text-txt-muted text-[14px] leading-relaxed">
                Infrastructure tooling for the Aptos and Shelby ecosystems.
                ShelShare is a reference implementation demonstrating what you
                can build on Shelby Protocol today.
              </p>
            </div>

          </div>
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="border-t border-[#1a1a1a]">
        <div className="mx-auto max-w-[860px] px-8 py-[100px] text-center">
          <h2 className="text-[36px] font-bold text-txt-primary tracking-[-1px] mb-4">
            Ready to share?
          </h2>
          <p className="text-txt-muted text-[15px] mb-8">
            Connect your Petra wallet and upload your first file in under 30 seconds.
          </p>
          <LandingCTA />
        </div>
      </div>
    </div>
  );
}
