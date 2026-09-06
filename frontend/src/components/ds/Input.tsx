import React, { InputHTMLAttributes, SelectHTMLAttributes, TextareaHTMLAttributes } from 'react';

/* ─── Shared label ─────────────────────────────────────────── */
function Label({ htmlFor, required, children }: { htmlFor?: string; required?: boolean; children: React.ReactNode }) {
  return (
    <label htmlFor={htmlFor} className="text-sm font-medium text-neutral-700 leading-none">
      {children}
      {required && <span className="text-danger-500 ml-1" aria-hidden="true">*</span>}
    </label>
  );
}

function HintError({ error, hint }: { error?: string; hint?: string }) {
  if (error) return <p className="text-xs text-danger-600 flex items-center gap-1 mt-1">{error}</p>;
  if (hint)  return <p className="text-xs text-neutral-500 mt-1">{hint}</p>;
  return null;
}

const baseInput =
  'w-full bg-white text-sm text-neutral-900 placeholder:text-neutral-400 ' +
  'border rounded-lg transition-colors duration-150 focus:outline-none focus:ring-2 focus:border-transparent ' +
  'disabled:bg-neutral-50 disabled:text-neutral-400 disabled:cursor-not-allowed';

/* ─── Input ──────────────────────────────────────────────────── */
export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  hint?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export function Input({ label, hint, error, leftIcon, rightIcon, className = '', id, ...props }: InputProps) {
  const inputId = id ?? (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);
  const borderClass = error ? 'border-danger-500 focus:ring-danger-500' : 'border-neutral-200 hover:border-neutral-300 focus:ring-brand-500';

  return (
    <div className="flex flex-col gap-1.5">
      {label && <Label htmlFor={inputId} required={props.required}>{label}</Label>}
      <div className="relative flex items-center">
        {leftIcon && (
          <span className="absolute left-3 text-neutral-400 pointer-events-none flex items-center">{leftIcon}</span>
        )}
        <input
          id={inputId}
          className={[baseInput, 'h-10 px-3', borderClass, leftIcon ? 'pl-9' : '', rightIcon ? 'pr-9' : '', className].join(' ')}
          {...props}
        />
        {rightIcon && (
          <span className="absolute right-3 text-neutral-400 flex items-center">{rightIcon}</span>
        )}
      </div>
      <HintError error={error} hint={hint} />
    </div>
  );
}

/* ─── Search Input ──────────────────────────────────────────── */
export interface SearchInputProps extends InputHTMLAttributes<HTMLInputElement> {
  onClear?: () => void;
}

const SearchIco = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
  </svg>
);

export function SearchInput({ value, onClear, className = '', ...props }: SearchInputProps) {
  return (
    <div className="relative flex items-center">
      <span className="absolute left-3 text-neutral-400 pointer-events-none flex items-center"><SearchIco /></span>
      <input
        className={[
          baseInput,
          'h-10 pl-9 pr-9',
          'border-neutral-200 hover:border-neutral-300 focus:ring-brand-500',
          className,
        ].join(' ')}
        value={value}
        {...props}
      />
      {value && onClear && (
        <button
          type="button"
          onClick={onClear}
          className="absolute right-3 text-neutral-400 hover:text-neutral-600 flex items-center transition-colors"
          aria-label="Clear"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 6 6 18M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  );
}

/* ─── Select ─────────────────────────────────────────────────── */
export interface SelectOption { value: string; label: string; }
export interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'onChange'> {
  label?: string;
  options: SelectOption[];
  placeholder?: string;
  error?: string;
  hint?: string;
  onChange?: (value: string) => void;
}

export function Select({ label, options, placeholder, error, hint, onChange, className = '', id, ...props }: SelectProps) {
  const selectId = id ?? (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);
  const borderClass = error ? 'border-danger-500 focus:ring-danger-500' : 'border-neutral-200 hover:border-neutral-300 focus:ring-brand-500';

  return (
    <div className="flex flex-col gap-1.5">
      {label && <Label htmlFor={selectId}>{label}</Label>}
      <div className="relative">
        <select
          id={selectId}
          className={[
            baseInput, 'h-10 pl-3 pr-9 appearance-none cursor-pointer', borderClass, className,
          ].join(' ')}
          onChange={(e) => onChange?.(e.target.value)}
          {...props}
        >
          {placeholder && <option value="">{placeholder}</option>}
          {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="m6 9 6 6 6-6" />
          </svg>
        </span>
      </div>
      <HintError error={error} hint={hint} />
    </div>
  );
}

/* ─── Textarea ───────────────────────────────────────────────── */
export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  hint?: string;
  error?: string;
}

export function Textarea({ label, hint, error, className = '', id, ...props }: TextareaProps) {
  const textareaId = id ?? (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);
  const borderClass = error ? 'border-danger-500 focus:ring-danger-500' : 'border-neutral-200 hover:border-neutral-300 focus:ring-brand-500';

  return (
    <div className="flex flex-col gap-1.5">
      {label && <Label htmlFor={textareaId} required={props.required}>{label}</Label>}
      <textarea
        id={textareaId}
        className={[baseInput, 'px-3 py-2.5 resize-none min-h-[96px]', borderClass, className].join(' ')}
        {...props}
      />
      <HintError error={error} hint={hint} />
    </div>
  );
}
