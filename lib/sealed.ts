/**
 * Sealed — contract interaction layer for the shelbynet Move module.
 *
 * Module: 0xad132d7bd18c6370f756e0edc3408696f007fe43b987f027e6f9bc866ab3a283::sealed_files
 *
 * Used client-side only — all calls go through the Petra wallet adapter
 * (signAndSubmitTransaction) so the user signs every state change.
 */

export const SEALED_CONTRACT =
  '0xad132d7bd18c6370f756e0edc3408696f007fe43b987f027e6f9bc866ab3a283';

export const CONDITION_PAY  = 1;
export const CONDITION_TIME = 2;
export const CONDITION_BURN = 3;

export type ConditionType = typeof CONDITION_PAY | typeof CONDITION_TIME | typeof CONDITION_BURN;

export interface SealConfig {
  conditionType: ConditionType;
  priceOctas:      bigint;   // relevant for CONDITION_PAY
  unlockTimestamp: bigint;   // Unix seconds, relevant for CONDITION_TIME
}

// ---------------------------------------------------------------------------
// Build transaction payloads — pass these to signAndSubmitTransaction
// ---------------------------------------------------------------------------

/** Payload to call create_seal after upload. */
export function buildCreateSealPayload(
  shortId: string,
  shelbyAddress: string,
  aesKeyBytes: Uint8Array,
  config: SealConfig
) {
  return {
    data: {
      function: `${SEALED_CONTRACT}::sealed_files::create_seal` as `${string}::${string}::${string}`,
      typeArguments: [] as [],
      functionArguments: [
        shortId,
        shelbyAddress,
        Array.from(aesKeyBytes),          // vector<u8>
        config.conditionType,             // u8
        config.priceOctas.toString(),     // u64 as string
        config.unlockTimestamp.toString(),// u64 as string
      ],
    },
  };
}

/** Payload to unlock a PAY-gated file. Transfers APT automatically. */
export function buildUnlockPayPayload(shortId: string) {
  return {
    data: {
      function: `${SEALED_CONTRACT}::sealed_files::unlock_pay` as `${string}::${string}::${string}`,
      typeArguments: [] as [],
      functionArguments: [shortId],
    },
  };
}

/** Payload to unlock a TIME-gated file (after timestamp has passed). */
export function buildUnlockTimePayload(shortId: string) {
  return {
    data: {
      function: `${SEALED_CONTRACT}::sealed_files::unlock_time` as `${string}::${string}::${string}`,
      typeArguments: [] as [],
      functionArguments: [shortId],
    },
  };
}

/** Payload to claim a BURN file (first caller only). */
export function buildUnlockBurnPayload(shortId: string) {
  return {
    data: {
      function: `${SEALED_CONTRACT}::sealed_files::unlock_burn` as `${string}::${string}::${string}`,
      typeArguments: [] as [],
      functionArguments: [shortId],
    },
  };
}

// ---------------------------------------------------------------------------
// Extract AES key from transaction events
// ---------------------------------------------------------------------------

/**
 * After an unlock transaction is committed, parse the SealUnlockedEvent
 * from the transaction receipt to retrieve the AES key bytes.
 */
export function extractAESKeyFromTx(txResult: any): Uint8Array | null {
  const events: any[] = txResult?.events ?? [];
  const unlockEvent = events.find((e: any) =>
    e.type?.includes('sealed_files::SealUnlockedEvent')
  );
  if (!unlockEvent) return null;

  const rawKey = unlockEvent.data?.aes_key;
  if (!rawKey || !Array.isArray(rawKey)) return null;

  return new Uint8Array(rawKey.map(Number));
}

// ---------------------------------------------------------------------------
// View: fetch seal info via Aptos RPC
// ---------------------------------------------------------------------------

export interface SealInfo {
  conditionType:   number;
  priceOctas:      bigint;
  unlockTimestamp: bigint;
  claimed:         boolean;
  creator:         string;
}

/** Fetch seal info from the contract. Works without a wallet (read-only). */
export async function fetchSealInfo(shortId: string): Promise<SealInfo | null> {
  try {
    const res = await fetch(
      `https://api.shelbynet.shelby.xyz/v1/view`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          function: `${SEALED_CONTRACT}::sealed_files::get_seal_info`,
          type_arguments: [],
          arguments: [shortId],
        }),
      }
    );
    if (!res.ok) return null;
    const data = await res.json();
    // Returns [condition_type, price_octas, unlock_timestamp, claimed, creator]
    const [conditionType, priceOctas, unlockTimestamp, claimed, creator] = data;
    return {
      conditionType: Number(conditionType),
      priceOctas:    BigInt(priceOctas),
      unlockTimestamp: BigInt(unlockTimestamp),
      claimed:       Boolean(claimed),
      creator,
    };
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

export function ocatasToApt(octas: bigint): string {
  const apt = Number(octas) / 1e8;
  return apt % 1 === 0 ? apt.toFixed(0) : apt.toFixed(4).replace(/\.?0+$/, '');
}

export function aptToOctas(apt: number): bigint {
  return BigInt(Math.round(apt * 1e8));
}
