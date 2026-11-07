import React, { useRef } from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'outline' | 'secondary' | 'text' | 'danger';
  size?: 'sm' | 'md';
  loading?: boolean;
  icon?: React.ReactNode;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      className,
      variant = 'primary',
      size = 'md',
      loading = false,
      disabled = false,
      icon,
      leftIcon,
      rightIcon,
      onClick,
      ...props
    },
    ref
  ) => {
    const effectiveLeftIcon = leftIcon || icon;
    const lastClickRef = useRef<number>(0);

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (disabled || loading) {
        e.preventDefault();
        return;
      }
      const now = Date.now();
      if (now - lastClickRef.current < 400) {
        e.preventDefault();
        return;
      }
      lastClickRef.current = now;
      onClick?.(e);
    };

    const variantStyles = {
      primary:
        'bg-accent text-white hover:brightness-105 active:scale-[0.98] border border-transparent shadow-sm',
      outline:
        'bg-white text-accent border border-accent hover:bg-accentTintSoft active:scale-[0.98]',
      secondary:
        'bg-white text-text border border-border hover:border-black/20 active:scale-[0.98]',
      text: 'bg-transparent text-accent hover:underline active:scale-[0.98] border-none px-2',
      danger: 'bg-transparent text-danger hover:bg-dangerTint active:scale-[0.98] border-none',
    }[variant];

    const sizeStyles = {
      sm: 'h-[44px] px-4 text-xs rounded-full',
      md: 'h-[50px] px-6 text-sm rounded-button',
    }[size];

    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        onClick={handleClick}
        className={twMerge(
          clsx(
            'relative inline-flex items-center justify-center font-medium transition-all duration-100 select-none whitespace-nowrap min-h-[44px]',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 focus-visible:ring-offset-1',
            sizeStyles,
            variantStyles,
            (disabled || loading) &&
              'bg-fill text-textMuted border-transparent cursor-not-allowed opacity-80 active:scale-100 hover:brightness-100',
            className
          )
        )}
        {...props}
      >
        {/* Content keeps width unchanged when loading */}
        <span
          className={clsx(
            'inline-flex items-center justify-center transition-opacity duration-150',
            loading && 'opacity-0'
          )}
        >
          {effectiveLeftIcon && (
            <span className="mr-2 inline-flex items-center justify-center">{effectiveLeftIcon}</span>
          )}
          <span>{children}</span>
          {rightIcon && (
            <span className="ml-2 inline-flex items-center justify-center">{rightIcon}</span>
          )}
        </span>

        {/* Centered spinner overlay */}
        {loading && (
          <span className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
          </span>
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';
