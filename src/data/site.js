/**
 * Site-wide content configuration.
 *
 * SHAPE is stable: consumers (App.vue + section components) rely on these
 * keys existing. VALUES are swappable placeholders.
 *
 * ---------------------------------------------------------------------------
 * TODO: replace with your details
 *   - `name`     : your name (left empty so nothing is asserted for you)
 *   - `location` : your city, shown in ONE place only (the footer contact line)
 *   - `email` / `social.*` / CV : your real handles (currently example.com)
 *   - `about.readouts` : your real numbers (currently neutral tokens)
 *   - `projects[*]` / `experience[*]` : your real work (invented case studies
 *     below are intentional demo content, safe to keep or replace)
 * The human identity is deliberately NEUTRAL. No name, gender, city, or
 * tenure is hard-coded anywhere in the UI.
 * ---------------------------------------------------------------------------
 */

/** Unresolved-token convention: the UI renders "{X}" as a muted "--" and the
 * value stays obviously swappable. Kept as a string so the shape is uniform. */
export const UNRESOLVED = '--'

export const site = {
  // ---- Identity (neutral placeholder) ----
  name: '', // TODO: replace with your details
  role: 'Fullstack Developer',
  tagline: '',
  location: '', // TODO: footer contact line only (single locale mention)
  email: 'hello@example.com',
  availability: '{AVAILABILITY}', // TODO: e.g. "Available for freelance work"

  social: {
    github: 'https://github.com/your-handle',
    linkedin: 'https://linkedin.com/in/your-handle',
    x: '',
    dribbble: '',
  },

  // Primary CTA, used identically in the nav, the hero and the contact
  // section. One label, one intent.
  cta: {
    label: 'Start a conversation',
    href: 'mailto:hello@example.com',
  },

  nav: [
    { label: 'Work', href: '#work' },
    { label: 'Skills', href: '#skills' },
    { label: 'Experience', href: '#experience' },
    { label: 'About', href: '#about' },
    { label: 'Contact', href: '#contact' },
  ],

  sections: {
    hero: {
      eyebrow: '$ whoami',
      heading: 'From the first query to the final frame.',
      // <= 20 words, no city, no invented tenure.
      subheading:
        'Interfaces and the APIs behind them, built to hold up under production load and stay fast as the data grows.',
      // Portrait is a committed local asset. To swap in a real photo, drop
      // your file in `public/images/` and point `src` (and optional `srcset`)
      // at it. `scripts/gen-images.mjs` regenerates the demo artwork.
      portrait: {
        src: '/images/portrait-900.webp',
        srcset: '/images/portrait-900.webp 1x, /images/portrait-180.webp 0.2x',
        alt: 'Portrait',
      },
      secondary: { label: 'See selected work', href: '#work' },
    },

    skills: {
      heading: 'What I work with',
      groups: [
        {
          id: 'frontend',
          title: 'Frontend',
          blurb: 'Interfaces that stay fast as the dataset grows.',
          stack: [
            { name: 'Vue 3', slug: 'vuedotjs' },
            { name: 'TypeScript', slug: 'typescript' },
            { name: 'Tailwind', slug: 'tailwindcss' },
            { name: 'Vite', slug: 'vite' },
            { name: 'GSAP', slug: 'greensock' },
          ],
        },
        {
          id: 'backend',
          title: 'Backend',
          blurb: 'APIs and services that keep their promises.',
          stack: [
            { name: 'Node.js', slug: 'nodedotjs' },
            { name: 'PostgreSQL', slug: 'postgresql' },
            { name: 'Redis', slug: 'redis' },
            { name: 'Fastify', slug: 'fastify' },
            { name: 'GraphQL', slug: 'graphql' },
          ],
        },
        {
          id: 'data-infra',
          title: 'Data & Infra',
          blurb: 'Pipelines, schemas, and the plumbing under both.',
          stack: [
            { name: 'Apache Airflow', slug: 'apacheairflow' },
            { name: 'ClickHouse', slug: 'clickhouse' },
            { name: 'Docker', slug: 'docker' },
            { name: 'Fly.io', slug: 'flydotio' },
            { name: 'GitHub Actions', slug: 'githubactions' },
          ],
        },
        {
          id: 'tooling',
          title: 'Tooling',
          blurb: 'The parts nobody sees, so nothing quietly breaks.',
          stack: [
            { name: 'Vitest', slug: 'vitest' },
            { name: 'Cypress', slug: 'cypress' },
            { name: 'ESLint', slug: 'eslint' },
            { name: 'Turborepo', slug: 'turborepo' },
            { name: 'Storybook', slug: 'storybook' },
          ],
        },
      ],
    },

    // Invented case studies. Intentional demo content: keep or swap.
    // Each carries a one-line outcome. `imageSeed` selects a committed local
    // asset (see the map in `ProjectsSection.vue`); a full path in an optional
    // `image` field overrides it (use this to drop in a real photo).
    projects: [
      {
        id: 'ledgerline',
        title: 'Ledgerline',
        role: 'Lead fullstack engineer',
        stack: ['Vue 3', 'Fastify', 'PostgreSQL', 'Redis Streams', 'ClickHouse'],
        summary: 'Real-time payments reconciliation for a high-volume processor.',
        outcome:
          'Cut end-of-day reconciliation from 40 minutes to 90 seconds across 2.1M daily transactions.',
        imageSeed: 'ledgerline-pipeline',
      },
      {
        id: 'atlas-auth',
        title: 'Atlas Auth',
        role: 'Backend and developer experience',
        stack: ['Node.js', 'OAuth 2.1', 'PostgreSQL', 'TypeScript'],
        summary: 'SSO and session layer for a B2B SaaS platform.',
        outcome:
          'Replaced four bespoke logins with one session layer, halving access-related support tickets.',
        imageSeed: 'atlas-auth-flow',
      },
      {
        id: 'fjord-analytics',
        title: 'Fjord Analytics',
        role: 'Frontend lead',
        stack: ['Vue 3', 'dbt', 'DuckDB', 'Tailwind'],
        summary: 'Self-serve dashboards on top of a warehouse.',
        outcome:
          'Let non-engineers build their own cohorts, so the data team stopped taking one-off requests.',
        imageSeed: 'fjord-dashboard',
      },
      {
        id: 'undertow',
        title: 'Undertow',
        role: 'Solo build',
        stack: ['Vue 3', 'IndexedDB', 'Workbox', 'Cloudflare Workers'],
        summary: 'Offline-first field inspection app for remote sites.',
        outcome:
          'Syncs cleanly through six-hour dead zones and never shows a spinner it cannot honour.',
        imageSeed: 'undertow-field',
      },
    ],

    experience: [
      {
        period: '2022 - Present',
        title: 'Independent engineer',
        org: '',
        body: 'Three long-running client engagements: a payments reconciliation platform, an analytics workspace, and an offline field app. Own the schema, the API, and the interface.',
      },
      {
        period: '2019 - 2022',
        title: 'Senior fullstack engineer',
        org: 'Northwind Freight',
        body: 'Rebuilt the shipment tracking surface and the event pipeline behind it. Cut p95 page load from 4.2s to 1.1s and retired two cron jobs nobody wanted to maintain.',
      },
      {
        period: '2017 - 2019',
        title: 'Backend engineer',
        org: 'Bellweather Health',
        body: 'Built the patient-record sync service and its audit trail. Learned more about idempotency than I expected to.',
      },
      {
        period: '2013 - 2017',
        title: 'BS Computer Science',
        org: 'University of Lagos',
        body: 'Thesis on incremental view maintenance. Mostly databases, which turned out to be a career.',
      },
    ],

    about: {
      heading: 'I like boring infrastructure and interfaces people forget to notice.',
      body: 'I started in data engineering, moved toward the product surface, and never picked a side. Most of my work is glue: event pipelines, Postgres schemas that survive migrations, and Vue frontends that stay fast when the dataset grows. I care about the unglamorous parts, because that is where products quietly succeed or quietly fall over.',
      now: [
        'Writing a Postgres logical-replication series',
        'Maintaining two open-source Vue composables',
        'Learning Rust, slowly, on weekends',
      ],
      portrait: {
        src: '/images/portrait-640.webp',
        srcset: '/images/portrait-640.webp 1x, /images/portrait-900.webp 1.4x',
        alt: 'Portrait',
      },
      // TODO: swap with your real numbers. `{YEARS}` renders as a neutral
      // placeholder so no tenure is invented on your behalf.
      readouts: [
        { value: '{YEARS}', label: 'years shipping' },
        { value: '40+', label: 'production releases' },
        { value: '3', label: 'time zones' },
      ],
    },

    work: {
      heading: 'Selected work',
      intro: 'Four systems, with the outcome each one was built to reach.',
    },

    contact: {
      heading: 'I have room for one more project this quarter.',
      body: 'If you are building something that has to hold up under real load, tell me what it is. I read every message and reply within two working days.',
      secondary: { label: 'Download CV', href: '/cv.pdf' },
      links: [
        {
          label: 'hello@example.com',
          href: 'mailto:hello@example.com',
          icon: 'envelope-simple',
        },
        {
          label: 'github.com/your-handle',
          href: 'https://github.com/your-handle',
          icon: 'github-logo',
        },
        {
          label: 'linkedin.com/in/your-handle',
          href: 'https://linkedin.com/in/your-handle',
          icon: 'linkedin-logo',
        },
      ],
      note: 'No contact form. This goes straight to my inbox.',
    },

    footer: {
      colophon:
        'Built with Vue 3, Tailwind, and GSAP. Typeset in Space Grotesk, IBM Plex Sans, and JetBrains Mono.',
      legal: '(c) 2026',
    },
  },
}

/**
 * Data-side fix for the footer trailing-space nit.
 * `SiteFooter.vue` renders `{{ legal }} {{ name }}`, which leaves a dangling
 * space when `name` is empty. This single pre-composed, trimmed string is
 * safe to render alone. Footer owner: render `{{ copyright }}` only.
 */
site.sections.footer.copyright = [site.sections.footer.legal, site.name]
  .filter((part) => part && String(part).trim())
  .join(' ')
  .trim()

export default site
