import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface ProgressBarProps {
  value: number; // 0 to 100
  className?: string;
  barColor?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  className,
  barColor = '#E8641B',
}) => {
  const clamped = Math.min(100, Math.max(0, value));

  return (
    <div
      className={twMerge(
        clsx('w-full h-1.5 bg-fill rounded-[3px] overflow-hidden', className)
      )}
    >
      <div
        className="h-full rounded-[3px] transition-all duration-300"
        style={{
          width: `${clamped}%`,
          backgroundColor: barColor,
        }}
      />
    </div>
  );
};
