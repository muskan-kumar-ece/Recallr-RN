# 09. Build plan (Monorepo phases)

Rules: One phase at a time. At the start of each phase the agent lists assumptions and open questions. At the end it reports what was built, how to run and test it, and which "Done when" checks pass. The user must approve before the next phase begins.

---

## Phase M0: Workspace setup
- **Scope:** Monorepo scaffolding with pnpm workspaces and Turborepo.
- **Tasks:**
  - Setup root `pnpm-workspace.yaml`, `turbo.json`, and root `package.json`.
  - Create package directories:
    - `packages/config/` (shared tsconfig base, eslint, prettier).
    - `packages/tokens/` (empty package shell).
    - `packages/core/` (empty package shell).
    - `packages/api/` (empty package shell).
  - Scaffold application shells:
    - `apps/mobile/` (Expo + React Native + Expo Router shell).
    - `apps/web/` (Next.js App Router + TypeScript + Tailwind CSS shell).
  - Configure root scripts: `dev`, `build`, `lint`, `typecheck`, `test`, `clean`.
- **Done when:**
  - `pnpm install` installs cleanly with zero dependency conflicts.
  - `pnpm typecheck`, `pnpm lint`, and `pnpm test` run and exit 0 across all workspaces.
  - `pnpm dev:web` boots Next.js with placeholder home; `pnpm dev:mobile` boots Expo.

---

## Phase M1: `packages/tokens` and `packages/core` with unit tests
- **Scope:** Foundation design tokens and pure business logic package.
- **Tasks:**
  - `packages/tokens`:
    - Define all color tokens (`bg`, `surface`, `border`, `text`, `textSecondary`, `textMuted`, `accent`, `accentTint`, `accentTintSoft`, `accentDark`, `danger`, `dangerTint`, `success`, `fill`, `toastBg`, category colors).
    - Define typography scale (Inter weights 400 and 500).
    - Define spacing, radius, and shadow tokens.
    - Export TypeScript constants and Tailwind CSS preset for web.
  - `packages/core`:
    - Core domain types and Zod schemas for validation.
    - Centralized plans configuration (`plans.ts`) with Free and Pro quotas.
    - Business rules:
      - `phoneKey(phone)`: Strip non-digits and take right 10 digits.
      - `emailKey(email)`: Trim and lowercase.
      - `isDuplicateMatch(candidate, existing)`: 3-way match logic.
      - `isFollowUpDue(contact, nudgeDays, now)`: "Needs follow-up" rule.
      - `advanceReminder(remindAt, repeat, now)`: Repeat calculation (clamping to month ends).
      - `snoozeReminder(remindAt, snoozeMinutes)`: Snooze logic.
      - `vCardBuilder`: Pure TS `.vcf` vCard string builder and parser.
  - Comprehensive unit tests in Vitest covering all rules and edge cases.
- **Done when:**
  - All unit tests in `packages/core` pass (100% test coverage on business rules).
  - Tokens importable by both TS and CSS/Tailwind setups.

---

## Phase M2: Supabase backend setup & Edge Functions skeletons
- **Scope:** Database schema initialization, RLS policies, type generation, and Edge Functions.
- **Tasks:**
  - Run `docs/sql/0001_init.sql` against the Supabase instance.
  - Verify all tables, triggers, constraints, RLS policies, storage buckets (`contact-files`, `card-assets`), and RPCs (`get_public_card`).
  - Generate TypeScript database types into `packages/api/src/database.types.ts`.
  - Create Supabase Edge Functions skeletons with zod input validation, JWT verification, and error contracts:
    - `ai-chat`
    - `ai-confirm`
    - `scan-card`
    - `summarize-contact`
    - `suggest-categories`
    - `delete-account`
    - `revenuecat-webhook`
  - Ensure Edge Functions import or mirror plan quotas and validation rules from `packages/core`.
- **Done when:**
  - Database schema is fully applied and verified with RLS enabled.
  - `pnpm db:types` executes and generates clean, strict TypeScript types without errors.
  - Edge Function skeletons pass typecheck and handle authorization headers correctly.

---

## Phase M3: `packages/api` data layer & hooks
- **Scope:** Universal Supabase client factory and shared TanStack Query hooks.
- **Tasks:**
  - Implement Supabase client factory supporting platform-specific auth storage (`expo-secure-store` / AsyncStorage on mobile, cookie/localStorage on web).
  - Implement typed query functions and mutations for:
    - Contacts (list, detail, create, update, soft delete, restore, search).
    - Categories (list, create, update, delete).
    - Notes & Reminders (list, create, update, complete, snooze, soft delete).
    - Digital Cards (my-card, update card, settings, public card lookup).
    - User settings and profile.
    - Entitlements and usage counters.
    - AI conversations and pending action confirmation.
  - TanStack Query custom hooks with optimistic updates and cache management.
- **Done when:**
  - Queries and mutations are fully typed against the database schema.
  - Unit tests verify client factory and query key stability.

---

## Phase M4: Mobile app (`apps/mobile`)
- **Scope:** Complete native mobile app (iOS & Android) following phases 1 to 8 of the mobile specification.
- **Tasks:**
  - Design system components (`Card`, `OrangeCorner`, `Button`, `Chip`, `Avatar`, `IconTile`, `ListRow`, `FieldRow`, `SearchBar`, `Toggle`, `SegmentedControl`, `ProgressBar`, `BottomSheet`, `Toast`, `Banner`, `EmptyState`, `Skeleton`, `TabBar`, `ScreenHeader`).
  - Hidden `/dev/components` parity showcase route showing all components and states.
  - Auth (phone OTP & Google) and onboarding flow (welcome slides, starter categories).
  - Categories and Contacts (People list, sections, A-Z index, filters, Contact profile, add/edit forms, duplicate banner, merge flow).
  - Notes, Reminders, local notification actions (Done, Snooze, Open), Home screen assembly (Today card, quick actions, categories, needs follow-up).
  - Capture flows (camera screen with manual shutter, image upload, `scan-card`, review screen with confidence flags, phone contact import, share sheet, document viewer).
  - Search and Ask AI chat (read tools, person cards, sources, proposal confirm cards, undo toast).
  - My Card (QR display, edit, settings, visibility toggles).
  - Subscription UI (limits sheet, upgrade modal, RevenueCat integration).
  - Settings, notification settings, app lock, delete account, and offline sync verification.
- **Done when:**
  - Mobile app builds and runs smoothly on iOS and Android.
  - Passes all mobile "Done when" checks from `docs/03-screens/`.
  - `/dev/components` renders all components accurately.

---

## Phase M5: Web app (`apps/web`)
- **Scope:** Full web application and public card host with responsive layouts.
- **Tasks:**
  - Web design system components implementing exact same names, props, and design tokens as mobile.
  - Hidden `/dev/components` parity showcase route on web.
  - Public digital card page at `/c/[slug]` (first priority for QR resolution): displays public fields, "Save contact" (downloads `.vcf`), "Get Recallr" app links, handles universal link deep links.
  - Web Auth (sign-in with OTP and Google) and onboarding flow.
  - Responsive shell layout: Left navigation sidebar + Top bar (Search + Quick Add) on desktop; floating bottom `TabBar` on phone width (< 768px).
  - Home screen (Today card, quick action grid, categories, needs follow-up).
  - People screen with **desktop split-view** (left: virtualized contact list, search, filters; right: full contact profile) and phone single-column view.
  - Contact Form (dialog on desktop, full-screen on mobile).
  - Quick Add modal dialog.
  - Scan card: File drag-and-drop upload zone -> `scan-card` -> review screen with confidence flags.
  - Contact import: CSV / vCard file upload with header mapping and duplicate skipping.
  - Notes & Reminders list and Note Editor dialog.
  - Ask AI conversational interface with message history, person cards, sources, suggestion chips, and confirm cards.
  - Categories management grid and detail view.
  - My Card preview, QR generator, edit modal, and card settings.
  - Settings and subscription view (plan status, usage meters, "Manage in the app" notice).
- **Done when:**
  - Web app is fully functional across desktop, tablet, and mobile browsers.
  - `/c/[slug]` downloads a valid `.vcf` vCard matching visibility settings.
  - `/dev/components` visually matches the mobile `/dev/components` screen.

---

## Phase M6: Server-scheduled reminders & push notifications (Subject to approval)
- **Scope:** Cross-device reminder synchronization and notification delivery.
- **Tasks:**
  - Setup Supabase `pg_cron` schedule or background worker Edge Function (`dispatch-reminders`) running every minute.
  - Identify due, undone reminders (`remind_at <= now() and done_at is null and deleted_at is null`).
  - Send push notifications to the user's mobile devices via the Expo Push Notification API.
  - Web Push notification support via browser PushManager for active web sessions.
  - Handle actions (Done, Snooze) from push notifications.
  - Respect user quiet hours and timezone settings.
- **Done when:**
  - A reminder created on Web triggers a push notification on the user's phone at the exact scheduled time.
  - Completing or snoozing the reminder updates database state across all clients.

---

## Phase M7: Parity QA, end-to-end verification & release
- **Scope:** Comprehensive parity verification across iOS, Android, and Web.
- **Tasks:**
  - Run the full Parity Checklist.
  - Verify data synchronizes bi-directionally between mobile and web.
  - Verify server limits (Free: 50 contacts, 10 scans/mo, 5 AI questions/day) behave identically on both platforms.
  - Audit accessibility (WCAG AA, 44px touch targets, keyboard navigation on web).
  - Prepare production builds: EAS build for mobile and Next.js production build / deployment.
- **Done when:**
  - All items on the Parity Checklist are marked complete.
  - Zero TypeScript or lint errors across the monorepo.

---

## Parity checklist (Run at end of M5 and M7)

- [ ] `/dev/components` looks the same on mobile and web
- [ ] Every screen in `docs/03-screens/` exists on both, or is listed as an intentional difference in `docs/12-web-app.md`
- [ ] Same copy, states and limits on both
- [ ] Same data: a contact created on mobile shows on web and the other way round
- [ ] Free and Pro limits behave the same on both (enforced on the server)
