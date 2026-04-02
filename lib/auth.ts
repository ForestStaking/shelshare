/**
 * Petra Wallet Auth Helpers — Server-side
 *
 * Reads the connected Aptos wallet address from the X-Wallet-Address request header.
 * On first use, upserts a user record in Supabase keyed by wallet_address.
 *
 * Architecture: Petra signs nothing server-side on testnet — the wallet address
 * is the user identifier. For mainnet, add message signing + server verification.
 */

import { createServerClient } from './supabase';

/**
 * Extract and validate the wallet address from the X-Wallet-Address header.
 * Returns the address string if present and looks like an Aptos address, else null.
 */
export function verifyWalletAddress(
  request: Request
): { walletAddress: string } | null {
  const address = request.headers.get('X-Wallet-Address');
  if (!address) return null;

  // Basic sanity check — Aptos addresses are 0x-prefixed hex strings
  if (!/^0x[0-9a-fA-F]{1,64}$/.test(address)) return null;

  return { walletAddress: address };
}

/**
 * Ensure a user record exists in Supabase for the given wallet address.
 * Creates one on first connection (upsert by wallet_address).
 * Returns the Supabase user record.
 */
export async function ensureUser(walletAddress: string) {
  const supabase = createServerClient();

  const { data: existing } = await supabase
    .from('users')
    .select('*')
    .eq('wallet_address', walletAddress)
    .single();

  if (existing) return existing;

  // First time connecting — create user record
  const { data: newUser, error } = await supabase
    .from('users')
    .insert({ wallet_address: walletAddress })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create user: ${error.message}`);
  }

  return newUser;
}
