'use client';

/**
 * Dashboard — authenticated file manager.
 * Fetches the user's files from /api/files using the Petra wallet address.
 */

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import FileList from '@/components/FileList';
import StorageInfo from '@/components/StorageInfo';
import { usePetra } from '@/lib/petra';

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

interface DashboardData {
  files: FileRecord[];
  storageUsedBytes: number;
}

export default function DashboardPage() {
  const { address } = usePetra();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  const authHeaders = useCallback((): HeadersInit => {
    return address ? { 'X-Wallet-Address': address } : {};
  }, [address]);

  const fetchDashboard = useCallback(async () => {
    if (!address) return;
    setLoading(true);
    try {
      const res = await fetch('/api/files', { headers: authHeaders() });
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch (err) {
      console.error('Failed to load dashboard:', err);
    } finally {
      setLoading(false);
    }
  }, [address, authHeaders]);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  const handleDelete = async (fileId: string) => {
    try {
      const res = await fetch(`/api/files/${fileId}/delete`, {
        method: 'POST',
        headers: authHeaders(),
      });
      if (res.ok) fetchDashboard();
    } catch (err) {
      console.error('Failed to delete file:', err);
    }
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-[720px] px-8 py-[60px]">
        <div className="space-y-4">
          <div className="h-7 bg-shl-card rounded w-40 animate-pulse" />
          <div className="grid grid-cols-2 gap-4">
            <div className="h-[100px] bg-shl-card rounded-[10px] animate-pulse" />
            <div className="h-[100px] bg-shl-card rounded-[10px] animate-pulse" />
          </div>
          <div className="h-[200px] bg-shl-card rounded-[12px] animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[720px] px-8 py-[60px]">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-txt-primary font-bold text-[24px] tracking-[-0.5px]">
            Dashboard
          </h1>
          <p className="text-txt-muted text-[14px] mt-1">
            Your files on Shelby Protocol
          </p>
        </div>
        <Link
          href="/upload"
          className="bg-shelgreen text-[#050505] font-semibold text-[14px] px-4 py-[10px] rounded-[6px] hover:bg-shelgreen-dark hover:-translate-y-[1px] transition-all duration-150"
        >
          Upload File
        </Link>
      </div>

      {/* Storage Info */}
      <div className="mb-6">
        <StorageInfo
          storageUsedBytes={data?.storageUsedBytes || 0}
          fileCount={data?.files.length || 0}
        />
      </div>

      {/* File List */}
      <FileList files={data?.files || []} onDelete={handleDelete} />
    </div>
  );
}
