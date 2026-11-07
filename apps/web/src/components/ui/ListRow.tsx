import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { IconChevronRight } from '@tabler/icons-react';

export interface ListRowProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title'> {
  leading?: React.ReactNode;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  followUpDue?: boolean;
  tag?: string;
  tagColor?: string;
  trailing?: React.ReactNode;
  showChevron?: boolean;
  showDivider?: boolean;
  clickable?: boolean;
}

export const ListRow: React.FC<ListRowProps> = ({
  leading,
  title,
  subtitle,
  followUpDue = false,
  tag,
  trailing,
  showChevron = false,
  showDivider = true,
  clickable = true,
  onClick,
  className,
  ...props
}) => {
  const isInteractive = clickable && !!onClick;

  return (
    <div
      onClick={isInteractive ? onClick : undefined}
      tabIndex={isInteractive ? 0 : undefined}
      role={isInteractive ? 'button' : undefined}
      className={twMerge(
        clsx(
          'flex items-center gap-3 px-3.5 py-[11px] bg-white transition-colors duration-100 select-none min-h-[44px]',
          showDivider && 'border-b border-divider last:border-b-0',
          isInteractive &&
            'cursor-pointer hover:bg-black/[0.015] active:bg-pressedRow focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent/40',
          className
        )
      )}
      {...props}
    >
      {leading && <div className="flex-shrink-0">{leading}</div>}

      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium text-text truncate leading-tight">
          {title}
        </div>
        {subtitle && (
          <div className="flex items-center gap-1.5 text-[11px] text-textSecondary mt-0.5 truncate">
            {followUpDue && (
              <span className="w-1.5 h-1.5 rounded-full bg-accent flex-shrink-0" />
            )}
            <span className="truncate">{subtitle}</span>
          </div>
        )}
      </div>

      {tag && (
        <span className="flex-shrink-0 text-[11px] font-medium text-accentDark bg-accentTint px-2 py-0.5 rounded-[6px]">
          {tag}
        </span>
      )}

      {trailing && <div className="flex-shrink-0">{trailing}</div>}

      {showChevron && (
        <IconChevronRight
          size={16}
          className="text-textMuted flex-shrink-0 ml-1"
        />
      )}
    </div>
  );
};
