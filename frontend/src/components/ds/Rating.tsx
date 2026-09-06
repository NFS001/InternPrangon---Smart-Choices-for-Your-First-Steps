import React from 'react';

interface RatingProps {
  value: number;
  max?: number;
  readOnly?: boolean;
  onChange?: (value: number) => void;
  size?: 'sm' | 'md' | 'lg';
  showValue?: boolean;
  showCount?: boolean;
  count?: number;
}

const starSizes = { sm: 14, md: 18, lg: 22 };

function Star({ filled, size }: { filled: boolean; size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
        fill={filled ? '#f59e0b' : '#e2e8f0'}
        stroke={filled ? '#f59e0b' : '#e2e8f0'}
        strokeWidth="0"
      />
    </svg>
  );
}

export default function Rating({
  value,
  max = 5,
  readOnly = true,
  onChange,
  size = 'md',
  showValue,
  showCount,
  count,
}: RatingProps) {
  const [hovered, setHovered] = React.useState<number | null>(null);
  const display = hovered ?? value;
  const px = starSizes[size];

  return (
    <div className="inline-flex items-center gap-1.5">
      <div className="flex items-center gap-0.5" role={readOnly ? undefined : 'group'} aria-label="Rating">
        {Array.from({ length: max }, (_, i) => i + 1).map((star) => (
          <button
            key={star}
            type="button"
            disabled={readOnly}
            onClick={() => onChange?.(star)}
            onMouseEnter={() => !readOnly && setHovered(star)}
            onMouseLeave={() => !readOnly && setHovered(null)}
            className={[
              'flex items-center transition-transform',
              readOnly ? 'cursor-default' : 'cursor-pointer hover:scale-110',
            ].join(' ')}
            aria-label={`${star} star${star !== 1 ? 's' : ''}`}
          >
            <Star filled={display >= star} size={px} />
          </button>
        ))}
      </div>
      {showValue && (
        <span className={`font-semibold text-neutral-700 ${size === 'sm' ? 'text-xs' : 'text-sm'}`}>
          {value.toFixed(1)}
        </span>
      )}
      {showCount && count !== undefined && (
        <span className={`text-neutral-400 ${size === 'sm' ? 'text-xs' : 'text-sm'}`}>({count})</span>
      )}
    </div>
  );
}
