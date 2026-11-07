import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface IconTileProps extends React.HTMLAttributes<HTMLDivElement> {
  icon: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  color?: string;
  bgColor?: string;
}

export const IconTile: React.FC<IconTileProps> = ({
  icon,
  size = 'md',
  color = '#E8641B',
  bgColor,
  className,
  ...props
}) => {
  const sizeStyles = {
    sm: 'w-8 h-8 rounded-[10px] text-base',
    md: 'w-10 h-10 rounded-[12px] text-lg',
    lg: 'w-12 h-12 rounded-[14px] text-xl',
    xl: 'w-14 h-14 rounded-[16px] text-2xl',
  }[size];

  return (
    <div
      style={{
        color,
        backgroundColor: bgColor || 'rgba(232, 100, 27, 0.12)',
      }}
      className={twMerge(
        clsx(
          'flex items-center justify-center flex-shrink-0 select-none',
          sizeStyles,
          className
        )
      )}
      {...props}
    >
      {icon}
    </div>
  );
};
