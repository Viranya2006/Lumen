# Design System — Lumen

## Design Philosophy
Lumen must look like a real, professional product, inspired by the
restraint and clarity of platforms like OpenSea, but visually distinct and
original. It must NOT look AI-generated, templated, or "vibe-coded."

Explicitly avoid:
- Default Inter/Roboto fonts used unmodified as the only typeface
- Generic centered-hero-with-gradient-blob layouts
- Unmodified default shadcn/ui card styling
- Overuse of shadows, rounded-everything, or purple/blue gradient soup
- Stock-photo-style imagery or generic "people using laptop" visuals
- Excessive icon decoration with no functional purpose

Before writing any UI code, install and follow the **UIUX Designer** skill
and the **Frontend Expert: Production-Grade React Patterns** skill from
`/SKILLS`. Use the UIUX skill's palette and font-pairing guidance as a
starting reference point, but apply it through the specific direction
below, not generically.

## Theme
Dark mode only. No light mode toggle needed for this project.

## Color Palette

| Role | Value | Usage |
|---|---|---|
| Background (base) | `#0B0D10` | Page background, near-black charcoal, not pure black |
| Surface | `#15181C` | Cards, panels, modals |
| Surface border | `#22262B` | 1px hairline borders on cards/panels |
| Primary text | `#F2F3F4` | Headings, primary content |
| Secondary text | `#9AA0A6` | Labels, metadata, timestamps |
| Accent (primary) | `#D4A650` | Warm amber — buttons, active states, price tags, links |
| Accent (secondary) | `#2DD4BF` | Sharp teal — used sparingly for secondary highlights, charts, success states |
| Danger/error | `#E2564E` | Failed transactions, validation errors only |

Use the amber accent as the dominant call-to-action color. Use teal only
as a secondary highlight (e.g. one chart series, one badge type) so the
palette stays disciplined rather than busy.

## Typography
- **Headings:** a distinctive geometric or humanist sans-serif (e.g. a
  Google Fonts option like "Space Grotesk" or "General Sans"), not the
  default Inter
- **Body text:** a clean readable sans-serif with good legibility at small
  sizes (e.g. "Inter" is acceptable here specifically for body copy, since
  it's a workhorse font, but must be paired with the distinctive heading
  font above, never used alone across the whole app)
- Maintain a clear type scale: page titles, section headings, card titles,
  body, and caption/metadata text should all be visually distinct in
  weight and size

## Layout Principles
- Generous whitespace, especially around the asset grid and detail pages
- Card-based layout for asset listings, but with restrained shadow (or
  none — rely on the 1px border instead) rather than heavy drop shadows
- Consistent 8px spacing scale throughout (Tailwind's default spacing
  scale is fine)
- Sticky top navigation bar: logo/wordmark left, nav links center, Connect
  Wallet button right

## Components
Use shadcn/ui as the component base (per the shadcn skill in /SKILLS), but
restyle every component to match this palette and type system. Do not ship
default shadcn styling unmodified — buttons, cards, inputs, and modals
must all reflect the amber/teal-on-charcoal theme above.

## 3D Element (single, intentional use)
Use React Three Fiber (per the 3D Web Experience skill in /SKILLS) for
exactly one purpose: a subtle rotating/tilting 3D preview of the asset on
the **Asset Detail page** only. This should feel premium and functional,
not decorative. Do NOT add 3D elements to the landing page hero, dashboard,
or any other page — one deliberate touch, not a 3D-everywhere theme. If a
lightweight CSS 3D tilt-on-hover is more practical than full Three.js for
the asset grid cards (not the detail page), that is acceptable as a
secondary, subtler effect.

## Imagery
No AI-generated or stock images are being used in this build (see
PROJECT.md — user-provided image URLs or placeholders only). Placeholder
assets should use simple, elegant generated shapes/gradients within the
palette above (e.g. a subtle geometric SVG pattern per category) rather
than broken image icons or generic gray boxes.

## Accessibility
Follow the UIUX Designer skill's accessibility guidance: sufficient
contrast between text and background (verify amber-on-charcoal and
teal-on-charcoal both pass WCAG AA for text use), visible focus states on
all interactive elements, and readable font sizes (16px minimum body text).