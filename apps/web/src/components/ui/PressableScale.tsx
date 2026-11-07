import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export type HapticType = 'light' | 'selection' | 'success' | 'warning' | 'none';

export interface PressableScaleProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  activeScale?: number;
  haptic?: HapticType;
  asChild?: boolean;
}

export const PressableScale = React.forwardRef<HTMLButtonElement, PressableScaleProps>(
  (
    {
      children,
      className,
      disabled,
      activeScale: _activeScale = 0.98,
      haptic: _haptic = 'none',
      type = 'button',
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        type={type}
        disabled={disabled}
        className={twMerge(
          clsx(
            'transition-transform duration-75 active:scale-[0.98] select-none text-left',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 focus-visible:ring-offset-1',
            disabled && 'opacity-60 cursor-not-allowed active:scale-100',
            className
          )
        )}
        {...props}
      >
        {children}
      </button>
    );
  }
);

PressableScale.displayName = 'PressableScale';
