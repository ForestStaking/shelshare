/**
 * Utility functions for ShelShare
 */

import { nanoid } from 'nanoid';

/**
 * Generate a unique short ID for shareable file links.
 * Uses nanoid with 10 characters — URL-safe, collision-resistant.
 */
export function generateShortId(): string {
  return nanoid(10);
}

/**
 * Format byte count into human-readable string.
 * e.g. 1024 → "1.0 KB", 1048576 → "1.0 MB"
 */
export function formatBytes(bytes: number, decimals = 1): string {
  if (bytes === 0) return '0 B';

  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(decimals))} ${sizes[i]}`;
}

/**
 * Get the base URL for generating share links.
 */
export function getBaseUrl(): string {
  return process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
}

/**
 * Build a shareable link from a short_id.
 */
export function buildShareUrl(shortId: string): string {
  return `${getBaseUrl()}/f/${shortId}`;
}

/**
 * Determine MIME type from filename extension.
 * Falls back to 'application/octet-stream' for unknown types.
 */
export function getMimeType(filename: string): string {
  const ext = filename.split('.').pop()?.toLowerCase();
  const mimeMap: Record<string, string> = {
    // Documents
    pdf: 'application/pdf',
    doc: 'application/msword',
    docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    txt: 'text/plain',
    csv: 'text/csv',
    json: 'application/json',
    xml: 'application/xml',
    // Images
    png: 'image/png',
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    gif: 'image/gif',
    webp: 'image/webp',
    svg: 'image/svg+xml',
    // Audio/Video
    mp3: 'audio/mpeg',
    mp4: 'video/mp4',
    webm: 'video/webm',
    // Archives
    zip: 'application/zip',
    tar: 'application/x-tar',
    gz: 'application/gzip',
    // Code
    js: 'application/javascript',
    ts: 'application/typescript',
    html: 'text/html',
    css: 'text/css',
  };

  return mimeMap[ext || ''] || 'application/octet-stream';
}
