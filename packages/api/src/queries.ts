import {
  getFirebaseAuth,
  getFirebaseApp,
  getFirebaseDb,
  getFirebaseStorage,
  getFirebaseFunctions,
} from './firebase';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  limit,
  writeBatch,
} from 'firebase/firestore';
import { ref, getDownloadURL } from 'firebase/storage';
import { httpsCallable } from 'firebase/functions';
import {
  Contact,
  Category,
  Note,
  DigitalCard,
  UserProfile,
  UserSettings,
  Entitlement,
  UsageCounter,
  ContactInput,
  CategoryInput,
  NoteInput,
  DigitalCardInput,
  UserSettingsInput,
  AIResponseContent,
  FirebaseScanCardOutput,
  DocumentInput,
  UserDocument,
} from '@recallr/core';
import { categoryInputSchema, documentInputSchema } from '@recallr/core';

export function getCurrentUserId(): string {
  const auth = getFirebaseAuth();
  const uid = auth.currentUser?.uid;
  if (!uid) {
    throw new Error('Unauthenticated');
  }
  return uid;
}

// --- Contacts ---
export async function fetchContacts(options?: {
  categoryId?: string;
  query?: string;
  limit?: number;
}): Promise<Contact[]> {
  const uid = getCurrentUserId();
  const db = getFirebaseDb();

  const q = query(collection(db, 'contacts'), where('user_id', '==', uid));
  const snapshot = await getDocs(q);

  let contacts: Contact[] = [];
  snapshot.forEach((docSnap) => {
    const data = docSnap.data();
    if (!data.deleted_at) {
      contacts.push({
        id: docSnap.id,
        user_id: data.user_id,
        name: data.name || '',
        role: data.role || null,
        company: data.company || null,
        phone: data.phone || null,
        email: data.email || null,
        address: data.address || null,
        photo_path: data.photo_path || null,
        card_image_path: data.card_image_path || null,
        met_where: data.met_where || null,
        met_date: data.met_date || null,
        tags: Array.isArray(data.tags) ? data.tags : [],
        links: Array.isArray(data.links) ? data.links : [],
        category_ids: Array.isArray(data.category_ids) ? data.category_ids : [],
        ai_summary: data.ai_summary || null,
        ai_summary_updated_at: data.ai_summary_updated_at || null,
        last_contacted_at: data.last_contacted_at || null,
        source: data.source || 'manual',
        deleted_at: data.deleted_at || null,
        created_at: data.created_at || new Date().toISOString(),
        updated_at: data.updated_at || new Date().toISOString(),
      });
    }
  });

  contacts.sort((a, b) => (a.name || '').localeCompare(b.name || ''));

  if (options?.query) {
    const normalize = (value: string) => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase();
    const lowerQ = normalize(options.query);
    contacts = contacts.filter(
      (c) =>
        normalize(c.name).includes(lowerQ) ||
        (c.company && normalize(c.company).includes(lowerQ)) ||
        (c.role && normalize(c.role).includes(lowerQ)) ||
        (c.phone && c.phone.includes(lowerQ)) ||
        (c.email && normalize(c.email).includes(lowerQ)) ||
        (c.met_where && normalize(c.met_where).includes(lowerQ)) ||
        c.tags.some((tag) => normalize(tag).includes(lowerQ))
    );
  }

  if (options?.categoryId) {
    contacts = contacts.filter((c) => c.category_ids?.includes(options.categoryId!));
  }

  if (options?.limit) {
    contacts = contacts.slice(0, options.limit);
  }

  return contacts;
}

export async function fetchContactById(id: string): Promise<Contact | null> {
  const db = getFirebaseDb();
  const docRef = doc(db, 'contacts', id);
  const snap = await getDoc(docRef);

  if (!snap.exists()) return null;
  const data = snap.data();
  if (data.deleted_at) return null;

  return {
    id: snap.id,
    user_id: data.user_id,
    name: data.name || '',
    role: data.role || null,
    company: data.company || null,
    phone: data.phone || null,
    email: data.email || null,
    address: data.address || null,
    photo_path: data.photo_path || null,
    card_image_path: data.card_image_path || null,
    met_where: data.met_where || null,
    met_date: data.met_date || null,
    tags: Array.isArray(data.tags) ? data.tags : [],
    links: Array.isArray(data.links) ? data.links : [],
    category_ids: Array.isArray(data.category_ids) ? data.category_ids : [],
    ai_summary: data.ai_summary || null,
    ai_summary_updated_at: data.ai_summary_updated_at || null,
    last_contacted_at: data.last_contacted_at || null,
    source: data.source || 'manual',
    deleted_at: data.deleted_at || null,
    created_at: data.created_at || new Date().toISOString(),
    updated_at: data.updated_at || new Date().toISOString(),
  };
}

export async function createContact(input: ContactInput, userId?: string): Promise<Contact> {
  const currentUid = getCurrentUserId();
  if (userId && userId !== currentUid) throw new Error('Cannot create a contact for another account.');
  const createContactCallable = httpsCallable<ContactInput, Contact>(getFirebaseFunctions(), 'createContact');
  const result = await createContactCallable(input);
  return result.data;
}

export async function updateContact(id: string, input: Partial<ContactInput>): Promise<Contact> {
  const db = getFirebaseDb();
  const docRef = doc(db, 'contacts', id);
  const now = new Date().toISOString();

  await updateDoc(docRef, {
    ...input,
    updated_at: now,
  });

  const snap = await getDoc(docRef);
  const data = snap.data() || {};
  return { id: snap.id, ...data } as Contact;
}

export async function deleteContact(id: string, soft: boolean = true): Promise<void> {
  const db = getFirebaseDb();
  const docRef = doc(db, 'contacts', id);
  if (soft) {
    await updateDoc(docRef, { deleted_at: new Date().toISOString() });
  } else {
    await deleteDoc(docRef);
  }
}

export async function restoreContact(id: string): Promise<void> {
  const db = getFirebaseDb();
  const docRef = doc(db, 'contacts', id);
  await updateDoc(docRef, { deleted_at: null });
}

// --- Categories ---
export async function fetchCategories(): Promise<Category[]> {
  const uid = getCurrentUserId();
  const db = getFirebaseDb();
  const q = query(collection(db, 'categories'), where('user_id', '==', uid));
  const snap = await getDocs(q);

  const categories: Category[] = [];
  snap.forEach((d) => {
    const data = d.data();
    categories.push({
      id: d.id,
      user_id: data.user_id,
      name: data.name,
      icon: data.icon || 'folder',
      color: data.color || '#E8641B',
      created_at: data.created_at || new Date().toISOString(),
    });
  });

  // Calculate contact counts
  const contactsQ = query(collection(db, 'contacts'), where('user_id', '==', uid));
  const contactsSnap = await getDocs(contactsQ);
  const counts: Record<string, number> = {};

  contactsSnap.forEach((c) => {
    const cData = c.data();
    if (!cData.deleted_at && Array.isArray(cData.category_ids)) {
      cData.category_ids.forEach((catId: string) => {
        counts[catId] = (counts[catId] || 0) + 1;
      });
    }
  });

  return categories.map((cat) => ({
    ...cat,
    count: counts[cat.id] || 0,
  }));
}

export async function createCategory(input: CategoryInput, userId?: string): Promise<Category> {
  const uid = userId || getCurrentUserId();
  const db = getFirebaseDb();
  const colRef = collection(db, 'categories');
  const newDocRef = doc(colRef);
  const now = new Date().toISOString();

  const newCat: Category = {
    id: newDocRef.id,
    user_id: uid,
    name: input.name,
    icon: input.icon || 'folder',
    color: input.color || '#E8641B',
    created_at: now,
    count: 0,
  };

  await setDoc(newDocRef, { ...newCat, userId: uid });
  return newCat;
}

export async function updateCategory(id: string, input: Partial<CategoryInput>): Promise<Category> {
  const db = getFirebaseDb();
  const docRef = doc(db, 'categories', id);
  await updateDoc(docRef, { ...input });
  const snap = await getDoc(docRef);
  return { id: snap.id, ...snap.data() } as Category;
}

export async function deleteCategory(id: string): Promise<void> {
  const db = getFirebaseDb();
  await deleteDoc(doc(db, 'categories', id));
}

// --- Notes & Reminders ---
export async function fetchNotes(contactId?: string): Promise<Note[]> {
  const uid = getCurrentUserId();
  const db = getFirebaseDb();
  const q = query(collection(db, 'notes'), where('user_id', '==', uid));
  const snap = await getDocs(q);

  const notes: Note[] = [];
  snap.forEach((d) => {
    const data = d.data();
    if (!data.deleted_at) {
      if (!contactId || data.contact_id === contactId) {
        notes.push({ id: d.id, ...data } as Note);
      }
    }
  });

  return notes.sort((a, b) => (b.created_at || '').localeCompare(a.created_at || ''));
}

export async function fetchReminders(): Promise<Note[]> {
  const uid = getCurrentUserId();
  const db = getFirebaseDb();
  const q = query(collection(db, 'notes'), where('user_id', '==', uid));
  const snap = await getDocs(q);

  const reminders: Note[] = [];
  const pushStateUpdates = snap.docs.filter((d) => {
    const data = d.data();
    return !data.deleted_at && data.remind_at && !data.done_at && data.push_sent_at === undefined;
  }).map((d) => updateDoc(d.ref, { push_sent_at: null }));
  await Promise.all(pushStateUpdates);
  snap.forEach((d) => {
    const data = d.data();
    if (!data.deleted_at && data.remind_at && !data.done_at) {
      reminders.push({ id: d.id, ...data } as Note);
    }
  });

  return reminders.sort((a, b) => (a.remind_at || '').localeCompare(b.remind_at || ''));
}

export async function createNote(input: NoteInput, userId?: string): Promise<Note> {
  const uid = userId || getCurrentUserId();
  const db = getFirebaseDb();
  const colRef = collection(db, 'notes');
  const newDocRef = doc(colRef);
  const now = new Date().toISOString();

  const newNote: Note = {
    id: newDocRef.id,
    user_id: uid,
    contact_id: input.contact_id || null,
    title: input.title || null,
    body: input.body || null,
    remind_at: input.remind_at || null,
    repeat: input.repeat || 'none',
    done_at: null,
    deleted_at: null,
    created_at: now,
    updated_at: now,
  };

  await setDoc(newDocRef, { ...newNote, userId: uid, push_sent_at: null, push_claimed_at: null });
  return newNote;
}

export async function updateNote(id: string, input: Partial<NoteInput>): Promise<Note> {
  const db = getFirebaseDb();
  const docRef = doc(db, 'notes', id);
  await updateDoc(docRef, {
    ...input,
    ...('remind_at' in input ? { push_sent_at: null, push_claimed_at: null } : {}),
    updated_at: new Date().toISOString(),
  });
  const snap = await getDoc(docRef);
  return { id: snap.id, ...snap.data() } as Note;
}

export async function completeReminder(id: string, _contactId?: string | null): Promise<void> {
  const db = getFirebaseDb();
  await updateDoc(doc(db, 'notes', id), { done_at: new Date().toISOString() });
}

export async function deleteNote(id: string): Promise<void> {
  const db = getFirebaseDb();
  await deleteDoc(doc(db, 'notes', id));
}

// --- Digital Cards ---
export async function fetchMyCard(): Promise<DigitalCard | null> {
  const uid = getCurrentUserId();
  const db = getFirebaseDb();
  const q = query(collection(db, 'cards'), where('user_id', '==', uid), limit(1));
  const snap = await getDocs(q);
  if (snap.empty) return null;
  const d = snap.docs[0];
  if (!d) return null;
  return { id: d.id, ...d.data() } as DigitalCard;
}

export async function fetchPublicCard(slug: string): Promise<DigitalCard | null> {
  const fn = httpsCallable<{ slug: string }, { card: DigitalCard | null }>(getFirebaseFunctions(), 'getPublicCard');
  const response = await fn({ slug });
  return response.data.card;
}

export async function updateMyCard(
  idOrInput: string | Partial<DigitalCardInput>,
  maybeInput?: Partial<DigitalCardInput>
): Promise<DigitalCard> {
  const input: Partial<DigitalCardInput> = typeof idOrInput === 'string' ? (maybeInput || {}) : idOrInput;
  const existing = await fetchMyCard();
  const requestedId = typeof idOrInput === 'string' ? idOrInput : undefined;
  const id = requestedId || existing?.id;
  const saveCard = httpsCallable<{ id?: string; input: Partial<DigitalCardInput> }, DigitalCard>(getFirebaseFunctions(), 'saveDigitalCard');
  const response = await saveCard({ ...(id ? { id } : {}), input });
  return response.data;
}

// --- Settings, Profile & Entitlements ---
export async function fetchUserSettings(): Promise<UserSettings | null> {
  const uid = getCurrentUserId();
  const db = getFirebaseDb();
  const snap = await getDoc(doc(db, 'user_settings', uid));
  if (!snap.exists()) return null;
  return snap.data() as UserSettings;
}

export async function updateUserSettings(input: Partial<UserSettingsInput>): Promise<UserSettings> {
  const uid = getCurrentUserId();
  const db = getFirebaseDb();
  const docRef = doc(db, 'user_settings', uid);
  await setDoc(
    docRef,
    { ...input, user_id: uid, userId: uid, updated_at: new Date().toISOString() },
    { merge: true }
  );
  const snap = await getDoc(docRef);
  return snap.data() as UserSettings;
}

export async function completeOnboarding(categories: CategoryInput[]): Promise<void> {
  const uid = getCurrentUserId();
  const parsedCategories = categories.map((category) => categoryInputSchema.parse(category));
  const db = getFirebaseDb();
  const settingsRef = doc(db, 'user_settings', uid);
  const categoriesQuery = query(collection(db, 'categories'), where('user_id', '==', uid));

  const currentCategories = await getDocs(categoriesQuery);
  const names = new Set(currentCategories.docs.map((item) => String(item.data().name || '').trim().toLowerCase()));
  const batch = writeBatch(db);
  const now = new Date().toISOString();
  for (const category of parsedCategories) {
    const nameKey = category.name.trim().toLowerCase();
    if (names.has(nameKey)) continue;
    const slug = nameKey.normalize('NFKD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 40) || 'category';
    const categoryRef = doc(db, 'categories', `${uid}_onboarding_${slug}`);
    batch.set(categoryRef, {
      id: categoryRef.id,
      user_id: uid,
      userId: uid,
      name: category.name.trim(),
      icon: category.icon,
      color: category.color,
      created_at: now,
    }, { merge: true });
    names.add(nameKey);
  }
  batch.set(settingsRef, {
    user_id: uid,
    userId: uid,
    onboarding_done: true,
    updated_at: now,
  }, { merge: true });
  await batch.commit();
}

export async function fetchEntitlements(): Promise<Entitlement | null> {
  const uid = getCurrentUserId();
  const db = getFirebaseDb();
  const snap = await getDoc(doc(db, 'entitlements', uid));
  if (!snap.exists()) {
    return {
      user_id: uid,
      plan: 'free',
      source: 'default',
      expires_at: null,
      updated_at: new Date().toISOString(),
    };
  }
  return snap.data() as Entitlement;
}

export async function fetchUsageCounters(): Promise<UsageCounter[]> {
  const uid = getCurrentUserId();
  const db = getFirebaseDb();
  const q = query(collection(db, 'usage_counters'), where('user_id', '==', uid));
  const snap = await getDocs(q);
  const counters: UsageCounter[] = [];
  snap.forEach((d) => counters.push(d.data() as UsageCounter));
  return counters;
}

export async function fetchProfile(id?: string): Promise<UserProfile | null> {
  const uid = id || getCurrentUserId();
  const db = getFirebaseDb();
  const snap = await getDoc(doc(db, 'profiles', uid));
  if (!snap.exists()) return null;
  return snap.data() as UserProfile;
}

export async function updateProfile(
  idOrInput: string | { full_name?: string; phone?: string; avatar_path?: string },
  maybeInput?: { full_name?: string; phone?: string; avatar_path?: string }
): Promise<UserProfile> {
  const input = typeof idOrInput === 'string' ? (maybeInput || {}) : idOrInput;
  const uid = typeof idOrInput === 'string' ? idOrInput : getCurrentUserId();
  const db = getFirebaseDb();
  const docRef = doc(db, 'profiles', uid);
  await setDoc(docRef, { ...input, user_id: uid, updated_at: new Date().toISOString() }, { merge: true });
  const snap = await getDoc(docRef);
  return snap.data() as UserProfile;
}

// --- Razorpay Payments ---
export async function createRazorpayOrder(plan: 'pro_monthly' | 'pro_yearly'): Promise<{
  orderId: string;
  amount: number;
  currency: string;
  keyId: string;
}> {
  const fn = httpsCallable<
    { plan: string },
    { orderId: string; amount: number; currency: string; keyId: string }
  >(getFirebaseFunctions(), 'createRazorpayOrder');
  const response = await fn({ plan });
  return response.data;
}

export async function verifyRazorpayPayment(payload: {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
  plan: 'pro_monthly' | 'pro_yearly';
}): Promise<{ ok: boolean; plan: string; expiresAt: string }> {
  const fn = httpsCallable<typeof payload, { ok: boolean; plan: string; expiresAt: string }>(
    getFirebaseFunctions(),
    'verifyRazorpayPayment'
  );
  const response = await fn(payload);
  return response.data;
}

// --- AI Cloud Operations ---
export async function askRecallrAI(
  messageOrInput: string | { message: string; conversationId?: string },
  maybeConvId?: string
): Promise<{
  conversationId: string;
  messageId: string;
  response: AIResponseContent;
}> {
  const message = typeof messageOrInput === 'string' ? messageOrInput : messageOrInput.message;
  const rawConvId = typeof messageOrInput === 'string' ? maybeConvId : messageOrInput.conversationId;
  const conversationId = (rawConvId && rawConvId.trim()) ? rawConvId.trim() : undefined;
  const fn = httpsCallable<
    { message: string; conversationId?: string },
    { conversationId: string; messageId: string; response: AIResponseContent }
  >(getFirebaseFunctions(), 'aiChat');
  const payload = conversationId ? { message, conversationId } : { message };
  const response = await fn(payload);
  return response.data;
}

export async function confirmAIAction(
  actionIdOrInput: string | { actionId: string; action: unknown },
  maybeDecision?: unknown
): Promise<{ ok: boolean }> {
  const pendingActionId = typeof actionIdOrInput === 'string' ? actionIdOrInput : actionIdOrInput.actionId;
  const decision = typeof actionIdOrInput === 'string' ? maybeDecision : actionIdOrInput.action;
  const fn = httpsCallable<{ pendingActionId: string; decision: string }, { ok: boolean }>(
    getFirebaseFunctions(),
    'aiConfirm'
  );
  const response = await fn({ pendingActionId, decision: String(decision) });
  return response.data;
}

export async function registerDevicePushToken(input: { token: string; platform: 'ios' | 'android'; enabled: boolean }): Promise<void> {
  const fn = httpsCallable<typeof input, { ok: boolean }>(getFirebaseFunctions(), 'registerDevicePushToken');
  await fn(input);
}

export async function summarizeContact(contactId: string): Promise<{ summary: string }> {
  const fn = httpsCallable<{ contactId: string }, { summary: string }>(
    getFirebaseFunctions(),
    'summarizeContact'
  );
  const response = await fn({ contactId });
  return response.data;
}

export async function clearAIConversationHistory(): Promise<void> {
  const uid = getCurrentUserId();
  const db = getFirebaseDb();
  const conversations = await getDocs(query(
    collection(db, 'ai_conversations'),
    where('user_id', '==', uid)
  ));
  for (const conversation of conversations.docs) {
    const messages = await getDocs(collection(db, 'ai_conversations', conversation.id, 'messages'));
    for (let offset = 0; offset < messages.docs.length; offset += 450) {
      const batch = writeBatch(db);
      messages.docs.slice(offset, offset + 450).forEach((message) => batch.delete(message.ref));
      await batch.commit();
    }
    await deleteDoc(conversation.ref);
  }
}

export async function scanBusinessCard(storagePath: string): Promise<FirebaseScanCardOutput> {
  const fn = httpsCallable<{ storagePath: string }, FirebaseScanCardOutput>(
    getFirebaseFunctions(),
    'scanCard'
  );
  const response = await fn({ storagePath });
  return response.data;
}

// --- Batch Import & Contact Merging ---

export async function importContactsBatch(contacts: ContactInput[]): Promise<{ count: number }> {
  getCurrentUserId();
  const createContactsCallable = httpsCallable<{ contacts: ContactInput[] }, { count: number }>(
    getFirebaseFunctions(),
    'createContactsBatch'
  );
  const result = await createContactsCallable({ contacts });
  return result.data;
}

export async function mergeContacts(
  masterId: string,
  duplicateId: string,
  mergedData: Partial<ContactInput>
): Promise<void> {
  const uid = getCurrentUserId();
  const db = getFirebaseDb();
  const batch = writeBatch(db);
  const now = new Date().toISOString();

  // 1. Update master contact
  const masterRef = doc(db, 'contacts', masterId);
  batch.update(masterRef, {
    ...mergedData,
    updated_at: now,
  });

  // 2. Soft-delete duplicate contact
  const duplicateRef = doc(db, 'contacts', duplicateId);
  batch.update(duplicateRef, {
    deleted_at: now,
  });

  // 3. Move duplicate's notes to master
  const notesQ = query(
    collection(db, 'notes'),
    where('user_id', '==', uid),
    where('contact_id', '==', duplicateId)
  );
  const notesSnap = await getDocs(notesQ);
  notesSnap.forEach((d) => {
    batch.update(d.ref, { contact_id: masterId });
  });

  await batch.commit();
}

// --- Firebase Storage File Upload ---

export async function uploadStorageFile(
  path: string,
  fileOrBlob: Blob | File
): Promise<string> {
  const user = getFirebaseAuth().currentUser;
  const projectId = getFirebaseApp().options.projectId;
  if (!user || !projectId) throw new Error('Sign in before uploading a file.');
  const idToken = await user.getIdToken();
  const response = await fetch(`https://us-central1-${projectId}.cloudfunctions.net/uploadUserFile`, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${idToken}`,
      'Content-Type': fileOrBlob.type || 'application/octet-stream',
      'X-Recallr-Storage-Path': encodeURIComponent(path),
    },
    body: fileOrBlob,
  });
  if (!response.ok) {
    if (response.status === 413) throw new Error('Your storage limit has been reached. Remove files or upgrade your plan.');
    if (response.status === 409) throw new Error('A file already exists at this path. Try again.');
    throw new Error('File upload failed. Check your connection and try again.');
  }
  return path;
}

export async function fetchStorageDownloadUrl(path: string): Promise<string> {
  if (/^https:\/\//i.test(path)) return path;
  return getDownloadURL(ref(getFirebaseStorage(), path));
}

export async function migrateLegacyStoragePaths(): Promise<void> {
  const migrate = httpsCallable<undefined, { migrated: number }>(getFirebaseFunctions(), 'migrateLegacyStoragePaths');
  await migrate(undefined);
}

export async function deleteStorageFile(path: string): Promise<void> {
  const remove = httpsCallable<{ path: string }, { deleted: boolean }>(getFirebaseFunctions(), 'deleteUserFile');
  await remove({ path });
}

export async function fetchContactDocuments(contactId: string): Promise<UserDocument[]> {
  const uid = getCurrentUserId();
  const snapshot = await getDocs(query(
    collection(getFirebaseDb(), 'documents'),
    where('user_id', '==', uid),
    where('contact_id', '==', contactId)
  ));
  return snapshot.docs
    .map((item) => ({ id: item.id, ...item.data() }) as UserDocument)
    .filter((item) => !item.deleted_at)
    .sort((left, right) => right.created_at.localeCompare(left.created_at));
}

export async function fetchContactDocumentById(id: string): Promise<UserDocument | null> {
  const uid = getCurrentUserId();
  const documentRef = doc(getFirebaseDb(), 'documents', id);
  const snapshot = await getDoc(documentRef);
  if (!snapshot.exists() || (snapshot.data().user_id ?? snapshot.data().userId) !== uid || snapshot.data().deleted_at) return null;
  const data = snapshot.data() as Omit<UserDocument, 'id' | 'download_url'> & { download_url?: string };
  // Download URLs contain bearer tokens. Resolve them only for the current owner at display time.
  const downloadUrl = await getDownloadURL(ref(getFirebaseStorage(), data.storage_path));
  return { id: snapshot.id, ...data, download_url: downloadUrl };
}

export async function createContactDocument(input: DocumentInput): Promise<UserDocument> {
  const parsed = documentInputSchema.safeParse(input);
  if (!parsed.success) throw new Error('Check the document details and try again.');
  const uid = getCurrentUserId();
  if (!parsed.data.storage_path.startsWith(`users/${uid}/documents/`)) {
    throw new Error('Document storage path must belong to your account.');
  }
  const db = getFirebaseDb();
  const contact = await getDoc(doc(db, 'contacts', parsed.data.contact_id));
  if (!contact.exists() || (contact.data().user_id ?? contact.data().userId) !== uid) {
    throw new Error('Contact not found.');
  }
  const now = new Date().toISOString();
  const documentRef = doc(collection(db, 'documents'));
  const storageRef = ref(getFirebaseStorage(), parsed.data.storage_path);
  const downloadUrl = await getDownloadURL(storageRef);
  const value: UserDocument = {
    id: documentRef.id,
    user_id: uid,
    ...parsed.data,
    download_url: downloadUrl,
    created_at: now,
    deleted_at: null,
  };
  const storedValue = {
    id: value.id,
    user_id: value.user_id,
    ...parsed.data,
    created_at: value.created_at,
    deleted_at: value.deleted_at,
  };
  await setDoc(documentRef, { ...storedValue, userId: uid });
  return value;
}

export async function softDeleteContactDocument(id: string): Promise<void> {
  const uid = getCurrentUserId();
  const documentRef = doc(getFirebaseDb(), 'documents', id);
  const snapshot = await getDoc(documentRef);
  if (!snapshot.exists() || (snapshot.data().user_id ?? snapshot.data().userId) !== uid) {
    throw new Error('Document not found.');
  }
  await updateDoc(documentRef, { deleted_at: new Date().toISOString() });
}

export async function restoreContactDocument(id: string): Promise<void> {
  const uid = getCurrentUserId();
  const documentRef = doc(getFirebaseDb(), 'documents', id);
  const snapshot = await getDoc(documentRef);
  if (!snapshot.exists() || (snapshot.data().user_id ?? snapshot.data().userId) !== uid) {
    throw new Error('Document not found.');
  }
  await updateDoc(documentRef, { deleted_at: null });
}

export async function updateContactDocument(id: string, changes: { name?: string; contact_id?: string }): Promise<void> {
  const uid = getCurrentUserId();
  const documentRef = doc(getFirebaseDb(), 'documents', id);
  const snapshot = await getDoc(documentRef);
  if (!snapshot.exists() || (snapshot.data().user_id ?? snapshot.data().userId) !== uid || snapshot.data().deleted_at) {
    throw new Error('Document not found.');
  }
  if (changes.name !== undefined && (!changes.name.trim() || changes.name.length > 255)) throw new Error('Enter a valid document name.');
  if (changes.contact_id) {
    const contactSnapshot = await getDoc(doc(getFirebaseDb(), 'contacts', changes.contact_id));
    if (!contactSnapshot.exists() || (contactSnapshot.data().user_id ?? contactSnapshot.data().userId) !== uid) throw new Error('Contact not found.');
  }
  await updateDoc(documentRef, changes);
}
