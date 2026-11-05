import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  TextInput,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Radius, Typography } from '../../src/constants/theme';
import { Card, OrangeCorner, Button } from '../../src/components/ui';
import { INITIAL_CATEGORIES } from '../../src/data/mockData';
import { useToast } from '../../src/context/ToastContext';

export default function CategoriesScreen() {
  const router = useRouter();
  const { showToast } = useToast();
  const [categories, setCategories] = useState(INITIAL_CATEGORIES);
  const [newCatName, setNewCatName] = useState('');
  const [showAdd, setShowAdd] = useState(false);

  const handleCreate = () => {
    if (!newCatName.trim()) return;
    const newCat = {
      id: String(Date.now()),
      user_id: 'demo-user-123',
      name: newCatName.trim(),
      icon: 'bookmark-outline',
      color: Colors.accent,
      count: 0,
      recent_activity: 'Just added',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    setCategories((prev) => [...prev, newCat]);
    setNewCatName('');
    setShowAdd(false);
    showToast(`Category "${newCat.name}" created!`);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.phoneFrame}>
          <View style={styles.headerRow}>
            <Text style={styles.subtitle}>{categories.length} active categories</Text>
            <TouchableOpacity onPress={() => setShowAdd(!showAdd)}>
              <Text style={styles.addBtnText}>+ New</Text>
            </TouchableOpacity>
          </View>

          {showAdd && (
            <Card style={styles.addCard}>
              <Text style={styles.addTitle}>Create New Category</Text>
              <TextInput
                placeholder="e.g. Investors, Mentors"
                placeholderTextColor={Colors.muted}
                value={newCatName}
                onChangeText={setNewCatName}
                style={styles.addInput}
              />
              <View style={styles.addActions}>
                <Button
                  title="Cancel"
                  variant="ghost"
                  onPress={() => setShowAdd(false)}
                  style={{ height: 38 }}
                />
                <Button
                  title="Create"
                  variant="primary"
                  onPress={handleCreate}
                  style={{ height: 38, paddingHorizontal: 16 }}
                />
              </View>
            </Card>
          )}

          <View style={styles.grid}>
            {categories.map((cat) => (
              <Card
                key={cat.id}
                onPress={() =>
                  router.push({
                    pathname: '/(tabs)/people',
                    params: { categoryId: cat.id },
                  })
                }
                style={styles.catCard}
              >
                <View style={styles.catIconWrap}>
                  <Ionicons name="folder-outline" size={20} color={Colors.text} />
                </View>
                <Text style={styles.catName} numberOfLines={1}>
                  {cat.name}
                </Text>
                <Text style={styles.catActivity}>{cat.recent_activity || `${cat.count} people`}</Text>
                <OrangeCorner count={cat.count || 0} width={48} height={38} />
              </Card>
            ))}
          </View>
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
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 12,
  },
  subtitle: {
    fontSize: Typography.sizes.sm,
    color: Colors.secondary,
  },
  addBtnText: {
    fontSize: Typography.sizes.sm,
    color: Colors.accent,
    fontWeight: Typography.weights.semibold,
  },
  addCard: {
    padding: 16,
    marginBottom: 14,
  },
  addTitle: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.semibold,
    color: Colors.text,
    marginBottom: 8,
  },
  addInput: {
    backgroundColor: Colors.background,
    borderRadius: Radius.sm,
    borderWidth: 0.5,
    borderColor: Colors.border,
    paddingHorizontal: 12,
    height: 42,
    fontSize: Typography.sizes.base,
    color: Colors.text,
    marginBottom: 12,
  },
  addActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  catCard: {
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
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.medium,
    color: Colors.text,
  },
  catActivity: {
    fontSize: Typography.sizes.xs,
    color: Colors.secondary,
    marginTop: 2,
  },
});
