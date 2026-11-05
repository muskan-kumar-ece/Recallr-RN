# 05. Data model

Database: Supabase Postgres. The full migration is `docs/sql/0001_init.sql` (copy it to `supabase/migrations/0001_init.sql`). Everything is protected by row level security (RLS). IDs are UUIDs. Times are `timestamptz`.

## Tables
| Table | Purpose | Key columns |
|---|---|---|
| profiles | one row per user | id (= auth user id), full_name, phone, email, avatar_path |
| user_settings | preferences | nudge_days (30), default_reminder_time ('09:00'), snooze_minutes (60), daily_brief_enabled, daily_brief_time ('08:30'), quiet_hours_enabled, quiet_start ('22:00'), quiet_end ('07:00'), reminders_enabled, nudges_enabled, ai_use_notes (true), timezone ('Asia/Kolkata'), onboarding_done |
| entitlements | the plan (server written only) | user_id, plan ('free' or 'pro'), source, expires_at |
| usage_counters | limits tracking (server written only) | user_id, kind ('scan' or 'ai_question'), period_key, count |
| categories | user groups | name (unique per user, ignoring case), icon, color |
| contacts | people | name, role, company, phone, email, address, photo_path, card_image_path, met_where, met_date, tags[], links (jsonb), ai_summary, ai_summary_updated_at, last_contacted_at, source, deleted_at; generated: phone_key (last 10 digits), email_key (lowercase) |
| contact_categories | many to many | contact_id, category_id |
| notes | notes and reminders | contact_id (optional), title, body, remind_at, repeat ('none','daily','weekly','monthly'), done_at, deleted_at |
| documents | attached files | contact_id or note_id, storage_path, name, mime_type, size_bytes |
| cards | user's digital cards | label, slug (unique), name, role, company, tagline, phone, email, website, address, about, accent_color, photo_path, logo_path, socials (jsonb), visibility (jsonb), is_active |
| ai_conversations / ai_messages | chat history | conversation_id, role, content (jsonb) |
| ai_pending_actions | AI proposals awaiting Confirm | kind, payload, status ('pending','confirmed','cancelled','expired'), expires_at |

## Rules
- Soft delete: `contacts.deleted_at` and `notes.deleted_at`. All queries exclude deleted rows. A scheduled job purges rows deleted more than 30 days ago (Phase 8).
- Plan and usage are written only by Edge Functions with the service role. The app can read them, never write.
- A contact counts toward the Free limit when `deleted_at is null`.
- `last_contacted_at` is set when the user taps Call, WhatsApp or Email on a profile, or completes a reminder linked to the contact. Null means use `created_at`.
- Public cards are read only through the RPC `get_public_card(slug)` which returns just the visible fields. The `cards` table has no public read policy.

## Storage buckets
| Bucket | Access | Path |
|---|---|---|
| contact-files | private (owner only) | `{user_id}/photos/...`, `{user_id}/cards/...`, `{user_id}/docs/...` |
| card-assets | public read, owner write | `{user_id}/{card_id}/photo.jpg`, `logo.png` |

## Search
Use `pg_trgm` indexes on contacts (name, company) and notes (title, body) for fast `ilike` search.

## Generated types
After every migration run `supabase gen types typescript` into `src/lib/database.types.ts` and use those types in the app.
