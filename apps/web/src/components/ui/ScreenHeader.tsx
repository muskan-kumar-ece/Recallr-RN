import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { IconArrowLeft, IconX } from '@tabler/icons-react';

export interface ScreenHeaderProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title'> {
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  onBack?: () => void;
  closeIcon?: boolean;
  rightAction?: React.ReactNode;
}

export const ScreenHeader: React.FC<ScreenHeaderProps> = ({
  title,
  subtitle,
  onBack,
  closeIcon = false,
  rightAction,
  className,
  ...props
}) => {
  return (
    <div
      className={twMerge(
        clsx(
          'flex items-center justify-between min-h-[44px] mb-3 select-none',
          className
        )
      )}
      {...props}
    >
      <div className="flex items-center gap-2.5 min-w-0">
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            className="w-9 h-9 rounded-full bg-white border border-border flex items-center justify-center text-textSecondary hover:text-text hover:border-black/20 active:scale-95 transition-all flex-shrink-0"
            aria-label={closeIcon ? 'Close' : 'Go back'}
          >
            {closeIcon ? <IconX size={18} /> : <IconArrowLeft size={18} />}
          </button>
        )}

        {title && (
          <div className="min-w-0">
            <h1 className="text-xl font-medium text-text tracking-tight truncate">
              {title}
            </h1>
            {subtitle && (
              <p className="text-[11px] text-textSecondary truncate">{subtitle}</p>
            )}
          </div>
        )}
      </div>

      {rightAction && (
        <div className="flex items-center gap-2 flex-shrink-0 ml-2">
          {rightAction}
        </div>
      )}
    </div>
  );
};
