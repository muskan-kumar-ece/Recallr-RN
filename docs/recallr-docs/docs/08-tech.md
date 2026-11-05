# 08. Tech and conventions

## Architecture
Recallr is a monorepo managed with **pnpm workspaces** and **Turborepo**:
- **`apps/mobile`:** Native mobile app built with Expo (latest SDK) + React Native + TypeScript (strict) + Expo Router.
- **`apps/web`:** Web application and public card host (`/c/[slug]`) built with Next.js (App Router) + React 19 + TypeScript (strict) + Tailwind CSS.
- **`packages/tokens`:** Design tokens (colors, typography, spacing, radius) exported as TypeScript objects and JSON; single source of truth for both apps.
- **`packages/core`:** Pure TypeScript business logic, types, zod schemas, plans config, and business rules (phone key, duplicate match, follow-up rule, reminder repeat/snooze, vCard builder) with Vitest unit tests. Zero UI dependencies.
- **`packages/api`:** Supabase client factory (with platform-specific storage adapters), generated database types, typed queries, and TanStack Query hooks.
- **`packages/config`:** Shared ESLint, Prettier, and TypeScript configurations.
- **`supabase`:** Shared backend with Postgres, RLS, Storage, and Edge Functions (TypeScript / Deno).
- **Payments:** RevenueCat (Apple and Google in-app subscriptions on mobile); web v1 displays plan and usage with guidance to manage in app.
- **AI:** Provider called exclusively from Supabase Edge Functions with provider API keys stored only in Supabase secrets.

---

## Allowed libraries

### 1. Monorepo & tooling
- Package manager: `pnpm` (>= 9.0)
- Build orchestration: `turbo`
- Testing: `vitest` (packages/core), `jest-expo` and `@testing-library/react-native` (mobile), `@testing-library/react` (web)
- Lint & format: `eslint`, `prettier`

### 2. Shared packages (`@recallr/core`, `@recallr/api`, `@recallr/tokens`)
- Data & Auth: `@supabase/supabase-js`, `@tanstack/react-query`
- Validation & Types: `zod`
- Date handling: `date-fns`

### 3. Web app (`apps/web`) — Proposed for approval
- Framework: `next` (App Router), `react`, `react-dom` (React 19)
- Styling: `tailwindcss`, `postcss`, `autoprefixer`, `clsx`, `tailwind-merge`
- Accessible UI primitives: `@radix-ui/react-dialog`, `@radix-ui/react-dropdown-menu`, `@radix-ui/react-tabs`, `@radix-ui/react-tooltip`, `@radix-ui/react-popover`, `@radix-ui/react-slot`
- Icons: `@tabler/icons-react` (exact visual match to mobile's `@tabler/icons-react-native`)
- QR Code rendering: `qrcode.react`
- Contact Import parsing: `papaparse`, `@types/papaparse`
- State: `zustand` (minimal UI state only)
- Forms: `react-hook-form`, `@hookform/resolvers`

### 4. Mobile app (`apps/mobile`)
- Navigation and core: `expo-router`, `expo-constants`, `expo-linking`, `expo-splash-screen`, `expo-font`, `@expo-google-fonts/inter`, `expo-status-bar`
- Data & Offline: `@tanstack/query-async-storage-persister`, `@tanstack/react-query-persist-client`, `@react-native-async-storage/async-storage`, `expo-secure-store`
- State & Forms: `zustand`, `react-hook-form`, `@hookform/resolvers`
- UI & Gestures: `react-native-reanimated`, `react-native-gesture-handler`, `react-native-safe-area-context`, `react-native-screens`, `@gorhom/bottom-sheet`, `react-native-svg`, `@tabler/icons-react-native`, `expo-haptics`
- Device Capabilities: `expo-camera`, `expo-image-picker`, `expo-image-manipulator`, `expo-document-picker`, `expo-file-system`, `expo-sharing`, `expo-contacts`, `expo-notifications`, `expo-local-authentication`, `expo-clipboard`, `expo-localization`
- QR Code: `react-native-qrcode-svg`
- Payments: `react-native-purchases` (RevenueCat)
- Auth: `expo-auth-session` / Supabase native Google sign-in

---

## Directory layout

```
recallr/
├── apps/
│   ├── mobile/
│   │   ├── app/                      # Expo Router routes
│   │   │   ├── (auth)/               # welcome, sign-in, starter-categories
│   │   │   ├── (tabs)/               # index, people, notes, ask, _layout
│   │   │   ├── contact/              # [id], [id]/edit, new
│   │   │   ├── note/                 # [id], new
│   │   │   ├── category/             # [id]
│   │   │   ├── dev/                  # components parity showcase
│   │   │   └── ...
│   │   ├── src/
│   │   │   ├── components/           # Card, OrangeCorner, Button, Chip, Avatar, etc.
│   │   │   ├── features/             # Feature-specific components
│   │   │   └── lib/                  # Native platform adapters
│   │   └── package.json
│   └── web/
│       ├── app/                      # Next.js App Router
│       │   ├── (auth)/               # sign-in, welcome, starter-categories
│       │   ├── (dashboard)/          # page (home), people, notes, ask, categories, my-card, settings
│       │   ├── c/[slug]/             # public card page
│       │   ├── dev/components/       # parity showcase
│       │   ├── layout.tsx
│       │   └── globals.css
│       ├── src/
│       │   ├── components/           # Same component names and props as mobile
│       │   └── features/
│       └── package.json
├── packages/
│   ├── tokens/                       # src/index.ts, tokens.json, tailwind preset
│   ├── core/                         # src/types, src/schemas, src/rules, src/plans.ts
│   ├── api/                          # src/client.ts, src/hooks, src/database.types.ts
│   └── config/                       # eslint, prettier, tsconfig base files
└── supabase/
    ├── migrations/                   # 0001_init.sql ...
    └── functions/                    # ai-chat, scan-card, etc.
```

---

## Conventions & Rules

1. **Parity in naming and props:** UI components have identical names and props across mobile and web: `Card`, `OrangeCorner`, `Button`, `Chip`, `Avatar`, `IconTile`, `ListRow`, `FieldRow`, `SearchBar`, `Toggle`, `SegmentedControl`, `ProgressBar`, `BottomSheet` (Web: Dialog or Drawer), `Toast`, `Banner`, `EmptyState`, `Skeleton`, `TabBar`, `ScreenHeader`.
2. **Tokens only:** Both apps import all colors, font scales, spacing, and border radii strictly from `@recallr/tokens`. No hardcoded hex codes or arbitrary sizes.
3. **Pure business logic:** Rules like `phoneKey`, `isDuplicateMatch`, `isFollowUpDue`, `advanceReminder`, and `plans.ts` are defined solely in `@recallr/core` and imported by `apps/mobile`, `apps/web`, and Edge Functions. Never duplicate a rule.
4. **Data layer:** Shared TanStack Query hooks live in `@recallr/api`. Query keys follow standard patterns (`['contacts', filters]`, `['notes']`, `['card', slug]`). Mutations use optimistic updates where appropriate.
5. **Validation:** All forms on mobile and web, as well as inputs to Supabase Edge Functions, validate against Zod schemas from `@recallr/core`.
6. **No `any`:** TypeScript strict mode enabled across all packages and applications.
7. **Secrets:** Secrets remain in environment variables (`.env`). App bundles only ever receive public keys (`EXPO_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_URL`, etc.). Server secrets (`AI_PROVIDER_API_KEY`, etc.) live exclusively in Supabase Vault / Edge Function secrets.
