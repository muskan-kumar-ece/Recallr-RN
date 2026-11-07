'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { Card } from '@/components/ui/Card';
import { Toggle } from '@/components/ui/Toggle';
import { Chip } from '@/components/ui/Chip';
import { Toast } from '@/components/ui/Toast';
import { Skeleton } from '@/components/ui/Skeleton';
import { useUserSettings, useUpdateUserSettings } from '@recallr/api';

export default function NotificationSettingsPage() {
  const router = useRouter();
  const { data: settings, isLoading } = useUserSettings();
  const { mutateAsync: updateSettings, isPending: isUpdating } = useUpdateUserSettings();

  const [followUpAlerts, setFollowUpAlerts] = useState(true);
  const [dailyDigest, setDailyDigest] = useState(true);
  const [digestTime, setDigestTime] = useState('08:30');
  const [nudgeDays, setNudgeDays] = useState(14);
  const [quietHours, setQuietHours] = useState(true);

  const [toastMessage, setToastMessage] = useState('');
  const [toastVisible, setToastVisible] = useState(false);

  useEffect(() => {
    if (settings) {
      if (settings.reminders_enabled !== undefined) setFollowUpAlerts(settings.reminders_enabled);
      if (settings.daily_brief_enabled !== undefined) setDailyDigest(settings.daily_brief_enabled);
      if (settings.daily_brief_time) setDigestTime(settings.daily_brief_time);
      if (settings.nudge_days !== undefined) setNudgeDays(settings.nudge_days);
      if (settings.quiet_hours_enabled !== undefined) setQuietHours(settings.quiet_hours_enabled);
    }
  }, [settings]);

  const nudgeOptions = [
    { label: '7 days', value: 7 },
    { label: '14 days', value: 14 },
    { label: '30 days', value: 30 },
    { label: '60 days', value: 60 },
  ];

  const handleToggleReminders = async (val: boolean) => {
    setFollowUpAlerts(val);
    try {
      await updateSettings({ reminders_enabled: val });
      setToastMessage(val ? 'Follow-up reminders enabled' : 'Follow-up reminders paused');
      setToastVisible(true);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to update reminder settings';
      setToastMessage(msg);
      setToastVisible(true);
    }
  };

  const handleToggleDailyDigest = async (val: boolean) => {
    setDailyDigest(val);
    try {
      await updateSettings({ daily_brief_enabled: val });
      setToastMessage(val ? 'Daily morning digest enabled' : 'Daily digest paused');
      setToastVisible(true);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to update digest settings';
      setToastMessage(msg);
      setToastVisible(true);
    }
  };

  const handleSelectNudgeDays = async (days: number) => {
    setNudgeDays(days);
    try {
      await updateSettings({ nudge_days: days });
      setToastMessage(`Default cadence set to ${days} days`);
      setToastVisible(true);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to update cadence';
      setToastMessage(msg);
      setToastVisible(true);
    }
  };

  const handleToggleQuietHours = async (val: boolean) => {
    setQuietHours(val);
    try {
      await updateSettings({ quiet_hours_enabled: val });
      setToastMessage(val ? 'Quiet hours activated' : 'Quiet hours turned off');
      setToastVisible(true);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to update quiet hours';
      setToastMessage(msg);
      setToastVisible(true);
    }
  };

  if (isLoading) {
    return (
      <div className="w-full max-w-xl mx-auto px-4 py-4 md:py-6 space-y-4">
        <ScreenHeader title="Notifications & Follow-ups" onBack={() => router.push('/settings')} />
        <Skeleton className="h-32 w-full rounded-card" />
        <Skeleton className="h-28 w-full rounded-card" />
        <Skeleton className="h-24 w-full rounded-card" />
      </div>
    );
  }

  return (
    <div className="w-full max-w-xl mx-auto px-4 py-4 md:py-6 space-y-4">
      <ScreenHeader
        title="Notifications & Follow-ups"
        subtitle="Manage alerts, reminders, and follow-up cadences"
        onBack={() => router.push('/settings')}
      />

      {/* Follow-up Alerts */}
      <Card className="p-4 bg-white border border-border space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-sm font-medium text-text">Follow-up reminders</span>
            <p className="text-[11px] text-textSecondary">Receive notifications for scheduled reminders</p>
          </div>
          <Toggle checked={followUpAlerts} onChange={handleToggleReminders} disabled={isUpdating} />
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-divider">
          <div>
            <span className="text-sm font-medium text-text">Daily morning digest</span>
            <p className="text-[11px] text-textSecondary">Briefing of who to contact today at {digestTime}</p>
          </div>
          <Toggle checked={dailyDigest} onChange={handleToggleDailyDigest} disabled={isUpdating} />
        </div>
      </Card>

      {/* Default Nudge Cadence */}
      <Card className="p-4 bg-white border border-border space-y-2.5">
        <label className="block text-xs font-medium text-textSecondary uppercase tracking-wider">
          Default Follow-Up Cadence
        </label>
        <p className="text-xs text-textSecondary">
          Remind me to follow up if a contact has not been reached in:
        </p>
        <div className="flex flex-wrap gap-2 pt-1">
          {nudgeOptions.map((opt) => (
            <Chip
              key={opt.value}
              variant={nudgeDays === opt.value ? 'selected' : 'default'}
              onClick={() => handleSelectNudgeDays(opt.value)}
            >
              {opt.label}
            </Chip>
          ))}
        </div>
      </Card>

      {/* Quiet Hours */}
      <Card className="p-4 bg-white border border-border space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-sm font-medium text-text">Quiet hours</span>
            <p className="text-[11px] text-textSecondary">Mute non-urgent notifications between 10:00 PM and 07:00 AM</p>
          </div>
          <Toggle checked={quietHours} onChange={handleToggleQuietHours} disabled={isUpdating} />
        </div>
      </Card>

      <Toast
        message={toastMessage}
        isVisible={toastVisible}
        actionText="Close"
        onAction={() => setToastVisible(false)}
      />
    </div>
  );
}
