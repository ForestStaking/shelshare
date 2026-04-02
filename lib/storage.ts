/**
 * Storage Abstraction Layer for ShelShare
 *
 * Shelby Protocol stores the actual file bytes on its decentralised hot storage layer.
 * This module provides a clean interface over the Shelby SDK, with a mock adapter
 * for local development without a live Shelby node.
 *
 * Toggle between real and mock via SHELBY_MOCK=true|false env var.
 *
 * Implementation pattern taken from Forest Infra's ShelPin codebase.
 */

import { createHash } from 'crypto';

// ---------------------------------------------------------------------------
// Interface
// ---------------------------------------------------------------------------

export interface UploadResult {
  shelbyAddress: string;
  shelbyProof: string;
}

export interface StorageAdapter {
  upload(buffer: Buffer, filename: string): Promise<UploadResult>;
  download(shelbyAddress: string): Promise<Buffer>;
  unpin(shelbyAddress: string): Promise<void>;
}

// ---------------------------------------------------------------------------
// Shelby Address Parser
// ---------------------------------------------------------------------------

/**
 * Parse a shelbyAddress into its component parts.
 * Format: shelby://{accountAddress}/{blobName}
 */
export function parseShelbyAddress(address: string): {
  accountAddress: string;
  blobName: string;
} {
  const stripped = address.replace('shelby://', '');
  const slashIndex = stripped.indexOf('/');
  if (slashIndex === -1) {
    throw new Error(`Invalid shelbyAddress format: ${address}`);
  }
  return {
    accountAddress: stripped.substring(0, slashIndex),
    blobName: stripped.substring(slashIndex + 1),
  };
}

// ---------------------------------------------------------------------------
// ShelbyAdapter — Real implementation using @shelby-protocol/sdk
// ---------------------------------------------------------------------------

const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

class ShelbyAdapter implements StorageAdapter {
  private client: any;
  private account: any;
  private initialised = false;

  private async init() {
    if (this.initialised) return;

    // Dynamic imports — these packages may not be installed in dev/mock mode.
    // webpackIgnore prevents webpack from trying to resolve these at build time.
    const { Network, Ed25519Account, Ed25519PrivateKey } = await import(
      /* webpackIgnore: true */ '@aptos-labs/ts-sdk'
    );
    const { ShelbyNodeClient } = await import(
      /* webpackIgnore: true */ '@shelby-protocol/sdk/node'
    );

    const network =
      process.env.SHELBY_NETWORK === 'testnet'
        ? Network.TESTNET
        : Network.SHELBYNET;

    this.client = new ShelbyNodeClient({
      network,
      apiKey: process.env.SHELBY_API_KEY,
    });

    if (!process.env.SHELBY_ACCOUNT_PRIVATE_KEY) {
      throw new Error(
        'SHELBY_ACCOUNT_PRIVATE_KEY is required when SHELBY_MOCK=false'
      );
    }

    this.account = new Ed25519Account({
      privateKey: new Ed25519PrivateKey(
        process.env.SHELBY_ACCOUNT_PRIVATE_KEY
      ),
    });

    this.initialised = true;
  }

  async upload(buffer: Buffer, filename: string): Promise<UploadResult> {
    await this.init();

    await this.client.upload({
      signer: this.account,
      blobData: new Uint8Array(buffer),
      blobName: filename,
      expirationMicros: (Date.now() + THIRTY_DAYS_MS) * 1000,
    });

    // Upload returns void — success means stored.
    // shelbyAddress is constructed from account address + filename.
    const shelbyAddress = `shelby://${this.account.accountAddress.toString()}/${filename}`;

    // On testnet, the address itself is the on-chain proof
    const shelbyProof = shelbyAddress;

    return { shelbyAddress, shelbyProof };
  }

  async download(shelbyAddress: string): Promise<Buffer> {
    await this.init();

    const { accountAddress, blobName } = parseShelbyAddress(shelbyAddress);

    const blob = await this.client.download({
      account: accountAddress,
      blobName,
    });

    // blob.readable is a ReadableStream — collect chunks into Buffer
    const reader = blob.readable.getReader();
    const chunks: Uint8Array[] = [];

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      chunks.push(value);
    }

    return Buffer.concat(chunks);
  }

  async unpin(shelbyAddress: string): Promise<void> {
    // TODO: Unpin is not yet supported by the Shelby SDK.
    // For now, soft delete in Supabase only. This will be implemented
    // once the SDK adds unpin/delete support.
    console.warn(
      `[ShelShare] Unpin not yet supported by Shelby SDK. Address: ${shelbyAddress}`
    );
  }
}

// ---------------------------------------------------------------------------
// MockAdapter — Local development without a live Shelby node
// ---------------------------------------------------------------------------

class MockAdapter implements StorageAdapter {
  async upload(buffer: Buffer, filename: string): Promise<UploadResult> {
    // Generate deterministic mock address from file content
    const hash = createHash('sha256').update(buffer).digest('hex');
    const shelbyAddress = `shelby://${hash}`;

    // Mock proof = hash of address + timestamp
    const proofHash = createHash('sha256')
      .update(shelbyAddress + Date.now().toString())
      .digest('hex');
    const shelbyProof = `shelby://${proofHash}`;

    console.log(
      `[MockAdapter] Uploaded ${filename} → ${shelbyAddress} (${buffer.length} bytes)`
    );

    return { shelbyAddress, shelbyProof };
  }

  async download(_shelbyAddress: string): Promise<Buffer> {
    // Mock mode cannot retrieve real files — throw a clear error
    throw new Error(
      '[MockAdapter] Download not available in mock mode. Set SHELBY_MOCK=false and configure SHELBY_ACCOUNT_PRIVATE_KEY to use real Shelby storage.'
    );
  }

  async unpin(_shelbyAddress: string): Promise<void> {
    // No-op in mock mode
    console.log('[MockAdapter] Unpin called (no-op in mock mode)');
  }
}

// ---------------------------------------------------------------------------
// Factory — singleton based on SHELBY_MOCK env var
// ---------------------------------------------------------------------------

let adapterInstance: StorageAdapter | null = null;

export function getStorageAdapter(): StorageAdapter {
  if (!adapterInstance) {
    const useMock = process.env.SHELBY_MOCK !== 'false';
    adapterInstance = useMock ? new MockAdapter() : new ShelbyAdapter();
    console.log(
      `[ShelShare] Storage adapter: ${useMock ? 'MockAdapter' : 'ShelbyAdapter'}`
    );
  }
  return adapterInstance;
}
