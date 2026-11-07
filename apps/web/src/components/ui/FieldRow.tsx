import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface FieldRowProps extends React.HTMLAttributes<HTMLDivElement> {
  label: string;
  value?: React.ReactNode;
  icon?: React.ReactNode;
  flagged?: boolean;
  showDivider?: boolean;
}

export const FieldRow: React.FC<FieldRowProps> = ({
  label,
  value,
  icon,
  flagged = false,
  showDivider = true,
  className,
  children,
  ...props
}) => {
  return (
    <div
      className={twMerge(
        clsx(
          'flex items-center justify-between gap-3 px-3.5 py-[11px] bg-white transition-colors',
          showDivider && 'border-b border-divider last:border-b-0',
          flagged && 'bg-accentTintSoft',
          className
        )
      )}
      {...props}
    >
      <div className="flex items-center gap-2.5 min-w-[100px] flex-shrink-0">
        {icon && <span className="text-accent flex-shrink-0">{icon}</span>}
        <span className="text-xs text-textSecondary">{label}</span>
      </div>

      <div className="flex-1 flex items-center justify-end text-right">
        {children || (
          <span className="text-sm text-text font-normal truncate">
            {value}
          </span>
        )}
      </div>

      {flagged && (
        <span className="ml-2 bg-accent text-white text-[10px] font-medium px-1.5 py-0.5 rounded-[4px] uppercase tracking-wider">
          Check
        </span>
      )}
    </div>
  );
};
