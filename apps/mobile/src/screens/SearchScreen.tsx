import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
} from 'react-native';
import { colors, radius } from '@recallr/tokens';
import { Card, OrangeCorner, Avatar, PressableScale } from '../components/ui';
import {
  IconSearch,
  IconChevronRight,
  IconSparkles,
  IconArrowRight,
  IconUserX,
  IconFolder,
} from '@tabler/icons-react-native';
import { useCategories, useContacts, useNotes } from '@recallr/api';

const normalizeSearchText = (value: string) =>
  value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase();

export interface SearchScreenProps {
  onCancel: () => void;
  onSelectPerson: (id: string) => void;
  onSelectCategory: (id: string) => void;
  onAskAI: (query: string) => void;
}

export const SearchScreen: React.FC<SearchScreenProps> = ({
  onCancel,
  onSelectPerson,
  onSelectCategory,
  onAskAI,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'All' | 'People' | 'Notes' | 'Categories'>('All');

  const { data: contacts } = useContacts({
    query: searchQuery.trim() || undefined,
  });
  const { data: allNotes } = useNotes();
  const { data: categories } = useCategories();

  const matchingNotes = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = normalizeSearchText(searchQuery);
    return (allNotes || []).filter(
      (n) =>
        normalizeSearchText(n.title || '').includes(q) ||
        normalizeSearchText(n.body || '').includes(q)
    );
  }, [allNotes, searchQuery]);

  const filteredPeople = contacts || [];
  const matchingCategories = (categories || []).filter((category) =>
    normalizeSearchText(category.name).includes(normalizeSearchText(searchQuery.trim()))
  );
  const hasResults =
    (activeFilter === 'All' && (filteredPeople.length > 0 || matchingNotes.length > 0 || matchingCategories.length > 0)) ||
    (activeFilter === 'People' && filteredPeople.length > 0) ||
    (activeFilter === 'Notes' && matchingNotes.length > 0) ||
    (activeFilter === 'Categories' && matchingCategories.length > 0);

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Top Active Search Bar */}
        <View style={styles.searchBarRow}>
          <View style={styles.searchBarBox}>
            <IconSearch size={18} color={colors.accent} strokeWidth={2} />
            <TextInput
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoFocus
              style={styles.searchInput}
              placeholder="Search..."
              placeholderTextColor={colors.textMuted}
            />
          </View>
          <PressableScale
            onPress={onCancel}
            haptic="light"
            style={styles.cancelBtn}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Text style={styles.cancelText}>Cancel</Text>
          </PressableScale>
        </View>

        {/* Filter Pills */}
        <View style={styles.filterRow}>
          {(['All', 'People', 'Notes', 'Categories'] as const).map((tab) => {
            const isActive = activeFilter === tab;
            return (
              <PressableScale
                key={tab}
                onPress={() => setActiveFilter(tab)}
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

        {/* Content States */}
        {!searchQuery.trim() ? (
          <View style={{ padding: 32, alignItems: 'center' }}>
            <Text style={{ fontSize: 14, color: colors.textSecondary }}>
              Search by name, company, or note keyword
            </Text>
          </View>
        ) : !hasResults ? (
          <Card style={{ padding: 24, alignItems: 'center', marginBottom: 16 }}>
            <View
              style={{
                width: 44,
                height: 44,
                borderRadius: 22,
                backgroundColor: colors.surface,
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 8,
              }}
            >
              <IconUserX size={22} color={colors.textMuted} />
            </View>
            <Text style={{ fontSize: 14, fontWeight: '500', color: colors.text }}>
              No results for "{searchQuery}"
            </Text>
            <Text style={{ fontSize: 12, color: colors.textSecondary, marginTop: 4, textAlign: 'center' }}>
              Try searching with another keyword or ask AI
            </Text>
          </Card>
        ) : (
          <>
            {/* Section: People */}
            {(activeFilter === 'All' || activeFilter === 'People') && filteredPeople.length > 0 && (
              <>
                <Text style={styles.sectionHeader}>People ({filteredPeople.length})</Text>
                <Card style={styles.resultsCard}>
                  {filteredPeople.map((person, index) => (
                    <React.Fragment key={person.id}>
                      {index > 0 && <View style={styles.divider} />}
                      <PressableScale
                        onPress={() => onSelectPerson(person.id)}
                        haptic="light"
                        style={styles.resultRow}
                      >
                        <Avatar name={person.name} size="sm" />
                        <View style={styles.resultInfo}>
                          <Text style={styles.resultTitle}>{person.name}</Text>
                          <Text style={styles.resultSub}>
                            {[person.role, person.company].filter(Boolean).join(' · ') || 'Contact'}
                          </Text>
                        </View>
                        <IconChevronRight size={18} color={colors.textMuted} strokeWidth={2} />
                      </PressableScale>
                    </React.Fragment>
                  ))}
                </Card>
              </>
            )}

            {/* Section: Notes */}
            {(activeFilter === 'All' || activeFilter === 'Notes') && matchingNotes.length > 0 && (
              <>
                <Text style={styles.sectionHeader}>Notes ({matchingNotes.length})</Text>
                <Card style={styles.resultsCard}>
                  {matchingNotes.map((note, index) => (
                    <React.Fragment key={note.id}>
                      {index > 0 && <View style={styles.divider} />}
                      <View style={styles.noteResultRow}>
                        <Text style={styles.noteResultTitle}>{note.title || 'Untitled Note'}</Text>
                        {note.body ? (
                          <Text style={styles.resultSub} numberOfLines={2}>
                            {note.body}
                          </Text>
                        ) : null}
                      </View>
                    </React.Fragment>
                  ))}
                </Card>
              </>
            )}

            {(activeFilter === 'All' || activeFilter === 'Categories') && matchingCategories.length > 0 && (
              <>
                <Text style={styles.sectionHeader}>Categories ({matchingCategories.length})</Text>
                <Card style={styles.resultsCard}>
                  {matchingCategories.map((category, index) => (
                    <React.Fragment key={category.id}>
                      {index > 0 && <View style={styles.divider} />}
                      <PressableScale style={styles.resultRow} onPress={() => onSelectCategory(category.id)} haptic="light">
                        <IconFolder size={18} color={colors.accent} />
                        <Text style={styles.resultTitle}>{category.name}</Text>
                        <IconChevronRight size={18} color={colors.textMuted} strokeWidth={2} />
                      </PressableScale>
                    </React.Fragment>
                  ))}
                </Card>
              </>
            )}
          </>
        )}

        {/* AI Fallback Card */}
        <Card
          style={styles.aiCard}
          onPress={() => onAskAI(`Ask Recallr about "${searchQuery}"`)}
        >
          <OrangeCorner
            size="md"
            icon={<IconArrowRight size={20} color="#FFFFFF" strokeWidth={2.2} />}
          />
          <View style={styles.aiHeader}>
            <IconSparkles size={16} color={colors.accent} strokeWidth={2} />
            <Text style={styles.aiTitle}>Not what you meant?</Text>
          </View>
          <Text style={styles.aiSub}>
            Ask Recallr about "{searchQuery}"
          </Text>
        </Card>

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
  searchBarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },
  searchBarBox: {
    flex: 1,
    height: 48,
    borderRadius: radius.card,
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.accent,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: colors.text,
    fontFamily: 'Inter',
  },
  cancelBtn: {
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  cancelText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.accent,
    fontFamily: 'Inter',
  },
  filterRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  filterPill: {
    paddingHorizontal: 14,
    paddingVertical: 6,
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
    fontSize: 12,
    fontWeight: '500',
    color: colors.textSecondary,
    fontFamily: 'Inter',
  },
  filterTextActive: {
    color: '#FFFFFF',
  },
  sectionHeader: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.textMuted,
    fontFamily: 'Inter',
    marginBottom: 8,
    paddingHorizontal: 2,
  },
  resultsCard: {
    padding: 0,
    overflow: 'hidden',
    marginBottom: 16,
  },
  resultRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    gap: 12,
  },
  resultInfo: {
    flex: 1,
  },
  resultTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    fontFamily: 'Inter',
  },
  highlightText: {
    color: colors.accent,
    fontWeight: '700',
  },
  resultSub: {
    fontSize: 12,
    color: colors.textSecondary,
    fontFamily: 'Inter',
    marginTop: 2,
  },
  noteResultRow: {
    padding: 14,
  },
  noteResultTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
    fontFamily: 'Inter',
  },
  aiCard: {
    padding: 16,
    marginBottom: 16,
    position: 'relative',
  },
  aiHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  aiTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    fontFamily: 'Inter',
  },
  aiSub: {
    fontSize: 13,
    color: colors.textSecondary,
    fontFamily: 'Inter',
  },
  divider: {
    height: 0.5,
    backgroundColor: colors.divider,
    marginHorizontal: 12,
  },
});
