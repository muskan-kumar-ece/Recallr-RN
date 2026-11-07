import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface SegmentOption<T extends string = string> {
  label: React.ReactNode;
  value: T;
}

export interface SegmentedControlProps<T extends string = string> {
  options: SegmentOption<T>[];
  value: T;
  onChange: (value: T) => void;
  className?: string;
}

export function SegmentedControl<T extends string = string>({
  options,
  value,
  onChange,
  className,
}: SegmentedControlProps<T>) {
  return (
    <div
      className={twMerge(
        clsx(
          'inline-flex items-center bg-[#EDEBE5] p-[3px] rounded-[20px] select-none',
          className
        )
      )}
    >
      {options.map((opt) => {
        const isSelected = opt.value === value;
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className={clsx(
              'px-4 py-1.5 text-xs font-medium rounded-[17px] transition-all duration-150 flex items-center justify-center whitespace-nowrap',
              isSelected
                ? 'bg-white text-text shadow-sm'
                : 'text-textSecondary hover:text-text'
            )}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
