import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Button } from './Button';
import { IconAlertTriangle } from '@tabler/icons-react';

export interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  primaryAction?: {
    label: string;
    onClick: () => void;
    icon?: React.ReactNode;
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
    icon?: React.ReactNode;
  };
  isError?: boolean;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  primaryAction,
  secondaryAction,
  isError = false,
  className,
}) => {
  return (
    <div
      className={twMerge(
        clsx(
          'flex flex-col items-center justify-center text-center p-6 sm:p-8 bg-surface rounded-card border border-border',
          className
        )
      )}
    >
      <div
        className={clsx(
          'w-14 h-14 rounded-[18px] flex items-center justify-center mb-3 text-2xl select-none',
          isError ? 'bg-dangerTint text-danger' : 'bg-accentTint text-accent'
        )}
      >
        {icon || (isError ? <IconAlertTriangle size={26} /> : null)}
      </div>

      <h3 className="text-base font-medium text-text mb-1">{title}</h3>
      <p className="text-xs text-textSecondary max-w-xs mb-5 leading-relaxed">
        {description}
      </p>

      {(primaryAction || secondaryAction) && (
        <div className="flex flex-col sm:flex-row items-center gap-2.5 w-full max-w-xs">
          {primaryAction && (
            <Button
              variant="primary"
              size="sm"
              onClick={primaryAction.onClick}
              leftIcon={primaryAction.icon}
              className="w-full sm:w-auto flex-1"
            >
              {primaryAction.label}
            </Button>
          )}

          {secondaryAction && (
            <Button
              variant="outline"
              size="sm"
              onClick={secondaryAction.onClick}
              leftIcon={secondaryAction.icon}
              className="w-full sm:w-auto flex-1"
            >
              {secondaryAction.label}
            </Button>
          )}
        </div>
      )}
    </div>
  );
};
