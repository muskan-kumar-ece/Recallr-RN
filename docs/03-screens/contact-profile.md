# Contact profile

**Purpose:** everything about one person, and the fastest way to act on it.
**Route:** `contact/[id]`

## Layout (top to bottom)
1. **Top bar:** back, share icon (opens Share sheet), ⋯ menu (Edit, Move category, Merge with another person, Delete).
2. **Header card:** Avatar 64, name (title), "{role}, {company}" (small), category Chips (tag style). OrangeCorner `md` with edit icon (opens edit form).
3. **Action tiles** (4): Call (`tel:`), WhatsApp (`https://wa.me/{digits}`), Email (`mailto:`), Remind (opens note editor with this person linked and the reminder switch on). Tapping Call, WhatsApp or Email sets `last_contacted_at = now`.
4. **Recallr summary card:** sparkles icon tile, "Recallr summary", 2 to 3 sentences from the AI, OrangeCorner `sm` with refresh icon. If no summary yet: text "No summary yet" and button "Generate summary". Generating counts as one AI question. Never generated automatically.
5. **Next follow-up card:** caption "Next follow-up", title of the next undone reminder linked to this person, time in accent, OrangeCorner `md` with bell (opens that note). If none: "No follow-up set" and text button "Set one".
6. **Details** (header "Details", link "Edit"): FieldRows with icon tiles: Phone, Email, Address, Where we met ("{met_where}, {D MMM}"). Hide rows with no value. Tap phone calls, email composes, address opens maps; long press copies.
7. **Notes** (header, link "Add note"): latest 3 notes (text up to 2 lines, date). Tap opens the note. "See all" if more than 3.
8. **Documents** (header, link "Add"): 2-column tiles (icon tile, name, type or size). Add opens a choice: Photo (camera or library) or File. Tap opens Document viewer.
9. **Ask bar** (floating, pinned bottom): sparkles, "Ask about {first name}", OrangeCorner arrow. Opens Ask tab with this contact as context.

## States
Loading skeletons; deleted or missing contact shows "This person is no longer available" with Back; offline reads from cache (summary generation and uploads disabled with a Banner).

## Done when
- All four action tiles work and update last contacted
- Summary generate and refresh work and respect the AI limit
- Adding a note or document updates the profile instantly
