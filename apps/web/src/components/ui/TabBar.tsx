import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import {
  IconHome,
  IconUsers,
  IconPlus,
  IconNotebook,
  IconSparkles,
} from '@tabler/icons-react';

export type TabKey = 'home' | 'people' | 'notes' | 'ask';

export interface TabBarProps {
  activeTab?: TabKey;
  onTabChange?: (tab: TabKey) => void;
  onQuickAdd?: () => void;
  isQuickAddOpen?: boolean;
  notesBadgeCount?: number;
  className?: string;
}

export const TabBar: React.FC<TabBarProps> = ({
  activeTab = 'home',
  onTabChange,
  onQuickAdd,
  isQuickAddOpen = false,
  notesBadgeCount = 0,
  className,
}) => {
  const badgeText = notesBadgeCount > 9 ? '9+' : String(notesBadgeCount);

  return (
    <nav
      aria-label="Bottom Navigation"
      className={twMerge(
        clsx(
          'relative w-full max-w-[420px] h-[64px] bg-white rounded-[30px] border border-border shadow-shadowNav px-2 flex items-center justify-between select-none',
          className
        )
      )}
    >
      {/* Home */}
      <button
        type="button"
        onClick={() => onTabChange?.('home')}
        className="flex-1 min-h-[48px] flex flex-col items-center justify-center py-1 transition-all duration-150 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 rounded-full"
      >
        <div className="relative w-[52px] h-[30px] flex items-center justify-center">
          {activeTab === 'home' && (
            <div className="absolute inset-0 bg-accentTint rounded-[15px] animate-in fade-in zoom-in-95 duration-150" />
          )}
          <IconHome
            size={20}
            stroke={activeTab === 'home' ? 2.4 : 1.8}
            className={clsx(
              'relative z-10 transition-transform duration-100 group-active:scale-95',
              activeTab === 'home' ? 'text-accent' : 'text-textMuted group-hover:text-text'
            )}
          />
        </div>
        <span
          className={clsx(
            'text-[11px] mt-0.5 leading-tight transition-colors',
            activeTab === 'home' ? 'text-accent font-medium' : 'text-textMuted group-hover:text-text'
          )}
        >
          Home
        </span>
      </button>

      {/* People */}
      <button
        type="button"
        onClick={() => onTabChange?.('people')}
        className="flex-1 min-h-[48px] flex flex-col items-center justify-center py-1 transition-all duration-150 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 rounded-full"
      >
        <div className="relative w-[52px] h-[30px] flex items-center justify-center">
          {activeTab === 'people' && (
            <div className="absolute inset-0 bg-accentTint rounded-[15px] animate-in fade-in zoom-in-95 duration-150" />
          )}
          <IconUsers
            size={20}
            stroke={activeTab === 'people' ? 2.4 : 1.8}
            className={clsx(
              'relative z-10 transition-transform duration-100 group-active:scale-95',
              activeTab === 'people' ? 'text-accent' : 'text-textMuted group-hover:text-text'
            )}
          />
        </div>
        <span
          className={clsx(
            'text-[11px] mt-0.5 leading-tight transition-colors',
            activeTab === 'people' ? 'text-accent font-medium' : 'text-textMuted group-hover:text-text'
          )}
        >
          People
        </span>
      </button>

      {/* Center Raised + Button */}
      <div className="relative w-[54px] flex items-center justify-center">
        <button
          type="button"
          onClick={onQuickAdd}
          aria-label="Quick Add"
          className={clsx(
            'absolute -top-[28px] w-[54px] h-[54px] rounded-full bg-accent border-[4px] border-bg text-white shadow-shadowAccent flex items-center justify-center transition-all duration-200 select-none cursor-pointer',
            'hover:brightness-105 active:scale-[0.92] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40',
            isQuickAddOpen && 'rotate-45'
          )}
        >
          <IconPlus size={26} stroke={2.8} />
        </button>
      </div>

      {/* Notes */}
      <button
        type="button"
        onClick={() => onTabChange?.('notes')}
        className="flex-1 min-h-[48px] flex flex-col items-center justify-center py-1 transition-all duration-150 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 rounded-full"
      >
        <div className="relative w-[52px] h-[30px] flex items-center justify-center">
          {activeTab === 'notes' && (
            <div className="absolute inset-0 bg-accentTint rounded-[15px] animate-in fade-in zoom-in-95 duration-150" />
          )}
          <IconNotebook
            size={20}
            stroke={activeTab === 'notes' ? 2.4 : 1.8}
            className={clsx(
              'relative z-10 transition-transform duration-100 group-active:scale-95',
              activeTab === 'notes' ? 'text-accent' : 'text-textMuted group-hover:text-text'
            )}
          />
          {notesBadgeCount > 0 && (
            <span className="absolute -top-1 right-2 min-w-[16px] h-4 rounded-full bg-danger text-white text-[9px] font-bold px-1 flex items-center justify-center border-[1.5px] border-white">
              {badgeText}
            </span>
          )}
        </div>
        <span
          className={clsx(
            'text-[11px] mt-0.5 leading-tight transition-colors',
            activeTab === 'notes' ? 'text-accent font-medium' : 'text-textMuted group-hover:text-text'
          )}
        >
          Notes
        </span>
      </button>

      {/* Ask AI */}
      <button
        type="button"
        onClick={() => onTabChange?.('ask')}
        className="flex-1 min-h-[48px] flex flex-col items-center justify-center py-1 transition-all duration-150 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 rounded-full"
      >
        <div className="relative w-[52px] h-[30px] flex items-center justify-center">
          {activeTab === 'ask' && (
            <div className="absolute inset-0 bg-accentTint rounded-[15px] animate-in fade-in zoom-in-95 duration-150" />
          )}
          <IconSparkles
            size={20}
            stroke={activeTab === 'ask' ? 2.4 : 1.8}
            className={clsx(
              'relative z-10 transition-transform duration-100 group-active:scale-95',
              activeTab === 'ask' ? 'text-accent' : 'text-textMuted group-hover:text-text'
            )}
          />
        </div>
        <span
          className={clsx(
            'text-[11px] mt-0.5 leading-tight transition-colors',
            activeTab === 'ask' ? 'text-accent font-medium' : 'text-textMuted group-hover:text-text'
          )}
        >
          Ask AI
        </span>
      </button>
    </nav>
  );
};
