import React from 'react';

export interface Tab {
  id: string;
  label: string;
  icon?: React.ReactNode;
  badge?: number | string;
  disabled?: boolean;
}

export interface TabsProps {
  tabs: Tab[];
  activeTab: string;
  onChange: (id: string) => void;
  variant?: 'line' | 'pill';
  size?: 'sm' | 'md';
}

export default function Tabs({ tabs, activeTab, onChange, variant = 'line', size = 'md' }: TabsProps) {
  const isLine = variant === 'line';

  return (
    <div
      className={[
        'flex gap-0.5',
        isLine
          ? 'border-b border-neutral-200'
          : 'bg-neutral-100 p-1 rounded-xl w-fit',
      ].join(' ')}
      role="tablist"
    >
      {tabs.map((tab) => {
        const isActive = tab.id === activeTab;
        return (
          <button
            key={tab.id}
            role="tab"
            aria-selected={isActive}
            disabled={tab.disabled}
            onClick={() => !tab.disabled && onChange(tab.id)}
            className={[
              'relative inline-flex items-center gap-2 font-medium transition-all duration-150',
              'focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-400',
              size === 'sm' ? 'px-3 py-1.5 text-xs' : 'px-4 py-2 text-sm',
              tab.disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer',
              isLine
                ? isActive
                  ? 'text-brand-700 border-b-2 border-brand-600 -mb-px rounded-none'
                  : 'text-neutral-500 hover:text-neutral-700 border-b-2 border-transparent -mb-px'
                : isActive
                  ? 'bg-white text-brand-700 shadow-sm rounded-lg'
                  : 'text-neutral-500 hover:text-neutral-700 rounded-lg',
            ].join(' ')}
          >
            {tab.icon && <span className="shrink-0">{tab.icon}</span>}
            {tab.label}
            {tab.badge !== undefined && (
              <span
                className={[
                  'text-[10px] font-semibold px-1.5 min-w-[18px] text-center rounded-full leading-[18px]',
                  isActive ? 'bg-brand-100 text-brand-700' : 'bg-neutral-200 text-neutral-500',
                ].join(' ')}
              >
                {tab.badge}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
