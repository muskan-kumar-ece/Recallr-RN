# Share contact (bottom sheet)

**Opened from:** share icon on Contact profile.

Layout: handle, title "Share {name}". FieldRows with checkboxes: Name and company (checked), Phone (checked), Email (checked), Address (unchecked). Last row, lock icon, muted: "Your notes and files stay private". Then 4 square tiles: WhatsApp, Messages, Copy, Contact file.

Behavior:
- WhatsApp and Messages open with a text message built from the checked fields ("Name, Company, Phone, Email").
- Copy puts the same text on the clipboard and shows a toast "Copied".
- Contact file creates a .vcf with the checked fields and opens the system share sheet.
- Notes, documents, tags, categories and AI summary are NEVER included.

Done when: each tile shares exactly the checked fields and nothing else.
