import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  Linking,
  ActivityIndicator,
} from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import { colors, radius } from '@recallr/tokens';
import { useContact, useNotes, useUpdateContact, useSummarizeContact, useContactDocuments, useCreateContactDocument, useUploadFile } from '@recallr/api';
import { Card, OrangeCorner, Avatar, PressableScale, BottomSheet, Button } from '../components/ui';
import { useRecallrAuth } from '../providers/RecallrProvider';
import {
  IconArrowLeft,
  IconShare,
  IconDots,
  IconPencil,
  IconPhone,
  IconBrandWhatsapp,
  IconMail,
  IconBellPlus,
  IconBell,
  IconRefresh,
  IconMapPin,
  IconCalendar,
  IconSparkles,
  IconId,
  IconArrowUp,
} from '@tabler/icons-react-native';

export interface ContactProfileScreenProps {
  contactId?: string;
  onBack: () => void;
  onEdit: () => void;
  onShare: () => void;
  onOpenMenu: () => void;
  onOpenDocument: (docId: string) => void;
  onAskAI: (query: string) => void;
  onShowToast: (message: string) => void;
  onSetReminder: () => void;
  onAddNote: () => void;
  onOpenReminder: () => void;
}

export const ContactProfileScreen: React.FC<ContactProfileScreenProps> = ({
  contactId,
  onBack,
  onEdit,
  onShare,
  onOpenMenu,
  onOpenDocument,
  onAskAI,
  onShowToast,
  onSetReminder,
  onAddNote,
  onOpenReminder,
}) => {
  const [askQuery, setAskQuery] = useState('');
  const [isAddDocumentOpen, setIsAddDocumentOpen] = useState(false);
  const { data: dbContact } = useContact(contactId);
  const { data: dbNotes } = useNotes(contactId);
  const { data: documents = [] } = useContactDocuments(contactId || '');
  const { user } = useRecallrAuth();
  const createDocument = useCreateContactDocument();
  const uploadFile = useUploadFile();
  const { mutateAsync: updateContact } = useUpdateContact();
  const { mutateAsync: summarize, isPending: isSummarizing } = useSummarizeContact();

  const contactName = dbContact?.name || 'Contact';
  const role = dbContact?.role || '';
  const company = dbContact?.company || '';
  const phone = dbContact?.phone || '';
  const email = dbContact?.email || '';
  const address = dbContact?.address || '';
  const metWhere = dbContact?.met_where || '';
  const aiSummary = dbContact?.ai_summary || '';
  const tags = dbContact?.tags || [];
  const nextReminder = (dbNotes || [])
    .filter((note) => note.remind_at && !note.done_at && !note.deleted_at)
    .sort((left, right) => new Date(left.remind_at || 0).getTime() - new Date(right.remind_at || 0).getTime())[0];

  const saveDocument = async (uri: string, name: string, mimeType: string, size: number) => {
    if (!contactId || !user?.id) return;
    try {
      const blob = await (await fetch(uri)).blob();
      const path = `users/${user.id}/documents/${contactId}/${Date.now()}-${name.replace(/[^A-Za-z0-9._-]/g, '_')}`;
      await uploadFile.mutateAsync({ path, file: blob });
      await createDocument.mutateAsync({ contact_id: contactId, storage_path: path, name, mime_type: mimeType, size_bytes: size || blob.size });
      setIsAddDocumentOpen(false);
      onShowToast('Document added');
    } catch (error: unknown) {
      onShowToast(error instanceof Error ? error.message : 'Could not add document');
    }
  };

  const chooseDocumentPhoto = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      onShowToast('Allow photo access to attach an image');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.9 });
    const image = result.assets?.[0];
    if (!result.canceled && image) await saveDocument(image.uri, image.fileName || `image-${Date.now()}.jpg`, image.mimeType || 'image/jpeg', image.fileSize || 0);
  };

  const chooseDocumentFile = async () => {
    const result = await DocumentPicker.getDocumentAsync({ copyToCacheDirectory: true, multiple: false });
    const file = result.assets?.[0];
    if (!result.canceled && file) await saveDocument(file.uri, file.name, file.mimeType || 'application/octet-stream', file.size || 0);
  };

  const openContactAction = async (url: string) => {
    if (!contactId || !dbContact) return;
    try {
      await Linking.openURL(url);
      await updateContact({ id: contactId, input: { last_contacted_at: new Date().toISOString() } });
    } catch (error: unknown) {
      onShowToast(error instanceof Error ? error.message : 'Could not open this action');
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Top Navigation */}
        <View style={styles.navRow}>
          <PressableScale
            onPress={onBack}
            haptic="light"
            style={styles.navCircleBtn}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <IconArrowLeft size={20} color={colors.text} strokeWidth={2} />
          </PressableScale>

          <View style={styles.navRightRow}>
            <PressableScale
              onPress={onShare}
              haptic="light"
              style={styles.navCircleBtn}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <IconShare size={18} color={colors.text} strokeWidth={2} />
            </PressableScale>

            <PressableScale
              onPress={onOpenMenu}
              haptic="light"
              style={styles.navCircleBtn}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <IconDots size={20} color={colors.text} strokeWidth={2} />
            </PressableScale>
          </View>
        </View>

        {/* Contact Header Card */}
        <Card style={styles.profileCard}>
          <OrangeCorner
            size="md"
            onPress={onEdit}
            icon={<IconPencil size={18} color="#FFFFFF" strokeWidth={2.2} />}
          />
          <View style={styles.profileRow}>
            <Avatar name={contactName} size="lg" />
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>{contactName}</Text>
              {(role || company) && (
                <Text style={styles.profileRole}>
                  {role} {role && company ? ', ' : ''} {company}
                </Text>
              )}
              {tags.length > 0 && (
                <View style={styles.tagsRow}>
                  {tags.slice(0, 3).map((tag, i) => (
                    <View key={i} style={styles.profileTag}>
                      <Text style={styles.profileTagText}>{tag}</Text>
                    </View>
                  ))}
                </View>
              )}
            </View>
          </View>
        </Card>

        {/* Action Row: Call, WhatsApp, Email, Remind */}
        <View style={styles.actionGrid}>
          <PressableScale
            onPress={() => phone ? void openContactAction(`tel:${phone}`) : onShowToast('No phone number')}
            haptic="light"
            style={[styles.actionCol, !phone && { opacity: 0.5 }]}
          >
            <View style={styles.actionTileBox}>
              <IconPhone size={22} color={colors.accent} strokeWidth={2} />
            </View>
            <Text style={styles.actionLabel}>Call</Text>
          </PressableScale>

          <PressableScale
            onPress={() => phone ? void openContactAction(`https://wa.me/${phone.replace(/\D/g, '')}`) : onShowToast('No phone number')}
            haptic="light"
            style={[styles.actionCol, !phone && { opacity: 0.5 }]}
          >
            <View style={styles.actionTileBox}>
              <IconBrandWhatsapp size={22} color={colors.accent} strokeWidth={2} />
            </View>
            <Text style={styles.actionLabel}>WhatsApp</Text>
          </PressableScale>

          <PressableScale
            onPress={() => email ? void openContactAction(`mailto:${email}`) : onShowToast('No email address')}
            haptic="light"
            style={[styles.actionCol, !email && { opacity: 0.5 }]}
          >
            <View style={styles.actionTileBox}>
              <IconMail size={22} color={colors.accent} strokeWidth={2} />
            </View>
            <Text style={styles.actionLabel}>Email</Text>
          </PressableScale>

          <PressableScale
            onPress={onSetReminder}
            haptic="light"
            style={styles.actionCol}
          >
            <View style={styles.actionTileBox}>
              <IconBellPlus size={22} color={colors.accent} strokeWidth={2} />
            </View>
            <Text style={styles.actionLabel}>Remind</Text>
          </PressableScale>
        </View>

        {/* Recallr Summary Card */}
        <Card style={styles.summaryCard}>
          <OrangeCorner
            size="md"
            onPress={() => {
              if (!contactId) return;
              void summarize(contactId)
                .then(() => onShowToast('Summary updated'))
                .catch((error: unknown) => onShowToast(error instanceof Error ? error.message : 'Could not generate summary'));
            }}
            icon={isSummarizing ? <ActivityIndicator size="small" color="#FFFFFF" /> : <IconRefresh size={18} color="#FFFFFF" strokeWidth={2.4} />}
          />
          <View style={styles.summaryHeader}>
            <View style={styles.summaryIconBox}>
              <IconSparkles size={16} color={colors.accent} strokeWidth={2.2} />
            </View>
            <Text style={styles.summaryTitle}>Recallr summary</Text>
          </View>
          <Text style={styles.summaryText}>
            {aiSummary || 'No summary yet. Tap refresh to generate one.'}
          </Text>
        </Card>

        {/* Next Follow-up Card */}
        <Card style={styles.nextFollowUpCard}>
          <OrangeCorner
            size="md"
            onPress={nextReminder ? onOpenReminder : onSetReminder}
            icon={<IconBell size={18} color="#FFFFFF" strokeWidth={2.2} />}
          />
          <Text style={styles.followUpLabel}>Next follow-up</Text>
          <Text style={styles.followUpTitle}>{nextReminder?.title || 'No follow-up set'}</Text>
          <Text style={styles.followUpTime}>
            {nextReminder?.remind_at ? new Date(nextReminder.remind_at).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' }) : 'Set one to schedule a follow-up'}
          </Text>
        </Card>

        {/* Details Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Details</Text>
          <PressableScale
            onPress={onEdit}
            haptic="light"
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Text style={styles.sectionLink}>Edit</Text>
          </PressableScale>
        </View>

        <Card style={styles.detailsCard}>
          {phone ? (
            <View style={styles.detailRow}>
              <View style={styles.detailIconBox}>
                <IconPhone size={18} color={colors.accent} strokeWidth={2} />
              </View>
              <View style={styles.detailInfo}>
                <Text style={styles.detailLabel}>Phone</Text>
                <Text style={styles.detailValue}>{phone}</Text>
              </View>
            </View>
          ) : null}

          {email ? (
            <>
              {phone ? <View style={styles.divider} /> : null}
              <View style={styles.detailRow}>
                <View style={styles.detailIconBox}>
                  <IconMail size={18} color={colors.accent} strokeWidth={2} />
                </View>
                <View style={styles.detailInfo}>
                  <Text style={styles.detailLabel}>Email</Text>
                  <Text style={styles.detailValue}>{email}</Text>
                </View>
              </View>
            </>
          ) : null}

          {address ? (
            <>
              <View style={styles.divider} />
              <View style={styles.detailRow}>
                <View style={styles.detailIconBox}>
                  <IconMapPin size={18} color={colors.accent} strokeWidth={2} />
                </View>
                <View style={styles.detailInfo}>
                  <Text style={styles.detailLabel}>Address</Text>
                  <Text style={styles.detailValue}>{address}</Text>
                </View>
              </View>
            </>
          ) : null}

          {metWhere ? (
            <>
              <View style={styles.divider} />
              <View style={styles.detailRow}>
                <View style={styles.detailIconBox}>
                  <IconCalendar size={18} color={colors.accent} strokeWidth={2} />
                </View>
                <View style={styles.detailInfo}>
                  <Text style={styles.detailLabel}>Where we met</Text>
                  <Text style={styles.detailValue}>{metWhere}</Text>
                </View>
              </View>
            </>
          ) : null}
        </Card>

        {/* Notes Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Notes ({dbNotes?.length ?? 0})</Text>
          <PressableScale
            onPress={onAddNote}
            haptic="light"
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Text style={styles.sectionLink}>Add note</Text>
          </PressableScale>
        </View>

        <Card style={styles.notesCard}>
          {dbNotes && dbNotes.length > 0 ? (
            dbNotes.map((n, i) => (
              <React.Fragment key={n.id}>
                {i > 0 && <View style={styles.divider} />}
                <View style={styles.noteItem}>
                  {n.title ? (
                    <Text style={[styles.noteBody, { fontWeight: '600', marginBottom: 2 }]}>
                      {n.title}
                    </Text>
                  ) : null}
                  {n.body ? <Text style={styles.noteBody}>{n.body}</Text> : null}
                  <Text style={styles.noteDate}>
                    {new Date(n.created_at).toLocaleDateString([], {
                      day: 'numeric',
                      month: 'short',
                    })}
                  </Text>
                </View>
              </React.Fragment>
            ))
          ) : (
            <View style={{ padding: 14 }}>
              <Text style={{ fontSize: 13, color: colors.textSecondary }}>No notes yet</Text>
            </View>
          )}
        </Card>

        {/* Documents Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Documents</Text>
          <PressableScale
            onPress={() => setIsAddDocumentOpen(true)}
            haptic="light"
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Text style={styles.sectionLink}>Add</Text>
          </PressableScale>
        </View>

        <View style={styles.docGrid}>
          {dbContact?.card_image_path ? <Card
            style={styles.docCard}
            onPress={() => onOpenDocument('business-card')}
          >
            <View style={styles.docIconBox}>
              <IconId size={18} color={colors.accent} strokeWidth={2} />
            </View>
            <View style={styles.docInfo}>
              <Text style={styles.docTitle}>Business card</Text>
              <Text style={styles.docSub}>Image</Text>
            </View>
          </Card> : null}
          {documents.map((document) => <Card key={document.id} style={styles.docCard} onPress={() => onOpenDocument(document.id)}>
            <View style={styles.docIconBox}><IconId size={18} color={colors.accent} strokeWidth={2} /></View>
            <View style={styles.docInfo}><Text style={styles.docTitle} numberOfLines={1}>{document.name}</Text><Text style={styles.docSub}>{document.mime_type}</Text></View>
          </Card>)}
          {!dbContact?.card_image_path && documents.length === 0 ? <Text style={styles.noDocuments}>No documents yet</Text> : null}
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
      <BottomSheet isOpen={isAddDocumentOpen} onClose={() => setIsAddDocumentOpen(false)} title="Add document">
        <View style={styles.documentActions}>
          <Button title="Photo from library" variant="outline" onPress={() => void chooseDocumentPhoto()} loading={uploadFile.isPending || createDocument.isPending} />
          <Button title="Choose file" variant="outline" onPress={() => void chooseDocumentFile()} loading={uploadFile.isPending || createDocument.isPending} />
        </View>
      </BottomSheet>

      {/* Floating Bottom Bar: Ask about Ramesh */}
      <View style={styles.bottomBarContainer}>
        <View style={styles.askInputContainer}>
          <IconSparkles size={18} color={colors.accent} strokeWidth={2.2} />
          <TextInput
            value={askQuery}
            onChangeText={setAskQuery}
            placeholder={`Ask about ${contactName}`}
            placeholderTextColor={colors.textMuted}
            style={styles.askTextInput}
            onSubmitEditing={() => {
              if (askQuery.trim()) {
                onAskAI(askQuery.trim());
                setAskQuery('');
              }
            }}
          />
          <PressableScale
            onPress={() => {
              const query = askQuery.trim() || `Who is ${contactName}?`;
              onAskAI(query);
              setAskQuery('');
            }}
            haptic="light"
            style={styles.askSubmitBtn}
          >
            <IconArrowUp size={20} color="#FFFFFF" strokeWidth={2.4} />
          </PressableScale>
        </View>
      </View>
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
  navRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  navCircleBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.surface,
    borderWidth: 0.5,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navRightRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  profileCard: {
    padding: 16,
    marginBottom: 14,
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
    fontSize: 20,
    fontWeight: '600',
    color: colors.text,
    fontFamily: 'Inter',
  },
  profileRole: {
    fontSize: 13,
    color: colors.textSecondary,
    fontFamily: 'Inter',
    marginTop: 2,
  },
  tagsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
  },
  profileTag: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.full,
    backgroundColor: colors.accentTint,
  },
  profileTagText: {
    fontSize: 11,
    fontWeight: '500',
    color: colors.accentDark,
    fontFamily: 'Inter',
  },
  actionGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 14,
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
  actionLabel: {
    fontSize: 11,
    fontWeight: '500',
    color: colors.textSecondary,
    fontFamily: 'Inter',
    marginTop: 6,
    textAlign: 'center',
  },
  summaryCard: {
    padding: 14,
    marginBottom: 12,
    position: 'relative',
  },
  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  summaryIconBox: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: colors.accentTint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  summaryTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    fontFamily: 'Inter',
  },
  summaryText: {
    fontSize: 13,
    color: colors.text,
    fontFamily: 'Inter',
    lineHeight: 19,
    maxWidth: '82%',
  },
  nextFollowUpCard: {
    padding: 14,
    marginBottom: 16,
    position: 'relative',
  },
  followUpLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    fontFamily: 'Inter',
  },
  followUpTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
    fontFamily: 'Inter',
    marginTop: 2,
  },
  followUpTime: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.accent,
    fontFamily: 'Inter',
    marginTop: 2,
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
  detailsCard: {
    padding: 0,
    overflow: 'hidden',
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    gap: 12,
  },
  detailIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: colors.accentTint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  detailInfo: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 11,
    color: colors.textMuted,
    fontFamily: 'Inter',
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
    fontFamily: 'Inter',
    marginTop: 1,
  },
  notesCard: {
    padding: 14,
    marginBottom: 16,
  },
  noteItem: {
    paddingVertical: 4,
  },
  noteBody: {
    fontSize: 13,
    color: colors.text,
    fontFamily: 'Inter',
    lineHeight: 18,
  },
  noteDate: {
    fontSize: 11,
    color: colors.textMuted,
    fontFamily: 'Inter',
    marginTop: 4,
  },
  docGrid: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  documentActions: { gap: 10, paddingBottom: 12 },
  docCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    gap: 10,
  },
  docIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: colors.accentTint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  docInfo: {
    flex: 1,
  },
  docTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text,
    fontFamily: 'Inter',
  },
  docSub: {
    fontSize: 11,
    color: colors.textMuted,
    fontFamily: 'Inter',
    marginTop: 2,
  },
  noDocuments: {
    color: colors.textSecondary,
    fontSize: 13,
    paddingVertical: 8,
  },
  divider: {
    height: 0.5,
    backgroundColor: colors.divider,
    marginHorizontal: 12,
  },
  bottomBarContainer: {
    position: 'absolute',
    bottom: 16,
    left: 14,
    right: 14,
  },
  askInputContainer: {
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.surface,
    borderWidth: 0.5,
    borderColor: colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 14,
    paddingRight: 6,
    shadowColor: '#2B2B2B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 6,
  },
  askTextInput: {
    flex: 1,
    fontSize: 14,
    color: colors.text,
    fontFamily: 'Inter',
    paddingHorizontal: 10,
  },
  askSubmitBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
