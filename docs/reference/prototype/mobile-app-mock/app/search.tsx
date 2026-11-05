import React, { useState, useMemo } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Radius, Typography } from '../src/constants/theme';
import { Card, ListRow, EmptyState } from '../src/components/ui';
import { INITIAL_CONTACTS, INITIAL_NOTES } from '../src/data/mockData';

export default function SearchScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState('');

  const filteredContacts = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    return INITIAL_CONTACTS.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        (c.company && c.company.toLowerCase().includes(q)) ||
        (c.headline && c.headline.toLowerCase().includes(q)) ||
        (c.bio && c.bio.toLowerCase().includes(q))
    );
  }, [query]);

  const filteredNotes = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    return INITIAL_NOTES.filter(
      (n) =>
        (n.title && n.title.toLowerCase().includes(q)) ||
        n.content.toLowerCase().includes(q)
    );
  }, [query]);

  return (
    <SafeAreaView style={[styles.safeArea, { paddingTop: Platform.OS === 'android' ? insets.top : 0 }]}>
      <View style={styles.phoneFrame}>
        {/* Search Header Bar */}
        <View style={styles.headerBar}>
          <View style={styles.searchBox}>
            <Ionicons name="search-outline" size={18} color={Colors.muted} />
            <TextInput
              autoFocus
              placeholder="Search people, notes, companies..."
              placeholderTextColor={Colors.muted}
              value={query}
              onChangeText={setQuery}
              style={styles.input}
              returnKeyType="search"
            />
            {query.length > 0 && (
              <TouchableOpacity onPress={() => setQuery('')}>
                <Ionicons name="close-circle" size={18} color={Colors.muted} />
              </TouchableOpacity>
            )}
          </View>
          <TouchableOpacity onPress={() => router.back()} style={styles.cancelBtn}>
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {query.trim().length === 0 ? (
            <View style={styles.recentSection}>
              <Text style={styles.sectionTitle}>SUGGESTED SEARCHES</Text>
              <View style={styles.suggestions}>
                {['Developers', 'Plastics', 'School Friends', 'Tech Summit'].map((item) => (
                  <TouchableOpacity
                    key={item}
                    style={styles.suggestionPill}
                    onPress={() => setQuery(item)}
                  >
                    <Ionicons name="time-outline" size={14} color={Colors.muted} />
                    <Text style={styles.suggestionPillText}>{item}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          ) : filteredContacts.length === 0 && filteredNotes.length === 0 ? (
            <EmptyState
              icon="search-outline"
              title="No Results Found"
              message={`We couldn't find anything matching "${query}". Try searching by first name or company.`}
            />
          ) : (
            <>
              {filteredContacts.length > 0 && (
                <View style={styles.resultsGroup}>
                  <Text style={styles.groupHeader}>
                    PEOPLE ({filteredContacts.length})
                  </Text>
                  <Card style={styles.resultsCard}>
                    {filteredContacts.map((contact, idx) => (
                      <ListRow
                        key={contact.id}
                        title={contact.name}
                        subtitle={`${contact.headline} · ${contact.company}`}
                        tag={contact.category_names?.[0]}
                        showDivider={idx < filteredContacts.length - 1}
                        onPress={() =>
                          router.push({
                            pathname: '/contact/[id]',
                            params: { id: contact.id },
                          })
                        }
                      />
                    ))}
                  </Card>
                </View>
              )}

              {filteredNotes.length > 0 && (
                <View style={styles.resultsGroup}>
                  <Text style={styles.groupHeader}>
                    NOTES & REMINDERS ({filteredNotes.length})
                  </Text>
                  <Card style={styles.resultsCard}>
                    {filteredNotes.map((note, idx) => (
                      <ListRow
                        key={note.id}
                        title={note.title || 'Note'}
                        subtitle={note.content}
                        avatarText="📝"
                        showDivider={idx < filteredNotes.length - 1}
                        onPress={() => router.push('/(tabs)/notes')}
                      />
                    ))}
                  </Card>
                </View>
              )}
            </>
          )}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  phoneFrame: {
    flex: 1,
    width: '100%',
    maxWidth: 412,
    alignSelf: 'center',
  },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 12,
  },
  searchBox: {
    flex: 1,
    height: 44,
    backgroundColor: '#FFFFFF',
    borderRadius: Radius.card,
    borderWidth: 0.5,
    borderColor: Colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    gap: 8,
  },
  input: {
    flex: 1,
    fontSize: Typography.sizes.base,
    color: Colors.text,
  },
  cancelBtn: {
    paddingVertical: 6,
  },
  cancelText: {
    fontSize: Typography.sizes.base,
    color: Colors.accent,
    fontWeight: Typography.weights.medium,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 32,
  },
  recentSection: {
    marginTop: 12,
  },
  sectionTitle: {
    fontSize: Typography.sizes.xs,
    fontWeight: Typography.weights.semibold,
    color: Colors.muted,
    marginBottom: 10,
  },
  suggestions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  suggestionPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: Radius.pill,
    borderWidth: 0.5,
    borderColor: Colors.border,
  },
  suggestionPillText: {
    fontSize: Typography.sizes.sm,
    color: Colors.text,
  },
  resultsGroup: {
    marginBottom: 16,
  },
  groupHeader: {
    fontSize: Typography.sizes.xs,
    fontWeight: Typography.weights.semibold,
    color: Colors.muted,
    marginBottom: 8,
    marginLeft: 4,
  },
  resultsCard: {
    overflow: 'hidden',
  },
});
