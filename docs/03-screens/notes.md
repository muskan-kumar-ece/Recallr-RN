# Notes tab

**Purpose:** all notes and reminders in one place.
**Route:** `(tabs)/notes`

## Layout
1. **Header:** title "Notes", round search icon button (opens Search with the Notes chip selected).
2. **Summary card:** "{N} reminders today", caption "Next: {title} at {time}" (or "No reminders today"), OrangeCorner `md` with + (opens note editor).
3. **Filter chips:** All, Reminders, Done (single select).
4. **Sections** (cards of rows):
   - **Overdue** (only if any, accent caption)
   - **Today** (header with date caption)
   - **Upcoming**
   - **Notes** (notes without a reminder): card with title, 2 line preview, person tag, date.
   Reminder row: empty accent circle (tap to complete), title, time caption ("Tomorrow, 11:00 AM", add "· repeats weekly" if repeating), person tag on the right.
5. **TabBar.**

## Actions
- Tap circle: complete (repeating reminders advance to the next date, see business rules). Haptic and strike through, then remove with the undo toast.
- Swipe left: Snooze (by the default snooze duration) and Delete (undo toast).
- Tap row: open the note editor.
- "Done" filter lists completed reminders, newest first; tapping the circle restores it.

## States
Empty: "No notes yet" / "Write a note or set a reminder." with button "New note". Others per shared-states.

## Done when
Complete, snooze, delete, undo and filters work; the list matches Home's Today count.
