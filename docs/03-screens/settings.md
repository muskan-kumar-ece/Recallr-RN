# Settings and notification settings

## Settings: `settings` (opened by the Home avatar)
Top bar: back, "Settings".
- **Profile card:** avatar 52, name, phone, OrangeCorner "My card" with QR icon (opens my-card).
- **Subscription row** directly below: shows "Free" or "Pro" (opens settings/subscription).
- **Account:** Edit profile (name, photo, email); My cards (value: count).
- **Preferences:** Notifications and follow-ups (opens settings/notifications). Appearance is hidden in v1 (light only).
- **Data and security:** Backup and sync (value "On", not tappable); Import and export (Import contacts opens import; Export is Pro and creates a CSV or vCard of all contacts); App lock (toggle, `expo-local-authentication`, stored only on the device).
- **AI:** "Use my notes in answers" (toggle, caption "Lets Recallr read your notes", saved in `user_settings.ai_use_notes`); Clear chat history.
- **Support:** Help center, Send feedback, Privacy policy (open URLs from config).
- **Bottom card:** Log out; Delete account (danger).
- Caption: "Recallr {version}".
Delete account: confirm sheet explaining that all contacts, notes, files and cards are deleted permanently and that a store subscription must be cancelled in the store separately; requires typing DELETE; calls Edge Function `delete-account`; then signs out.

## Notifications and follow-ups: `settings/notifications`
Top bar: back, "Notifications".
- Card: "Reminders" toggle (caption "Alerts for notes with a time"); "Follow-up nudges" toggle (caption "Remind me about people I haven't contacted").
- "Nudge me after": chips 14 days, 30 days (default), 60 days, Custom (number input 7 to 365).
- Defaults card: "Default reminder time" (time picker, default 9:00 AM) and "Snooze for" (15 min, 30 min, 1 hour default, 3 hours).
- "Daily brief": toggle "Today's summary" (caption "Reminders and follow-ups, every morning") and "Send at" (default 8:30 AM).
- "Quiet hours": toggle "Pause alerts at night" (caption shows range, default 10:00 PM to 7:00 AM; editable).
All saved in `user_settings`. Changing times reschedules notifications.

Done when: every toggle persists, nudge days change the follow-up lists, quiet hours hold alerts.
