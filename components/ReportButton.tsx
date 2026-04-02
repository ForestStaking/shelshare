'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';

const ReportModal = dynamic(() => import('./ReportModal'));

export default function ReportButton({ shortId }: { shortId: string }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="text-txt-dim hover:text-red-400 text-[12px] transition-all duration-150"
      >
        Report
      </button>
      {open && <ReportModal shortId={shortId} onClose={() => setOpen(false)} />}
    </>
  );
}
