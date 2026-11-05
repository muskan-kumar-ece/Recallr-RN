# My Card

## My Card screen: `my-card`
Top: title "My Card" and caption "Link active" (green check) or "Link off". Front card (white, accent curve, logo and company top left, name and role in the curve, 3 contact lines: phone, email, website, address bottom left in caption). Back card with QR: logo, "Scan to save contact", the link in caption, QR tile (white, radius 10) inside the accent curve. Three action tiles: Share (system share sheet with the link), Save QR (saves an image), Edit.
Card switcher chips when the user has more than one card.

## Edit card: `my-card/edit`
Top bar: close, "Edit card", "Save". Card tabs (chips: each card label, dashed "+ New"; Free plan has 1 card, so "+ New" opens the limit sheet). Live preview of the front card. Color row (5 colors). Photo and logo upload tiles (dashed). FieldRows: Name, Role, Company, Tagline. Contact FieldRows with icon tiles: Phone, Email, Website, Address. Social links list (LinkedIn, Instagram, GitHub, X, WhatsApp, YouTube) with drag handles to reorder and "+ Add link". About me (multiline). Primary "Save card".
Card images go to the public bucket `card-assets`.

## Card settings: `my-card/settings`
- Card link active (toggle). Link row `https://{APP_DOMAIN}/c/{slug}` with copy and regenerate icons. Regenerate opens a confirm sheet ("The old QR code will stop working") then creates a new slug.
- "Show on card" toggles: Phone number, Email, Address (off by default), Social links.
- "Delete this card" (danger text) with confirm sheet. A user always keeps at least one card, so the last card cannot be deleted.
The "Ask before sharing my number" option is NOT in v1.

## Public page (separate small web app `public-card-web`)
URL `https://{APP_DOMAIN}/c/{slug}`. Mobile first. Browser bar not part of the design. Layout: accent colored header block (84 px, bottom right radius 60), 68 px avatar overlapping it (photo or initials), name, "{role}, {company}", two buttons: "Save contact" (primary, downloads a .vcf) and "Get Recallr" (outline, links to the app stores). Card of rows with icon tiles: phone, email, website (only visible fields). Row of social icons. Footer caption "Made with Recallr". Data comes only from the RPC `get_public_card`. Inactive or unknown slug: EmptyState "This card is not available".
If the app is installed, the link opens the app (universal links) into `scan-review` in QR mode.

Done when: scanning the QR with a phone camera opens the page, Save contact adds a contact with the visible fields only, and switching the link off makes the page unavailable.
