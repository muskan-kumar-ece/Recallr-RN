import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Linking,
} from 'react-native';
import { colors, radius, tokens } from '@recallr/tokens';
import { useCategories, useReminders, useContacts, useUserSettings, useProfile, useUpdateContact } from '@recallr/api';
import { useRecallrAuth } from '../providers/RecallrProvider';
import { isFollowUpDue } from '@recallr/core';
import { Card, OrangeCorner, Avatar, PressableScale } from '../components/ui';
import {
  IconSearch,
  IconBell,
  IconScan,
  IconUserPlus,
  IconNotebook,
  IconQrcode,
  IconSparkles,
  IconArrowRight,
  IconArrowUp,
  IconSchool,
  IconCode,
  IconBuildingFactory2,
  IconPlus,
  IconPhone,
} from '@tabler/icons-react-native';

export interface HomeScreenProps {
  onNavigate: (screen: string, params?: Record<string, unknown>) => void;
  onShowToast: (message: string) => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  onNavigate,
  onShowToast,
}) => {
  const { user } = useRecallrAuth();
  const { data: profile } = useProfile(user?.id);
  const { data: userSettings } = useUserSettings();
  const { data: dbCategories } = useCategories();
  const { data: dbReminders, isLoading: remindersLoading } = useReminders();
  const { data: dbContacts, isLoading: contactsLoading } = useContacts();
  const { mutateAsync: updateContact } = useUpdateContact();

  const userName = profile?.full_name || user?.user_metadata?.full_name || 'Friend';
  const categoryList = (dbCategories || []).slice(0, 3);

  const todayReminders = useMemo(() => {
    if (!dbReminders) return [];
    const now = new Date();
    const todayStr = now.toISOString().slice(0, 10);
    return dbReminders.filter((r) => {
      if (!r.remind_at) return false;
      return new Date(r.remind_at).toISOString().slice(0, 10) === todayStr;
    });
  }, [dbReminders]);

  const needsFollowUpList = useMemo(() => {
    if (!dbContacts || dbContacts.length === 0) return [];
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

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* 1. Header */}
      <View style={styles.headerRow}>
        <PressableScale
          onPress={() => onNavigate('settings')}
          haptic="light"
          style={styles.userProfile}
        >
          <Avatar name={userName} size="md" />
          <View style={styles.userTextCol}>
            <Text style={styles.greetingText}>Good morning</Text>
            <Text style={styles.userName}>{userName.split(' ')[0]}</Text>
          </View>
        </PressableScale>

        <PressableScale
          onPress={() => onNavigate('notes')}
          haptic="light"
          style={styles.bellButton}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <IconBell size={20} color={colors.text} strokeWidth={1.8} />
          {todayReminders.length > 0 && <View style={styles.bellBadge} />}
        </PressableScale>
      </View>

      {/* 2. Search Bar */}
      <PressableScale
        onPress={() => onNavigate('search')}
        haptic="light"
        style={styles.searchBar}
      >
        <IconSearch size={18} color={colors.textMuted} strokeWidth={2} />
        <Text style={styles.searchPlaceholder}>
          Search people, notes, companies
        </Text>
      </PressableScale>

      {/* 3. Today Hero Card */}
      <Card style={styles.todayCard}>
        <OrangeCorner
          size="lg"
          onPress={() => onNavigate('notes')}
          icon={<IconArrowRight size={22} color="#FFFFFF" strokeWidth={2.2} />}
        />
        <Text style={styles.todayDate}>
          Today, {new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}
        </Text>

        {remindersLoading ? (
          <Text style={[styles.todayTitle, { opacity: 0.6 }]}>Loading...</Text>
        ) : todayReminders.length > 0 ? (
          <>
            <Text style={styles.todayTitle}>
              {todayReminders.length} follow-up{todayReminders.length > 1 ? 's' : ''}
            </Text>

            {todayReminders.slice(0, 2).map((r, idx) => {
              const timeStr = r.remind_at
                ? new Date(r.remind_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                : '';
              return (
                <PressableScale
                  key={r.id}
                  onPress={() => {
                    if (r.contact_id) {
                      onNavigate('contact-profile', { id: r.contact_id });
                    } else {
                      onNavigate('notes');
                    }
                  }}
                  haptic="light"
                  style={[styles.followUpRow, idx > 0 && { marginTop: 12 }]}
                >
                  <View style={styles.radioCircle} />
                  <View style={styles.followUpTextCol}>
                    <Text style={styles.followUpTitle} numberOfLines={1}>
                      {r.title || r.body || 'Follow up'}
                    </Text>
                    {timeStr ? <Text style={styles.followUpTime}>{timeStr}</Text> : null}
                  </View>
                </PressableScale>
              );
            })}
          </>
        ) : (
          <View style={{ paddingTop: 4 }}>
            <Text style={styles.todayTitle}>All caught up</Text>
            <Text style={{ fontSize: 13, color: colors.textSecondary, marginTop: 2 }}>
              No follow-ups scheduled for today. Tap to add a note or reminder.
            </Text>
          </View>
        )}
      </Card>

      {/* 4. Quick Action Tiles */}
      <View style={styles.quickActionsGrid}>
        <PressableScale
          onPress={() => onNavigate('scan')}
          haptic="light"
          style={styles.actionCol}
        >
          <View style={styles.actionTileBox}>
            <IconScan size={24} color={colors.accent} strokeWidth={2} />
          </View>
          <Text style={styles.actionTileLabel}>Scan card</Text>
        </PressableScale>

        <PressableScale
          onPress={() => onNavigate('contact-new')}
          haptic="light"
          style={styles.actionCol}
        >
          <View style={styles.actionTileBox}>
            <IconUserPlus size={24} color={colors.accent} strokeWidth={2} />
          </View>
          <Text style={styles.actionTileLabel}>Add person</Text>
        </PressableScale>

        <PressableScale
          onPress={() => onNavigate('note-new')}
          haptic="light"
          style={styles.actionCol}
        >
          <View style={styles.actionTileBox}>
            <IconNotebook size={24} color={colors.accent} strokeWidth={2} />
          </View>
          <Text style={styles.actionTileLabel}>New note</Text>
        </PressableScale>

        <PressableScale
          onPress={() => onNavigate('my-card')}
          haptic="light"
          style={styles.actionCol}
        >
          <View style={styles.actionTileBox}>
            <IconQrcode size={24} color={colors.accent} strokeWidth={2} />
          </View>
          <Text style={styles.actionTileLabel}>My card</Text>
        </PressableScale>
      </View>

      {/* 5. Ask Recallr Quick Card */}
      <Card
        style={styles.askCard}
        onPress={() => onNavigate('ask')}
      >
        <OrangeCorner
          size="md"
          icon={<IconArrowUp size={20} color="#FFFFFF" strokeWidth={2.4} />}
        />
        <View style={styles.askHeaderRow}>
          <View style={styles.askSparkleIcon}>
            <IconSparkles size={16} color={colors.accent} strokeWidth={2.2} />
          </View>
          <Text style={styles.askTitle}>Ask Recallr</Text>
        </View>
        <Text style={styles.askSubtitle}>
          Who do I need to follow up with? Ask anything about your network.
        </Text>
      </Card>

      {/* 6. Categories Section */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Categories</Text>
        <PressableScale
          onPress={() => onNavigate('categories')}
          haptic="light"
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Text style={styles.sectionLink}>See all</Text>
        </PressableScale>
      </View>

      <View style={styles.categoriesGrid}>
        {categoryList.map((cat) => (
          <Card
            key={cat.id}
            style={styles.catCard}
            padding="none"
            onPress={() => onNavigate('category-detail', { id: cat.id })}
          >
            <OrangeCorner size="sm" count={cat.count ?? 0} />
            <View style={styles.catIconSquare}>
              {cat.icon === 'code' ? (
                <IconCode size={18} color={colors.accent} strokeWidth={2} />
              ) : cat.icon === 'factory' || cat.icon === 'building' ? (
                <IconBuildingFactory2 size={18} color={colors.accent} strokeWidth={2} />
              ) : (
                <IconSchool size={18} color={colors.accent} strokeWidth={2} />
              )}
            </View>
            <Text style={styles.catCardTitle} numberOfLines={1}>
              {cat.name}
            </Text>
            <Text style={styles.catCardSub} numberOfLines={1}>{cat.count ?? 0} contacts</Text>
          </Card>
        ))}

        <Card
          style={[styles.catCard, styles.newCatCard]}
          padding="none"
          onPress={() => onNavigate('category-new')}
        >
          <View style={styles.newCatContent}>
            <IconPlus size={22} color={colors.accent} strokeWidth={2.4} />
            <Text style={styles.newCatText}>New category</Text>
          </View>
        </Card>
      </View>

      {/* 7. Needs Follow-up Section */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Needs follow-up</Text>
        <PressableScale
          onPress={() => onNavigate('people')}
          haptic="light"
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Text style={styles.sectionLink}>View all</Text>
        </PressableScale>
      </View>

      <Card style={styles.followUpCard}>
        {contactsLoading ? (
          <Text style={{ fontSize: 13, color: colors.textSecondary, padding: 12 }}>
            Loading contacts...
          </Text>
        ) : needsFollowUpList.length > 0 ? (
          needsFollowUpList.slice(0, 3).map((c, idx) => {
            const daysAgo = Math.floor(
              (Date.now() - new Date(c.last_contacted_at || c.created_at).getTime()) /
                (1000 * 60 * 60 * 24)
            );
            return (
              <React.Fragment key={c.id}>
                {idx > 0 && <View style={styles.divider} />}
                <PressableScale
                  onPress={() => onNavigate('contact-profile', { id: c.id })}
                  haptic="light"
                  activeBackgroundColor={tokens.colors.pressedRow}
                  style={styles.personRow}
                >
                  <Avatar name={c.name} size="sm" />
                  <View style={styles.personInfo}>
                    <Text style={styles.personName}>{c.name}</Text>
                    <Text style={styles.personRole}>
                      {c.role || c.company || 'Contact'} · {daysAgo} days ago
                    </Text>
                  </View>
                  {c.phone ? (
                    <PressableScale
                      onPress={() => {
                        void Linking.openURL(`tel:${c.phone}`)
                          .then(() => updateContact({ id: c.id, input: { last_contacted_at: new Date().toISOString() } }))
                          .catch((error: unknown) => onShowToast(error instanceof Error ? error.message : 'Could not open the phone app'));
                      }}
                      haptic="light"
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                      style={styles.phoneIconBtn}
                    >
                      <IconPhone size={18} color={colors.accent} strokeWidth={2} />
                    </PressableScale>
                  ) : null}
                </PressableScale>
              </React.Fragment>
            );
          })
        ) : (
          <View style={{ padding: 16, alignItems: 'center' }}>
            <Text style={{ fontSize: 13, fontWeight: '500', color: colors.text }}>
              All caught up!
            </Text>
            <Text style={{ fontSize: 12, color: colors.textSecondary, marginTop: 2 }}>
              No contacts overdue for follow-up right now.
            </Text>
          </View>
        )}
      </Card>

      <View style={{ height: 90 }} />
    </ScrollView>
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
    marginBottom: 14,
  },
  userProfile: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  userTextCol: {
    justifyContent: 'center',
  },
  greetingText: {
    fontSize: 13,
    color: colors.textMuted,
    fontFamily: 'Inter',
  },
  userName: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    fontFamily: 'Inter',
  },
  bellButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surface,
    borderWidth: 0.5,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  bellBadge: {
    position: 'absolute',
    top: 9,
    right: 10,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.accent,
  },
  searchBar: {
    height: 48,
    backgroundColor: colors.surface,
    borderRadius: radius.card,
    borderWidth: 0.5,
    borderColor: colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    gap: 10,
    marginBottom: 14,
  },
  searchPlaceholder: {
    fontSize: 14,
    color: colors.textMuted,
    fontFamily: 'Inter',
  },
  todayCard: {
    padding: 16,
    marginBottom: 16,
    position: 'relative',
  },
  todayDate: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.textMuted,
    fontFamily: 'Inter',
  },
  todayTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text,
    fontFamily: 'Inter',
    marginTop: 4,
    marginBottom: 14,
  },
  followUpRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  radioCircle: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 1.5,
    borderColor: colors.accent,
    backgroundColor: '#FFFFFF',
  },
  followUpTextCol: {
    flex: 1,
  },
  followUpTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
    fontFamily: 'Inter',
  },
  followUpTime: {
    fontSize: 12,
    color: colors.textMuted,
    fontFamily: 'Inter',
    marginTop: 1,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  actionCol: {
    alignItems: 'center',
    flex: 1,
  },
  actionTileBox: {
    width: 62,
    height: 62,
    borderRadius: radius.card,
    backgroundColor: colors.surface,
    borderWidth: 0.5,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionTileLabel: {
    fontSize: 11,
    fontWeight: '500',
    color: colors.textSecondary,
    fontFamily: 'Inter',
    marginTop: 6,
    textAlign: 'center',
  },
  askCard: {
    padding: 16,
    marginBottom: 18,
    position: 'relative',
  },
  askHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  askSparkleIcon: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: colors.accentTint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  askTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
    fontFamily: 'Inter',
    marginLeft: 8,
  },
  askSubtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    fontFamily: 'Inter',
    marginTop: 8,
    maxWidth: '82%',
    lineHeight: 18,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    fontFamily: 'Inter',
  },
  sectionLink: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.accent,
    fontFamily: 'Inter',
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 10,
    marginBottom: 18,
  },
  catCard: {
    width: '48.5%',
    padding: 12,
    height: 106,
    position: 'relative',
    justifyContent: 'flex-start',
  },
  newCatCard: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 0,
  },
  newCatContent: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  newCatText: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.accent,
    fontFamily: 'Inter',
  },
  catIconSquare: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: colors.accentTint,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  catCardTitle: {
    fontSize: 13.5,
    fontWeight: '600',
    color: colors.text,
    fontFamily: 'Inter',
    letterSpacing: -0.2,
  },
  catCardSub: {
    fontSize: 11,
    color: colors.textMuted,
    fontFamily: 'Inter',
    marginTop: 2,
    maxWidth: '70%',
  },
  followUpCard: {
    padding: 0,
    overflow: 'hidden',
    marginBottom: 14,
  },
  personRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    gap: 12,
  },
  personInfo: {
    flex: 1,
  },
  personName: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    fontFamily: 'Inter',
  },
  personRole: {
    fontSize: 12,
    color: colors.textSecondary,
    fontFamily: 'Inter',
    marginTop: 2,
  },
  phoneIconBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.surface,
    borderWidth: 0.5,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  divider: {
    height: 0.5,
    backgroundColor: colors.divider,
    marginHorizontal: 14,
  },
});
