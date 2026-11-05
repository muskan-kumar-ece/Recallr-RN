# Merge duplicates

**Route:** `merge?a={savedId}&b={otherId or draftId}`
**Opened from:** duplicate Banner (after save, scan or import), Contact profile ⋯ menu ("Merge with another person" opens a person picker first).

## Layout
Top bar: back, title "Merge duplicates".
1. Card: two avatars with an exchange icon, "Same person?", caption with the reason ("Matching phone number", "Matching email", "Same name and company").
2. Column captions: "Saved contact" and "New scan" (or "Other contact").
3. For each field that differs (Name, Role, Company, Email, Address, Where met): label, then two radio cards side by side (selected has 1.5 px accent border and soft accent background).
4. Fields that are identical are collapsed into one gray row "Same on both: {value}".
5. Info line: "Notes, files and reminders from both are kept."
6. Buttons: primary "Merge into one", outline "Keep both".

## Rules
- Default selection: if one side is empty choose the other; if both have values choose the saved contact.
- Result keeps the saved contact's id. Categories are the union. Notes, documents and reminders of the other contact move to the saved contact. The other contact (if it was saved) is soft deleted. A draft from a scan is simply discarded.
- After merge: toast "Merged. Undo" for 10 seconds (restores the other contact and moves items back), then open the merged profile.
- "Keep both" saves the new one as a separate contact.

Done when: merge keeps all notes and files, and undo restores both contacts.
