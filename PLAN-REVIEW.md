# PLAN-REVIEW.md — Adversarial critique of PLAN.md

**Reviewer:** skeptical design reviewer
**Date:** 2026-10-12
**Subject:** `PLAN.md` (797 lines) for `portofoio`
**Verified against:** live repo state (`package.json`, `vite.config.js`, `src/`, `public/`), `design-taste-frontend/SKILL.md` (1206 lines), `ui-ux-pro-max/references/quick-reference.md`, `design-system/portfolio/MASTER.md`.

---

## VERDICT: **REJECT** (rework required before build)

**One-line reason:** the plan is beautifully researched and internally self-aware, but it is grounded in a *reality that no longer exists*. The repo was scaffolded **after** the plan's assumptions were written, and the two now contradict each other on framework versions, palette, typography, dark-mode strategy, and the composable API. On top of that, the plan violates the user's literal words ("**simple**, clean") by shipping a 9-section cinematic scroll-storytelling machine, and it invents a hard gender/name/location identity the user never asked for.

The plan is not wrong in *taste*; it is wrong in *scope, freshness, and discipline*. Roughly 40% of the motion system should be cut, and the identity must be neutralised.

---

## 1. "Simple & clean" vs the plan's complexity — **IT VIOLATES THE BRIEF**

The user said exactly three aesthetic words: **modern, simple, clean**, plus "lots of GSAP animation, not AI-slop". The plan optimises hard for the third clause and largely ignores the first three.

Concrete over-engineering, in dependency order:

| # | Plan ref | What it adds | Verdict |
|---|---|---|---|
| 1.1 | §3.5 | **Pinned horizontal-pan rail** (scroll hijack) | **CUT.** Hijacking vertical scroll into horizontal is the single most "not simple" pattern on the page. It is also the highest-risk GSAP technique (see §2). It buys novelty, not clarity. |
| 1.2 | §3.7 + §1.5(6) | **Flip shared-element portrait** (About → Contact) | **CUT.** `SKILL.md` §5.D and MASTER.md both warn compounding Flips are hard to time; a portrait morphing across two sections is a showreel move. A crossfade reads as *more* refined. |
| 1.3 | §3.4 | **Marquee band** | **CUT.** `SKILL.md` §5 allows max-1/page, but a marquee is *filler motion* (see §4.9 "marquee for lots-of-things-that-don't-need-attention"). The pills already carry the stack. It adds nothing but "we have motion". |
| 1.4 | §3.2 | **Typewriter `$ whoami`** | **CUT or make static.** Typewriter is a stock AI-portfolio trope. A static `$ whoami` mono eyebrow with a non-blinking cursor reads cleaner and is 100% less slop. |
| 1.5 | §3.2 / §3.3 | **Two clip-path curtains** (hero portrait + about portrait) | **REDUCE TO ONE.** Twice is a tic. |
| 1.6 | §3.4 | **3D pointer tilt on bento tiles** | **CUT.** Tilt needs `pointermove` → rAF → `quickTo`; it is feedback-motion nobody asked for and it is exactly the "physics for its own sake" that reads as AI. |
| 1.7 | §3.3 / §3.5 / §3.6 | **Number ticker, containerAnimation staggers, scrub-drawn SVG spine** | **KEEP, but demote.** These are cheap and legible. The spine is fine. The ticker is borderline — keep only if the numbers are honest. |
| 1.8 | §3 (whole) | **9 sections** (Nav, Hero, Skills, Projects, Experience, About, Contact, Footer = 8 blocks + nav) | **CUT TO 6.** See §6. |

**Where "simple" actually lives:** the section map in §3 even *admits* the reorder confusion ("About comes AFTER Skills/Projects in what follows visually? No... Correction: reorder"). A plan that has to argue with itself about section order mid-document is a complexity smell. The user wanted a clean portfolio; the plan is writing a design-system thesis.

**Cut target:** remove the 4 pinned/Flip/marquee/tilt systems above → the page goes from *8 distinct layout families* to *~5*, which is still well above the `SKILL.md` §4.7 floor of "≥4 families". You lose nothing the brief asked for. You gain simplicity, which the brief *did* ask for.

---

## 2. GSAP realism — **THREE REAL, ONE LATENT RISK**

### 2.1 `x: -(trackWidth - viewport)` is implemented wrong in §3.5
The plan writes the pan distance as `-(trackWidth - viewport)` in prose and `end: () => '+=' + distance` in §3.5, but **never says `distance` must be `track.scrollWidth - window.innerWidth` computed at refresh time**. `SKILL.md` §5.B is explicit: `end: () => \`+=${distance}\`` with `distance = track.scrollWidth - window.innerWidth`, plus `invalidateOnRefresh: true`. Without `invalidateOnRefresh` the distance is stale after any resize/font-change and the end of the rail is unreachable. **This is the #1 correctness bug in the plan's motion spec.** (Mitigated if you follow my recommendation to cut the pin entirely.)

### 2.2 Pinned section vs the fixed nav — **NOT addressed anywhere**
The plan pins §3.5 with `start: "top top"`. The nav (§3.1) is `fixed`, 68px tall. When a section pins at `top top`, its first 68px are **under the nav**. The plan's `--z-pin: 30` < `--z-sticky: 40` is correct for stacking, but nothing in the plan reserves pin offset. Required: either `ScrollTrigger` with `start: "top 68px"` / `pinSpacing` accounting, or a `scroll-margin-top` on the pinned wrapper, or the pin's inner content gets `pt-[68px]`. **As written, the top of the rail collides with the wordmark.** Same latent bug for the anchor links (§3.1 nav anchors to sections — with a 68px fixed bar every scroll-to-section lands under the bar unless `scroll-margin-top: 68px` is set on every `[id]` section).

### 2.3 `ScrollTrigger.refresh()` timing — **half-addressed**
The plan *does* mention refresh after `document.fonts.ready` and hero image load (§3.5, §6.6, §7 checklist). Good. **But** it routes fonts through self-hosted `@font-face` with `font-display: swap`, and **there is no `public/fonts/` directory in the repo** (verified: `public/` contains only `favicon.svg` and `icons.svg`). So on first build the fonts 404 → fallback metrics → then swap → **layout shifts after refresh has already run**. The refresh must also fire on `document.fonts.ready` *and* on `${usedFont}.load()` resolution, and CLS protection needs `size-adjust`/`ascent-override` on the `@font-face` (the plan §8 gestures at "size-adjust" but never specifies it). Also: the `gsap.set(items, {opacity:0, y})` in §6.4 runs in `onMounted` → for a client-side SPA there is a **flash of positioned content before the reveal wires up** on slow devices. Acceptable, but note it.

### 2.4 Latent: `gsap.context` + `matchMedia` double-revert
§6.3 creates the context **and** does `mm?.revert()` then `ctx?.revert()`. If the `matchMedia` handle is created *inside* the `gsap.context(() => {...})` callback (as written: `ctx = gsap.context(() => { mm = setupFn(...) }, el)`), then `ctx.revert()` already reverts animations **and** the `mm.revert()` runs first — this is mostly harmless but it is double bookkeeping and can throw if `mm` is undefined (the `?.` saves it). Acceptable, but the section notes prescribe "every animation-bearing section registers TWO matchMedia branches" (§6.5) while `useScrollReveal` (§6.4) already does this internally — **double registration is the likely outcome and will double-fire entrance tweens**. Call it out: one `matchMedia` owner per effect.

### 2.5 `SplitText` API risk
§3.2 uses `SplitText` with `type: 'lines,words'` on the H1. GSAP 3.13+ SplitText warns when splitting `lines` on `display: inline` / non-block elements and requires the element to be block-level with a defined width. The plan never states the H1 must be `display:block` with a stable width **before** split (and reverted before resize re-split). Add: split fonts after `document.fonts.ready`, revert on resize, never split inside a `max-width: fit-content` box.

---

## 3. Anti-slop verification — **PLAN PASSES MOSTLY, BUT OSCILLATES**

Cross-checked against `design-taste-frontend/SKILL.md` §4.4–§4.9, §9.F, §9.G.

| Check | Result | Evidence |
|---|---|---|
| **Eyebrow over-count** | **PASS** | §3 budget: `ceil(9/3)=3`, allocated Hero/Skills/Contact, `data-eyebrow` greppable. Correct and mechanical. |
| **Marquee count** | **PASS (1)** | §3.4 single marquee, locked. |
| **Centered hero** | **PASS** | §3.2 is an asymmetric 7/5 split, not centered. §3.7 centred-once is explicitly justified against §4.3's "anti-center targets the default hero". |
| **"Used by" wall** | **PASS** | No trust wall; §1.5(5) is a logo-only stack list, no labels (satisfies §4.8 LOGO-ONLY). |
| **Micro-meta sentences** | **PASS** (none present) | No "each of these is a feature we ship today" strings. |
| **Version footers** | **PASS** | §3.8 explicitly bans `v1.4.2`, no fake sync. |
| **Pills on images** | **PASS** | §3.5 explicitly "no pills overlaid on images". |
| **Duplicate CTA intent** | **PASS** | §3 CTA lock: one "Start a conversation". |
| **Em-dashes** | **PASS in content, but...** | §9 says zero em-dashes and the "Comment banned-list" grep is a good move. **However** the plan's own prose (§0.1, §0.3, §3.3, etc.) is riddled with `—`. That is internal reviewer-speak and does not ship, so **not a ship-blocker** — but the grep must run on `src/**` only, and the plan should say so, or the em-dash check will false-positive on PLAN.md itself. |
| **Middle-dot `·` ration** | ⚠️ **AT RISK** | §3.2 mono rail is `FULLSTACK ENGINEER / REMOTE` (slash, fine) but §3.4/§3.6 use `·`-separated metadata. `SKILL.md` §9.F: max 1 `·` per line. Audit. |
| **Locale strip** | ⚠️ **VIOLATION ADJACENT** | §3.2 rail + §3.6 "Lisbon" + §3.8 "Fullstack engineer, Lisbon" + §0 persona "Lisbon". `SKILL.md` §9.F: "Locale / city-name / time / weather strips are banned for 99% of briefs... a single contact-address mention in the footer is fine; an atmospheric locale strip is not." The plan puts "Lisbon" in **hero subtext** ("Currently freelancing from Lisbon") **and** the mono rail. That is an atmospheric locale mention → **failure**. Only the footer contact line should carry location. |
| **Decorative status dot** | **PASS (1)** | §3.7 availability pill, dot conveys real state, exactly one. §9.F allows this. |
| **Banned fonts** | **PASS** | No Inter, no Fraunces/Instrument Serif. **⚠️ CONFLICT:** the *repo* (`src/style.css`) currently uses **Inter + Instrument Serif** — the plan and the code disagree (see §5). |
| **`transition: all`** | **PASS** | Banned in §1.4/§7. (Note: MASTER.md's own button/card CSS uses `transition: all` — the plan correctly overrides it.) |

**Net:** the slop *checklist* is genuinely strong. The two live risks are the **locale mention in the hero** and the **`·` separator discipline**. Both are cheap fixes.

**One more slop-flag the plan missed:** §3.7 "I answer every email within two working days" is a **micro-meta promise sentence** and §3.7 "I have room for one more project this quarter" is availability-bait that is effectively a *fake live counter* (`SKILL.md` §9.F bans "Reservation 412 of 800"-style counters unless real). "One more project this quarter" is honest-ish but sits close to the line. Fine to keep if the user's data file marks it swappable.

---

## 4. Persona / content — **INAPPROPRIATE AS SPECIFIED; MAKE IT NEUTRAL**

The user never gave a name, gender, or city. The plan invents **"Mara Okonjo, fullstack engineer, Lisbon"** and hard-codes it into: `§0` header, §1.5(6) portrait seed `mara-okonjo-portrait`, §3.1 wordmark, §3.2 subtext, §3.3 About copy ("Writing a Postgres logical-replication series"), §3.6 "Independent engineer, Lisbon", §3.7 `hey@maraokonjo.dev` / `github.com/maraokonjo` / `linkedin.com/in/maraokonjo`, §3.8 footer, §9 content inventory. That is not a placeholder — it is a **person**.

Problems:
1. **Gender/identity is asserted by the LLM, not the user.** A real user (any gender) will replace it; shipping "Mara" throughout means the hero, the email, the GitHub handle, and the CV filename are all wrong for them.
2. `SKILL.md` §9.D wants locale-appropriate *non-generic* names — but that rule is about not writing "John Doe". It does **not** license inventing a full identity. The honest move is a clearly-labelled neutral placeholder.
3. The plan's own §9 says the persona fiction is "labeled in `data/`" — good instinct — but the **hero headline/subtext are opinionated first-person identity** ("I build the whole stack… Nine years… Currently freelancing from Lisbon"). A user with 3 years of experience cannot reuse that sentence.

**Recommendation:**
- Keep a **single swappable `src/data/profile.js`** (the repo already has `src/data/site.js` with the right shape: `name, role, tagline, location, email, availability, social{...}`, all empty strings — **use that file, do not create a second one**; see §5).
- **De-identify the hero:** headline should be a *capability* claim with no years/location/gender, e.g. `"Frontend that holds up. Backend that keeps up."` or the plan's own line minus the biography. Subtext ≤ 20 words with **no city and no invented tenure** — or make tenure a token (`{YEARS}`).
- **Portrait seed** → `portrait-placeholder` (not `mara-okonjo-portrait`).
- **Handles** → `hey@example.com`, `github.com/your-handle` in `site.js` with a `// TODO: replace` note.
- Keep the *case-study* fiction (Ledgerline etc.) — invented projects are normal and expected in a template, and they are clearly placeholder data. Just do not attach them to a named invented human in the hero.

---

## 5. Tailwind v4 / stack correctness — **THE PLAN IS STALE; THE REPO IS NEWER**

This is the second REJECT-grade finding. The plan's §5 pins versions that **do not match the installed project**, and it proposes files that **already exist and differ**.

### 5.1 Version drift (verified in `package.json`)

| Dep | PLAN §5 says | **Actually installed** | Action |
|---|---|---|---|
| `vite` | `^6.0.0` | **`^8.3.0`** | update plan |
| `@vitejs/plugin-vue` | `^5.2.0` | **`^6.0.8`** | update plan |
| `gsap` | `^3.13.0` | **`^3.15.0`** | update plan |
| `vue` | `^3.5.0` | `^3.5.42` | fine |
| `tailwindcss` | `^4.0.0` | **`^4.3.3`** | update plan |
| `@tailwindcss/vite` | `^4.0.0` | **`^4.3.3`** | update plan |

`vite@8` + `@vitejs/plugin-vue@6` is a **major-version jump** the plan does not know about. Copy-pasting the plan's `package.json` block would **downgrade** the working install. Also: the plan's `vite.config.js` snippet is *already present and correct* in the repo — good, but the plan should not present it as "to be written".

### 5.2 The plan's `src/styles/main.css` path and content conflict with reality
- Plan §2 declares `src/styles/main.css` + `src/styles/tokens.css`. The repo has **`src/style.css`** (imported by `main.js`) and **no** `styles/` dir. Pick one; do not create a parallel CSS tree.
- **Tailwind v4 API check:** the plan's `@theme` block is *mostly* valid. `--color-*`, `--font-*`, `--ease-*` are all real Tailwind v4 namespaces. **But** `--radius-xs`/`--radius-sm`/`--radius-md` are **already built-in defaults** (`theme.css:397-399` = `0.125rem / 0.25rem / 0.375rem`). Redeclaring them in `@theme` **overrides them project-wide** — which is intended here, but it also silently changes Tailwind's own `rounded-xs/sm/md` utilities everywhere. That is fine *if* deliberate; the plan should state it explicitly rather than implying these are new tokens. Also note Tailwind v4's radius namespace is a plain `--radius-*` set, not a nested scale, so `rounded-[--radius-md]` style arbitrary values are wrong — the correct consumption is `rounded-md` (mapped) or `rounded-[12px]`.
- **Arbitrary-value syntax is wrong in the plan.** §1.4 and §5 say `bg-[--color-surface]` and `border-[--color-border]`. In Tailwind v4 the correct arbitrary-token shorthand is `bg-(--color-surface)` **or** just the generated utility `bg-surface` (since `--color-surface` is in `@theme`). `bg-[--color-surface]` is v3-style and is deprecated/incorrect in v4. **This is a concrete, build-breaking API error.** Verify each arbitrary usage and rewrite to theme utilities or `bg-(--var)`.
- The repo currently enables **class-based dark mode** via `@custom-variant dark (&:where(.dark, .dark *))` and a **light `paper/ink` palette**. The plan mandates **dark-only, "no section inverts"** (§4.11 lock). These are mutually exclusive. Either delete the `dark` custom variant (dark-only = no variant needed, every token is the dark value) or the plan's theme lock is a lie. **Decision required before build.**

### 5.3 The plan's GSAP architecture conflicts with the existing composable
- Repo `src/composables/useGsap.js` exports **`useGsap()` returning `{ gsap, ScrollTrigger }`** and a separate **`useReducedMotion()`** with a `ref`. It registers **only ScrollTrigger** and imports GSAP's default export.
- Plan §6.3 specifies `useGsap(setupFn, {scope})` that creates a `gsap.context` and returns `{refresh}`. **Different signature, same name.** The plan also splits reduced-motion into `useReducedMotion.js` (its own file) while the repo bundles it inside `useGsap.js`.
- **Resolution:** the plan must adopt the repo's existing shape or explicitly say it replaces it. Both cannot ship. Given the repo's version is simpler and already wired, I recommend **extending it**: add `Flip` + `SplitText` registration to the existing registration block, and add a separate `useContextGsap(setupFn, {scope})` for context-scoped sections rather than overloading `useGsap`.
- The repo registers plugins **at module load in `useGsap.js`**, not in `motion/gsapSetup.js` (which does not exist). The plan's §2 "key boundary: register exactly once in `src/motion/gsapSetup.js`" contradicts the repo. Either create `gsapSetup.js` and re-point `useGsap.js` to it, or drop the `motion/` layer.

### 5.4 `@theme` + `@font-face` ordering
The plan puts `@font-face` **inside/after** the `@import "tailwindcss"` + `@theme` block in `main.css`. Tailwind v4 `@theme` must come before usage but `@font-face` should be top-level CSS (it currently is in the plan's snippet — acceptable). However the **font files do not exist** (`public/fonts/` is absent). The plan must add a real step: download/subset woff2 into `public/fonts/`, or the whole self-hosted-font plan is fiction and will render system fonts in dev. Add explicit `size-adjust` / `ascent-override` to keep CLS < 0.1.

---

## 6. Scope / effort realism — **OVER-SCOPED; SHIP FEWER FILES**

The plan lists **~25+ files** (2 styles, 4 composables, 1 motion layer, 4 data, 3 layout, 6 sections, 6 primitives, 2 project components = 28). For a portfolio with 6–9 sections this is **file sprawl**, and §6.1 of the plan itself has to hand-argue the section order because the folder structure bloomed faster than the content.

**Reduced file set that still ships the full experience (target ~14 files):**

```
src/
├─ main.js                      # + import './style.css'; registerP plugins
├─ style.css                    # @theme tokens + @font-face + base (MERGE plan's main.css+tokens.css)
├─ App.vue                      # assembles sections, owns ScrollTrigger.refresh() on fonts/images
├─ motion/gsap.js               # SINGLE registration + EASE/DUR/STAGGER presets (merge gsapSetup+presets)
├─ composables/useReveal.js     # merge useGsap + useScrollReveal + useReducedMotion + useSplitHeadline
├─ data/site.js                 # EXTEND the existing site.js (profile, projects, experience, skills all here)
├─ components/
│   ├─ SiteNav.vue
│   ├─ SiteFooter.vue
│   ├─ ui.js                    # or AppButton.vue + TechChip.vue merged as a tiny primitives pair
│   ├─ HeroSection.vue
│   ├─ SkillsSection.vue
│   ├─ ProjectsSection.vue      # vertical case-study list, NOT the pin (see §1)
│   ├─ ExperienceSection.vue
│   ├─ AboutSection.vue
│   └─ ContactSection.vue
```

**Why this is better:**
- One composable, one motion entry point, one data file — matches the repo's existing `useGsap.js` and `site.js`.
- Kills `RevealGroup.vue`, `MediaFrame.vue`, `StatReadout.vue`, `SectionRule.vue`, `ProjectPanel.vue`, `ProjectDetail.vue`, `SkipLink.vue` (inline the skip link in `App.vue`; inline `MediaFrame` as an `<img>` with a shared class; inline `StatReadout` as a `<span class="font-mono tabular-nums">`; drop the `ProjectDetail` overlay entirely if the Flip is cut).
- The repo already proves the leaner shape works (`useGsap.js` + `site.js` + `App.vue`).

**Never build** (scope creep the plan includes as "optional stretch"): `ProjectDetail.vue` Flip overlay. Optionals are how portfolios rot unfinished.

---

## 7. Missing things — **SEVERAL REAL GAPS**

| Gap | Status in plan | Required |
|---|---|---|
| **SEO meta** | Missing | `<meta name="description">`, canonical, `<meta name="theme-color">`, `lang="en"`. `index.html` currently has only `viewport` + `title`. |
| **OG / Twitter cards** | **Missing entirely** | `og:title`, `og:description`, `og:image` (needs a real 1200×630 asset — none planned), `og:type`, `twitter:card`. A portfolio that gets shared on LinkedIn with no card is a wasted portfolio. |
| **Favicon** | Partially there | Repo has `favicon.svg` + `icons.svg`; `index.html` links favicon. But `icons.svg` is unused and no `apple-touch-icon` / `site.webmanifest`. |
| **404 / routing** | N/A (single page) — but | No `robots.txt`, no `sitemap.xml`, no hosting redirect note. Add a 1-line deployment note (static host: Netlify/Vercel/Pages) and a `_redirects`/`vercel.json` only if a router is added. |
| **Contact form** | **Faked by omission** | §8 says "Forms: none on the page (contact is `mailto:`)". That is a legitimate choice, but the plan calls the section "Contact" while offering only `mailto:` + links. **State it plainly:** there is no form; the primary CTA is a `mailto:`. If the user expects a form, a `mailto:` is a disappointing reveal. Recommend adding a real form (Formspree/Netlify Forms) OR renaming the section "Contact" intent in copy so nobody expects a form. The plan's `mailto:` is fine *if the user is told*. |
| **Deployment note** | **Missing** | Add build/deploy section: `npm run build` → `dist/`, static host, base path, font caching headers. Also: `vite@8` may require Node version note. |
| **`prefers-reduced-motion` completeness** | Good but incomplete | The plan's blanket CSS kill (`animation-duration: 0.001ms`) **does not stop GSAP JS tweens** — the plan knows this and adds `gsap.matchMedia` per section. **BUT** the plan never handles: (a) the `SplitText`-split headings under reduced motion (must revert + show static text without the split wrapper), (b) the pinned section under reduced motion on *desktop* (must un-pin, not just skip tween), (c) the marquee (plan says "static (hidden)" — hiding a `aria-hidden` decorative band is fine), (d) `prefers-reduced-transparency` for the one `backdrop-filter` (§0.3 mentions glass only once but never gates it). Add `@media (prefers-reduced-transparency: reduce) { .nav-scrim { backdrop-filter: none; background: var(--color-bg); } }`. |
| **`color-scheme`** | Missing | Set `color-scheme: dark` on `:root` (repo currently has `light dark`). |
| **Error/loading/empty states** | N/A mostly | `SKILL.md` §4.5 wants full cycles, but for a static portfolio only the `mailto:`/image-load edge matters. Low priority. |
| **Image dimensions / LCP** | Good | Plan is solid here (aspect-ratio declared, `fetchpriority="high"` on hero). Just add real font files. |
| **`node_modules` GSAP plugins** | Verified present | `gsap@3.15` ships `SplitText.js` + `Flip.js` in the free package — **confirmed on disk**, so the plan's "GSAP 3.13+ bundled" claim holds for 3.15. Good; no Club membership needed. |

---

## REQUIRED CHANGES (surgical, prioritised by impact)

### P0 — block the build until fixed

1. **§5 (entire Tailwind/deps block): replace the version table with the installed truth.**
   `vite ^8.3.0`, `@vitejs/plugin-vue ^6.0.8`, `gsap ^3.15.0`, `tailwindcss ^4.3.3`, `@tailwindcss/vite ^4.3.3`, `vue ^3.5.42`. The current block would **downgrade** a working repo.
2. **§2 + §5: reconcile with the existing repo or delete the repo files. Decide, don't fork.**
   - Keep `src/style.css` (not `src/styles/main.css` + `tokens.css`). Merge the plan's `@theme` + tokens into `style.css`.
   - Keep & extend `src/composables/useGsap.js` (which already exports `useGsap()` → `{gsap, ScrollTrigger}` and `useReducedMotion()`). The plan's `useGsap(setupFn,{scope})` signature **collides by name** — rename the plan's context version to `useContextGsap(setupFn, {scope})` and register `Flip`/`SplitText` in the existing registration block, or delete `useGsap.js` and say so.
   - Do **not** create `src/motion/gsapSetup.js` as a *second* registration point. Either create it and re-point `useGsap.js` to it, or drop the `motion/` layer.
3. **§1.1 / §4.11 (Theme Lock): pick one.** The repo ships class-based dark mode (`@custom-variant dark`) + a light `paper/ink` palette with **Inter + Instrument Serif**. The plan mandates dark-only + Space Grotesk/IBM Plex. **Delete the `dark` variant and the light palette from `style.css`, OR** abandon the dark-only lock. Shipping both = broken tokens and a font/style flash. Record the decision in the plan.
4. **§3.2 / §3.6 / §3.8 (locale): remove "Lisbon" from hero subtext and the mono rail.** `SKILL.md` §9.F bans atmospheric locale mentions; keep **at most one** location mention, in the footer contact line only. Replace subtext with a location-free ≤20-word line.
5. **§4/§3 (persona): de-identify the hero and swap-by-default the identity.** Extend the existing **`src/data/site.js`** (do not author a new `profile.js`) to hold `name, role, tagline, email, social{...}` with **neutral placeholder values** and a `// TODO: replace with your details` note. Rewrite the hero headline/subtext to carry **no name, gender, city, or invented tenure**; use a `{YEARS}` token or drop it. Change the portrait seed from `mara-okonjo-portrait` to `portrait-placeholder`; change handles to `hey@example.com` / `github.com/your-handle`.

### P1 — high impact on the brief ("simple & clean") and on technical correctness

6. **§3.5 (Projects): CUT the pinned horizontal pan. Replace with a vertical case-study list.**
   Reason: contradicts "simple & clean"; it is the highest-risk GSAP technique; §3.5's distance formula is under-specified (`track.scrollWidth - innerWidth` + `invalidateOnRefresh` missing). A 4-item vertical list with staggered reveals keeps the "loaded with GSAP" feel at 20% of the risk. If the pin is kept anyway, it MUST specify `distance = track.scrollWidth - window.innerWidth`, `invalidateOnRefresh: true`, `end: () => \`+=${distance}\``, and set the document `overflow-x: hidden` on the wrapper. **Remove the Flip "expand into ProjectDetail" stretch target entirely** (§3.5 last motion row, §2 file `ProjectDetail.vue`).
7. **§3.7 + §1.5(6): CUT the Flip shared-element portrait (About → Contact).** Replace with an opacity crossfade of the avatar. MASTER.md's own checklist warns Flips are jank-prone and hard to time; §3.7 already hedges "else it is a silent no-op". Cutting it removes the single most fragile runtime dependency.
8. **§3.1 / §3.5: add fixed-nav offset for pinning and anchors.** Every `[id]` section gets `scroll-margin-top: 68px`; if any pin survives, `start: "top 68px"` (or pin an inner wrapper with `pt-[68px]`) so the rail's top never sits under the nav. Add to §6.6.
9. **§5 CSS: fix the Tailwind v4 arbitrary-value syntax.** Replace every `bg-[--color-surface]` / `border-[--color-border]` with the generated theme utility (`bg-surface`, `border-border`) or the v4 token shorthand `bg-(--color-surface)`. Note that redeclaring `--radius-xs/sm/md` overrides Tailwind's built-ins project-wide — state that intent explicitly. Set `color-scheme: dark` on `:root`.
10. **§2/§5: add a real font step.** `public/fonts/` does not exist. Add: "download/subset woff2 for Space Grotesk / IBM Plex Sans / JetBrains Mono into `public/fonts/`; add `size-adjust`/`ascent-override` to `@font-face`; preload only display + body." Without this, fonts 404 and `ScrollTrigger.refresh()` runs against fallback metrics.

### P2 — polish / honesty / slop

11. **§3.4: CUT the marquee.** The chip list already conveys the stack; `SKILL.md` §4.9 treats marquees as filler for "things that don't need attention". One fewer moving band = closer to "clean". (If kept, it is already within the max-1 rule.)
12. **§3.2: make `$ whoami` static.** Replace the Typewriter (`type: 'chars'`, stagger 0.03) with a static mono eyebrow + a non-blinking cursor. Typewriter is a stock AI-portfolio trope; §9.G-adjacent taste favours restraint.
13. **§3.4: CUT the 3D pointer tilt on bento tiles.** Feedback nobody asked for; adds `pointermove` + `quickTo` complexity. Hover = a 1px border/`surface-2` color shift (≤250ms) is enough.
14. **§3.3/§3.2: reduce clip-path curtains to ONE.** Two identical curtain reveals is a tic.
15. **§7: scope the em-dash grep to `src/**` only.** The plan's own prose contains `—`; a naive repo-wide grep will false-positive on `PLAN.md` and the review file.
16. **Audit `·` separators (§3.4, §3.6, §9).** `SKILL.md` §9.F: max 1 middle-dot per line. Use columns / line breaks otherwise.
17. **§8/§3.7: state the contact reality in the plan.** There is no form; the primary CTA is `mailto:`. Say it in §3.7 ("no form; `mailto:` + links; a form is out of scope unless requested") so the user is not surprised, and add a form as an explicit opt-in item.
18. **Add an SEO/OG section (new §9.5 or extend §8).** `index.html` needs `description`, canonical, `theme-color`, `og:title/description/image/type`, `twitter:card`, and a **real 1200×630 OG image** (add to the asset list; picsum is not acceptable as a permanent OG asset). Add `robots.txt` + `sitemap.xml` and a one-line deployment note (`npm run build` → static host, font cache headers, Node version for `vite@8`).
19. **§6.5: derive reduced-motion branches from ONE owner per effect.** `useScrollReveal` already registers both branches internally; §6.5's "every section registers TWO branches" risks double-registration/double-fire. State: the composable owns `matchMedia`; sections pass config, never register their own.
20. **§6.6/§8: add `prefers-reduced-transparency` handling** for the one `backdrop-filter` scrim (solid-fill fallback), and specify that under reduced motion the `SplitText` headings are **reverted to plain text** (not just non-animated), and any surviving pin is **un-pinned** (not merely non-scrubbed).

### P3 — file count (do it while implementing, not a plan rewrite)

21. **§2: collapse the file tree to ~14 files** per the reduced set in Section 6 above. Drop `RevealGroup.vue`, `MediaFrame.vue`, `StatReadout.vue`, `SectionRule.vue`, `ProjectPanel.vue`, `ProjectDetail.vue`, `SkipLink.vue`, `motion/gsapSetup.js`, `motion/presets.js`, `useScrollReveal.js`, `useSplitHeadline.js`, `useReducedMotion.js`, and `data/{profile,projects,experience,skills}.js` (one `site.js`). Inline the primitives as classes + tiny components in `ui.js` / `App.vue`.

---

## Summary scorecard

| Axis | Grade | Note |
|---|---|---|
| Research depth / taste literacy | **A** | Genuinely reads the skills; cites sections correctly. |
| Fit to "simple & clean" | **D** | 9 sections + pin + Flip + marquee + tilt + typewriter = not simple. |
| Fit to "lots of GSAP, not slop" | **B+** | Strong motivation discipline; several effects are slop-by-another-name. |
| Tailwind v4 / stack correctness | **F** | Version drift (would downgrade), wrong arbitrary syntax, wrong theme names, conflicts with existing CSS/composable. |
| GSAP implementation realism | **C** | Pin distance bug, nav/pin collision, font-refresh gap. |
| Anti-slop compliance | **B+** | Excellent checklist; two live misses (hero locale, `·`). |
| Persona appropriateness | **D** | Invents gender/name/city the user never gave; hard-codes it everywhere. |
| Missing production essentials | **C-** | No SEO/OG, no favicon polish, no deploy note, no real font files, incomplete reduced-motion. |

**Ship the taste. Rewrite the scope, the identity, and the stack block. Cut 40% of the motion.**
