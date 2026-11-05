# 07. Business rules

Keep all numbers in ONE config file per side: `src/config/plans.ts` (app) and `supabase/functions/_shared/plans.ts` (server), with a test that checks they are equal. Values marked TBC must be confirmed by the owner before launch.

## Plans
| | Free | Pro |
|---|---|---|
| Contacts | 50 | unlimited |
| Card scans | 10 per month | unlimited (fair use cap, TBC) |
| AI questions | 5 per day | unlimited (fair use cap, TBC) |
| Digital cards | 1 | multiple (up to 5, TBC) |
| Document storage | 100 MB (TBC) | 5 GB |
| Export contacts | no | yes |
| Reminders, notes, categories, search, merge, import, share | unlimited | unlimited |

Never lock: viewing, searching, reminders, notes, categories. Limit only what costs money (AI, scans, storage).

Suggested prices (set in the store consoles, TBC): Monthly Rs 149, Yearly Rs 1,199, 7 day free trial. The app always shows the price returned by the store.

## Limit behavior
- Counts: contacts = rows with `deleted_at is null`. Scan = successful `scan-card`. AI question = successful `ai-chat`, `summarize-contact`, or `suggest-categories` call. Daily period uses the user's timezone.
- When blocked show the limit sheet (`03-screens/subscription.md`). Always offer a free alternative when possible.
- If a Pro user downgrades: nothing is deleted. Over-limit users can view and edit but cannot add new contacts until under the limit. Extra cards become read only except the first.
- Limits are checked on the server. The app also checks to show the sheet early.

## Entitlements
RevenueCat entitlement id: `pro`. Products: `recallr_pro_monthly`, `recallr_pro_yearly` (names TBC). The `revenuecat-webhook` Edge Function writes `entitlements`. The app reads `entitlements` and also uses RevenueCat customer info for instant UI after purchase; the server table is the truth for limits.

## Duplicate detection (on save, scan, import)
A match is another non-deleted contact of the same user where any is true:
1. `phone_key` is equal and has at least 7 digits
2. `email_key` is equal and not empty
3. name equal (ignoring case) AND company equal (ignoring case), both non-empty
Same name alone is NOT a duplicate. On match show the duplicate Banner (merge flow in `03-screens/merge-duplicates.md`). Import skips matches.

## Follow-up rule ("Needs follow-up")
A contact needs follow-up when ALL are true: not deleted; `coalesce(last_contacted_at, created_at)` is older than `nudge_days`; no undone reminder linked to the contact in the future; nudges are enabled. Sort by oldest first.

## Reminders
- Stored with `remind_at` (UTC) and `repeat`.
- Complete: non-repeating sets `done_at`. Repeating advances `remind_at` by one day, 7 days, or one month (same day of month, clamp to the last day) until it is in the future, and does not set `done_at`.
- Snooze: `remind_at = now + snooze_minutes`.
- Completing a reminder linked to a contact sets that contact's `last_contacted_at = now`.
- Overdue = `remind_at < now` and not done.

## Local notifications
- Use `expo-notifications` local scheduling. Keep a local map note id to notification id.
- Reconcile on app start and when the app comes to the foreground: cancel stale ones and schedule the soonest 60 upcoming reminders (iOS allows about 64 pending local notifications).
- Notification actions: Done, Snooze (default duration), Open.
- Quiet hours: reminders that fall inside quiet hours are delivered at the end of quiet hours. Follow-up nudges and the daily brief never fire in quiet hours.
- Daily brief: schedule the next 7 days with content computed at scheduling time; refresh whenever the app opens.
- Android needs a notification channel ("Reminders") and the notification permission on Android 13 and later. Ask for permission the first time the user turns on a reminder.

## Undo and confirmations
Undo toast (no popup) for: delete contact, note, category, document; complete or snooze reminder; merge (10 s). Confirm sheets ARE required for: delete account, regenerate card link, delete card, AI delete, AI actions touching more than one contact, discard unsaved changes.

## Privacy
- Notes, documents, tags, categories and AI summaries are never shared with others (share sheet, public card, QR).
- Public card shows only fields turned on in its visibility settings.
- AI uses notes only if `ai_use_notes` is true.
- Delete account removes all rows and files for the user.
- Do not collect analytics with personal data. Crash reporting, if added, must not include contact data.
