import '../src/theme/runtime';
import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Platform,
} from 'react-native';
import { colors, radius } from '@recallr/tokens';
import { useRecallrAuth } from '../src/providers/RecallrProvider';
import { useReminders, useUserSettings, useCompleteReminder, useUpdateNote, useRegisterDevicePushToken } from '@recallr/api';
import type { Note, UserSettings } from '@recallr/core';
import { isInQuietHours } from '@recallr/core';
import * as Notifications from 'expo-notifications';
import { TabBar, TabKey, Toast, PressableScale } from '../src/components/ui';
import {
  HomeScreen,
  PeopleScreen,
  ContactProfileScreen,
  AskAIScreen,
  NotesScreen,
  CategoriesScreen,
  CategoryDetailScreen,
  SettingsScreen,
  SubscriptionScreen,
  SearchScreen,
  MyCardScreen,
  DocumentViewerScreen,
  MergeDuplicatesScreen,
  ImportContactsScreen,
  OnboardingScreen,
  SharedStatesScreen,
  ComponentsGalleryScreen,
  UpgradeModal,
  LimitReachedModal,
  EditContactModal,
  ShareContactSheet,
  NewNoteModal,
  NewCategoryModal,
  ThreeDotsSheet,
  QuickAddSheet,
  ScanCardScreen,
  NotificationSettingsScreen,
} from '../src/screens';
import { IconChevronDown } from '@tabler/icons-react-native';
import { setNativeAccentTheme } from '../src/theme/runtime';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

function reminderNotificationTime(remindAt: string, settings?: UserSettings | null): Date {
  const scheduled = new Date(remindAt);
  const now = Date.now();
  if (scheduled.getTime() < now) scheduled.setTime(now + 5000);
  if (!settings?.quiet_hours_enabled) return scheduled;

  const timezone = settings.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone;
  for (let step = 0; step <= 1440; step += 1) {
    const candidate = new Date(scheduled.getTime() + step * 60_000);
    if (!isInQuietHours(candidate, settings.quiet_start, settings.quiet_end, timezone)) return candidate;
  }
  return scheduled;
}

async function reconcileReminderNotifications(reminders: Note[], settings?: UserSettings | null): Promise<void> {
  if (Platform.OS === 'web') return;
  await Notifications.setNotificationCategoryAsync('reminder', [
    { identifier: 'done', buttonTitle: 'Done', options: { opensAppToForeground: false } },
    { identifier: 'snooze', buttonTitle: 'Snooze', options: { opensAppToForeground: false } },
  ]);
  await Notifications.cancelAllScheduledNotificationsAsync();
  if (settings?.reminders_enabled === false) return;
  const upcoming = reminders
    .filter((reminder) => reminder.remind_at && !reminder.done_at && !reminder.deleted_at)
    .sort((left, right) => new Date(left.remind_at || 0).getTime() - new Date(right.remind_at || 0).getTime())
    .slice(0, 60);
  await Promise.all(upcoming.map((reminder) => Notifications.scheduleNotificationAsync({
    identifier: reminder.id,
    content: {
      title: reminder.title || 'Recallr reminder',
      body: reminder.body || 'You have a follow-up to remember.',
      categoryIdentifier: 'reminder',
      data: { reminderId: reminder.id, contactId: reminder.contact_id || null },
    },
    trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: reminderNotificationTime(reminder.remind_at!, settings) },
  })));
}

export type ScreenId =
  | 'home'
  | 'people'
  | 'notes'
  | 'ask'
  | 'contact-profile'
  | 'contact-new'
  | 'contact-edit'
  | 'categories'
  | 'category-detail'
  | 'settings'
  | 'subscription'
  | 'search'
  | 'my-card'
  | 'document-viewer'
  | 'merge-duplicates'
  | 'import-contacts'
  | 'onboarding'
  | 'shared-states'
  | 'components-gallery'
  | 'scan'
  | 'settings-notifications';

export default function MobileAppRoot() {
  const { user, session, loading } = useRecallrAuth();
  const { data: dbReminders } = useReminders();
  const { data: userSettings } = useUserSettings();
  const { mutateAsync: completeReminder } = useCompleteReminder();
  const { mutateAsync: updateNote } = useUpdateNote();
  const { mutateAsync: registerDevicePushToken } = useRegisterDevicePushToken();
  const registeredPushToken = useRef<string | null>(null);

  useEffect(() => {
    setNativeAccentTheme(userSettings?.accent_theme || 'orange');
  }, [userSettings?.accent_theme]);
  useEffect(() => {
    if (Platform.OS === 'web' || !session || userSettings === undefined || userSettings?.reminders_enabled === false) {
      if (!session || userSettings?.reminders_enabled === false) registeredPushToken.current = null;
      return;
    }
    void (async () => {
      try {
        const permission = await Notifications.getPermissionsAsync();
        if (!permission.granted) return;
        await Notifications.setNotificationChannelAsync('reminders', {
          name: 'Reminders',
          importance: Notifications.AndroidImportance.HIGH,
        });
        const tokenResult = await Notifications.getDevicePushTokenAsync();
        const token = String(tokenResult.data);
        const registrationKey = `${user?.id || 'signed-out'}:${token}`;
        if (registeredPushToken.current === registrationKey) return;
        await registerDevicePushToken({ token, platform: Platform.OS === 'ios' ? 'ios' : 'android', enabled: true });
        registeredPushToken.current = registrationKey;
      } catch {
        // Local notifications remain available if native push registration is unavailable.
      }
    })();
  }, [session, user, userSettings, registerDevicePushToken]);
  const [currentScreen, setCurrentScreen] = useState<ScreenId>('home');
  const [activeTab, setActiveTab] = useState<TabKey>('home');

  const notesBadgeCount = useMemo(() => {
    if (!dbReminders) return 0;
    const now = new Date();
    const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
    return dbReminders.filter((r) => !r.done_at && r.remind_at && new Date(r.remind_at) <= todayEnd).length;
  }, [dbReminders]);

  useEffect(() => {
    if (!loading && (!session || (userSettings !== undefined && !userSettings?.onboarding_done))) {
      setCurrentScreen('onboarding');
    }
  }, [loading, session, userSettings]);

  // Modals & Sheets
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const [isThreeDotsOpen, setIsThreeDotsOpen] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [isEditContactOpen, setIsEditContactOpen] = useState(false);
  const [isNewNoteOpen, setIsNewNoteOpen] = useState(false);
  const [noteContactId, setNoteContactId] = useState<string | undefined>();
  const [noteStartsWithReminder, setNoteStartsWithReminder] = useState(false);
  const [isNewCatOpen, setIsNewCatOpen] = useState(false);
  const [isUpgradeOpen, setIsUpgradeOpen] = useState(false);
  const [isLimitReachedOpen, setIsLimitReachedOpen] = useState(false);
  const [isScreenPickerOpen, setIsScreenPickerOpen] = useState(false);
  const [activeContactId, setActiveContactId] = useState<string | undefined>(undefined);
  const [activeDocumentId, setActiveDocumentId] = useState<string | undefined>(undefined);
  const [activeCategoryId, setActiveCategoryId] = useState<string | undefined>(undefined);

  // Toast
  const [toastMessage, setToastMessage] = useState('');
  const [toastVisible, setToastVisible] = useState(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setToastVisible(true);
  };

  useEffect(() => {
    void reconcileReminderNotifications(dbReminders || [], userSettings).catch(() => {
      showToast('Could not schedule reminder notifications');
    });
  }, [dbReminders, userSettings]);

  const handleNavigate = (screen: string, params?: Record<string, unknown>) => {
    if (params?.id && typeof params.id === 'string') {
      if (screen === 'document-viewer') {
        setActiveDocumentId(params.id);
        if (typeof params.contactId === 'string') setActiveContactId(params.contactId);
      } else if (screen === 'contact-profile' || screen === 'contact-edit') {
        setActiveContactId(params.id);
      } else if (screen === 'category-detail') {
        setActiveCategoryId(params.id);
      }
    }

    if (screen === 'home') {
      setActiveTab('home');
      setCurrentScreen('home');
    } else if (screen === 'people') {
      setActiveTab('people');
      setCurrentScreen('people');
    } else if (screen === 'notes') {
      setActiveTab('notes');
      setCurrentScreen('notes');
    } else if (screen === 'ask') {
      setActiveTab('ask');
      setCurrentScreen('ask');
    } else if (screen === 'note-new') {
      setIsNewNoteOpen(true);
    } else if (screen === 'category-new') {
      setIsNewCatOpen(true);
    } else if (screen === 'contact-new') {
      setActiveContactId(undefined);
      setIsEditContactOpen(true);
    } else if (screen === 'contact-edit') {
      setIsEditContactOpen(true);
    } else if (screen === 'upgrade') {
      setIsUpgradeOpen(true);
    } else if (screen === 'scan') {
      setCurrentScreen('scan');
    } else if (screen === 'settings-notifications') {
      setCurrentScreen('settings-notifications');
    } else {
      setCurrentScreen(screen as ScreenId);
    }
  };

  useEffect(() => {
    const subscription = Notifications.addNotificationResponseReceivedListener((response) => {
      const data = response.notification.request.content.data;
      const reminderId = typeof data?.reminderId === 'string' ? data.reminderId : undefined;
      const reminder = dbReminders?.find((item) => item.id === reminderId);
      void (async () => {
        try {
          if (reminderId && response.actionIdentifier === 'done') {
            await completeReminder({ id: reminderId, contactId: reminder?.contact_id || null });
            showToast('Reminder completed');
          } else if (reminderId && response.actionIdentifier === 'snooze' && reminder?.remind_at) {
            const snoozeMinutes = userSettings?.snooze_minutes ?? 60;
            await updateNote({
              id: reminderId,
              input: { remind_at: new Date(Date.now() + snoozeMinutes * 60_000).toISOString() },
            });
            showToast(`Reminder snoozed for ${snoozeMinutes} minutes`);
          } else {
            const contactId = typeof data?.contactId === 'string' ? data.contactId : undefined;
            if (contactId) {
              setActiveContactId(contactId);
              setActiveTab('people');
              setCurrentScreen('contact-profile');
            } else {
              handleNavigate('notes');
            }
          }
        } catch (error: unknown) {
          showToast(error instanceof Error ? error.message : 'Could not update reminder');
        }
      })();
    });
    return () => subscription.remove();
  }, [dbReminders, userSettings, completeReminder, updateNote]);

  const handleTabChange = (tab: TabKey) => {
    setActiveTab(tab);
    setCurrentScreen(tab as ScreenId);
  };

  const allScreens: { id: ScreenId; label: string }[] = [
    { id: 'home', label: '1. Home Tab' },
    { id: 'people', label: '2. People Tab (A-Z)' },
    { id: 'notes', label: '3. Notes & Reminders' },
    { id: 'ask', label: '4. Ask Recallr AI' },
    { id: 'contact-profile', label: '5. Contact Profile' },
    { id: 'categories', label: '6. Categories Overview' },
    { id: 'category-detail', label: '7. Category Detail' },
    { id: 'settings', label: '8. Settings' },
    { id: 'subscription', label: '9. Subscription & Usage' },
    { id: 'search', label: '10. Global Search' },
    { id: 'my-card', label: '11. My Digital Card' },
    { id: 'document-viewer', label: '12. Document Viewer' },
    { id: 'merge-duplicates', label: '13. Merge Duplicates' },
    { id: 'import-contacts', label: '14. Import Contacts' },
    { id: 'onboarding', label: '15. Onboarding / Sign In' },
    { id: 'shared-states', label: '16. Shared States / Edge Cases' },
    { id: 'components-gallery', label: '17. Component Parity Gallery' },
    { id: 'scan', label: '18. Scan Card' },
  ];

  const isTabScreen = ['home', 'people', 'notes', 'ask'].includes(currentScreen);

  if (loading) {
    return (
      <SafeAreaView style={[styles.safeArea, { alignItems: 'center', justifyContent: 'center' }]}>
        <View
          style={{
            width: 48,
            height: 48,
            borderRadius: 14,
            backgroundColor: colors.accent,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Text style={{ color: '#fff', fontSize: 24, fontWeight: '700' }}>R</Text>
        </View>
        <Text style={{ marginTop: 12, fontSize: 13, color: colors.textSecondary }}>Loading Recallr...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Dev Screen Jump Switcher */}
      <View style={styles.screenJumpBar}>
        <PressableScale
          onPress={() => setIsScreenPickerOpen(!isScreenPickerOpen)}
          haptic="light"
          style={styles.screenJumpBtn}
        >
          <Text style={styles.screenJumpText}>
            Screen:{' '}
            <Text style={styles.screenJumpActiveName}>
              {allScreens.find((s) => s.id === currentScreen)?.label.split('. ')[1] ||
                currentScreen}
            </Text>
          </Text>
          <IconChevronDown size={14} color={colors.accent} strokeWidth={2.5} />
        </PressableScale>

        <PressableScale
          onPress={() => setIsUpgradeOpen(true)}
          haptic="light"
          style={styles.quickPaywallBtn}
        >
          <Text style={styles.quickPaywallText}>Pro Paywall</Text>
        </PressableScale>
      </View>

      {/* Screen Jump Dropdown List */}
      {isScreenPickerOpen && (
        <View style={styles.dropdownOverlay}>
          <ScrollView style={styles.dropdownScroll}>
            {allScreens.map((s) => (
              <PressableScale
                key={s.id}
                onPress={() => {
                  setCurrentScreen(s.id);
                  if (['home', 'people', 'notes', 'ask'].includes(s.id)) {
                    setActiveTab(s.id as TabKey);
                  }
                  setIsUpgradeOpen(false);
                  setIsScreenPickerOpen(false);
                }}
                haptic="selection"
                style={[
                  styles.dropdownRow,
                  currentScreen === s.id && styles.dropdownRowActive,
                ]}
              >
                <Text
                  style={[
                    styles.dropdownText,
                    currentScreen === s.id && styles.dropdownTextActive,
                  ]}
                >
                  {s.label}
                </Text>
              </PressableScale>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Main Screen Content View */}
      <View style={styles.screenContent}>
        {currentScreen === 'home' && (
          <HomeScreen
            onNavigate={handleNavigate}
            onShowToast={showToast}
          />
        )}

        {currentScreen === 'people' && (
          <PeopleScreen
            onNavigate={handleNavigate}
            onShowToast={showToast}
          />
        )}

        {currentScreen === 'notes' && (
          <NotesScreen
            onOpenNewNote={() => setIsNewNoteOpen(true)}
            onNavigateContact={(id) => handleNavigate('contact-profile', { id })}
            onOpenSearch={() => handleNavigate('search')}
            onShowToast={showToast}
          />
        )}

        {currentScreen === 'ask' && (
          <AskAIScreen
            onNavigateContact={(id) => handleNavigate('contact-profile', { id })}
            onShowToast={showToast}
          />
        )}

        {currentScreen === 'contact-profile' && (
          <ContactProfileScreen
            contactId={activeContactId}
            onBack={() => handleNavigate('home')}
            onEdit={() => setIsEditContactOpen(true)}
            onShare={() => setIsShareOpen(true)}
            onOpenMenu={() => setIsThreeDotsOpen(true)}
            onOpenDocument={(documentId) => handleNavigate('document-viewer', { id: documentId, contactId: activeContactId })}
            onAskAI={(query) => handleNavigate('ask', { query })}
            onShowToast={showToast}
            onSetReminder={() => {
              setNoteContactId(activeContactId);
              setNoteStartsWithReminder(true);
              setIsNewNoteOpen(true);
            }}
            onAddNote={() => {
              setNoteContactId(activeContactId);
              setNoteStartsWithReminder(false);
              setIsNewNoteOpen(true);
            }}
            onOpenReminder={() => handleNavigate('notes')}
          />
        )}

        {currentScreen === 'categories' && (
          <CategoriesScreen
            onBack={() => handleNavigate('home')}
            onOpenDetail={(id) => handleNavigate('category-detail', { id })}
            onOpenNewCategory={() => setIsNewCatOpen(true)}
          />
        )}

        {currentScreen === 'category-detail' && (
          <CategoryDetailScreen
            categoryId={activeCategoryId}
            onBack={() => handleNavigate('categories')}
            onOpenMenu={() => setIsThreeDotsOpen(true)}
            onEditCategory={() => setIsNewCatOpen(true)}
            onAddPerson={() => {
              setActiveContactId(undefined);
              setIsEditContactOpen(true);
            }}
            onAskGroup={() => handleNavigate('ask', { query: 'Summarize contacts in this category' })}
            onSelectPerson={(id) => handleNavigate('contact-profile', { id })}
          />
        )}

        {currentScreen === 'settings' && (
          <SettingsScreen
            onBack={() => handleNavigate('home')}
            onOpenMyCard={() => handleNavigate('my-card')}
            onOpenSubscription={() => handleNavigate('subscription')}
            onOpenNotifications={() => handleNavigate('settings-notifications')}
            onOpenImportExport={() => handleNavigate('import-contacts')}
            onShowToast={showToast}
          />
        )}

        {currentScreen === 'settings-notifications' && (
          <NotificationSettingsScreen
            onBack={() => handleNavigate('settings')}
            onShowToast={showToast}
          />
        )}

        {currentScreen === 'subscription' && (
          <SubscriptionScreen
            onBack={() => handleNavigate('settings')}
            onOpenUpgrade={() => setIsUpgradeOpen(true)}
            onShowToast={showToast}
          />
        )}

        {currentScreen === 'search' && (
          <SearchScreen
            onCancel={() => handleNavigate('home')}
            onSelectPerson={(id) => handleNavigate('contact-profile', { id })}
            onSelectCategory={(id) => handleNavigate('category-detail', { id })}
            onAskAI={(query) => handleNavigate('ask', { query })}
          />
        )}

        {currentScreen === 'scan' && (
          <ScanCardScreen
            onBack={() => handleNavigate('home')}
            onSaved={(id) => handleNavigate('contact-profile', { id })}
            onShowToast={showToast}
          />
        )}

        {currentScreen === 'my-card' && (
          <MyCardScreen
            onClose={() => handleNavigate('home')}
            onShowToast={showToast}
          />
        )}

        {currentScreen === 'document-viewer' && (
          <DocumentViewerScreen
            contactId={activeContactId}
            documentId={activeDocumentId}
            onBack={() => handleNavigate('contact-profile', { id: activeContactId })}
            onOpenContact={(id) => handleNavigate('contact-profile', { id })}
            onShowToast={showToast}
          />
        )}

        {currentScreen === 'merge-duplicates' && (
          <MergeDuplicatesScreen
            onBack={() => handleNavigate('contact-profile')}
            onMerged={() => handleNavigate('contact-profile')}
            onKeepBoth={() => handleNavigate('contact-profile')}
            onShowToast={showToast}
          />
        )}

        {currentScreen === 'import-contacts' && (
          <ImportContactsScreen
            onBack={() => handleNavigate('home')}
            onImportComplete={() => handleNavigate('people')}
            onShowToast={showToast}
          />
        )}

        {currentScreen === 'onboarding' && (
          <OnboardingScreen
            onComplete={() => handleNavigate('home')}
            onShowToast={showToast}
          />
        )}

        {currentScreen === 'shared-states' && (
          <SharedStatesScreen
            onScanCard={() => setIsLimitReachedOpen(true)}
            onAddManually={() => setIsEditContactOpen(true)}
            onRetry={() => showToast('Retrying network fetch...')}
            onUndo={() => showToast('Undo successful')}
          />
        )}

        {currentScreen === 'components-gallery' && (
          <ComponentsGalleryScreen onShowToast={showToast} />
        )}
      </View>

      {/* Floating Bottom TabBar for main tabs */}
      {isTabScreen && (
        <View style={styles.tabBarWrapper} pointerEvents="box-none">
          <TabBar
            activeTab={activeTab}
            onTabChange={handleTabChange}
            onQuickAdd={() => setIsQuickAddOpen(true)}
            isQuickAddOpen={isQuickAddOpen}
            notesBadgeCount={notesBadgeCount}
          />
        </View>
      )}

      {/* Modals & Overlays */}
      {isQuickAddOpen && (
        <QuickAddSheet
          onClose={() => setIsQuickAddOpen(false)}
          onScanCard={() => {
            setIsQuickAddOpen(false);
            setIsLimitReachedOpen(true);
          }}
          onAddContact={() => {
            setIsQuickAddOpen(false);
            setIsEditContactOpen(true);
          }}
          onNewNote={() => {
            setIsQuickAddOpen(false);
            setIsNewNoteOpen(true);
          }}
          onImport={() => {
            setIsQuickAddOpen(false);
            handleNavigate('import-contacts');
          }}
        />
      )}

      {isThreeDotsOpen && (
        <ThreeDotsSheet
          onClose={() => setIsThreeDotsOpen(false)}
          onEdit={() => setIsEditContactOpen(true)}
          onShare={() => setIsShareOpen(true)}
          onMerge={() => handleNavigate('merge-duplicates')}
          onDelete={() => showToast('Contact deleted (Undo available)')}
        />
      )}

      {isShareOpen && (
        <ShareContactSheet
          onClose={() => setIsShareOpen(false)}
          onShowToast={showToast}
        />
      )}

      {isEditContactOpen && (
        <EditContactModal
          contactId={activeContactId}
          onClose={() => setIsEditContactOpen(false)}
          onSave={() => setIsEditContactOpen(false)}
          onDelete={() => {
            setIsEditContactOpen(false);
            showToast('Contact deleted');
            handleNavigate('people');
          }}
          onShowToast={showToast}
        />
      )}

      {isNewNoteOpen && (
        <NewNoteModal
          initialContactId={noteContactId}
          initialRemindMe={noteStartsWithReminder}
          onClose={() => {
            setIsNewNoteOpen(false);
            setNoteContactId(undefined);
            setNoteStartsWithReminder(false);
          }}
          onSave={() => {
            setIsNewNoteOpen(false);
            setNoteContactId(undefined);
            setNoteStartsWithReminder(false);
          }}
          onShowToast={showToast}
        />
      )}

      {isNewCatOpen && (
        <NewCategoryModal
          onClose={() => setIsNewCatOpen(false)}
          onCreate={(name) => {
            setIsNewCatOpen(false);
            handleNavigate('category-detail', { id: name });
          }}
          onShowToast={showToast}
        />
      )}

      {isUpgradeOpen && (
        <UpgradeModal
          onClose={() => setIsUpgradeOpen(false)}
          onSuccess={() => setIsUpgradeOpen(false)}
          onShowToast={showToast}
        />
      )}

      {isLimitReachedOpen && (
        <LimitReachedModal
          onSeePro={() => {
            setIsLimitReachedOpen(false);
            setIsUpgradeOpen(true);
          }}
          onAddManually={() => {
            setIsLimitReachedOpen(false);
            setIsEditContactOpen(true);
          }}
          onClose={() => setIsLimitReachedOpen(false)}
        />
      )}

      {/* Floating Global Undo Toast */}
      {toastVisible && (
        <Toast
          message={toastMessage}
          actionLabel="Undo"
          onAction={() => {
            showToast('Action undone');
          }}
          onDismiss={() => setToastVisible(false)}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  screenJumpBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 6,
    backgroundColor: colors.surface,
    borderBottomWidth: 0.5,
    borderBottomColor: colors.border,
    zIndex: 100,
  },
  screenJumpBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: radius.card,
    backgroundColor: colors.fill,
    gap: 6,
  },
  screenJumpText: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.textSecondary,
    fontFamily: 'Inter',
  },
  screenJumpActiveName: {
    color: colors.accent,
    fontWeight: '700',
  },
  quickPaywallBtn: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: radius.full,
    backgroundColor: colors.accentTint,
  },
  quickPaywallText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.accentDark,
    fontFamily: 'Inter',
  },
  dropdownOverlay: {
    position: 'absolute',
    top: 48,
    left: 14,
    right: 14,
    maxHeight: 320,
    backgroundColor: colors.surface,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
    zIndex: 9999,
  },
  dropdownScroll: {
    padding: 6,
  },
  dropdownRow: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
  },
  dropdownRowActive: {
    backgroundColor: colors.accentTint,
  },
  dropdownText: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.text,
    fontFamily: 'Inter',
  },
  dropdownTextActive: {
    color: colors.accentDark,
    fontWeight: '700',
  },
  screenContent: {
    flex: 1,
  },
  tabBarWrapper: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 999,
  },
});
