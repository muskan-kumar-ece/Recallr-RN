import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Radius, Typography } from '../../src/constants/theme';
import { Card, OrangeCorner, Chip, EmptyState } from '../../src/components/ui';
import { useToast } from '../../src/context/ToastContext';
import { INITIAL_NOTES } from '../../src/data/mockData';
import { Note } from '../../src/types/database';

export default function NotesScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { showToast } = useToast();

  const [notes, setNotes] = useState<Note[]>(INITIAL_NOTES);
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('all');

  const toggleDone = (id: string) => {
    setNotes((prev) =>
      prev.map((n) => {
        if (n.id === id) {
          const newDone = !n.done;
          showToast(newDone ? 'Marked as completed' : 'Marked as pending', {
            undoLabel: 'Undo',
            onUndo: () => toggleDone(id),
          });
          return { ...n, done: newDone };
        }
        return n;
      })
    );
  };

  const filteredNotes = notes.filter((n) => {
    if (filter === 'pending') return !n.done;
    if (filter === 'completed') return n.done;
    return true;
  });

  return (
    <SafeAreaView style={[styles.safeArea, { paddingTop: Platform.OS === 'android' ? insets.top : 0 }]}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.phoneFrame}>
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>Notes & Reminders</Text>
              <Text style={styles.subtitle}>
                {notes.filter((n) => !n.done).length} pending follow-ups
              </Text>
            </View>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => router.push('/notes/new')}
              style={styles.iconBtn}
            >
              <Ionicons name="add" size={22} color={Colors.accent} />
            </TouchableOpacity>
          </View>

          {/* Filter Chips */}
          <View style={styles.chipRow}>
            <Chip
              label="All"
              active={filter === 'all'}
              onPress={() => setFilter('all')}
              count={notes.length}
            />
            <Chip
              label="Pending"
              active={filter === 'pending'}
              onPress={() => setFilter('pending')}
              count={notes.filter((n) => !n.done).length}
            />
            <Chip
              label="Completed"
              active={filter === 'completed'}
              onPress={() => setFilter('completed')}
              count={notes.filter((n) => n.done).length}
            />
          </View>

          {/* Notes List */}
          {filteredNotes.length === 0 ? (
            <EmptyState
              icon="checkmark-done-circle-outline"
              title="All Caught Up!"
              message="No follow-up reminders right now. Tap + to set one."
              actionLabel="Create Note"
              onAction={() => router.push('/notes/new')}
            />
          ) : (
            filteredNotes.map((note) => (
              <Card key={note.id} style={styles.noteCard}>
                <View style={styles.cardHeader}>
                  <TouchableOpacity
                    onPress={() => toggleDone(note.id)}
                    style={styles.checkboxContainer}
                  >
                    <View
                      style={[
                        styles.checkbox,
                        note.done && styles.checkboxActive,
                      ]}
                    >
                      {note.done && (
                        <Ionicons name="checkmark" size={14} color="#FFFFFF" />
                      )}
                    </View>
                  </TouchableOpacity>

                  <View style={{ flex: 1 }}>
                    <Text
                      style={[
                        styles.noteTitle,
                        note.done && styles.noteTitleDone,
                      ]}
                    >
                      {note.title || 'Note'}
                    </Text>
                    {note.contact_name ? (
                      <View style={styles.contactTag}>
                        <Ionicons name="person-outline" size={12} color={Colors.accent} />
                        <Text style={styles.contactTagText}>{note.contact_name}</Text>
                      </View>
                    ) : null}
                  </View>
                </View>

                <Text style={styles.noteContent}>{note.content}</Text>

                <View style={styles.metaRow}>
                  {note.remind_at ? (
                    <View style={styles.reminderBadge}>
                      <Ionicons name="alarm-outline" size={13} color={Colors.accent} />
                      <Text style={styles.reminderText}>{note.remind_at}</Text>
                    </View>
                  ) : null}

                  {note.repeat && note.repeat !== 'none' ? (
                    <View style={styles.repeatBadge}>
                      <Ionicons name="repeat-outline" size={13} color={Colors.secondary} />
                      <Text style={styles.repeatText}>{note.repeat}</Text>
                    </View>
                  ) : null}
                </View>

                {/* Signature Orange Corner with check or note icon */}
                <OrangeCorner
                  icon={note.done ? 'checkmark' : 'arrow-forward'}
                  width={56}
                  height={44}
                  onPress={() => toggleDone(note.id)}
                />
              </Card>
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    paddingHorizontal: 14,
    paddingBottom: 32,
    alignItems: 'center',
  },
  phoneFrame: {
    width: '100%',
    maxWidth: 412,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
  },
  title: {
    fontSize: Typography.sizes.xxl,
    fontWeight: Typography.weights.medium,
    color: Colors.text,
  },
  subtitle: {
    fontSize: Typography.sizes.sm,
    color: Colors.secondary,
    marginTop: 2,
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: Radius.full,
    backgroundColor: '#FFFFFF',
    borderWidth: 0.5,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
    marginBottom: 16,
  },
  noteCard: {
    padding: 16,
    paddingBottom: 18,
    marginBottom: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  checkboxContainer: {
    paddingTop: 2,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: Colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxActive: {
    backgroundColor: Colors.accent,
  },
  noteTitle: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.medium,
    color: Colors.text,
  },
  noteTitleDone: {
    textDecorationLine: 'line-through',
    color: Colors.muted,
  },
  contactTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.accentLight,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: Radius.sm,
    alignSelf: 'flex-start',
    marginTop: 6,
  },
  contactTagText: {
    fontSize: Typography.sizes.xs,
    color: Colors.accentDark,
    fontWeight: Typography.weights.medium,
  },
  noteContent: {
    fontSize: Typography.sizes.sm,
    color: Colors.secondary,
    lineHeight: 19,
    marginTop: 10,
    marginBottom: 12,
    paddingRight: 50,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  reminderBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.background,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Radius.sm,
  },
  reminderText: {
    fontSize: Typography.sizes.xs,
    color: Colors.accent,
    fontWeight: Typography.weights.medium,
  },
  repeatBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  repeatText: {
    fontSize: Typography.sizes.xs,
    color: Colors.secondary,
  },
});
