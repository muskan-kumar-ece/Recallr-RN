import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface OrangeCornerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: 'sm' | 'md' | 'lg';
  count?: number | string;
  icon?: React.ReactNode;
  color?: string;
  onClick?: (e: React.MouseEvent<HTMLDivElement>) => void;
}

export const OrangeCorner: React.FC<OrangeCornerProps> = ({
  size = 'md',
  count,
  icon,
  color,
  onClick,
  className,
  children,
  ...props
}) => {
  const sizeStyles = {
    sm: 'w-[48px] h-[38px] rounded-tl-[26px] pr-2.5 pb-2',
    md: 'w-[56px] h-[44px] rounded-tl-[32px] pr-3 pb-2.5',
    lg: 'w-[78px] h-[58px] rounded-tl-[40px] pr-3.5 pb-3',
  }[size];

  const isClickable = !!onClick;

  return (
    <div
      onClick={onClick}
      style={color ? { backgroundColor: color } : undefined}
      className={twMerge(
        clsx(
          'absolute bottom-0 right-0 bg-accent text-white flex items-end justify-end select-none transition-all duration-150',
          sizeStyles,
          isClickable && 'cursor-pointer hover:brightness-105 active:scale-95',
          className
        )
      )}
      {...props}
    >
      {children ? (
        children
      ) : count !== undefined ? (
        <span className="font-medium text-[13px] tracking-tight leading-none text-white">
          {count}
        </span>
      ) : icon ? (
        <span className="flex items-center justify-center leading-none text-white">
          {icon}
        </span>
      ) : null}
    </div>
  );
};
