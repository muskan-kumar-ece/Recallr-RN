import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { colors } from '@recallr/tokens';
import { Card, Avatar, Button, SearchBar, PressableScale } from '../components/ui';
import {
  IconArrowLeft,
  IconAddressBook,
  IconLock,
  IconCheck,
  IconChevronDown,
} from '@tabler/icons-react-native';
import { useImportContactsBatch, useCategories } from '@recallr/api';
import { ContactInput } from '@recallr/core';

export interface ImportContactsScreenProps {
  onBack: () => void;
  onImportComplete: (count: number) => void;
  onShowToast: (message: string) => void;
}

export const ImportContactsScreen: React.FC<ImportContactsScreenProps> = ({
  onBack,
  onImportComplete,
  onShowToast,
}) => {
  const { data: dbCategories } = useCategories();
  const { mutateAsync: importBatchMutate, isPending: isImporting } = useImportContactsBatch();

  const [hasPermission, setHasPermission] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCatId, setSelectedCatId] = useState<string | null>(null);
  const [selectedContacts, setSelectedContacts] = useState<Record<string, boolean>>({
    '1': true,
    '2': true,
    '3': true,
  });

  const toggleSelect = (id: string) => {
    setSelectedContacts((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const selectedCount = Object.values(selectedContacts).filter(Boolean).length;

  if (!hasPermission) {
    return (
      <View style={styles.permissionContainer}>
        <View style={styles.permissionContent}>
          <View style={styles.permIconBox}>
            <IconAddressBook size={32} color={colors.accent} strokeWidth={2} />
          </View>
          <Text style={styles.permTitle}>Import from your phone</Text>
          <Text style={styles.permSubtitle}>
            Bring in the contacts you want. Recallr only reads them to show you
            the list, and nothing is added until you choose.
          </Text>

          <Card style={styles.permLockCard}>
            <IconLock size={16} color={colors.accent} strokeWidth={2} />
            <Text style={styles.permLockText}>
              You pick who to import. You can revoke access anytime in phone
              settings.
            </Text>
          </Card>

          <Button
            title="Allow contacts access"
            variant="primary"
            size="md"
            onPress={() => setHasPermission(true)}
            style={styles.allowBtn}
          />

          <PressableScale
            onPress={onBack}
            haptic="light"
            style={styles.notNowBtn}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Text style={styles.notNowText}>Not now</Text>
          </PressableScale>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Top Header */}
      <View style={styles.headerRow}>
        <PressableScale
          onPress={onBack}
          haptic="light"
          style={styles.backBtn}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <IconArrowLeft size={20} color={colors.text} strokeWidth={2} />
        </PressableScale>
        <Text style={styles.headerTitle}>Import contacts</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Search */}
        <View style={styles.searchContainer}>
          <SearchBar
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search phone contacts"
          />
        </View>

        {/* Subheader: Count & Select All */}
        <View style={styles.subHeaderRow}>
          <Text style={styles.contactCount}>142 contacts</Text>
          <PressableScale
            onPress={() => onShowToast('All contacts selected')}
            haptic="selection"
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Text style={styles.selectAllText}>Select all</Text>
          </PressableScale>
        </View>

        {/* Contact Checklist Card */}
        <Card style={styles.contactsCard}>
          {/* Item 1 */}
          <PressableScale
            onPress={() => toggleSelect('1')}
            haptic="selection"
            style={styles.contactRow}
          >
            <View
              style={[
                styles.checkbox,
                selectedContacts['1'] && styles.checkboxActive,
              ]}
            >
              {selectedContacts['1'] && (
                <IconCheck size={12} color="#FFFFFF" strokeWidth={3} />
              )}
            </View>
            <Avatar name="Aarav Sharma" size="sm" />
            <View style={styles.contactInfo}>
              <Text style={styles.contactName}>Aarav Sharma</Text>
              <Text style={styles.contactPhone}>+91 90000 11111</Text>
            </View>
          </PressableScale>

          <View style={styles.divider} />

          {/* Item 2 */}
          <PressableScale
            onPress={() => toggleSelect('2')}
            haptic="selection"
            style={styles.contactRow}
          >
            <View
              style={[
                styles.checkbox,
                selectedContacts['2'] && styles.checkboxActive,
              ]}
            >
              {selectedContacts['2'] && (
                <IconCheck size={12} color="#FFFFFF" strokeWidth={3} />
              )}
            </View>
            <Avatar name="Meena Patel" size="sm" />
            <View style={styles.contactInfo}>
              <Text style={styles.contactName}>Meena Patel</Text>
              <Text style={styles.contactPhone}>+91 90000 22222</Text>
            </View>
          </PressableScale>

          <View style={styles.divider} />

          {/* Item 3 */}
          <PressableScale
            onPress={() => toggleSelect('3')}
            haptic="selection"
            style={styles.contactRow}
          >
            <View
              style={[
                styles.checkbox,
                selectedContacts['3'] && styles.checkboxActive,
              ]}
            >
              {selectedContacts['3'] && (
                <IconCheck size={12} color="#FFFFFF" strokeWidth={3} />
              )}
            </View>
            <Avatar name="Suresh Goud" size="sm" />
            <View style={styles.contactInfo}>
              <Text style={styles.contactName}>Suresh Goud</Text>
              <Text style={styles.contactPhone}>+91 90000 33333</Text>
            </View>
          </PressableScale>

          <View style={styles.divider} />

          {/* Item 4 */}
          <PressableScale
            onPress={() => toggleSelect('4')}
            haptic="selection"
            style={styles.contactRow}
          >
            <View
              style={[
                styles.checkbox,
                selectedContacts['4'] && styles.checkboxActive,
              ]}
            >
              {selectedContacts['4'] && (
                <IconCheck size={12} color="#FFFFFF" strokeWidth={3} />
              )}
            </View>
            <Avatar name="Vijay Rao" size="sm" />
            <View style={styles.contactInfo}>
              <Text style={styles.contactName}>Vijay Rao</Text>
              <Text style={styles.contactPhone}>+91 90000 44444</Text>
            </View>
          </PressableScale>

          <View style={styles.divider} />

          {/* Item 5: Already in Recallr */}
          <View style={[styles.contactRow, { opacity: 0.6 }]}>
            <View style={[styles.checkbox, styles.checkboxDisabled]}>
              <IconCheck size={12} color={colors.textMuted} strokeWidth={2} />
            </View>
            <Avatar name="Ramesh Kumar" size="sm" />
            <View style={styles.contactInfo}>
              <Text style={styles.contactName}>Ramesh Kumar</Text>
              <Text style={styles.alreadyText}>Already in Recallr</Text>
            </View>
          </View>
        </Card>

        <View style={{ height: 110 }} />
      </ScrollView>

      {/* Floating Bottom Import Bar */}
      <View style={styles.bottomBar}>
        <View style={styles.barTopRow}>
          <Text style={styles.selectedCountText}>{selectedCount} selected</Text>
          <PressableScale
            onPress={() => {
              if (dbCategories && dbCategories.length > 0) {
                const next = dbCategories.find((c) => c.id !== selectedCatId);
                setSelectedCatId(next ? next.id : null);
              }
            }}
            haptic="light"
            style={styles.catPickerBtn}
          >
            <Text style={styles.catPickerLabel}>
              Category: <Text style={styles.catPickerName}>
                {dbCategories?.find((c) => c.id === selectedCatId)?.name || 'General'}
              </Text>
            </Text>
            <IconChevronDown size={14} color={colors.accent} strokeWidth={2} />
          </PressableScale>
        </View>

        <Button
          title={isImporting ? 'Importing...' : `Import ${selectedCount} contacts`}
          variant="primary"
          size="md"
          disabled={selectedCount === 0 || isImporting}
          onPress={async () => {
            try {
              const defaultPhoneList: ContactInput[] = [
                { name: 'Suresh Patel', phone: '+91 98250 12345', role: 'Proprietor', company: 'Patel Machinery', source: 'import', tags: ['imported'], links: [], category_ids: selectedCatId ? [selectedCatId] : [] },
                { name: 'Priya Sharma', phone: '+91 98765 43211', role: 'Partner', company: 'Sharma Chemicals', source: 'import', tags: ['imported'], links: [], category_ids: selectedCatId ? [selectedCatId] : [] },
                { name: 'Anita Desai', phone: '+91 98450 67890', role: 'Manager', company: 'Desai Plastics', source: 'import', tags: ['imported'], links: [], category_ids: selectedCatId ? [selectedCatId] : [] },
                { name: 'Vijay Rao', phone: '+91 90000 44444', role: 'Buyer', company: 'Rao Extrusions', source: 'import', tags: ['imported'], links: [], category_ids: selectedCatId ? [selectedCatId] : [] },
              ];

              const toImport = defaultPhoneList.filter((_, idx) => selectedContacts[String(idx + 1)]);
              if (toImport.length > 0) {
                await importBatchMutate(toImport);
              }
              onShowToast(`Imported ${selectedCount} contacts`);
              onImportComplete(selectedCount);
            } catch (err: unknown) {
              onShowToast(err instanceof Error ? err.message : 'Import failed');
            }
          }}
          style={styles.importBtn}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  permissionContainer: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  permissionContent: {
    alignItems: 'center',
    width: '100%',
  },
  permIconBox: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: colors.accentTint,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  permTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.text,
    fontFamily: 'Inter',
    textAlign: 'center',
    marginBottom: 10,
  },
  permSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    fontFamily: 'Inter',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  permLockCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    gap: 12,
    width: '100%',
    marginBottom: 28,
  },
  permLockText: {
    fontSize: 12,
    color: colors.textSecondary,
    fontFamily: 'Inter',
    flex: 1,
    lineHeight: 16,
  },
  allowBtn: {
    width: '100%',
    marginBottom: 14,
  },
  notNowBtn: {
    paddingVertical: 8,
  },
  notNowText: {
    fontSize: 14,
    color: colors.textMuted,
    fontFamily: 'Inter',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingTop: 12,
    marginBottom: 8,
  },
  backBtn: {
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
    fontSize: 20,
    fontWeight: '600',
    color: colors.text,
    fontFamily: 'Inter',
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  searchContainer: {
    marginBottom: 12,
  },
  subHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
    paddingHorizontal: 2,
  },
  contactCount: {
    fontSize: 13,
    color: colors.textMuted,
    fontFamily: 'Inter',
  },
  selectAllText: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.accent,
    fontFamily: 'Inter',
  },
  contactsCard: {
    padding: 0,
    overflow: 'hidden',
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    gap: 12,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 5,
    borderWidth: 1.5,
    borderColor: colors.borderStrong,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxActive: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  checkboxDisabled: {
    backgroundColor: colors.fill,
    borderColor: 'transparent',
  },
  contactInfo: {
    flex: 1,
  },
  contactName: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    fontFamily: 'Inter',
  },
  contactPhone: {
    fontSize: 12,
    color: colors.textSecondary,
    fontFamily: 'Inter',
    marginTop: 1,
  },
  alreadyText: {
    fontSize: 12,
    color: colors.textMuted,
    fontFamily: 'Inter',
    marginTop: 1,
  },
  divider: {
    height: 0.5,
    backgroundColor: colors.divider,
    marginHorizontal: 12,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.surface,
    borderTopWidth: 0.5,
    borderTopColor: colors.border,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 24,
    gap: 10,
  },
  barTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  selectedCountText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text,
    fontFamily: 'Inter',
  },
  catPickerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  catPickerLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    fontFamily: 'Inter',
  },
  catPickerName: {
    color: colors.accent,
    fontWeight: '600',
  },
  importBtn: {
    width: '100%',
  },
});
