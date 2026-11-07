import { z } from 'zod';

export const contactLinkSchema = z.object({
  label: z.string().min(1, 'Label is required'),
  url: z.string().url('Invalid URL format'),
});

export const contactInputSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  role: z.string().max(100).optional().nullable(),
  company: z.string().max(100).optional().nullable(),
  phone: z.string().max(30).optional().nullable(),
  email: z.string().email('Invalid email address').optional().nullable().or(z.literal('')),
  address: z.string().max(250).optional().nullable(),
  photo_path: z.string().optional().nullable(),
  card_image_path: z.string().optional().nullable(),
  met_where: z.string().max(100).optional().nullable(),
  met_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date format must be YYYY-MM-DD').optional().nullable(),
  tags: z.array(z.string()).default([]),
  links: z.array(contactLinkSchema).default([]),
  category_ids: z.array(z.string()).default([]),
  last_contacted_at: z.string().datetime().optional().nullable(),
  source: z.enum(['manual', 'scan', 'import', 'qr', 'ai']).default('manual'),
});

export type ContactInput = z.infer<typeof contactInputSchema>;

export const categoryInputSchema = z.object({
  name: z.string().min(1, 'Category name is required').max(30, 'Max 30 characters'),
  icon: z.string().default('folder'),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Must be a 6-character hex color').default('#E8641B'),
});

export type CategoryInput = z.infer<typeof categoryInputSchema>;

export const noteInputSchema = z.object({
  contact_id: z.string().optional().nullable(),
  title: z.string().max(150).optional().nullable(),
  body: z.string().max(5000).optional().nullable(),
  remind_at: z.string().datetime().optional().nullable(),
  repeat: z.enum(['none', 'daily', 'weekly', 'monthly']).default('none'),
}).refine((data) => (data.title && data.title.trim().length > 0) || (data.body && data.body.trim().length > 0), {
  message: 'Note must have either a title or body',
});

export type NoteInput = z.infer<typeof noteInputSchema>;

export const documentInputSchema = z.object({
  contact_id: z.string().min(1).max(128),
  storage_path: z.string().min(1).max(512),
  name: z.string().trim().min(1).max(255),
  mime_type: z.string().min(1).max(120),
  size_bytes: z.number().int().positive().max(25_000_000),
});
export type DocumentInput = z.infer<typeof documentInputSchema>;

export const cardSocialSchema = z.object({
  platform: z.string().min(1),
  url: z.preprocess((val) => {
    if (typeof val === 'string') {
      const trimmed = val.trim();
      if (!trimmed) return trimmed;
      if (!/^https?:\/\//i.test(trimmed)) return `https://${trimmed}`;
      return trimmed;
    }
    return val;
  }, z.string().url('Invalid social link URL')),
});

export const cardVisibilitySchema = z.object({
  phone: z.boolean().default(true),
  email: z.boolean().default(true),
  address: z.boolean().default(false),
  socials: z.boolean().default(true),
});

export const digitalCardInputSchema = z.object({
  label: z.string().min(1).max(50).default('Business'),
  slug: z.preprocess((val) => {
    if (typeof val === 'string') {
      return val.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '').slice(0, 50);
    }
    return val;
  }, z.string().min(3).max(50).regex(/^[a-z0-9-]+$/, 'Slug must be lowercase alphanumeric with hyphens')),
  name: z.string().max(100).optional().nullable(),
  role: z.string().max(100).optional().nullable(),
  company: z.string().max(100).optional().nullable(),
  tagline: z.string().max(150).optional().nullable(),
  phone: z.string().max(30).optional().nullable(),
  email: z.preprocess((val) => {
    if (typeof val === 'string') {
      const trimmed = val.trim();
      return trimmed || null;
    }
    return val;
  }, z.string().email('Invalid email address').optional().nullable()),
  website: z.preprocess((val) => {
    if (typeof val === 'string') {
      const trimmed = val.trim();
      if (!trimmed) return null;
      if (!/^https?:\/\//i.test(trimmed)) return `https://${trimmed}`;
      return trimmed;
    }
    return val;
  }, z.string().url('Invalid website URL').optional().nullable()),
  address: z.string().max(250).optional().nullable(),
  about: z.string().max(1000).optional().nullable(),
  accent_color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).default('#E8641B'),
  photo_path: z.string().optional().nullable(),
  logo_path: z.string().optional().nullable(),
  socials: z.array(cardSocialSchema).default([]),
  visibility: cardVisibilitySchema.default({ phone: true, email: true, address: false, socials: true }),
  is_active: z.boolean().default(true),
});

export type DigitalCardInput = z.infer<typeof digitalCardInputSchema>;

export const userSettingsInputSchema = z.object({
  nudge_days: z.number().int().min(7).max(365).default(30),
  default_reminder_time: z.string().regex(/^\d{2}:\d{2}$/).default('09:00'),
  snooze_minutes: z.union([z.literal(15), z.literal(30), z.literal(60), z.literal(180)]).default(60),
  reminders_enabled: z.boolean().default(true),
  nudges_enabled: z.boolean().default(true),
  daily_brief_enabled: z.boolean().default(true),
  daily_brief_time: z.string().regex(/^\d{2}:\d{2}$/).default('08:30'),
  quiet_hours_enabled: z.boolean().default(true),
  quiet_start: z.string().regex(/^\d{2}:\d{2}$/).default('22:00'),
  quiet_end: z.string().regex(/^\d{2}:\d{2}$/).default('07:00'),
  ai_use_notes: z.boolean().default(true),
  accent_theme: z.enum(['orange', 'indigo', 'teal', 'pink', 'slate']).default('orange'),
  timezone: z.string().default('Asia/Kolkata'),
  onboarding_done: z.boolean().default(false),
});

export type UserSettingsInput = z.infer<typeof userSettingsInputSchema>;

// Firebase Callable Cloud Function Input Schemas
export const firebaseAIChatInputSchema = z.object({
  message: z.string().trim().min(1, 'Enter a message up to 2,000 characters.').max(2000, 'Enter a message up to 2,000 characters.'),
  conversationId: z.string().regex(/^[A-Za-z0-9_-]{1,128}$/).nullish().or(z.literal('')),
});

export const firebaseRegisterPushTokenSchema = z.object({
  token: z.string().trim().min(20).max(4096),
  platform: z.enum(['ios', 'android']),
  enabled: z.boolean().default(true),
});

export const firebaseAIAtomicActionSchema = z.union([
  z.object({ kind: z.literal('propose_create_category'), name: z.string().trim().min(1).max(30), icon: z.string().max(40).optional(), color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional() }),
  z.object({ kind: z.literal('propose_add_contact'), name: z.string().trim().min(1).max(100), role: z.string().max(100).optional(), company: z.string().max(100).optional(), phone: z.string().max(30).optional(), email: z.string().email().optional(), address: z.string().max(250).optional(), met_where: z.string().max(100).optional(), tags: z.array(z.string().max(50)).max(20).optional(), category_names: z.array(z.string().max(30)).max(10).optional() }),
  z.object({ kind: z.literal('propose_update_contact'), contact_id: z.string().min(1).max(128), changes: contactInputSchema.partial() }),
  z.object({ kind: z.literal('propose_add_note'), contact_id: z.string().max(128).optional(), title: z.string().max(150).optional(), body: z.string().max(5000).optional() }).refine((action) => Boolean(action.title?.trim() || action.body?.trim()), 'A note needs a title or body'),
  z.object({ kind: z.literal('propose_set_reminder'), contact_id: z.string().max(128).optional(), title: z.string().trim().min(1).max(150), remind_at: z.string().datetime({ offset: true }), repeat: z.enum(['none', 'daily', 'weekly', 'monthly']).optional() }),
  z.object({ kind: z.literal('propose_move_to_category'), contact_ids: z.array(z.string().min(1).max(128)).min(1).max(20), category_name: z.string().trim().min(1).max(30) }),
  z.object({ kind: z.literal('propose_delete'), target_kind: z.enum(['contact', 'note', 'category']), id: z.string().min(1).max(128) }),
]);
export type FirebaseAIAtomicAction = z.infer<typeof firebaseAIAtomicActionSchema>;
export const firebaseAIActionProposalSchema = z.union([
  firebaseAIAtomicActionSchema,
  z.object({
    kind: z.literal('propose_batch'),
    actions: z.array(firebaseAIAtomicActionSchema).min(2).max(10),
  }),
]);
export type FirebaseAIActionProposal = z.infer<typeof firebaseAIActionProposalSchema>;

export const firebaseScanCardInputSchema = z.object({
  storagePath: z.string().min(1).max(256)
    .regex(/^users\/[A-Za-z0-9_-]{1,128}\/cards\/[A-Za-z0-9._-]{1,120}$/),
});

export const firebasePublicCardInputSchema = z.object({
  slug: z.string().trim().min(1).max(80).regex(/^[a-zA-Z0-9-]+$/),
});

export const firebaseScanCardOutputSchema = z.object({
  name: z.string().max(200).nullable().default(null),
  role: z.string().max(200).nullable().default(null),
  company: z.string().max(200).nullable().default(null),
  phone: z.string().max(80).nullable().default(null),
  email: z.preprocess((val) => {
    if (typeof val === 'string') {
      const trimmed = val.trim();
      if (!trimmed) return null;
      const isValid = z.string().email().safeParse(trimmed).success;
      return isValid ? trimmed : null;
    }
    return null;
  }, z.string().email().nullable().default(null)),
  address: z.string().max(500).nullable().default(null),
  website: z.preprocess((val) => {
    if (typeof val === 'string') {
      const trimmed = val.trim();
      if (!trimmed) return null;
      const url = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
      return z.string().url().safeParse(url).success ? url : null;
    }
    return null;
  }, z.string().url().nullable().default(null)),
  tags: z.array(z.string().max(80)).max(20).default([]),
  confidence: z.record(z.string(), z.number().min(0).max(1)),
});
export type FirebaseScanCardOutput = z.infer<typeof firebaseScanCardOutputSchema>;

export const firebasePaymentInputSchema = z.object({
  razorpay_order_id: z.string().min(1).max(100),
  razorpay_payment_id: z.string().min(1).max(100),
  razorpay_signature: z.string().regex(/^[a-f0-9]{64}$/i),
  plan: z.enum(['pro_monthly', 'pro_yearly']),
});
