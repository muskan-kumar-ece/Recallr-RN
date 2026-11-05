import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Radius, Typography } from '../../src/constants/theme';
import { Card, Button, ListRow } from '../../src/components/ui';
import { useAuth } from '../../src/context/AuthContext';
import { useToast } from '../../src/context/ToastContext';

export default function SettingsScreen() {
  const router = useRouter();
  const { profile, signOut } = useAuth();
  const { showToast } = useToast();

  const handleSignOut = async () => {
    await signOut();
    showToast('Signed out of Recallr');
    router.replace('/(auth)/onboarding');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.phoneFrame}>
          {/* Profile Header Card */}
          <Card style={styles.profileCard}>
            <View style={styles.avatarLarge}>
              <Text style={styles.avatarInitials}>
                {profile?.name
                  ? profile.name
                      .split(' ')
                      .map((n) => n[0])
                      .slice(0, 2)
                      .join('')
                      .toUpperCase()
                  : 'MK'}
              </Text>
            </View>
            <Text style={styles.profileName}>{profile?.name || 'Muskan Kapoor'}</Text>
            <Text style={styles.profileHeadline}>
              {profile?.headline || 'Product Designer & Builder'}
            </Text>
            <Text style={styles.profileCompany}>
              {profile?.company || 'Recallr Network'}
            </Text>

            <TouchableOpacity
              onPress={() => router.push('/my-card')}
              style={styles.cardLinkPill}
            >
              <Ionicons name="qr-code-outline" size={14} color={Colors.accent} />
              <Text style={styles.cardLinkText}>recallr.app/c/muskan</Text>
            </TouchableOpacity>
          </Card>

          {/* Settings Section: My Digital Card */}
          <Text style={styles.sectionHeader}>DIGITAL CARD</Text>
          <Card style={styles.sectionCard}>
            <ListRow
              title="Edit My Card"
              subtitle="Update contact info & public profile"
              avatarText="🪪"
              showChevron
              onPress={() => router.push('/my-card')}
            />
            <ListRow
              title="QR Code & Sharing"
              subtitle="Quick in-person exchange"
              avatarText="⚡"
              showDivider={false}
              showChevron
              onPress={() => router.push('/my-card')}
            />
          </Card>

          {/* Settings Section: Account */}
          <Text style={styles.sectionHeader}>ACCOUNT</Text>
          <Card style={styles.sectionCard}>
            <ListRow
              title="Phone Number"
              subtitle={profile?.phone || '+91 98765 43210'}
              avatarText="📱"
              showDivider
            />
            <ListRow
              title="Email"
              subtitle={profile?.email || 'muskan@recallr.app'}
              avatarText="✉️"
              showDivider
            />
            <ListRow
              title="Categories Management"
              subtitle="Configure starter and custom groups"
              avatarText="📁"
              showDivider={false}
              showChevron
              onPress={() => router.push('/categories')}
            />
          </Card>

          {/* Settings Section: App & Preferences */}
          <Text style={styles.sectionHeader}>PREFERENCES</Text>
          <Card style={styles.sectionCard}>
            <ListRow
              title="Notifications & Alerts"
              subtitle="Follow-up morning digests"
              avatarText="🔔"
              showDivider
              showChevron
              onPress={() => showToast('Morning digests enabled at 9:00 AM')}
            />
            <ListRow
              title="Offline Sync & Storage"
              subtitle="Supabase local cache active"
              avatarText="☁️"
              showDivider={false}
            />
          </Card>

          {/* Sign Out Button */}
          <Button
            title="Sign Out"
            variant="secondary"
            leftIcon="log-out-outline"
            onPress={handleSignOut}
            style={styles.signOutBtn}
            textStyle={{ color: Colors.danger }}
          />

          <Text style={styles.versionText}>Recallr v1.0.0 (Phase 1 Build)</Text>
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
  profileCard: {
    padding: 20,
    alignItems: 'center',
    marginVertical: 12,
  },
  avatarLarge: {
    width: 64,
    height: 64,
    borderRadius: Radius.full,
    backgroundColor: Colors.accentLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  avatarInitials: {
    color: Colors.accent,
    fontSize: 22,
    fontWeight: Typography.weights.bold,
  },
  profileName: {
    fontSize: Typography.sizes.xl,
    fontWeight: Typography.weights.semibold,
    color: Colors.text,
  },
  profileHeadline: {
    fontSize: Typography.sizes.sm,
    color: Colors.secondary,
    marginTop: 2,
  },
  profileCompany: {
    fontSize: Typography.sizes.xs,
    color: Colors.muted,
    marginTop: 2,
  },
  cardLinkPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.background,
    borderWidth: 0.5,
    borderColor: Colors.border,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: Radius.pill,
    marginTop: 14,
  },
  cardLinkText: {
    fontSize: Typography.sizes.xs,
    color: Colors.accent,
    fontWeight: Typography.weights.medium,
  },
  sectionHeader: {
    fontSize: Typography.sizes.xs,
    fontWeight: Typography.weights.semibold,
    color: Colors.muted,
    letterSpacing: 0.5,
    marginTop: 18,
    marginBottom: 8,
    marginLeft: 4,
  },
  sectionCard: {
    overflow: 'hidden',
  },
  signOutBtn: {
    marginTop: 24,
  },
  versionText: {
    textAlign: 'center',
    fontSize: Typography.sizes.xs,
    color: Colors.muted,
    marginTop: 18,
  },
});
