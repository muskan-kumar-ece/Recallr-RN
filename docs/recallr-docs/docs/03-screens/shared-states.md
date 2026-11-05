# Shared states (use everywhere)

| State | Pattern |
|---|---|
| Loading | Skeleton rows or cards matching the final layout. No full screen spinners. |
| Empty | EmptyState: icon tile, title, one sentence, one or two buttons. Wording per screen is in each screen spec. |
| Error | EmptyState error variant: red tinted icon tile, "Couldn't load {thing}", "Check your connection and try again.", button "Try again". |
| Offline | Banner at the top: "You're offline. Your changes will sync when you're back online." Reads come from cache. Queued writes: complete or snooze reminder, add or edit note, add or edit contact (text only). Needs internet: uploads, scanning, AI, purchases. |
| Undo | Toast "{thing} deleted" with "Undo" for 5 seconds (merge: 10 seconds). Used instead of confirm popups. |
| Saved | Haptic and, for important saves, a short toast. |
| Limit reached | Limit sheet (subscription.md). |
| Permission denied | EmptyState explaining why it is needed and a button "Open settings". |

Standard copy:
- Empty people: "No people yet" / "Scan a business card to save your first contact."
- Empty notes: "No notes yet" / "Write a note or set a reminder."
- Empty search: "No results for "{query}""
- Generic error: "Something went wrong. Try again."
