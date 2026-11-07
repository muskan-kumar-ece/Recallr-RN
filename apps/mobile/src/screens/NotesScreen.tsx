import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { colors, radius } from '@recallr/tokens';
import { Card, OrangeCorner, PressableScale } from '../components/ui';
import { IconSearch, IconPlus, IconCheck, IconNotebook } from '@tabler/icons-react-native';
import { useNotes, useReminders, useCompleteReminder, useContacts } from '@recallr/api';

export interface NotesScreenProps {
  onOpenNewNote: () => void;
  onNavigateContact: (id: string) => void;
  onOpenSearch: () => void;
  onShowToast: (message: string) => void;
}

export const NotesScreen: React.FC<NotesScreenProps> = ({
  onOpenNewNote,
  onNavigateContact,
  onOpenSearch,
  onShowToast,
}) => {
  const [activeTab, setActiveTab] = useState<'All' | 'Reminders' | 'Done'>('All');
  const { data: dbNotes, isLoading: isNotesLoading } = useNotes();
  const { data: dbReminders, isLoading: isRemindersLoading } = useReminders();
  const { data: dbContacts } = useContacts();
  const completeReminder = useCompleteReminder();

  const contactMap = useMemo(() => {
    const map = new Map<string, string>();
    (dbContacts || []).forEach((c) => map.set(c.id, c.name));
    return map;
  }, [dbContacts]);

  const activeReminders = useMemo(() => {
    return (dbReminders || []).filter((r) => !r.done_at);
  }, [dbReminders]);

  const completedReminders = useMemo(() => {
    return (dbReminders || []).filter((r) => !!r.done_at);
  }, [dbReminders]);

  const filteredItems = useMemo(() => {
    if (activeTab === 'Reminders') {
      return { reminders: activeReminders, notes: [] };
    }
    if (activeTab === 'Done') {
      return { reminders: completedReminders, notes: [] };
    }
    return { reminders: activeReminders, notes: dbNotes || [] };
  }, [activeTab, activeReminders, completedReminders, dbNotes]);

  const handleToggleReminder = async (id: string, contactId?: string | null, isCurrentlyDone?: boolean) => {
    try {
      if (!isCurrentlyDone) {
        await completeReminder.mutateAsync({ id, contactId: contactId ?? null });
        onShowToast('Reminder completed');
      }
    } catch {
      onShowToast('Could not update reminder');
    }
  };

  const isLoading = isNotesLoading || isRemindersLoading;

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.headerRow}>
          <Text style={styles.headerTitle}>Notes</Text>
          <PressableScale
            onPress={onOpenSearch}
            haptic="light"
            style={styles.searchBtn}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <IconSearch size={20} color={colors.text} strokeWidth={1.8} />
          </PressableScale>
        </View>

        {/* Hero Card */}
        <Card style={styles.heroCard} onPress={onOpenNewNote}>
          <OrangeCorner
            size="md"
            onPress={onOpenNewNote}
            icon={<IconPlus size={20} color="#FFFFFF" strokeWidth={2.4} />}
          />
          <Text style={styles.heroTitle}>
            {activeReminders.length === 0
              ? 'No pending reminders'
              : `${activeReminders.length} reminder${activeReminders.length > 1 ? 's' : ''} pending`}
          </Text>
          <Text style={styles.heroSubtitle}>
            {activeReminders.length > 0
              ? `Next: ${activeReminders[0].title || 'Reminder'}`
              : 'Tap + to add a quick note or reminder'}
          </Text>
        </Card>

        {/* Filter Pills */}
        <View style={styles.filterRow}>
          {(['All', 'Reminders', 'Done'] as const).map((tab) => {
            const isActive = activeTab === tab;
            return (
              <PressableScale
                key={tab}
                onPress={() => setActiveTab(tab)}
                haptic="selection"
                style={[styles.filterPill, isActive && styles.filterPillActive]}
              >
                <Text
                  style={[
                    styles.filterText,
                    isActive && styles.filterTextActive,
                  ]}
                >
                  {tab}
                </Text>
              </PressableScale>
            );
          })}
        </View>

        {/* Reminders / Notes List */}
        {isLoading ? (
          <View style={{ gap: 12 }}>
            <Card style={{ height: 70, opacity: 0.6 }}><View /></Card>
            <Card style={{ height: 70, opacity: 0.6 }}><View /></Card>
          </View>
        ) : filteredItems.reminders.length === 0 && filteredItems.notes.length === 0 ? (
          <Card style={{ padding: 28, alignItems: 'center', marginTop: 12 }}>
            <View
              style={{
                width: 44,
                height: 44,
                borderRadius: 22,
                backgroundColor: colors.surface,
                borderWidth: 1,
                borderColor: colors.border,
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 10,
              }}
            >
              <IconNotebook size={22} color={colors.accent} strokeWidth={2} />
            </View>
            <Text style={{ fontSize: 16, fontWeight: '600', color: colors.text }}>No notes or reminders</Text>
            <Text style={{ fontSize: 13, color: colors.textSecondary, textAlign: 'center', marginTop: 4 }}>
              Add quick context, meeting outcomes, or follow-ups for your contacts.
            </Text>
            <PressableScale
              onPress={onOpenNewNote}
              haptic="light"
              style={[styles.filterPillActive, { paddingHorizontal: 16, height: 38, marginTop: 14 }]}
            >
              <Text style={{ color: '#FFFFFF', fontWeight: '600', fontSize: 14 }}>Create note</Text>
            </PressableScale>
          </Card>
        ) : (
          <>
            {filteredItems.reminders.length > 0 && (
              <>
                <View style={styles.sectionHeaderRow}>
                  <Text style={styles.sectionTitle}>Reminders</Text>
                  <Text style={styles.sectionDate}>
                    {activeTab === 'Done' ? 'Completed' : 'Pending'}
                  </Text>
                </View>

                <Card style={styles.cardGroup}>
                  {filteredItems.reminders.map((r, i) => {
                    const isDone = !!r.done_at;
                    const contactName = r.contact_id ? contactMap.get(r.contact_id) : undefined;
                    return (
                      <React.Fragment key={r.id}>
                        {i > 0 && <View style={styles.divider} />}
                        <View style={styles.reminderRow}>
                          <PressableScale
                            onPress={() => handleToggleReminder(r.id, r.contact_id, isDone)}
                            haptic="success"
                            style={[styles.checkbox, isDone && styles.checkboxDone]}
                            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                          >
                            {isDone && <IconCheck size={12} color="#FFFFFF" strokeWidth={3} />}
                          </PressableScale>

                          <View style={styles.reminderInfo}>
                            <Text style={[styles.reminderTitle, isDone && styles.textStrikethrough]}>
                              {r.title}
                            </Text>
                            <Text style={styles.reminderTime}>
                              {r.remind_at
                                ? new Date(r.remind_at).toLocaleDateString([], {
                                    month: 'short',
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit',
                                  })
                                : 'No date'}
                            </Text>
                          </View>

                          {contactName && r.contact_id && (
                            <PressableScale
                              onPress={() => onNavigateContact(r.contact_id!)}
                              haptic="light"
                              style={styles.personTag}
                              hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                            >
                              <Text style={styles.personTagText}>{contactName}</Text>
                            </PressableScale>
                          )}
                        </View>
                      </React.Fragment>
                    );
                  })}
                </Card>
              </>
            )}

            {filteredItems.notes.length > 0 && (
              <>
                <View style={styles.sectionHeaderRow}>
                  <Text style={styles.sectionTitle}>Notes</Text>
                </View>

                {filteredItems.notes.map((n) => {
                  const contactName = n.contact_id ? contactMap.get(n.contact_id) : undefined;
                  return (
                    <Card key={n.id} style={styles.noteItemCard}>
                      {n.title ? <Text style={styles.noteTitle}>{n.title}</Text> : null}
                      {n.body ? <Text style={styles.noteBody}>{n.body}</Text> : null}
                      <View style={styles.noteFooter}>
                        {contactName && n.contact_id ? (
                          <PressableScale
                            onPress={() => onNavigateContact(n.contact_id!)}
                            haptic="light"
                            style={styles.personTag}
                            hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                          >
                            <Text style={styles.personTagText}>{contactName}</Text>
                          </PressableScale>
                        ) : (
                          <View />
                        )}
                        <Text style={styles.noteDate}>
                          {new Date(n.created_at).toLocaleDateString([], {
                            day: 'numeric',
                            month: 'short',
                          })}
                        </Text>
                      </View>
                    </Card>
                  );
                })}
              </>
            )}
          </>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    paddingHorizontal: 14,
    paddingTop: 10,
    paddingBottom: 24,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: colors.text,
    fontFamily: 'Inter',
  },
  searchBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surface,
    borderWidth: 0.5,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroCard: {
    padding: 16,
    marginBottom: 14,
    position: 'relative',
  },
  heroTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
    fontFamily: 'Inter',
  },
  heroSubtitle: {
    fontSize: 12,
    color: colors.textMuted,
    fontFamily: 'Inter',
    marginTop: 2,
  },
  filterRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  filterPill: {
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: radius.full,
    backgroundColor: colors.surface,
    borderWidth: 0.5,
    borderColor: colors.border,
  },
  filterPillActive: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  filterText: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.textSecondary,
    fontFamily: 'Inter',
  },
  filterTextActive: {
    color: '#FFFFFF',
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    fontFamily: 'Inter',
  },
  sectionDate: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.textMuted,
    fontFamily: 'Inter',
  },
  cardGroup: {
    padding: 0,
    overflow: 'hidden',
    marginBottom: 16,
  },
  reminderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    gap: 12,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: colors.accent,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxDone: {
    backgroundColor: colors.accent,
  },
  textStrikethrough: {
    textDecorationLine: 'line-through',
    color: colors.textMuted,
  },
  reminderInfo: {
    flex: 1,
  },
  reminderTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
    fontFamily: 'Inter',
  },
  reminderTime: {
    fontSize: 12,
    color: colors.textMuted,
    fontFamily: 'Inter',
    marginTop: 2,
  },
  personTag: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.full,
    backgroundColor: colors.accentTint,
  },
  personTagText: {
    fontSize: 11,
    fontWeight: '500',
    color: colors.accentDark,
    fontFamily: 'Inter',
  },
  noteItemCard: {
    padding: 16,
    marginBottom: 16,
  },
  noteTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    fontFamily: 'Inter',
    marginBottom: 4,
  },
  noteBody: {
    fontSize: 13,
    color: colors.textSecondary,
    fontFamily: 'Inter',
    lineHeight: 18,
    marginBottom: 12,
  },
  noteFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  noteDate: {
    fontSize: 11,
    color: colors.textMuted,
    fontFamily: 'Inter',
  },
  divider: {
    height: 0.5,
    backgroundColor: colors.divider,
    marginHorizontal: 14,
  },
});
