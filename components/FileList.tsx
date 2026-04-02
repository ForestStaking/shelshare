'use client';

/**
 * FileList — dashboard file list.
 * Styled as cards rather than a table to match ShelKit's dashboard pattern.
 */

import { useState } from 'react';
import { formatBytes, buildShareUrl, copyToClipboard } from '@/lib/utils';

interface FileRecord {
  id: string;
  short_id: string;
  original_filename: string;
  size_bytes: number;
  mime_type: string;
  shelby_address: string;
  expires_at: string | null;
  download_count: number;
  created_at: string;
}

interface FileListProps {
  files: FileRecord[];
  onDelete: (fileId: string) => void;
}

export default function FileList({ files, onDelete }: FileListProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const copyLink = async (shortId: string) => {
    await copyToClipboard(buildShareUrl(shortId));
    setCopiedId(shortId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDelete = (fileId: string) => {
    setDeletingId(fileId);
    onDelete(fileId);
  };

  if (files.length === 0) {
    return (
      <div className="bg-shl-card border border-[#1a1a1a] rounded-[12px] p-14 text-center">
        <p className="text-txt-muted text-[15px] font-medium mb-1">
          No files yet
        </p>
        <p className="text-txt-dim text-[13px]">
          Upload your first file to get started
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {files.map((file) => {
        const isExpired =
          file.expires_at && new Date(file.expires_at) < new Date();

        return (
          <div
            key={file.id}
            className="bg-shl-card border border-[#1a1a1a] rounded-[10px] p-5 hover:border-[#252525] transition-all duration-150"
          >
            <div className="flex items-start justify-between gap-4">
              {/* File info */}
              <div className="flex-1 min-w-0">
                <p className="text-txt-primary font-medium text-[15px] truncate">
                  {file.original_filename}
                </p>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-txt-dim text-[13px]">
                    {formatBytes(file.size_bytes)}
                  </span>
                  <span className="text-[#1a1a1a]">&middot;</span>
                  <span className="text-txt-dim text-[13px]">
                    {new Date(file.created_at).toLocaleDateString()}
                  </span>
                  <span className="text-[#1a1a1a]">&middot;</span>
                  <span className="text-txt-dim text-[13px]">
                    {file.download_count} downloads
                  </span>
                  {isExpired && (
                    <>
                      <span className="text-[#1a1a1a]">&middot;</span>
                      <span className="text-error text-[12px] font-semibold">
                        Expired
                      </span>
                    </>
                  )}
                  {!isExpired && file.expires_at && (
                    <>
                      <span className="text-[#1a1a1a]">&middot;</span>
                      <span className="text-amber-400/60 text-[12px]">
                        Expires{' '}
                        {new Date(file.expires_at).toLocaleDateString()}
                      </span>
                    </>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => copyLink(file.short_id)}
                  className="text-txt-muted hover:text-shelgreen text-[13px] font-medium px-3 py-[6px] rounded-[6px] hover:bg-shl-surface border border-transparent hover:border-[#1a1a1a] transition-all duration-150"
                >
                  {copiedId === file.short_id ? 'Copied' : 'Copy Link'}
                </button>
                <button
                  onClick={() => handleDelete(file.id)}
                  disabled={deletingId === file.id}
                  className="text-txt-dim hover:text-error text-[13px] font-medium px-3 py-[6px] rounded-[6px] hover:bg-error/5 border border-transparent hover:border-error/10 transition-all duration-150 disabled:opacity-40"
                >
                  {deletingId === file.id ? '...' : 'Delete'}
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
