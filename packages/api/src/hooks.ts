import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  fetchContacts,
  fetchContactById,
  createContact,
  updateContact,
  deleteContact,
  restoreContact,
  fetchCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  fetchNotes,
  fetchReminders,
  createNote,
  updateNote,
  completeReminder,
  deleteNote,
  fetchMyCard,
  updateMyCard,
  fetchUserSettings,
  updateUserSettings,
  completeOnboarding,
  fetchEntitlements,
  fetchUsageCounters,
  fetchProfile,
  updateProfile,
  fetchPublicCard,
  askRecallrAI,
  confirmAIAction,
  registerDevicePushToken,
  summarizeContact,
  clearAIConversationHistory,
  scanBusinessCard,
  importContactsBatch,
  mergeContacts,
  uploadStorageFile,
  fetchStorageDownloadUrl,
  fetchContactDocuments,
  fetchContactDocumentById,
  createContactDocument,
  softDeleteContactDocument,
  restoreContactDocument,
  updateContactDocument,
} from './queries';
import { ContactInput, CategoryInput, NoteInput, DigitalCardInput, UserSettingsInput, DocumentInput } from '@recallr/core';

export const queryKeys = {
  contacts: ['contacts'] as const,
  contact: (id: string) => ['contacts', id] as const,
  categories: ['categories'] as const,
  notes: (contactId?: string) => ['notes', { contactId }] as const,
  reminders: ['reminders'] as const,
  myCard: ['myCard'] as const,
  userSettings: ['userSettings'] as const,
  entitlements: ['entitlements'] as const,
  usageCounters: ['usageCounters'] as const,
  profile: (id?: string) => ['profile', id] as const,
  documents: (contactId: string) => ['documents', contactId] as const,
};

// --- Contacts Hooks ---
export function useContacts(options?: { categoryId?: string; query?: string }) {
  return useQuery({
    queryKey: [...queryKeys.contacts, options],
    queryFn: () => fetchContacts(options),
  });
}

export function useContact(id?: string) {
  return useQuery({
    queryKey: queryKeys.contact(id || ''),
    queryFn: () => (id ? fetchContactById(id) : null),
    enabled: !!id,
  });
}

export function useCreateContact() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ input, userId }: { input: ContactInput; userId?: string }) =>
      createContact(input, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.contacts });
      queryClient.invalidateQueries({ queryKey: queryKeys.categories });
    },
  });
}

export function useUpdateContact() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: Partial<ContactInput> }) =>
      updateContact(id, input),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.contacts });
      queryClient.invalidateQueries({ queryKey: queryKeys.contact(id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.categories });
    },
  });
}

export function useDeleteContact() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, soft = true }: { id: string; soft?: boolean }) =>
      deleteContact(id, soft),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.contacts });
      queryClient.invalidateQueries({ queryKey: queryKeys.categories });
    },
  });
}

export function useRestoreContact() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => restoreContact(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.contacts });
      queryClient.invalidateQueries({ queryKey: queryKeys.categories });
    },
  });
}

export function useImportContactsBatch() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (contacts: ContactInput[]) => importContactsBatch(contacts),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.contacts });
      queryClient.invalidateQueries({ queryKey: queryKeys.categories });
    },
  });
}

export function useMergeContacts() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      masterId,
      duplicateId,
      mergedData,
    }: {
      masterId: string;
      duplicateId: string;
      mergedData: Partial<ContactInput>;
    }) => mergeContacts(masterId, duplicateId, mergedData),
    onSuccess: (_, { masterId, duplicateId }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.contacts });
      queryClient.invalidateQueries({ queryKey: queryKeys.contact(masterId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.contact(duplicateId) });
      queryClient.invalidateQueries({ queryKey: ['notes'] });
    },
  });
}

// --- Categories Hooks ---
export function useCategories() {
  return useQuery({
    queryKey: queryKeys.categories,
    queryFn: fetchCategories,
  });
}

export function useCreateCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ input, userId }: { input: CategoryInput; userId?: string }) =>
      createCategory(input, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.categories });
    },
  });
}

export function useUpdateCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: Partial<CategoryInput> }) =>
      updateCategory(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.categories });
    },
  });
}

export function useDeleteCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteCategory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.categories });
      queryClient.invalidateQueries({ queryKey: queryKeys.contacts });
    },
  });
}

// --- Notes & Reminders Hooks ---
export function useNotes(contactId?: string) {
  return useQuery({
    queryKey: queryKeys.notes(contactId),
    queryFn: () => fetchNotes(contactId),
  });
}

export function useReminders() {
  return useQuery({
    queryKey: queryKeys.reminders,
    queryFn: fetchReminders,
  });
}

export function useCreateNote() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ input, userId }: { input: NoteInput; userId?: string }) =>
      createNote(input, userId),
    onSuccess: (_, { input }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.notes(input.contact_id || undefined) });
      if (input.remind_at) {
        queryClient.invalidateQueries({ queryKey: queryKeys.reminders });
      }
    },
  });
}

export function useUpdateNote() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: Partial<NoteInput> }) =>
      updateNote(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes'] });
      queryClient.invalidateQueries({ queryKey: queryKeys.reminders });
    },
  });
}

export function useDeleteNote() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteNote(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes'] });
      queryClient.invalidateQueries({ queryKey: queryKeys.reminders });
    },
  });
}

export function useCompleteReminder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, contactId }: { id: string; contactId?: string | null }) =>
      completeReminder(id, contactId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.reminders });
      queryClient.invalidateQueries({ queryKey: queryKeys.contacts });
    },
  });
}

// --- Digital Cards Hooks ---
export function useMyCard() {
  return useQuery({
    queryKey: queryKeys.myCard,
    queryFn: fetchMyCard,
  });
}

export function useUpdateMyCard() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id?: string; input: Partial<DigitalCardInput> }) =>
      id ? updateMyCard(id, input) : updateMyCard(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.myCard });
    },
  });
}

export function usePublicCard(slug: string) {
  return useQuery({
    queryKey: ['publicCard', slug] as const,
    queryFn: () => fetchPublicCard(slug),
    enabled: !!slug,
  });
}

// --- Settings & Entitlements ---
export function useUserSettings() {
  return useQuery({
    queryKey: queryKeys.userSettings,
    queryFn: fetchUserSettings,
  });
}

export function useUpdateUserSettings() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: Partial<UserSettingsInput>) => updateUserSettings(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.userSettings });
    },
  });
}

export function useCompleteOnboarding() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: completeOnboarding,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.userSettings }),
        queryClient.invalidateQueries({ queryKey: queryKeys.categories }),
      ]);
    },
  });
}

export function useEntitlements() {
  return useQuery({
    queryKey: queryKeys.entitlements,
    queryFn: fetchEntitlements,
  });
}

export function useUsageCounters() {
  return useQuery({
    queryKey: queryKeys.usageCounters,
    queryFn: fetchUsageCounters,
  });
}

export function useProfile(userId?: string) {
  return useQuery({
    queryKey: queryKeys.profile(userId),
    queryFn: () => fetchProfile(userId),
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: { full_name?: string; phone?: string; avatar_path?: string } }) =>
      updateProfile(id, input),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.profile(id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.profile() });
    },
  });
}

// --- AI Hooks ---
export function useAIChat() {
  return useMutation({
    mutationFn: ({ message, conversationId }: { message: string; conversationId?: string }) =>
      askRecallrAI(message, conversationId),
  });
}

export function useConfirmAIAction() {
  return useMutation({
    mutationFn: ({ pendingActionId, decision }: { pendingActionId: string; decision: 'confirm' | 'cancel' | 'undo' }) =>
      confirmAIAction(pendingActionId, decision),
  });
}

export function useRegisterDevicePushToken() {
  return useMutation({ mutationFn: registerDevicePushToken });
}

export function useSummarizeContact() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (contactId: string) => summarizeContact(contactId),
    onSuccess: (_, contactId) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.contact(contactId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.contacts });
    },
  });
}

export function useClearAIConversationHistory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: clearAIConversationHistory,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['aiConversations'] }),
  });
}

export function useScanCard() {
  return useMutation({
    mutationFn: (imagePath: string) => scanBusinessCard(imagePath),
  });
}

export function useUploadFile() {
  return useMutation({
    mutationFn: ({ path, file }: { path: string; file: File | Blob }) =>
      uploadStorageFile(path, file),
  });
}

export function useStorageDownloadUrl(path: string) {
  return useQuery({
    queryKey: ['storageUrl', path],
    queryFn: () => fetchStorageDownloadUrl(path),
    enabled: !!path,
  });
}

export function useContactDocuments(contactId: string) {
  return useQuery({
    queryKey: queryKeys.documents(contactId),
    queryFn: () => fetchContactDocuments(contactId),
    enabled: !!contactId,
  });
}

export function useContactDocument(id: string) {
  return useQuery({
    queryKey: ['document', id] as const,
    queryFn: () => fetchContactDocumentById(id),
    enabled: !!id && id !== 'business-card',
  });
}

export function useCreateContactDocument() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: DocumentInput) => createContactDocument(input),
    onSuccess: (document) => queryClient.invalidateQueries({ queryKey: queryKeys.documents(document.contact_id) }),
  });
}

export function useDeleteContactDocument() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => softDeleteContactDocument(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['documents'] }),
  });
}

export function useRestoreContactDocument() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => restoreContactDocument(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['documents'] }),
  });
}

export function useUpdateContactDocument() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, changes }: { id: string; changes: { name?: string; contact_id?: string } }) => updateContactDocument(id, changes),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['documents'] }),
  });
}
