# Global search

**Route:** `search` (param `scope`: all, people, notes, categories)

## Layout
Top row: focused SearchBar (1 px accent border, clear icon) and "Cancel". Filter chips: All, People, Notes, Categories.
Empty query: "Recent searches" as chips (local storage, max 8, "Clear" link) and nothing else.
Results (debounce 250 ms, from 1 character):
- **People** card: avatar, name with the matched letters in accent 500, subtitle "{role} · {category}".
- **Notes** card: title with highlight, caption ("Reminder · Today, 10:30 AM" or "Mentions {name} · 2 Oct").
- **Categories** (only when matching): rows with icon tile and count.
- Bottom card: sparkles, "Not what you meant?", caption "Ask Recallr about "{query}"", OrangeCorner arrow (opens Ask tab with `q`).

## Search fields
People: name, company, role, tags, met_where, email, phone. Notes: title, body. Categories: name. Ignore case and accents. Ranking: name starts with the query first, then contains.

## States
Loading skeleton; "No results for "{query}"" with the Ask Recallr card; offline searches cached data.

Done when: typing "ram" finds Ramesh by name, a note mentioning him, and highlights the match.
