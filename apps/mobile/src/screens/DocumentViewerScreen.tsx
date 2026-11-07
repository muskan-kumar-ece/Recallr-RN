import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  Share,
  Linking,
  TextInput,
} from 'react-native';
import { colors, radius } from '@recallr/tokens';
import { Card, PressableScale, BottomSheet, Button } from '../components/ui';
import {
  IconArrowLeft,
  IconDots,
  IconShare,
  IconExternalLink,
  IconTrash,
  IconFileText,
} from '@tabler/icons-react-native';
import { useContact, useContactDocument, useContacts, useDeleteContactDocument, useRestoreContactDocument, useStorageDownloadUrl, useUpdateContact, useUpdateContactDocument } from '@recallr/api';

export interface DocumentViewerScreenProps {
  contactId?: string;
  documentId?: string;
  onBack: () => void;
  onOpenContact: (id: string) => void;
  onShowToast: (message: string) => void;
}

export const DocumentViewerScreen: React.FC<DocumentViewerScreenProps> = ({
  contactId,
  documentId,
  onBack,
  onOpenContact,
  onShowToast,
}) => {
  const isBusinessCard = documentId === 'business-card';
  const { data: document } = useContactDocument(isBusinessCard ? '' : documentId || '');
  const { data: contact } = useContact(contactId || document?.contact_id || '');
  const { data: storageUrl } = useStorageDownloadUrl(isBusinessCard ? contact?.card_image_path || '' : '');
  const { data: contacts = [] } = useContacts();
  const { mutateAsync: deleteDocument } = useDeleteContactDocument();
  const { mutateAsync: restoreDocument } = useRestoreContactDocument();
  const { mutateAsync: updateContact } = useUpdateContact();
  const { mutateAsync: updateDocument } = useUpdateContactDocument();
  const [isOptionsOpen, setIsOptionsOpen] = React.useState(false);
  const [isRenameOpen, setIsRenameOpen] = React.useState(false);
  const [renameValue, setRenameValue] = React.useState('');
  const [undoDelete, setUndoDelete] = React.useState(false);
  const [deletedCardImagePath, setDeletedCardImagePath] = React.useState<string | null>(null);

  const docTitle = isBusinessCard
    ? `${contact?.name || 'Contact'}_Business_Card.jpg`
    : document?.name || 'Document';
  const fileUrl = isBusinessCard ? storageUrl : document?.download_url;

  const openInSystem = async () => {
    if (!fileUrl) return onShowToast('Document is still loading');
    try { await Linking.openURL(fileUrl); } catch (error: unknown) { onShowToast(error instanceof Error ? error.message : 'Could not open document'); }
  };

  const shareDocument = async () => {
    if (!fileUrl) return onShowToast('Document is still loading');
    try { await Share.share({ title: docTitle, message: fileUrl }); } catch (error: unknown) { onShowToast(error instanceof Error ? error.message : 'Could not share document'); }
  };

  const removeDocument = async () => {
    try {
      if (isBusinessCard && contactId && contact?.card_image_path) {
        setDeletedCardImagePath(contact.card_image_path);
        await updateContact({ id: contactId, input: { card_image_path: null } });
      }
      else if (documentId) await deleteDocument(documentId);
      setUndoDelete(true);
      onShowToast('Document deleted. Tap Undo to restore it.');
    } catch (error: unknown) { onShowToast(error instanceof Error ? error.message : 'Could not delete document'); }
  };

  const undoRemoveDocument = async () => {
    try {
      if (isBusinessCard && contactId && deletedCardImagePath) await updateContact({ id: contactId, input: { card_image_path: deletedCardImagePath } });
      else if (documentId) await restoreDocument(documentId);
      setUndoDelete(false);
      setDeletedCardImagePath(null);
      onShowToast('Document restored');
    } catch (error: unknown) { onShowToast(error instanceof Error ? error.message : 'Could not restore document'); }
  };

  return (
    <View style={styles.container}>
      {/* Top Header */}
      <View style={styles.headerRow}>
        <PressableScale
          onPress={onBack}
          haptic="light"
          style={styles.circleBtn}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <IconArrowLeft size={20} color={colors.text} strokeWidth={2} />
        </PressableScale>
        <Text style={styles.headerTitle} numberOfLines={1}>{docTitle}</Text>
        <PressableScale
          onPress={() => setIsOptionsOpen(true)}
          haptic="light"
          style={styles.circleBtn}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <IconDots size={20} color={colors.text} strokeWidth={2} />
        </PressableScale>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Document Preview Box */}
        <Card style={styles.previewCard}>
          {fileUrl && (isBusinessCard || document?.mime_type.startsWith('image/')) ? (
            <Image
              source={{ uri: fileUrl }}
              style={styles.previewImage}
              resizeMode="contain"
            />
          ) : (
            <View style={styles.placeholderBox}>
              <IconFileText size={48} color={colors.accent} strokeWidth={1.5} />
              <Text style={styles.placeholderTitle}>{docTitle}</Text>
              <Text style={styles.placeholderSub}>{document?.mime_type || 'Open this file in the system viewer.'}</Text>
            </View>
          )}
        </Card>

        {/* Action Tiles */}
        <View style={styles.actionRow}>
          <PressableScale
            onPress={() => void shareDocument()}
            haptic="light"
            style={styles.actionCol}
          >
            <View style={styles.actionTileBox}>
              <IconShare size={20} color={colors.accent} strokeWidth={2} />
            </View>
            <Text style={styles.actionLabel}>Share</Text>
          </PressableScale>

          <PressableScale
            onPress={() => void openInSystem()}
            haptic="light"
            style={styles.actionCol}
          >
            <View style={styles.actionTileBox}>
              <IconExternalLink size={20} color={colors.accent} strokeWidth={2} />
            </View>
            <Text style={styles.actionLabel}>Open in</Text>
          </PressableScale>

          <PressableScale
            onPress={() => void removeDocument()}
            haptic="warning"
            style={styles.actionCol}
          >
            <View style={styles.actionTileBox}>
              <IconTrash size={20} color={colors.danger} strokeWidth={2} />
            </View>
            <Text style={[styles.actionLabel, { color: colors.danger }]}>
              Delete
            </Text>
          </PressableScale>
        </View>

        {/* Metadata Card */}
        <Card style={styles.metaCard}>
          {contact && (
            <>
              <View style={styles.metaRow}>
                <Text style={styles.metaLabel}>Attached to</Text>
                <PressableScale
                  onPress={() => onOpenContact(contact.id)}
                  haptic="light"
                  style={styles.personTag}
                >
                  <Text style={styles.personTagText}>{contact.name}</Text>
                </PressableScale>
              </View>
              <View style={styles.divider} />
            </>
          )}

          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>Added</Text>
            <Text style={styles.metaValue}>
              {document?.created_at ? new Date(document.created_at).toLocaleDateString('en-IN') : contact?.created_at ? new Date(contact.created_at).toLocaleDateString('en-IN') : '—'}
            </Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>File Type</Text>
            <Text style={styles.metaValue}>
              {isBusinessCard ? 'Scanned Card Image' : document?.mime_type || '—'}
            </Text>
          </View>
        </Card>

        <View style={{ height: 40 }} />
      </ScrollView>
      {undoDelete && <PressableScale onPress={() => void undoRemoveDocument()} style={styles.undoBanner}><Text style={styles.undoText}>Undo delete</Text></PressableScale>}
      <BottomSheet isOpen={isOptionsOpen} onClose={() => setIsOptionsOpen(false)} title="Document options">
        <View style={styles.optionList}>
          {!isBusinessCard && <PressableScale style={styles.optionButton} onPress={() => { setRenameValue(document?.name || ''); setIsOptionsOpen(false); setIsRenameOpen(true); }}><Text style={styles.optionText}>Rename</Text></PressableScale>}
          {!isBusinessCard && contacts.filter((item) => item.id !== document?.contact_id).map((item) => <PressableScale key={item.id} style={styles.optionButton} onPress={() => {
            if (!documentId) return;
            void updateDocument({ id: documentId, changes: { contact_id: item.id } }).then(() => { onShowToast('Document moved'); onBack(); }).catch((error: unknown) => onShowToast(error instanceof Error ? error.message : 'Could not move document'));
          }}><Text style={styles.optionText}>Move to {item.name}</Text></PressableScale>)}
        </View>
      </BottomSheet>
      <BottomSheet isOpen={isRenameOpen} onClose={() => setIsRenameOpen(false)} title="Rename document">
        <View style={styles.optionList}>
          <TextInput value={renameValue} onChangeText={setRenameValue} style={styles.renameInput} />
          <Button title="Save name" disabled={!renameValue.trim() || !documentId} onPress={() => {
            if (!documentId) return;
            void updateDocument({ id: documentId, changes: { name: renameValue.trim() } }).then(() => { setIsRenameOpen(false); onShowToast('Document renamed'); }).catch((error: unknown) => onShowToast(error instanceof Error ? error.message : 'Could not rename document'));
          }} />
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
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 12,
    marginBottom: 8,
  },
  circleBtn: {
    width: 36,
    height: 36,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    maxWidth: 220,
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  previewCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.card,
    height: 240,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    overflow: 'hidden',
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  placeholderBox: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  placeholderTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
    marginTop: 10,
  },
  placeholderSub: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 4,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  actionCol: {
    alignItems: 'center',
    width: 70,
  },
  actionTileBox: {
    width: 48,
    height: 48,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  actionLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  metaCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.card,
    overflow: 'hidden',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  metaLabel: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  metaValue: {
    fontSize: 14,
    color: colors.text,
    fontWeight: '500',
  },
  personTag: {
    backgroundColor: colors.accentTintSoft,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.full,
  },
  personTagText: {
    fontSize: 13,
    color: colors.accentDark,
    fontWeight: '500',
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.divider,
    marginLeft: 16,
  },
  undoBanner: { alignSelf: 'center', marginBottom: 24, paddingHorizontal: 18, paddingVertical: 12, borderRadius: radius.button, backgroundColor: colors.toastBg },
  undoText: { color: colors.surface, fontWeight: '500' },
  optionList: { gap: 8, paddingBottom: 16 },
  optionButton: { padding: 14, borderRadius: radius.input, backgroundColor: colors.surface },
  optionText: { color: colors.text, fontSize: 14 },
  renameInput: { minHeight: 44, borderWidth: 1, borderColor: colors.border, borderRadius: radius.input, paddingHorizontal: 12, color: colors.text },
});
