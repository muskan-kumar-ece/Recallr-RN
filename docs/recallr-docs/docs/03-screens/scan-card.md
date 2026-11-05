# Scan card and review

**Routes:** `scan` (camera), `scan-review` (review and save). `scan?mode=qr` scans a Recallr QR instead.

## Camera screen
Full screen camera (`expo-camera`). Permission is requested here, with a short explainer first: "Recallr needs the camera to read business cards." Overlay: rounded card frame, hint "Hold the card steady". Bottom: gallery button (pick an image), round shutter button, flash toggle. Close (x) top left. v1 uses the manual shutter only.
QR mode: same screen, frame is square, hint "Point at a Recallr QR". Accept only URLs of the form `https://{APP_DOMAIN}/c/{slug}`; others show "That is not a Recallr card".

## After capture
1. Upload the image to private storage (`contact-files/{user_id}/cards/{uuid}.jpg`), compressed to max 1600 px.
2. Call Edge Function `scan-card` (see AI spec). Show a "Reading card..." shimmer over the card image.
3. On success open `scan-review`. A successful read counts as 1 scan. A failed read does not count.
4. On failure: EmptyState "Couldn't read this card" with "Try again" and "Add manually" (pre-fills nothing).

## Review screen
Top bar: back, title "Review card", "Retake" (accent text).
1. Card thumbnail row (white card, small image, "Card scanned", caption "Details read automatically").
2. Duplicate Banner when a match exists: "{name} may already exist." with "Merge" link.
3. Fields card (editable FieldRows): Name, Role, Company, Phone, Email, Address. Any field with confidence below 0.8 gets soft accent row background and an accent "Check" tag. Empty fields stay empty.
4. **Category:** chips (multi select) and "+ New".
5. **How you met:** FieldRow "Where did you meet?" and a "Set follow-up" row with a toggle and a chip "In 3 days" (tap to change: Tomorrow, In 3 days, Next week, Custom). The follow-up becomes a reminder linked to the new contact at the default reminder time.
6. Primary "Save to Recallr". Text link "Save and scan another".
QR mode review is identical but fields come from the public card, and the thumbnail row shows the person's name instead of "Card scanned".

## Done when
- A photographed card produces editable fields within a few seconds and saves a contact with its card image attached
- Low confidence fields are flagged; duplicate banner shows for an existing phone number
- Scan count increases only after a successful read
