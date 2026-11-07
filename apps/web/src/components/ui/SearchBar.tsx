import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { IconSearch, IconX } from '@tabler/icons-react';

export interface SearchBarProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  onClear?: () => void;
  focusedBorder?: boolean;
}

export const SearchBar = React.forwardRef<HTMLInputElement, SearchBarProps>(
  (
    {
      className,
      value,
      onChange,
      onClear,
      placeholder = 'Search name, company, note',
      focusedBorder = false,
      ...props
    },
    ref
  ) => {
    return (
      <div
        className={twMerge(
          clsx(
            'relative flex items-center h-[42px] bg-white rounded-input border border-border px-3.5 transition-all duration-150 focus-within:border-accent focus-within:ring-1 focus-within:ring-accent',
            focusedBorder && 'border-accent ring-1 ring-accent',
            className
          )
        )}
      >
        <IconSearch size={18} className="text-textMuted flex-shrink-0 mr-2.5" />
        <input
          ref={ref}
          type="text"
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className="flex-1 bg-transparent text-sm text-text placeholder:text-textMuted focus:outline-none min-w-0"
          {...props}
        />
        {value && onClear && (
          <button
            type="button"
            onClick={onClear}
            className="p-1 text-textMuted hover:text-text focus:outline-none flex-shrink-0 ml-1"
          >
            <IconX size={15} />
          </button>
        )}
      </div>
    );
  }
);

SearchBar.displayName = 'SearchBar';
