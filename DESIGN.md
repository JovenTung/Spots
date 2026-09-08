# Design

Visual system for Spots. Tokens live in `app/globals.css`; Tailwind reads them through `tailwind.config.ts`.

## Theme

Light and dark, both shipped, switched by `prefers-color-scheme` (`darkMode: "media"`). There is no in-app toggle: the app is used outdoors in daylight and in restaurants at night, and the OS already knows which.

Colour strategy: **restrained**. Neutrals carry every surface; a single coral accent marks the primary action and the current selection. All tokens are OKLCH, with a chroma of 0.002–0.012 on the neutrals tinted toward the accent's hue (40°) so greys never read as dead. The body background is a true off-white at chroma 0.002, deliberately not the warm cream/sand near-white.

## Colour

Every pair below was verified numerically (OKLCH → sRGB → WCAG) before shipping; no value is eyeballed.

| Role | Light | Dark | Verified |
|---|---|---|---|
| background | `0.975 0.002 40` | `0.175 0.0055 40` | — |
| card | `1 0 0` | `0.215 0.0065 40` | — |
| foreground | `0.22 0.008 40` | `0.96 0.0025 40` | 16.1:1 / 16.9:1 |
| muted-foreground | `0.5 0.011 40` | `0.705 0.0125 40` | 5.6:1 / 7.2:1 |
| border | `0.908 0.0045 40` | `0.3 0.0085 40` | hairline |
| primary (coral) | `0.585 0.185 27` | `0.69 0.17 30` | 4.6:1 / 6.4:1 on its foreground |
| destructive | `0.555 0.195 25` | `0.68 0.175 25` | 5.3:1 / 5.6:1 |
| star | `0.66 0.135 62` | `0.8 0.14 80` | 3.2:1 / 9.3:1 |

**Category hues** (`--cat-*`) sit at one fixed lightness and chroma per theme (light `0.55 / 0.132`, dark `0.74 / 0.125`) so no category shouts louder than another. Cafe is capped at chroma 0.115, the sRGB gamut limit at that hue and lightness.

Category colour appears in exactly two places: the thumbnail placeholder glyph, and map pins, where it does real work distinguishing pins at a glance. Filter chips are neutral. Category is never signalled by colour alone; an icon and a text label always travel with it.

## Typography

One family: **Geist** (variable, via `next/font`). No display face. A rounded display font on data labels was the single biggest reason the previous pass read as a toy.

Fixed rem scale, ratio ~1.2 — no fluid clamps, since a phone's DPI does not change.

| Use | Size | Weight | Tracking |
|---|---|---|---|
| Page title (h1) | 1.5rem | 600 | -0.025em |
| Section (h2/h3) | 1.125rem | 600 | -0.015em |
| Body / item title | 0.9375rem | 400/500 | 0 |
| Secondary | 0.8125rem | 400 | 0 |
| Micro label | 0.6875rem | 500 | 0.01em |

Numerals in stats and ratings use `font-variant-numeric: tabular-nums`.

## Shape & depth

`--radius: 0.75rem` (12px) for cards, sheets and inputs. Pill (`rounded-full`) only for chips, the FAB, and primary buttons. Nothing is rounded past 16px.

Borders and shadows are never used together as decoration:
- **Resting surfaces** (list rows, cards, inputs): 1px border, no shadow.
- **Floating surfaces** (bottom nav, map preview card, dialogs): shadow, no border.

Two shadow tokens only: `--shadow-sm` for lift, `--shadow-md` for genuinely floating elements.

## Layout

Single column, `max-w-md`, 20px gutters. Content is separated by hairline dividers rather than nested cards — a list of places is a list, not fourteen floating rectangles. Bottom nav is fixed with `env(safe-area-inset-bottom)`; every page reserves space for it.

Z-index is a named scale (`--z-nav: 40`, `--z-header: 30`, `--z-overlay: 50`, `--z-toast: 60`). No arbitrary values.

## Motion

150–220ms, `--ease-out: cubic-bezier(0.22, 1, 0.36, 1)`. Motion reports state changes only:

- Tab indicator slides when the filter changes.
- Tap feedback (`scale: 0.97`) on cards and buttons.
- Map preview card enters and exits with the selection.
- Lists cross-fade when the filter changes — the fade *is* the feedback that the filter applied.

Removed: per-word blur reveals on headings, staggered spring entrances on page load, ambient drifting gradient blobs. Pages do not perform on arrival.

Every animation has a `prefers-reduced-motion: reduce` path, and the app is fully usable with motion suppressed.

## Components

Consistent vocabulary across screens: one button shape per role, one input treatment, one icon family (Phosphor, regular weight; `fill` reserved for active states). Every interactive element has default / hover / focus-visible / active / disabled states, with a 2px `--ring` focus ring at 2px offset. Targets are ≥44px.

Loading is skeletons that match the real content's shape, never centred spinners. Empty states teach the next action and carry a button to it.
