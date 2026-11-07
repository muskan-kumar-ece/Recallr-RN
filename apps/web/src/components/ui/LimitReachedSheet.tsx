'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import {
  IconUsers,
  IconScan,
  IconSparkles,
  IconId,
  IconCrown,
} from '@tabler/icons-react';
import { BottomSheet } from './BottomSheet';
import { Button } from './Button';

export type LimitType = 'contacts' | 'scans' | 'ai' | 'cards';

export interface LimitReachedSheetProps {
  isOpen: boolean;
  onClose: () => void;
  type?: LimitType;
  onFreeAlternative?: () => void;
}

export const LimitReachedSheet: React.FC<LimitReachedSheetProps> = ({
  isOpen,
  onClose,
  type = 'contacts',
  onFreeAlternative,
}) => {
  const router = useRouter();

  const config = {
    contacts: {
      icon: <IconUsers size={28} />,
      title: "You've reached 50 contacts",
      description:
        'The Free plan includes up to 50 contacts. Upgrade to Recallr Pro for unlimited contacts, automated follow-ups, and full AI memory.',
      freeAction: null,
    },
    scans: {
      icon: <IconScan size={28} />,
      title: "You've used all 10 scans this month",
      description:
        'Your monthly scanning quota resets on the 1st of next month. Upgrade to Recallr Pro for unlimited business card OCR scans.',
      freeAction: {
        label: 'Add contact manually',
        onClick: () => {
          onClose();
          if (onFreeAlternative) {
            onFreeAlternative();
          } else {
            router.push('/people/new');
          }
        },
      },
    },
    ai: {
      icon: <IconSparkles size={28} />,
      title: "You've used today's 5 AI questions",
      description:
        'Daily Free AI queries reset at midnight. Upgrade to Recallr Pro for unlimited contextual AI recall and conversation history.',
      freeAction: null,
    },
    cards: {
      icon: <IconId size={28} />,
      title: 'Free includes 1 digital card',
      description:
        'Upgrade to Recallr Pro to create multiple custom cards for different businesses, projects, and languages.',
      freeAction: null,
    },
  }[type];

  const handleSeePro = () => {
    onClose();
    router.push('/upgrade');
  };

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} isDesktopDialog>
      <div className="flex flex-col items-center text-center p-2 sm:p-4">
        {/* Accent Icon Tile */}
        <div className="w-14 h-14 rounded-[18px] bg-accentTint flex items-center justify-center text-accent mb-3 shadow-sm">
          {config.icon}
        </div>

        <h3 className="text-lg font-medium text-text mb-1.5">{config.title}</h3>
        <p className="text-xs sm:text-sm text-textSecondary max-w-sm mb-6 leading-relaxed">
          {config.description}
        </p>

        {/* Action Buttons */}
        <div className="w-full max-w-xs space-y-2.5">
          <Button
            variant="primary"
            size="md"
            icon={<IconCrown size={18} />}
            onClick={handleSeePro}
            style={{ width: '100%' }}
          >
            See Recallr Pro
          </Button>

          {config.freeAction && (
            <Button
              variant="outline"
              size="md"
              onClick={config.freeAction.onClick}
              style={{ width: '100%' }}
            >
              {config.freeAction.label}
            </Button>
          )}

          <button
            type="button"
            onClick={onClose}
            className="text-xs text-textMuted hover:text-text font-medium py-1.5 block w-full transition-colors"
          >
            Maybe later
          </button>
        </div>
      </div>
    </BottomSheet>
  );
};
