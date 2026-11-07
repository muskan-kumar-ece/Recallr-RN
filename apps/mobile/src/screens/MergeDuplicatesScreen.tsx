import React, { useState, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { colors, radius } from '@recallr/tokens';
import { Card, Avatar, Button, PressableScale } from '../components/ui';
import {
  IconArrowLeft,
  IconArrowsExchange,
  IconInfoCircle,
  IconUsers,
} from '@tabler/icons-react-native';
import { useContacts, useMergeContacts } from '@recallr/api';
import { isDuplicateMatch, Contact } from '@recallr/core';

export interface MergeDuplicatesScreenProps {
  onBack: () => void;
  onMerged: () => void;
  onKeepBoth: () => void;
  onShowToast: (message: string) => void;
}

export const MergeDuplicatesScreen: React.FC<MergeDuplicatesScreenProps> = ({
  onBack,
  onMerged,
  onKeepBoth,
  onShowToast,
}) => {
  const { data: contacts, isLoading } = useContacts();
  const { mutateAsync: mergeContactsMutate, isPending: isMerging } = useMergeContacts();

  const [currentPairIdx, setCurrentPairIdx] = useState(0);
  const [selectedName, setSelectedName] = useState<'A' | 'B'>('A');
  const [selectedCompany, setSelectedCompany] = useState<'A' | 'B'>('A');
  const [selectedEmail, setSelectedEmail] = useState<'A' | 'B'>('A');
  const [selectedPhone, setSelectedPhone] = useState<'A' | 'B'>('A');

  // Pairwise duplicate detection
  const duplicatePairs = useMemo(() => {
    if (!contacts || contacts.length < 2) return [];
    const pairs: [Contact, Contact][] = [];
    const seen = new Set<string>();

    for (let i = 0; i < contacts.length; i++) {
      for (let j = i + 1; j < contacts.length; j++) {
        const c1 = contacts[i];
        const c2 = contacts[j];
        if (c1 && c2 && isDuplicateMatch(c1, c2)) {
          const key = [c1.id, c2.id].sort().join(':');
          if (!seen.has(key)) {
            seen.add(key);
            pairs.push([c1, c2]);
          }
        }
      }
    }
    return pairs;
  }, [contacts]);

  const currentPair = duplicatePairs[currentPairIdx];
  const contactA = currentPair?.[0];
  const contactB = currentPair?.[1];

  useEffect(() => {
    setSelectedName('A');
    setSelectedCompany('A');
    setSelectedEmail('A');
    setSelectedPhone('A');
  }, [currentPairIdx]);

  const handleMerge = async () => {
    if (!contactA || !contactB) return;

    try {
      const mergedData = {
        name: selectedName === 'A' ? contactA.name : contactB.name,
        company: selectedCompany === 'A' ? contactA.company : contactB.company,
        email: selectedEmail === 'A' ? contactA.email : contactB.email,
        phone: selectedPhone === 'A' ? contactA.phone : contactB.phone,
      };

      await mergeContactsMutate({
        masterId: contactA.id,
        duplicateId: contactB.id,
        mergedData,
      });

      onShowToast('Contacts successfully merged');

      if (currentPairIdx + 1 < duplicatePairs.length) {
        setCurrentPairIdx((prev) => prev + 1);
      } else {
        onMerged();
      }
    } catch (err: unknown) {
      onShowToast(err instanceof Error ? err.message : 'Failed to merge contacts');
    }
  };

  const handleSkip = () => {
    if (currentPairIdx + 1 < duplicatePairs.length) {
      setCurrentPairIdx((prev) => prev + 1);
      onShowToast('Skipped pair');
    } else {
      onKeepBoth();
    }
  };

  if (isLoading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color={colors.accent} />
        <Text style={styles.loadingText}>Checking for duplicates...</Text>
      </View>
    );
  }

  if (duplicatePairs.length === 0 || !contactA || !contactB) {
    return (
      <View style={styles.container}>
        <View style={styles.headerRow}>
          <PressableScale
            onPress={onBack}
            haptic="light"
            style={styles.backBtn}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <IconArrowLeft size={20} color={colors.text} strokeWidth={2} />
          </PressableScale>
          <Text style={styles.headerTitle}>Merge duplicates</Text>
        </View>

        <View style={styles.emptyContainer}>
          <View style={styles.emptyIconBox}>
            <IconUsers size={32} color={colors.accent} strokeWidth={2} />
          </View>
          <Text style={styles.emptyTitle}>No Duplicates Found</Text>
          <Text style={styles.emptySubtitle}>
            Your network is clean! None of your contacts share the same phone number, email address, or matching name and company.
          </Text>
          <Button
            title="Back to network"
            variant="primary"
            size="md"
            onPress={onBack}
            style={styles.backButton}
          />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Top Header */}
      <View style={styles.headerRow}>
        <PressableScale
          onPress={onBack}
          haptic="light"
          style={styles.backBtn}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <IconArrowLeft size={20} color={colors.text} strokeWidth={2} />
        </PressableScale>
        <Text style={styles.headerTitle}>
          Merge duplicates ({currentPairIdx + 1} of {duplicatePairs.length})
        </Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Comparison Banner Card */}
        <Card style={styles.bannerCard}>
          <View style={styles.bannerAvatars}>
            <Avatar name={contactA.name} src={contactA.photo_path || undefined} size="sm" />
            <IconArrowsExchange size={18} color={colors.accent} strokeWidth={2} />
            <Avatar name={contactB.name} src={contactB.photo_path || undefined} size="sm" />
          </View>
          <View style={styles.bannerText}>
            <Text style={styles.bannerTitle}>Same person?</Text>
            <Text style={styles.bannerSub}>Matching records detected</Text>
          </View>
        </Card>

        {/* Column Headers */}
        <View style={styles.colHeaderRow}>
          <Text style={styles.colHeader}>Contact A</Text>
          <Text style={styles.colHeader}>Contact B</Text>
        </View>

        {/* Field 1: Name */}
        <Text style={styles.fieldLabel}>Name</Text>
        <View style={styles.radioChoiceRow}>
          <PressableScale
            onPress={() => setSelectedName('A')}
            haptic="selection"
            style={[
              styles.choiceBtn,
              selectedName === 'A' && styles.choiceBtnActive,
            ]}
          >
            <View
              style={[
                styles.radioDot,
                selectedName === 'A' && styles.radioDotActive,
              ]}
            />
            <Text style={styles.choiceText}>{contactA.name}</Text>
          </PressableScale>

          <PressableScale
            onPress={() => setSelectedName('B')}
            haptic="selection"
            style={[
              styles.choiceBtn,
              selectedName === 'B' && styles.choiceBtnActive,
            ]}
          >
            <View
              style={[
                styles.radioDot,
                selectedName === 'B' && styles.radioDotActive,
              ]}
            />
            <Text style={styles.choiceText}>{contactB.name}</Text>
          </PressableScale>
        </View>

        {/* Field 2: Company */}
        {(contactA.company || contactB.company) && (
          <>
            <Text style={styles.fieldLabel}>Company</Text>
            <View style={styles.radioChoiceRow}>
              <PressableScale
                onPress={() => setSelectedCompany('A')}
                haptic="selection"
                style={[
                  styles.choiceBtn,
                  selectedCompany === 'A' && styles.choiceBtnActive,
                ]}
              >
                <View
                  style={[
                    styles.radioDot,
                    selectedCompany === 'A' && styles.radioDotActive,
                  ]}
                />
                <Text style={styles.choiceText}>{contactA.company || 'None'}</Text>
              </PressableScale>

              <PressableScale
                onPress={() => setSelectedCompany('B')}
                haptic="selection"
                style={[
                  styles.choiceBtn,
                  selectedCompany === 'B' && styles.choiceBtnActive,
                ]}
              >
                <View
                  style={[
                    styles.radioDot,
                    selectedCompany === 'B' && styles.radioDotActive,
                  ]}
                />
                <Text style={styles.choiceText}>{contactB.company || 'None'}</Text>
              </PressableScale>
            </View>
          </>
        )}

        {/* Field 3: Phone */}
        {(contactA.phone || contactB.phone) && (
          <>
            <Text style={styles.fieldLabel}>Phone</Text>
            <View style={styles.radioChoiceRow}>
              <PressableScale
                onPress={() => setSelectedPhone('A')}
                haptic="selection"
                style={[
                  styles.choiceBtn,
                  selectedPhone === 'A' && styles.choiceBtnActive,
                ]}
              >
                <View
                  style={[
                    styles.radioDot,
                    selectedPhone === 'A' && styles.radioDotActive,
                  ]}
                />
                <Text style={styles.choiceText}>{contactA.phone || 'None'}</Text>
              </PressableScale>

              <PressableScale
                onPress={() => setSelectedPhone('B')}
                haptic="selection"
                style={[
                  styles.choiceBtn,
                  selectedPhone === 'B' && styles.choiceBtnActive,
                ]}
              >
                <View
                  style={[
                    styles.radioDot,
                    selectedPhone === 'B' && styles.radioDotActive,
                  ]}
                />
                <Text style={styles.choiceText}>{contactB.phone || 'None'}</Text>
              </PressableScale>
            </View>
          </>
        )}

        {/* Info Note */}
        <View style={styles.infoRow}>
          <IconInfoCircle size={16} color={colors.accent} strokeWidth={2} />
          <Text style={styles.infoText}>
            Notes, timeline, and reminders from both will be consolidated into Contact A.
          </Text>
        </View>

        {/* Actions */}
        <Button
          title={isMerging ? 'Merging...' : 'Merge into one'}
          variant="primary"
          size="md"
          onPress={handleMerge}
          disabled={isMerging}
          style={styles.mergeBtn}
        />

        <Button
          title="Keep both separate"
          variant="outline"
          size="md"
          onPress={handleSkip}
          style={styles.keepBtn}
        />

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: colors.textSecondary,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingTop: 12,
    marginBottom: 8,
  },
  backBtn: {
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
  content: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  bannerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    backgroundColor: colors.accentTintSoft,
    borderWidth: 1,
    borderColor: colors.accentTint,
    borderRadius: radius.card,
    marginBottom: 16,
    gap: 12,
  },
  bannerAvatars: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  bannerText: {
    flex: 1,
  },
  bannerTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  bannerSub: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 1,
  },
  colHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    marginBottom: 8,
  },
  colHeader: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
    textTransform: 'uppercase',
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
    marginTop: 10,
    marginBottom: 6,
    marginLeft: 4,
  },
  radioChoiceRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 10,
  },
  choiceBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  choiceBtnActive: {
    borderColor: colors.accent,
    backgroundColor: colors.accentTintSoft,
  },
  radioDot: {
    width: 14,
    height: 14,
    borderRadius: radius.full,
    borderWidth: 1.5,
    borderColor: colors.borderStrong,
  },
  radioDotActive: {
    borderColor: colors.accent,
    backgroundColor: colors.accent,
  },
  choiceText: {
    fontSize: 13,
    color: colors.text,
    flex: 1,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 16,
    marginBottom: 20,
    paddingHorizontal: 4,
  },
  infoText: {
    fontSize: 12,
    color: colors.textSecondary,
    flex: 1,
    lineHeight: 16,
  },
  mergeBtn: {
    marginBottom: 10,
  },
  keepBtn: {
    marginBottom: 12,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    paddingTop: 60,
  },
  emptyIconBox: {
    width: 64,
    height: 64,
    borderRadius: radius.full,
    backgroundColor: colors.accentTintSoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 24,
  },
  backButton: {
    width: '100%',
    maxWidth: 240,
  },
});
