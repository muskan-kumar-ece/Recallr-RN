'use client';

import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { useStorageDownloadUrl } from '@recallr/api';

export interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  name?: string;
  src?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  showBadge?: boolean;
  badgeIcon?: React.ReactNode;
}

export const Avatar: React.FC<AvatarProps> = ({
  name = '',
  src,
  size = 'sm',
  showBadge = false,
  badgeIcon,
  className,
  ...props
}) => {
  const { data: storageSrc } = useStorageDownloadUrl(src && !/^https:\/\//i.test(src) ? src : '');
  const resolvedSrc = src && /^https:\/\//i.test(src) ? src : storageSrc;
  const sizeStyles = {
    xs: 'w-8 h-8 text-xs',
    sm: 'w-10 h-10 text-sm',
    md: 'w-12 h-12 text-base',
    lg: 'w-16 h-16 text-xl',
    xl: 'w-20 h-20 text-2xl',
  }[size];

  const initials = name
    ? name
        .split(' ')
        .map((p) => p[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : 'U';

  return (
    <div
      className={twMerge(
        clsx(
          'relative rounded-full flex items-center justify-center font-medium select-none overflow-visible flex-shrink-0',
          sizeStyles,
          className
        )
      )}
      {...props}
    >
      <div className="w-full h-full rounded-full overflow-hidden bg-accentTint flex items-center justify-center text-accent">
        {resolvedSrc ? (
          <img src={resolvedSrc} alt={name} className="w-full h-full object-cover" />
        ) : (
          <span>{initials}</span>
        )}
      </div>

      {showBadge && (
        <div className="absolute -bottom-0.5 -right-0.5 w-5 h-5 rounded-full bg-accent text-white flex items-center justify-center border-2 border-white shadow-sm">
          {badgeIcon || (
            <svg
              className="w-3 h-3"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
          )}
        </div>
      )}
    </div>
  );
};
