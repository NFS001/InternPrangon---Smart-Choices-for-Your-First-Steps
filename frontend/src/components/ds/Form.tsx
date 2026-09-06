import React from 'react';

/* ─── Checkbox ──────────────────────────────────────────────── */
export interface CheckboxProps {
  label?: string;
  checked?: boolean;
  onChange?: (checked: boolean) => void;
  disabled?: boolean;
  indeterminate?: boolean;
  id?: string;
  description?: string;
}

export function Checkbox({ label, checked, onChange, disabled, id, description }: CheckboxProps) {
  const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-');

  return (
    <label
      htmlFor={inputId}
      className={`inline-flex items-start gap-2.5 ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
    >
      <div className="relative flex items-center mt-0.5 shrink-0">
        <input
          type="checkbox"
          id={inputId}
          checked={checked}
          onChange={(e) => onChange?.(e.target.checked)}
          disabled={disabled}
          className="sr-only peer"
        />
        <div
          className={[
            'w-4 h-4 border-2 rounded flex items-center justify-center transition-all duration-150',
            'peer-focus-visible:ring-2 peer-focus-visible:ring-brand-400 peer-focus-visible:ring-offset-2',
            checked ? 'bg-brand-600 border-brand-600' : 'bg-white border-neutral-300 hover:border-brand-400',
          ].join(' ')}
        >
          {checked && (
            <svg width="9" height="9" viewBox="0 0 12 12" fill="none" aria-hidden="true">
              <path d="M2 6l3 3 5-5" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
        </div>
      </div>
      {(label || description) && (
        <div>
          {label && <span className="text-sm text-neutral-700 select-none leading-none">{label}</span>}
          {description && <p className="text-xs text-neutral-500 mt-0.5">{description}</p>}
        </div>
      )}
    </label>
  );
}

/* ─── Radio ─────────────────────────────────────────────────── */
export interface RadioProps {
  label?: string;
  value?: string;
  name?: string;
  checked?: boolean;
  onChange?: (value: string) => void;
  disabled?: boolean;
  id?: string;
  description?: string;
}

export function Radio({ label, value, name, checked, onChange, disabled, id, description }: RadioProps) {
  const inputId = id ?? `${name}-${value}`;

  return (
    <label
      htmlFor={inputId}
      className={`inline-flex items-start gap-2.5 ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
    >
      <div className="relative flex items-center mt-0.5 shrink-0">
        <input
          type="radio"
          id={inputId}
          name={name}
          value={value}
          checked={checked}
          onChange={() => onChange?.(value ?? '')}
          disabled={disabled}
          className="sr-only peer"
        />
        <div
          className={[
            'w-4 h-4 border-2 rounded-full flex items-center justify-center transition-all duration-150',
            'peer-focus-visible:ring-2 peer-focus-visible:ring-brand-400 peer-focus-visible:ring-offset-2',
            checked ? 'border-brand-600' : 'border-neutral-300 hover:border-brand-400',
          ].join(' ')}
        >
          {checked && <div className="w-2 h-2 rounded-full bg-brand-600" />}
        </div>
      </div>
      {(label || description) && (
        <div>
          {label && <span className="text-sm text-neutral-700 select-none leading-none">{label}</span>}
          {description && <p className="text-xs text-neutral-500 mt-0.5">{description}</p>}
        </div>
      )}
    </label>
  );
}

/* ─── Toggle ────────────────────────────────────────────────── */
export interface ToggleProps {
  label?: string;
  checked?: boolean;
  onChange?: (checked: boolean) => void;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
  id?: string;
  description?: string;
}

const toggleSizes = {
  sm: { track: 'w-7 h-4',    thumb: 'w-3 h-3',   translate: 'translate-x-3.5' },
  md: { track: 'w-9 h-5',    thumb: 'w-3.5 h-3.5', translate: 'translate-x-4' },
  lg: { track: 'w-11 h-6',   thumb: 'w-4.5 h-4.5', translate: 'translate-x-5' },
};

export function Toggle({ label, checked, onChange, disabled, size = 'md', id, description }: ToggleProps) {
  const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-');
  const s = toggleSizes[size];

  return (
    <label
      htmlFor={inputId}
      className={`inline-flex items-start gap-2.5 ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
    >
      <div className="relative shrink-0 mt-0.5">
        <input
          type="checkbox"
          id={inputId}
          checked={checked}
          onChange={(e) => onChange?.(e.target.checked)}
          disabled={disabled}
          className="sr-only peer"
        />
        <div
          className={[
            s.track, 'rounded-full transition-colors duration-200',
            'peer-focus-visible:ring-2 peer-focus-visible:ring-brand-400 peer-focus-visible:ring-offset-2',
            checked ? 'bg-brand-600' : 'bg-neutral-200',
          ].join(' ')}
        />
        <div
          className={[
            'absolute top-0.5 left-0.5', s.thumb,
            'bg-white rounded-full shadow-sm transition-transform duration-200',
            checked ? s.translate : 'translate-x-0',
          ].join(' ')}
        />
      </div>
      {(label || description) && (
        <div>
          {label && <span className="text-sm text-neutral-700 select-none leading-none">{label}</span>}
          {description && <p className="text-xs text-neutral-500 mt-0.5">{description}</p>}
        </div>
      )}
    </label>
  );
}
