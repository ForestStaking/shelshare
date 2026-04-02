'use client';

/**
 * SealedUnlock — shown on the /f/[shortId] page when the file is sealed.
 * Handles all three unlock conditions (pay / time / burn) and decrypts
 * the file client-side after the wallet signs the unlock transaction.
 */

import { useState, useEffect } from 'react';
import { useWallet } from '@aptos-labs/wallet-adapter-react';
import {
  CONDITION_PAY, CONDITION_TIME, CONDITION_BURN,
  buildUnlockPayPayload, buildUnlockTimePayload, buildUnlockBurnPayload,
  extractAESKeyFromTx, fetchSealInfo, ocatasToApt,
  type SealInfo,
} from '@/lib/sealed';
import { importKeyBytes, decryptFile, triggerDownload } from '@/lib/crypto';

interface Props {
  shortId: string;
  filename: string;
  mimeType: string;
  sizeFormatted: string;
  // These come from Supabase (already known server-side)
  conditionType: number;
  priceOctas: string;       // bigint serialised as string
  unlockTimestamp: string;  // bigint serialised as string
}

export default function SealedUnlock({
  shortId,
  filename,
  mimeType,
  sizeFormatted,
  conditionType,
  priceOctas,
  unlockTimestamp,
}: Props) {
  const { connected, connect, signAndSubmitTransaction, account } = useWallet();
  const [status, setStatus] = useState<'idle' | 'waiting_wallet' | 'unlocking' | 'decrypting' | 'done' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const [sealInfo, setSealInfo] = useState<SealInfo | null>(null);
  const [claimed, setClaimed] = useState(false);

  const price = BigInt(priceOctas || '0');
  const unlockTs = BigInt(unlockTimestamp || '0');
  const nowTs = BigInt(Math.floor(Date.now() / 1000));
  const isTimeLocked = conditionType === CONDITION_TIME && nowTs < unlockTs;

  useEffect(() => {
    fetchSealInfo(shortId).then((info) => {
      if (info) {
        setSealInfo(info);
        setClaimed(info.claimed);
      }
    });
  }, [shortId]);

  const unlock = async () => {
    setErrorMsg('');
    try {
      if (!connected) {
        setStatus('waiting_wallet');
        await connect('Petra');
        setStatus('idle');
        return;
      }

      setStatus('unlocking');

      // Build the right payload
      let payload;
      if (conditionType === CONDITION_PAY)  payload = buildUnlockPayPayload(shortId);
      else if (conditionType === CONDITION_TIME) payload = buildUnlockTimePayload(shortId);
      else payload = buildUnlockBurnPayload(shortId);

      // Sign & submit — wallet prompts user
      const txResult = await signAndSubmitTransaction(payload as any);

      // Extract AES key from the SealUnlockedEvent in the tx receipt
      const aesKeyBytes = extractAESKeyFromTx(txResult);
      if (!aesKeyBytes) throw new Error('Could not read key from transaction. Try again.');

      setStatus('decrypting');

      // Fetch the encrypted file from Shelby via our download proxy
      const fileRes = await fetch(`/api/download/${shortId}`);
      if (!fileRes.ok) throw new Error('Failed to fetch encrypted file from Shelby.');
      const encryptedBuffer = await fileRes.arrayBuffer();

      // Decrypt client-side
      const cryptoKey = await importKeyBytes(aesKeyBytes);
      const plaintext = await decryptFile(encryptedBuffer, cryptoKey);

      // Trigger browser download
      triggerDownload(plaintext, filename, mimeType);
      setStatus('done');
      if (conditionType === CONDITION_BURN) setClaimed(true);

    } catch (err: any) {
      setStatus('error');
      setErrorMsg(err?.message || 'Something went wrong.');
    }
  };

  // -------------------------------------------------------------------------
  // Render helpers
  // -------------------------------------------------------------------------

  const conditionLabel = () => {
    if (conditionType === CONDITION_PAY)  return `Pay ${ocatasToApt(price)} APT to unlock`;
    if (conditionType === CONDITION_TIME) return isTimeLocked
      ? `Unlocks ${new Date(Number(unlockTs) * 1000).toLocaleString()}`
      : 'Time lock has passed — claim now';
    if (conditionType === CONDITION_BURN) return claimed ? 'Already claimed' : 'Claim (one-time only)';
    return 'Unlock';
  };

  const badge = () => {
    if (conditionType === CONDITION_PAY)  return { icon: '💸', label: 'Pay to unlock', color: 'text-amber-400' };
    if (conditionType === CONDITION_TIME) return { icon: '⏱', label: 'Time locked', color: 'text-blue-400' };
    if (conditionType === CONDITION_BURN) return { icon: '🔥', label: 'Burn — one-time', color: 'text-orange-400' };
    return { icon: '🔒', label: 'Sealed', color: 'text-txt-muted' };
  };

  const { icon, label, color } = badge();
  const isLocked = isTimeLocked || (conditionType === CONDITION_BURN && claimed);
  const buttonDisabled = status === 'unlocking' || status === 'decrypting' || isLocked || status === 'done';

  return (
    <div>
      {/* Sealed badge */}
      <div className={`flex items-center justify-center gap-2 mb-6 ${color}`}>
        <span className="text-[18px]">{icon}</span>
        <span className="text-[13px] font-semibold uppercase tracking-[0.4px]">{label}</span>
      </div>

      {/* Condition info */}
      <div className="bg-shl-surface border border-[#1a1a1a] rounded-[8px] px-4 py-3 mb-6 text-center">
        {conditionType === CONDITION_PAY && (
          <p className="text-txt-primary text-[15px] font-semibold">
            {ocatasToApt(price)} APT
            <span className="text-txt-muted font-normal text-[13px] ml-2">
              paid directly to the creator on-chain
            </span>
          </p>
        )}
        {conditionType === CONDITION_TIME && (
          <p className="text-txt-primary text-[14px]">
            {isTimeLocked
              ? <>Available from <span className="font-semibold text-blue-400">{new Date(Number(unlockTs) * 1000).toLocaleString()}</span></>
              : <span className="text-shelgreen font-semibold">Time lock has passed — file is claimable now</span>
            }
          </p>
        )}
        {conditionType === CONDITION_BURN && (
          <p className="text-txt-primary text-[14px]">
            {claimed
              ? <span className="text-txt-dim">This file has already been claimed and is gone.</span>
              : <span>First person to claim gets the file. <span className="text-orange-400 font-semibold">One time only.</span></span>
            }
          </p>
        )}
      </div>

      {/* Status */}
      {status === 'done' && (
        <div className="text-center mb-4">
          <p className="text-shelgreen font-semibold text-[14px]">✓ Decrypted — your download started</p>
        </div>
      )}
      {status === 'error' && (
        <div className="bg-red-500/5 border border-red-500/20 rounded-[8px] px-4 py-3 mb-4 text-center">
          <p className="text-red-400 text-[13px]">{errorMsg}</p>
        </div>
      )}

      {/* Unlock button */}
      {!isLocked && status !== 'done' && (
        <div className="text-center">
          <button
            onClick={unlock}
            disabled={buttonDisabled}
            className="bg-shelgreen text-[#050505] font-semibold text-[15px] px-8 py-[14px] rounded-[8px] hover:bg-shelgreen-dark active:scale-[0.97] transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {status === 'waiting_wallet' && 'Connecting wallet…'}
            {status === 'unlocking'      && 'Waiting for signature…'}
            {status === 'decrypting'     && 'Decrypting…'}
            {status === 'idle' && (connected
              ? conditionLabel()
              : 'Connect wallet to unlock'
            )}
          </button>
          {!connected && status === 'idle' && (
            <p className="text-txt-dim text-[12px] mt-2">Requires Petra wallet</p>
          )}
        </div>
      )}

      {/* On-chain note */}
      <p className="mt-6 text-txt-dim text-[11px] text-center leading-relaxed">
        Access controlled by Move contract on Shelby Protocol.
        <br />
        ShelShare cannot override the unlock condition.
      </p>
    </div>
  );
}
