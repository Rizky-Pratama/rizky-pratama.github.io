# Portfolio design contract

This file is authoritative for visual work. It records the current personalized portfolio, replacing the historical template plan and review documents. Explicit user requests take precedence; keep this contract aligned with approved changes.

## Product and architecture

- Muhammad Rizky Pratama, Full Stack Developer. All content comes from src/data/site.js.
- Vue 3.5 with script setup and plain-object props, Vite 8, Tailwind CSS v4 and GSAP 3.
- One page: Hero, Skills, Work, Experience & Education, About, Contact; fixed navigation and a metadata footer. Navbar follows section order.
- Anchor navigation, no client router, no contact form. Primary CTA: Email me, using mailto.
- Local assets and offline Iconify only; no runtime fonts, images or icons fetched from CDNs.

## Visual system

- Dark-only. Pin color-scheme: dark; no theme toggle or light section inversion.
- One saturated accent: #22C55E. No glow, gradients or second accent.
- Dials: DESIGN_VARIANCE 5 / MOTION_INTENSITY 6 / VISUAL_DENSITY 4.
- Palette, four easing curves, duration and z-index tokens live in src/style.css.
- Background #0F172A, surface #151E33, secondary surface #1E293B, border #243049, foreground #F1F5F9, muted foreground #94A3B8, on-accent #052E16.
- Space Grotesk display, IBM Plex Sans body, JetBrains Mono metadata; self-hosted variable fonts.
- Radius xs/sm/md = 4/8/12px, overriding Tailwind defaults. Avoid decorative pills and card containers.
- Theme utilities preferred; arbitrary CSS variables use Tailwind v4 shorthand, never v3 syntax.
- Preserve editorial spacing, hairline grouping and readable line lengths. No horizontal overflow at 375px.

## Section layouts

- Hero: two-column desktop composition, original portrait with a green vertical rule, stable headline, concise introduction and primary/secondary anchors. Mobile stacks text above portrait.
- Hero identity: fixed name and rotating roles, with reserved space, a static accessible identity and no live announcements. User-approved typewriter replaces the original static identity rule.
- Skills: grouped technology chips; group sizes may vary. UI icons use Phosphor, technology icons are monochrome collection logos. Missing configured icons fail generation/contracts.
- Work: vertical case studies with natural-ratio screenshots and descriptive alt text. Public source links are optional. Native-dialog viewer shows images only; no project-detail overlay or screenshot parallax.
- Experience: vertical ledger, mono dates and role details, one bullet per entry, smaller bullets for client engagements, a single timeline spine. No alternating sides.
- About: desktop portrait top-aligned with heading. Prose and Now list occupy the left column; photo and readouts occupy the right. Mobile order: heading, prose, Now, portrait, readouts. Use only user-confirmed statistics.
- Contact: the page's centered invitation, heading and short copy, Email me CTA, optional CV and external links. No availability badge or pulsing status dot.
- Footer: identity, anchors, external links, colophon and copyright. Location appears only here.

## Motion and accessibility

- GSAP and ScrollTrigger register only in src/composables/useGsap.js. Components pass config; composables own media queries and cleanup. Register only plugins actually used.
- One Hero headline clip-path curtain; restrained section reveals, portrait fades/hover, timeline draw, numeric readout counters and Hero role typing.
- No pins, Flip transitions, marquees, 3D tilt or scroll hijacking. Prefer transform/opacity; the headline curtain is the clip-path exception.
- Role typing pauses offscreen and when the document is hidden. Under reduced motion it stays on the primary role. Restore readable static states and dispose timelines/listeners on unmount.
- Portrait hover scale 1.02 over 200ms, fine pointers only, disabled with reduced motion.
- Touch targets at least 44px; visible focus ring; skip link; fixed-nav anchor offset of 72px.
- One H1, meaningful heading order, descriptive image alt text. Viewer supports keyboard, Escape, zoom/fit, scroll unlock, load-error recovery and focus restoration.
- Reduced motion removes nonessential movement; reduced transparency disables the navbar blur.

## Publishing

GitHub Pages builds through Actions from main. Production URL is https://rizky-pratama.github.io/ with SITE_INDEXABLE=true. Local unconfigured builds remain nonindexable. SEO tags, robots and sitemap are generated from site data by scripts/seo.mjs. The social image is public/og-banner.png.

Run tests, lint, format check, placeholder guard and build before publishing. Preserve the two documented intentional lint warnings. Keep claims factual, links explicit and copy free of fabricated credentials, demo placeholders and em/en dashes.
