/**
 * Client-side AES-256-GCM encryption — runs entirely in the browser.
 * Uses the Web Crypto API (SubtleCrypto). Never sends plaintext to any server.
 *
 * Wire format for encrypted files:
 *   [12 bytes IV][N bytes AES-GCM ciphertext]
 *
 * The AES key itself is stored in the Sealed Move contract on shelbynet.
 */

// ---------------------------------------------------------------------------
// Key generation & serialisation
// ---------------------------------------------------------------------------

export async function generateAESKey(): Promise<CryptoKey> {
  return crypto.subtle.generateKey({ name: 'AES-GCM', length: 256 }, true, [
    'encrypt',
    'decrypt',
  ]);
}

/** Export a CryptoKey to raw 32-byte Uint8Array for on-chain storage. */
export async function exportKeyBytes(key: CryptoKey): Promise<Uint8Array> {
  const raw = await crypto.subtle.exportKey('raw', key);
  return new Uint8Array(raw);
}

/** Import 32 raw bytes back into a CryptoKey for decryption. */
export async function importKeyBytes(bytes: Uint8Array): Promise<CryptoKey> {
  return crypto.subtle.importKey('raw', bytes.buffer as ArrayBuffer, { name: 'AES-GCM', length: 256 }, false, [
    'decrypt',
  ]);
}

// ---------------------------------------------------------------------------
// Encrypt
// ---------------------------------------------------------------------------

/**
 * Encrypt file bytes. Returns a single Uint8Array with the IV prepended:
 *   [12-byte IV][ciphertext]
 */
export async function encryptFile(
  data: ArrayBuffer,
  key: CryptoKey
): Promise<Uint8Array> {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const ciphertext = await crypto.subtle.encrypt({ name: 'AES-GCM', iv: iv as BufferSource }, key, data);
  const result = new Uint8Array(12 + ciphertext.byteLength);
  result.set(iv, 0);
  result.set(new Uint8Array(ciphertext), 12);
  return result;
}

// ---------------------------------------------------------------------------
// Decrypt
// ---------------------------------------------------------------------------

/**
 * Decrypt a file previously encrypted with encryptFile.
 * Expects [12-byte IV][ciphertext] wire format.
 */
export async function decryptFile(
  encrypted: ArrayBuffer,
  key: CryptoKey
): Promise<ArrayBuffer> {
  const bytes = new Uint8Array(encrypted);
  const iv = bytes.slice(0, 12);
  const ciphertext = bytes.slice(12);
  return crypto.subtle.decrypt({ name: 'AES-GCM', iv: iv as BufferSource }, key, ciphertext.buffer as ArrayBuffer);
}

// ---------------------------------------------------------------------------
// Trigger browser download from decrypted bytes
// ---------------------------------------------------------------------------

export function triggerDownload(data: ArrayBuffer, filename: string, mimeType: string) {
  const blob = new Blob([data], { type: mimeType || 'application/octet-stream' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 10_000);
}
