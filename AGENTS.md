# AGENTS.md

Portable guidance for automated assistants working in this repository.

## Project

Personal portfolio for Muhammad Rizky Pratama, built with Vue 3.5, Vite 8, Tailwind CSS v4 and GSAP 3. Six sections on one page, anchor navigation, no router and no contact form. Published to https://rizky-pratama.github.io/ through GitHub Actions.

## Commands

Use Node.js >=20.19 and npm with the committed package-lock.json. Node 22 is used for deployment; CI also checks 20.19. jsdom 27 preserves that compatibility.

```bash
npm ci
npm run dev
npm test
npm run lint
npm run format:check
npm run check:placeholders
npm run build
npm run preview
```

Tests, lint, formatting, placeholder guard and build must pass. The placeholder guard scans index.html, src source files and LICENSE; it does not certify deployment/indexing readiness.

`npm run icons` regenerates the offline icon registry, site icons and license notices from installed collections and cached license texts. Commit generated outputs. Playwright is available for browser QA; keep scratch captures in ignored audit/. Do not depend on an uncommitted audit harness.

## Conventions

- Read PLAN.md before visual work; it is the authoritative current design contract. User instructions take precedence.
- Vue script setup, plain-object props, no TypeScript. Shared primitives live in src/components/ui.js.
- All editable content belongs in src/data/site.js; App.vue passes it as props.
- Tailwind v4 CSS-first via @tailwindcss/vite. Use theme utilities; arbitrary CSS variables use bg-(--color-surface), never bg-[--color-surface]. No Tailwind/PostCSS config files needed.
- Prettier: single quotes, no semicolons, 2 spaces, trailing commas, printWidth 90, LF.
- GSAP registration and matchMedia ownership belong only in src/composables/useGsap.js. Dispose animations, observers and listeners on unmount; respect reduced motion.
- Dark-only, one green accent #22C55E, no gradients or glow. Dials: variance 5, motion 6, density 4.
- Local images, fonts and offline icons only. AppIcon uses @iconify/vue/offline with src/data/icons.js. Keep icon attribution and license notices.
- Preserve the existing uncommitted user work. Do not deploy or push unless authorized in the current task context.

## Key files

| Path | Purpose |
| --- | --- |
| src/data/site.js | Identity, copy, links, navigation and asset configuration |
| src/components/ | Sections, navigation/footer, image viewer and UI primitives |
| src/composables/useGsap.js | GSAP, ScrollTrigger, presets, lifecycle and motion helpers |
| src/style.css | Theme tokens and shared styles |
| scripts/ | Icon generation, cached licenses, SEO and placeholder guard |
| .github/workflows/ | CI and Pages deployment |
| public/ | Local images, social card, icons and license notice |
| PLAN.md | Current design contract |
| README.md | Development, content and deployment instructions |

## Intentional lint warnings

Lint exits 0 with exactly two warnings. Do not fix these as incidental cleanup:

- ContactSection.vue: vue/no-dupe-keys, the local links list shares the prop name.
- useGsap.js: no-useless-assignment, the deliberate register-once guard.

CLAUDE.md points to this shared guidance rather than maintaining a second copy.
