# Categories

## Overview: `categories`
Top bar: back, title "Categories", round accent + button (opens the category sheet).
2-column grid of category cards (IconTile with category icon and color, name, caption "{N} new this week" or "Updated {when}", OrangeCorner `sm` with member count in the category color).
Below the grid: dashed card **Uncategorized** (gray icon tile with inbox icon, "Uncategorized", caption "{N} people to sort", outline-accent chip "Sort with AI"). Hidden when N is 0. "Sort with AI" calls `suggest-categories` and shows a sheet of proposals (person, suggested category) with "Apply all" and per-row change; applying counts as one AI question.

## Category page: `category/[id]`
Top bar: back and ⋯ (Edit category, Delete category). Header card: IconTile 48, name (title), caption "{N} people · {M} need follow-up", OrangeCorner `md` edit. Action chips: "Add person" (accent filled, opens contact/new with this category selected) and "Ask about this group" (outline, opens Ask with category context). SearchBar "Search in {name}". Card list of member rows (same as People rows). Footer caption "Deleting this category keeps all its people."

## Category sheet (new and edit)
Handle, title "New category" (or "Edit category"). Live preview card (IconTile and name and "{N} people"). Name field (required, max 30, unique ignoring case). Icon row (pick one from the icon set in `src/config/category-icons.ts`, show 5 and a "More" button). Color row (5 circles, selected has an outer ring). Primary "Create category" (or "Save changes").

## Rules
Deleting removes only the category and its links; contacts stay. Undo toast restores it.

Done when: create, edit, delete, undo work and counts stay correct when contacts move.
