import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  Linking,
} from 'react-native';
import { categories, colors, radius } from '@recallr/tokens';
import { Card, OrangeCorner, Avatar, Toggle, PressableScale, BottomSheet, Button } from '../components/ui';
import { useClearAIConversationHistory, useEntitlements, useMyCard, useProfile, useUpdateProfile, useUpdateUserSettings, useUserSettings } from '@recallr/api';
import { useRecallrAuth } from '../providers/RecallrProvider';
import {
  IconArrowLeft,
  IconQrcode,
  IconUser,
  IconId,
  IconCrown,
  IconBell,
  IconCloudUpload,
  IconFileExport,
  IconFingerprint,
  IconSparkles,
  IconTrash,
  IconHelpCircle,
  IconMessageCircle,
  IconShield,
  IconLogout,
  IconChevronRight,
} from '@tabler/icons-react-native';

export interface SettingsScreenProps {
  onBack: () => void;
  onOpenMyCard: () => void;
  onOpenSubscription: () => void;
  onOpenNotifications: () => void;
  onOpenImportExport: () => void;
  onShowToast: (message: string) => void;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({
  onBack,
  onOpenMyCard,
  onOpenSubscription,
  onOpenNotifications,
  onOpenImportExport,
  onShowToast,
}) => {
  const { user, signOut, deleteAccount } = useRecallrAuth();
  const { data: profile } = useProfile(user?.id);
  const { data: myCard } = useMyCard();
  const { data: entitlements } = useEntitlements();
  const { data: settings } = useUserSettings();
  const { mutateAsync: updateSettings } = useUpdateUserSettings();
  const { mutateAsync: updateProfile, isPending: isSavingProfile } = useUpdateProfile();
  const { mutateAsync: clearChatHistory, isPending: isClearingHistory } = useClearAIConversationHistory();
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deleteText, setDeleteText] = useState('');
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const displayName = profile?.full_name || user?.user_metadata?.full_name || user?.displayName || 'My Account';
  const phoneOrEmail = profile?.phone || user?.phone || profile?.email || user?.email || 'No contact details';

  const handleClearHistory = async () => {
    try {
      await clearChatHistory();
      onShowToast('Chat history cleared');
    } catch (error: unknown) {
      onShowToast(error instanceof Error ? error.message : 'Could not clear chat history');
    }
  };

  const saveProfile = async () => {
    if (!user?.id) return;
    try {
      await updateProfile({ id: user.id, input: { full_name: editName.trim(), phone: editPhone.trim() } });
      setIsEditProfileOpen(false);
      onShowToast('Profile updated');
    } catch (error: unknown) {
      onShowToast(error instanceof Error ? error.message : 'Could not update profile');
    }
  };

  const openSupport = async (url: string) => {
    try {
      if (!url) throw new Error('Support links are not configured for this app build');
      await Linking.openURL(url);
    } catch (error: unknown) {
      onShowToast(error instanceof Error ? error.message : 'Could not open link');
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteText !== 'DELETE') return;
    try {
      await deleteAccount();
      setIsDeleteOpen(false);
      setDeleteText('');
    } catch (error: unknown) {
      onShowToast(error instanceof Error ? error.message : 'Could not delete account');
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.headerRow}>
          <PressableScale
            onPress={onBack}
            haptic="light"
            style={styles.backBtn}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <IconArrowLeft size={20} color={colors.text} strokeWidth={2} />
          </PressableScale>
          <Text style={styles.headerTitle}>Settings</Text>
        </View>

        {/* Profile Card */}
        <Card style={styles.profileCard}>
          <OrangeCorner
            size="md"
            onPress={onOpenMyCard}
            style={styles.cornerCardBtn}
          >
            <View style={styles.myCardCornerContent}>
              <IconQrcode size={16} color="#FFFFFF" strokeWidth={2} />
              <Text style={styles.myCardCornerText}>My card</Text>
            </View>
          </OrangeCorner>

          <View style={styles.profileRow}>
            <Avatar name={displayName} size="lg" />
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>{displayName}</Text>
              <Text style={styles.profilePhone}>{phoneOrEmail}</Text>
            </View>
          </View>
        </Card>

        {/* Section: Account */}
        <Text style={styles.sectionHeader}>Account</Text>
        <Card style={styles.groupCard}>
          <PressableScale
            onPress={() => {
              setEditName(profile?.full_name || user?.displayName || '');
              setEditPhone(profile?.phone || user?.phone || '');
              setIsEditProfileOpen(true);
            }}
            haptic="light"
            style={styles.rowItem}
          >
            <View style={styles.iconBox}>
              <IconUser size={18} color={colors.accent} strokeWidth={2} />
            </View>
            <Text style={styles.rowLabel}>Edit profile</Text>
            <IconChevronRight size={18} color={colors.textMuted} strokeWidth={2} />
          </PressableScale>

          <View style={styles.divider} />

          <PressableScale
            onPress={onOpenMyCard}
            haptic="light"
            style={styles.rowItem}
          >
            <View style={styles.iconBox}>
              <IconId size={18} color={colors.accent} strokeWidth={2} />
            </View>
            <Text style={styles.rowLabel}>My cards</Text>
            <View style={styles.rightSubRow}>
              <Text style={styles.countText}>{myCard ? '1' : '0'}</Text>
              <IconChevronRight size={18} color={colors.textMuted} strokeWidth={2} />
            </View>
          </PressableScale>

          <View style={styles.divider} />

          <PressableScale
            onPress={onOpenSubscription}
            haptic="light"
            style={styles.rowItem}
          >
            <View style={styles.iconBox}>
              <IconCrown size={18} color={colors.accent} strokeWidth={2} />
            </View>
            <Text style={styles.rowLabel}>Subscription & Usage</Text>
            <View style={styles.rightSubRow}>
              <Text style={styles.badgeText}>{entitlements?.plan === 'pro' ? 'Pro' : 'Free'}</Text>
              <IconChevronRight size={18} color={colors.textMuted} strokeWidth={2} />
            </View>
          </PressableScale>
        </Card>

        <Card style={[styles.groupCard, styles.themeCard]}>
          <Text style={styles.themeTitle}>Color theme</Text>
          <View style={styles.themeSwatches}>
            {Object.entries(categories).map(([theme, color]) => {
              const selected = (settings?.accent_theme ?? 'orange') === theme;
              return (
                <PressableScale
                  key={theme}
                  accessibilityRole="radio"
                  accessibilityLabel={`${theme} theme`}
                  accessibilityState={{ selected }}
                  onPress={() => {
                    void updateSettings({ accent_theme: theme as 'orange' | 'indigo' | 'teal' | 'pink' | 'slate' }).catch((error: unknown) => {
                      onShowToast(error instanceof Error ? error.message : 'Could not save color theme');
                    });
                  }}
                  haptic="selection"
                  style={[styles.themeSwatch, { backgroundColor: color }, selected && styles.themeSwatchSelected]}
                ><View /></PressableScale>
              );
            })}
          </View>
        </Card>

        {/* Section: Preferences */}
        <Text style={styles.sectionHeader}>Preferences</Text>
        <Card style={styles.groupCard}>
          <PressableScale
            onPress={onOpenNotifications}
            haptic="light"
            style={styles.rowItem}
          >
            <View style={styles.iconBox}>
              <IconBell size={18} color={colors.accent} strokeWidth={2} />
            </View>
            <Text style={styles.rowLabel}>Notifications and follow-ups</Text>
            <IconChevronRight size={18} color={colors.textMuted} strokeWidth={2} />
          </PressableScale>
        </Card>

        {/* Section: Data and security */}
        <Text style={styles.sectionHeader}>Data and security</Text>
        <Card style={styles.groupCard}>
          <View style={styles.rowItem}>
            <View style={styles.iconBox}>
              <IconCloudUpload size={18} color={colors.accent} strokeWidth={2} />
            </View>
            <Text style={styles.rowLabel}>Backup and sync</Text>
            <Text style={styles.countText}>On</Text>
          </View>

          <View style={styles.divider} />

          <PressableScale
            onPress={onOpenImportExport}
            haptic="light"
            style={styles.rowItem}
          >
            <View style={styles.iconBox}>
              <IconFileExport size={18} color={colors.accent} strokeWidth={2} />
            </View>
            <Text style={styles.rowLabel}>Import and export</Text>
            <IconChevronRight size={18} color={colors.textMuted} strokeWidth={2} />
          </PressableScale>

          <View style={styles.divider} />

          <View style={styles.rowItem}>
            <View style={styles.iconBox}>
              <IconFingerprint size={18} color={colors.accent} strokeWidth={2} />
            </View>
            <Text style={styles.rowLabel}>App lock</Text>
            <Toggle
              value={false}
              disabled
            />
          </View>
        </Card>

        {/* Section: AI */}
        <Text style={styles.sectionHeader}>AI</Text>
        <Card style={styles.groupCard}>
          <View style={styles.rowItem}>
            <View style={styles.iconBox}>
              <IconSparkles size={18} color={colors.accent} strokeWidth={2} />
            </View>
            <View style={styles.rowCol}>
              <Text style={styles.rowLabel}>Use my notes in answers</Text>
              <Text style={styles.rowSub}>Lets Recallr read your notes</Text>
            </View>
            <Toggle
              value={settings?.ai_use_notes ?? true}
              onValueChange={(value) => {
                void updateSettings({ ai_use_notes: value }).catch((error: unknown) => {
                  onShowToast(error instanceof Error ? error.message : 'Could not update AI privacy setting');
                });
              }}
            />
          </View>

          <View style={styles.divider} />

          <PressableScale
            onPress={() => void handleClearHistory()}
            disabled={isClearingHistory}
            haptic="warning"
            style={styles.rowItem}
          >
            <View style={styles.iconBox}>
              <IconTrash size={18} color={colors.accent} strokeWidth={2} />
            </View>
            <Text style={styles.rowLabel}>Clear chat history</Text>
            <IconChevronRight size={18} color={colors.textMuted} strokeWidth={2} />
          </PressableScale>
        </Card>

        {/* Section: Support */}
        <Text style={styles.sectionHeader}>Support</Text>
        <Card style={styles.groupCard}>
          <PressableScale
            onPress={() => void openSupport(process.env.EXPO_PUBLIC_HELP_URL || '')}
            haptic="light"
            style={styles.rowItem}
          >
            <View style={styles.iconBox}>
              <IconHelpCircle size={18} color={colors.accent} strokeWidth={2} />
            </View>
            <Text style={styles.rowLabel}>Help center</Text>
            <IconChevronRight size={18} color={colors.textMuted} strokeWidth={2} />
          </PressableScale>

          <View style={styles.divider} />

          <PressableScale
            onPress={() => void openSupport(process.env.EXPO_PUBLIC_FEEDBACK_URL || '')}
            haptic="light"
            style={styles.rowItem}
          >
            <View style={styles.iconBox}>
              <IconMessageCircle size={18} color={colors.accent} strokeWidth={2} />
            </View>
            <Text style={styles.rowLabel}>Send feedback</Text>
            <IconChevronRight size={18} color={colors.textMuted} strokeWidth={2} />
          </PressableScale>

          <View style={styles.divider} />

          <PressableScale
            onPress={() => void openSupport(process.env.EXPO_PUBLIC_PRIVACY_URL || '')}
            haptic="light"
            style={styles.rowItem}
          >
            <View style={styles.iconBox}>
              <IconShield size={18} color={colors.accent} strokeWidth={2} />
            </View>
            <Text style={styles.rowLabel}>Privacy policy</Text>
            <IconChevronRight size={18} color={colors.textMuted} strokeWidth={2} />
          </PressableScale>
        </Card>

        {/* Logout & Delete Card */}
        <Card style={styles.logoutCard}>
          <PressableScale
            onPress={() => {
              void signOut().then(onBack).catch((error: unknown) => onShowToast(error instanceof Error ? error.message : 'Could not sign out'));
            }}
            haptic="light"
            style={styles.logoutRow}
          >
            <IconLogout size={18} color={colors.text} strokeWidth={2} />
            <Text style={styles.logoutText}>Log out</Text>
          </PressableScale>

          <View style={styles.divider} />

          <PressableScale
            onPress={() => { setDeleteText(''); setIsDeleteOpen(true); }}
            haptic="warning"
            style={styles.logoutRow}
          >
            <IconTrash size={18} color={colors.danger} strokeWidth={2} />
            <Text style={styles.deleteText}>Delete account</Text>
          </PressableScale>
        </Card>

        {/* App Version */}
        <Text style={styles.versionText}>Recallr 1.0.0</Text>

        <View style={{ height: 100 }} />
      </ScrollView>
      <BottomSheet isOpen={isDeleteOpen} onClose={() => setIsDeleteOpen(false)} title="Delete account">
        <View style={styles.deleteContent}>
          <Text style={styles.deleteWarning}>This permanently deletes your contacts, notes, files, and cards. Cancel any store subscription separately.</Text>
          <TextInput
            value={deleteText}
            onChangeText={setDeleteText}
            placeholder="Type DELETE to confirm"
            autoCapitalize="characters"
            style={styles.deleteInput}
          />
          <View style={styles.deleteButtons}>
            <Button title="Cancel" variant="outline" onPress={() => setIsDeleteOpen(false)} />
            <Button title="Delete account" variant="danger" disabled={deleteText !== 'DELETE'} onPress={() => void handleDeleteAccount()} />
          </View>
        </View>
      </BottomSheet>
      <BottomSheet isOpen={isEditProfileOpen} onClose={() => setIsEditProfileOpen(false)} title="Edit profile">
        <View style={styles.editProfileContent}>
          <TextInput value={editName} onChangeText={setEditName} placeholder="Name" style={styles.deleteInput} />
          <TextInput value={editPhone} onChangeText={setEditPhone} placeholder="Phone" keyboardType="phone-pad" style={styles.deleteInput} />
          <Button title="Save profile" onPress={() => void saveProfile()} loading={isSavingProfile} disabled={!editName.trim() || isSavingProfile} />
        </View>
      </BottomSheet>
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
    gap: 12,
    marginBottom: 16,
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
  profileCard: {
    padding: 16,
    marginBottom: 16,
    position: 'relative',
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    fontFamily: 'Inter',
  },
  profilePhone: {
    fontSize: 13,
    color: colors.textSecondary,
    fontFamily: 'Inter',
    marginTop: 2,
  },
  cornerCardBtn: {
    width: 72,
    height: 48,
    borderTopLeftRadius: 28,
  },
  myCardCornerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingRight: 8,
    paddingBottom: 6,
  },
  myCardCornerText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#FFFFFF',
    fontFamily: 'Inter',
  },
  sectionHeader: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.textMuted,
    fontFamily: 'Inter',
    marginBottom: 8,
    marginTop: 8,
    paddingHorizontal: 2,
  },
  groupCard: {
    padding: 0,
    overflow: 'hidden',
    marginBottom: 14,
  },
  themeCard: {
    padding: 14,
  },
  themeTitle: {
    color: colors.text,
    fontFamily: 'Inter',
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 12,
  },
  themeSwatches: {
    flexDirection: 'row',
    gap: 14,
  },
  themeSwatch: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: colors.surface,
  },
  themeSwatchSelected: {
    borderColor: colors.text,
    transform: [{ scale: 1.08 }],
  },
  rowItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    gap: 12,
  },
  rowCol: {
    flex: 1,
  },
  rowLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
    fontFamily: 'Inter',
    flex: 1,
  },
  rowSub: {
    fontSize: 11,
    color: colors.textMuted,
    fontFamily: 'Inter',
    marginTop: 1,
  },
  iconBox: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: colors.accentTint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rightSubRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  countText: {
    fontSize: 13,
    color: colors.textSecondary,
    fontFamily: 'Inter',
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.accent,
    fontFamily: 'Inter',
  },
  logoutCard: {
    padding: 0,
    overflow: 'hidden',
    marginBottom: 16,
    marginTop: 8,
  },
  logoutRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 14,
    gap: 8,
  },
  logoutText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
    fontFamily: 'Inter',
  },
  deleteText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.danger,
    fontFamily: 'Inter',
  },
  divider: {
    height: 0.5,
    backgroundColor: colors.divider,
    marginHorizontal: 14,
  },
  versionText: {
    fontSize: 12,
    color: colors.textMuted,
    fontFamily: 'Inter',
    textAlign: 'center',
    marginTop: 6,
  },
  deleteContent: {
    gap: 12,
    paddingBottom: 12,
  },
  deleteWarning: {
    fontSize: 13,
    lineHeight: 19,
    color: colors.textSecondary,
  },
  deleteInput: {
    height: 44,
    backgroundColor: colors.inputCardFill,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radius.input,
    paddingHorizontal: 12,
    color: colors.text,
  },
  deleteButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  editProfileContent: { gap: 12, paddingBottom: 12 },
});
