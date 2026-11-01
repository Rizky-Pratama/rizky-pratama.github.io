# AGENTS.md

Portable, tool-agnostic guide for automated assistants working in this repo. It describes
what the project is, the commands to use, and the conventions that are already locked. A
sibling file, `CLAUDE.md`, carries Claude-specific guidance; where the two overlap they
agree.

## What this project is

`portofoio` is a **single-page dark developer-portfolio TEMPLATE** built with
**Vue 3.5 + Vite 8 + Tailwind CSS v4 + GSAP 3** (installed versions, not aspirational).

- One page, six content sections (Hero, Skills, Projects, Experience, About, Contact) plus
  a fixed nav and a mono-meta footer.
- **No client-side router** — the whole site is anchor links on one page.
- **No contact form** — by design. The primary CTA is `mailto:` plus external links.
- The content is **personalized for Muhammad Rizky Pratama**. Identity and factual copy
  are configured in one data file
  (`src/data/site.js`).

The original template is now personalized. README.md describes preview-only SEO and the optional CV download.

## Requirements

- **Node.js >= 20.19** (required by `vite@8`; `package.json` `engines` enforces it)
- npm (the committed `package-lock.json` is npm-format)

There is no separate Tailwind config or PostCSS config: Tailwind v4 is CSS-first and runs
through the `@tailwindcss/vite` plugin.

## Commands

```bash
npm install        # install dependencies (first time only)
npm run dev        # dev server (Vite, default http://localhost:5173)
npm run build      # production build -> dist/
npm run preview    # serve the built dist/ locally to sanity-check it
```

Quality gates — these must stay green:

```bash
npm test           # Vitest suite, run once
npm run lint       # ESLint over the repo (must exit 0)
npm run format:check # Prettier check, writes nothing
```

Pre-publish guard:

```bash
npm run check:placeholders   # scans index.html, src/, public/robots.txt,
                             # LICENSE (the sitemap is deferred until the final URL is known) for leftover
                             # placeholder values (example.com, your-handle,
                             # {AVAILABILITY}, {YEARS}, empty site.name).
                             # Exits NON-ZERO until they are all replaced.
                             # ALLOW_PLACEHOLDERS=1 downgrades them to warnings
                             # (exit 0) when shipping the demo content on purpose.
```

Maintainer-only tooling (not needed to develop, build, or deploy):

```bash
npm run images     # regenerate public/images/*.webp from scripts/gen-images.mjs (deterministic, offline)
npm run icons      # regenerate Iconify registry, site icons, and notices (deterministic, offline)
npm run audit      # optional visual audit; requires playwright + a running `npm run preview`,
                   # and the gitignored local audit/ harness (absent on a fresh clone)
```

## Key conventions

- **Vue 3 `<script setup>`** SFCs; shared primitives are a plain-ESM module,
  `src/components/ui.js`.
- **Plain-object props** — no TypeScript in this project.
- **Tailwind v4 theme utilities only.** Use generated utilities (`bg-surface`,
  `text-fg-muted`, `border-border`, `text-accent`, `font-display`, `rounded-sm`, ...). If
  an arbitrary value is ever needed, use the v4 shorthand `bg-(--color-surface)` — **never**
  the v3 form `bg-[--color-surface]`.
- **Prettier style:** single quotes, **no semicolons**, 2-space indent, trailing commas,
  `printWidth: 90`, LF. Enforced by `npm run format:check` (see `prettier.config.js`).
- **GSAP only through `src/composables/useGsap.js`** — it is the single plugin
  registration point (`ScrollTrigger`, `Flip`, `SplitText`) and the single `matchMedia`
  owner. Sections pass config; they never register plugins or media queries themselves.
- **ALL content lives in `src/data/site.js`.** `App.vue` passes those values into the
  section components as props. Components hold no copy.
- **Local assets only** — images, icons, and fonts are committed / self-hosted
  (`public/images/*.webp`, `src/data/icons.js`, `@fontsource-variable/*`). No runtime CDN
  or Google Fonts request.

## Design law

`PLAN.md` is **authoritative for visual work** — read it before making any visual change.
The locked facts, summarized (do not contradict them):

- **Dark-only.** `color-scheme: dark` is pinned; there is no light variant and no theme
  toggle. `src/style.css` carries no `@custom-variant dark`.
- **One accent: `#22C55E`.** No second saturated hue, no glow, no gradient.
- **Three dials: `DESIGN_VARIANCE` 5 / `MOTION_INTENSITY` 6 / `VISUAL_DENSITY` 4.**

Tokens (colors, radius, the four easing curves, durations, z-index scale) are defined in
`src/style.css` and documented in `README.md` → "Design system". Note that
`--radius-xs/sm/md` intentionally override Tailwind's built-in radius scale project-wide.

## Where to look

| Path | What it holds |
|---|---|
| `src/data/site.js` | **All content.** The single content source of truth. |
| `src/components/` | `SiteNav`, `SiteFooter`, the six section SFCs, and `ui.js` (`AppButton` + `TechChip`). |
| `src/composables/useGsap.js` | Single GSAP registration point + `matchMedia` owner; easing/duration/stagger presets. |
| `src/style.css` | `@theme` design tokens (dark-only palette, fonts, radius, easing) + base/components. |
| `src/App.vue` | Section assembly, skip link, `ScrollTrigger.refresh()`. |
| `scripts/` | Maintainer generators: `gen-images.mjs`, `gen-icons.mjs`, and the `check-placeholders.mjs` guard. |
| `public/` | Copied verbatim to `dist/`: images, icons, `cv.pdf`, OG card, `robots.txt`, `sitemap.xml`. |
| `PLAN.md` | Locked design/stack plan — authoritative for visual work. |

`audit/` is gitignored QA scratch and is not shipped; `design-system/` is reference
material. `README.md` covers what to replace when cloning the template.

## Known, intentional lint warnings

`npm run lint` exits 0 but reports exactly **two warnings**, both **by design** — do not
"fix" them:

- `src/components/ContactSection.vue` — `vue/no-dupe-keys`
- `src/composables/useGsap.js` — `no-useless-assignment`

See `CLAUDE.md` for Claude-specific guidance.
