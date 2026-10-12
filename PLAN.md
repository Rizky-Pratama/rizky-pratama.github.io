# PLAN.md - Fullstack Developer Portfolio (Vue 3 + Tailwind v4 + GSAP)

**Version: v2 (FINAL LOCKED)** - supersedes v1 (797-line draft), which was rejected by `PLAN-REVIEW.md`.
**Project:** `portofoio` | **Stack (installed truth):** Vue 3.5.42 + Vite 8.3.0 + `@vitejs/plugin-vue` 6.0.8 + Tailwind 4.3.3 (`@tailwindcss/vite`) + GSAP 3.15.0
**Node:** 24.16.0 (verified locally; `vite@8` requires Node >= 20.19)
**Decision record:** this revision reconciles the plan with the already-scaffolded repo. Where v1 contradicted the repo, the repo wins. Every P0/P1/P2/P3 finding in the review is applied and marked below.

---

## 0. Changes Applied From PLAN-REVIEW.md (decision log)

| # | Finding (verified fact) | v2 decision |
|---|---|---|
| P0-1 | Installed deps are newer than v1's block; v1 would **downgrade** | Deps section now states the installed versions verbatim. No downgrades. |
| P0-2 | Repo already has `src/style.css`, `src/composables/useGsap.js`, `src/data/site.js` | **Keep and extend all three.** Drop v1's parallel `styles/main.css` + `tokens.css`. Drop the separate `motion/gsapSetup.js` layer. |
| P0-3 | Repo ships class-based dark (`@custom-variant dark`) + light paper/ink + Inter/Instrument Serif, which contradicts a dark-only lock | **LOCKED: DARK-ONLY.** `style.css` deletes the `@custom-variant dark` line, the `paper`/`ink` light tokens, Inter, and Instrument Serif. Sets `color-scheme: dark`. There is no light-mode variant and no theme toggle. This is recorded as an explicit decision, not an omission. |
| P0-4 | "Lisbon" appeared in hero subtext and the mono rail | Removed from both. **At most ONE location mention**, in the footer contact line only. |
| P0-5 | v1 invented "Mara Okonjo" (name, gender, city, tenure) everywhere | **De-identified.** `site.js` extended with neutral placeholder values + `// TODO` notes. Hero carries no name, gender, city, or invented tenure. Portrait seed `portrait-placeholder`. Handles `hello@example.com` / `github.com/your-handle`. |
| P1-6 | Pinned horizontal-pan rail contradicts "simple & clean" and had an under-specified distance formula | **CUT.** Projects becomes a vertical case-study list with staggered reveals. `ProjectDetail.vue` Flip overlay **cut entirely**. |
| P1-7 | Flip shared-element portrait (About -> Contact) is fragile showreel motion | **CUT.** Replaced with an opacity crossfade of the avatar. |
| P1-8 | Fixed 68px nav collides with anchors and any pin | `scroll-margin-top: 72px` on every `[id]` section. Any surviving pin (none, after P1-6) would use `start: "top 72px"`. |
| P1-9 | `bg-[--color-surface]` is v3 syntax, wrong in v4 | All arbitrary usages replaced with theme utilities (`bg-surface`, `border-border`) or v4 shorthand `bg-(--color-surface)`. `--radius-*` override note added. |
| P1-10 | `public/fonts/` did not exist; self-hosted fonts would 404 | **Real font step:** three `@fontsource-variable/*` npm packages installed (verified on disk). `style.css` imports their CSS, which bundles the woff2 + `@font-face` rules with `font-display: swap`. |
| P2-11 | Marquee is filler motion | **CUT.** The chip lists carry the stack. |
| P2-12 | Typewriter `$ whoami` is a stock AI trope | **Made static.** Mono eyebrow with a non-blinking cursor. |
| P2-13 | 3D pointer tilt is physics for its own sake | **CUT.** Tile hover is a border/`surface-2` color shift, <= 200ms. |
| P2-14 | Two clip-path curtains is a tic | **ONE curtain only** (hero portrait). About portrait uses a fade. |
| P2-15 | Em-dash grep would false-positive on PLAN.md | Grep scoped to `src/**` only. |
| P2-16 | Middle-dot `·` discipline at risk | Rule: **max 1 `·` per line**; metadata uses columns or line breaks otherwise. |
| P2-17 | Contact form faked by omission | Stated plainly: **no form. Primary CTA is `mailto:` + external links.** A form is explicit opt-in scope. |
| P2-18 | No SEO/OG/deploy plan | New Section 9 covers description, canonical, theme-color, OG/Twitter, a real 1200x630 OG asset, robots.txt, sitemap.xml, deployment. |
| P2-19 | Two matchMedia owners per effect risks double-fire | **The composable owns matchMedia.** Sections pass config objects; they never register their own media queries. |
| P2-20 | Missing `prefers-reduced-transparency` and reduced-motion SplitText/pin rules | `style.css` gates the nav scrim; under reduced motion SplitText headings revert to plain text and every ScrollTrigger is un-pinned/static. |
| P3-21 | 28 files is sprawl | Collapsed to the ~14-file set in Section 2. |

**Scope reduction summary:** 9 sections -> 6 content sections + nav + footer; 8 layout families -> 5; pinned pan, Flip overlay, Flip portrait, marquee, typewriter, 3D tilt all cut. Motion count drops ~40% while keeping "loaded with GSAP" (scroll reveals, one curtain, one spine draw, count-up, staggered lists).

---

## 1. Design Read, Dials, Visual System

### 1.1 Design Read (one line)

> **Reading this as: a solo fullstack developer portfolio for engineering hiring managers and technical recruiters, with a dark technical-minimal / engineering-notebook language, leaning toward Swiss-grid discipline over an OLED-dark canvas with mono-accented typography and restrained scroll reveals.**

### 1.2 The Three Dials (`DESIGN_VARIANCE` / `MOTION_INTENSITY` / `VISUAL_DENSITY`)

| Dial | Value | Why |
|---|---|---|
| **DESIGN_VARIANCE** | **5 / 10** | **Lowered from v1's 7.** The review is right that "simple, clean" is the user's literal brief. 5 = offset, not chaos: asymmetric hero split, a bento skills field, an offset timeline ledger. Centered hero still refused (anti-center bias fires above 4). No masonry, no overlap tricks. |
| **MOTION_INTENSITY** | **6 / 10** | **Lowered from v1's 8.** The user did ask for "lots of GSAP, not AI-slop", so it stays well above static: scroll reveals on every section, one orchestrated hero timeline, one clip-path curtain, a scrub-drawn timeline spine, a count-up. But no pins, no hijacks, no Flip, no marquee, no tilt, no typewriter. Every effect motivated; several v1 effects were slop by another name. |
| **VISUAL_DENSITY** | **4 / 10** | Standard. `py-24` / `py-32` rhythm, `max-w-7xl` container, mono for metadata only. Engineers read detail; the page still breathes. |

Deviation from the "Portfolio (Developer) 6/5/4" preset is now `5/6/4`: VARIANCE down one (simplicity demanded), MOTION up one (GSAP explicitly requested). Recorded, not silent.

### 1.3 Palette (exact hex, LOCKED, dark-only)

| Token | Hex | Role |
|---|---|---|
| `--color-bg` | `#0F172A` | page canvas (off-black slate, never `#000`) |
| `--color-surface` | `#151E33` | raised surface (cards, nav scrim base) |
| `--color-surface-2` | `#1E293B` | second surface (bento variation cells, hover) |
| `--color-border` | `#243049` | hairline borders / dividers |
| `--color-fg` | `#F1F5F9` | primary text (near-white, never `#FFFFFF`) |
| `--color-fg-muted` | `#94A3B8` | secondary text, metadata (4.9:1 on `#0F172A`) |
| `--color-accent` | `#22C55E` | **THE ACCENT (locked).** CTA fill, focus ring, active-nav underline |
| `--color-accent-press` | `#16A34A` | accent pressed state |
| `--color-on-accent` | `#052E16` | text on accent fill (6.9:1 on `#22C55E`) |
| `--color-danger` | `#F87171` | validation text only |

**ACCENT COLOR LOCK:** `#22C55E` is the only saturated hue. No second accent, no glow, no gradient. **THEME LOCK: dark-only**, no section inverts, no toggle.

### 1.4 Typography (real, installed via `@fontsource-variable/*`)

| Role | Family | Weights | Tailwind utility |
|---|---|---|---|
| Display | **Space Grotesk** (variable wght) | 400-700 | `font-display` |
| Body / UI | **IBM Plex Sans** (variable wght) | 400-600 | `font-body` (default via `body`) |
| Mono / meta | **JetBrains Mono** (variable wght) | 400-700 | `font-mono` |

Installed as `@fontsource-variable/space-grotesk`, `@fontsource-variable/ibm-plex-sans`, `@fontsource-variable/jetbrains-mono` (verified on disk: each ships `index.css` + `wght.css` + woff2 in `files/`). `style.css` imports the CSS, which emits `@font-face { font-display: swap }`. Space Grotesk and IBM Plex are preloaded in `index.html` via `<link rel="preload">` against the packaged woff2. **No Inter, no Instrument Serif, no Google Fonts `<link>`.**

### 1.5 Spacing, radius, motion tokens

- Spacing: 4/8 rhythm. Sections `py-24 md:py-32`. Container `max-w-7xl mx-auto px-6`.
- **Radius (SHAPE LOCK):** `--radius-xs: 4px` (chips, kbd), `--radius-sm: 8px` (buttons, inputs), `--radius-md: 12px` (cards, tiles). Only one `rounded-full`: the availability pill. **Note:** these override Tailwind v4's built-in `--radius-xs/sm/md` (defaults `0.125/0.25/0.375rem`) **project-wide by intent**, so `rounded-sm`/`rounded-md`/`rounded-xs` now mean our values everywhere.
- **Easing (only four curves):** `--ease-out: cubic-bezier(0.23,1,0.32,1)`, `--ease-in-out: cubic-bezier(0.77,0,0.175,1)`, `--ease-drawer: cubic-bezier(0.32,0.72,0,1)`, `--ease-out-expo: cubic-bezier(0.16,1,0.3,1)`.
- **Duration:** `--dur-press: 160ms`, `--dur-pop: 200ms`, `--dur-modal: 250ms`, `--dur-reveal: 600ms`.
- **Banned:** `transition: all`, `ease-in`, `scale(0)`, linear easing on UI (linear is scroll-scrub only), `window.addEventListener('scroll')`.

### 1.6 Imagery

No image-gen tool is available in this environment, so per `design-taste` Section 4.8 priority 2 we use `https://picsum.photos/seed/{descriptive-seed}/{w}/{h}` with section-specific seeds. All images are real `<img>` with declared `aspect-ratio`, `loading="lazy"` below fold, hero `fetchpriority="high"`, desaturated via a shared class. **Banned:** div-based fake screenshots, hand-rolled decorative SVG. One OG image (Section 9) is a real 1200x630 asset, not picsum.

### 1.7 Z-index scale

`--z-base: 0`, `--z-pin: 30`, `--z-sticky: 40` (nav), `--z-nav-panel: 60` (mobile menu), `--z-skip: 1000` (skip link). No arbitrary `z-50`.

---

## 2. File Structure (collapsed to ~14 files, per review P3-21)

```
portofoio/
├─ index.html                    # SEO/OG meta, font preloads, lang="en"
├─ vite.config.js                # ALREADY PRESENT (vue + @tailwindcss/vite) - unchanged
├─ package.json                  # ALREADY PRESENT (installed deps) - unchanged
├─ public/
│  ├─ favicon.svg                # present
│  ├─ icons.svg                  # present
│  ├─ og-image.png               # NEW 1200x630 social card (Section 9)
│  ├─ robots.txt                 # NEW
│  └─ sitemap.xml                # NEW
└─ src/
   ├─ main.js                    # present; add plugin-registration import if needed - stays line-lean
   ├─ style.css                  # REWRITTEN: @theme tokens + fontsource imports + base
   ├─ App.vue                    # REWRITTEN: skip link inline + section assembly + ScrollTrigger.refresh()
   ├─ composables/
   │  └─ useGsap.js              # EXTENDED: keeps useGsap() + useReducedMotion(); adds
   │                             #   Flip/SplitText registration, useContextGsap(setupFn,{scope}),
   │                             #   useReveal({selector,from,stagger,y}) - the single matchMedia owner
   ├─ data/
   │  └─ site.js                 # EXTENDED: profile + projects + experience + skills + about + nav
   └─ components/
      ├─ SiteNav.vue
      ├─ SiteFooter.vue
      ├─ HeroSection.vue
      ├─ SkillsSection.vue
      ├─ ProjectsSection.vue     # VERTICAL list, not a pin
      ├─ ExperienceSection.vue
      ├─ AboutSection.vue
      ├─ ContactSection.vue
      └─ ui.js                   # AppButton + TechChip as tiny primitives (single file)
```

**Dropped from v1:** `motion/gsapSetup.js`, `motion/presets.js`, `styles/main.css`, `styles/tokens.css`, `composables/{useScrollReveal,useReducedMotion,useSplitHeadline}.js`, `data/{profile,projects,experience,skills}.js`, `RevealGroup.vue`, `MediaFrame.vue`, `StatReadout.vue`, `SectionRule.vue`, `ProjectPanel.vue`, `ProjectDetail.vue`, `SkipLink.vue`. Primitives become utility classes and the tiny `ui.js`.

**Single registration point:** `src/composables/useGsap.js`. No `motion/` layer.

---

## 3. Section-by-Section Spec (6 content sections + nav + footer)

**Layout-family map (5 distinct families, zero repeats):**

| # | Section | Layout family | Motion archetype |
|---|---|---|---|
| - | Nav | fixed hairline bar, offset wordmark | sticky scrim + active-link indicator |
| 1 | Hero | asymmetric split (7/5 offset) | orchestrated on-load timeline + ONE clip-path curtain |
| 2 | Skills | bento field (unequal cells) | staggered tile entrance |
| 3 | Projects | **vertical case-study list** | staggered reveals per entry |
| 4 | Experience | vertical timeline ledger | scrub-drawn spine + entry reveals |
| 5 | About | editorial prose + portrait | fade reveal + count-up |
| 6 | Contact | centered narrow colophon | staggered reveal |
| - | Footer | dense mono meta grid | hairline wipe + column fade |

**Eyebrow budget:** `ceil(6/3) = 2`. Allocation: **Hero (1), Skills (1)**. Every other section uses a bare `<h2>`. Tagged `data-eyebrow` for a mechanical grep.
**CTA intent lock:** exactly ONE contact label, **"Start a conversation"**, used in nav, hero, contact.
**Middle-dot rule:** max 1 `·` per line.
**Pin/Flip/marquee budget:** ZERO pins, ZERO Flips, ZERO marquees.
**CTA reality:** there is no contact form. Primary CTA is `mailto:`. A form is explicit opt-in scope, not planned.

---

### 3.1 Nav (`SiteNav.vue`)

**Layout:** fixed bar, 68px desktop (`<= 80px` cap), `max-w-7xl` inner, hairline bottom border + scrim only after scroll. Wordmark (`site.name`) left, deliberately offset `lg:pl-[4vw]` off the grid column. Links: Work, Skills, Experience, About, Contact. One CTA: "Start a conversation". Mobile: wordmark + menu button.

**Motion:**
| Event | Technique | Easing / duration | Purpose |
|---|---|---|---|
| Load | slide `y: -8` + fade, once | `--ease-out`, 400ms | preventing jarring change |
| Scroll past hero | `.nav-scrim` opacity 0 -> 1 (border + `backdrop-blur`) | `--ease-out`, 200ms | state indication |
| Active section | single accent underline travels between links (`FLIP`-free: one positioned element, `translateX` + width) | `--ease-out`, 250ms | spatial consistency |
| Link hover | underline `scaleX` from `transform-origin: left` | `--ease-out`, 160ms, hover-gated | feedback |
| Mobile menu | panel `translateY(-100%)`, links stagger 40ms | `--ease-drawer`, 400ms | spatial consistency |
| Reduced motion | instant final state; active underline snaps; menu uses opacity only |
| Reduced transparency | `.nav-scrim` gets `backdrop-filter: none` + solid `--color-surface` fill |

---

### 3.2 Hero (`HeroSection.vue`) - asymmetric split

**Layout:** 12-col at `lg`: text cols 1-7, portrait cols 8-12 shifted `lg:mt-16` (offset, not centered). `min-h-[100dvh]`, `pt-24` max, `pb-16`. Exactly 4 text elements: eyebrow, headline (<= 2 lines), subtext (<= 20 words), CTA row (1 primary + 1 secondary link). No tagline under CTAs, no trust strip, no scroll cue.

**Content (de-identified, no name/gender/city/tenure):**
- Eyebrow: `$ whoami` (static mono, `--color-accent`, **non-blinking** cursor).
- Headline (Space Grotesk 600, `text-4xl md:text-5xl lg:text-6xl tracking-[-0.03em] leading-[1.05]`): **"I build the whole stack, from the first query to the last animation frame."**
- Subtext (<= 20 words, no city, no invented tenure): **"Interfaces and the APIs behind them, built to hold up under production load and stay fast as the data grows."** (19 words, no biography claim.)
- CTAs: primary **"Start a conversation"** (`mailto:`), secondary **"See selected work"** (anchor to Projects).
- Portrait: real `<img>`, `aspect-[4/5]`, seed `portrait-placeholder`, `fetchpriority="high"`, `--radius-md`, with a 1px accent rule along its left edge.

**Motion:**
| Element | Technique | Easing / duration | Purpose |
|---|---|---|---|
| Headline | **Reveal** clip-path `inset(0 0 100% 0) -> inset(0)` (**the ONE curtain**) | `--ease-in-out`, 800ms | storytelling |
| Eyebrow / subtext / CTAs | **Stagger** of **Slide in** + fade (y: 16), 70ms apart | `expo.out`, 500ms | hierarchy |
| Portrait | **Fade in** + y: 12 (no second curtain) | `--ease-out`, 500ms, delay 0.2 | preventing jarring change |
| Reduced motion | everything at final state, opacity-only 200ms; cursor static; curtain renders open |

**Hero discipline:** H1 must be `display: block` with a stable width before any SplitText (no split here; the curtain is a clip-path on the block). Headline <= 2 lines, subtext <= 3 lines, CTA above fold. `ScrollTrigger.refresh()` debounced after `document.fonts.ready` + hero image `load`.

---

### 3.3 Skills (`SkillsSection.vue`) - bento field

**Layout:** `lg:grid-cols-12`, 4 tiles sized `col-span-5`, `col-span-7`, `col-span-7`, `col-span-5` (unequal, 4 cells for 4 items, no empty cell). Visual variation: tile 2 gets `surface-2` tint + an inline code snippet; tile 4 gets a subtle `--color-border` grid-pattern background. Tiles 1 and 3 stay flat `surface`. That is 2 of 4 cells with real variation.

**Content:** each tile = discipline name (Space Grotesk 500) + one line + `TechChip` list. Chips carry **real Simple Icons SVG logos** (`cdn.simpleicons.org`) + text label.
- Frontend: Vue 3, TypeScript, Tailwind, Vite, GSAP
- Backend: Node.js, PostgreSQL, Redis, Fastify, GraphQL
- Data & Infra: dbt, ClickHouse, Docker, Fly.io, GitHub Actions
- Tooling: Vitest, Playwright, ESLint, Turborepo, Storybook

**Motion:**
| Element | Technique | Easing / duration | Purpose |
|---|---|---|---|
| Tiles | **Stagger** of **Scale in** (0.97 + y: 20 + fade) via `useReveal` batch | `expo.out`, 600ms, stagger 0.08 | hierarchy |
| Tile hover | `border-color` + `background` shift to `surface-2` (**no 3D tilt**, no `pointermove`) | `--ease-out`, 200ms, hover-gated | feedback |
| Chips | **Stagger** within tile | `--ease-out`, 300ms | hierarchy |
| Reduced motion | tiles at final state, single short fade; hover color shift retained (non-motion) |

---

### 3.4 Projects (`ProjectsSection.vue`) - vertical case-study list (NO pin)

**Layout:** a single-column list of 4 case-study entries, each a full-width row separated by `divide-y` hairlines (NOT a card per item; grouping by hairline per `design-taste` Section 4.4). Each row at `lg` is a 2-col grid: left col-span-7 = title + role + summary + outcome + chips; right col-span-4 = a real `aspect-[4/3]` image, offset down `lg:mt-8` (variation without zigzag flips; the list is one family because every row is left-text/right-image consistently, never alternating).

**Content (4 invented case studies, clearly placeholder data, not attached to a named human):**
1. **Ledgerline** - Real-time payments reconciliation. Stack: Vue 3, Fastify, PostgreSQL, Redis Streams, ClickHouse. Outcome: **"Cut end-of-day reconciliation from 40 minutes to 90 seconds across 2.1M daily transactions."**
2. **Atlas Auth** - SSO and session layer for a B2B SaaS. Stack: Node.js, OAuth 2.1, PostgreSQL, TypeScript. Outcome: **"Replaced four bespoke logins with one session layer, halving access-related support tickets."**
3. **Fjord Analytics** - Self-serve dashboards on a warehouse. Stack: Vue 3, dbt, DuckDB, Tailwind. Outcome: **"Let non-engineers build their own cohorts, so the data team stopped taking one-off requests."**
4. **Undertow** - Offline-first field inspection app. Stack: Vue 3, IndexedDB, Workbox, Cloudflare Workers. Outcome: **"Syncs cleanly through six-hour dead zones and never shows a spinner it cannot honour."**

**Motion:**
| Element | Technique | Easing / duration | Purpose |
|---|---|---|---|
| Section headline | **Scroll reveal** (y: 20 + fade, once, `start: "top 80%"`) | `expo.out`, 600ms | hierarchy |
| Rows | **Scroll reveal** (y: 24 + fade) batched, stagger 0.08 | `expo.out`, 500ms | storytelling |
| Row image | **Parallax** (yPercent -4 -> 4, small) | scrub 1 | depth |
| Reduced motion | rows at final state; no parallax |

No `ProjectDetail` overlay. Clicking a row (if a link exists) navigates to an external repo/case URL, not an in-page Flip.

---

### 3.5 Experience (`ExperienceSection.vue`) - timeline ledger

**Layout:** a single left hairline spine (`lg:pl-[7rem]`), each entry offset with a mono date in the left margin and role detail right. 4 entries. No alternating sides (that is the banned zigzag).

**Content:**
1. **2022 - Present** | Independent engineer | "Three long-running client engagements: a payments reconciliation platform, an analytics workspace, and an offline field app. Own the schema, the API, and the interface."
2. **2019 - 2022** | Senior fullstack engineer, **Northwind Freight** | "Rebuilt the shipment tracking surface and the event pipeline behind it. Cut p95 page load from 4.2s to 1.1s and retired two cron jobs nobody wanted to maintain."
3. **2017 - 2019** | Backend engineer, **Bellweather Health** | "Built the patient-record sync service and its audit trail. Learned more about idempotency than I expected to."
4. **2013 - 2017** | BS Computer Science, University of Lagos | "Thesis on incremental view maintenance. Mostly databases, which turned out to be a career."

**Motion:**
| Element | Technique | Easing / duration | Purpose |
|---|---|---|---|
| Spine | **Line drawing** (`scaleY` from 0, `transform-origin: top`, height driven by scroll) | scrub (linear) | storytelling |
| Entries | **Scroll reveal** (x: -16 + fade, once) staggered 0.1 | `expo.out`, 500ms | hierarchy |
| Dates | **Fade in** slightly ahead of bodies | `--ease-out`, 350ms | hierarchy |
| Reduced motion | spine rendered full-height statically; entries final state |

---

### 3.6 About (`AboutSection.vue`) - editorial prose + portrait

**Layout:** stacked headline (`max-w-[20ch]`), then `lg` 2-col: left col-span-7 prose (`max-w-[65ch]`), right col-span-4 aside with portrait + 2 `font-mono tabular-nums` readouts + a "Now" list. Headline stacks; no split-header.

**Content:**
- `<h2>`: **"I like boring infrastructure and interfaces people forget to notice."**
- Body: **"I started in data engineering, moved toward the product surface, and never picked a side. Most of my work is glue: event pipelines, Postgres schemas that survive migrations, and Vue frontends that stay fast when the dataset grows. I care about the unglamorous parts, because that is where products quietly succeed or quietly fall over."**
- Now (mono list): "Writing a Postgres logical-replication series" / "Maintaining two open-source Vue composables" / "Learning Rust, slowly, on weekends"
- Readouts: `{YEARS}` token (unresolved -> renders `--`, swappable) + `40+ production releases` + `3 time zones`. All labeled `// TODO: swap with real numbers` in `site.js`.

**Motion:**
| Element | Technique | Easing / duration | Purpose |
|---|---|---|---|
| Headline | **Scroll reveal** (y: 20) | `expo.out`, 600ms | hierarchy |
| Portrait | **Fade in** (no clip-path; the curtain is spent in the hero) | `--ease-out`, 500ms | preventing jarring change |
| Body lines | **Stagger** of **Fade in** (line groups, <= 4) | `expo.out`, 500ms, stagger 0.08 | storytelling |
| Now list | **Stagger** (y: 10) | `--ease-out`, 350ms | hierarchy |
| Readouts | **Number ticker** on the numeric value only, `tabular-nums` | `--ease-out`, 900ms | state indication |
| Reduced motion | all final state; ticker instant |

---

### 3.7 Contact (`ContactSection.vue`) - centered colophon

**Layout:** the page's ONE centered moment. `max-w-2xl mx-auto text-center`.

**Content:**
- `<h2>`: **"I have room for one more project this quarter."**
- Body (<= 25 words): **"If you are building something that has to hold up under real load, tell me what it is. I read every message and reply within two working days."**
- Primary CTA: **"Start a conversation"** -> `mailto:hello@example.com`
- Secondary: **"Download CV"** -> `/cv.pdf` (ghost button)
- Links: `hello@example.com` (Phosphor `Envelope`), `github.com/your-handle` (`GithubLogo`), `linkedin.com/in/your-handle` (`LinkedinLogo`)
- ONE availability pill (`rounded-full`, accent-tinted, single small accent dot): **"{AVAILABILITY}"** from `site.js` (placeholder, swappable). The page's only status dot.
- **Explicitly: no contact form.** The CTA is `mailto:` plus external links. A form is out of scope unless requested.

**Motion:**
| Element | Technique | Easing / duration | Purpose |
|---|---|---|---|
| Headline + body | **Scroll reveal** (y: 16) | `expo.out`, 550ms | hierarchy |
| Availability dot | **Pulse** (opacity only, restrained) | 2.4s infinite, `ease-in-out` | state indication |
| Contact links | **Stagger** 30ms | `--ease-out`, 300ms | hierarchy |
| Reduced motion | final state; dot static |

---

### 3.8 Footer (`SiteFooter.vue`)

**Layout:** `lg:grid-cols-4` mono meta band: (1) name + role, (2) sitemap anchors, (3) elsewhere (real links), (4) colophon. **The single permitted location mention** lives here as an optional `site.location` on the contact line. No version footer, no locale strip, no fake sync.

**Content:** colophon **"Built with Vue 3, Tailwind, and GSAP. Typeset in Space Grotesk, IBM Plex Sans, and JetBrains Mono."**; legal row `(c) 2026 {NAME}` + a focusable **"Back to top"** control.

**Motion:** top border `scaleX` wipe (origin left) + 4-column stagger fade (60ms). Nothing else. Reduced motion: instant.

---

## 4. Component List with Props (plain object props)

| Component | Props | Emits | Notes |
|---|---|---|---|
| `AppButton` (in `ui.js`) | `{ label: String, href: String, variant: String, icon: String, disabled: Boolean }` | - | `<a>` if `href`, else `<button>`. `:active` scale 0.97. |
| `TechChip` (in `ui.js`) | `{ name: String, slug: String, href: String }` | - | Simple Icons SVG + label, `rounded-xs`. |
| `SiteNav` | `{ name: String, nav: Array, ctaLabel: String, ctaHref: String }` | `navigate` | |
| `SiteFooter` | `{ name: String, role: String, location: String, social: Object, nav: Array }` | - | |
| `HeroSection` | `{ eyebrow: String, heading: String, subtext: String, portrait: Object, ctaLabel: String, ctaHref: String, secondaryLabel: String }` | - | |
| `SkillsSection` | `{ groups: Array }` | - | |
| `ProjectsSection` | `{ projects: Array }` | - | |
| `ExperienceSection` | `{ entries: Array }` | - | |
| `AboutSection` | `{ heading: String, body: String, now: Array, readouts: Array, portrait: Object }` | - | |
| `ContactSection` | `{ heading: String, body: String, email: String, cvHref: String, social: Object, availability: String }` | - | |

`site.js` exports content matching these props 1:1; `App.vue` wires them.

---

## 5. Stack + Tailwind v4 Setup (installed truth)

**`package.json` deps (ALREADY INSTALLED - do not change):**
```json
{
  "dependencies": {
    "gsap": "^3.15.0",
    "vue": "^3.5.42"
  },
  "devDependencies": {
    "@tailwindcss/vite": "^4.3.3",
    "@vitejs/plugin-vue": "^6.0.8",
    "tailwindcss": "^4.3.3",
    "vite": "^8.3.0"
  }
}
```
Plus the three font packages installed for this plan:
```json
"dependencies": {
  "@fontsource-variable/ibm-plex-sans": "^5.2.0",
  "@fontsource-variable/jetbrains-mono": "^5.2.0",
  "@fontsource-variable/space-grotesk": "^5.2.0"
}
```
**Never downgrade.** `vite@8` + `@vitejs/plugin-vue@6` require Node >= 20.19 (local: 24.16.0).

**`vite.config.js` (ALREADY PRESENT - unchanged):** `vue()` + `tailwindcss()` from `@tailwindcss/vite`. No `postcss.config.js`, no `tailwind.config.js` (Tailwind v4 is CSS-first).

**Tailwind v4 syntax rules for the build:**
- Consume theme tokens as **generated utilities**: `bg-bg`, `bg-surface`, `bg-surface-2`, `border-border`, `text-fg`, `text-fg-muted`, `text-accent`, `font-display`, `font-mono`. These exist automatically because the names live under `--color-*` / `--font-*` in `@theme`.
- If an arbitrary value is ever needed, use v4 shorthand `bg-(--color-surface)`. **NEVER `bg-[--color-surface]`** (v3 syntax, incorrect in v4).
- `--radius-xs/sm/md` deliberately override Tailwind's built-in radius tokens project-wide. Intended; stated so nobody is surprised when `rounded-md` = 12px.

---

## 6. GSAP Architecture (single registration point: `src/composables/useGsap.js`)

**Kept from the repo:** `useGsap()` returning `{ gsap, ScrollTrigger }`; `useReducedMotion()` returning `{ matches, prefersReducedMotion }`.
**Added:**
- `Flip` + `SplitText` added to the one-time registration block (both verified present in `node_modules/gsap/`).
- `useContextGsap(setupFn, { scope })` - creates a `gsap.context` scoped to a ref el, calls `setupFn({ gsap, ScrollTrigger, el })`, reverts on unmount. **This is the name the plan uses; the existing `useGsap` is NOT overloaded.**
- `useReveal({ selector, from, stagger, y })` - `ScrollTrigger.batch` reveal, **owns its own `gsap.matchMedia`** with a reduced-motion branch that just sets final state.

**Single-matchMedia-owner rule (P2-19):** `useReveal` (and `useContextGsap` for bespoke timelines) own the media queries. Section components pass config objects; they never register their own `matchMedia`. This removes the double-registration/double-fire risk.

**Cleanup contract:** `ctx.revert()` on unmount; `split.revert()` before it when SplitText is used (restores real text nodes); `ScrollTrigger.batch` arrays `.kill()`ed; `mm.revert()`; a single debounced `ScrollTrigger.refresh()` after `document.fonts.ready` + hero image `load`, fired from `App.vue`.

**Reduced-motion completeness (P2-20):**
- SplitText headings: under reduced motion, **reverted to plain text** (no split wrapper), shown static.
- Any ScrollTrigger scrub (Experience spine, Projects parallax): **not pinned, not scrubbed**, content rendered in final state.
- Nav scrim: `prefers-reduced-transparency: reduce` -> `backdrop-filter: none` + solid fill.
- CSS blanket kill in `style.css` is the safety net; `gsap.matchMedia` is the real branch (the blanket kill does not stop JS tweens).

---

## 7. Anti-Slop Checklist (build must pass; grep scoped to `src/**`)

**Content**
- [ ] ZERO em-dashes (U+2014) / en-dashes (U+2013) in `src/**`. Grep scoped to `src/**` so PLAN.md and the review file do not false-positive.
- [ ] No AI clichés: Elevate / Seamless / Unleash / Next-Gen / Delve / Revolutionize.
- [ ] No "John Doe" / "Acme" / "Lorem". Handles are `example.com` / `your-handle`; the human identity is neutral TODO.
- [ ] No invented tenure in the hero (no "nine years"); `{YEARS}` token only, in About.
- [ ] No fake-precise numbers without a `// TODO` label in `site.js`.
- [ ] One contact label: "Start a conversation". No duplicate CTA intent.
- [ ] Max 1 middle-dot `·` per line.

**Layout**
- [ ] No two sections share a layout family (5 families / 6 sections, proven in Section 3 map).
- [ ] Eyebrow count <= ceil(6/3) = 2 (Hero, Skills), `data-eyebrow` greppable.
- [ ] No split-header; no 3-consecutive zigzag (Projects rows never alternate).
- [ ] Hero: <= 2-line headline, <= 20-word subtext, CTA above fold, `pt <= 24`, exactly 4 text elements.
- [ ] Nav single line at `lg`, height 68px.
- [ ] Bento: 4 tiles / 4 cells, no empty cell, 2 cells with visual variation.
- [ ] `min-h-[100dvh]` everywhere, never `h-screen`. `scroll-margin-top: 72px` on every `[id]` section.
- [ ] No horizontal scroll at 375px.

**Visual**
- [ ] Dark-only theme lock; no inversion; no Inter/Instrument Serif; `color-scheme: dark`.
- [ ] Single accent `#22C55E`; radius lock `4/8/12`; only one `rounded-full` (availability pill).
- [ ] No neon/glow, no AI-purple, no gradient hero, no pure `#000`/`#fff`.
- [ ] No `transition: all`. Theme utilities or `bg-(--var)`, never `bg-[--var]`.
- [ ] Real images (picsum seeds); no div fake screenshots; no hand-rolled decorative SVG.
- [ ] Logo chips: real Simple Icons SVG, no fabricated wordmarks.
- [ ] No pills on images, no photo-credit captions, no version footer, no locale strip, no scroll cue.

**Motion**
- [ ] Every animation justifiable in one sentence.
- [ ] No `ease-in`, no `scale(0)`, no layout-property tweens, UI state changes <= 300ms.
- [ ] ZERO pins, ZERO Flips, ZERO marquees, ZERO 3D tilt, ZERO typewriter, ONE clip-path curtain, ONE centered moment.
- [ ] Hover motion gated `@media (hover:hover) and (pointer:fine)`.
- [ ] Press scale 0.97; entrances start at 0.97 not 0; stagger 30-80ms.
- [ ] No `window.addEventListener('scroll')`.
- [ ] Composable owns matchMedia; sections pass config only.
- [ ] Reduced motion: SplitText reverted to plain text; scrubs unpinned/static; nav scrim solid.

**Engineering**
- [ ] Tailwind via `@tailwindcss/vite`; no postcss config; no `tailwind.config.js`.
- [ ] GSAP plugins registered once in `useGsap.js` only.
- [ ] Cleanup: `ctx.revert`, `split.revert`, `.kill()`, `mm.revert()`.
- [ ] `ScrollTrigger.refresh()` after fonts + hero image.

---

## 8. Accessibility + Performance

**Accessibility**
- Dark-only; body text >= 4.5:1 (`#F1F5F9`, `#94A3B8` pass). Accent pair `#22C55E`/`#052E16` = 6.9:1.
- Focus: `2px solid #22C55E`, `outline-offset: 3px`, never removed. Skip link inline in `App.vue` to `#main`, `--z-skip`.
- Semantics: one `<h1>` (hero), sequential `<h2>`, `<nav aria-label="Primary">`, `<main id="main">`.
- Reduced motion honored per Section 6; reduced transparency for the scrim.
- SplitText reverted on unmount and under reduced motion.
- Touch targets >= 44px; `touch-action: manipulation`.
- **No form** (contact is `mailto:` + links), so no form-contrast surface. If a form is added later, it inherits label-above-input + 4.5:1 rules.
- Images: descriptive `alt`; decorative `alt=""`.

**Performance**
- Targets: LCP < 2.5s (hero portrait preloaded), INP < 200ms, CLS < 0.1 (declared `aspect-ratio`, `font-display: swap`).
- `min-h-[100dvh]`; images lazy below fold, hero `fetchpriority="high"`.
- Bundle: GSAP core + ScrollTrigger + Flip + SplitText only. No Three, no Motion library (never mix GSAP and Motion in one tree).
- Transform/opacity only; `will-change` surgical; grain on a fixed `pointer-events-none` pseudo-element only.
- Fonts: variable woff2 via `@fontsource-variable/*`, preloaded display + body, `font-display: swap`.
- Node >= 20.19 for `vite@8`.

---

## 9. SEO / OG / Metadata / Deployment

`index.html` (currently only viewport + title) gets:
- `<html lang="en">`, `<meta name="description">` (<= 155 chars), `<link rel="canonical" href="https://example.com/">`, `<meta name="theme-color" content="#0F172A">`.
- Open Graph: `og:type=website`, `og:title`, `og:description`, `og:url`, `og:image` -> `/og-image.png` (REAL 1200x630 asset added to `public/`; picsum is NOT acceptable as a permanent OG asset), `og:image:width/height`, `og:site_name`.
- Twitter: `twitter:card=summary_large_image`, `twitter:title`, `twitter:description`, `twitter:image`.
- `<link rel="apple-touch-icon" href="/apple-touch-icon.png">` (add the asset) and keep the existing `favicon.svg`.
- Heading hierarchy: single `<h1>`; sections `<h2>`; sub-blocks `<h3>`.

Added files: `public/robots.txt` (allow all + sitemap line), `public/sitemap.xml` (single URL for the one-page site).

**Deployment:** `npm run build` -> `dist/`. Static host (Netlify / Vercel / Cloudflare Pages / GitHub Pages). Set long cache headers on `/assets/*` and `/fonts/*` (hashed/immutable), short on `index.html`. Single page, no client router, so no SPA rewrite rule is needed; if a router is ever added, add the host's rewrite (`_redirects` / `vercel.json`). Node >= 20.19 at build time.

---

## 10. Content Inventory (final strings; no em-dashes)

**Profile (`site.js`, neutral placeholders)**
- `name: ''` (TODO), `role: 'Fullstack Developer'`, `location: ''` (TODO, footer only), `email: 'hello@example.com'`
- `social: { github: 'https://github.com/your-handle', linkedin: 'https://linkedin.com/in/your-handle' }`
- `availability: '{AVAILABILITY}'` (placeholder)

**Hero** - eyebrow `$ whoami`; headline `I build the whole stack, from the first query to the last animation frame.`; subtext `Interfaces and the APIs behind them, built to hold up under production load and stay fast as the data grows.`; CTAs `Start a conversation` / `See selected work`.

**Skills** - 4 tiles as listed in 3.3.

**Projects** - 4 case studies as listed in 3.4 (Ledgerline, Atlas Auth, Fjord Analytics, Undertow), each with its one-line outcome.

**Experience** - 4 entries as listed in 3.5.

**About** - heading `I like boring infrastructure and interfaces people forget to notice.`; body as in 3.6; Now list as in 3.6.

**Contact** - heading `I have room for one more project this quarter.`; body as in 3.7; CTA `Start a conversation`; secondary `Download CV`; no form.

**Footer** - colophon as in 3.8; legal row `(c) 2026 {NAME}`.

**Banned-list grep (run on `src/**` only):** `—`, `–`, `Elevate`, `Seamless`, `Unleash`, `Next-Gen`, `Delve`, `Acme`, `John Doe`, `Lorem`, `transition: all`, `scale(0)`, `ease-in`, `h-screen`, `window.addEventListener('scroll')`, `bg-[--`.

---

## 11. Build Order

1. `style.css` rewrite (tokens + fontsource + base + reduced-motion/transparency). Verified by build.
2. `site.js` extension (neutral placeholders + full content shape).
3. `useGsap.js` extension (`useContextGsap`, `useReveal`, Flip/SplitText registration).
4. `ui.js` primitives, then components dumb-first (no motion); verify layout families at 375/768/1024/1440.
5. Layer motion section by section, testing the reduced-motion branch immediately.
6. `App.vue` assembly + inline skip link + `ScrollTrigger.refresh()` wiring; `index.html` SEO/OG.
7. OG image, robots.txt, sitemap.xml. Full checklist + Lighthouse + em-dash grep on `src/**`.

---

## Appendix A - Skill Inputs

- **Design-system generator** (`search.py "developer portfolio fullstack modern minimal" --design-system --variance 7 --motion 8 --density 4 -p Portfolio --persist`): returned Variance 7 / Motion 8 / Density 4, style "Dark Mode (OLED)", palette bg `#0F172A`, primary `#1E293B`, accent `#22C55E`, fg `#F8FAFC`, muted-fg `#94A3B8`; typography JetBrains Mono + IBM Plex Sans; motion Page Transition (Flip). Persisted to `design-system/portfolio/MASTER.md`. Applied with corrections: on-accent contrast fixed to `#052E16`, cards/shadows replaced with hairline grouping, ring recolored to accent, **Flip/marquee/pin motion from MASTER deliberately NOT adopted** (see Section 0).
- **Supplementary searches applied:** landing (`portfolio-grid`, `hero-centric` reduced-motion CTA, `hero-features-cta` contrast/parallax rules); gsap (`scrub: 1` + `pin` guidance, `expo.out` stagger, SplitText `.revert()`, `play none none reverse`); style (`minimalism-and-swiss-style`: grid, single accent, 200-250ms hover); typography ("Developer Mono" pairing).
- **Vue-stack search:** `--stack vue "scroll driven gsap pin"` returned **no database match** (closest terms `derived`, `pinia`). Stated per instruction; Vue GSAP architecture follows the framework-agnostic canonical guidance translated to composables.
- **Taste law read in full:** `design-taste-frontend/SKILL.md` (1206 lines), `ui-ux-pro-max/references/{quick-reference,pro-rules}.md`, `minimalist-ui/SKILL.md`, `animation-vocabulary/SKILL.md`, `animate/SKILL.md` + `RECIPES.md`, `review-animations/SKILL.md` + `STANDARDS.md`, `emil-design-eng/SKILL.md`.
