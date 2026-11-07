import React, { useEffect } from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  isDesktopDialog?: boolean;
}

export const BottomSheet: React.FC<BottomSheetProps> = ({
  isOpen,
  onClose,
  title,
  children,
  className,
  isDesktopDialog = false,
}) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/40 backdrop-blur-[1px] transition-opacity animate-in fade-in duration-200"
      />

      {/* Sheet / Dialog Container */}
      <div
        className={twMerge(
          clsx(
            'relative z-10 w-full max-w-lg bg-surface shadow-2xl transition-all duration-200 overflow-hidden',
            // Mobile bottom sheet style:
            'rounded-t-[24px] max-h-[90vh] flex flex-col',
            // Desktop dialog style when screen is sm+:
            isDesktopDialog && 'sm:rounded-card sm:max-h-[85vh]',
            className
          )
        )}
      >
        {/* Handle for bottom sheet */}
        <div className="w-full pt-3 pb-1 flex justify-center flex-shrink-0 cursor-grab active:cursor-grabbing sm:hidden">
          <div className="w-10 h-1 rounded-full bg-[#D6D3CC]" />
        </div>

        {title && (
          <div className="px-5 pt-3 pb-2 flex items-center justify-between border-b border-divider flex-shrink-0">
            <h2 className="text-base font-medium text-text">{title}</h2>
            <button
              type="button"
              onClick={onClose}
              className="w-7 h-7 rounded-full bg-bg text-textSecondary hover:text-text flex items-center justify-center text-sm"
            >
              ✕
            </button>
          </div>
        )}

        {/* Content body */}
        <div className="p-4 sm:p-5 overflow-y-auto max-h-[calc(90vh-60px)]">
          {children}
        </div>
      </div>
    </div>
  );
};
