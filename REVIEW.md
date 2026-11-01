# REVIEW.md - Craft Audit: `portofoio`

**Reviewer role:** senior craft reviewer (motion + design-slop), audit-and-surgical-fix only.
**Scope:** Vue 3 + Tailwind v4 + GSAP portfolio at repo root. Audited against `review-animations` (SKILL + STANDARDS) and `design-taste-frontend` Section 14, with `PLAN.md` v2 (sections 3.1-3.8, 9) as the contract it must satisfy.
**Build:** `npm run build` passes (verified, both before and after fixes).

**Headline:** the site was **BLOCKED at review start** - the hero did not render. Root cause and fix are in Fixes applied #1. After that fix the page renders coherently. Two BLOCK-level issues remain unfixed (declared at the end) because fixing them requires a design/copy decision, not a surgical edit.

---

## Part A - Animation review

### Findings table

| Before | After | Why |
| --- | --- | --- |
| `HeroSection.vue:36` headline curtain `ease: 'power2.inOut'` on an **entrance** (clip-path reveal) | `ease: EASE.expo` / `EASE.out` | Standards: entering elements use `ease-out`. `power2.inOut` starts slow, delaying the exact moment the user is watching (the headline reveal). **Reported, not fixed** - the plan locks `--ease-in-out` for the curtain (PLAN 3.2); changing it is a direction call, not a bug. |
| `SiteNav.vue:122-126` active-underline transitions `width` | transition `transform: scaleX()` on a fixed-width base element | Standard 7 / Performance: `width` is a layout property that triggers layout+paint on every frame; only `transform`/`opacity` belong on the compositor. **Reported, not fixed** - converting `width` -> `scaleX` changes the indicator's geometry/positioning model, which PLAN 3.1 explicitly locks ("`translateX` + width"). One hairline (1px) at 250ms; measured cost is small. |
| Tailwind v4 `hover:` / `group-hover:` motion utilities emit **ungated** `:hover` rules (`.group-hover\:translate-y-0\.5:is(:where(.group):hover *)`) | gate transform-based hover motion behind `@media (hover: hover) and (pointer: fine)` | Standard 8: touch devices latch false hovers on tap. **Fixed** - see #2 (hero secondary-CTA arrow). Colour-only `hover:` utilities (text/bg/border) remain ungated; low risk, see Verdict §6. |
| `HeroSection.vue:114` arrow `group-hover:translate-y-0.5` (ungated transform) | `data-cta-arrow` + gated rule in `style.css` | Same as above. **Fixed.** |
| `useReveal` sets `opacity: 0` on `[data-reveal]` at mount, then animates in | (no change; correct) | Justified: elements are hidden only *after* mount, so no-JS/SEO renders visible. Good pattern. Kept. |
| Experience spine scrub uses `ease: 'none'` (linear) | (no change; correct) | Linear is correct for scroll-scrub position-mapped motion (STANDARDS easing table). Kept. |
| `ContactSection.vue:106` availability dot `animate-pulse` 2.4s infinite | (no change; correct) | Opacity-only pulse, `motion-safe:` gated, and it signals real state (availability). Justified. Kept. |
| `SiteNav.vue` mobile panel `translateY(-100%)` + staggered links, `--ease-drawer` 250ms | (no change; correct) | GPU-only transform, interruptible CSS transition, correct drawer curve, 40ms stagger inside the 30-80ms band. Kept. |
| `SiteNav.vue:112-120` bar entrance `y: -8, duration 0.4` | (no change; correct) | One-shot load motion, `ease-out`, justified (prevents jarring change). Kept. |
| Reduced-motion branches in `HeroSection`, `ExperienceSection`, `SkillsSection` (`useReveal`), `ProjectsSection`, `AboutSection`, `SiteFooter`, `ContactSection` | (no change) | Honored *and* gentler-not-zero: each sets the final readable state; colour/opacity survive. The `style.css` blanket kill is a labelled safety net, not the branch. Kept. |

### Tiered verdict

1. **Feel-breaking regressions** - none after the render fix. Easing is `expo.out` / `power3.out` / `--ease-out-strong` throughout; no `ease-in` on UI (the only `ease-in*` tokens are `--ease-in-out-strong`, used for on-screen movement, which is correct).
2. **Missed simplifications** - none obvious. Motion count matches the plan's reduced set; no marquee, no pin, no Flip, no tilt, no typewriter.
3. **Performance** - one real finding: the nav indicator animates `width` (`SiteNav.vue:122-126`). Everything else is `transform`/`opacity`. No `window.addEventListener('scroll')`; the scrim is driven by an IntersectionObserver sentinel (`SiteNav.vue:71-84`). No CSS-variable-driven child transforms.
4. **Interruptibility & timing** - correct. CSS transitions (retargetable) for the nav indicator, mobile panel and hovers; no keyframes on dynamic UI. UI state changes are 150-250ms; the only >300ms motions are the reveal/storytelling ones (curtain 800ms, reveals 500-600ms), which are legitimately explanatory/rare.
5. **Origin, physicality & cohesion** - correct. Curtain opens from `inset(0 0 100% 0)` (top), spine draws from `transform-origin: top`, footer rule wipes from `transform-origin: left`, mobile panel slides from the top edge. No `scale(0)` anywhere (tiles start at 0.97 + y + fade per plan). Press = `active:scale-[0.97]`. Cohesion is strong: one easing set shared between CSS tokens and the GSAP `EASE` presets (`useGsap.js:26-31`).
6. **Accessibility** - reduced-motion is complete and correct (per-section final-state branches + blanket CSS net). Hover *motion* is now gated; hover *colour* is not, because Tailwind v4 does not wrap `hover:` in `(hover: hover)` by default (`dist` CSS confirmed: `.hover\:bg-accent-press:hover{...}` at top level). Colour latches on tap are cosmetic only and were left as-is (fixing every one is scope creep, not a surgical fix).

### Decision: **BLOCK** (at review start) -> **APPROVE after Fixes applied #1-#2**

At review start: **Block** - `HeroSection` threw at mount (`Cannot read properties of undefined (reading 'alt')`) and the entire hero (the `<h1>`, the primary CTA) was absent from the DOM. That is a feel-breaking, ship-blocking regression.

After fixes #1 (props registration) and #2 (hover-motion gate) and #3 (dead font-weight classes): **Approve** for motion. No `ease-in` on UI, no `scale(0)`, no keyframes on dynamic UI, no non-GPU animation with an easy fix beyond the one plan-locked `width` indicator, reduced-motion respected and gentler-not-zero, durations within bounds, cohesion intact.

---

## Part B - Design-slop / Pre-Flight audit (Section 14)

| # | Check | Result | Evidence |
| --- | --- | --- | --- |
| 1 | Brief inference + dials declared | **PASS** | `PLAN.md` §1.1 design read, §1.2 dials 5/6/4 with reasoned deviations |
| 2 | Page Theme Lock (one theme) | **PASS** | `style.css` header comment + `color-scheme: dark`; no light tokens, no `dark:` variant, no section inversion |
| 3 | Zero em-dashes on page | **PASS** | `grep -rn "—\|–" src/` = 0; rendered `innerText` em-dash 0, en-dash 0 |
| 4 | Color Consistency Lock (one accent) | **PASS** | only `--color-accent: #22c55e`; rendered accent used identically in nav/hero/skills/contact/footer |
| 5 | Shape Consistency Lock (one radius system) | **PASS** | `rounded-xs/sm/md` (4/8/12) everywhere; exactly one `rounded-full` = the availability pill (`ContactSection.vue:102,106`) |
| 6 | Button contrast (AA) | **PASS** | primary `bg-accent #22c55e` + `text-on-accent #052e16` = 6.9:1; ghost `border-border` + `text-fg` on `bg` |
| 7 | CTA Button Wrap (no 2-line CTA at desktop) | **PASS** | `Start a conversation` / `Download CV` measured single-line in the hero, nav, and contact |
| 8 | Form contrast | **N/A** | no form (plan P2-17: contact is `mailto:` + links) |
| 9 | Serif discipline | **PASS** | no serif; Space Grotesk / IBM Plex Sans / JetBrains Mono only |
| 10 | Premium-consumer palette ban | **N/A** | brief is a developer portfolio, not premium-consumer |
| 11 | Italic descender clearance | **N/A** | no italic display type |
| 12 | Hero fits viewport | **FAIL (soft)** | CTA above fold = true, subtext 2 lines = fine, but headline renders **3 visual lines** at 1440px (`fontSize 60px`, column 705px). Rule: headline max 2 lines at desktop. See unfixed BLOCK-#3. |
| 13 | Hero top padding ≤ pt-24 | **PASS** | `paddingTop: 96px` = `pt-24`, exactly at cap (`HeroSection.vue:74`) |
| 14 | Hero stack discipline (≤4 text elements) | **PASS** | eyebrow + headline + subtext + CTA row (1 primary + 1 secondary). No tagline, no trust strip, no scroll cue |
| 15 | Eyebrow count ≤ ceil(sections/3) | **PASS** | visible eyebrows = 2 (`$ whoami` hero, `$ stack` skills); `data-eyebrow` grep = 1 (hero eyebrow uses `data-hero-eyebrow`, untagged - see note) |
| 16 | Split-Header Ban | **PASS** | no "left headline + right explainer" header; About stacks headline over prose |
| 17 | Zigzag Alternation Cap | **PASS** | Projects rows are always left-text/right-image (no alternation); layout families: split / bento / list / ledger / prose+aside / centered = 5+ |
| 18 | No Duplicate CTA Intent | **PASS** | one contact label "Start a conversation" in nav, hero, contact, mobile menu. Secondary intents differ ("See selected work" portfolio, "Download CV" download) |
| 19 | Logo wall = logo only | **PASS / N/A** | tech chips pair icon + name (a chip is not a logo-wall cell); no fabricated wordmarks |
| 20 | Bento Background Diversity | **PASS** | 4 tiles: tile 2 tinted `surface-2` + code snippet, tile 4 hairline grid pattern; 2 of 4 with real variation |
| 21 | Bento exact cell count | **PASS** | 4 groups -> 4 tiles, spans 5/7/7/5, no empty cell |
| 22 | Copy self-audit | **PASS** | every visible string reads correctly; neutral placeholders documented |
| 23 | Motion motivated | **PASS** | every effect maps to hierarchy / storytelling / feedback / state in PLAN 3.x tables |
| 24 | Marquee max one | **PASS** | zero marquees |
| 25 | Nav on one line, ≤80px | **PASS** | all 5 links share `top: 24px`; mobile/desktop split at `lg`; nav height = **68px** (`SiteNav.vue:139`) |
| 26 | Section-Layout-Repetition | **PASS** | 6 sections, 5 distinct families (map in PLAN §3) |
| 27 | Real images, no fake screenshots | **PASS** | 3 real `<img>` (hero, projects, about) via picsum seeds; no div-screenshots, no hand-rolled decorative SVG illustration |
| 28 | Images have dimensions | **PASS** | hero `width=900 height=1125`, projects `800x600`, about `640x800`, chip logos `14x14` |
| 29 | No pills/labels overlaid on images | **PASS** | none |
| 30 | No photo-credit captions | **PASS** | none |
| 31 | No version footers | **PASS** | `grep "v0\.|v1\.|beta|build 00"` = none |
| 32 | No micro-meta sentences under eyebrows | **PASS** | none |
| 33 | No decoration text strip at hero bottom | **PASS** | none |
| 34 | No floating top-right sub-text | **PASS** | none |
| 35 | No scoring/progress bars | **PASS** | none |
| 36 | No locale / city / time strip | **PASS** | `site.location` empty; single permitted mention slot is the footer contact line only, unused. `grep -i "weather|GMT|UTC|localtime"` = none |
| 37 | No scroll cues | **PASS** | `grep "scroll to|↓ scroll|scroll down"` = none |
| 38 | No version labels in hero | **PASS** | none |
| 39 | No section-numbering eyebrows | **PASS** | none |
| 40 | No decorative dots | **PASS** | only dot = the availability status dot (`ContactSection.vue:106`), which carries real semantic state |
| 41 | No border-t + border-b on every row | **PASS** | Projects uses container `border-y` + `divide-y` (one family, not per-row double borders) |
| 42 | Content density sane (≤25-word sub-paragraphs) | **PASS** | subtext 20 words; all body paragraphs within bounds |
| 43 | Quotes ≤3 lines, clean attribution | **N/A** | no quotes |
| 44 | Motion claimed = motion shown | **PASS** | `MOTION_INTENSITY 6`; reveals, curtain, spine scrub, count-up all present and firing |
| 45 | GSAP sticky-stack/pan canonical | **N/A** | zero pins (plan P1-6 cut) |
| 46 | No `window.addEventListener('scroll')` | **PASS** | none in `src/`; scrim uses IntersectionObserver sentinel |
| 47 | Reduced motion wrapped | **PASS** | per-section matchMedia/final-state branches + `style.css:140` safety net |
| 48 | Dark tokens defined & tested | **PASS** | dark-only by decision; `color-scheme: dark` |
| 49 | Mobile collapse explicit per section | **PASS** | every multi-col layout declares `grid-cols-1 lg:grid-cols-*` |
| 50 | Viewport stability (`min-h-[100dvh]`, never `h-screen`) | **PASS** | `min-h-[100dvh]` hero; `grep h-screen src/` = 0 |
| 51 | Animation cleanup | **PASS** | `ctx.revert()` (`useGsap.js:141`), `split.revert()` contract, `.kill()` (`useGsap.js:196`), `mm.revert()`, listener/observer teardown |
| 52 | Empty/loading/error states | **N/A** | static portfolio, no async surfaces |
| 53 | Cards omitted for spacing | **PASS** | Projects grouped by hairlines, not cards; footer by hairline rule |
| 54 | Icons from one consistent set | **PASS (with caveat)** | inline Phosphor-style paths consistently + Simple Icons for chips. **Caveat: `dbt` and `playwright` CDN slugs 404** - see unfixed BLOCK-#2 |
| 55 | No AI tells | **PASS** | `grep -i "elevate|seamless|unleash|delve|revolutionize|acme|lorem"` = none; no Inter, no AI-purple, no three-equal-cards |
| 56 | Core Web Vitals plausibly hit | **PASS** | hero preloaded + `fetchpriority=high`, aspect-ratios declared, font-display swap, browser fonts preloaded |
| 57 | One design system per project | **PASS** | Tailwind v4 utilities + CSS-first theme only; GSAP only (no Motion library) |
| 58 | Micro-meta / locale / middle-dot / dots / version / pills-on-images extras | **PASS** | 0 middle dots, 0 em-dashes, 0 locale strips, 0 version footers, 0 pills on images |

**Part B subtotal:** 1 FAIL (hero headline 3 lines), 1 PASS-with-caveat (broken chip icons), rest PASS or legitimately N/A.

**Note on #15:** the hero eyebrow is not tagged `data-eyebrow`, so the plan's mechanical grep under-counts (1 instead of 2). Not a violation (2 ≤ 2), but the plan's own greppability contract is only half-honoured. Left as-is (adding the attribute changes nothing visual).

---

## Fixes applied

1. **`src/components/HeroSection.vue:5`** - `const props = {` -> `const props = defineProps({` (and closing `}` -> `})`, line 14).
   **Root cause of the blocked build:** the component declared its props as a plain object literal, so Vue never registered them; the template's `portrait` binding resolved to `undefined`, throwing `TypeError: Cannot read properties of undefined (reading 'alt')` at mount and **removing the entire hero (`<h1>` + primary CTA) from the DOM**. Same defect in two more files (below). Verified fixed: hero now renders, `<h1>` weight 600, CTA above fold.

2. **`src/components/ExperienceSection.vue:5`** - `const props = {` -> `defineProps({` (+ closing line 8).
   Same defect: `heading`/`entries` were unreachable, so the Experience section rendered no entries.

3. **`src/components/SiteNav.vue:5`** - `const props = {` -> `defineProps({` (+ closing line 10).
   Same defect: `props.nav.map(...)` in `observeSections` threw `TypeError: t.nav.map is not a function`; `props.name.trim()` threw `t.name.trim is not a function`, aborting nav/footer render intermittently.

4. **`src/components/HeroSection.vue:87,103,111`; `ExperienceSection.vue:75,106`; `SiteNav.vue:143,171,224`** (8 sites) - `font-500` -> `font-medium`, `font-600` -> `font-semibold`.
   These were **dead classes**: Tailwind v4 emits no CSS for `font-500`/`font-600` (confirmed: `grep -c font-500 dist/assets/*.css` = 0; theme scale is `--font-weight-medium: 500`, `--font-weight-semibold: 600`). Every intended 500/600 weight was silently falling back to 400, flattening the type hierarchy (hero `<h1>` was rendering at 400). Verified fixed: computed `<h1>` weight is now 600.

5. **`src/components/HeroSection.vue:114`** - removed `group-hover:translate-y-0.5`; added `data-cta-arrow`.

6. **`src/style.css:173-182`** - added a fine-pointer-gated hover rule for `[data-cta-arrow]`.
   Tailwind v4 does **not** wrap `hover:`/`group-hover:` in `@media (hover: hover)` by default (confirmed in `dist` CSS: the rule sits at top level), so the arrow's transform hover motion was ungated and would latch on touch. Now gated, matching the gate the `ui.js` primitives already apply to their own hover motion.

Rebuild after all fixes: `npm run build` -> **passes** (`✓ built in 677ms`).

---

## BLOCK-level issues NOT fixed (and why)

**A. (FIXED - listed above for the record.)** The non-rendering hero was the review-start blocker; it needed the `defineProps` fix (#1-#3). It was unambiguously correct and low-risk (mechanical, restores intended behaviour, changes no design direction), so it was applied rather than deferred.

**B. Two broken tech-chip images: `dbt` and `playwright` (`src/data/site.js:104,113`; rendered via `src/components/ui.js:184`, `cdn.simpleicons.org/{slug}/94A3B8`).**
**Not fixed - reason:** both slugs return **HTTP 404** and the chip renders a broken-image glyph in the Skills bento (verified visually).
- `playwright` does not exist in Simple Icons at all (checked the full 3307-icon dataset: no Playwright entry), so there is no valid slug to swap in.
- `dbt` *exists* in the icons package but `cdn.simpleicons.org` refuses to serve it (the raw package file `simple-icons/icons/dbt.svg` is 200 while `cdn.simpleicons.org/dbt` is 404).
Fixing this requires a content/design decision (drop the two chips, replace them with different technologies, or switch the whole chip loader to a different CDN base and re-tint the logos away from the muted `94A3B8`). All of those change either the content inventory or the visual treatment, which the mandate excludes ("do NOT change the design direction, do NOT redesign"). It is a one-line `site.js` edit once the owner decides which of those paths to take.

**C. Hero headline renders 3 lines at desktop (Pre-Flight #12 FAIL).**
`HeroSection.vue:87` is `text-4xl font-semibold leading-[1.05] ... lg:text-6xl` and the headline string (`site.js:49`, "I build the whole stack, from the first query to the last animation frame.") is 14 words / 74 chars in a 705px column, wrapping to 3 visual lines at 1440px (measured `fontSize 60px`, `height 189px`, 63px line-height).
**Not fixed - reason:** the rule says a >2-line hero headline is "always a font-size error, never a copy-length error", but the fix is to either drop `lg:text-6xl` -> `lg:text-5xl` (a design-direction/typography change) or shorten the headline (a copy change). Both are explicitly out of scope for a surgical pass, and both are locked in PLAN §3.2 / §10. Flagged for the owner: lower the desktop scale one step *or* trim the headline to ~8 words. The softener is that the CTA is still above the fold (`ctaBottom 688px < viewport 945px`), so it degrades gracefully rather than hiding the action.

---

## Also reported (below block, not fixed)

- `SiteNav.vue:122-126` - the active-underline indicator animates `width` (layout property). Plan-locked as `translateX + width`; converting to `transform: scaleX()` is the STANDARDS-correct fix but changes the indicator's geometry model. Low cost at 1px/250ms.
- `HeroSection.vue:36` - the headline curtain uses `power2.inOut` on an entrance; `expo`/`out` would feel more responsive. Plan-locked to `--ease-in-out`.
- Colour-only `hover:` utilities are ungated against coarse pointers (Tailwind v4 default). Cosmetic on touch; no motion.
- `SiteFooter.vue:170` renders `(c) 2026 ` with a trailing space because `site.name` is empty. Cosmetic.
- `HeroSection` / `SiteNav` import `DUR`/`STAGGER` without using them (dead imports). Lint-level, no runtime effect; left untouched to avoid noise.

---

# FINAL VERIFICATION

Re-run from scratch on the current tree (the site changed after the first review). No prior report was taken on trust: clean `rm -rf dist`, fresh build, `dist/` served over a plain `node:http` static server on `127.0.0.1:4199`, and a headless Chromium DOM probe (the app is a client-rendered Vue SPA, so a raw `fetch` of `#app` proves nothing).

**Changes since the first review (observed, not assumed):**
- Hero heading rewritten: `"Fullstack development, from the query to the animation frame."` (`site.js:58`).
- Hero H1 scale lowered: `lg:text-6xl` -> `lg:text-5xl` (`HeroSection.vue:87`).
- Broken chip slugs replaced: `dbt` -> `apacheairflow`, `playwright` -> `cypress` (`site.js`).

### Build - `npm run build`

```
> portofoio@0.0.0 build
> vite build

vite v8.3.4 building client environment for production...
transforming...
✓ 30 modules transformed.
dist/index.html                                                      3.03 kB │ gzip:  1.06 kB
... 15 woff2 assets ...
dist/assets/index-C7pXnk7f.css                                      37.62 kB │ gzip:  9.87 kB
dist/assets/index-bk6qlAMw.js                                      245.56 kB │ gzip: 92.34 kB
✓ built in 527ms
```
**EXIT CODE = 0. Zero warnings.** PASS.

### Check matrix

| Check | Result | Raw evidence |
| --- | --- | --- |
| **(1) Build, exit 0, 0 warnings** | **PASS** | `EXIT=0`; output above has no warning/error lines; `✓ 30 modules transformed`, `✓ built in 527ms` |
| **HTTP: page returns 200 and app mounts** | **PASS** | `GET /` -> `200`; 8 assets probed all `200` (`index.js`, `index.css`, `sitemap.xml`, `robots.txt`, `og-image.png`, `apple-touch-icon.png`, `favicon.svg`) |
| **(2a) `<h1>` present and equals `site.js` hero heading** | **PASS** | DOM `<h1>` innerText = `"Fullstack development, from the query to the animation frame."` == `site.js:58 heading` byte-for-byte |
| **(2b) Exactly 4 visible hero text elements** | **PASS** | enumerated hero text-bearing nodes = `P ("$ whoami")`, `H1`, `P (subtext)`, `A ("Start a conversation")`, `A ("See selected work")` -> eyebrow + h1 + subtext + CTA row = **4**. No tagline, no scroll cue (`hasScrollCue:false`) |
| **(2c) `[data-eyebrow]` count <= 2** | **PASS** | `document.querySelectorAll('[data-eyebrow]').length` = **1** (desktop and 375px). Hero eyebrow is tagged `data-hero-eyebrow`, so the raw count is 1; visible eyebrows = 2 (hero + skills), both `<= 2` |
| **(2d) Zero `—` and zero `–` in rendered innerText** | **PASS** | `body.innerText` matches: em-dash `0`, en-dash `0`. Also 0 in built `dist/assets/*.js` and `dist/assets/*.css`. Middle-dot `·` = 0 |
| **(2e) Zero `h-screen` in src; hero uses `min-h-[100dvh]`** | **PASS** | `grep -rn "h-screen" src/` = **0**; `HeroSection.vue:74` = `min-h-[100dvh]`; computed `hero.minHeight = 805px` == viewport height 805px |
| **(2f) Grep bans** | **PASS** | `const props = {` = 0; `font-500` = 0; `font-600` = 0; `transition: all` = 0; `ease-in` outside `ease-in-out-strong` = 0; `scale(0)` = 0; `window.addEventListener('scroll'` = 0; `bg-[--color` = 0 |
| **(2g) All 8 section-founding elements render** | **PASS** | present: `nav` (header nav[aria-label=Primary]), `hero` (#top), `skills` (#skills), `projects` (#work), `experience` (#experience), `about` (#about), `contact` (#contact), `footer` -> **8/8**. 5 `<h2>` for the 5 content sections (hero owns the single `<h1>`) |
| **(2h) Every referenced `cdn.simpleicons.org/{slug}` returns 200** | **PASS** | 20 unique slugs extracted from the rendered DOM; `curl -o /dev/null -w %{http_code}` = **200 for all 20** (`vuedotjs typescript tailwindcss vite greensock nodedotjs postgresql redis fastify graphql apacheairflow clickhouse docker flydotio githubactions vitest cypress eslint turborepo storybook`). The two prior 404s (`dbt`, `playwright`) are gone |
| **(3) `dist/index.html` has no `/node_modules/` ref; CSS has `@font-face`** | **PASS** | `grep -c node_modules dist/index.html` = **0**; both font preloads rewritten to hashed `/assets/*.woff2`; `@font-face` occurrences in `dist/assets/*.css` = **15** |

**Additional adversarial probes (not requested, all clean):**
- Page errors / console errors on fresh load: **0** (`pageerror` + `console:error` listeners, `networkidle0`).
- No horizontal scroll at 375px: `scrollWidth 360 == clientWidth 360`, `hScroll:false`; `h1` present; mobile menu button (`[aria-controls='mobile-menu']`) present.
- Nav renders on one line; height 68px.

### Remaining blocker

**B1. Hero headline still renders 3 visual lines at the `lg` desktop breakpoint (Pre-Flight "headline max 2 lines" FAIL).**
Evidence: at viewport 1424px the `<h1>` is `lg:text-5xl` = `48px`, box height `151px` / line-height `50.4px` = **3 lines**; screenshot shows the orphan third line `frame.`. The two accepted fix paths both change the design direction - dropping one more scale step (`lg:text-4xl`) is a typography change, and shortening the string again is a copy change; neither is "surgical and unambiguous". Per the instruction, reported as a blocker rather than auto-fixed.
Mitigation: the primary CTA is still well above the fold (`ctaBottom 618px` vs viewport `805px`), the font scale was already lowered one step and the copy shortened since the first review, so the defect degrades gracefully rather than hiding the action.

**No other blocker remains.** The two BLOCK-level issues from the first review are both resolved: the non-rendering hero (props registration) and the two 404 chip icons (`apacheairflow` / `cypress`).
