# Home

**Purpose:** "What do I need to do today, and who should I remember?"
**Route:** `(tabs)/index`

## Layout (top to bottom, scrolls)
1. **Header:** avatar (initials or photo, opens Settings), small "Good morning/afternoon/evening" (caption) and first name (title); bell icon button on the right (opens Notes tab with the Reminders filter).
2. **SearchBar:** "Search people, notes, companies" (tap opens Search).
3. **Today card:** caption "Today, {D MMM}"; title "{N} follow-ups" (N = reminders due today and overdue); up to 2 rows (empty circle, title, time caption, person tag). Tapping the circle completes it. OrangeCorner `lg` with arrow opens Notes tab, Reminders filter. If N is 0: title "Nothing due today" and the corner shows + (opens note editor).
4. **Quick actions** (4 equal tiles, icon on white rounded tile, label under): Scan card (opens scan), Add person (contact/new), New note (note/new), My card (my-card).
5. **Ask Recallr card:** icon tile with sparkles, "Ask Recallr", hint text "Who is Ramesh? Who do I know in plastics?", OrangeCorner `lg` with arrow-up (opens Ask tab).
6. **Categories:** header "Categories" and "See all" link (opens categories). 2-column grid of up to 4 category cards (icon tile, name, caption "N new this week" or "Updated {when}", OrangeCorner `sm` with member count) and a dashed "New category" card (opens category sheet).
7. **Needs follow-up:** header and "View all" (opens People filtered to needs follow-up). Card with up to 2 rows: avatar, name, caption "{role} at {company} · {n} days ago" , round call button (outline accent).
8. **TabBar.**

## Data
Reminders due today and overdue; categories with counts; contacts needing follow-up (rule in business rules). All from the local cache first, then refreshed.

## States
- **Loading:** skeleton for Today card and category cards.
- **No contacts yet:** hide sections 6 and 7 and show EmptyState "Scan your first card" with buttons "Scan card" and "Add manually". Show a one-time tooltip on the center + button.
- **Offline:** Banner at top.
- **Error:** EmptyState error variant with "Try again".

## Done when
- Completing a reminder from Today removes it and updates the count with a haptic
- Every tile and link opens the right screen
- Empty account shows the empty state; account with data shows all sections
