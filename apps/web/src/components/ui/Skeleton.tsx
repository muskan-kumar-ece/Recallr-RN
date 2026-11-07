import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'rect' | 'circle' | 'text' | 'card' | 'row';
}

export const Skeleton: React.FC<SkeletonProps> = ({
  variant = 'rect',
  className,
  ...props
}) => {
  if (variant === 'row') {
    return (
      <div
        className={twMerge(
          clsx(
            'flex items-center gap-3 px-3.5 py-3 bg-white border-b border-divider last:border-b-0 animate-pulse',
            className
          )
        )}
        {...props}
      >
        <div className="w-10 h-10 rounded-full bg-fill flex-shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="h-3.5 bg-fill rounded-[4px] w-2/5" />
          <div className="h-2.5 bg-fill rounded-[4px] w-3/5" />
        </div>
      </div>
    );
  }

  const variantStyles = {
    circle: 'rounded-full',
    rect: 'rounded-[6px]',
    text: 'h-3 rounded-[4px]',
    card: 'rounded-card h-24',
    row: '',
  }[variant];

  return (
    <div
      className={twMerge(
        clsx('bg-fill animate-pulse', variantStyles, className)
      )}
      {...props}
    />
  );
};
