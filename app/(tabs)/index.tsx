import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Platform,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Radius, Typography, Layout } from '../../src/constants/theme';
import { Card, OrangeCorner, ListRow } from '../../src/components/ui';
import { useAuth } from '../../src/context/AuthContext';
import { INITIAL_CATEGORIES, INITIAL_CONTACTS, INITIAL_NOTES } from '../../src/data/mockData';

export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { profile, user } = useAuth();
  const [refreshing, setRefreshing] = useState(false);

  const displayName = profile?.name ? profile.name.split(' ')[0] : 'there';
  const initials = profile?.name
    ? profile.name
        .split(' ')
        .map((n) => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : 'MK';

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 600);
  };

  return (
    <SafeAreaView style={[styles.safeArea, { paddingTop: Platform.OS === 'android' ? insets.top : 0 }]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.accent} />
        }
      >
        <View style={styles.phoneFrame}>
          {/* Top Bar: Avatar Greeting & Notifications */}
          <View style={styles.topBar}>
            {/* Avatar on Home opens Settings (Specification requirement!) */}
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => router.push('/settings')}
              style={styles.greetingContainer}
            >
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{initials}</Text>
              </View>
              <View>
                <Text style={styles.greetingLabel}>Good morning</Text>
                <Text style={styles.userName}>{displayName}</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => router.push('/(tabs)/notes')}
              style={styles.iconButton}
            >
              <Ionicons name="notifications-outline" size={20} color={Colors.text} />
              <View style={styles.notificationDot} />
            </TouchableOpacity>
          </View>

          {/* Search Bar */}
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => router.push('/search')}
            style={styles.searchBar}
          >
            <Ionicons name="search-outline" size={18} color={Colors.muted} />
            <Text style={styles.searchPlaceholder}>Search people, notes, companies</Text>
          </TouchableOpacity>

          {/* Today's Follow-ups Card */}
          <Card
            onPress={() => router.push('/(tabs)/notes')}
            style={styles.todayCard}
          >
            <Text style={styles.cardEyebrow}>Today, 4 Nov</Text>
            <Text style={styles.cardHeading}>3 follow-ups</Text>

            <View style={styles.followUpItem}>
              <View style={styles.followUpRing} />
              <View style={styles.followUpContent}>
                <Text style={styles.followUpTitle}>Call Ramesh about order</Text>
                <Text style={styles.followUpTime}>10:30 AM</Text>
              </View>
            </View>

            <View style={styles.followUpItem}>
              <View style={styles.followUpRing} />
              <View style={styles.followUpContent}>
                <Text style={styles.followUpTitle}>Send proposal to Mukesh</Text>
                <Text style={styles.followUpTime}>2:00 PM</Text>
              </View>
            </View>

            {/* Signature Orange Corner with Arrow */}
            <OrangeCorner icon="arrow-forward" width={78} height={58} />
          </Card>

          {/* Quick Action Buttons (4-grid) */}
          <View style={styles.quickGrid}>
            <TouchableOpacity
              activeOpacity={0.8}
              style={styles.quickBtn}
              onPress={() => router.push('/scan-card')}
            >
              <View style={styles.quickIconWrap}>
                <Ionicons name="scan-outline" size={20} color={Colors.text} />
              </View>
              <Text style={styles.quickLabel}>Scan card</Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.8}
              style={styles.quickBtn}
              onPress={() => router.push('/contact/new')}
            >
              <View style={styles.quickIconWrap}>
                <Ionicons name="person-add-outline" size={20} color={Colors.text} />
              </View>
              <Text style={styles.quickLabel}>Add person</Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.8}
              style={styles.quickBtn}
              onPress={() => router.push('/notes/new')}
            >
              <View style={styles.quickIconWrap}>
                <Ionicons name="document-text-outline" size={20} color={Colors.text} />
              </View>
              <Text style={styles.quickLabel}>New note</Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.8}
              style={styles.quickBtn}
              onPress={() => router.push('/my-card')}
            >
              <View style={styles.quickIconWrap}>
                <Ionicons name="qr-code-outline" size={20} color={Colors.text} />
              </View>
              <Text style={styles.quickLabel}>My card</Text>
            </TouchableOpacity>
          </View>

          {/* Ask Recallr AI Card */}
          <Card
            onPress={() => router.push('/(tabs)/ask-ai')}
            style={styles.aiCard}
          >
            <View style={styles.aiHeader}>
              <View style={styles.sparkleIconWrap}>
                <Ionicons name="sparkles" size={16} color={Colors.accent} />
              </View>
              <Text style={styles.aiTitle}>Ask Recallr</Text>
            </View>
            <Text style={styles.aiPromptText}>
              Who is Ramesh? Who do I know in plastics?
            </Text>

            {/* Signature Orange Corner with Arrow-Up */}
            <OrangeCorner icon="arrow-up" width={78} height={58} />
          </Card>

          {/* Categories Section */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Categories</Text>
            <TouchableOpacity onPress={() => router.push('/categories')}>
              <Text style={styles.seeAllText}>See all</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.categoriesGrid}>
            {INITIAL_CATEGORIES.slice(0, 4).map((cat) => (
              <Card
                key={cat.id}
                onPress={() => router.push({ pathname: '/(tabs)/people', params: { categoryId: cat.id } })}
                style={styles.categoryCard}
              >
                <View style={styles.catIconWrap}>
                  <Ionicons
                    name={
                      cat.icon === 'school-outline'
                        ? 'school-outline'
                        : cat.icon === 'code-slash-outline'
                        ? 'code-slash-outline'
                        : cat.icon === 'business-outline'
                        ? 'business-outline'
                        : 'briefcase-outline'
                    }
                    size={20}
                    color={Colors.text}
                  />
                </View>
                <Text style={styles.catName} numberOfLines={1}>
                  {cat.name}
                </Text>
                <Text style={styles.catSubtext}>{cat.recent_activity || `${cat.count} people`}</Text>

                {/* Signature Orange Corner holding Category Count */}
                <OrangeCorner count={cat.count} width={50} height={40} />
              </Card>
            ))}
          </View>

          {/* Recent Connections Section */}
          <View style={[styles.sectionHeader, { marginTop: 20 }]}>
            <Text style={styles.sectionTitle}>Recent Connections</Text>
            <TouchableOpacity onPress={() => router.push('/(tabs)/people')}>
              <Text style={styles.seeAllText}>View all</Text>
            </TouchableOpacity>
          </View>

          <Card style={styles.recentContactsCard}>
            {INITIAL_CONTACTS.slice(0, 3).map((contact, idx) => (
              <ListRow
                key={contact.id}
                title={contact.name}
                subtitle={`${contact.headline} · ${contact.company}`}
                tag={contact.category_names?.[0]}
                showDivider={idx < 2}
                onPress={() => router.push({ pathname: '/contact/[id]', params: { id: contact.id } })}
              />
            ))}
          </Card>
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
    paddingBottom: 28,
    alignItems: 'center',
  },
  phoneFrame: {
    width: '100%',
    maxWidth: 412,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
  },
  greetingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: Radius.full,
    backgroundColor: Colors.accentLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: Colors.accent,
    fontWeight: Typography.weights.semibold,
    fontSize: 16,
  },
  greetingLabel: {
    fontSize: Typography.sizes.sm,
    color: Colors.secondary,
  },
  userName: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.medium,
    color: Colors.text,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: Radius.full,
    backgroundColor: '#FFFFFF',
    borderWidth: 0.5,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  notificationDot: {
    position: 'absolute',
    top: 9,
    right: 10,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.accent,
  },
  searchBar: {
    marginTop: 12,
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
  todayCard: {
    marginTop: 14,
    padding: 16,
    paddingBottom: 18,
  },
  cardEyebrow: {
    fontSize: Typography.sizes.sm,
    color: Colors.secondary,
  },
  cardHeading: {
    fontSize: Typography.sizes.xl,
    fontWeight: Typography.weights.medium,
    color: Colors.text,
    marginVertical: 4,
  },
  followUpItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 8,
  },
  followUpRing: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 1.5,
    borderColor: Colors.accent,
  },
  followUpContent: {
    flex: 1,
  },
  followUpTitle: {
    fontSize: Typography.sizes.sm,
    color: Colors.text,
    fontWeight: Typography.weights.medium,
  },
  followUpTime: {
    fontSize: Typography.sizes.xs,
    color: Colors.secondary,
  },
  quickGrid: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 14,
  },
  quickBtn: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 0.5,
    borderColor: Colors.border,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  quickLabel: {
    fontSize: Typography.sizes.xs,
    color: Colors.text,
    fontWeight: Typography.weights.medium,
  },
  aiCard: {
    marginTop: 14,
    padding: 14,
    paddingBottom: 16,
  },
  aiHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sparkleIconWrap: {
    width: 28,
    height: 28,
    borderRadius: 7,
    backgroundColor: Colors.accentLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  aiTitle: {
    fontWeight: Typography.weights.medium,
    fontSize: Typography.sizes.base,
    color: Colors.text,
  },
  aiPromptText: {
    marginTop: 10,
    fontSize: Typography.sizes.sm,
    color: Colors.muted,
    width: '65%',
    lineHeight: 18,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 18,
    marginBottom: 10,
    paddingHorizontal: 2,
  },
  sectionTitle: {
    fontSize: Typography.sizes.base,
    fontWeight: Typography.weights.semibold,
    color: Colors.text,
  },
  seeAllText: {
    fontSize: Typography.sizes.sm,
    color: Colors.accent,
    fontWeight: Typography.weights.medium,
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  categoryCard: {
    width: '48%',
    padding: 14,
    paddingBottom: 18,
  },
  catIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  catName: {
    fontWeight: Typography.weights.medium,
    fontSize: Typography.sizes.sm,
    color: Colors.text,
  },
  catSubtext: {
    fontSize: Typography.sizes.xs,
    color: Colors.secondary,
    marginTop: 2,
  },
  recentContactsCard: {
    overflow: 'hidden',
  },
});
