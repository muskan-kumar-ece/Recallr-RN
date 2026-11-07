# Prototype archive & reusable assets

This directory archives the early prototype and reference implementations created prior to the monorepo restructuring.

---

## Directory layout

```
docs/reference/prototype/
├── html-pages/                 # Interactive HTML sketches and prototypes
│   ├── css/
│   │   ├── global.css
│   │   ├── recallr.css         # UI component reference styling
│   │   └── tokens.css          # Design tokens and CSS variable reference
│   ├── js/
│   │   └── nav-hub.js
│   ├── index.html              # Interactive prototype hub
│   └── recallr_*.html          # 14 screen sketches
└── mobile-app-mock/            # Initial single-app Expo prototype
    ├── app/                    # Prototype Expo Router screens
    └── src/                    # Prototype components, theme, and mock contexts
```

---

## Reusable vs. Replaced inventory

### Reusable assets (To leverage during M1 - M5)
1. **Design Tokens & CSS Variables (`tokens.css`, `recallr.css`):**
   - Exact hex colors (`#F8F7F4`, `#FFFFFF`, `#E8641B`, `#FDEBDD`, `#2B2B2B`, etc.).
   - Card dimensions, corner radiuses (`16px`, `40px` for large orange corner), and timing curves (`cubic-bezier(0.165, 0.84, 0.44, 1)`).
   - Reused to populate `@recallr/tokens` TS constants and Tailwind preset.
2. **Component Structures (`mobile-app-mock/src/components/ui/`):**
   - `Card.tsx`, `OrangeCorner.tsx`, `Button.tsx`, `Chip.tsx`, `ListRow.tsx`, `EmptyState.tsx`, `BottomSheet.tsx`.
   - Provide direct architectural and JSX templates for `@recallr/tokens`-backed shared implementations across `apps/mobile` and `apps/web`.
3. **Mock Fixture Data (`mobile-app-mock/src/data/mockData.ts`):**
   - Realistic contacts, categories, and reminders data for unit tests and local component showcases (`/dev/components`).
4. **HTML Sketches (`html-pages/*.html`):**
   - Provide visual layout references and interactive states for desktop/mobile responsive styling.

### Replaced components & infrastructure (Built clean in monorepo)
1. **Workspace Root:** Single root `package.json`, `app.json`, and `tsconfig.json` are replaced by Turborepo + pnpm monorepo structure.
2. **Hardcoded Styling:** Ad-hoc inline CSS and raw values in mock components are replaced with strictly typed tokens from `@recallr/tokens`.
3. **Data Types:** Prototype types are replaced by shared domain types in `packages/core` and Firebase document adapters in `packages/api`.
4. **Client & Auth:** Prototype-only local mock auth is replaced by the Firebase Auth integration in `@recallr/api` and the native Firebase adapter in `apps/mobile`.
5. **Business Logic:** Logic embedded in screens is consolidated into pure TypeScript functions with unit test coverage in `packages/core`.
