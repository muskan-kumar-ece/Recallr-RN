import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  padding?: 'none' | 'sm' | 'md' | 'lg';
  selected?: boolean;
  flat?: boolean;
  clickable?: boolean;
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  (
    {
      children,
      className,
      padding = 'md',
      selected = false,
      flat = false,
      clickable = false,
      onClick,
      ...props
    },
    ref
  ) => {
    const paddingStyles = {
      none: 'p-0',
      sm: 'p-2.5',
      md: 'p-3.5',
      lg: 'p-5',
    }[padding];

    const isInteractive = clickable || !!onClick;

    return (
      <div
        ref={ref}
        onClick={onClick}
        tabIndex={isInteractive ? 0 : undefined}
        role={isInteractive ? 'button' : undefined}
        className={twMerge(
          clsx(
            'relative bg-surface rounded-card border border-border overflow-hidden transition-all duration-150',
            !flat && 'shadow-card',
            paddingStyles,
            selected && 'bg-accentTintSoft border-accent/40 ring-1 ring-accent/30',
            isInteractive &&
              'cursor-pointer hover:border-black/15 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40',
            className
          )
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';
