# Quick Add (bottom sheet)

**Opened from:** the center + button on the TabBar (any tab).

Layout: dimmed backdrop, sheet with handle, title "Add to your network", then 5 rows (icon tile, title, caption, chevron):
1. **Scan business card** (first, highlighted with OrangeCorner arrow): "Auto-fills name, company, phone" opens `scan`.
2. **Add manually:** "Type the details yourself" opens `contact/new`.
3. **Scan Recallr QR:** "Save someone's digital card" opens `scan?mode=qr`.
4. **Import from contacts:** "Pick from your phone" opens `import`.
5. **Ask AI to add:** "Say it or type it" opens Ask tab and focuses the input.

Rules: if the monthly scan limit is reached, row 1 opens the limit sheet (subscription.md) instead. If the contact limit is reached, rows 2 to 4 open the limit sheet.

Done when: each row navigates correctly and the sheet closes on selection or backdrop tap.
