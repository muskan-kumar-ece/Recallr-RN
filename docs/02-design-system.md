# 02. Design system

Look: **soft white, premium, calm.** White rounded cards on an off-white background (`#F2F0EB`). One accent color (orange). The signature element is the **orange curved corner** on cards (inspired by the reference business card).

Implement all values below in `packages/tokens/src/index.ts`. Screens must import tokens, never type raw values.

## Colors
| Token | Value | Use |
|---|---|---|
| bg | #F2F0EB | screen background |
| surface | #FFFFFF | cards, inputs on bg, tab bar |
| border | rgba(0,0,0,0.05) | card and divider lines (0.5 px) |
| text | #2B2B2B | primary text |
| textSecondary | #6B6B66 | secondary text, labels |
| textMuted | #8A8A85 | placeholders, inactive tabs |
| accent | #E8641B | primary buttons, links, orange corner, selected chips |
| accentTint | #FDEBDD | avatar and icon tile background, tag background, active nav pill |
| accentTintSoft | #FFF9F4 | selected card background, flagged field row |
| accentDark | #B84A10 | text on accentTint tags |
| danger | #D9483B | delete actions, overdue/due-today badge |
| dangerTint | #FBE5E2 | error icon background |
| success | #3B6D11 | success text and icons |
| fill | #ECE9E3 | skeletons, progress track, disabled fills |
| toastBg | #2B2B2B | toast background (action text #FFB27F) |
| pressedRow | #F5F3EE | active row press state background |
| inputCardFill | #F7F6F2 | inputs placed inside white cards |

Category colors (user choice): #E8641B, #4F5BD5, #1D9E75, #D4537E, #444441. A category tile uses its color for the icon and 15% opacity for the tile background. Default is accent.

## Typography (Inter, weights 400 and 500 only)
| Token | Size / weight | Use |
|---|---|---|
| titleLg | 24 / 500 | onboarding and paywall titles |
| title | 20 to 22 / 500 | screen titles |
| section | 15 / 500 | section headers |
| body | 14 / 400 | default text |
| bodyStrong | 14 / 500 | names, row titles |
| small | 12 / 400 | secondary text, chips |
| caption | 11 / 400 | meta text, labels |
Line height 1.4. Minimum text size 11.

## Spacing and shape
- Screen horizontal padding: 14
- Gap between sections: 16 to 18; between cards: 10 to 12
- Card radius 16; input radius 14; button radius 25 (height 50); chip radius 20; bottom sheet top radius 24; tabBar radius 30; avatar and icon buttons fully round; icon tile radius 10 to 12
- Card border 0.5 px `border`. Cards on `bg` use `shadowCard`. Cards inside cards stay flat with border only.
- Inputs and SearchBar on `bg` stay white; inputs inside a card use fill `#F7F6F2`.
- Touch targets at least 44 px.

## Shadows & Elevation
| Token | Value | Use |
|---|---|---|
| shadowCard | 0 1px 2px rgba(0,0,0,.04), 0 6px 16px rgba(0,0,0,.05) | Cards placed on screen `bg` |
| shadowNav | 0 2px 4px rgba(0,0,0,.05), 0 10px 28px rgba(0,0,0,.10) | Floating bottom navigation bar |
| shadowAccent | 0 8px 18px rgba(232,100,27,.40) | Raised center + action button glow |

## Interaction and motion
- **PressableScale**: Single shared component used everywhere for pressables (buttons, chips, tiles, cards with `onPress`, list rows, icon buttons).
  - Mobile: Reanimated on UI thread, scales to `0.97` on press in within 80 ms, releases with a spring, reacts within 100 ms. Android adds ripple.
  - Web: Hover effect, active scale `0.98`, focus-visible ring.
  - Accessibility: Respects system "reduce motion" setting (skips scale, rotation, and slide animations; keeps simple fades).
- **Motion timings**:
  - `pressIn`: 80 ms
  - `pressRelease`: spring
  - `contentFade`: 180 ms
  - `sheetsSpring`: ~280 ms
  - Maximum animation duration: 350 ms
- **Haptics** (`expo-haptics` wrapper, no-op on web):
  - `light`: Primary actions, button clicks, icon actions
  - `selection`: Tab change, chip select, toggle
  - `success`: Save, complete reminder
  - `warning`: Delete, destructive actions
- **Button states**:
  - `loading`: Spinner positioned inside overlay, width does NOT jump, double taps ignored.
  - `disabled`: Fill background, muted text, no press response.
- **List rows**:
  - Background transitions to `pressedRow` (`#F5F3EE`) on press.

## Components (in `src/components`)

**Card**: white `surface`, radius 16, border `0.5px rgba(0,0,0,.05)`. Cards on `bg` get `shadowCard`. Props: `padding`, `onPress`, `flat` (for cards inside cards). Clips children (overflow hidden).

**OrangeCorner**: absolute bottom right inside a Card. Background `accent` (or category color), top-left radius 40 (24 to 30 on small ones). Content (icon, count or text) is white, sits toward the bottom right. Sizes: `lg` 78x58 (Today card, hero cards), `md` 56x44 (actions), `sm` 48x38 (counts on category cards). Tappable when it carries an action. Content must never overlap text: reserve padding on the card.

**Button**: `primary` (accent fill, white text, height 50, radius 25), `outline` (white, 1 px accent border, accent text), `text` (accent text), `danger` (danger text). Small variant height 44 or 40. Disabled uses `fill` background and `textMuted` text. Spinner overlay when loading (zero width jump).

**Chip**: radius 20, padding 6x14, size 12. States: default (white, border), selected (accent fill, white text), outline-accent (accent border and text, used for AI suggestions), dashed (dashed border, accent text, for "+ New"). Tag variant: `accentTint` background, `accentDark` text, size 11.

**Avatar**: round. Photo if present, otherwise initials (500 weight) on `accentTint` with `accent` text. Sizes 32, 38, 40, 64, 84.

**IconTile**: rounded square 32 to 38, `accentTint` background, accent icon.

**ListRow**: padding 11x14, bottom divider 0.5 px, leading (avatar, checkbox or icon tile), title (bodyStrong), subtitle (caption, textSecondary), trailing (tag, chevron, value, toggle). Rows live inside a Card with no gaps. Row background transitions to `pressedRow` on press.

**FieldRow**: label (caption, textSecondary) left, value (body) right, divider between rows. Used in forms and details.

**SearchBar**: height 42 to 44, white, radius 14, search icon, placeholder textMuted. Focused: 1 px accent border.

**Toggle**: 38x22 track, off `#D6D3CC`, on `accent`, white knob 18. Selection haptic on toggle.

**SegmentedControl**: track `#EDEBE5` radius 20; selected segment white, 500 weight.

**ProgressBar**: height 6, radius 3, track `fill`, bar `accent`.

**BottomSheet**: top radius 24, handle 40x4 `#D6D3CC`, dimmed backdrop. Mobile uses `@gorhom/bottom-sheet`. Web uses Radix Dialog or Drawer.

**Toast (undo)**: `toastBg`, white text, radius 14, action text `#FFB27F`. Appears 5 seconds above the tab bar.

**Banner**: `accentTint` background, radius 14, padding 10x14, icon accent, text `#8A3A0C`, size 12. Used for offline and duplicate warnings.

**EmptyState**: 56 icon tile (radius 18), title 16/500, one sentence (12, textSecondary), up to two buttons. Error variant: icon tile `dangerTint` with `danger` icon, button "Try again".

**Skeleton**: `fill` blocks, radius 6; shimmer sweep. Only shown when no cached data is available, with 150 ms appearance delay and 300 ms minimum display time.

**TabBar**: floating white pill, radius 30, `shadowNav`, 12px from bottom plus safe area inset, hides when keyboard is open. 5 slots: Home, People, center + (54 px accent circle, raised 28 px, 4 px border in `bg`, `shadowAccent`, press scales to 0.92, rotates 45° into X while Quick Add is open), Notes, Ask AI. Active tab: filled icon in accent, `accentTint` pill (52x30) behind icon, label accent weight 500. Inactive: outline icon, textMuted. Notes tab badge shows count of reminders due today and overdue (`#D9483B`, max "9+").

**ScreenHeader**: round 36 to 40 back button (white, border), title, optional right icon buttons (same style).

## Copy style
Short, friendly, plain English. Buttons are verbs ("Save to Recallr"). No exclamation marks. Numbers use Indian rupee symbol where prices appear (prices come from the store, see business rules).
