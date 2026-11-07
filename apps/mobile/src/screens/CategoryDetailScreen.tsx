import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { colors, radius, tokens } from '@recallr/tokens';
import { Card, OrangeCorner, Avatar, Button, SearchBar, PressableScale } from '../components/ui';
import {
  IconArrowLeft,
  IconDots,
  IconPencil,
  IconBuildingFactory2,
  IconSparkles,
  IconChevronRight,
  IconUsers,
} from '@tabler/icons-react-native';
import { useCategories, useContacts } from '@recallr/api';

export interface CategoryDetailScreenProps {
  categoryId?: string;
  onBack: () => void;
  onOpenMenu: () => void;
  onEditCategory: () => void;
  onAddPerson: () => void;
  onAskGroup: () => void;
  onSelectPerson: (id: string) => void;
}

export const CategoryDetailScreen: React.FC<CategoryDetailScreenProps> = ({
  categoryId,
  onBack,
  onOpenMenu,
  onEditCategory,
  onAddPerson,
  onAskGroup,
  onSelectPerson,
}) => {
  const { data: categories, isLoading: isCatLoading } = useCategories();
  const { data: allContacts, isLoading: isContactsLoading } = useContacts();

  const [searchQuery, setSearchQuery] = useState('');

  const currentCategory = categories?.find((c) => c.id === categoryId) || categories?.[0];
  const catName = currentCategory?.name || 'Category';

  const categoryContacts = (allContacts || []).filter((contact) => {
    const inCat = currentCategory ? contact.category_ids?.includes(currentCategory.id) : true;
    if (!inCat) return false;
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      contact.name?.toLowerCase().includes(q) ||
      contact.company?.toLowerCase().includes(q) ||
      contact.role?.toLowerCase().includes(q)
    );
  });

  const isLoading = isCatLoading || isContactsLoading;

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Bar */}
        <View style={styles.navRow}>
          <PressableScale
            onPress={onBack}
            haptic="light"
            style={styles.circleBtn}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <IconArrowLeft size={20} color={colors.text} strokeWidth={2} />
          </PressableScale>

          <PressableScale
            onPress={onOpenMenu}
            haptic="light"
            style={styles.circleBtn}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <IconDots size={20} color={colors.text} strokeWidth={2} />
          </PressableScale>
        </View>

        {/* Category Header Card */}
        <Card style={styles.headerCard}>
          <OrangeCorner
            size="md"
            onPress={onEditCategory}
            icon={<IconPencil size={18} color="#FFFFFF" strokeWidth={2.2} />}
          />
          <View style={styles.headerCardContent}>
            <View style={styles.headerIconBox}>
              <IconBuildingFactory2 size={24} color={currentCategory?.color || colors.accent} strokeWidth={2} />
            </View>
            <View>
              <Text style={styles.catName}>{catName}</Text>
              <Text style={styles.catSub}>
                {categoryContacts.length} {categoryContacts.length === 1 ? 'person' : 'people'}
              </Text>
            </View>
          </View>
        </Card>

        {/* Action Row */}
        <View style={styles.actionRow}>
          <Button
            title="+ Add person"
            variant="primary"
            size="sm"
            onPress={onAddPerson}
            style={styles.actionBtn}
          />
          <Button
            title="Ask about this group"
            variant="outline"
            size="sm"
            leftIcon={<IconSparkles size={16} color={colors.accent} />}
            onPress={onAskGroup}
            style={styles.actionBtn}
          />
        </View>

        {/* Search */}
        <View style={styles.searchContainer}>
          <SearchBar
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder={`Search in ${catName}`}
          />
        </View>

        {/* People List */}
        {isLoading ? (
          <View style={styles.loadingBox}>
            <ActivityIndicator size="small" color={colors.accent} />
          </View>
        ) : categoryContacts.length === 0 ? (
          <Card style={styles.emptyCard}>
            <IconUsers size={32} color={colors.textMuted} strokeWidth={1.5} />
            <Text style={styles.emptyTitle}>No contacts in {catName}</Text>
            <Text style={styles.emptySub}>
              Assign people to this category from their profile or add someone new.
            </Text>
          </Card>
        ) : (
          <Card style={styles.peopleListCard}>
            {categoryContacts.map((contact, idx) => (
              <React.Fragment key={contact.id}>
                {idx > 0 && <View style={styles.divider} />}
                <PressableScale
                  onPress={() => onSelectPerson(contact.id)}
                  haptic="light"
                  activeBackgroundColor={tokens.colors.pressedRow}
                  style={styles.personRow}
                >
                  <Avatar
                    name={contact.name}
                    src={contact.photo_path || undefined}
                    size="sm"
                  />
                  <View style={styles.personCol}>
                    <Text style={styles.personName}>{contact.name}</Text>
                    <Text style={styles.personSub}>
                      {[contact.role, contact.company].filter(Boolean).join(' • ') || 'No company listed'}
                    </Text>
                  </View>
                  <IconChevronRight size={18} color={colors.textMuted} strokeWidth={2} />
                </PressableScale>
              </React.Fragment>
            ))}
          </Card>
        )}

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
  content: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  navRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  circleBtn: {
    width: 36,
    height: 36,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.card,
    padding: 16,
    marginBottom: 16,
    position: 'relative',
    overflow: 'hidden',
  },
  headerCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingRight: 32,
  },
  headerIconBox: {
    width: 48,
    height: 48,
    borderRadius: radius.md,
    backgroundColor: colors.accentTintSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  catName: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  catSub: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  actionBtn: {
    flex: 1,
  },
  searchContainer: {
    marginBottom: 16,
  },
  loadingBox: {
    paddingVertical: 32,
    alignItems: 'center',
  },
  emptyCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.card,
    padding: 24,
    alignItems: 'center',
    textAlign: 'center',
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
    marginTop: 8,
  },
  emptySub: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 4,
    lineHeight: 16,
  },
  peopleListCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.card,
    overflow: 'hidden',
  },
  personRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  personCol: {
    flex: 1,
  },
  personName: {
    fontSize: 15,
    fontWeight: '500',
    color: colors.text,
  },
  personSub: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.divider,
    marginLeft: 56,
  },
});
