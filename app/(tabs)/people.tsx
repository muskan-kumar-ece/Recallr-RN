import React, { useState, useMemo } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Platform,
  Linking,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Radius, Typography } from '../../src/constants/theme';
import { Card, OrangeCorner, Chip, ListRow } from '../../src/components/ui';
import { useToast } from '../../src/context/ToastContext';
import { INITIAL_CATEGORIES, INITIAL_CONTACTS } from '../../src/data/mockData';
import { Contact } from '../../src/types/database';

export default function PeopleScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams();
  const { showToast } = useToast();

  const [contacts, setContacts] = useState<Contact[]>(INITIAL_CONTACTS);
  const [selectedCategory, setSelectedCategory] = useState<string>(
    (params.categoryId as string) || 'all'
  );
  const [activeSwipeId, setActiveSwipeId] = useState<string | null>(null);

  // Filter contacts by category
  const filteredContacts = useMemo(() => {
    if (selectedCategory === 'all') return contacts;
    return contacts.filter((c) => c.category_ids?.includes(selectedCategory));
  }, [contacts, selectedCategory]);

  // Group contacts alphabetically
  const groupedContacts = useMemo(() => {
    const groups: { [letter: string]: Contact[] } = {};
    filteredContacts.forEach((contact) => {
      const firstLetter = (contact.name[0] || '#').toUpperCase();
      if (!groups[firstLetter]) {
        groups[firstLetter] = [];
      }
      groups[firstLetter].push(contact);
    });
    return Object.keys(groups)
      .sort()
      .map((letter) => ({
        letter,
        contacts: groups[letter],
      }));
  }, [filteredContacts]);

  // Handle Delete with Undo Toast (Specification Requirement: "Undo toast instead of delete popups")
  const handleDeleteContact = (contact: Contact) => {
    const backup = [...contacts];
    setContacts((prev) => prev.filter((c) => c.id !== contact.id));
    setActiveSwipeId(null);

    showToast(`Deleted ${contact.name}`, {
      undoLabel: 'Undo',
      duration: 5000,
      onUndo: () => {
        setContacts(backup);
        showToast(`Restored ${contact.name}`);
      },
    });
  };

  const handleCallContact = (phone?: string) => {
    if (!phone) {
      showToast('No phone number saved');
      return;
    }
    Linking.openURL(`tel:${phone}`);
  };

  return (
    <SafeAreaView style={[styles.safeArea, { paddingTop: Platform.OS === 'android' ? insets.top : 0 }]}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.phoneFrame}>
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>People</Text>
              <Text style={styles.subtitle}>
                {contacts.length} people in {INITIAL_CATEGORIES.length} categories
              </Text>
            </View>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => router.push('/categories')}
              style={styles.iconBtn}
            >
              <Ionicons name="options-outline" size={20} color={Colors.text} />
            </TouchableOpacity>
          </View>

          {/* Search Input */}
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => router.push('/search')}
            style={styles.searchBar}
          >
            <Ionicons name="search-outline" size={18} color={Colors.muted} />
            <Text style={styles.searchPlaceholder}>Search name, company, note</Text>
          </TouchableOpacity>

          {/* Follow-up Alert Card */}
          <Card
            onPress={() => router.push('/(tabs)/notes')}
            style={styles.alertCard}
          >
            <Text style={styles.alertTitle}>5 need follow-up</Text>
            <Text style={styles.alertSubtitle}>Not contacted in 30+ days</Text>
            <OrangeCorner icon="arrow-forward" width={56} height={44} />
          </Card>

          {/* Category Filter Chips */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.chipRow}
          >
            <Chip
              label="All"
              active={selectedCategory === 'all'}
              onPress={() => setSelectedCategory('all')}
              count={contacts.length}
            />
            {INITIAL_CATEGORIES.map((cat) => (
              <Chip
                key={cat.id}
                label={cat.name}
                active={selectedCategory === cat.id}
                onPress={() => setSelectedCategory(cat.id)}
                count={cat.count}
              />
            ))}
          </ScrollView>

          {/* Sorting Bar */}
          <View style={styles.sortBar}>
            <View style={styles.sortLeft}>
              <Ionicons name="swap-vertical" size={14} color={Colors.secondary} />
              <Text style={styles.sortLabel}>A to Z</Text>
            </View>
            <TouchableOpacity onPress={() => showToast('Multi-select mode activated')}>
              <Text style={styles.mergeActionText}>Select / Merge</Text>
            </TouchableOpacity>
          </View>

          {/* Grouped Contact List */}
          {groupedContacts.map((group) => (
            <View key={group.letter} style={styles.groupContainer}>
              <Text style={styles.sectionLetter}>{group.letter}</Text>
              <Card style={styles.groupCard}>
                {group.contacts.map((contact, idx) => (
                  <View key={contact.id} style={styles.contactRowWrapper}>
                    <ListRow
                      title={contact.name}
                      subtitle={`${contact.headline || ''} · ${contact.company || ''}`}
                      tag={contact.category_names?.[0]}
                      showDivider={idx < group.contacts.length - 1}
                      onPress={() =>
                        router.push({ pathname: '/contact/[id]', params: { id: contact.id } })
                      }
                      rightElement={
                        <TouchableOpacity
                          onPress={() =>
                            setActiveSwipeId(activeSwipeId === contact.id ? null : contact.id)
                          }
                          style={styles.moreActionsBtn}
                        >
                          <Ionicons name="ellipsis-vertical" size={16} color={Colors.muted} />
                        </TouchableOpacity>
                      }
                    />

                    {/* Interactive Action Bar (Call / Delete) */}
                    {activeSwipeId === contact.id && (
                      <View style={styles.quickActionOverlay}>
                        <TouchableOpacity
                          style={styles.callActionBtn}
                          onPress={() => handleCallContact(contact.phone)}
                        >
                          <Ionicons name="call" size={16} color="#FFFFFF" />
                          <Text style={styles.actionBtnText}>Call</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={styles.deleteActionBtn}
                          onPress={() => handleDeleteContact(contact)}
                        >
                          <Ionicons name="trash" size={16} color="#FFFFFF" />
                          <Text style={styles.actionBtnText}>Delete</Text>
                        </TouchableOpacity>
                      </View>
                    )}
                  </View>
                ))}
              </Card>
            </View>
          ))}
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
  searchBar: {
    marginTop: 10,
    height: 44,
    backgroundColor: '#FFFFFF',
    borderWidth: 0.5,
    borderColor: Colors.border,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    gap: 8,
  },
  searchPlaceholder: {
    color: Colors.muted,
    fontSize: Typography.sizes.base,
  },
  alertCard: {
    marginTop: 12,
    padding: 14,
    paddingHorizontal: 16,
  },
  alertTitle: {
    fontSize: Typography.sizes.base,
    fontWeight: Typography.weights.medium,
    color: Colors.text,
  },
  alertSubtitle: {
    fontSize: Typography.sizes.xs,
    color: Colors.secondary,
    marginTop: 2,
  },
  chipRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 14,
    paddingBottom: 2,
  },
  sortBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 12,
    paddingHorizontal: 4,
  },
  sortLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  sortLabel: {
    fontSize: Typography.sizes.xs,
    color: Colors.secondary,
  },
  mergeActionText: {
    fontSize: Typography.sizes.xs,
    color: Colors.accent,
    fontWeight: Typography.weights.medium,
  },
  groupContainer: {
    marginBottom: 14,
  },
  sectionLetter: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.bold,
    color: Colors.secondary,
    marginBottom: 6,
    marginLeft: 4,
  },
  groupCard: {
    overflow: 'hidden',
  },
  contactRowWrapper: {
    position: 'relative',
  },
  moreActionsBtn: {
    padding: 6,
  },
  quickActionOverlay: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    backgroundColor: '#FAF9F6',
    borderTopWidth: 0.5,
    borderTopColor: Colors.border,
  },
  callActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.accent,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  deleteActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.danger,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  actionBtnText: {
    color: '#FFFFFF',
    fontSize: Typography.sizes.xs,
    fontWeight: Typography.weights.semibold,
  },
});
