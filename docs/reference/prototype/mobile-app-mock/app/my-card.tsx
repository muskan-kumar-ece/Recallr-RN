import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Radius, Typography } from '../src/constants/theme';
import { Card, OrangeCorner, Button } from '../src/components/ui';
import { INITIAL_CARD } from '../src/data/mockData';
import { useToast } from '../src/context/ToastContext';

export default function MyCardScreen() {
  const router = useRouter();
  const { showToast } = useToast();
  const card = INITIAL_CARD;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.phoneFrame}>
          {/* Card Presentation Preview */}
          <Card style={styles.businessCard}>
            <View style={styles.cardHeader}>
              <View style={styles.brandIcon}>
                <Text style={styles.brandLetter}>R</Text>
              </View>
              <Text style={styles.slugBadge}>recallr.app/c/{card.slug}</Text>
            </View>

            <View style={styles.cardBody}>
              <Text style={styles.personName}>{card.fields.name}</Text>
              <Text style={styles.personTitle}>{card.fields.title}</Text>
              <Text style={styles.personCompany}>{card.fields.company}</Text>

              <View style={styles.contactDetails}>
                <Text style={styles.detailItem}>{card.fields.phone}</Text>
                <Text style={styles.detailItem}>{card.fields.email}</Text>
                <Text style={styles.detailItem}>{card.fields.website}</Text>
              </View>
            </View>

            {/* Signature Orange Corner with QR Code Icon */}
            <OrangeCorner icon="qr-code-outline" width={78} height={58} />
          </Card>

          {/* QR Code Presentation Box */}
          <Card style={styles.qrCard}>
            <View style={styles.qrPlaceholder}>
              <Ionicons name="qr-code" size={140} color={Colors.text} />
            </View>
            <Text style={styles.scanInstruction}>
              Scan with phone camera to save contact
            </Text>
          </Card>

          {/* Action Buttons */}
          <Button
            title="Share Public Link"
            variant="primary"
            leftIcon="share-social-outline"
            onPress={() => showToast('Share link copied to clipboard')}
            style={{ marginTop: 16 }}
          />

          <Button
            title="Edit Details"
            variant="secondary"
            leftIcon="create-outline"
            onPress={() => showToast('Edit Card mode opened')}
            style={{ marginTop: 10 }}
          />
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
    paddingBottom: 40,
    alignItems: 'center',
  },
  phoneFrame: {
    width: '100%',
    maxWidth: 412,
  },
  businessCard: {
    padding: 20,
    paddingBottom: 28,
    marginTop: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  brandIcon: {
    width: 32,
    height: 32,
    borderRadius: Radius.sm,
    backgroundColor: Colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandLetter: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  slugBadge: {
    fontSize: Typography.sizes.xs,
    color: Colors.muted,
  },
  cardBody: {
    paddingRight: 60,
  },
  personName: {
    fontSize: Typography.sizes.xl,
    fontWeight: Typography.weights.bold,
    color: Colors.text,
  },
  personTitle: {
    fontSize: Typography.sizes.sm,
    color: Colors.secondary,
    marginTop: 2,
  },
  personCompany: {
    fontSize: Typography.sizes.xs,
    color: Colors.muted,
    marginTop: 2,
  },
  contactDetails: {
    marginTop: 18,
    gap: 4,
  },
  detailItem: {
    fontSize: Typography.sizes.xs,
    color: Colors.secondary,
  },
  qrCard: {
    padding: 24,
    alignItems: 'center',
    marginTop: 14,
  },
  qrPlaceholder: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: Radius.card,
    borderWidth: 0.5,
    borderColor: Colors.border,
  },
  scanInstruction: {
    marginTop: 12,
    fontSize: Typography.sizes.sm,
    color: Colors.secondary,
    textAlign: 'center',
  },
});
