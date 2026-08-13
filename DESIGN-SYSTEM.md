# Mexcon Autos — Design System

Single source of truth for the UI: tokens, reusable components, conventions, and usage.

Live preview: **`/design-system`** (dev server, no admin login required).

---

## Principles

1. **One import path** — everything ships from `@/components/common` (barrel `src/components/common/index.ts`).
2. **Tailwind v4 tokens first** — colors/typography/elevation/radius are theme variables in `src/styles/index.css`; no hardcoded hexes in components.
3. **Accessible by default** — semantic roles (`tablist`, `switch`, `separator`, `alert`), keyboard navigation, focus rings, `aria-*` wiring.
4. **Tested primitives** — every component has a colocated `*.test.tsx` (Vitest + Testing Library).
5. **Brand-consistent** — green `primary` for actions/status, yellow `accent` for highlights, `metallic`/`dark` for neutrals, DM Sans (UI) + Barlow Condensed (display).

---

## Design Tokens

Defined in the `@theme` block of `src/styles/index.css` and usable as normal utilities.

### Colors

| Family | Purpose | Example utilities |
| --- | --- | --- |
| `primary` (green, 50–950) | Actions, success, brand | `bg-primary-600`, `text-primary-700` |
| `accent` (yellow, 50–950) | Highlights, CTA accents | `bg-accent-400`, `text-accent-700` |
| `lime` (50–950) | Light streaks, secondary green | `bg-lime-200` |
| `metallic` (grey, 50–950) | Neutrals, borders, muted text | `text-metallic-600`, `bg-metallic-100` |
| `dark` (black, 50–950) | Headers, footers, dark surfaces | `bg-dark-900`, `text-white` |

### Semantic tokens

| Token | Value | Usage |
| --- | --- | --- |
| `surface` | `#ffffff` | Default page/card background |
| `surface-muted` | `#f8fafc` | Alternating sections, code chips |
| `ink` | `#0f172a` | Primary text/headings |
| `ink-muted` | `#475569` | Secondary text |
| `ink-subtle` | `#64748b` | Hints, captions, labels |
| `line` | `#e2e8f0` | Borders, dividers |
| `line-strong` | `#cbd5e1` | Hover borders, stronger dividers |

### Elevation & radius

| Token | Utility |
| --- | --- |
| `--shadow-card` | `shadow-card` |
| `--shadow-card-hover` | `shadow-card-hover` |
| `--shadow-pop` | `shadow-pop` (toasts, dropdowns) |
| `--shadow-modal` | `shadow-modal` |
| `--radius-card` | `rounded-card` (1rem) |
| `--radius-pill` | `rounded-pill` (9999px) |

### Typography

- **UI font**: DM Sans — set on `body`; `--font-sans`.
- **Display font**: Barlow Condensed — class `font-display`, use for hero/section headlines with `uppercase tracking-tight`.
- Scale follows Tailwind defaults (`text-xs` → `text-7xl`); headings `font-bold`, buttons `font-semibold`, body `font-normal`.

---

## Components

| Component | Purpose | Key props |
| --- | --- | --- |
| `Button` | Primary action; renders `button`/`a`/`span`/`label` | `variant` (primary/secondary/outline/ghost/danger), `size`, `isLoading`, `leftIcon`, `rightIcon`, `as`, `href` |
| `Badge` | Status/emphasis chip | `variant` (primary/success/warning/error/info/secondary), `size` |
| `Alert` | Inline feedback, optionally closable | `severity` (info/success/warning/error), `message`, `closable`, `onClose` |
| `Card` | Surface with optional hover lift | `hover`, `onClick` |
| `Input` | Text field (self-contained label/error) | `label`, `error`, `helperText` |
| `Textarea` | Multi-line text field | `label`, `error`, `helperText` |
| `Select` | Dropdown (options array or children) | `label`, `error`, `options`, `placeholder` |
| `Radio` / `Checkbox` | Selection controls | `label`, `error`, `helperText` |
| `Switch` | On/off toggle (role=switch) | `checked`, `onCheckedChange`, `label`, `size` |
| `FormField` | Label + hint/error wrapper around any control | `label`, `htmlFor`, `required`, `hint`, `error` |
| `Modal` | Dialog with backdrop (framer-motion) | `isOpen`, `onClose`, `title`, `size` (sm–xl) |
| `Tabs` + `TabList` + `Tab` + `TabPanel` | Accessible tabbed content, arrow-key navigation | `Tabs`: `defaultValue`/`value`/`onValueChange`; `Tab`: `value` |
| `Tooltip` | Hover/focus tooltip | `content`, `position` (top/bottom/left/right) |
| `Pagination` | Page navigation | `currentPage`, `totalPages`, `onPageChange` |
| `SearchBar` | Search input with icon | `value`, `onChange` |
| `Breadcrumbs` | Navigation trail | `items: {label, href?}[]`, `showHome` |
| `Divider` | Separator, optionally labeled | `orientation` (horizontal/vertical), `label` |
| `Skeleton` / `SkeletonText` / `SkeletonCircle` | Loading placeholders | `Skeleton`: `variant` (rect/circle/text) |
| `LoadingSpinner` (+ `LoadingPage`) | Loading indicator | `size` |
| `EmptyState` | Empty lists/carts/results | `icon`, `title`, `description`, `action` |
| `ToastViewport` + `toast`/`useToast` | Branded transient notifications (react-hot-toast) | `toast.success/error/info/warning/dismiss`; `ToastViewport` mounted once in `Layout.tsx` |

---

## Toast usage

```tsx
import { toast } from '@/components/common';

toast.success('Product saved', { duration: 3000 });
toast.error('Upload failed');
toast.warning('Stock is low on 2 items');
toast.info('3 new orders');
toast.dismiss(); // or dismiss('toast-id')
```

`ToastViewport` is already mounted in `Layout.tsx`; never mount a second one. In a
component you can also use the hook form: `const toast = useToast()`.

---

## Conventions

- **Imports**: `import { Button, Card, ... } from '@/components/common';` (path alias `@/` → `src/`, configured in `vite.config.ts` + `tsconfig.app.json`).
- **Styling**: Tailwind utilities + custom utilities from `src/styles/index.css` (`btn`, `input`, `label`, `card`, `badge`, `spinner`, `skeleton`, `error-message`, `page-hero`, …). Use semantic tokens for new work (`text-ink`, `border-line`, `shadow-card`).
- **New components**: colocate in `src/components/common/`, export from `index.ts`, ship a `*.test.tsx`.
- **Quality gates**: `npm run lint` (eslint + react-hooks/compiler rules — no sync setState in effects, no `any`, no unused vars), `npm run build` (`tsc -b && vite build`), `npm test` (Vitest).
- **Type-only imports** use `import type` (`verbatimModuleSyntax`).
