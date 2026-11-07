import React, { useState } from 'react';
import { ActivityIndicator, Image, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { colors, radius } from '@recallr/tokens';
import { useCategories, useContacts, useCreateContact, useCreateNote, usePublicCard, useScanCard, useUploadFile, useUserSettings } from '@recallr/api';
import { isDuplicateMatch } from '@recallr/core';
import { useRecallrAuth } from '../providers/RecallrProvider';
import { Button, Card, PressableScale } from '../components/ui';
import { IconArrowLeft, IconCamera, IconPhoto, IconRefresh } from '@tabler/icons-react-native';

type ScanFields = Record<'name' | 'role' | 'company' | 'phone' | 'email' | 'address', string>;
const emptyFields: ScanFields = { name: '', role: '', company: '', phone: '', email: '', address: '' };

export interface ScanCardScreenProps {
  onBack: () => void;
  onSaved: (contactId: string) => void;
  onShowToast: (message: string) => void;
}

export const ScanCardScreen: React.FC<ScanCardScreenProps> = ({ onBack, onSaved, onShowToast }) => {
  const { user } = useRecallrAuth();
  const scanCard = useScanCard();
  const uploadFile = useUploadFile();
  const createContact = useCreateContact();
  const createNote = useCreateNote();
  const { data: contacts = [] } = useContacts();
  const { data: categories = [] } = useCategories();
  const { data: settings } = useUserSettings();
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [storagePath, setStoragePath] = useState<string | null>(null);
  const [fields, setFields] = useState<ScanFields>(emptyFields);
  const [isReading, setIsReading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [confidence, setConfidence] = useState<Record<string, number>>({});
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([]);
  const [followUp, setFollowUp] = useState(false);
  const [followUpDays, setFollowUpDays] = useState(3);
  const [qrMode, setQrMode] = useState(false);
  const [qrSlug, setQrSlug] = useState('');
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const { data: publicCard } = usePublicCard(qrSlug);
  const hasReview = Boolean(storagePath || qrSlug || publicCard);

  React.useEffect(() => {
    if (publicCard) {
      setFields({
        name: publicCard.name || '',
        role: publicCard.role || '',
        company: publicCard.company || '',
        phone: publicCard.visibility.phone ? publicCard.phone || '' : '',
        email: publicCard.visibility.email ? publicCard.email || '' : '',
        address: publicCard.visibility.address ? publicCard.address || '' : '',
      });
    }
  }, [publicCard]);

  const duplicate = contacts.find((contact) => isDuplicateMatch(fields, contact));

  const chooseImage = async (source: 'camera' | 'library') => {
    try {
      const result = source === 'camera'
        ? await ImagePicker.launchCameraAsync({ mediaTypes: ['images'], quality: 0.9 })
        : await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.9 });
      if (result.canceled || !result.assets[0] || !user?.id) return;

      setIsReading(true);
      setImageUri(result.assets[0].uri);
      const compressed = await ImageManipulator.manipulateAsync(
        result.assets[0].uri,
        result.assets[0].width > 1600 ? [{ resize: { width: 1600 } }] : [],
        { compress: 0.82, format: ImageManipulator.SaveFormat.JPEG }
      );
      const path = `users/${user.id}/cards/${Date.now()}-${Math.random().toString(36).slice(2, 10)}.jpg`;
      const imageBlob = await (await fetch(compressed.uri)).blob();
      await uploadFile.mutateAsync({ path, file: imageBlob });
      setStoragePath(path);
      const resultFields = await scanCard.mutateAsync(path);
      setFields({
        name: resultFields.name || '',
        role: resultFields.role || '',
        company: resultFields.company || '',
        phone: resultFields.phone || '',
        email: resultFields.email || '',
        address: resultFields.address || '',
      });
      setConfidence(resultFields.confidence);
      setSelectedCategoryIds([]);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Couldn't read this card";
      onShowToast(message || "Couldn't read this card");
      setImageUri(null);
      setStoragePath(null);
    } finally {
      setIsReading(false);
    }
  };

  const saveContact = async () => {
    if (!fields.name.trim() || (!storagePath && !publicCard)) {
      onShowToast('Add a name before saving this contact');
      return;
    }
    setIsSaving(true);
    try {
      const created = await createContact.mutateAsync({
        input: {
          ...fields,
          name: fields.name.trim(),
          tags: [],
          links: [],
          category_ids: selectedCategoryIds,
          ...(storagePath ? { card_image_path: storagePath } : {}),
          source: publicCard ? 'qr' : 'scan',
        },
      });
      if (followUp) {
        const due = new Date();
        due.setDate(due.getDate() + followUpDays);
        const [hour, minute] = (settings?.default_reminder_time || '09:00').split(':').map(Number);
        due.setHours(hour || 9, minute || 0, 0, 0);
        await createNote.mutateAsync({ input: {
          contact_id: created.id,
          title: `Follow up with ${created.name}`,
          remind_at: due.toISOString(),
          repeat: 'none',
        } });
      }
      onSaved(created.id);
    } catch (error: unknown) {
      onShowToast(error instanceof Error ? error.message : 'Could not save the contact');
    } finally {
      setIsSaving(false);
    }
  };

  const changeField = (key: keyof ScanFields, value: string) => setFields((current) => ({ ...current, [key]: value }));

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <PressableScale onPress={onBack} style={styles.backButton} haptic="light">
          <IconArrowLeft size={20} color={colors.text} />
        </PressableScale>
        <Text style={styles.headerTitle}>{hasReview ? 'Review card' : qrMode ? 'Scan Recallr QR' : 'Scan a card'}</Text>
      </View>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        {!hasReview ? (
          <Card style={styles.introCard}>
            {qrMode ? (
              <>
                <Text style={styles.description}>Point the camera at a Recallr card QR code.</Text>
                {!cameraPermission?.granted ? (
                  <Button title="Allow camera" onPress={() => void requestCameraPermission()} />
                ) : (
                  <CameraView
                    style={styles.qrCamera}
                    facing="back"
                    barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
                    onBarcodeScanned={({ data }) => {
                      try {
                        const url = new URL(data);
                        const configuredHost = (process.env.EXPO_PUBLIC_APP_DOMAIN || '').replace(/^https?:\/\//, '').replace(/\/$/, '');
                        const match = url.protocol === 'https:' && url.hostname === configuredHost
                          ? /^\/c\/([A-Za-z0-9-]+)\/?$/.exec(url.pathname)
                          : null;
                        if (!match?.[1]) throw new Error('That is not a Recallr card');
                        setQrSlug(match[1]);
                        setQrMode(false);
                      } catch (error: unknown) {
                        onShowToast(error instanceof Error ? error.message : 'That is not a Recallr card');
                      }
                    }}
                  />
                )}
                <Button title="Back" variant="text" onPress={() => setQrMode(false)} />
              </>
            ) : <>
            <IconCamera size={28} color={colors.accent} />
            <Text style={styles.title}>Add a business card</Text>
            <Text style={styles.description}>Take a photo or choose a card image. Recallr will read its details for you to review.</Text>
            {isReading ? (
              <View style={styles.loadingRow}><ActivityIndicator color={colors.accent} /><Text style={styles.loadingText}>Reading card…</Text></View>
            ) : (
              <View style={styles.actions}>
                <Button title="Take photo" leftIcon={<IconCamera size={17} color="#FFFFFF" />} onPress={() => void chooseImage('camera')} />
                <Button title="Choose image" variant="outline" leftIcon={<IconPhoto size={17} color={colors.accent} />} onPress={() => void chooseImage('library')} />
                <Button title="Scan Recallr QR" variant="text" onPress={() => setQrMode(true)} />
              </View>
            )}
            <Text style={styles.caption}>The image is stored privately in your Recallr account.</Text>
            </>}
          </Card>
        ) : (
          <>
            {qrSlug && publicCard === undefined && <View style={styles.loadingRow}><ActivityIndicator color={colors.accent} /><Text style={styles.loadingText}>Loading Recallr card…</Text></View>}
            {qrSlug && publicCard === null && <View style={styles.duplicateBanner}><Text style={styles.duplicateText}>This Recallr card is unavailable.</Text><Button title="Scan another QR" variant="text" onPress={() => { setQrSlug(''); setQrMode(true); }} /></View>}
            {imageUri && <Image source={{ uri: imageUri ?? '' }} style={styles.preview} resizeMode="contain" />}
            <Card style={styles.formCard}>
              <Text style={styles.formTitle}>Review details</Text>
              {duplicate && (
                <View style={styles.duplicateBanner}>
                  <Text style={styles.duplicateText}>{duplicate.name} may already exist. Saving will create a separate contact.</Text>
                </View>
              )}
              {([
                ['name', 'Name'], ['role', 'Role'], ['company', 'Company'],
                ['phone', 'Phone'], ['email', 'Email'], ['address', 'Address'],
              ] as const).map(([key, label]) => (
                <View key={key} style={styles.field}>
                  <Text style={styles.label}>{label}</Text>
                  {confidence[key] !== undefined && confidence[key] < 0.8 && (
                    <Text style={styles.checkTag}>Check this field</Text>
                  )}
                  <TextInput
                    value={fields[key]}
                    onChangeText={(value) => changeField(key, value)}
                    placeholder={label}
                    placeholderTextColor={colors.textMuted}
                    style={styles.input}
                    autoCapitalize={key === 'email' ? 'none' : 'words'}
                    keyboardType={key === 'phone' ? 'phone-pad' : key === 'email' ? 'email-address' : 'default'}
                  />
                </View>
              ))}
              <Text style={styles.formTitle}>Category</Text>
              <View style={styles.categoryList}>
                {categories.map((category) => {
                  const selected = selectedCategoryIds.includes(category.id);
                  return (
                    <PressableScale
                      key={category.id}
                      onPress={() => setSelectedCategoryIds((current) => selected ? current.filter((id) => id !== category.id) : [...current, category.id])}
                      style={[styles.categoryChip, selected && styles.categoryChipSelected]}
                    >
                      <Text style={[styles.categoryChipText, selected && styles.categoryChipTextSelected]}>{category.name}</Text>
                    </PressableScale>
                  );
                })}
              </View>
              <PressableScale onPress={() => setFollowUp((value) => !value)} style={styles.followUpRow}>
                <Text style={styles.label}>Set follow-up</Text>
                <Text style={styles.followUpValue}>{followUp ? 'On' : 'Off'}</Text>
              </PressableScale>
              {followUp && (
                <View style={styles.categoryList}>
                  {[1, 3, 7].map((days) => (
                    <PressableScale key={days} onPress={() => setFollowUpDays(days)} style={[styles.categoryChip, followUpDays === days && styles.categoryChipSelected]}>
                      <Text style={[styles.categoryChipText, followUpDays === days && styles.categoryChipTextSelected]}>{days === 1 ? 'Tomorrow' : days === 3 ? 'In 3 days' : 'Next week'}</Text>
                    </PressableScale>
                  ))}
                </View>
              )}
              <Button title="Save to Recallr" onPress={() => void saveContact()} loading={isSaving} disabled={isSaving} />
              <Button title="Retake" variant="text" leftIcon={<IconRefresh size={16} color={colors.accent} />} onPress={() => { setStoragePath(null); setImageUri(null); setQrSlug(''); setFields(emptyFields); }} />
            </Card>
          </>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 10, gap: 12 },
  backButton: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { color: colors.text, fontSize: 18, fontWeight: '600' },
  content: { padding: 16, paddingBottom: 40 },
  introCard: { padding: 24, alignItems: 'center', gap: 12 },
  title: { color: colors.text, fontSize: 19, fontWeight: '600' },
  description: { color: colors.textSecondary, fontSize: 14, textAlign: 'center', lineHeight: 20 },
  actions: { width: '100%', gap: 10, marginTop: 8 },
  loadingRow: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 16 },
  loadingText: { color: colors.textSecondary, fontSize: 14 },
  caption: { color: colors.textMuted, fontSize: 11, marginTop: 8 },
  preview: { width: '100%', height: 180, marginBottom: 14, borderRadius: radius.card, backgroundColor: colors.surface },
  qrCamera: { width: '100%', height: 280, borderRadius: radius.card, overflow: 'hidden' },
  formCard: { padding: 16, gap: 10 },
  formTitle: { color: colors.text, fontSize: 16, fontWeight: '600', marginBottom: 2 },
  field: { gap: 4, marginBottom: 5 },
  label: { color: colors.textSecondary, fontSize: 12, fontWeight: '500' },
  input: { minHeight: 42, borderWidth: 1, borderColor: colors.border, borderRadius: radius.input, paddingHorizontal: 11, color: colors.text, backgroundColor: colors.background, fontSize: 14 },
  duplicateBanner: { padding: 10, borderRadius: radius.input, backgroundColor: colors.accentTint, marginBottom: 8 },
  duplicateText: { color: colors.accentDark, fontSize: 12 },
  checkTag: { alignSelf: 'flex-start', backgroundColor: colors.accentTint, color: colors.accentDark, fontSize: 11, overflow: 'hidden', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 8 },
  categoryList: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  categoryChip: { paddingHorizontal: 12, paddingVertical: 7, borderRadius: radius.chip, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  categoryChipSelected: { backgroundColor: colors.accent, borderColor: colors.accent },
  categoryChipText: { color: colors.textSecondary, fontSize: 12 },
  categoryChipTextSelected: { color: colors.surface },
  followUpRow: { minHeight: 42, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, borderTopColor: colors.border, marginTop: 8 },
  followUpValue: { color: colors.accent, fontSize: 13, fontWeight: '500' },
});
