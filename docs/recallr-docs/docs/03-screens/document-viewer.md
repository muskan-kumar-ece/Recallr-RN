# Document viewer

**Route:** `document/[id]`

Top bar: back, file name (title, truncated), ⋯ (Rename, Move to another person).
- **Images:** shown in a white card with pinch to zoom and double tap zoom. (Business card images from scanning use the same viewer.)
- **PDFs and other files (v1):** show a file icon tile, file name and type, and a primary button "Open in" that opens the system viewer through `expo-sharing`. In-app PDF preview is not in v1.
- Action tiles: Share (system share sheet), Open in, Delete (danger, undo toast).
- Details card (FieldRows): Attached to (person tag, tap opens profile), Added (date), Size.

Done when: images zoom, PDFs open in the system viewer, delete can be undone.
