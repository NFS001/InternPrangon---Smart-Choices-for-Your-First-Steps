import React from 'react';

type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
type AvatarStatus = 'online' | 'offline' | 'away';

interface AvatarProps {
  src?: string;
  name?: string;
  size?: AvatarSize;
  status?: AvatarStatus;
  className?: string;
}

const sizeMap: Record<AvatarSize, { wrapper: string; text: string; ring: string; dot: string }> = {
  xs: { wrapper: 'w-6 h-6',   text: 'text-[9px]',  ring: 'ring-1', dot: 'w-1.5 h-1.5 border' },
  sm: { wrapper: 'w-8 h-8',   text: 'text-xs',     ring: 'ring-1', dot: 'w-2 h-2 border' },
  md: { wrapper: 'w-10 h-10', text: 'text-sm',     ring: 'ring-2', dot: 'w-2.5 h-2.5 border-2' },
  lg: { wrapper: 'w-12 h-12', text: 'text-base',   ring: 'ring-2', dot: 'w-3 h-3 border-2' },
  xl: { wrapper: 'w-16 h-16', text: 'text-xl',     ring: 'ring-2', dot: 'w-4 h-4 border-2' },
};

const statusColors: Record<AvatarStatus, string> = {
  online:  'bg-success-500',
  offline: 'bg-neutral-400',
  away:    'bg-warning-500',
};

const palettes = [
  'bg-brand-100 text-brand-700',
  'bg-accent-100 text-accent-700',
  'bg-success-100 text-success-700',
  'bg-info-100 text-info-700',
  'bg-warning-100 text-warning-700',
];

function getInitials(name: string) {
  return name.split(' ').slice(0, 2).map((w) => w[0]).join('').toUpperCase();
}

function getPalette(name: string) {
  const hash = name.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  return palettes[hash % palettes.length];
}

export default function Avatar({ src, name = '', size = 'md', status, className = '' }: AvatarProps) {
  const s = sizeMap[size];
  const palette = getPalette(name);

  return (
    <div className={`relative inline-flex shrink-0 ${className}`}>
      <div
        className={`${s.wrapper} rounded-full overflow-hidden flex items-center justify-center ${!src ? palette : ''}`}
      >
        {src ? (
          <img src={src} alt={name} className="w-full h-full object-cover" />
        ) : (
          <span className={`font-semibold ${s.text}`}>
            {name ? getInitials(name) : '?'}
          </span>
        )}
      </div>
      {status && (
        <span
          className={[
            'absolute bottom-0 right-0 rounded-full border-white',
            s.dot,
            statusColors[status],
          ].join(' ')}
        />
      )}
    </div>
  );
}

/* ─── Avatar Group ──────────────────────────────────────────── */

interface AvatarGroupProps {
  items: Array<{ src?: string; name: string }>;
  max?: number;
  size?: AvatarSize;
}

export function AvatarGroup({ items, max = 4, size = 'sm' }: AvatarGroupProps) {
  const visible = items.slice(0, max);
  const overflow = items.length - max;
  const s = sizeMap[size];

  return (
    <div className="flex -space-x-2">
      {visible.map((item, i) => (
        <div key={i} className={`${s.wrapper} rounded-full ring-2 ring-white overflow-hidden shrink-0`}>
          <Avatar src={item.src} name={item.name} size={size} />
        </div>
      ))}
      {overflow > 0 && (
        <div
          className={`${s.wrapper} rounded-full ring-2 ring-white bg-neutral-200 flex items-center justify-center shrink-0`}
        >
          <span className={`font-semibold text-neutral-600 ${s.text}`}>+{overflow}</span>
        </div>
      )}
    </div>
  );
}
