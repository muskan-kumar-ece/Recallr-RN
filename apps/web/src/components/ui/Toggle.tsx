import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  className?: string;
}

export const Toggle: React.FC<ToggleProps> = ({
  checked,
  onChange,
  disabled = false,
  className,
}) => {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={twMerge(
        clsx(
          'relative inline-flex h-[22px] w-[38px] flex-shrink-0 cursor-pointer rounded-full p-[2px] transition-colors duration-200 ease-in-out focus:outline-none select-none',
          checked ? 'bg-accent' : 'bg-[#D6D3CC]',
          disabled && 'opacity-50 cursor-not-allowed',
          className
        )
      )}
    >
      <span
        className={clsx(
          'pointer-events-none inline-block h-[18px] w-[18px] transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out',
          checked ? 'translate-x-[16px]' : 'translate-x-0'
        )}
      />
    </button>
  );
};
