'use client';

import { useEffect } from 'react';
import { useRecallrAuth } from '@/providers/RecallrProvider';
import { useUserSettings } from '@recallr/api';

export function ThemeSync() {
  const { user } = useRecallrAuth();
  const { data: settings } = useUserSettings();

  useEffect(() => {
    if (!user) {
      document.documentElement.dataset.accentTheme = 'orange';
      return;
    }
    document.documentElement.dataset.accentTheme = settings?.accent_theme ?? 'orange';
  }, [user, settings?.accent_theme]);

  return null;
}
