# Note editor (new and edit)

**Routes:** `note/new` (query: `contact`, `remind=1`), `note/[id]`

## Layout
Top bar: close (x), title "New note" or "Edit note", "Save" (accent).
1. **Card:** Title input (16/500, placeholder "Title") and body input (multiline, placeholder "Write a note").
2. **Person link:** chip row. Linked: tag chip "{name}" with x. Otherwise dashed chip "+ Link person" (opens a searchable person picker sheet).
3. **Reminder card:** row with bell icon "Remind me" and a Toggle (off by default, on when opened with `remind=1`). When on, show quick chips: Later today (now + 3 hours, rounded up to 15 min), Tomorrow 9 AM (uses the default reminder time), Next week (next Monday at default time), Custom (native date and time picker). Below, selected time with calendar icon ("Thu, 5 Nov · 9:00 AM"). Row "Repeat": Does not repeat, Daily, Weekly, Monthly.
4. **Attach row** (3 tiles in v1: Photo, File). Documents upload to the note.
5. Primary "Save note". Edit mode shows "Delete note" (danger) at the bottom.

## Validation
Title or body required. Reminder time must be in the future.

## Behavior
On save with a reminder: schedule the local notification (business rules, notifications). Editing the time reschedules. Turning the reminder off cancels it. Notification content: title = note title, body = "{person name}, {company}" if linked.

## Done when
A reminder set for 2 minutes ahead fires a notification with Done, Snooze and Open actions, and each action works.
