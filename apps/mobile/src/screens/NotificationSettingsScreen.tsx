import React, { useEffect, useState } from 'react';
import { Platform, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { colors, radius } from '@recallr/tokens';
import { useRegisterDevicePushToken, useUpdateUserSettings, useUserSettings } from '@recallr/api';
import { Card, PressableScale, Toggle } from '../components/ui';
import { IconArrowLeft } from '@tabler/icons-react-native';
import * as Notifications from 'expo-notifications';
import type { UserSettingsInput } from '@recallr/core';

export interface NotificationSettingsScreenProps {
  onBack: () => void;
  onShowToast: (message: string) => void;
}

export const NotificationSettingsScreen: React.FC<NotificationSettingsScreenProps> = ({ onBack, onShowToast }) => {
  const { data: settings, isLoading } = useUserSettings();
  const { mutateAsync: updateSettings, isPending } = useUpdateUserSettings();
  const { mutateAsync: registerPushToken } = useRegisterDevicePushToken();
  const [reminderTime, setReminderTime] = useState('09:00');
  const [briefTime, setBriefTime] = useState('08:30');
  const [quietStart, setQuietStart] = useState('22:00');
  const [quietEnd, setQuietEnd] = useState('07:00');

  useEffect(() => {
    setReminderTime(settings?.default_reminder_time || '09:00');
    setBriefTime(settings?.daily_brief_time || '08:30');
    setQuietStart(settings?.quiet_start || '22:00');
    setQuietEnd(settings?.quiet_end || '07:00');
  }, [settings?.default_reminder_time, settings?.daily_brief_time, settings?.quiet_start, settings?.quiet_end]);

  const update = async (key: 'reminders_enabled' | 'nudges_enabled' | 'daily_brief_enabled' | 'quiet_hours_enabled', value: boolean) => {
    try {
      if (key === 'reminders_enabled' && value) {
        const current = await Notifications.getPermissionsAsync();
        const permission = current.granted ? current : await Notifications.requestPermissionsAsync();
        if (!permission.granted) {
          onShowToast('Allow notifications in device settings to receive reminders');
          return;
        }
        await Notifications.setNotificationChannelAsync('reminders', {
          name: 'Reminders',
          importance: Notifications.AndroidImportance.HIGH,
        });
      }
      await updateSettings({ [key]: value });
      if (key === 'reminders_enabled' && Platform.OS !== 'web') {
        try {
          const permission = await Notifications.getPermissionsAsync();
          if (permission.granted || !value) {
            const nativeToken = await Notifications.getDevicePushTokenAsync();
            await registerPushToken({ token: String(nativeToken.data), platform: Platform.OS === 'ios' ? 'ios' : 'android', enabled: value });
          }
        } catch {
          onShowToast(value ? 'Reminders are enabled locally, but remote push could not be registered' : 'Reminders are disabled locally, but remote push could not be updated');
        }
      }
    } catch (error: unknown) {
      onShowToast(error instanceof Error ? error.message : 'Could not update notification settings');
    }
  };

  const chooseDays = async (days: number) => {
    try {
      await updateSettings({ nudge_days: days });
    } catch (error: unknown) {
      onShowToast(error instanceof Error ? error.message : 'Could not update follow-up cadence');
    }
  };

  const savePreference = async (input: Partial<UserSettingsInput>) => {
    try {
      await updateSettings(input);
    } catch (error: unknown) {
      onShowToast(error instanceof Error ? error.message : 'Could not save notification setting');
    }
  };

  const saveTime = (key: 'default_reminder_time' | 'daily_brief_time' | 'quiet_start' | 'quiet_end', value: string) => {
    if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(value)) {
      onShowToast('Enter a valid time in 24-hour format, such as 09:00');
      return;
    }
    void savePreference({ [key]: value });
  };

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <PressableScale onPress={onBack} style={styles.back} haptic="light">
          <IconArrowLeft size={20} color={colors.text} />
        </PressableScale>
        <Text style={styles.title}>Notifications</Text>
      </View>
      <ScrollView contentContainerStyle={styles.content}>
        <Card style={styles.card}>
          {([
            ['reminders_enabled', 'Reminders', 'Alerts for notes with a time', settings?.reminders_enabled ?? true],
            ['nudges_enabled', 'Follow-up nudges', 'Remind me about people I have not contacted', settings?.nudges_enabled ?? true],
            ['daily_brief_enabled', "Today's summary", 'Reminders and follow-ups each morning', settings?.daily_brief_enabled ?? true],
            ['quiet_hours_enabled', 'Quiet hours', 'Pause alerts at night', settings?.quiet_hours_enabled ?? true],
          ] as const).map(([key, label, caption, enabled], index) => (
            <React.Fragment key={key}>
              {index > 0 && <View style={styles.divider} />}
              <View style={styles.settingRow}>
                <View style={styles.settingCopy}>
                  <Text style={styles.label}>{label}</Text>
                  <Text style={styles.caption}>{caption}</Text>
                </View>
                <Toggle value={enabled} disabled={isLoading || isPending} onValueChange={(value) => void update(key, value)} />
              </View>
            </React.Fragment>
          ))}
        </Card>
        <Card style={styles.card}>
          <Text style={styles.label}>Nudge me after</Text>
          <Text style={styles.caption}>Days without contacting someone</Text>
          <View style={styles.chips}>
            {[14, 30, 60].map((days) => {
              const selected = (settings?.nudge_days ?? 30) === days;
              return (
                <PressableScale key={days} onPress={() => void chooseDays(days)} disabled={isPending} haptic="selection" style={[styles.chip, selected && styles.chipSelected]}>
                  <Text style={[styles.chipText, selected && styles.chipTextSelected]}>{days} days</Text>
                </PressableScale>
              );
            })}
          </View>
          <Text style={styles.caption}>Default reminder time: {settings?.default_reminder_time || '09:00'} · Daily brief: {settings?.daily_brief_time || '08:30'}</Text>
        </Card>
        <Card style={styles.preferenceCard}>
          <Text style={styles.label}>Default reminder time</Text>
          <TextInput value={reminderTime} onChangeText={setReminderTime} onEndEditing={() => saveTime('default_reminder_time', reminderTime)} placeholder="09:00" style={styles.timeInput} />
          <View style={styles.divider} />
          <Text style={styles.label}>Snooze for</Text>
          <View style={styles.chips}>
            {([15, 30, 60, 180] as const).map((minutes) => {
              const selected = (settings?.snooze_minutes ?? 60) === minutes;
              return <PressableScale key={minutes} onPress={() => void savePreference({ snooze_minutes: minutes })} style={[styles.chip, selected && styles.chipSelected]}><Text style={[styles.chipText, selected && styles.chipTextSelected]}>{minutes < 60 ? `${minutes} min` : `${minutes / 60} hour${minutes > 60 ? 's' : ''}`}</Text></PressableScale>;
            })}
          </View>
          <View style={styles.divider} />
          <Text style={styles.label}>Daily brief send time</Text>
          <TextInput value={briefTime} onChangeText={setBriefTime} onEndEditing={() => saveTime('daily_brief_time', briefTime)} placeholder="08:30" style={styles.timeInput} />
        </Card>
        <Card style={styles.preferenceCard}>
          <Text style={styles.label}>Quiet hours</Text>
          <Text style={styles.caption}>Use 24-hour local time</Text>
          <View style={styles.timeRow}>
            <View style={styles.timeField}><Text style={styles.caption}>From</Text><TextInput value={quietStart} onChangeText={setQuietStart} onEndEditing={() => saveTime('quiet_start', quietStart)} style={styles.timeInput} /></View>
            <View style={styles.timeField}><Text style={styles.caption}>Until</Text><TextInput value={quietEnd} onChangeText={setQuietEnd} onEndEditing={() => saveTime('quiet_end', quietEnd)} style={styles.timeInput} /></View>
          </View>
        </Card>
        <Card style={styles.preferenceCard}>
          <Text style={styles.label}>Custom nudge interval</Text>
          <Text style={styles.caption}>Choose a number from 7 to 365 days</Text>
          <TextInput value={String(settings?.nudge_days ?? 30)} keyboardType="number-pad" onEndEditing={(event) => {
            const days = Number(event.nativeEvent.text);
            if (Number.isInteger(days) && days >= 7 && days <= 365) void chooseDays(days);
            else onShowToast('Enter a value from 7 to 365 days');
          }} style={styles.timeInput} />
        </Card>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, paddingVertical: 10 },
  back: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  title: { color: colors.text, fontSize: 20, fontWeight: '600' },
  content: { padding: 14, gap: 12, paddingBottom: 36 },
  card: { padding: 0, overflow: 'hidden' },
  settingRow: { minHeight: 68, paddingHorizontal: 14, paddingVertical: 12, flexDirection: 'row', alignItems: 'center', gap: 12 },
  settingCopy: { flex: 1, gap: 3 },
  label: { color: colors.text, fontSize: 14, fontWeight: '500' },
  caption: { color: colors.textSecondary, fontSize: 11, lineHeight: 16 },
  divider: { height: 0.5, backgroundColor: colors.divider, marginHorizontal: 14 },
  chips: { flexDirection: 'row', gap: 8, marginVertical: 12 },
  chip: { borderColor: colors.border, borderWidth: 1, borderRadius: radius.full, paddingHorizontal: 14, paddingVertical: 8, backgroundColor: colors.surface },
  chipSelected: { backgroundColor: colors.accent, borderColor: colors.accent },
  chipText: { color: colors.textSecondary, fontSize: 12 },
  chipTextSelected: { color: colors.surface },
  preferenceCard: { padding: 14, gap: 8 },
  timeInput: { minHeight: 40, borderWidth: 1, borderColor: colors.border, borderRadius: radius.input, paddingHorizontal: 12, color: colors.text, marginVertical: 6 },
  timeRow: { flexDirection: 'row', gap: 12 },
  timeField: { flex: 1 },
});
