# 12. Web application specification

## Goal & design philosophy

The Recallr Web app (`apps/web`) provides the exact same product, visual language, copy, and behavior as the iOS and Android mobile app, sharing Firebase Auth, Cloud Firestore, Cloud Storage, and Cloud Functions, plus design tokens (`@recallr/tokens`), pure domain logic (`@recallr/core`), and data layer (`@recallr/api`).

The core rule is: **Adapt, do not redesign.**
- **Same look:** Soft white background (`#F8F7F4`), white cards (`#FFFFFF`, radius 16, border `rgba(0,0,0,0.08)`), signature **orange curved corner accent** (`#E8641B`), and Inter font (weights 400 and 500).
- **Same components:** Card, OrangeCorner, Button, Chip, Avatar, IconTile, ListRow, FieldRow, SearchBar, Toggle, SegmentedControl, ProgressBar, BottomSheet (as Web Dialog / Drawer), Toast, Banner, EmptyState, Skeleton, TabBar, ScreenHeader.
- **Same copy text:** Empty, loading, error, and offline states use the exact text defined in `docs/03-screens/`.
- **Same business logic:** All phone normalization, duplicate detection, follow-up rules, and reminder math are imported directly from `@recallr/core`.

---

## Responsive web layouts

The web application adapts smoothly between mobile viewport widths and larger desktop monitors:

```
┌────────────────────────────────────────────────────────────────────────┐
│                        Desktop View (≥ 768px)                          │
├───────────────┬────────────────────────────────────────────────────────┤
│               │ Top Bar: [ SearchBar (Cmd+K)              ] [+ Quick Add]
│ Left Sidebar: ├────────────────────────────────────────────────────────┤
│ • Recallr     │ Main Content (Centered column, max-width ~1100px):     │
│ • Home        │                                                        │
│ • People      │ [ People Split View:                                 ] │
│ • Notes       │ [ Contacts List (380px)  │ Contact Profile (rest)    ] │
│ • Ask AI      │ [ A-Z, Search, Filters   │ Actions, Details, Notes   ] │
│ • Categories  │                                                        │
│ • My Card     │                                                        │
│ • Settings    │                                                        │
│               │                                                        │
│ [Plan Status] │                                                        │
└───────────────┴────────────────────────────────────────────────────────┘

┌────────────────────────────────────────┐
│        Phone View (< 768px)            │
├────────────────────────────────────────┤
│ [ScreenHeader]                         │
│ Content Cards (Cards, OrangeCorner)    │
│ Single-column scroll                   │
│                                        │
│ Floating TabBar with raised center +   │
└────────────────────────────────────────┘
```

### 1. Phone width (< 768px)
- **100% parity with mobile:** The UI renders in a single-column container identical to the native mobile app.
- **Navigation:** Floating white card `TabBar` (radius 22, 5 slots: Home, People, center 48px raised orange circle button, Notes, Ask AI) fixed at the bottom.
- **Overlays:** Modals and actions open in bottom-anchored sheets (`Drawer` / `BottomSheet` style with top radius 24).
- **Header:** `ScreenHeader` with back button, screen title, and contextual action icons.

### 2. Tablet & Desktop (>= 768px)
- **Left Navigation Sidebar (240px wide, fixed):**
  - Recallr logo & wordmark with orange icon tile at the top.
  - Navigation links:
    - `Home` (`ti-home`)
    - `People` (`ti-users`)
    - `Notes` (`ti-notebook`)
    - `Ask AI` (`ti-sparkles`)
    - `Categories` (`ti-folders`)
    - `My Card` (`ti-id`)
    - `Settings` (`ti-settings`)
  - Bottom user account section: Avatar, user name, and current plan pill (Free / Pro).
- **Top Bar (Sticky, full width of content area):**
  - Global `SearchBar` ("Search people, notes, companies") with keyboard shortcut hint (`Ctrl + K` / `Cmd + K`).
  - Primary button: "+ Quick Add" (opens the Quick Add dialog).
  - Bell icon (quick jump to due reminders).
- **Main Content Area:**
  - Centered responsive column with maximum width of **1100px**.
  - Padding: 24px horizontal, 24px vertical.
- **Overlays:** Bottom sheets become centered modal dialogs (radius 16) or slide-in right side drawers with dimmed backdrop.

---

## Screen-by-screen specifications (Covering all 21 specs in `docs/03-screens/`)

### 0. Screen Index & Design Template (`docs/03-screens/00-index.md`)
- The web app mirrors every route indexed in `00-index.md`.
- Shared template across every web screen: Header, Content Cards, Action Bars, Responsive Layout (Phone vs. Desktop), Loading Skeleton, Empty State, and Error Boundary.

### 1. Home Screen (`docs/03-screens/home.md` -> `/`)
- **Desktop Layout:**
  - Header: Greeting ("Good morning, {Name}") with date and subtitle.
  - Today card: Prominent hero card with large orange corner (`lg` 78x58) displaying due & overdue reminders.
  - 4 Quick action cards arranged in a horizontal grid (Scan card, Add person, New note, My card).
  - 2-column lower section:
    - Left column: Categories grid (up to 4 category cards with member counts in `sm` orange corners, plus dashed "+ New category" card).
    - Right column: "Needs follow-up" card (list of contacts not reached in `nudge_days`, with one-click Call and WhatsApp buttons) + "Ask Recallr" card.
- **Phone Layout:** Single-column vertical scroll matching `docs/03-screens/home.md`.

### 2. People Screen (`docs/03-screens/people.md` -> `/people`)
- **Desktop Split-View (Master-Detail):**
  - **Left Pane (380px wide):**
    - Header: "People" with total counts ("48 people in 4 categories") and filter trigger.
    - Inline SearchBar and horizontal category filter chips.
    - Sort row (A to Z, Recently added, Last contacted) and multi-select trigger.
    - Virtualized contact list with alphabetical sticky section headers and letter scroller.
    - Selected contact row has soft orange tint (`accentTintSoft`) and active indicator.
  - **Right Pane (Flexible remaining width up to 720px):**
    - Selected contact's full **Contact Profile** (see #3).
    - When no contact is selected: Clean EmptyState ("Select a contact to view details").
- **Phone Layout:** List view on `/people`; tapping a contact navigates to full-screen `/people/[id]`.

### 3. Contact Profile (`docs/03-screens/contact-profile.md` -> `/people/[id]`)
- **Desktop:** Rendered in the right pane of the split-view (or full page if navigated directly).
- **Phone:** Full-screen view with `ScreenHeader`.
- **Layout & Actions:**
  - Avatar (photo or initials, 64px), Name (20/500), Role, Company, Met where & when.
  - Quick action buttons: Call, WhatsApp, Email, Share (opens Share dialog), ⋯ (Edit, Merge with another person, Delete).
  - Details card (FieldRows: Phone, Email, Address, Categories tags, Links).
  - Linked notes & reminders list with "+ Add note" button.
  - Attached documents & business card image preview tiles.
  - Delete contact: Soft delete with 5-second undo toast (`docs/07-business-rules.md`).

### 4. Contact Form (`docs/03-screens/contact-form.md` -> `/people/new`, `/people/[id]/edit`)
- **Desktop:** Centered modal dialog (max-width 560px) or slide-in drawer.
- **Phone:** Full-screen form view with top bar (Cancel, "Add contact" / "Edit contact", "Save").
- **Fields:** Name, Role, Company, Phone, Email, Address, Met where, Met date, Category chips (multi-select), Tags, Links.
- **Validation:** Zod schema from `@recallr/core`. On save: triggers duplicate detection check.

### 5. Share Contact (`docs/03-screens/share-contact.md`)
- **Desktop:** Modal dialog (radius 16, max-width 440px).
- **Phone:** Bottom sheet (`BottomSheet`).
- **Layout:** Title "Share {name}", FieldRows with checkboxes (Name & company, Phone, Email, Address). Private indicator: *"Your notes and files stay private"*.
- **Action Tiles:** WhatsApp (opens WhatsApp Web with text), Messages/SMS, Copy text (toast "Copied"), Contact file (`.vcf` download).

### 6. Merge Duplicates (`docs/03-screens/merge-duplicates.md` -> `/merge`)
- **Route:** `/merge?a={savedId}&b={otherId}`
- **Desktop:** Centered comparison modal dialog (max-width 640px) or page.
- **Phone:** Full-screen comparison view.
- **Layout:**
  - Header: Two avatars with exchange icon, "Same person?", reason caption ("Matching phone number", "Matching email", or "Same name and company").
  - Side-by-side radio cards for differing fields (Name, Role, Company, Email, Address, Where met). Identical fields collapsed into gray row *"Same on both: {value}"*.
  - Note: *"Notes, files and reminders from both are kept."*
  - Buttons: Primary "Merge into one" (10-second undo toast), Outline "Keep both".

### 7. Quick Add (`docs/03-screens/quick-add.md`)
- **Desktop:** Centered modal dialog opened by top bar `+ Quick Add` button or keyboard shortcut (`N`).
- **Phone:** Bottom sheet opened by floating center + button.
- **Options (4 tiles):**
  1. Scan business card (opens image dropzone).
  2. Add contact manually (opens Contact Form).
  3. New note or reminder (opens Note Editor).
  4. Import contacts (opens CSV/vCard import dialog).

### 8. Scan Card & Review (`docs/03-screens/scan-card.md` -> `/scan`, `/scan-review`)
- **Desktop & Web Adaptation:**
  - Drag-and-drop file upload zone + file selector (`<input type="file" accept="image/*">`).
  - Card outline with dashed border: *"Drag and drop a business card image, or browse files"*.
  - Uploads to `contact-files/{user_id}/cards/{uuid}.jpg` with client-side compression (max 1600px).
  - "Reading card..." animated shimmer over card image while Firebase Cloud Function `scanCard` runs.
- **Review Screen (`/scan-review`):**
  - Left: Card thumbnail with "Replace / Retake" link.
  - Right: Extracted FieldRows (Name, Role, Company, Phone, Email, Address). Fields with confidence < 0.8 flagged with soft orange background and "Check" badge.
  - Duplicate Banner if match exists.
  - Category selector, "Where did you meet?", follow-up toggle.
  - Primary button: "Save to Recallr", secondary "Save and scan another".

### 9. Import Contacts (`docs/03-screens/import-contacts.md` -> `/import`)
- **Web Adaptation (CSV & vCard Import):**
  - Drag-and-drop file upload for `.csv` or `.vcf` files.
  - CSV parser (via `papaparse`) and vCard parser (via `@recallr/core`).
  - Column mapper preview for CSV (maps Name, Phone, Email, Company, Job Title).
  - Contacts selection list with search, "Select all", and duplicate badges (*"Already in Recallr"* for existing phone/email keys).
  - Free plan quota checker: displays remaining contact slots (50 minus current).
  - Primary button: "Import {N} contacts" with success toast.

### 10. Notes Screen (`docs/03-screens/notes.md` -> `/notes`)
- **Desktop:**
  - Header: "Notes", caption "{N} notes", filter chips (All, Reminders, Completed).
  - SearchBar: Full-text search for notes.
  - Split view or 2-column card grid: Notes cards showing title, snippet, linked person tag, reminder date badge, and checkbox.
  - Completing a reminder advances repeating reminders or sets `done_at` with an undo toast.
- **Phone:** Single-column scroll matching `docs/03-screens/notes.md`.

### 11. Note Editor (`docs/03-screens/note-editor.md` -> `/notes/new`, `/notes/[id]`)
- **Desktop:** Right slide-out drawer or modal dialog.
- **Phone:** Full-screen modal with `ScreenHeader`.
- **Fields:** Title, Body, Contact selector (searchable picker), Reminder toggle.
- **Reminder Options:** Date & time picker, Repeat (None, Daily, Weekly, Monthly).
- **Actions:** "Save note", Delete (danger with undo toast).

### 12. Ask AI (`docs/03-screens/ask-ai.md` -> `/ask`)
- **Desktop:**
  - Conversational view (max-width 860px centered).
  - Message thread:
    - User message bubbles (right-aligned).
    - Assistant blocks (left-aligned): `text` markdown, `person_cards` (interactive contact cards), `sources` caption, `chips` suggestion pills, `question` block with quick replies, and `confirm` proposal cards.
  - Auto-resizing textarea with sparkles send button.
  - Free tier daily question counter meter ("3 of 5 daily questions remaining").
- **Phone:** Matches `docs/03-screens/ask-ai.md`.

### 13. Global Search (`docs/03-screens/search.md` -> `/search`)
- **Desktop:** Modal overlay / palette triggered by top bar SearchBar or `Cmd + K`.
- **Phone:** Dedicated search screen.
- **Layout:** SearchBar with debounce 250ms, Scope filter chips (All, People, Notes, Categories).
- **Empty state:** "Recent searches" chips (local storage, max 8, "Clear" link).
- **Results:** Highlighted People cards (name matches highlighted in accent), Notes cards with context, Category cards. Bottom card: sparkles *"Ask Recallr about '{query}'"*.

### 14. Categories (`docs/03-screens/categories.md` -> `/categories`, `/categories/[id]`)
- **Desktop:**
  - Category cards grid: Icon tile, Name, Member count in orange corner, Color tag.
  - Dashed "+ New Category" card (opens Category Dialog: Name, Icon picker, Color picker).
  - Category detail (`/categories/[id]`): Filtered contact list with bulk reassign/remove actions.
- **Phone:** Matches `docs/03-screens/categories.md`.

### 15. My Card (`docs/03-screens/my-card.md` -> `/my-card`, `/my-card/edit`, `/my-card/settings`, `/c/[slug]`)
- **Desktop:**
  - Digital card preview with front/back flip (Logo, Name, Role, Company, Contact lines, QR code).
  - Action buttons: "Copy Link", "Save QR Image", "Edit Card", "Card Settings".
  - Edit card: Photo/logo upload, field rows, social links manager with drag-reorder.
  - Card settings: Link active toggle, slug customization, regenerate link button, visibility toggles (Phone, Email, Address, Socials).
  - **Public Card (`/c/[slug]`):** Public responsive page, visible fields, "Save contact" (downloads `.vcf`), "Get Recallr" app link / QR code.
- **Phone:** Matches `docs/03-screens/my-card.md`.

### 16. Settings & Notifications (`docs/03-screens/settings.md` -> `/settings`, `/settings/notifications`)
- **Desktop:** Tabbed settings layout:
  - Account Profile (Name, Phone, Email, Avatar upload).
  - Reminders & Nudges (`/settings/notifications`): Nudge interval (days), default reminder time, snooze minutes, quiet hours toggle & start/end times.
  - AI & Privacy: "Use my notes for AI" toggle, Clear chat history.
  - Danger Zone: Delete account with confirmation modal (type "DELETE").
- **Phone:** Matches `docs/03-screens/settings.md`.

### 17. Onboarding & Starter Categories (`docs/03-screens/onboarding.md` -> `/welcome`, `/sign-in`, `/starter-categories`)
- **Desktop:** Centered card container (max-width 520px) on `#F8F7F4` background.
- **Phone:** Full-screen onboarding carousel.
- **Flow:**
  1. Welcome slides: 3 hero cards showcasing scanning, AI memory, and digital card.
  2. Sign in: Phone OTP or Google OAuth.
  3. Starter categories: Select initial categories (Business, Friends, Work, Family, etc.) or add custom.

### 18. Subscription & Limits (`docs/03-screens/subscription.md` -> `/settings/subscription`, `/upgrade`)
- **Desktop & Web Adaptation:**
  - Plan card: "Current plan: Free" or "Pro", renewal date, OrangeCorner "Manage".
  - "Your usage": ProgressBars for Contacts ({used} of 50), Card scans this month ({used} of 10), AI questions today ({used} of 5).
  - Notice on Web v1: *"To upgrade to Pro or manage billing, open the Recallr app on your iOS or Android device."*
  - Upgrade modal (`/upgrade`): Feature comparison list, Pricing preview.
  - Limit Sheet: Moment-of-need dialog triggered when exceeding Free limits (Scans, Contacts, AI questions).

### 19. Document Viewer (`docs/03-screens/document-viewer.md` -> `/document/[id]`)
- **Web Adaptation:**
  - Images: Displayed in card with pan/zoom and lightbox controls.
  - PDFs: Previewed directly in an embedded browser PDF iframe or opened in a new tab.
  - Action buttons: Share (Web Share / download), Delete (danger with undo toast).
  - Details card (FieldRows): Attached to (person tag), Added date, Size.

### 20. Shared States (`docs/03-screens/shared-states.md`)
- **Loading:** Skeleton rows and cards matching exact layout (no spinners for lists).
- **Empty:** `EmptyState` component with standard copy per screen ("No people yet", "No notes yet", etc.).
- **Error:** Error `EmptyState` with red-tinted icon tile and "Try again" button.
- **Offline:** Top `Banner` ("You're offline. Your changes will sync when you're back online").
- **Undo Toast:** Bottom toast (`#2B2B2B`, `#FFB27F` action text) for 5 seconds on delete (10s on merge).

### 21. Dev Components Parity Showcase (`/dev/components`)
- Hidden internal route displaying every component (`Card`, `OrangeCorner`, `Button`, `Chip`, `Avatar`, `IconTile`, `ListRow`, `FieldRow`, `SearchBar`, `Toggle`, `SegmentedControl`, `ProgressBar`, `Toast`, `Banner`, `EmptyState`, `Skeleton`, `TabBar`, `ScreenHeader`) across all variants and states for side-by-side visual parity audits against mobile.

---

## Web routes mapping

| Route | File Path | Spec File Reference | Access |
|---|---|---|---|
| `/` | `app/(dashboard)/page.tsx` | `home.md` | Authenticated |
| `/people` | `app/(dashboard)/people/page.tsx` | `people.md`, `contact-profile.md` | Authenticated |
| `/people/new` | `app/(dashboard)/people/new/page.tsx` | `contact-form.md` | Authenticated |
| `/people/[id]` | `app/(dashboard)/people/[id]/page.tsx` | `contact-profile.md` | Authenticated |
| `/people/[id]/edit` | `app/(dashboard)/people/[id]/edit/page.tsx`| `contact-form.md` | Authenticated |
| `/merge` | `app/(dashboard)/merge/page.tsx` | `merge-duplicates.md` | Authenticated |
| `/scan` | `app/(dashboard)/scan/page.tsx` | `scan-card.md` | Authenticated |
| `/scan-review` | `app/(dashboard)/scan-review/page.tsx` | `scan-card.md` | Authenticated |
| `/import` | `app/(dashboard)/import/page.tsx` | `import-contacts.md` | Authenticated |
| `/notes` | `app/(dashboard)/notes/page.tsx` | `notes.md` | Authenticated |
| `/notes/new` | `app/(dashboard)/notes/new/page.tsx` | `note-editor.md` | Authenticated |
| `/notes/[id]` | `app/(dashboard)/notes/[id]/page.tsx` | `note-editor.md` | Authenticated |
| `/ask` | `app/(dashboard)/ask/page.tsx` | `ask-ai.md` | Authenticated |
| `/search` | `app/(dashboard)/search/page.tsx` | `search.md` | Authenticated |
| `/categories` | `app/(dashboard)/categories/page.tsx` | `categories.md` | Authenticated |
| `/categories/[id]` | `app/(dashboard)/categories/[id]/page.tsx`| `categories.md` | Authenticated |
| `/my-card` | `app/(dashboard)/my-card/page.tsx` | `my-card.md` | Authenticated |
| `/my-card/edit` | `app/(dashboard)/my-card/edit/page.tsx` | `my-card.md` | Authenticated |
| `/my-card/settings` | `app/(dashboard)/my-card/settings/page.tsx`| `my-card.md` | Authenticated |
| `/document/[id]` | `app/(dashboard)/document/[id]/page.tsx` | `document-viewer.md` | Authenticated |
| `/settings` | `app/(dashboard)/settings/page.tsx` | `settings.md` | Authenticated |
| `/settings/notifications` | `app/(dashboard)/settings/notifications/page.tsx`| `settings.md` | Authenticated |
| `/settings/subscription` | `app/(dashboard)/settings/subscription/page.tsx` | `subscription.md` | Authenticated |
| `/sign-in` | `app/(auth)/sign-in/page.tsx` | `onboarding.md` | Public / Unauth |
| `/welcome` | `app/(auth)/welcome/page.tsx` | `onboarding.md` | Public / Unauth |
| `/starter-categories`| `app/(auth)/starter-categories/page.tsx`| `onboarding.md` | Authenticated |
| `/c/[slug]` | `app/c/[slug]/page.tsx` | `my-card.md` | Public |
| `/dev/components` | `app/dev/components/page.tsx` | `02-design-system.md`, `shared-states.md` | Dev / Internal |

---

## Intentional platform differences & compromises

1. **Card Scanning:** Web uses image upload / drag-and-drop instead of live camera viewfinder. Both use identical image upload storage, `scanCard` Cloud Function, and review UI.
2. **Contact Import:** Web imports `.csv` and `.vcf` files with client-side parsing instead of native phone contacts API (`expo-contacts`).
3. **Reminders & Notifications:** Mobile starts with local notifications (`expo-notifications`). In Phase M6, reminders transition to a Firebase scheduled Cloud Function and Expo Push Notification API so reminders trigger across all user devices.
4. **Subscriptions:** Web v1 shows plan and usage meters and instructs the user to manage purchases in the mobile app (RevenueCat). Direct web billing comes in a future release.
5. **Document Preview:** Photos previewed inline in both. PDFs on mobile open via system viewer; web previews directly in browser iframe or tab.
6. **Sharing & vCard:** Mobile uses native share sheet; web uses Web Share API with automatic fallback to clipboard copy and direct `.vcf` download.
7. **Haptics & Biometrics:** Native only. Web no-ops haptics and uses standard session re-authentication.
