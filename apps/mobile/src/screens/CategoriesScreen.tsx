import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { colors, radius } from '@recallr/tokens';
import { useCategories, useContacts } from '@recallr/api';
import { Card, OrangeCorner, PressableScale } from '../components/ui';
import {
  IconArrowLeft,
  IconPlus,
  IconSchool,
  IconCode,
  IconBuildingFactory2,
  IconBuildingStore,
  IconInbox,
  IconSparkles,
  IconFolders,
} from '@tabler/icons-react-native';

export interface CategoriesScreenProps {
  onBack: () => void;
  onOpenDetail: (id: string) => void;
  onOpenNewCategory: () => void;
}

export const CategoriesScreen: React.FC<CategoriesScreenProps> = ({
  onBack,
  onOpenDetail,
  onOpenNewCategory,
}) => {
  const { data: dbCategories, isLoading } = useCategories();
  const { data: allContacts } = useContacts();

  // Compute actual contacts count per category
  const categoriesWithCounts = (dbCategories || []).map((cat) => {
    const count = (allContacts || []).filter((c) =>
      c.categories?.some((ct) => ct.id === cat.id || ct.name === cat.name)
    ).length;
    return { ...cat, count };
  });

  const uncategorizedCount = (allContacts || []).filter(
    (c) => !c.categories || c.categories.length === 0
  ).length;

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.headerRow}>
          <View style={styles.headerTitleRow}>
            <PressableScale
              onPress={onBack}
              haptic="light"
              style={styles.backBtn}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <IconArrowLeft size={20} color={colors.text} strokeWidth={2} />
            </PressableScale>
            <Text style={styles.headerTitle}>Categories</Text>
          </View>

          <PressableScale
            onPress={onOpenNewCategory}
            haptic="light"
            style={styles.addBtn}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <IconPlus size={20} color="#FFFFFF" strokeWidth={2.5} />
          </PressableScale>
        </View>

        {/* Categories Grid or Skeletons / Empty */}
        {isLoading ? (
          <View style={styles.grid}>
            {[1, 2, 3, 4].map((i) => (
              <Card key={i} style={[styles.catCard, { opacity: 0.6 }]} padding="none">
                <View style={[styles.iconBox, { backgroundColor: colors.border }]} />
                <View style={{ height: 16, width: 80, backgroundColor: colors.border, borderRadius: 4, marginTop: 8 }} />
                <View style={{ height: 12, width: 50, backgroundColor: colors.border, borderRadius: 4, marginTop: 6 }} />
              </Card>
            ))}
          </View>
        ) : categoriesWithCounts.length === 0 ? (
          <Card style={{ padding: 24, alignItems: 'center', marginBottom: 16 }}>
            <View style={[styles.iconBox, { marginBottom: 10 }]}>
              <IconFolders size={22} color={colors.accent} strokeWidth={2} />
            </View>
            <Text style={{ fontSize: 16, fontWeight: '600', color: colors.text }}>No categories yet</Text>
            <Text style={{ fontSize: 13, color: colors.textSecondary, textAlign: 'center', marginTop: 4 }}>
              Group your contacts into circles like Friends, Clients, or Founders.
            </Text>
            <PressableScale
              onPress={onOpenNewCategory}
              haptic="light"
              style={[styles.addBtn, { width: 'auto', paddingHorizontal: 16, height: 38, marginTop: 14 }]}
            >
              <Text style={{ color: '#FFFFFF', fontWeight: '600', fontSize: 14 }}>Create category</Text>
            </PressableScale>
          </Card>
        ) : (
          <View style={styles.grid}>
            {categoriesWithCounts.map((cat) => (
              <Card
                key={cat.id}
                style={styles.catCard}
                padding="none"
                onPress={() => onOpenDetail(cat.id)}
              >
                <OrangeCorner size="sm" count={cat.count ?? 0} />
                <View style={styles.iconBox}>
                  {cat.icon === 'code' ? (
                    <IconCode size={18} color={colors.accent} strokeWidth={2} />
                  ) : cat.icon === 'factory' || cat.icon === 'building' ? (
                    <IconBuildingFactory2 size={18} color={colors.accent} strokeWidth={2} />
                  ) : cat.icon === 'store' ? (
                    <IconBuildingStore size={18} color={colors.accent} strokeWidth={2} />
                  ) : (
                    <IconSchool size={18} color={colors.accent} strokeWidth={2} />
                  )}
                </View>
                <Text style={styles.catTitle} numberOfLines={1}>{cat.name}</Text>
                <Text style={styles.catSub} numberOfLines={1}>
                  {cat.count === 1 ? '1 contact' : `${cat.count} contacts`}
                </Text>
              </Card>
            ))}
          </View>
        )}

        {/* Uncategorized Card */}
        {uncategorizedCount > 0 && (
          <Card style={styles.uncatCard}>
            <View style={styles.uncatLeft}>
              <View style={styles.uncatIconBox}>
                <IconInbox size={18} color={colors.textSecondary} strokeWidth={2} />
              </View>
              <View>
                <Text style={styles.uncatTitle}>Uncategorized</Text>
                <Text style={styles.uncatSub}>{uncategorizedCount} people to sort</Text>
              </View>
            </View>

            <View style={[styles.sortAiBtn, styles.sortAiDisabled]} accessibilityState={{ disabled: true }}>
              <IconSparkles size={14} color={colors.accent} strokeWidth={2} />
              <Text style={styles.sortAiText}>AI sorting unavailable</Text>
            </View>
          </Card>
        )}

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
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.surface,
    borderWidth: 0.5,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '600',
    color: colors.text,
    fontFamily: 'Inter',
  },
  addBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 10,
    marginBottom: 16,
  },
  catCard: {
    width: '48.5%',
    padding: 12,
    height: 112,
    position: 'relative',
    justifyContent: 'flex-start',
  },
  iconBox: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: colors.accentTint,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  catTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text,
    fontFamily: 'Inter',
  },
  catSub: {
    fontSize: 11,
    color: colors.textMuted,
    fontFamily: 'Inter',
    marginTop: 2,
  },
  uncatCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
  },
  uncatLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  uncatIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: colors.fill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  uncatTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    fontFamily: 'Inter',
  },
  uncatSub: {
    fontSize: 12,
    color: colors.textMuted,
    fontFamily: 'Inter',
    marginTop: 2,
  },
  sortAiBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.accent,
    backgroundColor: colors.surface,
  },
  sortAiDisabled: { opacity: 0.6 },
  sortAiText: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.accent,
    fontFamily: 'Inter',
  },
});
