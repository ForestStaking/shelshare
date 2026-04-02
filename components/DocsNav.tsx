'use client';

/**
 * DocsNav — sticky sidebar table of contents for the /docs page.
 * Highlights the active section as the user scrolls.
 */

import { useEffect, useState } from 'react';

const SECTIONS = [
  { id: 'introduction',      label: 'Introduction' },
  { id: 'getting-started',   label: 'Getting Started' },
  { id: 'uploading',         label: 'Uploading Files' },
  { id: 'sharing',           label: 'Sharing' },
  { id: 'sealed-files',      label: 'Sealed Files' },
  { id: 'condition-pay',     label: '↳ Pay to Unlock' },
  { id: 'condition-time',    label: '↳ Time Lock' },
  { id: 'condition-burn',    label: '↳ Burn (One-Time)' },
  { id: 'password',          label: 'Password Protection' },
  { id: 'expiry',            label: 'Link Expiry' },
  { id: 'safety',            label: 'Safety & Content Policy' },
  { id: 'architecture',      label: 'Architecture' },
  { id: 'api',               label: 'API Reference' },
  { id: 'self-hosting',      label: 'Self-Hosting' },
];

export default function DocsNav() {
  const [active, setActive] = useState('introduction');

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActive(entry.target.id);
          }
        }
      },
      { rootMargin: '-20% 0px -70% 0px' }
    );

    SECTIONS.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <nav className="sticky top-[80px] w-[220px] shrink-0 self-start hidden lg:block">
      <p className="text-txt-dim text-[11px] font-semibold uppercase tracking-[0.5px] mb-3">
        On this page
      </p>
      <ul className="space-y-[2px]">
        {SECTIONS.map(({ id, label }) => {
          const isChild = label.startsWith('↳');
          const isActive = active === id;
          return (
            <li key={id}>
              <a
                href={`#${id}`}
                className={`block text-[13px] py-[5px] transition-all duration-150 border-l-2 ${
                  isChild ? 'pl-5' : 'pl-3'
                } ${
                  isActive
                    ? 'border-shelgreen text-shelgreen font-medium'
                    : 'border-transparent text-txt-dim hover:text-txt-muted hover:border-[#2a2a2a]'
                }`}
              >
                {isChild ? label.replace('↳ ', '') : label}
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
