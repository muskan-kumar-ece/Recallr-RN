# 11. Monorepo architecture & workspace guide

Recallr is structured as a TypeScript monorepo powered by **pnpm workspaces** and **Turborepo**. Both the mobile app (iOS & Android via Expo) and the web app (Next.js App Router) share the exact same design tokens, core business logic, validation schemas, API hooks, and Supabase backend.

---

## Directory structure

```
recallr/
├── apps/
│   ├── mobile/             # Expo + React Native + Expo Router (iOS & Android)
│   └── web/                # Next.js (App Router) + TypeScript + Tailwind CSS
├── packages/
│   ├── tokens/             # Design tokens (colors, typography, spacing, radius)
│   ├── core/               # Pure TypeScript business rules, zod schemas, types, unit tests
│   ├── api/                # Supabase client factory, typed queries, TanStack Query hooks
│   └── config/             # Shared ESLint, Prettier, and TypeScript configurations
├── supabase/               # Backend: migrations, Edge Functions, seed, config
├── docs/                   # Documentation and specifications (source of truth)
├── package.json            # Monorepo root workspace configuration
├── pnpm-workspace.yaml     # pnpm workspace definition
├── turbo.json              # Turborepo task pipeline configuration
└── AGENTS.md               # Rules for AI coding agents
```

---

## Workspace & package responsibilities

### `apps/mobile` (Expo + React Native)
- **Role:** The native mobile application for iOS and Android.
- **Framework:** Expo (latest supported SDK) + React Native + Expo Router.
- **Native Directories:** `ios/` and `android/` are generated dynamically via `expo prebuild` and are **never** manually edited.
- **Responsibilities:**
  - Route navigation via Expo Router file-based routing.
  - Native device integrations: Camera (`expo-camera`), Contacts (`expo-contacts`), Haptics (`expo-haptics`), SecureStore (`expo-secure-store`), Notifications (`expo-notifications`), Sharing (`expo-sharing`).
  - Screen layouts matching `docs/03-screens/`.
  - Component parity via `@recallr/tokens` and `@recallr/core`.
  - Hidden `/dev/components` route for visual regression and design system parity check.

### `apps/web` (Next.js App Router)
- **Role:** The complete web application and public card host.
- **Framework:** Next.js (App Router) + React 19 + TypeScript (strict) + Tailwind CSS.
- **Responsibilities:**
  - Hosts the authenticated web application (matching all mobile screens with responsive desktop/tablet layout adaptations).
  - Hosts the public digital card page at `/c/[slug]` (which handles universal link deep links and vCard `.vcf` downloads).
  - Phone width (< 768px): Exact UI parity with mobile, including floating `TabBar` and raised + button.
  - Tablet & Desktop (>= 768px): Responsive split-view layouts (People list + Contact profile), left navigation sidebar, and top bar with global search & Quick Add.
  - Web file uploads for business card scanning and CSV/vCard contact imports.
  - Hidden `/dev/components` route for visual parity verification side-by-side with mobile.

### `packages/tokens` (Design tokens)
- **Role:** Single source of truth for all visual values across both platforms.
- **Format:** Pure TypeScript constants and JSON output.
- **Exports:**
  - Colors (`bg`, `surface`, `border`, `text`, `textSecondary`, `textMuted`, `accent`, `accentTint`, `accentTintSoft`, `accentDark`, `danger`, `dangerTint`, `success`, `fill`, `toastBg`, category colors).
  - Typography scales (Inter: `titleLg`, `title`, `section`, `body`, `bodyStrong`, `small`, `caption`).
  - Spacing and Radii (screen horizontal padding 14, card radius 16, button radius 25, input radius 14, chip radius 20, etc.).
  - Tailwind CSS plugin / configuration preset for `apps/web`.
  - Zero UI runtime dependencies.

### `packages/core` (Domain logic & schemas)
- **Role:** Pure TypeScript business logic, models, validation schemas, and configuration.
- **Dependencies:** **Zero UI dependencies.** (No React, no React Native, no DOM).
- **Contents:**
  - **Types:** Contact, Category, Note, Reminder, Card, Entitlement, UserSettings, AI blocks.
  - **Zod schemas:** Input validation for forms (contact, note, card, settings) and Edge Function payloads.
  - **Plans configuration (`plans.ts`):** Free and Pro quotas (50 contacts, 10 scans/mo, 5 AI questions/day, 1 card on Free; unlimited on Pro).
  - **Business rules:**
    - `phoneKey(phone)`: Normalization to last 10 digits (`\D` stripped).
    - `emailKey(email)`: Lowercase trimmed email.
    - `isDuplicateMatch(candidate, existing)`: Duplicate detection matching algorithm.
    - `isFollowUpDue(contact, nudgeDays, now)`: "Needs follow-up" calculation.
    - `advanceReminder(remindAt, repeat, now)`: Recurrence calculation for daily, weekly, and monthly repeating reminders (clamped to month ends).
    - `snoozeReminder(remindAt, snoozeMinutes)`: Snooze calculation.
    - `vCardBuilder`: Standard `.vcf` vCard generator for sharing and public card download.
  - **Unit tests:** Comprehensive Vitest tests verifying all business rules and edge cases.

### `packages/api` (Shared client & data hooks)
- **Role:** Universal typed data layer for Supabase and TanStack Query.
- **Contents:**
  - Supabase client factory: Configures `@supabase/supabase-js` with platform-specific auth storage (`expo-secure-store` / AsyncStorage on mobile, cookies / localStorage on web).
  - Database TypeScript types generated directly from `supabase/migrations/0001_init.sql`.
  - Typed queries & mutations: Contacts, categories, notes, reminders, cards, settings, AI chats.
  - Shared TanStack Query hooks (`useContacts`, `useContact`, `useNotes`, `useCategories`, `useMyCard`, `useAIChat`, etc.).
  - Offline cache persistence and optimistic mutation helpers.

### `packages/config` (Shared tooling configs)
- **Role:** Shared linting, formatting, and compiler configs.
- **Contents:**
  - TypeScript base configs (`tsconfig.base.json`, `tsconfig.react.json`, `tsconfig.node.json`).
  - ESLint configuration.
  - Prettier configuration.

### `supabase` (Backend workspace)
- **Role:** Backend database, migrations, security, and serverless compute.
- **Contents:**
  - `supabase/migrations/`: SQL migration files (`0001_init.sql` etc.) with RLS policies and triggers.
  - `supabase/functions/`: Deno Edge Functions (`ai-chat`, `ai-confirm`, `scan-card`, `summarize-contact`, `suggest-categories`, `delete-account`, `revenuecat-webhook`, `_shared/`).
  - `supabase/seed.sql`: Local development test seed data.

---

## Dependency rules

To maintain modularity and avoid circular dependencies, the monorepo strictly enforces these dependency rules:

```
┌──────────────────────────────────────────────┐
│                  apps/                       │
│        apps/mobile      apps/web             │
└──────────────┬───────────────────┬───────────┘
               │                   │
               ▼                   ▼
┌──────────────────────────────────────────────┐
│                 packages/                    │
│      packages/api         packages/tokens    │
│              │                               │
│              ▼                               │
│      packages/core                           │
│              │                               │
│              ▼                               │
│      packages/config                         │
└──────────────────────────────────────────────┘
```

1. **Apps may import packages:** Both `apps/mobile` and `apps/web` can import from `@recallr/tokens`, `@recallr/core`, `@recallr/api`, and `@recallr/config`.
2. **Packages must never import from apps:** No file in `packages/*` may ever import from `apps/mobile` or `apps/web`.
3. **Core is pure TypeScript:** `packages/core` must not import any UI framework (React, React Native, Tailwind, HTML DOM) or network libraries. It only imports pure utilities (such as `zod` and `date-fns`).
4. **Tokens are pure data:** `packages/tokens` contains no runtime dependencies.
5. **Edge Functions share domain logic:** Edge Functions in `supabase/functions/` share business rules and plan limits with `packages/core`.
6. **No circular dependencies:** Package dependency hierarchy is strictly acyclic: `config` -> `tokens` -> `core` -> `api` -> `apps`.

---

## Monorepo scripts

Root commands execute across workspaces via Turborepo:

| Command | Action |
|---|---|
| `pnpm dev` | Starts all development servers concurrently (mobile + web). |
| `pnpm dev:mobile` | Starts the Expo development server (`apps/mobile`). |
| `pnpm dev:web` | Starts the Next.js development server on `http://localhost:3000` (`apps/web`). |
| `pnpm build` | Builds all packages and applications for production. |
| `pnpm lint` | Runs ESLint across all workspaces. |
| `pnpm typecheck` | Runs `tsc --noEmit` across all workspaces. |
| `pnpm test` | Runs unit tests across all packages (Vitest for core, Jest for apps). |
| `pnpm clean` | Cleans `.turbo`, `dist`, `.next`, and cache folders across the monorepo. |
| `pnpm db:types` | Generates TypeScript database types into `packages/api`. |

---

## Turborepo configuration (`turbo.json`)

```json
{
  "$schema": "https://turbo.build/schema.json",
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": [".next/**", "!.next/cache/**", "dist/**"]
    },
    "typecheck": {
      "dependsOn": ["^build"]
    },
    "lint": {},
    "test": {
      "dependsOn": ["^build"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    }
  }
}
```

---

## How to run everything

### 1. Prerequisites
- **Node.js:** v20.x or v22.x LTS
- **pnpm:** v9.x or later (`npm install -g pnpm`)
- **Supabase CLI:** (`npm install -g supabase` or brew/scoop)
- **Expo CLI / EAS CLI:** (`npm install -g eas-cli`)

### 2. Initial setup
```bash
# Clone and enter directory
cd recallr

# Install all dependencies across the monorepo
pnpm install

# Setup environment variables
cp .env.example .env
cp apps/mobile/.env.example apps/mobile/.env
cp apps/web/.env.example apps/web/.env
```

### 3. Local Supabase backend
```bash
# Start local Supabase containers (Postgres, Auth, Storage, Edge Functions)
supabase start

# Apply database migration
supabase db reset

# Generate TypeScript types into packages/api
pnpm db:types
```

### 4. Running applications
```bash
# Run both mobile and web together:
pnpm dev

# Or run mobile only:
pnpm --filter @recallr/mobile dev

# Or run web only:
pnpm --filter @recallr/web dev
```

### 5. Running tests and verification
```bash
# Run all unit tests:
pnpm test

# Run strict type checking:
pnpm typecheck

# Run linting:
pnpm lint
```
