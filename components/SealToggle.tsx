'use client';

/**
 * SealToggle — shown inside UploadZone when Seal is available.
 * Lets the uploader choose a condition type and configure it.
 */

import { CONDITION_PAY, CONDITION_TIME, CONDITION_BURN, ConditionType } from '@/lib/sealed';

export interface SealSettings {
  enabled: boolean;
  conditionType: ConditionType;
  priceApt: string;
  unlockDate: string;
}

interface Props {
  value: SealSettings;
  onChange: (v: SealSettings) => void;
  disabled?: boolean;
}

export default function SealToggle({ value, onChange, disabled }: Props) {
  const set = (patch: Partial<SealSettings>) => onChange({ ...value, ...patch });

  return (
    <div className="mt-4 border border-[#1a1a1a] rounded-[8px] overflow-hidden">
      {/* Header toggle */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => set({ enabled: !value.enabled })}
        className="w-full flex items-center justify-between px-4 py-3 bg-shl-card hover:bg-shl-surface transition-all duration-150"
      >
        <div className="flex items-center gap-2">
          <svg className="w-4 h-4 text-shelgreen" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          <span className="text-txt-primary text-[13px] font-semibold">Seal this file</span>
          <span className="text-txt-dim text-[11px] bg-shl-surface border border-[#1a1a1a] px-2 py-[2px] rounded-full">
            on-chain access control
          </span>
        </div>
        {/* Toggle pill */}
        <div className={`w-9 h-5 rounded-full transition-colors duration-150 relative ${value.enabled ? 'bg-shelgreen' : 'bg-shl-hover'}`}>
          <div className={`absolute top-[3px] w-[14px] h-[14px] rounded-full bg-white shadow transition-transform duration-150 ${value.enabled ? 'translate-x-[19px]' : 'translate-x-[3px]'}`} />
        </div>
      </button>

      {/* Condition config */}
      {value.enabled && (
        <div className="px-4 pb-4 pt-3 bg-shl-surface border-t border-[#1a1a1a] space-y-3">
          {/* Condition type */}
          <div className="grid grid-cols-3 gap-2">
            {[
              { type: CONDITION_PAY,  label: 'Pay to unlock',  desc: 'Buyer pays APT' },
              { type: CONDITION_TIME, label: 'Time lock',       desc: 'Unlocks on date' },
              { type: CONDITION_BURN, label: 'Burn',           desc: 'One-time claim' },
            ].map(({ type, label, desc }) => (
              <button
                key={type}
                type="button"
                disabled={disabled}
                onClick={() => set({ conditionType: type as ConditionType })}
                className={`text-left p-3 rounded-[6px] border transition-all duration-150 ${
                  value.conditionType === type
                    ? 'border-shelgreen bg-shelgreen/5 text-txt-primary'
                    : 'border-[#1a1a1a] bg-shl-card text-txt-muted hover:border-[#333]'
                }`}
              >
                <p className="text-[12px] font-semibold leading-tight">{label}</p>
                <p className="text-[11px] text-txt-dim mt-[2px]">{desc}</p>
              </button>
            ))}
          </div>

          {/* PAY: price input */}
          {value.conditionType === CONDITION_PAY && (
            <div>
              <label className="block text-txt-dim text-[11px] font-semibold uppercase tracking-[0.4px] mb-[6px]">
                Price (APT)
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="0.001"
                  step="0.001"
                  placeholder="e.g. 0.5"
                  value={value.priceApt}
                  onChange={(e) => set({ priceApt: e.target.value })}
                  disabled={disabled}
                  className="w-full bg-shl-card border border-[#1a1a1a] rounded-[6px] px-3 py-[10px] text-txt-primary text-[14px] placeholder:text-txt-dim focus:outline-none focus:border-shelgreen transition-all duration-150 pr-14"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-txt-dim text-[13px] font-mono">APT</span>
              </div>
            </div>
          )}

          {/* TIME: date picker */}
          {value.conditionType === CONDITION_TIME && (
            <div>
              <label className="block text-txt-dim text-[11px] font-semibold uppercase tracking-[0.4px] mb-[6px]">
                Unlock date & time
              </label>
              <input
                type="datetime-local"
                value={value.unlockDate}
                onChange={(e) => set({ unlockDate: e.target.value })}
                disabled={disabled}
                className="w-full bg-shl-card border border-[#1a1a1a] rounded-[6px] px-3 py-[10px] text-txt-primary text-[14px] focus:outline-none focus:border-shelgreen transition-all duration-150"
              />
            </div>
          )}

          {/* BURN: info */}
          {value.conditionType === CONDITION_BURN && (
            <p className="text-txt-dim text-[12px] leading-relaxed bg-shl-card border border-[#1a1a1a] rounded-[6px] px-3 py-[10px]">
              The first person to open this link gets the file. After that, the key is gone forever — verified on-chain.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
