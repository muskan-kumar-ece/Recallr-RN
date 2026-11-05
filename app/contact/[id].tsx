import React, { useMemo } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Linking,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Radius, Typography } from '../../src/constants/theme';
import { Card, OrangeCorner, Button, ListRow } from '../../src/components/ui';
import { INITIAL_CONTACTS, INITIAL_NOTES } from '../../src/data/mockData';
import { useToast } from '../../src/context/ToastContext';

export default function ContactProfileScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { showToast } = useToast();

  const contact = useMemo(() => {
    return INITIAL_CONTACTS.find((c) => c.id === id) || INITIAL_CONTACTS[0];
  }, [id]);

  const contactNotes = useMemo(() => {
    return INITIAL_NOTES.filter((n) => n.contact_id === contact.id);
  }, [contact.id]);

  const initials = contact.name
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  const handleCall = () => {
    if (contact.phone) Linking.openURL(`tel:${contact.phone}`);
    else showToast('No phone number');
  };

  const handleEmail = () => {
    if (contact.email) Linking.openURL(`mailto:${contact.email}`);
    else showToast('No email address');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.phoneFrame}>
          {/* Main Profile Card */}
          <Card style={styles.profileCard}>
            <View style={styles.avatar}>
              <Text style={styles.avatarInitials}>{initials}</Text>
            </View>
            <Text style={styles.name}>{contact.name}</Text>
            <Text style={styles.headline}>{contact.headline}</Text>
            <Text style={styles.company}>{contact.company}</Text>

            {/* Met At Badge */}
            {contact.met_at && (
              <View style={styles.metAtBadge}>
                <Ionicons name="location-outline" size={14} color={Colors.accent} />
                <Text style={styles.metAtText}>Met at {contact.met_at}</Text>
              </View>
            )}

            {/* Action Row */}
            <View style={styles.actionRow}>
              <TouchableOpacity onPress={handleCall} style={styles.actionBtn}>
                <Ionicons name="call-outline" size={20} color={Colors.accent} />
                <Text style={styles.actionBtnLabel}>Call</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={handleEmail} style={styles.actionBtn}>
                <Ionicons name="mail-outline" size={20} color={Colors.accent} />
                <Text style={styles.actionBtnLabel}>Email</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => router.push('/notes/new')}
                style={styles.actionBtn}
              >
                <Ionicons name="document-text-outline" size={20} color={Colors.accent} />
                <Text style={styles.actionBtnLabel}>Add Note</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => showToast('Contact link copied')}
                style={styles.actionBtn}
              >
                <Ionicons name="share-social-outline" size={20} color={Colors.accent} />
                <Text style={styles.actionBtnLabel}>Share</Text>
              </TouchableOpacity>
            </View>
          </Card>

          {/* Context / Bio Card */}
          {contact.bio && (
            <Card style={styles.bioCard}>
              <Text style={styles.sectionLabel}>MEMORY & CONTEXT</Text>
              <Text style={styles.bioText}>{contact.bio}</Text>
              <OrangeCorner icon="sparkles" width={56} height={44} />
            </Card>
          )}

          {/* Linked Notes & Reminders */}
          <Text style={styles.sectionHeader}>NOTES & REMINDERS</Text>
          <Card style={styles.notesCard}>
            {contactNotes.length > 0 ? (
              contactNotes.map((note, idx) => (
                <ListRow
                  key={note.id}
                  title={note.title || 'Note'}
                  subtitle={note.content}
                  tag={note.remind_at}
                  showDivider={idx < contactNotes.length - 1}
                />
              ))
            ) : (
              <View style={styles.emptyNotes}>
                <Text style={styles.emptyNotesText}>No notes yet for {contact.name}.</Text>
                <Button
                  title="Add First Note"
                  variant="outline"
                  onPress={() => router.push('/notes/new')}
                  style={{ marginTop: 12, height: 42 }}
                />
              </View>
            )}
          </Card>
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
    paddingBottom: 36,
    alignItems: 'center',
  },
  phoneFrame: {
    width: '100%',
    maxWidth: 412,
  },
  profileCard: {
    padding: 20,
    alignItems: 'center',
    marginVertical: 12,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: Radius.full,
    backgroundColor: Colors.accentLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  avatarInitials: {
    color: Colors.accent,
    fontSize: 26,
    fontWeight: Typography.weights.bold,
  },
  name: {
    fontSize: Typography.sizes.xl,
    fontWeight: Typography.weights.semibold,
    color: Colors.text,
  },
  headline: {
    fontSize: Typography.sizes.sm,
    color: Colors.secondary,
    marginTop: 4,
  },
  company: {
    fontSize: Typography.sizes.sm,
    color: Colors.muted,
    marginTop: 2,
  },
  metAtBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.background,
    borderWidth: 0.5,
    borderColor: Colors.border,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: Radius.pill,
    marginTop: 12,
  },
  metAtText: {
    fontSize: Typography.sizes.xs,
    color: Colors.accentDark,
    fontWeight: Typography.weights.medium,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginTop: 20,
    paddingTop: 16,
    borderTopWidth: 0.5,
    borderTopColor: Colors.border,
  },
  actionBtn: {
    alignItems: 'center',
    gap: 4,
  },
  actionBtnLabel: {
    fontSize: Typography.sizes.xs,
    color: Colors.secondary,
    fontWeight: Typography.weights.medium,
  },
  bioCard: {
    padding: 16,
    paddingBottom: 20,
    marginBottom: 14,
  },
  sectionLabel: {
    fontSize: Typography.sizes.xs,
    color: Colors.muted,
    fontWeight: Typography.weights.semibold,
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  bioText: {
    fontSize: Typography.sizes.base,
    color: Colors.text,
    lineHeight: 22,
    width: '80%',
  },
  sectionHeader: {
    fontSize: Typography.sizes.xs,
    fontWeight: Typography.weights.semibold,
    color: Colors.muted,
    marginBottom: 8,
    marginLeft: 4,
  },
  notesCard: {
    overflow: 'hidden',
  },
  emptyNotes: {
    padding: 24,
    alignItems: 'center',
  },
  emptyNotesText: {
    fontSize: Typography.sizes.sm,
    color: Colors.secondary,
  },
});
