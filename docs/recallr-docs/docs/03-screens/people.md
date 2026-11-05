# People

**Purpose:** find and manage everyone in the network.
**Route:** `(tabs)/people`

## Layout
1. **Header:** title "People", caption "{N} people in {M} categories", round filter button (opens filter sheet: categories multi select, tag, company, sort).
2. **SearchBar** "Search name, company, note" (filters this list in place by name, company, role, tags; global search is a separate screen).
3. **Follow-up card:** "{N} need follow-up", caption "Not contacted in {nudge_days}+ days", OrangeCorner `md` arrow (turns on the needs-follow-up filter). Hidden when N is 0.
4. **Category chips** (horizontal scroll): All, then each category. One selected at a time (multi select is in the filter sheet).
5. **Sort row:** sort label (A to Z, Recently added, Last contacted) and "Select".
6. **List** grouped by first letter (accent letter labels), inside cards. Row: avatar, name, subtitle "{role} · {company}", first category as a tag, trailing nothing else. If follow-up is due: small accent dot before the subtitle and subtitle ends with "· {n} days ago".
7. **A to Z index** on the right edge (11 px letters, current letter accent), tap or drag to jump.
8. **TabBar.**

## Actions
- Tap row: open contact profile.
- Swipe left: reveals Call (accent) and Delete (danger). Delete soft deletes and shows undo toast.
- Long press or "Select": multi select mode. Rows show checkboxes; bottom bar with "Move to category" and "Delete". Exit with Cancel.
- Pull to refresh.

## States
- **Empty (no contacts):** EmptyState "No people yet" / "Scan a business card to save your first contact." Buttons "Scan card", "Add manually".
- **No results:** EmptyState "No match" / "Try another word or ask Recallr." Button "Ask Recallr" (opens Ask tab with the text).
- **Loading:** 6 skeleton rows. **Offline:** works from cache with Banner. **Error:** error EmptyState.

## Done when
- 500 contacts scroll smoothly (use a virtualized list)
- Swipe, select, sort, filter and index all work; delete can be undone
