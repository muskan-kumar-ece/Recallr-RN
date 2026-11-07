import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface ChipProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'selected' | 'outline' | 'outline-accent' | 'dashed' | 'tag';
  icon?: React.ReactNode;
  count?: number | string;
  onRemove?: () => void;
  clickable?: boolean;
}

export const Chip: React.FC<ChipProps> = ({
  children,
  className,
  variant = 'default',
  icon,
  count,
  onRemove,
  clickable = true,
  onClick,
  ...props
}) => {
  const normalizedVariant = variant === 'outline' ? 'outline-accent' : variant;
  const variantStyles = {
    default:
      'bg-white text-text border border-border hover:border-black/20',
    selected:
      'bg-accent text-white border border-accent shadow-sm',
    'outline-accent':
      'bg-white text-accent border border-accent hover:bg-accentTintSoft',
    dashed:
      'bg-white text-accent border border-dashed border-accent hover:bg-accentTintSoft',
    tag:
      'bg-accentTint text-accentDark font-medium text-[11px] py-[2.5px] px-2 rounded-[6px] border-none inline-flex items-center gap-1',
  }[normalizedVariant];

  const isTag = variant === 'tag';

  return (
    <div
      onClick={clickable ? onClick : undefined}
      className={twMerge(
        clsx(
          'inline-flex items-center justify-center font-medium transition-all duration-150 select-none whitespace-nowrap',
          isTag ? '' : 'h-[32px] px-3.5 text-xs rounded-chip',
          variantStyles,
          clickable && 'cursor-pointer active:scale-95',
          className
        )
      )}
      {...props}
    >
      {icon && <span className={clsx('inline-flex items-center', isTag ? 'mr-1' : 'mr-1.5')}>{icon}</span>}
      <span>{children}</span>
      {count !== undefined && (
        <span
          className={clsx(
            'ml-1.5 text-[11px] font-medium',
            variant === 'selected' ? 'text-white/80' : 'text-textSecondary'
          )}
        >
          {count}
        </span>
      )}
      {onRemove && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="ml-1.5 hover:opacity-75 focus:outline-none"
        >
          ✕
        </button>
      )}
    </div>
  );
};
