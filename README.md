# Tropify Events

Site for Tropify Events — the nights we run at **Papi on the Beach** and at
**PRIME**, Pordenone. Next.js 16 (App Router, Turbopack), React 19, Tailwind v4.

## Running it

```bash
npm install
npm run dev     # http://localhost:3000
npm run build   # production build
```

## Deploying

Standard Next.js app — Vercel detects everything from `package.json`. No
environment variables, no external services at build or run time. Import the
repo and deploy; `main` is the production branch.

## Routes

| path     | what                                                     |
| -------- | -------------------------------------------------------- |
| `/`      | hero (3D logo over the cloud field), pinned gallery, outro |
| `/cards` | the gallery on its own, useful for debugging it in isolation |

## Pieces worth knowing about

**Clear glass** (`src/components/ClearGlass.tsx`, `src/lib/lensMap.ts`) — the
buttons and nav. Apple's `.glassEffect(.clear)` look: the page shows through
almost unblurred, bends around the rim, and takes the colour of whatever is
behind it, live. Built on `backdrop-filter` plus a generated SVG displacement
map. The edge bending is Chromium-only; Safari and Firefox reject `url()` inside
`backdrop-filter` and fall back to tinted glass without the lens.

Portable copies of this, vanilla and React, live in `D:\websites\clear-glass\`
with their own README. A live demo is at `/clear-glass/demo.html`.

**Pinned gallery** (`src/components/CardsSection.tsx`) — a sticky child inside a
tall wrapper. The page scrolls until the carousel fills the screen, holds it
while the wrapper's scroll progress spins it through a full turn, then releases.
`TURNS` controls how long it holds.

**The 3D logo** (`src/components/LogoScene.tsx`) — `public/tropify.glb` loaded
through three's `GLTFLoader`, auto-fitted to the viewport so it never crops.

**The cloud field** (`src/components/CloudField.tsx`) — `PortalFieldCollection`
from `@designcodeio/threeui`. It renders in a sandboxed iframe, which is why it
is a fixed backdrop layer rather than something other effects can sample.

## Third-party

- **pmndrs/examples — cards-with-border-radius** (MIT): `src/components/Cards.tsx`,
  `src/lib/cardsUtil.ts`, images in `public/cards/`. Original by
  [Cody Stumpel](https://cydstumpel.nl/). Ported from Vite; `ScrollControls` was
  replaced with page-scroll progress so the section can pin. The banner texture
  was swapped for a Tropify one.
- **liquid-glass-js** (MIT) — vendored in `public/liquid-glass/`, no longer used
  by the site. See its `VENDOR.md`.
- **liquid-logo** (MIT) — vendored in `public/liquid-logo/`, a standalone tool
  for rendering the logo as liquid metal. Renders in `public/liquid-logo/renders/`.
