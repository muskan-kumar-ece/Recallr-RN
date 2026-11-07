# 05. Data model (Firebase Backend)

Database: **Google Cloud Firestore** (project `recallr-72d38`).
Security Rules: `firestore.rules` (emulator validation required before deployment).
Storage Rules: `storage.rules` (owner private access and public card assets).

All data is partitioned by authenticated user identifier (`request.auth.uid`), matching both snake_case `user_id` and camelCase `userId` in document schemas for total interoperability.

## Collections & Documents

| Collection | Document ID | Purpose | Key fields |
|---|---|---|---|
| `profiles` | `{userId}` | User profile | `id`, `user_id`, `full_name`, `phone`, `email`, `avatar_path`, `created_at`, `updated_at` |
| `user_settings` | `{userId}` | User preferences | `user_id`, `nudge_days` (30), `default_reminder_time` ('09:00'), `snooze_minutes` (60), `daily_brief_enabled`, `daily_brief_time` ('08:30'), `quiet_hours_enabled`, `quiet_start` ('22:00'), `quiet_end` ('07:00'), `reminders_enabled`, `nudges_enabled`, `ai_use_notes` (true), `accent_theme` ('orange' | 'indigo' | 'teal' | 'pink' | 'slate'), `timezone` ('Asia/Kolkata'), `onboarding_done` |
| `entitlements` | `{userId}` | Subscription state | `user_id`, `plan` ('free' or 'pro'), `source` ('razorpay', 'signup', etc.), `expires_at`, `updated_at` |
| `usage_counters` | `{counterId}` | Free tier limits | `user_id`, `kind` ('scan' or 'ai_question'), `period_key`, `count` |
| `storage_usage` | `{userId}` | Server-enforced aggregate storage usage | `user_id`, `used_bytes`, `reserved_bytes`, `updated_at` |
| `storage_upload_reservations` | `{reservationId}` | Short-lived upload quota reservations | `user_id`, `bytes`, `expires_at`, `created_at` |
| `categories` | `{categoryId}` | Contact groupings | `id`, `user_id`, `name`, `icon`, `color`, `created_at` |
| `contacts` | `{contactId}` | Network contacts | `id`, `user_id`, `name`, `role`, `company`, `phone`, `email`, `address`, `photo_path`, `card_image_path`, `met_where`, `met_date`, `tags` (array), `links` (array), `category_ids` (array), `ai_summary`, `ai_summary_updated_at`, `last_contacted_at`, `source`, `deleted_at`, `created_at`, `updated_at` |
| `notes` | `{noteId}` | Notes & Reminders | `id`, `user_id`, `contact_id`, `title`, `body`, `remind_at`, `repeat` ('none','daily','weekly','monthly'), `done_at`, `push_sent_at`, `push_claimed_at`, `deleted_at`, `created_at`, `updated_at` |
| `device_tokens` | SHA-256 of native token | Server-managed FCM/APNs registration | `user_id`, `token`, `platform` ('ios' or 'android'), `enabled`, `updated_at` |
| `documents` | `{docId}` | Uploaded attachments | `id`, `user_id`, `contact_id`, `note_id`, `storage_path`, `name`, `mime_type`, `size_bytes`, `created_at` |
| `cards` | `{cardId}` | Digital business cards | `id`, `user_id`, `label`, `slug` (unique), `name`, `role`, `company`, `tagline`, `phone`, `email`, `website`, `address`, `about`, `accent_color`, `photo_path`, `logo_path`, `socials` (array), `visibility` (map), `is_active`, `created_at`, `updated_at` |
| `ai_conversations` | `{convId}` | Assistant chats | `id`, `user_id`, `title`, `created_at` |
| `ai_conversations/{convId}/messages` | `{messageId}` | Chat messages | `id`, `conversation_id`, `user_id`, `role`, `content`, `created_at` |
| `ai_pending_actions` | `{actionId}` | AI proposals awaiting Confirm | `id`, `user_id`, `conversation_id`, `kind`, `payload`, `status` ('pending','confirmed','cancelled','expired'), `expires_at` |
| `payment_orders` | Razorpay order ID | Server-owned payment verification state | `user_id`, `plan`, `amount`, `currency`, `status`, `payment_id`, `expires_at`, `created_at` |

## Security Rules (`firestore.rules`)
- **Ownership:** User collections require the authenticated UID to match the stored `user_id` or legacy `userId` on reads, updates, and deletes. Supplied owner fields must match the authenticated UID at creation; updates preserve every owner field.
- **Entitlements and usage:** Clients can create only their initial Free entitlement. Paid entitlements and all usage-counter writes are server-only.
- **Contact creation and updates:** The `createContact` and `createContactsBatch` callables enforce the shared Free active-contact limit; direct client creates are denied. Client updates are validated via `isValidContactUpdate` which enforces ownership immutability (`unchangedOwner`), valid string `name` (1-100 characters), length bounds on optional string fields (`role` <= 100, `company` <= 100, `phone` <= 30, `email` <= 254, `address` <= 250), list types for `tags` and `category_ids`, and document ID preservation if present.
- **AI conversations and pending actions:** Client reads and writes are denied; authenticated Cloud Functions enforce ownership and perform all chat/action operations.
- **Cards:** Card documents are owner-readable only. Client writes are denied; `saveDigitalCard` enforces ownership, unique slugs, and Free/Pro card limits. Public card requests go through `getPublicCard`, which returns only active-card fields and applies the card's visibility settings.
- **Payment orders:** `payment_orders` is server-only.
- **Push tokens:** Clients register through the authenticated `registerDevicePushToken` callable; Firestore client reads and writes are denied.
- **Soft Deletes:** Deletion of contacts and notes marks `deleted_at: timestamp`. Client queries filter out rows where `deleted_at != null`.

## Cloud Storage (`storage.rules`)
- `users/{userId}/**`: Private reads require `request.auth.uid == userId`. All writes pass through the authenticated upload/delete Cloud Functions, which enforce per-file MIME/size checks and aggregate plan storage limits.
- `cards/{userId}/**`: Public reads are for assets displayed on public cards. All writes pass through the same authenticated Cloud Functions, which enforce ownership, image type, per-file size, and aggregate storage limits.
- Upload paths are returned to clients and stored in Firestore. Private download URLs are resolved for the authenticated owner at display time and are not persisted; public card assets receive short-lived URLs from `getPublicCard`.
- On sign-in, `migrateLegacyStoragePaths` converts existing Firebase download URLs to Storage paths when the object path belongs to that user.

Account bootstrap defaults match this model: 30-day follow-up nudges, 09:00 reminders, 60-minute snooze, daily brief enabled at 08:30, quiet hours 22:00–07:00, orange accent, Asia/Kolkata timezone, and notes enabled for AI context.

The public card function returns a visibility-filtered projection rather than exposing the Firestore card document. Phone, email, address, and social links are included only when their visibility switches are enabled.
