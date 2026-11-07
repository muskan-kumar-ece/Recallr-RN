import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  Image,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as Clipboard from 'expo-clipboard';
import type { CardSocial } from '@recallr/core';
import { colors, radius } from '@recallr/tokens';
import { Card, Button, Toggle, PressableScale, BottomSheet } from '../components/ui';
import { useMyCard, useUpdateMyCard, useProfile, useStorageDownloadUrl, useUploadFile } from '@recallr/api';
import { useRecallrAuth } from '../providers/RecallrProvider';
import {
  IconX,
  IconCopy,
  IconRefresh,
  IconPlus,
  IconCamera,
  IconBuilding,
  IconPhone,
  IconMail,
  IconWorld,
  IconMapPin,
  IconCheck,
} from '@tabler/icons-react-native';

export interface MyCardScreenProps {
  onClose: () => void;
  onShowToast: (message: string) => void;
}

export const MyCardScreen: React.FC<MyCardScreenProps> = ({
  onClose,
  onShowToast,
}) => {
  const { data: myCard } = useMyCard();
  const { data: cardPhotoUrl } = useStorageDownloadUrl(myCard?.photo_path || '');
  const { data: cardLogoUrl } = useStorageDownloadUrl(myCard?.logo_path || '');
  const { user } = useRecallrAuth();
  const { data: profile } = useProfile();
  const updateCard = useUpdateMyCard();
  const uploadFile = useUploadFile();

  const [selectedColor, setSelectedColor] = useState<string>(myCard?.accent_color || colors.accent);
  const [subView, setSubView] = useState<'edit' | 'settings'>('edit');

  // Form fields
  const [name, setName] = useState(myCard?.name || profile?.full_name || '');
  const [role, setRole] = useState(myCard?.role || '');
  const [company, setCompany] = useState(myCard?.company || '');
  const [tagline, setTagline] = useState(myCard?.tagline || '');
  const [phone, setPhone] = useState(myCard?.phone || profile?.phone || '');
  const [email, setEmail] = useState(myCard?.email || profile?.email || '');
  const [website, setWebsite] = useState(myCard?.website || '');
  const [address, setAddress] = useState(myCard?.address || '');
  const [about, setAbout] = useState(myCard?.about || '');
  const [socials, setSocials] = useState<CardSocial[]>(myCard?.socials || []);
  const [pendingSlug, setPendingSlug] = useState('');

  // Settings toggles
  const [linkActive, setLinkActive] = useState(myCard?.is_active ?? true);
  const [showPhone, setShowPhone] = useState(myCard?.visibility?.phone ?? true);
  const [showEmail, setShowEmail] = useState(myCard?.visibility?.email ?? true);
  const [showAddress, setShowAddress] = useState(myCard?.visibility?.address ?? false);
  const [showSocial, setShowSocial] = useState(myCard?.visibility?.socials ?? true);

  useEffect(() => {
    if (myCard) {
      if (myCard.name) setName(myCard.name);
      if (myCard.role) setRole(myCard.role);
      if (myCard.company) setCompany(myCard.company);
      if (myCard.tagline) setTagline(myCard.tagline);
      if (myCard.phone) setPhone(myCard.phone);
      if (myCard.email) setEmail(myCard.email);
      if (myCard.website) setWebsite(myCard.website);
      if (myCard.address) setAddress(myCard.address);
      if (myCard.about) setAbout(myCard.about);
      setSocials(myCard.socials || []);
      setShowPhone(myCard.visibility?.phone ?? true);
      setShowEmail(myCard.visibility?.email ?? true);
      setShowAddress(myCard.visibility?.address ?? false);
      setShowSocial(myCard.visibility?.socials ?? true);
      if (myCard.accent_color) setSelectedColor(myCard.accent_color);
      if (myCard.is_active !== undefined) setLinkActive(myCard.is_active);
    }
  }, [myCard]);

  const cardColors = [
    colors.accent,
    '#4F5BD5',
    '#1D9E75',
    '#D4537E',
    '#2B2B2B',
  ];

  const handleSave = async () => {
    const input = subView === 'edit'
      ? {
          name, role, company, tagline, phone, email, website, address, about,
          socials: socials.filter((social) => social.url.trim().length > 0),
          accent_color: selectedColor,
          is_active: linkActive,
          visibility: { phone: showPhone, email: showEmail, address: showAddress, socials: showSocial },
        }
      : {
          is_active: linkActive,
          visibility: { phone: showPhone, email: showEmail, address: showAddress, socials: showSocial },
        };
    try {
      if (myCard?.id) {
        await updateCard.mutateAsync({ id: myCard.id, input });
      } else if (subView === 'edit') {
        await updateCard.mutateAsync({ input: {
          ...input,
          label: myCard?.label || 'Business',
          slug: `card-${Date.now().toString(36)}`,
        } });
      }
      onShowToast(subView === 'edit' ? 'Card saved successfully' : 'Card settings saved');
      if (subView === 'edit') onClose();
      else setSubView('edit');
    } catch (error: unknown) {
      onShowToast(error instanceof Error ? error.message : 'Could not save card');
    }
  };

  const chooseAsset = async (kind: 'photo' | 'logo') => {
    try {
      if (!user?.id) throw new Error('Sign in to upload card images');
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) throw new Error('Photo library permission is required');
      const selected = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.85 });
      const asset = selected.assets?.[0];
      if (selected.canceled || !asset) return;
      const blob = await (await fetch(asset.uri)).blob();
      const path = `cards/${user.id}/${Date.now()}-${kind}.jpg`;
      await uploadFile.mutateAsync({ path, file: blob });
      await updateCard.mutateAsync({ id: myCard?.id, input: { [kind === 'photo' ? 'photo_path' : 'logo_path']: path } });
      onShowToast(kind === 'photo' ? 'Profile photo updated' : 'Company logo updated');
    } catch (error: unknown) {
      onShowToast(error instanceof Error ? error.message : 'Could not upload card image');
    }
  };

  return (
    <View style={styles.container}>
      {/* Top Header */}
      <View style={styles.headerRow}>
        <PressableScale onPress={onClose} haptic="light" style={styles.closeBtn} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <IconX size={20} color={colors.text} strokeWidth={2} />
        </PressableScale>
        <Text style={styles.headerTitle}>
          {subView === 'edit' ? 'Edit card' : 'Card settings'}
        </Text>
        <PressableScale
          onPress={handleSave}
          haptic="light"
          style={styles.saveBtn}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Text style={styles.saveText}>{subView === 'edit' ? 'Save' : 'Done'}</Text>
        </PressableScale>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Toggle between Edit Card and Card Settings */}
        <View style={styles.subViewToggleRow}>
          <PressableScale
            onPress={() => setSubView('edit')}
            haptic="selection"
            style={[styles.subViewTab, subView === 'edit' && styles.subViewTabActive]}
          >
            <Text
              style={[
                styles.subViewTabText,
                subView === 'edit' && styles.subViewTabTextActive,
              ]}
            >
              Card Details
            </Text>
          </PressableScale>
          <PressableScale
            onPress={() => setSubView('settings')}
            haptic="selection"
            style={[styles.subViewTab, subView === 'settings' && styles.subViewTabActive]}
          >
            <Text
              style={[
                styles.subViewTabText,
                subView === 'settings' && styles.subViewTabTextActive,
              ]}
            >
              Link & Visibility
            </Text>
          </PressableScale>
        </View>

        {subView === 'edit' ? (
          <>
            {/* Card Category Selector */}
            <View style={styles.catTabsRow}>
              <View style={[styles.catTab, styles.catTabActive]}>
                <Text style={[styles.catTabText, styles.catTabTextActive]}>{myCard?.label || 'Business'}</Text>
              </View>
            </View>

            {/* LIVE CARD PREVIEW */}
            <View style={styles.liveCardPreview}>
              <View style={styles.cardBrandLogo}>
                <View style={styles.logoBadge}>
                  <Text style={styles.logoBadgeText}>R</Text>
                </View>
                <Text style={styles.cardBrandText}>{company || 'Business card'}</Text>
              </View>

              {/* Signature Orange/Custom Colored Swatch Corner */}
              <View
                style={[
                  styles.cardAccentPatch,
                  { backgroundColor: selectedColor },
                ]}
              >
                <Text style={styles.patchName}>{name}</Text>
                <Text style={styles.patchRole}>{role}</Text>
                <Text style={styles.patchContact}>{phone}</Text>
                <Text style={styles.patchContact}>{email}</Text>
              </View>
            </View>

            {/* Color Swatches */}
            <Text style={styles.fieldSectionTitle}>Color</Text>
            <View style={styles.colorsRow}>
              {cardColors.map((c) => {
                const isSelected = selectedColor === c;
                return (
                  <PressableScale
                    key={c}
                    onPress={() => setSelectedColor(c)}
                    haptic="selection"
                    style={[
                      styles.colorCircle,
                      { backgroundColor: c },
                      isSelected && styles.colorCircleSelected,
                    ]}
                  >
                    {isSelected && (
                      <IconCheck size={14} color="#FFFFFF" strokeWidth={3} />
                    )}
                  </PressableScale>
                );
              })}
            </View>

            {/* Card images */}
            <Text style={styles.fieldSectionTitle}>Photo and logo</Text>
            <View style={styles.photoRow}>
              <PressableScale
                onPress={() => void chooseAsset('photo')}
                haptic="light"
                style={styles.photoUploadBox}
              >
                {cardPhotoUrl ? <Image source={{ uri: cardPhotoUrl }} style={styles.photoPreview} /> : <IconCamera size={20} color={colors.textSecondary} strokeWidth={1.8} />}
                <Text style={styles.uploadText}>{myCard?.photo_path ? 'Change profile photo' : 'Upload profile photo'}</Text>
              </PressableScale>

              <PressableScale
                onPress={() => void chooseAsset('logo')}
                haptic="light"
                style={styles.photoUploadBox}
              >
                {cardLogoUrl ? <Image source={{ uri: cardLogoUrl }} style={styles.photoPreview} /> : <IconBuilding size={20} color={colors.textSecondary} strokeWidth={1.8} />}
                <Text style={styles.uploadText}>{myCard?.logo_path ? 'Change company logo' : 'Upload company logo'}</Text>
              </PressableScale>
            </View>

            {/* About You */}
            <Text style={styles.fieldSectionTitle}>About you</Text>
            <Card style={styles.formCard}>
              <View style={styles.inputRow}>
                <Text style={styles.inputLabel}>Name</Text>
                <TextInput
                  value={name}
                  onChangeText={setName}
                  style={styles.inputValue}
                />
              </View>
              <View style={styles.divider} />
              <View style={styles.inputRow}>
                <Text style={styles.inputLabel}>Role</Text>
                <TextInput
                  value={role}
                  onChangeText={setRole}
                  style={styles.inputValue}
                />
              </View>
              <View style={styles.divider} />
              <View style={styles.inputRow}>
                <Text style={styles.inputLabel}>Company</Text>
                <TextInput
                  value={company}
                  onChangeText={setCompany}
                  style={styles.inputValue}
                />
              </View>
              <View style={styles.divider} />
              <View style={styles.inputRow}>
                <Text style={styles.inputLabel}>Tagline</Text>
                <TextInput
                  value={tagline}
                  onChangeText={setTagline}
                  placeholder="Add a short line"
                  placeholderTextColor={colors.textMuted}
                  style={styles.inputValue}
                />
              </View>
            </Card>

            {/* Contact */}
            <Text style={styles.fieldSectionTitle}>Contact</Text>
            <Card style={styles.formCard}>
              <View style={styles.detailRow}>
                <View style={styles.iconBox}>
                  <IconPhone size={16} color={colors.accent} strokeWidth={2} />
                </View>
                <TextInput
                  value={phone}
                  onChangeText={setPhone}
                  style={styles.detailInput}
                />
              </View>
              <View style={styles.divider} />
              <View style={styles.detailRow}>
                <View style={styles.iconBox}>
                  <IconMail size={16} color={colors.accent} strokeWidth={2} />
                </View>
                <TextInput
                  value={email}
                  onChangeText={setEmail}
                  style={styles.detailInput}
                />
              </View>
              <View style={styles.divider} />
              <View style={styles.detailRow}>
                <View style={styles.iconBox}>
                  <IconWorld size={16} color={colors.accent} strokeWidth={2} />
                </View>
                <TextInput
                  value={website}
                  onChangeText={setWebsite}
                  style={styles.detailInput}
                />
              </View>
              <View style={styles.divider} />
              <View style={styles.detailRow}>
                <View style={styles.iconBox}>
                  <IconMapPin size={16} color={colors.accent} strokeWidth={2} />
                </View>
                <TextInput
                  value={address}
                  onChangeText={setAddress}
                  style={styles.detailInput}
                />
              </View>
            </Card>

            {/* Social Links */}
            <Text style={styles.fieldSectionTitle}>Social links</Text>
            <Card style={styles.formCard}>
              {socials.map((social, index) => (
                <View key={`${social.platform}-${index}`} style={styles.socialEditorRow}>
                  <TextInput value={social.platform} onChangeText={(platform) => setSocials((rows) => rows.map((row, rowIndex) => rowIndex === index ? { ...row, platform } : row))} placeholder="Platform" style={styles.socialInput} />
                  <TextInput value={social.url} onChangeText={(url) => setSocials((rows) => rows.map((row, rowIndex) => rowIndex === index ? { ...row, url } : row))} placeholder="https://..." autoCapitalize="none" keyboardType="url" style={styles.socialInput} />
                </View>
              ))}
              <PressableScale
                onPress={() => setSocials((rows) => [...rows, { platform: '', url: '' }])}
                haptic="light"
                style={styles.addSocialRow}
              >
                <IconPlus size={16} color={colors.accent} strokeWidth={2} />
                <Text style={styles.addSocialText}>Add link</Text>
              </PressableScale>
            </Card>

            <Text style={styles.fieldSectionTitle}>About me</Text>
            <Card style={styles.formCard}>
              <TextInput value={about} onChangeText={setAbout} placeholder="Brief introduction" multiline style={styles.aboutInput} />
            </Card>

            <Button
              title="Save card"
              variant="primary"
              size="md"
              onPress={() => void handleSave()}
              style={styles.bottomSaveBtn}
            />
          </>
        ) : (
          /* CARD SETTINGS & VISIBILITY VIEW */
          <>
            <Card style={styles.settingCard}>
              <View style={styles.settingRow}>
                <Text style={styles.settingLabel}>Card link active</Text>
                <Toggle value={linkActive} onValueChange={setLinkActive} />
              </View>
              <View style={styles.divider} />
              <View style={styles.linkShareBox}>
                <Text style={styles.urlText}>{myCard?.slug ? `https://${process.env.EXPO_PUBLIC_APP_DOMAIN || 'recallr.app'}/c/${myCard.slug}` : 'Save your card to create a share link'}</Text>
                <View style={styles.linkActions}>
                  <PressableScale
                    disabled={!myCard?.slug}
                    onPress={() => {
                      if (myCard?.slug) void Clipboard.setStringAsync(`https://${process.env.EXPO_PUBLIC_APP_DOMAIN || 'recallr.app'}/c/${myCard.slug}`).then(() => onShowToast('Link copied to clipboard'));
                    }}
                    haptic="light"
                    style={styles.linkActionBtn}
                  >
                    <IconCopy size={16} color={colors.textSecondary} strokeWidth={2} />
                  </PressableScale>
                  <PressableScale
                    disabled={!myCard?.slug}
                    onPress={() => setPendingSlug(`card-${Date.now().toString(36)}`)}
                    haptic="warning"
                    style={styles.linkActionBtn}
                  >
                    <IconRefresh size={16} color={colors.textSecondary} strokeWidth={2} />
                  </PressableScale>
                </View>
              </View>
            </Card>

            <Text style={styles.fieldSectionTitle}>Show on card</Text>
            <Card style={styles.settingCard}>
              <View style={styles.settingRow}>
                <Text style={styles.settingLabel}>Phone number</Text>
                <Toggle value={showPhone} onValueChange={setShowPhone} />
              </View>
              <View style={styles.divider} />
              <View style={styles.settingRow}>
                <Text style={styles.settingLabel}>Email</Text>
                <Toggle value={showEmail} onValueChange={setShowEmail} />
              </View>
              <View style={styles.divider} />
              <View style={styles.settingRow}>
                <Text style={styles.settingLabel}>Address</Text>
                <Toggle value={showAddress} onValueChange={setShowAddress} />
              </View>
              <View style={styles.divider} />
              <View style={styles.settingRow}>
                <Text style={styles.settingLabel}>Social links</Text>
                <Toggle value={showSocial} onValueChange={setShowSocial} />
              </View>
            </Card>

          </>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>
      <BottomSheet isOpen={Boolean(pendingSlug)} onClose={() => setPendingSlug('')} title="Regenerate card link">
        <View style={styles.confirmContent}>
          <Text style={styles.settingSub}>The old QR code will stop working.</Text>
          <View style={styles.confirmActions}>
            <Button title="Cancel" variant="outline" onPress={() => setPendingSlug('')} />
            <Button title="Regenerate" variant="primary" onPress={() => {
              if (!myCard?.id) return;
              void updateCard.mutateAsync({ id: myCard.id, input: { slug: pendingSlug } })
                .then(() => onShowToast('Card link updated'))
                .catch((error: unknown) => onShowToast(error instanceof Error ? error.message : 'Could not update card link'))
                .finally(() => setPendingSlug(''));
            }} />
          </View>
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
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingTop: 12,
    paddingBottom: 8,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.surface,
    borderWidth: 0.5,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    fontFamily: 'Inter',
  },
  saveBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  saveText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.accent,
    fontFamily: 'Inter',
  },
  subViewToggleRow: {
    flexDirection: 'row',
    backgroundColor: colors.fill,
    borderRadius: radius.card,
    padding: 3,
    marginBottom: 14,
  },
  subViewTab: {
    flex: 1,
    paddingVertical: 7,
    alignItems: 'center',
    borderRadius: radius.input,
  },
  subViewTabActive: {
    backgroundColor: colors.surface,
  },
  subViewTabText: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.textSecondary,
    fontFamily: 'Inter',
  },
  subViewTabTextActive: {
    color: colors.text,
    fontWeight: '600',
  },
  catTabsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14,
  },
  catTab: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: radius.full,
    backgroundColor: colors.surface,
    borderWidth: 0.5,
    borderColor: colors.border,
  },
  catTabActive: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  catTabText: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.textSecondary,
    fontFamily: 'Inter',
  },
  catTabTextActive: {
    color: '#FFFFFF',
  },
  newCardTab: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: radius.full,
    backgroundColor: colors.surface,
    borderWidth: 0.5,
    borderColor: colors.border,
  },
  newCardTabText: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.accent,
    fontFamily: 'Inter',
  },
  liveCardPreview: {
    height: 180,
    backgroundColor: colors.surface,
    borderRadius: radius.card,
    borderWidth: 0.5,
    borderColor: colors.border,
    position: 'relative',
    overflow: 'hidden',
    padding: 16,
    marginBottom: 16,
    justifyContent: 'space-between',
  },
  cardBrandLogo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  logoBadge: {
    width: 24,
    height: 24,
    borderRadius: 6,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoBadgeText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
    fontFamily: 'Inter',
  },
  cardBrandText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
    fontFamily: 'Inter',
  },
  cardAccentPatch: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    width: 220,
    height: 120,
    borderTopLeftRadius: 56,
    paddingLeft: 24,
    paddingTop: 16,
    paddingRight: 16,
    justifyContent: 'center',
  },
  patchName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    fontFamily: 'Inter',
  },
  patchRole: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.9)',
    fontFamily: 'Inter',
    marginTop: 2,
    marginBottom: 6,
  },
  patchContact: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.85)',
    fontFamily: 'Inter',
  },
  fieldSectionTitle: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.textMuted,
    fontFamily: 'Inter',
    marginBottom: 8,
    marginTop: 8,
  },
  colorsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  colorCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  colorCircleSelected: {
    borderWidth: 2.5,
    borderColor: '#FFFFFF',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },
  photoRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  photoUploadBox: {
    flex: 1,
    height: 68,
    borderRadius: radius.card,
    backgroundColor: colors.surface,
    borderWidth: 0.5,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  photoPreview: { width: 40, height: 40, borderRadius: 20 },
  socialEditorRow: { gap: 8, paddingVertical: 6 },
  socialInput: { minHeight: 38, borderWidth: 1, borderColor: colors.border, borderRadius: radius.input, paddingHorizontal: 10, color: colors.text, fontSize: 13 },
  aboutInput: { minHeight: 90, color: colors.text, textAlignVertical: 'top', padding: 10 },
  confirmContent: { gap: 16, paddingBottom: 12 },
  confirmActions: { flexDirection: 'row', gap: 10 },
  uploadText: {
    fontSize: 12,
    color: colors.textSecondary,
    fontFamily: 'Inter',
  },
  formCard: {
    padding: 0,
    overflow: 'hidden',
    marginBottom: 16,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  inputLabel: {
    fontSize: 13,
    color: colors.textMuted,
    fontFamily: 'Inter',
    width: 80,
  },
  inputValue: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
    fontFamily: 'Inter',
    textAlign: 'right',
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    gap: 12,
  },
  detailInput: {
    flex: 1,
    fontSize: 14,
    color: colors.text,
    fontFamily: 'Inter',
  },
  socialText: {
    fontSize: 14,
    color: colors.text,
    fontFamily: 'Inter',
    flex: 1,
  },
  addSocialRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    gap: 6,
  },
  addSocialText: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.accent,
    fontFamily: 'Inter',
  },
  iconBox: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: colors.accentTint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  divider: {
    height: 0.5,
    backgroundColor: colors.divider,
    marginHorizontal: 14,
  },
  bottomSaveBtn: {
    marginTop: 8,
    marginBottom: 16,
  },
  settingCard: {
    padding: 0,
    overflow: 'hidden',
    marginBottom: 16,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
  },
  settingLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
    fontFamily: 'Inter',
  },
  settingSub: {
    fontSize: 12,
    color: colors.textMuted,
    fontFamily: 'Inter',
    marginTop: 2,
  },
  linkShareBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
  },
  urlText: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.accent,
    fontFamily: 'Inter',
  },
  linkActions: {
    flexDirection: 'row',
    gap: 8,
  },
  linkActionBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: colors.fill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteCardBtn: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  deleteCardText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.danger,
    fontFamily: 'Inter',
  },
});
