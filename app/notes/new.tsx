import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Radius, Typography } from '../../src/constants/theme';
import { Card, Button, Chip } from '../../src/components/ui';
import { useToast } from '../../src/context/ToastContext';
import { INITIAL_CONTACTS } from '../../src/data/mockData';

export default function NewNoteScreen() {
  const router = useRouter();
  const { showToast } = useToast();

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [selectedContact, setSelectedContact] = useState<string | null>(null);
  const [remindTime, setRemindTime] = useState<string>('Today, 5:00 PM');
  const [repeat, setRepeat] = useState<'none' | 'daily' | 'weekly' | 'monthly'>('none');

  const handleSave = () => {
    if (!content.trim()) {
      showToast('Please enter note details');
      return;
    }
    showToast('Follow-up reminder set!');
    router.back();
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.phoneFrame}>
          <Card style={styles.card}>
            <Text style={styles.label}>NOTE TITLE</Text>
            <TextInput
              placeholder="e.g. Call Ramesh regarding order"
              placeholderTextColor={Colors.muted}
              value={title}
              onChangeText={setTitle}
              style={styles.input}
            />

            <Text style={styles.label}>LINK A PERSON</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.contactsRow}>
              {INITIAL_CONTACTS.map((c) => (
                <Chip
                  key={c.id}
                  label={c.name}
                  active={selectedContact === c.id}
                  onPress={() =>
                    setSelectedContact(selectedContact === c.id ? null : c.id)
                  }
                  style={{ marginRight: 8 }}
                />
              ))}
            </ScrollView>

            <Text style={styles.label}>DETAILS & CONTEXT</Text>
            <TextInput
              placeholder="What do you need to remember or discuss?"
              placeholderTextColor={Colors.muted}
              value={content}
              onChangeText={setContent}
              multiline
              numberOfLines={4}
              style={[styles.input, styles.textArea]}
            />

            <Text style={styles.label}>REMINDER TIME</Text>
            <View style={styles.reminderRow}>
              {['Today, 5:00 PM', 'Tomorrow, 10:00 AM', 'Next Week'].map((t) => (
                <TouchableOpacity
                  key={t}
                  onPress={() => setRemindTime(t)}
                  style={[
                    styles.timePill,
                    remindTime === t && styles.timePillActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.timePillText,
                      remindTime === t && styles.timePillTextActive,
                    ]}
                  >
                    {t}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.label}>REPEAT FREQUENCY</Text>
            <View style={styles.reminderRow}>
              {(['none', 'daily', 'weekly', 'monthly'] as const).map((r) => (
                <TouchableOpacity
                  key={r}
                  onPress={() => setRepeat(r)}
                  style={[
                    styles.timePill,
                    repeat === r && styles.timePillActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.timePillText,
                      repeat === r && styles.timePillTextActive,
                    ]}
                  >
                    {r.toUpperCase()}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </Card>

          <Button
            title="Save Note & Reminder"
            variant="primary"
            onPress={handleSave}
            style={{ marginTop: 20 }}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 40,
    alignItems: 'center',
  },
  phoneFrame: {
    width: '100%',
    maxWidth: 412,
  },
  card: {
    padding: 16,
    marginTop: 12,
  },
  label: {
    fontSize: Typography.sizes.xs,
    fontWeight: Typography.weights.semibold,
    color: Colors.muted,
    marginTop: 14,
    marginBottom: 6,
  },
  input: {
    backgroundColor: Colors.background,
    borderRadius: Radius.sm,
    borderWidth: 0.5,
    borderColor: Colors.border,
    paddingHorizontal: 12,
    height: 44,
    fontSize: Typography.sizes.base,
    color: Colors.text,
  },
  textArea: {
    height: 90,
    paddingTop: 10,
    textAlignVertical: 'top',
  },
  contactsRow: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  reminderRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  timePill: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: Radius.pill,
    backgroundColor: Colors.background,
    borderWidth: 0.5,
    borderColor: Colors.border,
  },
  timePillActive: {
    backgroundColor: Colors.accentLight,
    borderColor: Colors.accent,
  },
  timePillText: {
    fontSize: Typography.sizes.xs,
    color: Colors.secondary,
  },
  timePillTextActive: {
    color: Colors.accentDark,
    fontWeight: Typography.weights.semibold,
  },
});
