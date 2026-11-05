import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { BottomSheet } from './ui/BottomSheet';
import { Colors, Radius, Typography } from '../constants/theme';

interface QuickAddModalProps {
  visible: boolean;
  onClose: () => void;
}

export const QuickAddModal: React.FC<QuickAddModalProps> = ({ visible, onClose }) => {
  const router = useRouter();

  const handleAction = (route: string) => {
    onClose();
    // Navigate with a small delay to allow sheet to close smoothly
    setTimeout(() => {
      router.push(route as any);
    }, 150);
  };

  return (
    <BottomSheet visible={visible} onClose={onClose} title="Quick Add">
      <View style={styles.grid}>
        <TouchableOpacity
          activeOpacity={0.8}
          style={styles.actionCard}
          onPress={() => handleAction('/scan-card')}
        >
          <View style={[styles.iconWrapper, { backgroundColor: Colors.accentLight }]}>
            <Ionicons name="scan-outline" size={24} color={Colors.accent} />
          </View>
          <Text style={styles.actionTitle}>Scan Card</Text>
          <Text style={styles.actionSubtitle}>AI vision extract</Text>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.8}
          style={styles.actionCard}
          onPress={() => handleAction('/contact/new')}
        >
          <View style={[styles.iconWrapper, { backgroundColor: '#EFF6FF' }]}>
            <Ionicons name="person-add-outline" size={24} color="#3B82F6" />
          </View>
          <Text style={styles.actionTitle}>Add Person</Text>
          <Text style={styles.actionSubtitle}>Manual details</Text>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.8}
          style={styles.actionCard}
          onPress={() => handleAction('/notes/new')}
        >
          <View style={[styles.iconWrapper, { backgroundColor: '#FDF2F8' }]}>
            <Ionicons name="document-text-outline" size={24} color="#EC4899" />
          </View>
          <Text style={styles.actionTitle}>New Note</Text>
          <Text style={styles.actionSubtitle}>With reminder</Text>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.8}
          style={styles.actionCard}
          onPress={() => handleAction('/my-card')}
        >
          <View style={[styles.iconWrapper, { backgroundColor: '#F0FDF4' }]}>
            <Ionicons name="qr-code-outline" size={24} color="#10B981" />
          </View>
          <Text style={styles.actionTitle}>My Card</Text>
          <Text style={styles.actionSubtitle}>Digital QR share</Text>
        </TouchableOpacity>
      </View>
    </BottomSheet>
  );
};

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    paddingBottom: 16,
  },
  actionCard: {
    width: '48%',
    backgroundColor: Colors.background,
    borderRadius: Radius.card,
    padding: 16,
    borderWidth: 0.5,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrapper: {
    width: 48,
    height: 48,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  actionTitle: {
    fontSize: Typography.sizes.base,
    fontWeight: Typography.weights.semibold,
    color: Colors.text,
    textAlign: 'center',
  },
  actionSubtitle: {
    fontSize: Typography.sizes.xs,
    color: Colors.secondary,
    marginTop: 2,
    textAlign: 'center',
  },
});
