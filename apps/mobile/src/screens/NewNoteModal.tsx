import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { colors, radius } from '@recallr/tokens';
import { Card, Button, Toggle, PressableScale } from '../components/ui';
import {
  IconX,
  IconUser,
  IconPlus,
  IconBell,
} from '@tabler/icons-react-native';
import { useCreateNote, useContacts } from '@recallr/api';

export interface NewNoteModalProps {
  initialContactId?: string;
  initialRemindMe?: boolean;
  onClose: () => void;
  onSave: () => void;
  onShowToast: (message: string) => void;
}

export const NewNoteModal: React.FC<NewNoteModalProps> = ({
  initialContactId,
  initialRemindMe = false,
  onClose,
  onSave,
  onShowToast,
}) => {
  const { data: contacts } = useContacts();
  const { mutateAsync: createNoteMutate, isPending: isSaving } = useCreateNote();

  const [title, setTitle] = useState('');
  const [noteBody, setNoteBody] = useState('');
  const [remindMe, setRemindMe] = useState(initialRemindMe);
  const [selectedQuickTime, setSelectedQuickTime] = useState<'today' | 'tomorrow' | 'next_week'>('tomorrow');
  const [linkedContactId, setLinkedContactId] = useState<string | null>(initialContactId || null);
  const [showContactPicker, setShowContactPicker] = useState(false);

  const linkedContact = contacts?.find((c) => c.id === linkedContactId);

  const handleSave = async () => {
    if (!title.trim() && !noteBody.trim()) {
      onShowToast('Note cannot be empty');
      return;
    }

    try {
      let remindAt: string | null = null;
      if (remindMe) {
        const now = new Date();
        if (selectedQuickTime === 'today') {
          now.setHours(now.getHours() + 4);
          remindAt = now.toISOString();
        } else if (selectedQuickTime === 'tomorrow') {
          now.setDate(now.getDate() + 1);
          now.setHours(9, 0, 0, 0);
          remindAt = now.toISOString();
        } else {
          now.setDate(now.getDate() + 7);
          now.setHours(9, 0, 0, 0);
          remindAt = now.toISOString();
        }
      }

      await createNoteMutate({
        input: {
          title: title.trim() || 'Quick Note',
          body: noteBody.trim() || null,
          contact_id: linkedContactId,
          remind_at: remindAt,
          repeat: 'none',
        },
      });

      onShowToast('Note saved');
      onSave();
    } catch (err: unknown) {
      onShowToast(err instanceof Error ? err.message : 'Failed to save note');
    }
  };

  return (
    <View style={styles.container}>
      {/* Top Header */}
      <View style={styles.headerRow}>
        <PressableScale
          onPress={onClose}
          haptic="light"
          style={styles.closeBtn}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <IconX size={20} color={colors.text} strokeWidth={2} />
        </PressableScale>
        <Text style={styles.headerTitle}>New note</Text>
        <PressableScale
          onPress={handleSave}
          haptic="light"
          disabled={isSaving}
          style={styles.saveBtn}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          {isSaving ? (
            <ActivityIndicator size="small" color={colors.accent} />
          ) : (
            <Text style={styles.saveText}>Save</Text>
          )}
        </PressableScale>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Title & Body Card */}
        <Card style={styles.noteInputsCard}>
          <TextInput
            value={title}
            onChangeText={setTitle}
            placeholder="Note title or quick topic"
            placeholderTextColor={colors.textMuted}
            style={styles.titleInput}
          />
          <TextInput
            value={noteBody}
            onChangeText={setNoteBody}
            placeholder="Write meeting notes, context, or follow-up tasks..."
            placeholderTextColor={colors.textMuted}
            multiline
            numberOfLines={4}
            style={styles.bodyInput}
          />
        </Card>

        {/* Linked Person Row */}
        <View style={styles.linkedRow}>
          {linkedContact ? (
            <View style={styles.linkedChip}>
              <IconUser size={14} color={colors.accentDark} strokeWidth={2} />
              <Text style={styles.linkedChipText}>{linkedContact.name}</Text>
              <PressableScale
                onPress={() => setLinkedContactId(null)}
                haptic="light"
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <IconX size={12} color={colors.accentDark} strokeWidth={2.5} />
              </PressableScale>
            </View>
          ) : (
            <PressableScale
              onPress={() => setShowContactPicker(!showContactPicker)}
              haptic="light"
              style={styles.linkPersonBtn}
            >
              <IconPlus size={14} color={colors.accent} strokeWidth={2} />
              <Text style={styles.linkPersonText}>Link person</Text>
            </PressableScale>
          )}
        </View>

        {/* Contact Picker List if Open */}
        {showContactPicker && contacts && (
          <Card style={styles.contactPickerCard}>
            <Text style={styles.pickerTitle}>Select a contact</Text>
            {contacts.slice(0, 5).map((c) => (
              <PressableScale
                key={c.id}
                onPress={() => {
                  setLinkedContactId(c.id);
                  setShowContactPicker(false);
                }}
                style={styles.pickerRow}
              >
                <Text style={styles.pickerRowName}>{c.name}</Text>
                {c.company && <Text style={styles.pickerRowCompany}>{c.company}</Text>}
              </PressableScale>
            ))}
          </Card>
        )}

        {/* Remind Me Card */}
        <Card style={styles.remindCard}>
          <View style={styles.remindToggleRow}>
            <View style={styles.remindTitleRow}>
              <IconBell size={18} color={colors.accent} strokeWidth={2} />
              <Text style={styles.remindTitle}>Remind me</Text>
            </View>
            <Toggle value={remindMe} onValueChange={setRemindMe} />
          </View>

          {remindMe && (
            <View style={styles.quickTimeRow}>
              <PressableScale
                onPress={() => setSelectedQuickTime('today')}
                haptic="selection"
                style={[
                  styles.quickTimePill,
                  selectedQuickTime === 'today' && styles.quickTimePillActive,
                ]}
              >
                <Text
                  style={[
                    styles.quickTimeText,
                    selectedQuickTime === 'today' && styles.quickTimeTextActive,
                  ]}
                >
                  Later today
                </Text>
              </PressableScale>

              <PressableScale
                onPress={() => setSelectedQuickTime('tomorrow')}
                haptic="selection"
                style={[
                  styles.quickTimePill,
                  selectedQuickTime === 'tomorrow' && styles.quickTimePillActive,
                ]}
              >
                <Text
                  style={[
                    styles.quickTimeText,
                    selectedQuickTime === 'tomorrow' && styles.quickTimeTextActive,
                  ]}
                >
                  Tomorrow 9 AM
                </Text>
              </PressableScale>

              <PressableScale
                onPress={() => setSelectedQuickTime('next_week')}
                haptic="selection"
                style={[
                  styles.quickTimePill,
                  selectedQuickTime === 'next_week' && styles.quickTimePillActive,
                ]}
              >
                <Text
                  style={[
                    styles.quickTimeText,
                    selectedQuickTime === 'next_week' && styles.quickTimeTextActive,
                  ]}
                >
                  Next week
                </Text>
              </PressableScale>
            </View>
          )}
        </Card>

        {/* Bottom CTA */}
        <Button
          title="Save note"
          variant="primary"
          size="md"
          onPress={handleSave}
          disabled={isSaving}
          style={styles.saveNoteBtn}
        />

        <View style={{ height: 60 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.background,
    zIndex: 1000,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  saveBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radius.md,
  },
  saveText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.accent,
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  noteInputsCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.card,
    padding: 16,
    marginBottom: 16,
  },
  titleInput: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    padding: 0,
    marginBottom: 12,
  },
  bodyInput: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
    padding: 0,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  linkedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  linkedChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.accentTintSoft,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: radius.full,
    marginRight: 8,
  },
  linkedChipText: {
    fontSize: 13,
    color: colors.accentDark,
    fontWeight: '500',
  },
  linkPersonBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radius.full,
  },
  linkPersonText: {
    fontSize: 13,
    color: colors.accent,
    fontWeight: '500',
  },
  contactPickerCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.card,
    padding: 12,
    marginBottom: 16,
  },
  pickerTitle: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textSecondary,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  pickerRow: {
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.divider,
  },
  pickerRowName: {
    fontSize: 14,
    color: colors.text,
    fontWeight: '500',
  },
  pickerRowCompany: {
    fontSize: 12,
    color: colors.textMuted,
  },
  remindCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.card,
    padding: 16,
    marginBottom: 20,
  },
  remindToggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  remindTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  remindTitle: {
    fontSize: 15,
    fontWeight: '500',
    color: colors.text,
  },
  quickTimeRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 14,
  },
  quickTimePill: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: radius.full,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  quickTimePillActive: {
    backgroundColor: colors.accentTintSoft,
    borderColor: colors.accent,
  },
  quickTimeText: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  quickTimeTextActive: {
    color: colors.accent,
    fontWeight: '600',
  },
  saveNoteBtn: {
    marginTop: 8,
  },
});
