'use client';

/**
 * ReportModal — lets visitors report illegal content, DMCA issues, malware, etc.
 * Calls POST /api/report and shows a confirmation on success.
 */

import { useState } from 'react';

interface Props {
  shortId: string;
  onClose: () => void;
}

const REPORT_TYPES = [
  { value: 'dmca',    label: 'Copyright / DMCA' },
  { value: 'malware', label: 'Malware / Virus' },
  { value: 'illegal', label: 'Illegal Content' },
  { value: 'spam',    label: 'Spam / Phishing' },
  { value: 'other',   label: 'Other' },
] as const;

export default function ReportModal({ shortId, onClose }: Props) {
  const [reportType, setReportType]     = useState<string>('dmca');
  const [description, setDescription]  = useState('');
  const [email, setEmail]               = useState('');
  const [status, setStatus]             = useState<'idle' | 'sending' | 'done' | 'error'>('idle');
  const [errorMsg, setErrorMsg]         = useState('');

  const submit = async () => {
    if (!description.trim()) return;
    setStatus('sending');
    setErrorMsg('');
    try {
      const res = await fetch('/api/report', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({
          shortId,
          reportType,
          description: description.trim(),
          reporterEmail: email.trim() || undefined,
        }),
      });
      if (!res.ok) throw new Error((await res.json()).error ?? 'Failed to send report.');
      setStatus('done');
    } catch (err: any) {
      setStatus('error');
      setErrorMsg(err.message || 'Something went wrong. Please try again.');
    }
  };

  return (
    /* Backdrop */
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#050505]/80 backdrop-blur-[4px] px-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-shl-card border border-[#1a1a1a] rounded-[12px] w-full max-w-[480px] p-7">
        {status === 'done' ? (
          /* Success state */
          <div className="text-center py-4">
            <div className="text-[32px] mb-3 text-shelgreen font-bold">Done</div>
            <h2 className="text-txt-primary font-semibold text-[17px] mb-2">Report submitted</h2>
            <p className="text-txt-muted text-[14px] mb-6">
              Our team will review it shortly. Thank you for keeping ShelShare safe.
            </p>
            <button
              onClick={onClose}
              className="bg-shl-surface border border-[#1a1a1a] text-txt-muted text-[14px] font-medium px-5 py-[10px] rounded-[8px] hover:text-txt-primary transition-all duration-150"
            >
              Close
            </button>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-txt-primary font-semibold text-[16px]">Report this file</h2>
              <button
                onClick={onClose}
                className="text-txt-dim hover:text-txt-muted transition-all duration-150 text-[20px] leading-none"
                aria-label="Close"
              >
                ×
              </button>
            </div>

            {/* Report type */}
            <div className="mb-4">
              <label className="block text-txt-muted text-[12px] font-semibold uppercase tracking-[0.4px] mb-2">
                Reason
              </label>
              <div className="flex flex-wrap gap-2">
                {REPORT_TYPES.map(({ value, label }) => (
                  <button
                    key={value}
                    onClick={() => setReportType(value)}
                    className={`text-[13px] font-medium px-3 py-[6px] rounded-full border transition-all duration-150 ${
                      reportType === value
                        ? 'bg-shelgreen/10 border-shelgreen text-shelgreen'
                        : 'bg-shl-surface border-[#1a1a1a] text-txt-muted hover:border-[#2a2a2a] hover:text-txt-primary'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Description */}
            <div className="mb-4">
              <label className="block text-txt-muted text-[12px] font-semibold uppercase tracking-[0.4px] mb-2">
                Description <span className="text-red-400">*</span>
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe the issue briefly…"
                maxLength={2000}
                rows={4}
                className="w-full bg-shl-surface border border-[#1a1a1a] rounded-[8px] px-4 py-3 text-txt-primary text-[14px] placeholder:text-txt-dim focus:outline-none focus:border-[#2a2a2a] resize-none"
              />
            </div>

            {/* Email (optional) */}
            <div className="mb-5">
              <label className="block text-txt-muted text-[12px] font-semibold uppercase tracking-[0.4px] mb-2">
                Your email <span className="text-txt-dim font-normal normal-case">(optional — for follow-up)</span>
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full bg-shl-surface border border-[#1a1a1a] rounded-[8px] px-4 py-[10px] text-txt-primary text-[14px] placeholder:text-txt-dim focus:outline-none focus:border-[#2a2a2a]"
              />
            </div>

            {/* Error */}
            {status === 'error' && (
              <div className="bg-red-500/5 border border-red-500/20 rounded-[8px] px-4 py-3 mb-4">
                <p className="text-red-400 text-[13px]">{errorMsg}</p>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={submit}
                disabled={!description.trim() || status === 'sending'}
                className="flex-1 bg-red-500/10 border border-red-500/30 text-red-400 font-semibold text-[14px] py-[12px] rounded-[8px] hover:bg-red-500/20 transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {status === 'sending' ? 'Sending…' : 'Submit Report'}
              </button>
              <button
                onClick={onClose}
                className="bg-shl-surface border border-[#1a1a1a] text-txt-muted text-[14px] font-medium px-5 py-[12px] rounded-[8px] hover:text-txt-primary transition-all duration-150"
              >
                Cancel
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
