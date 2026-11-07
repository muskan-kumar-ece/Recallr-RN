import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { IconAlertTriangle, IconWifiOff } from '@tabler/icons-react';

export interface BannerProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'warning' | 'offline';
  message: React.ReactNode;
  action?: React.ReactNode;
}

export const Banner: React.FC<BannerProps> = ({
  variant = 'warning',
  message,
  action,
  className,
  ...props
}) => {
  return (
    <div
      className={twMerge(
        clsx(
          'flex items-center gap-2.5 px-3.5 py-2.5 bg-bannerBg text-bannerText rounded-[14px] text-xs leading-snug select-none',
          className
        )
      )}
      {...props}
    >
      <span className="text-accent flex-shrink-0">
        {variant === 'offline' ? (
          <IconWifiOff size={16} />
        ) : (
          <IconAlertTriangle size={16} />
        )}
      </span>

      <div className="flex-1 min-w-0 font-normal">{message}</div>

      {action && <div className="flex-shrink-0 ml-1 font-medium">{action}</div>}
    </div>
  );
};
