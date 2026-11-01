# CLAUDE.md

Guidance for AI coding agents working in this repo. Read this first; read `PLAN.md`
before touching anything visual.

## What this is

A single-page **solo fullstack developer portfolio template**: Vue 3.5 (`<script setup>`) +
Vite 8 + Tailwind v4 (CSS-first, no config file) + GSAP 3.15. It is **dark-only** (no light
variant, no theme toggle), has **no client-side router** (one page, anchor links only), and
deliberately ships **no contact form** - the primary CTA is `mailto:` plus external links.
Content is **intentionally de-identified** and lives in one file. The template is finished
and the design is locked, so changes are usually content swaps or surgical, plan-compliant
fixes, not redesigns.

- Node **>= 20.19** (required by `vite@8`); npm with the committed `package-lock.json`.

## Commands

```bash
npm install            # first time only
npm run dev            # Vite dev server, http://localhost:5173
npm run build          # production build -> dist/
npm run preview        # serve built dist/ locally, http://localhost:4173/
```

**Quality gate - run all four before opening a PR / claiming done:**

```bash
npm test && npm run lint && npm run format:check && npm run build
```

- `npm test` - Vitest (`vitest run`) under jsdom; 45 tests across 4 files.
- `npm run lint` - ESLint flat config; must exit 0 (**0 errors**, 2 known warnings - see
  below).
- `npm run format:check` - Prettier check, writes nothing (`npm run format` to fix).
- `npm run build` - end-to-end gate; must exit 0 and emit `dist/`.

**Publishing guard:**

```bash
npm run check:placeholders   # scans index.html, src/, public/robots.txt,
                             # public/sitemap.xml, LICENSE
```

It reports every surviving `example.com`, `your-handle`, `<your name>`, `{AVAILABILITY}` /
`{YEARS}` token, and an empty `site.name`, exiting **non-zero until all are replaced**.
`ALLOW_PLACEHOLDERS=1 npm run check:placeholders` downgrades findings to warnings and exits
0 (to ship the demo as-is on purpose).

**Maintainer-only scripts** (not needed to develop, build, or deploy; not part of the
gate):

```bash
npm run images    # regenerate the 7 committed public/images/*.webp from scripts/gen-images.mjs (needs sharp; deterministic + offline)
npm run icons     # regenerate 20 committed public/icons/{slug}.svg chips from scripts/gen-icons.mjs (needs simple-icons)
npm run audit     # optional visual audit; needs playwright AND a local audit/ harness
```

`npm run audit` runs `node audit/scripts/run-audit.mjs`; `audit/` is gitignored QA scratch,
so a fresh clone has no harness and the command fails until it is restored. It is a QA
convenience, never a correctness gate.

## Design law - `PLAN.md` is authoritative

**Read `PLAN.md` before changing anything visual.** It is the locked v2 design plan (the
`v2 (FINAL LOCKED)` supersedes the rejected v1); `PLAN-REVIEW.md` is the review that
produced it and `REVIEW.md` is the implementation review. `README.md` ("Design system" and
"Where the design decisions are recorded" sections) restates the facts as built.

Non-negotiables:

- **Dark-only.** No light variant, no theme toggle, `color-scheme: dark` is pinned. No
  section inverts.
- **ONE accent: `#22C55E`** (`--color-accent`). No second hue, no glow, no gradient.
- **The three dials:** `DESIGN_VARIANCE` **5/10**, `MOTION_INTENSITY` **6/10**,
  `VISUAL_DENSITY` **4/10**.
- **Exactly four easing curves:** `--ease-out-strong`, `--ease-in-out-strong`,
  `--ease-drawer`, `--ease-out-expo` (mirrored by the `EASE` presets in `useGsap.js`).
- **Shape/radius lock:** `--radius-xs: 4px` (chips), `--radius-sm: 8px` (buttons/inputs),
  `--radius-md: 12px` (cards/tiles). These **intentionally override** Tailwind v4's built-in
  radius scale project-wide. Only one `rounded-full`: the availability pill.
- **Fonts:** Space Grotesk (`font-display`), IBM Plex Sans (`font-body`, the body default),
  JetBrains Mono (`font-mono`). Self-hosted via `@fontsource-variable/*`.
  **NO Inter, NO serif.**

## Anti-slop rules (enforced, from `REVIEW.md` / `PLAN.md`)

These are real constraints, verified in the reviews and code - not aspirational:

- **No `transition: all`**; no `ease-in` on UI (only `--ease-in-out-strong`, for on-screen
  movement). Linear easing is scroll-scrub only.
- **No `scale(0)` entrances.** Tiles start at `0.97` + `y` + fade; press is
  `active:scale-[0.97]`.
- **Animate `transform`/`opacity` only.** (`REVIEW.md` flags one plan-locked exception: the
  nav active-indicator animates `width`.)
- **No `window.addEventListener('scroll')`.** Use IntersectionObserver / ScrollTrigger
  (the nav scrim is driven by an IntersectionObserver sentinel).
- **Reduced motion is honored** via the `useGsap.js` composable's `gsap.matchMedia` branch
  (plus a blanket CSS net in `style.css`). Sections pass config; they must **not** register
  their own matchMedia.
- **Hover motion is gated** to `@media (hover: hover) and (pointer: fine)` so touch devices
  do not latch false hovers. (Colour-only `hover:` utilities remain ungated by design.)
- **No em-dashes (`—`) or en-dashes (`–`)** in copy; **max 1 middle-dot (`·`) per line**.
  A Vitest contract test enforces the dash ban.
- **Max 2 eyebrows** page-wide; **zero** pins, **zero** Flips, **zero** marquees.

## Conventions

- **Vue 3 `<script setup>`** SFCs, plus one plain-ESM primitives module
  (`src/components/ui.js` exporting `AppButton` + `TechChip`).
- **No TypeScript.** Props are plain objects; components read `src/data/site.js`.
- **Tailwind v4 theme utilities only** - `bg-surface`, `text-fg-muted`, `border-border`,
  `font-display`, etc. **NEVER the v3 form `bg-[--color-x]`**; if an arbitrary value is
  truly needed use v4 shorthand `bg-(--color-surface)`. There is no `--color-fg-subtle`
  token (only `--color-fg` and `--color-fg-muted`).
- **Formatting (Prettier-enforced):** single quotes, **no semicolons**, 2-space indent,
  trailing commas, `printWidth: 90`. `eslint-config-prettier` is last in the flat config, so
  ESLint does not re-report formatting.
- **GSAP only through `src/composables/useGsap.js`** - it is the single plugin registration
  point and the single matchMedia owner. Use `useReveal({...})` for scroll reveals and
  `useContextGsap(setupFn, { scope })` for bespoke timelines; do not import `gsap` directly
  elsewhere.
- **Content lives ONLY in `src/data/site.js`.** `App.vue` passes its values into sections as
  props; the data shape is stable and components must not hard-code copy.
- **Local assets only** - no CDN or runtime network fetches. Fonts are self-hosted, images
  and chip icons are committed under `public/`.

## Content and placeholders

The template is **de-identified on purpose** - no name, gender, city, or invented tenure is
hard-coded. Neutral values are `site.name: ''` (nav/footer wordmark falls back to
"Portfolio"), `site.location: ''`, `email: 'hello@example.com'`,
`social.*: 'your-handle'`, and the `{AVAILABILITY}` / `{YEARS}` tokens (the `UNRESOLVED`
constant renders any `{X}` token as a muted `--`). Marked `// TODO` in `src/data/site.js`.
`npm run check:placeholders` is the guard (see Commands). See README "What to replace" for
the full swap list (data, domain, images, `public/cv.pdf`, meta, `LICENSE` holder).

## Where things live

```
index.html                     # SEO/OG/Twitter meta, #app mount
vite.config.js                 # vue() + tailwindcss() plugins
src/
  main.js                      # createApp(App).mount('#app')
  App.vue                      # skip link, section assembly, ScrollTrigger.refresh()
  style.css                    # @theme tokens + @fontsource imports + base + a11y nets
  data/site.js                 # ALL content lives here
  composables/useGsap.js       # GSAP registration point + useReveal / useContextGsap / matchMedia owner
  components/                  # 8 SFCs (nav, 6 section components, footer) + ui.js primitives
scripts/                       # gen-images.mjs, gen-icons.mjs, check-placeholders.mjs
public/                        # copied verbatim to dist/ (images/, icons/, robots.txt, sitemap.xml, cv.pdf, og-image.*)
audit/                         # gitignored QA scratch (visual-audit harness)
.github/workflows/ci.yml       # CI: lint, format:check, test, build on Node 20.19 + 22
```

## Known intentional lint warnings

`npm run lint` exits 0 with **2 acknowledged warnings**; do not "fix" them without reason:

- `vue/no-dupe-keys` in `src/components/ContactSection.vue` - deliberate prop/computed
  shadow.
- `no-useless-assignment` in `src/composables/useGsap.js` - the register-once idiom.

Any additional warning is a regression. Both are downgraded to `warn` in `eslint.config.js`
with inline rationale.
