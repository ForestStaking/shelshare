'use client';

/**
 * UploadZone — drag-and-drop + file picker with progress.
 * Styled to match ShelKit's deploy dropzone: dashed border,
 * accent glow on hover, clean result card.
 */

import { useState, useCallback, useRef } from 'react';
import { formatBytes, copyToClipboard } from '@/lib/utils';
import { usePetra } from '@/lib/petra';

interface UploadResult {
  shortId: string;
  shareUrl: string;
  filename: string;
  size: number;
}

export default function UploadZone() {
  const { address, connected } = usePetra();
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<UploadResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [password, setPassword] = useState('');
  const [expiryDays, setExpiryDays] = useState('');

  const handleUpload = useCallback(
    async (file: File) => {
      setUploading(true);
      setProgress(0);
      setResult(null);
      setError(null);

      try {
        const formData = new FormData();
        formData.append('file', file);
        if (password) formData.append('password', password);
        if (expiryDays) formData.append('expiryDays', expiryDays);

        const xhr = new XMLHttpRequest();
        const uploadPromise = new Promise<UploadResult>((resolve, reject) => {
          xhr.upload.addEventListener('progress', (e) => {
            if (e.lengthComputable) {
              setProgress(Math.round((e.loaded / e.total) * 100));
            }
          });
          xhr.addEventListener('load', () => {
            if (xhr.status >= 200 && xhr.status < 300) {
              resolve(JSON.parse(xhr.responseText));
            } else {
              const body = JSON.parse(xhr.responseText);
              reject(new Error(body.error || `Upload failed (${xhr.status})`));
            }
          });
          xhr.addEventListener('error', () => reject(new Error('Network error')));
          xhr.open('POST', '/api/upload');
          if (address) xhr.setRequestHeader('X-Wallet-Address', address);
          xhr.send(formData);
        });

        const uploadResult = await uploadPromise;
        setResult(uploadResult);
        setProgress(100);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Upload failed');
      } finally {
        setUploading(false);
      }
    },
    [password, expiryDays, address]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);
      const file = e.dataTransfer.files[0];
      if (file) handleUpload(file);
    },
    [handleUpload]
  );

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) handleUpload(file);
    },
    [handleUpload]
  );

  const handleCopy = async () => {
    if (!result) return;
    await copyToClipboard(result.shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const reset = () => {
    setResult(null);
    setError(null);
    setProgress(0);
    setPassword('');
    setExpiryDays('');
  };

  return (
    <div className="w-full max-w-[560px] mx-auto">
      {/* Upload Result */}
      {result && (
        <div className="animate-fadeIn bg-shl-card border border-[#1a1a1a] rounded-[12px] p-6">
          <div className="flex items-center gap-2 mb-5">
            <div className="w-[6px] h-[6px] rounded-full bg-success shadow-[0_0_6px_#4ade80]" />
            <p className="text-success text-[13px] font-semibold">
              Stored on Shelby Protocol
            </p>
          </div>

          <p className="text-txt-primary font-medium text-[15px] mb-1">
            {result.filename}
          </p>
          <p className="text-txt-muted text-[13px] mb-5">
            {formatBytes(result.size)}
          </p>

          <div className="flex items-center gap-2">
            <div className="flex-1 bg-shl-surface border border-[#1a1a1a] rounded-[6px] px-3 py-[10px]">
              <p className="text-txt-primary font-mono text-[13px] truncate">
                {result.shareUrl}
              </p>
            </div>
            <button
              onClick={handleCopy}
              className="bg-shelgreen text-[#050505] font-semibold text-[13px] px-4 py-[10px] rounded-[6px] hover:bg-shelgreen-dark transition-all duration-150 whitespace-nowrap"
            >
              {copied ? 'Copied' : 'Copy'}
            </button>
          </div>

          <button
            onClick={reset}
            className="mt-4 text-txt-dim hover:text-txt-muted text-[13px] transition-all duration-150"
          >
            Upload another file
          </button>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="animate-fadeIn bg-error/5 border border-error/20 rounded-[10px] p-5">
          <p className="text-error text-[14px]">{error}</p>
          <button
            onClick={reset}
            className="mt-3 text-txt-dim hover:text-txt-muted text-[13px] transition-all duration-150"
          >
            Try again
          </button>
        </div>
      )}

      {/* Drop Zone */}
      {!result && !error && (
        <>
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragOver(true);
            }}
            onDragLeave={() => setIsDragOver(false)}
            onDrop={handleDrop}
            onClick={() => !uploading && fileInputRef.current?.click()}
            className={`
              relative border-2 border-dashed rounded-[12px] p-14 text-center cursor-pointer
              transition-all duration-200
              ${
                isDragOver
                  ? 'border-shelgreen bg-shl-surface shadow-[0_0_0_4px_rgba(139,197,63,0.3)]'
                  : 'border-[#1a1a1a] hover:border-[#333] bg-shl-card'
              }
              ${uploading ? 'pointer-events-none' : ''}
            `}
          >
            <input
              ref={fileInputRef}
              type="file"
              onChange={handleFileSelect}
              className="hidden"
            />

            {uploading ? (
              <div className="animate-fadeIn">
                <p className="text-txt-primary text-[15px] font-medium mb-5">
                  Uploading to Shelby Protocol...
                </p>
                <div className="w-full max-w-[280px] mx-auto bg-shl-surface rounded-full h-[4px] overflow-hidden">
                  <div
                    className="bg-shelgreen h-full rounded-full shadow-[0_0_8px_rgba(139,197,63,0.4)] transition-all duration-[400ms] ease-out"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <p className="text-txt-muted text-[13px] mt-3 font-mono">
                  {progress}%
                </p>
              </div>
            ) : (
              <div>
                <div className="mb-5">
                  <svg
                    className="w-10 h-10 mx-auto text-txt-dim"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
                    />
                  </svg>
                </div>
                <p className="text-txt-primary text-[15px] font-medium mb-1">
                  Drop a file here, or click to browse
                </p>
                <p className="text-txt-dim text-[13px]">
                  No storage limits on testnet
                </p>
              </div>
            )}
          </div>

          {/* Upload Options */}
          <div className="mt-4 grid grid-cols-2 gap-3">
            <div>
              <label className="block text-txt-dim text-[12px] font-medium mb-[6px] uppercase tracking-[0.4px]">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Optional"
                disabled={uploading}
                className="w-full bg-shl-card border border-[#1a1a1a] rounded-[6px] px-3 py-[10px] text-txt-primary text-[14px] placeholder:text-txt-dim focus:outline-none focus:border-shelgreen transition-all duration-150"
              />
            </div>
            <div>
              <label className="block text-txt-dim text-[12px] font-medium mb-[6px] uppercase tracking-[0.4px]">
                Expires
              </label>
              <select
                value={expiryDays}
                onChange={(e) => setExpiryDays(e.target.value)}
                disabled={uploading}
                className="w-full bg-shl-card border border-[#1a1a1a] rounded-[6px] px-3 py-[10px] text-txt-primary text-[14px] focus:outline-none focus:border-shelgreen transition-all duration-150"
              >
                <option value="">Never</option>
                <option value="1">1 day</option>
                <option value="7">7 days</option>
                <option value="30">30 days</option>
              </select>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
