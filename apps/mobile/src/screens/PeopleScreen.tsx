import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { colors, radius, tokens } from '@recallr/tokens';
import { Card, OrangeCorner, Avatar, SearchBar, PressableScale } from '../components/ui';
import {
  IconArrowRight,
  IconUserX,
} from '@tabler/icons-react-native';
import { useContacts, useCategories, useUserSettings } from '@recallr/api';
import { isFollowUpDue } from '@recallr/core';

export interface PeopleScreenProps {
  onNavigate: (screen: string, params?: Record<string, unknown>) => void;
  onShowToast: (message: string) => void;
}

export const PeopleScreen: React.FC<PeopleScreenProps> = ({
  onNavigate,
  onShowToast,
}) => {
  const [selectedFilter, setSelectedFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const { data: dbContacts, isLoading: contactsLoading } = useContacts({
    query: searchQuery.trim() ? searchQuery.trim() : undefined,
  });
  const { data: dbCategories } = useCategories();
  const { data: userSettings } = useUserSettings();

  const categories = useMemo(() => {
    const list = ['All'];
    if (dbCategories) {
      dbCategories.forEach((cat) => list.push(cat.name));
    }
    return list;
  }, [dbCategories]);

  // Compute follow-ups due
  const needsFollowUpList = useMemo(() => {
    if (!dbContacts) return [];
    const nudgeDays = userSettings?.nudge_days ?? 30;
    const nudgesEnabled = userSettings?.nudges_enabled ?? true;
    const now = new Date();
    return dbContacts.filter((c) =>
      isFollowUpDue(
        {
          deleted_at: c.deleted_at,
          last_contacted_at: c.last_contacted_at,
          created_at: c.created_at,
        },
        nudgeDays,
        now,
        nudgesEnabled
      )
    );
  }, [dbContacts, userSettings]);

  // Filter contacts by category filter
  const filteredContacts = useMemo(() => {
    if (!dbContacts) return [];
    if (selectedFilter === 'Needs follow-up') return dbContacts.filter((contact) => needsFollowUpList.some((due) => due.id === contact.id));
    if (selectedFilter === 'All') return dbContacts;
    const targetCat = dbCategories?.find((cat) => cat.name === selectedFilter);
    if (!targetCat) return dbContacts;
    return dbContacts.filter((c) => c.category_ids?.includes(targetCat.id));
  }, [dbContacts, selectedFilter, dbCategories]);

  // Group contacts alphabetically
  const groupedContacts = useMemo(() => {
    const map: Record<string, typeof filteredContacts> = {};
    for (const c of filteredContacts) {
      const firstChar = (c.name[0] || '#').toUpperCase();
      const letter = /[A-Z]/.test(firstChar) ? firstChar : '#';
      if (!map[letter]) map[letter] = [];
      map[letter].push(c);
    }
    return map;
  }, [filteredContacts]);

  const alphabet = useMemo(() => Object.keys(groupedContacts).sort(), [groupedContacts]);

  const totalCount = dbContacts?.length ?? 0;
  const categoriesCount = dbCategories?.length ?? 0;

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.headerTitle}>People</Text>
            <Text style={styles.headerSubtitle}>
              {contactsLoading
                ? 'Loading contacts...'
                : `${totalCount} people in ${categoriesCount} categories`}
            </Text>
          </View>
        </View>

        {/* Search */}
        <View style={styles.searchContainer}>
          <SearchBar
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search name, company, note"
          />
        </View>

        {/* Needs follow-up Hero Card */}
        {needsFollowUpList.length > 0 && (
          <Card
            style={styles.followUpCard}
            onPress={() => setSelectedFilter('Needs follow-up')}
          >
            <OrangeCorner
              size="md"
              icon={<IconArrowRight size={20} color="#FFFFFF" strokeWidth={2.2} />}
            />
            <Text style={styles.followUpTitle}>
              {needsFollowUpList.length} need follow-up
            </Text>
            <Text style={styles.followUpSubtitle}>
              Not contacted in {userSettings?.nudge_days ?? 30}+ days
            </Text>
          </Card>
        )}

        {/* Filter Chips */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipScroll}
        >
          {categories.map((cat) => {
            const isActive = selectedFilter === cat;
            return (
              <PressableScale
                key={cat}
                onPress={() => setSelectedFilter(cat)}
                haptic="selection"
                style={[styles.filterChip, isActive && styles.filterChipActive]}
              >
                <Text
                  style={[
                    styles.filterChipText,
                    isActive && styles.filterChipTextActive,
                  ]}
                >
                  {cat}
                </Text>
              </PressableScale>
            );
          })}
        </ScrollView>

        {/* Subheader: Sort & Select */}
        <View style={styles.sortRow}>
          <Text style={styles.sortText}>↑↓ A to Z</Text>
          <PressableScale
            onPress={() => onShowToast('Selection mode')}
            haptic="light"
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Text style={styles.selectText}>Select</Text>
          </PressableScale>
        </View>

        {/* Contacts Alphabetical Sections */}
        {contactsLoading ? (
          <View style={{ padding: 20, alignItems: 'center' }}>
            <Text style={{ fontSize: 13, color: colors.textSecondary }}>Loading contacts...</Text>
          </View>
        ) : filteredContacts.length === 0 ? (
          <View style={{ padding: 32, alignItems: 'center' }}>
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
              {searchQuery ? 'No contacts match your search' : 'No contacts yet'}
            </Text>
            <Text style={{ fontSize: 12, color: colors.textSecondary, marginTop: 4, textAlign: 'center' }}>
              {searchQuery
                ? 'Try a different search keyword'
                : 'Tap + to add your first contact or scan a business card'}
            </Text>
          </View>
        ) : (
          alphabet.map((letter) => {
            const list = groupedContacts[letter] || [];
            return (
              <React.Fragment key={letter}>
                <View style={styles.sectionHeaderLetter}>
                  <Text style={styles.letterText}>{letter}</Text>
                </View>
                <Card style={styles.groupCard}>
                  {list.map((contact, idx) => {
                    const due = isFollowUpDue(
                      {
                        deleted_at: contact.deleted_at,
                        last_contacted_at: contact.last_contacted_at,
                        created_at: contact.created_at,
                      },
                      userSettings?.nudge_days ?? 30,
                      new Date(),
                      userSettings?.nudges_enabled ?? true
                    );

                    return (
                      <React.Fragment key={contact.id}>
                        {idx > 0 && <View style={styles.divider} />}
                        <PressableScale
                          onPress={() => onNavigate('contact-profile', { id: contact.id })}
                          haptic="light"
                          activeBackgroundColor={tokens.colors.pressedRow}
                          style={styles.personRow}
                        >
                          <Avatar name={contact.name} size="sm" />
                          <View style={styles.personCol}>
                            <Text style={styles.personName}>{contact.name}</Text>
                            <View style={styles.statusDotRow}>
                              {due && <View style={styles.statusDot} />}
                              <Text style={styles.personSub} numberOfLines={1}>
                                {contact.company && contact.role
                                    ? `${contact.role} · ${contact.company}`
                                    : contact.company || contact.role || 'Contact'}
                              </Text>
                            </View>
                          </View>
                          {contact.tags?.[0] ? (
                            <View style={styles.catPill}>
                              <Text style={styles.catPillText}>{contact.tags[0]}</Text>
                            </View>
                          ) : null}
                        </PressableScale>
                      </React.Fragment>
                    );
                  })}
                </Card>
              </React.Fragment>
            );
          })
        )}

        <View style={{ height: 90 }} />
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
    marginBottom: 12,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  filterBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchContainer: {
    marginBottom: 12,
  },
  followUpCard: {
    backgroundColor: colors.surface,
    padding: 16,
    marginBottom: 14,
    position: 'relative',
    overflow: 'hidden',
  },
  followUpTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 2,
  },
  followUpSubtitle: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  chipScroll: {
    gap: 8,
    paddingBottom: 10,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: radius.full,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  filterChipActive: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  filterChipText: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.textSecondary,
  },
  filterChipTextActive: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  sortRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    paddingHorizontal: 2,
    marginTop: 2,
  },
  sortText: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  selectText: {
    fontSize: 12,
    color: colors.accent,
    fontWeight: '500',
  },
  sectionHeaderLetter: {
    marginTop: 10,
    marginBottom: 6,
    paddingHorizontal: 4,
  },
  letterText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.accent,
  },
  groupCard: {
    backgroundColor: colors.surface,
    padding: 0,
    overflow: 'hidden',
    marginBottom: 8,
  },
  personRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 14,
    gap: 12,
  },
  personCol: {
    flex: 1,
  },
  personName: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 2,
  },
  statusDotRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.accent,
  },
  personSub: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  catPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.full,
    backgroundColor: colors.accentTintSoft,
  },
  catPillText: {
    fontSize: 11,
    color: colors.accent,
    fontWeight: '500',
  },
  divider: {
    height: 1,
    backgroundColor: colors.divider,
    marginLeft: 58,
  },
});
