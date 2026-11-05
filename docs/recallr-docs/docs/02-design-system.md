# 02. Design system

Look: **soft white, premium, calm.** White rounded cards on an off-white background. One accent color (orange). The signature element is the **orange curved corner** on cards (inspired by the reference business card).

Implement all values below in `src/theme/tokens.ts`. Screens must import tokens, never type raw values.

## Colors
| Token | Value | Use |
|---|---|---|
| bg | #F8F7F4 | screen background |
| surface | #FFFFFF | cards, inputs, tab bar |
| border | rgba(0,0,0,0.08) | card and divider lines (0.5 px) |
| text | #2B2B2B | primary text |
| textSecondary | #6B6B66 | secondary text, labels |
| textMuted | #8A8A85 | placeholders, inactive tabs |
| accent | #E8641B | primary buttons, links, orange corner, selected chips |
| accentTint | #FDEBDD | avatar and icon tile background, tag background |
| accentTintSoft | #FFF9F4 | selected card background, flagged field row |
| accentDark | #B84A10 | text on accentTint tags |
| danger | #D9483B | delete actions |
| dangerTint | #FBE5E2 | error icon background |
| success | #3B6D11 | success text and icons |
| fill | #ECE9E3 | skeletons, progress track, disabled fills |
| toastBg | #2B2B2B | toast background (action text #FFB27F) |

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
- Card radius 16; input radius 14; button radius 25 (height 50); chip radius 20; bottom sheet top radius 24; avatar and icon buttons fully round; icon tile radius 10 to 12
- Card border 0.5 px `border`, no heavy shadows (only the onboarding hero cards may use a soft shadow)
- Touch targets at least 44 px

## Icons
Use Tabler icons (`@tabler/icons-react-native`). Size 18 to 22. Color `accent` for action icons, `textSecondary` for neutral.

## Components (build these first, in `src/components`)

**Card**: white `surface`, radius 16, border. Props: `padding`, `onPress`. Clips children (overflow hidden).

**OrangeCorner**: absolute bottom right inside a Card. Background `accent` (or category color), top-left radius 40 (24 to 30 on small ones). Content (icon, count or text) is white, sits toward the bottom right. Sizes: `lg` 78x58 (Today card, hero cards), `md` 56x44 (actions), `sm` 48x38 (counts on category cards). Tappable when it carries an action. Content must never overlap text: reserve padding on the card.

**Button**: `primary` (accent fill, white text, height 50, radius 25), `outline` (white, 1 px accent border, accent text), `text` (accent text), `danger` (danger text). Small variant height 44 or 40. Disabled uses `fill` background and `textMuted` text. Show a spinner when loading.

**Chip**: radius 20, padding 6x14, size 12. States: default (white, border), selected (accent fill, white text), outline-accent (accent border and text, used for AI suggestions), dashed (dashed border, accent text, for "+ New"). Tag variant: `accentTint` background, `accentDark` text, size 11.

**Avatar**: round. Photo if present, otherwise initials (500 weight) on `accentTint` with `accent` text. Sizes 32, 38, 40, 64, 84.

**IconTile**: rounded square 32 to 38, `accentTint` background, accent icon.

**ListRow**: padding 11x14, bottom divider 0.5 px, leading (avatar, checkbox or icon tile), title (bodyStrong), subtitle (caption, textSecondary), trailing (tag, chevron, value, toggle). Rows live inside a Card with no gaps.

**FieldRow**: label (caption, textSecondary) left, value (body) right, divider between rows. Used in forms and details.

**SearchBar**: height 42 to 44, white, radius 14, search icon, placeholder textMuted. Focused: 1 px accent border.

**Toggle**: 38x22 track, off `#D6D3CC`, on `accent`, white knob 18.

**SegmentedControl**: track `#EDEBE5` radius 20; selected segment white, 500 weight.

**ProgressBar**: height 6, radius 3, track `fill`, bar `accent`.

**BottomSheet**: top radius 24, handle 40x4 `#D6D3CC`, dimmed backdrop. Use `@gorhom/bottom-sheet`.

**Toast (undo)**: `toastBg`, white text, radius 14, action text `#FFB27F`. Appears 5 seconds above the tab bar.

**Banner**: `accentTint` background, radius 14, padding 10x14, icon accent, text `#8A3A0C`, size 12. Used for offline and duplicate warnings.

**EmptyState**: 56 icon tile (radius 18), title 16/500, one sentence (12, textSecondary), up to two buttons. Error variant: icon tile `dangerTint` with `danger` icon, button "Try again".

**Skeleton**: `fill` blocks, radius 6; rows mimic avatar plus two text bars. No spinners for lists.

**TabBar**: floating white card, radius 22, 5 slots: Home, People, center + (48 px orange circle, raised 22 px, 4 px border in `bg`), Notes, Ask AI. Active tab `accent`, inactive `textMuted`. Labels size 11.

**ScreenHeader**: round 36 to 40 back button (white, border), title, optional right icon buttons (same style).

## Motion and feedback
Gentle spring animations; haptic tap (`expo-haptics`) on save, complete and delete; bottom sheets slide up; no long animations.

## Copy style
Short, friendly, plain English. Buttons are verbs ("Save to Recallr"). No exclamation marks. Numbers use Indian rupee symbol where prices appear (prices come from the store, see business rules).
