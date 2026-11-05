# 04. User flows

Each flow lists the exact steps. Screens are in `docs/03-screens/`.

## F1. First launch
Welcome slides -> Sign in (phone OTP or Google) -> Starter categories -> Home (empty state "Scan your first card").

## F2. Scan a business card
Quick Add (or Home tile) -> check scan limit (limit sheet if reached) -> Camera (permission explainer first time) -> capture or pick from gallery -> upload image -> `scan-card` -> Review (fix flagged fields, choose categories, where met, optional follow-up) -> duplicate check -> Save -> toast "Saved" -> Contact profile. "Save and scan another" returns to the camera.

## F3. Add a contact manually
Quick Add -> Add manually -> Contact form -> Save -> duplicate check -> Contact profile.

## F4. Duplicate handling (any source)
Save/scan/import detects a match -> Banner "{name} may already exist" -> "Merge" opens Merge screen -> choose fields -> "Merge into one" (undo 10 s) or "Keep both".

## F5. Create a reminder and get notified
Contact profile "Remind" (or Notes +) -> Note editor (reminder on, choose time) -> Save -> schedule local notification -> at the time the notification shows Done, Snooze, Open -> Done completes (repeating reminders advance), Snooze moves it by the snooze duration, Open opens the note.

## F6. Follow-up nudge
Contact not contacted for `nudge_days` and no future reminder -> appears in Home "Needs follow-up" and the People follow-up card -> user taps Call (sets last contacted) or sets a reminder.

## F7. Ask a question
Ask tab -> type "Who is Ramesh?" -> `ai-chat` runs read tools -> answer with person card and source line -> suggestion chips.

## F8. Ask the AI to do something
Type "Create category Local Shop and add Mukesh, he runs a tea stall" -> AI asks missing details one at a time (phone) -> shows Confirm card (nothing saved yet) -> Confirm -> `ai-confirm` writes -> "Saved" plus undo toast. Edit opens the normal forms prefilled. Cancel discards the pending action.

## F9. Share my card
Home My card -> My Card screen -> Share (link) or show QR -> other person scans: with the app, it opens the review screen in QR mode; without the app, it opens the public page with Save contact and Get Recallr.

## F10. Save someone's Recallr QR
Quick Add -> Scan Recallr QR -> camera in QR mode -> public card fetched -> Review -> Save.

## F11. Import phone contacts
Quick Add -> Import -> permission explainer -> system prompt -> pick -> choose category -> Import -> People.

## F12. Upgrade
Any limit sheet or Settings Subscription -> Upgrade -> choose plan -> store purchase with trial -> RevenueCat entitlement -> webhook updates `entitlements` -> limits lifted.

## F13. Delete and undo
Delete (swipe, menu, form) -> soft delete -> toast with Undo for 5 s -> if not undone it stays deleted (purged after 30 days).

## F14. Log out and delete account
Settings -> Log out (clears session and local cache). Delete account -> confirm sheet, type DELETE -> `delete-account` -> signed out.
