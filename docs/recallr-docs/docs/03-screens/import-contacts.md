# Import from phone contacts

**Route:** `import`  (uses `expo-contacts`)

## Step 1: permission explainer
Centered: 64 px icon tile (address book), title "Import from your phone", "Bring in the contacts you want. Recallr only reads them to show you the list, and nothing is added until you choose." Card with lock icon: "You pick who to import. You can revoke access anytime in phone settings." Primary "Allow contacts access", text "Not now". Then the system permission prompt. If denied: EmptyState with "Open settings".

## Step 2: pick contacts
Top bar: back, "Import contacts". SearchBar "Search phone contacts". Row: "{N} contacts" and "Select all". List with checkbox, avatar, name, phone. People already in Recallr (same phone key) are grayed, not selectable, caption "Already in Recallr".
Sticky bottom card: "{N} selected", "Category: {name}" (tap to change; single choice, optional), primary "Import {N} contacts".

## Rules
- Import name, first phone, first email, company, job title. No photos.
- Free plan: if N exceeds the remaining slots (50 minus current), show the limit sheet with the remaining number.
- After import: toast "Imported {N} contacts" and open People.

Done when: importing 20 contacts creates 20 contacts, skips existing ones, and respects the plan limit.
