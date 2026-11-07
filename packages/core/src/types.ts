export type PlanType = 'free' | 'pro';

export type ContactSource = 'manual' | 'scan' | 'import' | 'qr' | 'ai';

export interface ContactLink {
  label: string;
  url: string;
}

export interface Contact {
  id: string;
  user_id: string;
  name: string;
  role?: string | null;
  company?: string | null;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
  photo_path?: string | null;
  card_image_path?: string | null;
  met_where?: string | null;
  met_date?: string | null; // YYYY-MM-DD
  tags: string[];
  links: ContactLink[];
  ai_summary?: string | null;
  ai_summary_updated_at?: string | null;
  last_contacted_at?: string | null;
  source: ContactSource;
  deleted_at?: string | null;
  created_at: string;
  updated_at: string;
  phone_key?: string;
  email_key?: string;
  category_ids?: string[];
  categories?: Category[];
}

export interface Category {
  id: string;
  user_id: string;
  name: string;
  icon: string;
  color: string;
  created_at: string;
  count?: number;
}

export type ReminderRepeat = 'none' | 'daily' | 'weekly' | 'monthly';

export interface Note {
  id: string;
  user_id: string;
  contact_id?: string | null;
  title?: string | null;
  body?: string | null;
  remind_at?: string | null;
  repeat: ReminderRepeat;
  done_at?: string | null;
  deleted_at?: string | null;
  created_at: string;
  updated_at: string;
  contact?: Partial<Contact> | null;
}

export interface UserDocument {
  id: string;
  user_id: string;
  contact_id: string;
  storage_path: string;
  download_url?: string;
  name: string;
  mime_type: string;
  size_bytes: number;
  created_at: string;
  deleted_at?: string | null;
}

export interface DocumentAttachment {
  id: string;
  user_id: string;
  contact_id?: string | null;
  note_id?: string | null;
  storage_path: string;
  name: string;
  mime_type?: string | null;
  size_bytes?: number | null;
  created_at: string;
}

export interface CardSocial {
  platform: string; // 'linkedin' | 'x' | 'instagram' | 'github' | 'website'
  url: string;
}

export interface CardVisibility {
  phone: boolean;
  email: boolean;
  address: boolean;
  socials: boolean;
}

export interface DigitalCard {
  id: string;
  user_id: string;
  label: string;
  slug: string;
  name?: string | null;
  role?: string | null;
  company?: string | null;
  tagline?: string | null;
  phone?: string | null;
  email?: string | null;
  website?: string | null;
  address?: string | null;
  about?: string | null;
  accent_color: string;
  photo_path?: string | null;
  logo_path?: string | null;
  socials: CardSocial[];
  visibility: CardVisibility;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserProfile {
  id: string;
  full_name?: string | null;
  phone?: string | null;
  email?: string | null;
  avatar_path?: string | null;
  created_at: string;
  updated_at: string;
}

export interface UserSettings {
  user_id: string;
  nudge_days: number;
  default_reminder_time: string; // 'HH:mm'
  snooze_minutes: number;
  reminders_enabled: boolean;
  nudges_enabled: boolean;
  daily_brief_enabled: boolean;
  daily_brief_time: string; // 'HH:mm'
  quiet_hours_enabled: boolean;
  quiet_start: string; // 'HH:mm'
  quiet_end: string; // 'HH:mm'
  ai_use_notes: boolean;
  accent_theme: 'orange' | 'indigo' | 'teal' | 'pink' | 'slate';
  timezone: string;
  onboarding_done: boolean;
  updated_at: string;
}

export interface Entitlement {
  user_id: string;
  plan: PlanType;
  source?: string | null;
  expires_at?: string | null;
  updated_at: string;
}

export interface UsageCounter {
  user_id: string;
  kind: 'scan' | 'ai_question';
  period_key: string;
  count: number;
}

export interface AIConversation {
  id: string;
  user_id: string;
  title?: string | null;
  created_at: string;
}

export interface AIMessage {
  id: string;
  conversation_id: string;
  user_id: string;
  role: 'user' | 'assistant' | 'tool';
  content: AIResponseContent | Record<string, unknown>;
  created_at: string;
}

export type AIPendingActionStatus = 'pending' | 'confirmed' | 'cancelled' | 'expired';

export interface AIPendingAction {
  id: string;
  user_id: string;
  conversation_id?: string | null;
  kind: string;
  payload: Record<string, unknown>;
  status: AIPendingActionStatus;
  result?: Record<string, unknown> | null;
  created_at: string;
  expires_at: string;
}

// AI Message Block Types
export type AIBlock =
  | { type: 'text'; text: string }
  | { type: 'person_cards'; contact_ids: string[] }
  | { type: 'sources'; text: string }
  | { type: 'chips'; items: string[] }
  | { type: 'question'; text: string; quick_replies?: string[] }
  | {
      type: 'confirm';
      pending_action_id: string;
      title: string;
      rows: Array<{ label: string; value: string; new?: boolean }>;
      destructive?: boolean;
    };

export interface AIResponseContent {
  blocks: AIBlock[];
}
