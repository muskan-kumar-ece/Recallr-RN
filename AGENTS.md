# AGENTS.md: Rules for the AI coding agent

Project: **Recallr**, a cross-platform personal CRM and network management application with identical UI, look, and behavior across iOS, Android (`apps/mobile`), and Web (`apps/web`), powered by Firebase Auth, Cloud Firestore, Cloud Storage, and Cloud Functions (`firebase.json`, `firestore.rules`, `storage.rules`, `functions/`), unified design tokens (`packages/tokens`), pure TypeScript domain rules (`packages/core`), and a universal typed data layer (`packages/api`).

## Read first (in this order)
1. `docs/01-product.md` (product scope, promises, glossary)
2. `docs/02-design-system.md` (design tokens, colors, components)
3. `docs/11-monorepo.md` (monorepo architecture, package boundaries, dependency rules)
4. `docs/12-web-app.md` (web layout specifications, responsive breakpoints, platform differences)
5. `docs/08-tech.md` and `docs/09-build-plan.md` (stack, allowed libraries, current phase)
6. For the task at hand: the matching file in `docs/03-screens/`, plus `docs/04-flows.md`, `docs/05-data-model.md`, `docs/06-ai-spec.md`, `docs/07-business-rules.md` as needed.

## Hard rules
1. **The docs are the source of truth.** Never invent screens, fields, tables, colors, copy, libraries or features that are not documented. If something is missing or unclear, STOP and ask. List your assumptions before building.
2. **One phase at a time** (`docs/09-build-plan.md`). Do not start the next phase until the user says so.
3. **Only use the libraries approved in `docs/08-tech.md`.** Ask before adding any other. Install Expo packages with `npx expo install` so versions match the Expo SDK.
4. **No hard-coded colors, radii, font sizes or spacing in screens.** Use tokens from `@recallr/tokens` only.
5. **Component names and props are identical on mobile and web:** `Card`, `OrangeCorner`, `Button`, `Chip`, `Avatar`, `IconTile`, `ListRow`, `FieldRow`, `SearchBar`, `Toggle`, `SegmentedControl`, `ProgressBar`, `BottomSheet` (Web: Dialog or Drawer), `Toast`, `Banner`, `EmptyState`, `Skeleton`, `TabBar`, `ScreenHeader`.
6. **Every screen implements its documented loading (skeleton), empty, error and offline states.**
7. **Same business logic from `packages/core`.** Phone normalization (`phoneKey`), duplicate matching (`isDuplicateMatch`), follow-up rules (`isFollowUpDue`), reminder repeat/snooze calculations, and plans config (`plans.ts`) are implemented only in `packages/core`. Never duplicate a rule in an app.
8. **Monorepo dependency rules:**
   - Apps may import packages.
   - Packages must NEVER import from apps.
   - `packages/core` imports NOTHING UI (no React, no React Native, no DOM).
   - `packages/tokens` contains no runtime dependencies.
9. **Destructive actions use an undo toast, not a confirm popup.** Exceptions are listed in `docs/07-business-rules.md` (delete account, AI delete and bulk actions, regenerate card link).
10. **The AI provider key never goes in the app.** All AI calls go through Firebase Cloud Functions; provider keys are configured as server secrets.
11. **Enforce limits and access on the server** (Firestore Security Rules and Firebase Cloud Functions), not only in the app.
12. **Secrets live in environment variables.** Never commit `.env`. Never log secrets or personal data.
13. **TypeScript strict. No `any`.** Validate forms and Cloud Function inputs with Zod from `packages/core`.
14. **Firestore data and security changes** must update `firestore.rules` or the relevant Cloud Function, then update `docs/05-data-model.md` in the same change. Do not add SQL migrations for Firebase data.
15. **If behavior changes, update the doc in the same change.** Docs and code must never disagree.
16. **Copy text exactly as written in the screen docs.** Do not rewrite UI text.

## Parity verification
- Each app has a hidden `/dev/components` page showing every component and state. Compare mobile and web screenshots of it side by side to check parity.
- Free and Pro limits behave identically on both platforms and are enforced by Firestore Security Rules and Firebase Cloud Functions.

## Workflow for every task
1. Restate the task and list the docs you used.
2. List assumptions and open questions. Wait if any are blocking.
3. Build the smallest thing that satisfies the "Done when" checks.
4. Run `pnpm typecheck`, `pnpm lint`, and `pnpm test`. Fix any errors.
5. Report: what you built, files changed, how to test it, and which "Done when" checks pass.
