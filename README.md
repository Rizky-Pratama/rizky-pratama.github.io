# Muhammad Rizky Pratama Portfolio

Personal developer portfolio built with Vue 3.5, Vite 8, Tailwind CSS v4 and GSAP 3.
Live site: [rizky-pratama.github.io](https://rizky-pratama.github.io/).

## Development

Use Node.js >= 20.19 and npm. Node 22 is used for deployment; CI also checks Node 20.19.

```bash
npm ci
npm run dev
```

The dev server runs at http://localhost:5173. Build with `npm run build` and inspect the output with `npm run preview`.

## Checks

```bash
npm test
npm run lint
npm run format:check
npm run check:placeholders
npm run build
```

Vitest covers content contracts, components, GSAP presets and SEO. Lint has two intentional warnings documented in AGENTS.md.
Playwright remains a development dependency for browser checks; temporary reports and screenshots belong in the ignored `audit/` directory.

## Content and assets

All editable identity, copy, links, navigation, Hero roles, skills, projects and readouts live in `src/data/site.js`. App.vue passes this data to the sections.

- Six sections: Hero, Skills, Work, Experience & Education, About and Contact. Navigation follows their order.
- Images are local WebP files in `public/images/`. Update project image paths, dimensions and alt text together.
- Hero uses the original photo; About uses a generated three-quarter portrait.
- Project screenshots open in a native dialog with zoom, keyboard controls and focus restoration.
- The CV button appears only when `sections.contact.secondary.href` is set. Add a public-ready PDF before enabling it.
- Icons use `AppIcon` and `@iconify/vue/offline`. Run `npm run icons` after changing configured icon names.

The icon command reads installed collections and regenerates the subset registry, favicon, apple-touch icon and license notices without network access. Commit those outputs together. See [icon licenses](docs/icon-licenses.md).

## Design and motion

[PLAN.md](PLAN.md) records the current visual constraints. Tokens live in `src/style.css`: dark navy surfaces, green accent (#22C55E), Space Grotesk headings, IBM Plex Sans body text and JetBrains Mono metadata. Radius tokens are 4/8/12px and override Tailwind defaults.

GSAP registration, media queries and motion helpers live in `src/composables/useGsap.js`. Hero role typing pauses offscreen and in background tabs; reduced motion shows the primary role statically. Experience has timeline bullets and a scroll-drawn spine. About pairs prose and current activities with a portrait and factual readouts. Contact uses a direct email invitation.

## GitHub Pages and SEO

Pushes to `main` run CI and the Pages deployment workflow. Repository Settings > Pages must use GitHub Actions. The workflow checks the project, builds `dist/` and deploys it to the root URL.

Production environment settings in `.github/workflows/deploy-pages.yml`:

```yaml
SITE_URL: https://rizky-pratama.github.io/
SITE_INDEXABLE: 'true'
```

The Vite SEO plugin generates title, description, canonical, social tags, Person JSON-LD, robots.txt and sitemap.xml from shared content and these settings. Unconfigured local builds remain noindex with crawling blocked; canonical/social image URLs and sitemap are omitted without SITE_URL. Indexing enabled without a valid HTTPS URL fails the build.

The active social card is `public/og-banner.png`. [SEO notes](docs/seo-audit.md) include the image-generation provenance and pre-launch audit. Search Console and Bing Webmaster Tools can use [the public sitemap](https://rizky-pratama.github.io/sitemap.xml); allowing indexing does not guarantee inclusion or ranking.

## Repository map

| Path | Purpose |
| --- | --- |
| src/data/site.js | Editable portfolio content |
| src/data/icons.js | Generated offline icon subset |
| src/components/ | Navigation, six sections, image viewer and UI primitives |
| src/composables/useGsap.js | Animation helpers and lifecycle cleanup |
| src/style.css | Theme tokens and shared styles |
| scripts/ | SEO, placeholder guard, icon generator and cached licenses |
| public/ | Portraits, screenshots, social card, site icons and license notice |
| .github/workflows/ | CI and GitHub Pages deployment |
| docs/ | Icon licenses and SEO provenance |

## License

MIT. See [LICENSE](LICENSE); third-party icons retain their own notices.
