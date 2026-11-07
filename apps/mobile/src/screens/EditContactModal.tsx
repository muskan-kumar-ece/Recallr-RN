import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { colors, radius } from '@recallr/tokens';
import { Card, Avatar, Button, PressableScale } from '../components/ui';
import { IconX } from '@tabler/icons-react-native';
import {
  useContact,
  useCreateContact,
  useUpdateContact,
  useDeleteContact,
  useCategories,
} from '@recallr/api';
import { ContactInput } from '@recallr/core';

export interface EditContactModalProps {
  contactId?: string;
  onClose: () => void;
  onSave: () => void;
  onDelete: () => void;
  onShowToast: (message: string) => void;
}

export const EditContactModal: React.FC<EditContactModalProps> = ({
  contactId,
  onClose,
  onSave,
  onDelete,
  onShowToast,
}) => {
  const { data: contact } = useContact(contactId || '');
  const { data: dbCategories } = useCategories();
  const { mutateAsync: createContactMutate, isPending: isCreating } = useCreateContact();
  const { mutateAsync: updateContactMutate, isPending: isUpdating } = useUpdateContact();
  const { mutateAsync: deleteContactMutate } = useDeleteContact();

  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [company, setCompany] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [where, setWhere] = useState('');
  const [date, setDate] = useState('');
  const [selectedCatIds, setSelectedCatIds] = useState<string[]>([]);
  const [tags, setTags] = useState<string[]>([]);

  useEffect(() => {
    if (contact) {
      setName(contact.name || '');
      setRole(contact.role || '');
      setCompany(contact.company || '');
      setPhone(contact.phone || '');
      setEmail(contact.email || '');
      setAddress(contact.address || '');
      setWhere(contact.met_where || '');
      setDate(contact.met_date || '');
      setSelectedCatIds(contact.category_ids || []);
      setTags(contact.tags || []);
    }
  }, [contact]);

  const toggleCategory = (catId: string) => {
    if (selectedCatIds.includes(catId)) {
      setSelectedCatIds(selectedCatIds.filter((id) => id !== catId));
    } else {
      setSelectedCatIds([...selectedCatIds, catId]);
    }
  };

  const handleSave = async () => {
    if (!name.trim()) {
      onShowToast('Name is required');
      return;
    }

    try {
      const payload: ContactInput = {
        name: name.trim(),
        role: role.trim() || null,
        company: company.trim() || null,
        phone: phone.trim() || null,
        email: email.trim() || null,
        address: address.trim() || null,
        met_where: where.trim() || null,
        met_date: date.trim() || null,
        category_ids: selectedCatIds,
        tags: tags,
        links: [],
        source: 'manual',
      };

      if (contactId) {
        await updateContactMutate({ id: contactId, input: payload });
        onShowToast('Contact updated');
      } else {
        await createContactMutate({ input: payload });
        onShowToast('Contact created');
      }
      onSave();
    } catch (err: unknown) {
      onShowToast(err instanceof Error ? err.message : 'Failed to save contact');
    }
  };

  const handleDelete = async () => {
    if (!contactId) {
      onDelete();
      return;
    }
    try {
      await deleteContactMutate({ id: contactId, soft: true });
      onShowToast('Contact deleted');
      onDelete();
    } catch (err: unknown) {
      onShowToast(err instanceof Error ? err.message : 'Failed to delete contact');
    }
  };

  const isSaving = isCreating || isUpdating;

  return (
    <View style={styles.container}>
      {/* Top Bar */}
      <View style={styles.headerRow}>
        <PressableScale
          onPress={onClose}
          haptic="light"
          style={styles.closeBtn}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <IconX size={20} color={colors.text} strokeWidth={2} />
        </PressableScale>
        <Text style={styles.headerTitle}>
          {contactId ? 'Edit contact' : 'New contact'}
        </Text>
        <PressableScale
          onPress={handleSave}
          haptic="light"
          style={styles.saveBtn}
          disabled={isSaving}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          {isSaving ? (
            <ActivityIndicator size="small" color={colors.accent} />
          ) : (
            <Text style={styles.saveText}>Save</Text>
          )}
        </PressableScale>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Avatar */}
        <View style={styles.avatarContainer}>
          <Avatar
            name={name || 'New Contact'}
            src={contact?.photo_path || undefined}
            size="xl"
            showBadge
          />
        </View>

        {/* Primary Contact Details Card */}
        <Card style={styles.formCard}>
          <View style={styles.inputRow}>
            <Text style={styles.inputLabel}>Name</Text>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="Full name"
              placeholderTextColor={colors.textMuted}
              style={styles.inputValue}
            />
          </View>
          <View style={styles.divider} />
          <View style={styles.inputRow}>
            <Text style={styles.inputLabel}>Role</Text>
            <TextInput
              value={role}
              onChangeText={setRole}
              placeholder="e.g. Managing Director"
              placeholderTextColor={colors.textMuted}
              style={styles.inputValue}
            />
          </View>
          <View style={styles.divider} />
          <View style={styles.inputRow}>
            <Text style={styles.inputLabel}>Company</Text>
            <TextInput
              value={company}
              onChangeText={setCompany}
              placeholder="Company name"
              placeholderTextColor={colors.textMuted}
              style={styles.inputValue}
            />
          </View>
          <View style={styles.divider} />
          <View style={styles.inputRow}>
            <Text style={styles.inputLabel}>Phone</Text>
            <TextInput
              value={phone}
              onChangeText={setPhone}
              placeholder="+91 98765 43210"
              placeholderTextColor={colors.textMuted}
              keyboardType="phone-pad"
              style={styles.inputValue}
            />
          </View>
          <View style={styles.divider} />
          <View style={styles.inputRow}>
            <Text style={styles.inputLabel}>Email</Text>
            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder="email@example.com"
              placeholderTextColor={colors.textMuted}
              keyboardType="email-address"
              autoCapitalize="none"
              style={styles.inputValue}
            />
          </View>
          <View style={styles.divider} />
          <View style={styles.inputRow}>
            <Text style={styles.inputLabel}>Address</Text>
            <TextInput
              value={address}
              onChangeText={setAddress}
              placeholder="City, Location"
              placeholderTextColor={colors.textMuted}
              style={styles.inputValue}
            />
          </View>
        </Card>

        {/* Categories Section */}
        {dbCategories && dbCategories.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Categories</Text>
            <View style={styles.catChipsRow}>
              {dbCategories.map((c) => {
                const isSelected = selectedCatIds.includes(c.id);
                return (
                  <PressableScale
                    key={c.id}
                    onPress={() => toggleCategory(c.id)}
                    haptic="selection"
                    style={[styles.catChip, isSelected && styles.catChipActive]}
                  >
                    <Text
                      style={[
                        styles.catChipText,
                        isSelected && styles.catChipTextActive,
                      ]}
                    >
                      {c.name}
                    </Text>
                  </PressableScale>
                );
              })}
            </View>
          </>
        )}

        {/* How you met Section */}
        <Text style={styles.sectionTitle}>How you met</Text>
        <Card style={styles.formCard}>
          <View style={styles.inputRow}>
            <Text style={styles.inputLabel}>Where</Text>
            <TextInput
              value={where}
              onChangeText={setWhere}
              placeholder="e.g. PlastIndia Expo, Mumbai"
              placeholderTextColor={colors.textMuted}
              style={styles.inputValue}
            />
          </View>
          <View style={styles.divider} />
          <View style={styles.inputRow}>
            <Text style={styles.inputLabel}>Date</Text>
            <TextInput
              value={date}
              onChangeText={setDate}
              placeholder="e.g. 2026-11-06"
              placeholderTextColor={colors.textMuted}
              style={styles.inputValue}
            />
          </View>
        </Card>

        {/* Bottom CTA & Delete */}
        <Button
          title={contactId ? 'Save changes' : 'Create contact'}
          variant="primary"
          size="md"
          onPress={handleSave}
          disabled={isSaving}
          style={styles.saveChangesBtn}
        />

        {contactId && (
          <PressableScale
            onPress={handleDelete}
            haptic="warning"
            style={styles.deleteContactBtn}
          >
            <Text style={styles.deleteContactText}>Delete contact</Text>
          </PressableScale>
        )}

        <View style={{ height: 60 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.background,
    zIndex: 1000,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
  },
  closeBtn: {
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
  },
  saveBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radius.md,
  },
  saveText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.accent,
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  avatarContainer: {
    alignItems: 'center',
    marginVertical: 16,
  },
  formCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.card,
    overflow: 'hidden',
    marginBottom: 20,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    minHeight: 48,
  },
  inputLabel: {
    width: 80,
    fontSize: 14,
    color: colors.textSecondary,
  },
  inputValue: {
    flex: 1,
    fontSize: 14,
    color: colors.text,
    padding: 0,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.divider,
    marginLeft: 16,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 8,
    marginLeft: 4,
  },
  catChipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 20,
  },
  catChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: radius.full,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  catChipActive: {
    backgroundColor: colors.accentTintSoft,
    borderColor: colors.accent,
  },
  catChipText: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  catChipTextActive: {
    color: colors.accent,
    fontWeight: '600',
  },
  saveChangesBtn: {
    marginTop: 8,
    marginBottom: 12,
  },
  deleteContactBtn: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  deleteContactText: {
    fontSize: 14,
    color: colors.danger,
    fontWeight: '500',
  },
});
