# Pre-launch SEO audit

Date: 2026-11-01
Site: Muhammad Rizky Pratama portfolio
Environment: local preview; no public domain configured.

## Findings and changes

| Priority | Evidence before changes | Resolution |
| --- | --- | --- |
| Launch requirement | noindex, nofollow; robots disallowed crawling; no canonical or sitemap | Intentional preview defaults retained. SITE_URL supplies the final HTTPS URL; SITE_INDEXABLE=true explicitly enables indexing and matching robots output. |
| High | OG banner existed but og:image and twitter:image were absent | New generated 1200 x 630 PNG at /og-banner.png. Build emits absolute image URLs, dimensions, alternative text and summary_large_image when SITE_URL is set. |
| Medium | Rendered DOM contained no JSON-LD | Person JSON-LD is included in initial HTML with confirmed name, role and social profiles. No unsupported credentials or personal location added. |
| Medium | Four informative project screenshots had empty alternative text and identical 800 x 600 dimensions | Screenshot paths, accurate dimensions, descriptions and viewer labels are configured in site.js. Natural aspect ratios preserve the complete screenshots. |
| Medium | Title and social descriptions duplicated across handwritten tags | A build-time Vite plugin reads shared portfolio SEO data and emits tags once. |
| Follow-up | Initial HTML contains an empty Vue app mount; content is client-rendered | Retain current Vue/Vite stack. Consider static prerendering if crawl diagnostics show rendering issues after launch. |
| Pass | English document language, one rendered H1, semantic sections, local assets | Preserved and checked in local browser validation. |

## Build settings

- Unset SITE_URL and SITE_INDEXABLE: noindex, blocked crawling, no canonical, no absolute social image URLs, no sitemap.
- SITE_URL=https://your-real-host/ with SITE_INDEXABLE unset: shareable metadata and sitemap exist, but crawling/indexing remain disabled.
- SITE_URL plus SITE_INDEXABLE=true: canonical, OG/Twitter image URLs, one-page sitemap, index/follow and robots Allow are emitted together.
- Invalid URL or indexing enabled without a URL fails the build.
- SITE_URL may include a path prefix only when Vite base and hosting are also configured to serve the app there.
- robots.txt is generated into build output; there is no static public robots file to drift out of sync.

Do not use the local preview hostname as the production canonical. Configuring these settings does not deploy the site.
Public HTTP status, TLS, redirects, Search Console coverage, social scraper behavior and field Core Web Vitals cannot be verified without a public deployment. Local tests do not establish ranking or field performance.

## Guidance

- [Google JavaScript SEO basics](https://developers.google.com/search/docs/crawling-indexing/javascript/javascript-seo-basics)
- [Open Graph protocol](https://ogp.me/)

## Asset generation

Tool: built-in Imagegen. Original Hero photograph preserved.
Final About asset: public/images/about-three-quarter.webp (800 x 1000).
Final OG asset: public/og-banner.png (1200 x 630).
Generated sources remain in the Codex generated_images folder; project files are self-contained.

### About prompt

Edit the referenced portrait into a photorealistic professional developer portrait of EXACTLY the same person. Preserve recognizable facial identity, facial proportions, hairstyle, age, skin tone, dark green overshirt and white t-shirt. Change pose only: torso turned three-quarter slightly toward viewer's left, face turned gently back toward camera, natural calm expression. Waist-up vertical 4:5 composition with comfortable headroom, hands out of frame. Plain light neutral gray background, soft natural studio lighting, realistic skin texture. No text, logos, accessories, props, added jewelry, beautification or stylization. This is the About portrait for a restrained dark portfolio.

### OG prompt

Create a polished horizontal Open Graph social sharing banner, exact landscape aspect 1200:630. Use referenced portrait of the same person for right-side portrait, retaining identity, clothing, realistic photographic detail. Dark navy flat background #0F172A, off-white #F1F5F9 typography, muted #94A3B8 supporting text, ONLY green #22C55E accent as a short horizontal rule. No glow, no gradients, no decorative grids, no added logos. Premium restrained developer portfolio, left aligned typographic hierarchy on left ~65%, portrait cropped waist/chest up on right ~30% against a solid navy panel. Generous 64px safe margins; text must not overlap portrait. Exact text, spelled precisely: 'Muhammad Rizky Pratama' (medium name, can use two lines); 'Full Stack Developer' (large primary line, can wrap in two lines); 'Web applications, from interface to database.' (smaller subtitle in two lines); 'Laravel / Vue / MySQL' (small mono footer). Geometric sans-serif comparable to Space Grotesk, mono comparable to JetBrains Mono. All text readable at small social-card preview size. No additional text.


## Validation completed

- 51 Vitest tests passed, including preview/indexable metadata consistency and invalid URL rejection.
- Production preview and an isolated indexable sample build completed. Inspected both generated HTML documents, parsed JSON-LD, checked tag uniqueness, robots rules, and sitemap output.
- Browser checks passed at 375, 740, 1024, and 1440 pixels: all four thumbnails retain natural proportions; every project opens; zoom/fit, image scrolling, Tab/Shift+Tab, Escape, backdrop dismissal, Close, scroll unlock, and focus return work.
- Tested failed image loading and the original-image recovery link.
- Verified portrait hover scale and reduced-motion disablement. No runtime errors or page-wide horizontal overflow were found.
- Lint exits zero with the two documented warnings; formatting and placeholder checks pass.
- Generated portrait and OG banner visually inspected. The original Hero asset is unchanged.
