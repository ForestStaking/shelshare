/**
 * Type declarations for Shelby Protocol and Aptos SDK.
 * These packages are dynamically imported at runtime only when SHELBY_MOCK=false.
 * These declarations allow TypeScript to compile without the packages installed.
 */

declare module '@aptos-labs/ts-sdk' {
  export enum Network {
    MAINNET = 'mainnet',
    TESTNET = 'testnet',
    DEVNET = 'devnet',
    SHELBYNET = 'shelbynet',
  }

  export class Ed25519PrivateKey {
    constructor(key: string);
  }

  export class Ed25519Account {
    accountAddress: {
      toString(): string;
    };
    constructor(opts: { privateKey: Ed25519PrivateKey });
  }

  export class Account {
    accountAddress: {
      toString(): string;
    };
  }
}

declare module '@shelby-protocol/sdk/node' {
  export class ShelbyNodeClient {
    constructor(opts: { network: any; apiKey?: string });

    upload(opts: {
      signer: any;
      blobData: Uint8Array;
      blobName: string;
      expirationMicros: number;
    }): Promise<void>;

    download(opts: {
      account: string;
      blobName: string;
      range?: { start: number; end: number };
    }): Promise<{
      readable: ReadableStream<Uint8Array>;
    }>;
  }
}
