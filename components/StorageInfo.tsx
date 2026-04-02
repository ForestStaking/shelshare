'use client';

/**
 * StorageInfo — storage usage stats.
 * Informational only, no limits on testnet.
 */

import { formatBytes } from '@/lib/utils';

interface StorageInfoProps {
  storageUsedBytes: number;
  fileCount: number;
}

export default function StorageInfo({
  storageUsedBytes,
  fileCount,
}: StorageInfoProps) {
  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="bg-shl-card border border-[#1a1a1a] rounded-[10px] p-5">
        <p className="text-txt-dim text-[12px] font-semibold uppercase tracking-[0.4px] mb-2">
          Storage Used
        </p>
        <p className="text-txt-primary font-semibold text-[22px] tracking-[-0.5px]">
          {formatBytes(storageUsedBytes)}
        </p>
        <p className="text-txt-dim text-[12px] mt-1">No limits on testnet</p>
      </div>
      <div className="bg-shl-card border border-[#1a1a1a] rounded-[10px] p-5">
        <p className="text-txt-dim text-[12px] font-semibold uppercase tracking-[0.4px] mb-2">
          Files
        </p>
        <p className="text-txt-primary font-semibold text-[22px] tracking-[-0.5px]">
          {fileCount}
        </p>
        <p className="text-txt-dim text-[12px] mt-1">Active files</p>
      </div>
    </div>
  );
}
