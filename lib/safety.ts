/**
 * ShelShare Safety Layer
 *
 * Defends against malware, executables, and illegal file uploads.
 * All checks run server-side in the /api/upload route before bytes
 * reach Shelby Protocol.
 *
 * Layers:
 *   1. File size ceiling
 *   2. Extension blocklist
 *   3. Magic bytes — detect real file type from header bytes
 *   4. SHA-256 hash blocklist
 *   5. Rate limiting per wallet (max uploads per hour via Supabase)
 */

import { createHash } from 'crypto';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

export const MAX_FILE_SIZE_BYTES = 500 * 1024 * 1024; // 500 MB

/** Extensions that are always rejected regardless of content. */
const BLOCKED_EXTENSIONS = new Set([
  // Windows executables & scripts
  'exe', 'dll', 'bat', 'cmd', 'com', 'pif', 'scr', 'cpl', 'msi', 'msc',
  'vbs', 'vbe', 'js', 'jse', 'wsf', 'wsh', 'wsc',
  'ps1', 'ps1xml', 'ps2', 'ps2xml', 'psc1', 'psc2',
  'reg', 'inf', 'lnk', 'url',
  // Unix executables & scripts
  'sh', 'bash', 'zsh', 'fish', 'csh', 'ksh', 'command', 'run',
  // macOS
  'app', 'dmg', 'pkg', 'mpkg', 'action', 'workflow',
  // Java / Android / iOS
  'jar', 'war', 'ear', 'apk', 'ipa', 'xap',
  // Server-side scripts
  'php', 'php3', 'php4', 'php5', 'php7', 'phtml', 'phar',
  'asp', 'aspx', 'cshtml', 'vbhtml',
  'jsp', 'jspx', 'cfm', 'cfc',
  'rb', 'py', 'pl', 'pm', 'lua', 'tcl',
  'htaccess', 'htpasswd',
  // Linux packages / binaries
  'deb', 'rpm', 'elf', 'ko', 'so',
  // Office macros
  'xlsm', 'xlsb', 'docm', 'dotm', 'pptm', 'potm', 'ppam',
]);

/**
 * Magic byte signatures for dangerous/executable formats.
 * Format: { label, bytes: array of expected hex values at offset 0 }
 * A null byte means "any byte" (wildcard).
 */
const DANGEROUS_MAGIC: Array<{ label: string; offset?: number; bytes: (number | null)[] }> = [
  { label: 'Windows executable (PE/EXE/DLL)',  bytes: [0x4D, 0x5A] },
  { label: 'Linux/Unix executable (ELF)',       bytes: [0x7F, 0x45, 0x4C, 0x46] },
  { label: 'macOS executable (Mach-O 64-bit)',  bytes: [0xCF, 0xFA, 0xED, 0xFE] },
  { label: 'macOS executable (Mach-O 32-bit)',  bytes: [0xCE, 0xFA, 0xED, 0xFE] },
  { label: 'macOS fat binary (Universal)',       bytes: [0xCA, 0xFE, 0xBA, 0xBE] },
  { label: 'Java class file',                   bytes: [0xCA, 0xFE, 0xBA, 0xBE] },
  { label: 'Java/Android archive (JAR/APK)',    bytes: [0x50, 0x4B, 0x03, 0x04] },
  { label: 'RAR archive',                       bytes: [0x52, 0x61, 0x72, 0x21, 0x1A, 0x07] },
  { label: '7-Zip archive',                     bytes: [0x37, 0x7A, 0xBC, 0xAF, 0x27, 0x1C] },
  { label: 'Microsoft installer (MSI/CAB)',     bytes: [0xD0, 0xCF, 0x11, 0xE0, 0xA1, 0xB1, 0x1A, 0xE1] },
  { label: 'Python compiled bytecode',          bytes: [0x6F, 0x0D, 0x0D, 0x0A] },
  { label: 'Shebang script (#!/...)',           bytes: [0x23, 0x21] },
];

// ---------------------------------------------------------------------------
// Rate limiting config
// ---------------------------------------------------------------------------

export const RATE_LIMIT = {
  windowMs:  60 * 60 * 1000, // 1 hour
  maxUploads: 50,             // max files per wallet per hour
  maxBytes:   2 * 1024 * 1024 * 1024, // 2 GB per wallet per hour
};

// ---------------------------------------------------------------------------
// In-memory SHA-256 blocklist (seed with known-bad hashes)
// In production, load this from a database or CDN-hosted JSON.
// ---------------------------------------------------------------------------

const BLOCKED_HASHES = new Set<string>([
  // Add known malware hashes here e.g.:
  // 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855', // empty file as demo
]);

// ---------------------------------------------------------------------------
// Result type
// ---------------------------------------------------------------------------

export interface SafetyCheckResult {
  safe:    boolean;
  reason?: string;  // human-readable block reason
  sha256:  string;
}

// ---------------------------------------------------------------------------
// Core check functions
// ---------------------------------------------------------------------------

/** 1. File size */
export function checkFileSize(sizeBytes: number): { ok: boolean; reason?: string } {
  if (sizeBytes === 0) return { ok: false, reason: 'File is empty.' };
  if (sizeBytes > MAX_FILE_SIZE_BYTES) {
    const mb = Math.round(MAX_FILE_SIZE_BYTES / 1024 / 1024);
    return { ok: false, reason: `File exceeds the ${mb} MB limit.` };
  }
  return { ok: true };
}

/** 2. Extension blocklist */
export function checkExtension(filename: string): { ok: boolean; reason?: string } {
  const ext = filename.split('.').pop()?.toLowerCase() ?? '';
  if (BLOCKED_EXTENSIONS.has(ext)) {
    return { ok: false, reason: `File type .${ext} is not allowed.` };
  }
  return { ok: true };
}

/** 3. Magic bytes — check first 16 bytes for executable signatures */
export function checkMagicBytes(buffer: Buffer): { ok: boolean; reason?: string } {
  const header = buffer.slice(0, 16);

  for (const sig of DANGEROUS_MAGIC) {
    const offset = sig.offset ?? 0;
    const match = sig.bytes.every(
      (byte, i) => byte === null || header[offset + i] === byte
    );
    if (match) {
      return { ok: false, reason: `Blocked file format detected: ${sig.label}.` };
    }
  }
  return { ok: true };
}

/** 4. Hash blocklist */
export function computeSha256(buffer: Buffer): string {
  return createHash('sha256').update(buffer).digest('hex');
}

export function checkHashBlocklist(sha256: string): { ok: boolean; reason?: string } {
  if (BLOCKED_HASHES.has(sha256)) {
    return { ok: false, reason: 'This file has been flagged and cannot be shared.' };
  }
  return { ok: true };
}

// ---------------------------------------------------------------------------
// Full inspection — runs all checks in order, returns on first failure
// ---------------------------------------------------------------------------

export function inspectFile(
  buffer: Buffer,
  filename: string
): SafetyCheckResult {
  const sha256 = computeSha256(buffer);

  const sizeCheck = checkFileSize(buffer.length);
  if (!sizeCheck.ok) return { safe: false, reason: sizeCheck.reason, sha256 };

  const extCheck = checkExtension(filename);
  if (!extCheck.ok) return { safe: false, reason: extCheck.reason, sha256 };

  const magicCheck = checkMagicBytes(buffer);
  if (!magicCheck.ok) return { safe: false, reason: magicCheck.reason, sha256 };

  const hashCheck = checkHashBlocklist(sha256);
  if (!hashCheck.ok) return { safe: false, reason: hashCheck.reason, sha256 };

  return { safe: true, sha256 };
}

// ---------------------------------------------------------------------------
// Rate limiting — checked against Supabase uploads table
// ---------------------------------------------------------------------------

/**
 * Returns the number of files and total bytes uploaded by a wallet
 * in the current rate-limit window. Pass the Supabase client.
 */
export async function getRateLimitUsage(
  supabase: any,
  walletAddress: string
): Promise<{ uploadCount: number; totalBytes: number }> {
  const windowStart = new Date(Date.now() - RATE_LIMIT.windowMs).toISOString();

  const { data, error } = await supabase
    .from('files')
    .select('size_bytes')
    .eq('owner_wallet', walletAddress)   // we'll add this via user join
    .gte('created_at', windowStart)
    .is('deleted_at', null);

  if (error || !data) return { uploadCount: 0, totalBytes: 0 };

  return {
    uploadCount: data.length,
    totalBytes: data.reduce((sum: number, f: any) => sum + (f.size_bytes || 0), 0),
  };
}

export function checkRateLimit(
  uploadCount: number,
  totalBytes: number,
  newFileSizeBytes: number
): { ok: boolean; reason?: string } {
  if (uploadCount >= RATE_LIMIT.maxUploads) {
    return { ok: false, reason: `Upload limit reached. You can upload up to ${RATE_LIMIT.maxUploads} files per hour.` };
  }
  if (totalBytes + newFileSizeBytes > RATE_LIMIT.maxBytes) {
    const gb = RATE_LIMIT.maxBytes / 1024 / 1024 / 1024;
    return { ok: false, reason: `You have reached the ${gb} GB per hour upload limit.` };
  }
  return { ok: true };
}
