# Fullstack Developer Portfolio

A single-page developer portfolio built with **Vue 3.5 + Vite 8 + Tailwind v4 + GSAP 3**.
Dark-only, modern-minimal, Swiss-grid discipline over an off-black slate canvas with
mono-accented typography and restrained scroll motion.

Six content sections (Hero, Skills, Projects, Experience, About, Contact) plus a fixed
nav and a mono-meta footer. There is no client-side router: the whole site is one page
of anchor links. There is deliberately **no contact form** — the primary call to action
is `mailto:` plus external links.

The content is **de-identified on purpose**. No name, gender, city, or invented tenure is
hard-coded anywhere in the UI. Every swappable value is a placeholder pointing at one
data file (`src/data/site.js`). See [What to replace](#what-to-replace).

---

## Requirements

- **Node.js >= 20.19** (required by `vite@8`; verified locally on Node 24.16.0)
- npm (the committed `package-lock.json` is npm-format)

There is no separate global CLI, PostCSS config, or Tailwind config file. Tailwind v4 is
CSS-first and runs through the `@tailwindcss/vite` plugin.

---

## Commands

```bash
npm install        # install dependencies (first time only)
npm run dev        # start the dev server (Vite, default http://localhost:5173)
npm run build      # production build -> dist/
npm run preview    # serve the built dist/ locally to sanity-check it
```

Quality tooling is wired up in `package.json`:

```bash
npm test           # run the Vitest suite once (45 tests across 4 files)
npm run test:watch # re-run the suite on change
npm run lint       # ESLint over the whole repo
npm run lint:fix   # ESLint with --fix
npm run format     # rewrite files with Prettier
npm run format:check # verify formatting without writing
```

Three further scripts exist for **maintainer-only** tooling (see
[Maintenance & QA](#maintenance--qa)); none is needed to develop, build, or deploy the
site:

```bash
npm run images     # regenerate public/ image assets from scripts/gen-images.mjs
npm run icons      # regenerate public/icons/*.svg chips from scripts/gen-icons.mjs
npm run audit      # optional visual audit (requires playwright + a running preview)
```

---

## What to replace

Everything below is a placeholder. Swapping it needs **no component changes** — the shape
of the data is stable and the components just read it.

### 1. It all starts in `src/data/site.js`

This single file is the content source of truth. `App.vue` passes its values straight into
the section components as props.

| Key in `site.js` | What it is | Current placeholder |
|---|---|---|
| `site.name` | Your name (footer + nav wordmark) | `""` (empty — nothing is asserted for you) |
| `site.role` | Your role string | `"Fullstack Developer"` |
| `site.location` | Your city — shown in **one** place only (footer contact line) | `""` (empty) |
| `site.email` | Your email (used by the `mailto:` CTA and the contact link) | `"hello@example.com"` |
| `site.availability` | Availability pill text | `"{AVAILABILITY}"` |
| `site.social.github` | GitHub URL | `https://github.com/your-handle` |
| `site.social.linkedin` | LinkedIn URL | `https://linkedin.com/in/your-handle` |
| `site.sections.hero` | Eyebrow, headline, subtext, secondary link, `portrait.src`/`srcset`/`alt` | demo copy + local image |
| `site.sections.skills.groups` | Four skill tiles + tech chips | demo stack |
| `site.sections.projects` | Four case studies (title, summary, outcome, chips, `imageSeed`/optional `image`) | invented demo work |
| `site.sections.experience.entries` | Four timeline entries (dates, role, org, body) | invented demo work |
| `site.sections.about` | Heading, prose body, "Now" list, `readouts`, portrait | demo copy |
| `site.sections.contact` | Heading, body, primary CTA, secondary "Download CV", links | demo copy |
| `site.sections.footer` | Colophon + legal/copyright line | demo copy |

Marked `// TODO` in the file: identity (`name`, `location`), `email`, `social.*`, and the
`about.readouts` numbers. The demo projects and experience entries are intentional sample
content — safe to keep as examples or replace with your real work.

### 2. Unresolved-token convention: `{YEARS}` / `{AVAILABILITY}`

Two values are intentionally left as neutral string tokens so nothing is invented on your
behalf:

- `site.availability` → `"{AVAILABILITY}"`
- `site.sections.about.readouts[0].value` → `"{YEARS}"`

The UI renders any `{X}` token as a muted `--` (the exported `UNRESOLVED` constant is
`"--"`). Replace the raw strings with real values and they render as-is; e.g. set
`availability: "Available for freelance work"` and a readout `value: "9"`.

### 3. Placeholder domain — `example.com` (in `index.html` + `public/`)

`example.com` appears as the canonical URL, the Open Graph `og:url`, the Twitter image
URL, and in `public/robots.txt` and `public/sitemap.xml`. Replace **every** occurrence with
your real domain:

- `index.html` — `<link rel="canonical">`, `og:url`, `og:image`, `twitter:image`
- `public/robots.txt` — the `Sitemap:` line
- `public/sitemap.xml` — the `<loc>`

### 4. Local images — `public/images/*.webp`

All photography is **committed to the repo** as seven generated `.webp` files under
`public/images/`. Nothing is fetched at runtime, so images render offline and with no
third-party requests:

| File | Used by |
|---|---|
| `portrait-900.webp` / `portrait-640.webp` / `portrait-180.webp` | hero + about portraits (responsive `srcset`) |
| `project-ledgerline.webp` | Ledgerline case study |
| `project-atlas-auth.webp` | Atlas Auth case study |
| `project-fjord-dashboard.webp` | Fjord Analytics case study |
| `project-undertow.webp` | Undertow case study |

The four project images are selected by a `imageSeed -> asset` map in
`src/components/ProjectsSection.vue` (with a fallback asset if a seed is unknown).

**Regenerate the demo artwork:**

```bash
npm run images     # node scripts/gen-images.mjs
```

This is **deterministic and offline** — it regenerates the SVG/`.webp` assets from scratch
with no network access, so re-running it on a clean checkout reproduces the same files.
Commit the regenerated output.

**Swapping in your own real photos.** Two paths:

- **Hero / About portraits** — edit `site.sections.{hero,about}.portrait` in
  `src/data/site.js`, pointing `src` (and the optional `srcset`) at your file, e.g. drop
  `public/images/me.webp` and set `portrait: { src: "/images/me.webp", alt: "Your name" }`.
- **Projects** — either add your photo to `public/images/` and set a per-project `image`
  path on the entry in `site.sections.projects` (an explicit `image` **overrides**
  `imageSeed`), or change the `IMAGE_BY_SEED` map in `ProjectsSection.vue` to point the
  existing seeds at your files.

The hero portrait is the LCP element — keep it small and consider `fetchpriority="high"`
(already set).

### 5. `public/cv.pdf`

The Contact section's secondary "Download CV" button links to `/cv.pdf`. A minimal valid
one-page placeholder PDF is committed at `public/cv.pdf` so the link does not 404. **Replace
it with your real CV using the same filename and path** — no code change is needed. If you
would rather not ship a CV, either delete the button's entry in
`site.sections.contact.secondary` in `src/data/site.js`, or point `cvHref` elsewhere.

### 6. Social card + icons (optional polish)

- `public/og-image.png` is the real 1200x630 social share card (also `og-image.svg` source).
- `public/favicon.svg` and `public/apple-touch-icon.png` are the site icons.
- `index.html` and `src/style.css` preload two font files from
  `node_modules/@fontsource-variable/*`. Do not hand-edit those preload hrefs — Vite
  rewrites them to hashed `/assets/*.woff2` URLs at build time.

### 7. `<title>` and meta description

`index.html` carries a neutral `<title>` and `meta name="description"` /
`meta name="author"`. Update them with your own once your name and positioning are set.

---

## Maintenance & QA

This section is for whoever **maintains the template** (regenerating assets, running the
visual audit). A user cloning it to ship a portfolio can ignore all of it.

### Dependencies: runtime vs dev-only

Only five packages end up in the shipped bundle path:

| Scope | Packages | Why |
|---|---|---|
| **Runtime** (`dependencies`) | `vue`, `gsap`, `@fontsource-variable/{space-grotesk,ibm-plex-sans,jetbrains-mono}` | The app itself — Vue, the animation library, and the three self-hosted variable fonts. |
| **Dev-only** (`devDependencies`) | `vite`, `@vitejs/plugin-vue`, `@tailwindcss/vite`, `tailwindcss` | Build toolchain. Nothing here ships to `dist/` as a dependency. |
| **Dev-only, optional tooling** | `sharp`, `playwright`, `simple-icons` | Used only by the maintainer scripts below. Safe to omit from a lean install (e.g. `npm install --omit=dev` for a build-only CI, or `--omit=optional` isn't needed since these are regular devDeps). |

`sharp`, `simple-icons`, and `playwright` are intentionally **devDependencies, not
runtime**: the built site is a fully static bundle that needs none of them at runtime.
`npm install` does not download Playwright's browser binaries — those are fetched
separately via `npx playwright install` into a user-level cache, so a plain install stays
small.

### Regenerating demo photo artwork — `npm run images`

The demo photography is generated artwork, not stock photos:

```bash
npm run images     # node scripts/gen-images.mjs
```

That script uses **`sharp`** (a devDependency) to render and encode **the seven `.webp`
files in `public/images/`** — nothing else:

- `portrait-900.webp`, `portrait-640.webp`, `portrait-180.webp` — the hero/about portrait
  at three sizes (the demo "headshot": a dark abstract figure with an accent arc).
- `project-ledgerline.webp`, `project-atlas-auth.webp`, `project-fjord-dashboard.webp`,
  `project-undertow.webp` — the four 800×600 project artworks.

It is **deterministic and offline**: every asset uses a fixed seed (the project pieces hash
their `imageSeed` string), so re-running it reproduces byte-identical output with no
network access. These `.webp` files are the **demo photos you replace with your own** (see
[Local images](#4-local-images--publicimageswebp) for how to swap them). The script is not
part of `npm run build` — the artwork is pre-generated and committed.

> **Not produced by `npm run images`:** `public/og-image.png`, `public/og-image.svg`,
> `public/apple-touch-icon.png`, and `public/favicon.svg` are **committed static assets**.
> No committed script regenerates the social card or icon PNGs — they were produced by a
> one-off process during the build and are checked in as-is. To change them, edit or replace
> the file directly (or edit `public/og-image.svg` and rasterize it yourself with any
> tool); `npm run images` will not touch them.

### Regenerating chip icons — `npm run icons`

The tech-stack chip logos rendered by the Skills bento are committed local SVGs in
`public/icons/{slug}.svg` — 20 files, one per chip. They are **not** fetched from a CDN at
runtime:

```bash
npm run icons      # node scripts/gen-icons.mjs
```

That script reads the official `simple-icons` package (a devDependency) and writes one
tinted SVG per slug. It is **deterministic and offline** — no network access, and
re-running it reproduces byte-identical output. Commit the regenerated SVGs. As with the
images, it is not part of `npm run build`; the icons are pre-generated and committed so the
deployed site makes no third-party request for them.

**Adding a new chip:** add the company/tech slug to the relevant
`site.sections.skills.groups[].stack[]` entry in `src/data/site.js` **and** run
`npm run icons` so the matching `public/icons/<slug>.svg` exists (or drop a hand-made SVG
of the same name into `public/icons/`). A slug with no matching file renders a broken chip,
so keep the two in step.

### Optional visual audit — `npm run audit`

The visual-audit harness (screenshots at multiple widths, DOM/overflow/contrast probes)
lives in `audit/`, which is **gitignored QA scratch** and is not shipped with the template.
It requires **`playwright`**:

```bash
npx playwright install chromium   # one-time: fetch the browser binary
npm run build && npm run preview  # serve the built site (http://localhost:4173/)
npm run audit                     # node audit/scripts/run-audit.mjs
```

`npm run audit` only works when the local `audit/` harness is present — it is **gitignored
and not shipped**, so a fresh clone has no `audit/scripts/run-audit.mjs` and the command
will fail until you restore that harness (and install `playwright`); this affects
maintainer QA only and never the template's install or build.

The audit writes screenshots to `audit/shots/` and a machine-readable report to
`audit/raw.json`. It is a QA convenience, not a correctness gate — the gate is still
`npm run build`.

---

## Project structure

```
portofoio/
|-- index.html                 # SEO/OG/Twitter meta, font preloads, #app mount
|-- vite.config.js             # vue() + tailwindcss() plugins
|-- package.json               # scripts + installed deps
|-- README.md
|-- PLAN.md                    # locked design/stack plan (design facts live here)
|-- PLAN-REVIEW.md             # review that produced the v2 plan
|-- REVIEW.md                  # implementation review
|-- public/                    # copied verbatim to dist/ root
|   |-- cv.pdf                 # placeholder CV (replace with your real file)
|   |-- favicon.svg
|   |-- apple-touch-icon.png
|   |-- icons.svg
|   |-- og-image.png           # 1200x630 social card
|   |-- og-image.svg
|   |-- robots.txt
|   `-- sitemap.xml
`-- src/
    |-- main.js                # createApp(App).mount('#app')
    |-- App.vue                # section assembly, skip link, ScrollTrigger.refresh()
    |-- style.css              # Tailwind import + @theme tokens + base + components
    |-- assets/                # (empty; .gitkeep)
    |-- data/
    |   `-- site.js            # ALL content lives here (see "What to replace")
    |-- composables/
    |   `-- useGsap.js         # single GSAP registration point + matchMedia owner
    `-- components/
        |-- ui.js              # AppButton + TechChip primitives
        |-- SiteNav.vue
        |-- SiteFooter.vue
        |-- HeroSection.vue
        |-- SkillsSection.vue
        |-- ProjectsSection.vue
        |-- ExperienceSection.vue
        |-- AboutSection.vue
        `-- ContactSection.vue
```

---

## Design system

Facts below come from `PLAN.md` (locked) and `src/style.css` (the tokens as built).

### The three dials

| Dial | Value | Note |
|---|---|---|
| `DESIGN_VARIANCE` | **5 / 10** | Offset, not chaos: asymmetric hero split, bento skills, offset ledger |
| `MOTION_INTENSITY` | **6 / 10** | Scroll reveals, one orchestrated hero timeline, one curtain, one spine draw, count-up |
| `VISUAL_DENSITY` | **4 / 10** | `py-24` / `py-32` rhythm, `max-w-7xl` container, mono for metadata only |

### Palette (dark-only, locked)

| Token | Hex | Role |
|---|---|---|
| `--color-bg` | `#0F172A` | page canvas (off-black slate, never `#000`) |
| `--color-surface` | `#151E33` | raised surface (cards, nav scrim base) |
| `--color-surface-2` | `#1E293B` | second surface (bento variation, hover) |
| `--color-border` | `#243049` | hairline borders / dividers |
| `--color-fg` | `#F1F5F9` | primary text (near-white, never `#FFFFFF`) |
| `--color-fg-muted` | `#94A3B8` | secondary text, metadata |
| `--color-accent` | `#22C55E` | **the only saturated hue** — CTA fill, focus ring, active underline |
| `--color-accent-press` | `#16A34A` | accent pressed state |
| `--color-on-accent` | `#052E16` | text on an accent fill |
| `--color-danger` | `#F87171` | validation text only |

**Theme lock:** dark-only. There is no light variant and no toggle; `color-scheme: dark`
is pinned. **Accent lock:** one accent, no second hue, no glow, no gradient. There is no
`--color-fg-subtle` token — only `--color-fg` and `--color-fg-muted` exist.

### Typography

| Role | Family | Tailwind utility |
|---|---|---|
| Display | **Space Grotesk** (variable) | `font-display` |
| Body / UI | **IBM Plex Sans** (variable) | `font-body` (default on `body`) |
| Mono / meta | **JetBrains Mono** (variable) | `font-mono` |

Self-hosted via `@fontsource-variable/*` packages (packaged woff2, `font-display: swap`).
No Google Fonts `<link>`, no Inter, no Instrument Serif.

### Radius, motion, z-index

- **Radius (locked):** `--radius-xs: 4px` (chips), `--radius-sm: 8px` (buttons/inputs),
  `--radius-md: 12px` (cards/tiles). These **intentionally override** Tailwind v4's built-in
  radius scale project-wide, so `rounded-md` means 12px everywhere.
- **Easing (only four curves):** `--ease-out-strong: cubic-bezier(0.23,1,0.32,1)`,
  `--ease-in-out-strong: cubic-bezier(0.77,0,0.175,1)`,
  `--ease-drawer: cubic-bezier(0.32,0.72,0,1)`,
  `--ease-out-expo: cubic-bezier(0.16,1,0.3,1)`.
- **Durations:** `--dur-press: 160ms`, `--dur-pop: 200ms`, `--dur-modal: 250ms`,
  `--dur-reveal: 600ms`.
- **Z-index scale:** `--z-base: 0`, `--z-pin: 30`, `--z-sticky: 40` (nav),
  `--z-nav-panel: 60` (mobile menu), `--z-skip: 1000` (skip link). No arbitrary `z-50`.

Tailwind v4 consumes these as generated utilities (`bg-bg`, `bg-surface`, `text-fg-muted`,
`border-border`, `text-accent`, `font-display`, ...). If an arbitrary value is ever needed,
use v4 shorthand `bg-(--color-surface)` — **not** the v3 form `bg-[--color-surface]`.

---

## Quality gates

Automated checks back the claim that the site builds clean. Run all four before you open a
PR:

```bash
npm test              # Vitest: unit/contract + component smoke tests
npm run lint          # ESLint — must exit 0 (0 errors; 2 known, intentional warnings)
npm run format:check  # Prettier — verifies style, writes nothing
npm run build         # Vite production build — must exit 0
```

- **`npm test`** runs Vitest (`vitest run`) over 4 files / 45 tests. It covers the content
  **contract** (`src/data/site.contract.test.js` — the shape of `site.js`, that every chip
  slug has a matching `public/icons/<slug>.svg`, and a no-em-dash guard), the GSAP motion
  **presets** (`src/composables/useGsap.test.js` — easing, duration, stagger), and
  **component smoke tests** that mount every section (`src/components/sections.smoke.test.js`)
  plus the UI primitives (`src/components/ui.test.js`). It runs under **jsdom**
  (`vitest.config.js`), with `src/test/setup.js` shimming the browser globals the
  components and GSAP touch. Use `npm run test:watch` while developing.
- **`npm run lint`** runs ESLint (flat config `eslint.config.js`: `vue3` + `eslint-config-prettier`)
  and must exit 0 (0 errors). It currently reports **2 acknowledged warnings**, both
  intentional: `vue/no-dupe-keys` in `src/components/ContactSection.vue` (deliberate
  prop/computed shadow) and `no-useless-assignment` in `src/composables/useGsap.js` (the
  register-once idiom). Treat any warning beyond these as a regression. `npm run lint:fix`
  applies the auto-fixable rules.
- **`npm run format:check`** runs Prettier against `prettier.config.js` / `.prettierignore`
  and fails on any unformatted file; `npm run format` normalizes the tree so the check
  passes.
- **`npm run build`** remains the end-to-end gate: it must exit 0 and emit `dist/`.

These four are the checks a contributor should run; `npm test && npm run lint && npm run
format:check && npm run build` is the whole gate. The maintainer scripts (`images`, `icons`,
`audit`) are not part of it.

---

## Deploy

The build output is fully static.

```bash
npm run build      # emits dist/
```

Upload `dist/` to any static host — Netlify, Vercel, Cloudflare Pages, GitHub Pages, S3 +
CloudFront, nginx, etc. Because the site is a single page with no client router, **no SPA
rewrite rule is needed**.

- Set cache headers long/immutable on the hashed `/assets/*`, `/icons/*`, `/images/*`, short
  on `index.html`. Fonts are emitted as hashed `*.woff2` files under `/assets/` — there is no
  separate `/fonts/*` directory.
- Build requires Node >= 20.19 on the host's build image.

Two host config files are committed, both matching the real build output (build command
`npm run build`, publish dir `dist`):

| File | Host | What it does |
|---|---|---|
| `netlify.toml` | Netlify | Build command + `publish = "dist"`, pins `NODE_VERSION = "20.19.0"`, and cache headers (`immutable` on `/assets/*`, `/icons/*`, `/images/*`; `no-cache, must-revalidate` on `/index.html`) |
| `vercel.json` | Vercel | `buildCommand` / `outputDirectory` for the static Vite output, plus the same cache headers |

Both hosts also work with **zero config** — drag-and-drop the built `dist/` folder, or
connect the git repo and let the host detect Vite. The committed files just make the Node
pin and cache headers explicit. There are no redirect/rewrite rules: the site is one page
with no router.

**GitHub Pages.** A user/organisation page (`https://user.github.io/`) serves at the root
and needs no `base`. A **project page** (`https://user.github.io/<repo>/`) is served from a
subpath, so asset URLs must be rewired — set Vite's `base` in `vite.config.js`:

```js
export default defineConfig({
  base: '/<repo>/', // e.g. base: '/portfolio/'
  plugins: [vue(), tailwindcss()],
})
```

Then update the absolute URLs in `index.html` (canonical, `og:url`, `og:image`,
`twitter:image`), `public/robots.txt`, and `public/sitemap.xml` to match the subpath. Note
that GitHub Pages runs Jekyll by default, which ignores directories starting with an
underscore — the hashed assets live in `dist/assets/` and are safe, but `public/.nojekyll`
is committed anyway (and copied verbatim into `dist/.nojekyll`, since Vite copies `public/`
as-is) to disable Jekyll processing entirely. Deploy either by pushing `dist/` to a
`gh-pages` branch or by pointing Pages at a branch/folder in the repo settings.

---

## Accessibility & motion

- **Focus:** a visible `2px solid #22C55E` outline with `3px` offset, never removed. A skip
  link jumps straight to `#main`, so keyboard users can bypass the nav.
- **Semantics:** one `<h1>` (hero), sequential `<h2>` section headings, `<nav aria-label="Primary">`,
  `<main id="main">`. Decorative SVGs are `aria-hidden`; images carry descriptive `alt`.
- **Contrast:** body text runs well above WCAG AA. Measured against `--color-bg` `#0F172A`:
  `--color-fg` `#F1F5F9` ≈ **16.3:1**, `--color-fg-muted` `#94A3B8` ≈ **6.96:1**; the accent
  pair `#052E16` on `#22C55E` ≈ **6.54:1**.
- **Reduced motion:** honored in two layers. `src/style.css` carries a blanket
  `@media (prefers-reduced-motion: reduce)` kill for CSS animation/transition and
  `scroll-behavior`, and `src/composables/useGsap.js` owns the real branch via
  `gsap.matchMedia`, which renders reveals at their final state and un-pins/static-izes any
  scrubbed triggers (the CSS kill alone does not stop GSAP JS tweens).
- **Reduced transparency:** the nav scrim drops `backdrop-filter` and falls back to a solid
  `--color-surface` fill under `prefers-reduced-transparency: reduce`.
- **Hover motion** is gated to `@media (hover: hover) and (pointer: fine)` so touch devices
  do not latch a false hover.
- **Touch targets** are at least 44px with `touch-action: manipulation`.

---

## Where the design decisions are recorded

`PLAN.md` is the locked v2 plan and the authoritative record for palette, typography,
radius, easing, the three dials, section-by-section layout, and the motion budget.
`PLAN-REVIEW.md` is the review that produced it; `REVIEW.md` is the implementation review.
Read `PLAN.md` before changing visual design.

---

## License

Released under the **MIT License** — see [`LICENSE`](LICENSE) for the full text.

The copyright line in `LICENSE` ships as a placeholder, `Copyright (c) 2026 <your name>`.
Replace `<your name>` (keeping the `c` year if you like) with your own name or handle before
you publish, so the notice matches the footer `(c) 2026` line.
