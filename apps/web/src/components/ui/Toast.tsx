import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface ToastProps {
  message: string;
  actionText?: string;
  onAction?: () => void;
  isVisible: boolean;
  className?: string;
}

export const Toast: React.FC<ToastProps> = ({
  message,
  actionText = 'Undo',
  onAction,
  isVisible,
  className,
}) => {
  if (!isVisible) return null;

  return (
    <div
      role="alert"
      className={twMerge(
        clsx(
          'fixed bottom-20 left-1/2 -translate-x-1/2 z-50 flex items-center justify-between gap-4 bg-[#2B2B2B] text-white px-4 py-2.5 rounded-[14px] shadow-lg min-w-[280px] max-w-[360px] animate-in fade-in slide-in-from-bottom-2 duration-150',
          className
        )
      )}
    >
      <span className="text-xs text-white/95 font-normal truncate">
        {message}
      </span>
      {onAction && (
        <button
          type="button"
          onClick={onAction}
          className="text-xs font-medium text-[#FFB27F] hover:underline flex-shrink-0"
        >
          {actionText}
        </button>
      )}
    </div>
  );
};
